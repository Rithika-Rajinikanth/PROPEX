use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::routes::health::health_check,
        crate::routes::regions::list_regions,
        crate::routes::regions::get_region,
        crate::routes::regions::get_metrics,
        crate::routes::regions::get_trends,
        crate::routes::search::search_properties,
        crate::routes::search::advanced_search,
        crate::routes::search::geospatial_search,
        crate::routes::auth::register,
        crate::routes::auth::login,
        crate::routes::auth::refresh_token,
        crate::routes::ai::chat,
        crate::routes::ai::get_recommendations,
        crate::routes::ai::predict_price,
        crate::routes::analytics::get_market_trends,
        crate::routes::analytics::get_heatmap,
    ),
    components(schemas(
        crate::models::Region,
        crate::models::RegionMetrics,
        crate::models::MarketTrend,
        crate::models::SearchQuery,
        crate::models::SearchResult,
        crate::models::GeoSearchQuery,
        crate::models::User,
        crate::models::RegisterRequest,
        crate::models::LoginRequest,
        crate::models::RefreshTokenRequest,
        crate::models::AuthResponse,
        crate::models::ChatRequest,
        crate::models::ChatResponse,
        crate::models::RecommendationRequest,
        crate::models::RecommendationResponse,
        crate::models::PricePredictionRequest,
        crate::models::PricePredictionResponse,
        crate::models::SavedProperty,
        crate::models::SavePropertyRequest,
        crate::models::SearchHistory,
        crate::models::HeatmapData,
        crate::models::MarketTrendData,
    )),
    tags(
        (name = "regions", description = "Region and market data endpoints"),
        (name = "search", description = "Property search endpoints"),
        (name = "auth", description = "Authentication endpoints"),
        (name = "ai", description = "AI-powered features"),
        (name = "analytics", description = "Market analytics"),
        
    )
)]
pub struct ApiDoc;

pub fn create_openapi_spec() -> utoipa::openapi::OpenApi {
    ApiDoc::openapi()
}