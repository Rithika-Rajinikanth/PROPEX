// src/main.rs

use axum::{routing::get, Router};
use std::sync::Arc;
use tower_http::{
    catch_panic::CatchPanicLayer,
    cors::CorsLayer,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod error;
mod middleware;
mod models;
mod redis_client;
mod routes;
mod services;
mod utils;

use config::Config;
use db::Database;
use fred::prelude::RedisPool;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // ── CRITICAL: install ring as the rustls crypto provider ──────────────
    // This MUST be the very first thing in main(), before ANY TLS connection
    // is attempted (Redis, DB, HTTP client, etc.).
    //
    // Why this panics without it:
    //   fred uses rustls with the ring backend (enable-rustls-ring feature).
    //   rustls 0.23+ requires a CryptoProvider to be explicitly installed
    //   at process startup when the binary has multiple crates that could
    //   each try to register their own provider.
    //   Without this call, rustls cannot determine which provider to use
    //   and panics with exit code 101:
    //   "Could not automatically determine the process-level CryptoProvider"
    //
    // ring::default_provider() returns the ring-based provider.
    // install_default() registers it process-wide — all rustls connections
    // (fred/Redis TLS) will use ring from this point forward.
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install ring as the default rustls CryptoProvider. \
                 This means another provider was already installed, which should \
                 not happen — check for duplicate rustls initialization.");

    // ── Logging ────────────────────────────────────────────────────────────
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| {
                    "real_estate_api=debug,tower_http=debug,axum=trace".into()
                }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    dotenv::dotenv().ok();

    // ── Connections ────────────────────────────────────────────────────────
    let config = Config::from_env()?;
    let db = Database::new(&config.database_url).await?;
    let redis = redis_client::create_redis_pool(&config.redis_url).await?;

    let state = Arc::new(AppState {
        db,
        redis,
        config: config.clone(),
    });

    let app = create_router(state);

    // Read HOST and PORT from env vars.
    // Azure Container Apps: set HOST=0.0.0.0 in environment variables.
    // Local .env: HOST=127.0.0.1
    let host = std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let bind_addr = format!("{}:{}", host, port);

    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;

    tracing::info!("🚀 Server running on http://{}", bind_addr);
    tracing::info!("📚 Swagger UI: http://{}/swagger-ui", bind_addr);
    tracing::info!("📄 OpenAPI JSON: http://{}/api-docs/openapi.json", bind_addr);

    axum::serve(listener, app).await?;
    Ok(())
}

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub redis: RedisPool,
    pub config: Config,
}

fn create_router(state: Arc<AppState>) -> Router {
    let openapi = routes::openapi::create_openapi_spec();

    let swagger_routes = utoipa_swagger_ui::SwaggerUi::new("/swagger-ui")
        .url("/api-docs/openapi.json", openapi);

    let user_routes = routes::user::routes()
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            middleware::auth::auth_middleware,
        ));

    let api_v1 = Router::new()
        .nest("/exchange", routes::exchange::routes())
        .nest("/regions", routes::regions::routes())
        .nest("/analytics", routes::analytics::routes())
        .nest("/search", routes::search::routes())
        .nest("/ai", routes::ai::routes())
        .nest("/auth", routes::auth::routes())
        .nest("/user", user_routes)
        .with_state(state.clone());

    let auth_routes = Router::new()
        .nest("/auth", routes::auth::routes())
        .with_state(state.clone());

    Router::new()
        .route("/", get(|| async { "Real Estate API running 🚀" }))
        .route("/health", get(routes::health::health_check))
        .route("/health/deep", get(routes::health::deep_health_check))
        .merge(swagger_routes)
        .nest("/api/v1", api_v1)
        .merge(auth_routes)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .layer(CatchPanicLayer::new())
        .with_state(state)
}