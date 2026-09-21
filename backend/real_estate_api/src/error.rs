// src/error.rs

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Not found")]
    NotFound,

    #[error("Internal server error: {0}")]
    Internal(String),

    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),

    #[error(transparent)]
    Validation(#[from] validator::ValidationErrors),

    // FIXED: was redis::RedisError — redis crate removed, using fred now
    #[error(transparent)]
    Redis(#[from] fred::error::RedisError),

    #[error(transparent)]
    Anyhow(#[from] anyhow::Error),

    #[error(transparent)]
    SerializationError(#[from] serde_json::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!("AppError occurred: {:?}", self);

        let (status, msg) = match &self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Validation(errs) => (StatusCode::BAD_REQUEST, errs.to_string()),
            AppError::SerializationError(err) => (StatusCode::BAD_REQUEST, err.to_string()),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::NotFound => (StatusCode::NOT_FOUND, "Not found".into()),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".into(),
            ),
        };

        (status, msg).into_response()
    }
}