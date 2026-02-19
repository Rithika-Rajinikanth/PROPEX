// src/routes/admin.rs

use axum::Router;
use std::sync::Arc;

use crate::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
    // Admin routes to be implemented
}