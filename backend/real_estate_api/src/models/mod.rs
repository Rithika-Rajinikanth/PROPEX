// src/models/mod.rs - COMPLETE FIXED VERSION

pub mod propx;

use chrono::{NaiveDate, NaiveDateTime};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct Region {
    pub id: i32,
    pub region_name: String,
    pub region_type: String,
    pub state_name: String,
    pub created_at: NaiveDateTime,
}

// CRITICAL: All types now match the FLOAT8 casts in the SQL view
#[derive(Debug, Serialize, Deserialize, FromRow, Clone, utoipa::ToSchema)]
pub struct RegionMetrics {
    pub region_id: i32,
    pub region_name: String,
    pub state_name: String,
    pub region_type: Option<String>,
    pub current_value: Option<f64>,       // FLOAT8 from view
    pub median_list_price: Option<f64>,   // FLOAT8 from view
    pub median_sale_price: Option<f64>,   // FLOAT8 from view
    pub inventory: Option<i32>,           // INTEGER
    pub new_listings: Option<i32>,        // INTEGER
    pub sales_count: Option<i32>,         // INTEGER
    pub days_to_pending: Option<f64>,     // FLOAT8 from view
    pub days_to_close: Option<f64>,       // FLOAT8 from view
    pub heat_index: Option<f64>,          // FLOAT8 from view
    pub affordability_ratio: Option<f64>, // FLOAT8 from view
    pub last_updated: Option<NaiveDate>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct MarketTrend {
    pub date: NaiveDate,
    pub value: f64, // FLOAT8 - no Decimal needed
    pub metric_type: String,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::IntoParams, utoipa::ToSchema)]
pub struct SearchQuery {
    pub location: Option<String>,
    pub state: Option<String>,
    pub region_type: Option<String>,
    #[validate(range(min = 0.0))]
    pub price_min: Option<f64>,
    #[validate(range(min = 0.0))]
    pub price_max: Option<f64>,
    pub heat_index_min: Option<f64>,
    #[validate(range(min = 0))] // ← add this
    pub inventory_min: Option<i64>,
    #[validate(range(min = 1, max = 100))]
    pub limit: Option<i64>,
    #[validate(range(min = 0))]
    pub offset: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct SearchResult {
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub results: Vec<RegionMetrics>,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::IntoParams, utoipa::ToSchema)]
pub struct GeoSearchQuery {
    #[validate(range(min = -90.0, max = 90.0))]
    pub latitude: f64,
    #[validate(range(min = -180.0, max = 180.0))]
    pub longitude: f64,
    #[validate(range(min = 1.0, max = 100.0))]
    pub radius_km: f64,
    #[validate(range(min = 1, max = 100))]
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, utoipa::ToSchema)]
pub struct User {
    pub id: i32,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub name: String,
    pub preferences: Option<serde_json::Value>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(length(min = 2))]
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct AuthResponse {
    pub token: String,
    pub refresh_token: String,
    pub user: UserProfile,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserProfile {
    pub id: i32,
    pub email: String,
    pub name: String,
    pub preferences: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema)]
pub struct Claims {
    pub sub: i32,
    pub email: String,
    pub exp: usize,
}

// ✅ FIX 1: Use chrono::NaiveDate instead of sqlx::types::time::Date
// ✅ FIX 2: Add utoipa::ToSchema derive macro
#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct MarketTrendData {
    pub date: NaiveDate,   // ✅ Changed from sqlx::types::time::Date
    pub avg_value: f64,    // CAST(AVG(...) AS FLOAT8)
    pub region_count: i64, // COUNT(*)::BIGINT
}

// ✅ FIX: Add utoipa::ToSchema derive macro
#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct HeatmapData {
    pub region_id: i32,
    pub region_name: String,
    pub state_name: String,
    pub heat_index: f64,    // CAST(... AS FLOAT8)
    pub current_value: f64, // CAST(... AS FLOAT8)
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct ChatRequest {
    #[validate(length(min = 1, max = 1000))]
    pub message: String,
    pub context: Option<Vec<ChatMessage>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, utoipa::ToSchema)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ChatResponse {
    pub message: String,
    pub suggestions: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct RecommendationRequest {
    pub budget_min: Option<f64>,
    pub budget_max: Option<f64>,
    pub preferred_states: Option<Vec<String>>,
    pub priorities: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct RecommendationResponse {
    pub recommendations: Vec<RegionMetrics>,
    pub reasoning: String,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct PricePredictionRequest {
    pub region_id: i32,
    pub historical_prices: Vec<f64>,
    pub months_ahead: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct PricePredictionResponse {
    pub region_id: i32,
    pub current_price: Option<f64>,
    pub predicted_price: Option<f64>,
    pub confidence: f64,
    pub factors: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct SavedProperty {
    pub id: i32,
    pub user_id: i32,
    pub region_id: i32,
    pub notes: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct SavePropertyRequest {
    pub region_id: i32,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct SearchHistory {
    pub id: i32,
    pub user_id: i32,
    pub query: String,
    pub filters: Option<serde_json::Value>,
    pub results_count: i32,
    pub searched_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct HealthCheck {
    pub status: String,
    pub database: String,
    pub redis: Option<String>,
}
