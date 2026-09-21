// src/routes/exchange.rs
// PropX Dubai Liquid Real Estate & Asset Exchange REST API Endpoints

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::AppError,
    models::propx::{
        CreateOrderRequest, OrderBookDepthResponse, OrderResponse,
        PartitionSimulationRequest, PartitionSimulationResponse, Property,
        UserPortfolioSummary,
    },
    services::exchange::ExchangeService,
    AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/properties", get(list_properties))
        .route("/properties/{id}", get(get_property))
        .route("/order", post(place_order))
        .route("/book/{property_id}", get(get_order_book))
        .route("/simulate-partition", post(simulate_partition))
        .route("/portfolio/{user_id}", get(get_portfolio))
        .route("/ws/{property_id}", get(ws_order_book_handler))
}

pub async fn ws_order_book_handler(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<Uuid>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_ws_socket(socket, state, property_id))
}

async fn handle_ws_socket(mut socket: WebSocket, state: Arc<AppState>, property_id: Uuid) {
    tracing::info!("🔌 WebSocket client connected for property {}", property_id);

    // Send initial order book depth snapshot
    if let Ok(depth) = ExchangeService::get_order_book_depth(state.db.pool(), property_id).await {
        if let Ok(json) = serde_json::to_string(&depth) {
            let _ = socket.send(Message::Text(json.into())).await;
        }
    }

    let mut ticker_interval = tokio::time::interval(std::time::Duration::from_secs(2));
    loop {
        tokio::select! {
            _ = ticker_interval.tick() => {
                if let Ok(depth) = ExchangeService::get_order_book_depth(state.db.pool(), property_id).await {
                    if let Ok(json) = serde_json::to_string(&depth) {
                        if socket.send(Message::Text(json.into())).await.is_err() {
                            break; // Client disconnected
                        }
                    }
                }
            }
            msg = socket.recv() => {
                match msg {
                    Some(Ok(Message::Ping(payload))) => {
                        let _ = socket.send(Message::Pong(payload)).await;
                    }
                    Some(Ok(Message::Close(_))) | None => {
                        break;
                    }
                    _ => {}
                }
            }
        }
    }
    tracing::info!("🔌 WebSocket client disconnected for property {}", property_id);
}

#[utoipa::path(
    get,
    path = "/api/v1/exchange/properties",
    responses(
        (status = 200, description = "Active verified Dubai properties on exchange", body = Vec<Property>)
    )
)]
pub async fn list_properties(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Property>>, AppError> {
    let properties = ExchangeService::list_active_properties(state.db.pool()).await?;
    Ok(Json(properties))
}

#[utoipa::path(
    get,
    path = "/api/v1/exchange/properties/{id}",
    params(
        ("id" = Uuid, Path, description = "Property UUID")
    ),
    responses(
        (status = 200, description = "Property detail", body = Property),
        (status = 404, description = "Property not found")
    )
)]
pub async fn get_property(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Property>, AppError> {
    let property = ExchangeService::get_property_by_id(state.db.pool(), id).await?;
    Ok(Json(property))
}

#[utoipa::path(
    post,
    path = "/api/v1/exchange/order",
    request_body = CreateOrderRequest,
    responses(
        (status = 200, description = "Order placed and executed by matching engine", body = OrderResponse),
        (status = 400, description = "Invalid order parameters or insufficient balance")
    )
)]
pub async fn place_order(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateOrderRequest>,
) -> Result<Json<OrderResponse>, AppError> {
    req.validate()?;

    // For demonstration or demo mode, if unauthenticated, use seed investor
    let demo_user_id = Uuid::parse_str("11111111-1111-1111-1111-111111111111")
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let response = ExchangeService::place_and_match_order(state.db.pool(), demo_user_id, req).await?;
    Ok(Json(response))
}

#[utoipa::path(
    get,
    path = "/api/v1/exchange/book/{property_id}",
    params(
        ("property_id" = Uuid, Path, description = "Property UUID")
    ),
    responses(
        (status = 200, description = "Order book market depth", body = OrderBookDepthResponse)
    )
)]
pub async fn get_order_book(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<Uuid>,
) -> Result<Json<OrderBookDepthResponse>, AppError> {
    let depth = ExchangeService::get_order_book_depth(state.db.pool(), property_id).await?;
    Ok(Json(depth))
}

#[utoipa::path(
    post,
    path = "/api/v1/exchange/simulate-partition",
    request_body = PartitionSimulationRequest,
    responses(
        (status = 200, description = "Partition simulation with dynamic rental yield boost", body = PartitionSimulationResponse)
    )
)]
pub async fn simulate_partition(
    State(state): State<Arc<AppState>>,
    Json(req): Json<PartitionSimulationRequest>,
) -> Result<Json<PartitionSimulationResponse>, AppError> {
    req.validate()?;
    let simulation = ExchangeService::simulate_room_partition(state.db.pool(), req).await?;
    Ok(Json(simulation))
}

#[utoipa::path(
    get,
    path = "/api/v1/exchange/portfolio/{user_id}",
    params(
        ("user_id" = Uuid, Path, description = "User UUID")
    ),
    responses(
        (status = 200, description = "User fractional asset portfolio & PnL", body = UserPortfolioSummary)
    )
)]
pub async fn get_portfolio(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<Uuid>,
) -> Result<Json<UserPortfolioSummary>, AppError> {
    let portfolio = ExchangeService::get_user_portfolio(state.db.pool(), user_id).await?;
    Ok(Json(portfolio))
}
