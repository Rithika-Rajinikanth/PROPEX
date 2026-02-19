use axum::{extract::State, routing::post, Json, Router};
use std::sync::Arc;

use crate::{
    error::AppError,
    models::{
        ChatRequest, ChatResponse, PricePredictionRequest, PricePredictionResponse,
        RecommendationRequest, RecommendationResponse,
    },
    services::{ai::AiService, recommendation::RecommendationService},
    AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/chat", post(chat))
        .route("/recommend", post(get_recommendations))
        .route("/price-predict", post(predict_price))
}

#[utoipa::path(
    post,
    path = "/api/v1/ai/chat",
    request_body = ChatRequest,
    responses(
        (status = 200, description = "Chat response", body = ChatResponse)
    )
)]
pub async fn chat(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, AppError> {
    let ai_service = AiService::new();
    
    // anyhow::Error automatically converts to AppError via From trait
    let response = ai_service
        .process_chat(&1, &req.message, req.context)
        .await?;

    Ok(Json(response))
}

#[utoipa::path(
    post,
    path = "/api/v1/ai/recommend",
    request_body = RecommendationRequest,
    responses(
        (status = 200, description = "Recommendations", body = RecommendationResponse)
    )
)]
pub async fn get_recommendations(
    State(state): State<Arc<AppState>>,
    Json(req): Json<RecommendationRequest>,
) -> Result<Json<RecommendationResponse>, AppError> {
    let rec_service = RecommendationService::new(state.db.clone());

    let recommendations = rec_service
        .generate_recommendations(
            &1,
            req.preferred_states,
            req.budget_max,
            req.priorities,
            10,
        )
        .await?;

    Ok(Json(recommendations))
}

#[utoipa::path(
    post,
    path = "/api/v1/ai/price-predict",
    request_body = PricePredictionRequest,
    responses(
        (status = 200, description = "Price prediction", body = PricePredictionResponse)
    )
)]
pub async fn predict_price(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<PricePredictionRequest>,
) -> Result<Json<PricePredictionResponse>, AppError> {
    let ai_service = AiService::new();

    // anyhow::Error automatically converts to AppError via From trait
    let prediction = ai_service
        .predict_price(
            req.region_id,
            req.historical_prices,
            req.months_ahead.unwrap_or(3),
        )
        .await?;

    Ok(Json(prediction))
}