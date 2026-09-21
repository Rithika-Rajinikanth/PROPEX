// src/routes/health.rs

use axum::{extract::State, Json};
use fred::prelude::*;
use serde::Serialize;
use std::sync::Arc;
use tokio::time::{timeout, Duration, Instant};

use crate::{error::AppError, models::HealthCheck, AppState};

#[derive(Serialize)]
pub struct DeepHealthDependency {
    pub status: String,
    pub latency_ms: u128,
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct DeepHealthResponse {
    pub status: String,
    pub database: DeepHealthDependency,
    pub redis: DeepHealthDependency,
}

#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "Health check", body = HealthCheck)
    )
)]
pub async fn health_check(
    State(state): State<Arc<AppState>>,
) -> Result<Json<HealthCheck>, AppError> {
    // Keep health endpoint fast for platform probes.
    // If dependencies are slow/unreachable, mark them disconnected instead of timing out this route.
    let db_status = match timeout(
        Duration::from_millis(500),
        sqlx::query("SELECT 1").fetch_one(state.db.pool()),
    )
    .await
    {
        Ok(Ok(_)) => "connected",
        _ => "disconnected",
    };

    let redis_status = match timeout(Duration::from_millis(3000), state.redis.ping::<String>()).await {
        Ok(Ok(_)) => "connected",
        Ok(Err(e)) => {
            tracing::warn!("Redis ping error: {}", e);
            "disconnected"
        },
        Err(_) => {
            tracing::warn!("Redis ping timeout after 3000ms");
            "disconnected"
        },
    };

    Ok(Json(HealthCheck {
        status: "ok".to_string(),
        database: db_status.to_string(),
        redis: Some(redis_status.to_string()),
    }))
}

pub async fn deep_health_check(
    State(state): State<Arc<AppState>>,
) -> Result<Json<DeepHealthResponse>, AppError> {
    let db_start = Instant::now();
    let db_result = timeout(
        Duration::from_secs(2),
        sqlx::query("SELECT 1").fetch_one(state.db.pool()),
    )
    .await;
    let db_latency = db_start.elapsed().as_millis();
    let database = match db_result {
        Ok(Ok(_)) => DeepHealthDependency {
            status: "connected".to_string(),
            latency_ms: db_latency,
            error: None,
        },
        Ok(Err(err)) => DeepHealthDependency {
            status: "disconnected".to_string(),
            latency_ms: db_latency,
            error: Some(err.to_string()),
        },
        Err(err) => DeepHealthDependency {
            status: "disconnected".to_string(),
            latency_ms: db_latency,
            error: Some(format!("timeout: {}", err)),
        },
    };

    let redis_start = Instant::now();
    let redis_result = timeout(Duration::from_secs(2), state.redis.ping::<String>()).await;
    let redis_latency = redis_start.elapsed().as_millis();
    let redis = match redis_result {
        Ok(Ok(_)) => DeepHealthDependency {
            status: "connected".to_string(),
            latency_ms: redis_latency,
            error: None,
        },
        Ok(Err(err)) => DeepHealthDependency {
            status: "disconnected".to_string(),
            latency_ms: redis_latency,
            error: Some(err.to_string()),
        },
        Err(err) => DeepHealthDependency {
            status: "disconnected".to_string(),
            latency_ms: redis_latency,
            error: Some(format!("timeout: {}", err)),
        },
    };

    let status = if database.status == "connected" && redis.status == "connected" {
        "ok"
    } else if database.status == "connected" {
        "degraded"
    } else {
        "unhealthy"
    };

    Ok(Json(DeepHealthResponse {
        status: status.to_string(),
        database,
        redis,
    }))
}