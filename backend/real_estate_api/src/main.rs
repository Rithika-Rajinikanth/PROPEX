// src/main.rs - PRODUCTION-GRADE VERSION WITH ALL FIXES

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
mod routes;
mod services;
mod utils;

use config::Config;
use db::Database;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
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

    let config = Config::from_env()?;
    let db = Database::new(&config.database_url).await?;

    let redis_client = redis::Client::open(config.redis_url.clone())?;
    let redis_conn = redis_client.get_multiplexed_async_connection().await?;

    let state = Arc::new(AppState {
        db,
        redis: redis_conn,
        config: config.clone(),
    });

    let app = create_router(state);

    let addr = format!("{}:{}", config.host, config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!("🚀 Server running on http://{}", addr);
    tracing::info!("📚 Swagger UI: http://{}/swagger-ui", addr);
    tracing::info!("📄 OpenAPI JSON: http://{}/api-docs/openapi.json", addr);

    axum::serve(listener, app).await?;
    Ok(())
}

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub redis: redis::aio::MultiplexedConnection,
    pub config: Config,
}

fn create_router(state: Arc<AppState>) -> Router {
    let openapi = routes::openapi::create_openapi_spec();

    // Swagger UI and OpenAPI routes
    let swagger_routes = utoipa_swagger_ui::SwaggerUi::new("/swagger-ui")
        .url("/api-docs/openapi.json", openapi);

    // User routes with auth middleware
    let user_routes = routes::user::routes()
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            middleware::auth::auth_middleware,
        ));

    // API routes with proper nesting
    let api_v1 = Router::new()
        .nest("/regions", routes::regions::routes())
        .nest("/analytics", routes::analytics::routes())
        .nest("/search", routes::search::routes())
        .nest("/ai", routes::ai::routes())
        .nest("/user", user_routes)
        .with_state(state.clone());

    // Auth routes (no /api/v1 prefix)
    let auth_routes = Router::new()
        .nest("/auth", routes::auth::routes())
        .with_state(state.clone());

    // Combine all routes
    Router::new()
        .route("/", get(|| async { "Real Estate API running 🚀" }))
        .route("/health", get(routes::health::health_check))
        .merge(swagger_routes)
        .nest("/api/v1", api_v1)
        .merge(auth_routes)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .layer(CatchPanicLayer::new())
        .with_state(state)
}