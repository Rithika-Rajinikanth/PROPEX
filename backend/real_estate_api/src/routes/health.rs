// src/routes/health.rs

use axum::{extract::State, Json};
use redis::AsyncCommands;
use std::sync::Arc;

use crate::{error::AppError, models::HealthCheck, AppState};

#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "Health check", body = HealthCheck)
    )
)]
pub async fn health_check(State(state): State<Arc<AppState>>) -> Result<Json<HealthCheck>, AppError> {
    // Test database connection
    let db_status = match sqlx::query("SELECT 1").fetch_one(state.db.pool()).await {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    // Test Redis connection
    let mut redis_conn = state.redis.clone();
    let redis_status = match redis_conn.ping::<String>().await {
        Ok(response) => Some(response),
        Err(_) => Some("ERROR".to_string()),
    };

    Ok(Json(HealthCheck {
        status: "ok".to_string(),
        database: db_status.to_string(),
        redis: redis_status,
    }))
}