use crate::services::rag::RagService;
use crate::{
    error::AppError,
    models::{
        ChatRequest, ChatResponse, PricePredictionRequest, PricePredictionResponse,
        RecommendationRequest, RecommendationResponse,
    },
    services::recommendation::RecommendationService,
    AppState,
};
use axum::{extract::State, routing::post, Json, Router};
use std::sync::Arc;

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
    State(state): State<Arc<AppState>>,
    Json(req): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, AppError> {
    let rag_service = RagService::new(state.db.clone())?;

    let response = rag_service
        .process_query(&req.message, req.context)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

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
        .generate_recommendations(&1, req.preferred_states, req.budget_max, req.priorities, 10)
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
    let ml_url = std::env::var("ML_SERVICE_URL").unwrap_or_else(|_| {
        "https://ml-service.salmonsky-439a40bf.eastasia.azurecontainerapps.io".to_string()
    });

    let client = reqwest::Client::new();

    let response = client
        .post(format!("{}/predict", ml_url))
        .json(&req)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("ML service request failed: {}", e)))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(AppError::Internal(format!(
            "ML service error {}: {}",
            status, body
        )));
    }

    let prediction: PricePredictionResponse = response
        .json()
        .await
        .map_err(|e| AppError::Internal(format!("ML service response parse failed: {}", e)))?;

    Ok(Json(prediction))
}
