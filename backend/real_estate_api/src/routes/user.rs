// src/routes/user.rs

use axum::{extract::State, routing::get, Json, Router};
use std::sync::Arc;

use crate::{
    error::AppError,
    models::{Claims, SavePropertyRequest, SavedProperty, SearchHistory, UserProfile},
    AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/profile", get(get_profile))
        .route("/saved-properties", get(get_saved_properties))
        .route("/saved-properties", axum::routing::post(save_property))
        .route("/search-history", get(get_search_history))
}

#[utoipa::path(
    get,
    path = "/api/v1/user/profile",
    responses(
        (status = 200, description = "User profile", body = UserProfile),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_profile(claims: Claims) -> Result<Json<UserProfile>, AppError> {
    Ok(Json(UserProfile {
        id: claims.sub,
        email: claims.email,
        name: String::new(),
        preferences: None,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/user/saved-properties",
    responses(
        (status = 200, description = "Saved properties", body = Vec<SavedProperty>),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_saved_properties(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<Json<Vec<SavedProperty>>, AppError> {
    let properties = sqlx::query_as::<_, SavedProperty>(
        "SELECT id, user_id, region_id, notes, created_at FROM saved_properties WHERE user_id = $1",
    )
    .bind(claims.sub)
    .fetch_all(state.db.pool())
    .await?;

    Ok(Json(properties))
}

#[utoipa::path(
    post,
    path = "/api/v1/user/saved-properties",
    request_body = SavePropertyRequest,
    responses(
        (status = 200, description = "Property saved", body = SavedProperty),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn save_property(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Json(req): Json<SavePropertyRequest>,
) -> Result<Json<SavedProperty>, AppError> {
    let property = sqlx::query_as::<_, SavedProperty>(
        "INSERT INTO saved_properties (user_id, region_id, notes, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING id, user_id, region_id, notes, created_at",
    )
    .bind(claims.sub)
    .bind(req.region_id)
    .bind(req.notes)
    .fetch_one(state.db.pool())
    .await?;

    Ok(Json(property))
}

#[utoipa::path(
    get,
    path = "/api/v1/user/search-history",
    responses(
        (status = 200, description = "Search history", body = Vec<SearchHistory>),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_search_history(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<Json<Vec<SearchHistory>>, AppError> {
    let history = sqlx::query_as::<_, SearchHistory>(
        "SELECT id, user_id, query, filters, results_count, searched_at 
         FROM search_history 
         WHERE user_id = $1 
         ORDER BY searched_at DESC 
         LIMIT 50",
    )
    .bind(claims.sub)
    .fetch_all(state.db.pool())
    .await?;

    Ok(Json(history))
}
