#!/bin/bash

# Real Estate API - Project Setup Script
# Run this after creating your Rust project with: cargo new real-estate-api

set -e

echo "🏗️  Setting up Real Estate API Backend..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create directory structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p src/{routes,services,middleware,db,utils}
mkdir -p migrations

# Create module files
echo -e "${BLUE}📝 Creating module files...${NC}"

# src/routes/mod.rs
cat > src/routes/mod.rs << 'EOF'
pub mod auth;
pub mod regions;
pub mod search;
pub mod ai;
pub mod user;
pub mod analytics;
pub mod admin;
pub mod health;
pub mod openapi;
EOF

# src/services/mod.rs
cat > src/services/mod.rs << 'EOF'
pub mod ai;
pub mod recommendation;
pub mod search;
EOF

# src/middleware/mod.rs
cat > src/middleware/mod.rs << 'EOF'
pub mod auth;
EOF

# src/db/mod.rs (already created in artifacts, but adding queries.rs)
cat > src/db/queries.rs << 'EOF'
// Additional database queries can be added here
// The main query builder is in mod.rs
EOF

# src/utils/mod.rs
cat > src/utils/mod.rs << 'EOF'
// Utility functions
use chrono::{DateTime, Utc};

pub fn format_date(date: DateTime<Utc>) -> String {
    date.format("%Y-%m-%d %H:%M:%S").to_string()
}
EOF

# Create missing route files

# src/routes/health.rs
cat > src/routes/health.rs << 'EOF'
use axum::Json;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
}

#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "Service is healthy", body = HealthResponse)
    )
)]
pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}
EOF

# src/routes/user.rs
cat > src/routes/user.rs << 'EOF'
use axum::{
    extract::{Query, State},
    Extension,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::AppError,
    models::{SavePropertyRequest, SavedProperty, SearchHistory, User, RegionMetrics},
    AppState,
};

pub async fn get_profile(
    Extension(user): Extension<User>,
) -> Result<Json<User>, AppError> {
    Ok(Json(user))
}

pub async fn get_saved_properties(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<User>,
) -> Result<Json<Vec<SavedProperty>>, AppError> {
    let saved = sqlx::query_as::<_, SavedProperty>(
        "SELECT * FROM saved_properties WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(&user.id)
    .fetch_all(state.db.pool())
    .await?;

    Ok(Json(saved))
}

pub async fn save_property(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<User>,
    Json(req): Json<SavePropertyRequest>,
) -> Result<Json<SavedProperty>, AppError> {
    req.validate()?;

    let saved = sqlx::query_as::<_, SavedProperty>(
        r#"
        INSERT INTO saved_properties (user_id, region_id, notes)
        VALUES ($1, $2, $3)
        RETURNING *
        "#
    )
    .bind(&user.id)
    .bind(req.region_id)
    .bind(&req.notes)
    .fetch_one(state.db.pool())
    .await?;

    Ok(Json(saved))
}

pub async fn get_search_history(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<User>,
) -> Result<Json<Vec<SearchHistory>>, AppError> {
    let history = sqlx::query_as::<_, SearchHistory>(
        "SELECT * FROM search_history WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 50"
    )
    .bind(&user.id)
    .fetch_all(state.db.pool())
    .await?;

    Ok(Json(history))
}
EOF

# src/routes/analytics.rs
cat > src/routes/analytics.rs << 'EOF'
use axum::{extract::State, Json};
use std::sync::Arc;

use crate::{
    error::AppError,
    models::{HeatmapData, MarketAnalytics, RegionMetrics},
    AppState,
};

pub async fn get_market_trends(
    State(state): State<Arc<AppState>>,
) -> Result<Json<MarketAnalytics>, AppError> {
    // Get hottest markets
    let hottest = sqlx::query_as::<_, RegionMetrics>(
        r#"
        SELECT DISTINCT ON (r.id)
            r.id as region_id,
            r.region_name,
            r.state_name,
            zh.zhvi_mid_tier as current_value,
            sl.median_list_price,
            sm.median_sale_price,
            sl.inventory,
            sl.new_listings,
            sm.sales_count,
            mt.days_to_pending,
            mt.days_to_close,
            mh.heat_index,
            af.affordability_ratio,
            zh.date as last_updated
        FROM regions r
        LEFT JOIN zhvi_home_values zh ON r.id = zh.region_id
        LEFT JOIN for_sale_listings sl ON r.id = sl.region_id AND zh.date = sl.date
        LEFT JOIN sales_metrics sm ON r.id = sm.region_id AND zh.date = sm.date
        LEFT JOIN market_timing_metrics mt ON r.id = mt.region_id AND zh.date = mt.date
        LEFT JOIN market_heat_index mh ON r.id = mh.region_id AND zh.date = mh.date
        LEFT JOIN affordability_metrics af ON r.id = af.region_id AND zh.date = af.date
        WHERE mh.heat_index IS NOT NULL
        ORDER BY r.id, mh.heat_index DESC, zh.date DESC
        LIMIT 10
        "#
    )
    .fetch_all(state.db.pool())
    .await?;

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM regions")
        .fetch_one(state.db.pool())
        .await?;

    let avg_value: f64 = sqlx::query_scalar(
        "SELECT AVG(zhvi_mid_tier) FROM zhvi_home_values WHERE date >= CURRENT_DATE - INTERVAL '1 month'"
    )
    .fetch_one(state.db.pool())
    .await?;

    Ok(Json(MarketAnalytics {
        total_regions: total,
        avg_home_value: avg_value,
        hottest_markets: hottest.clone(),
        trending_up: hottest.clone(),
        most_affordable: hottest,
    }))
}

pub async fn get_heatmap(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<HeatmapData>>, AppError> {
    let data = sqlx::query_as::<_, HeatmapData>(
        r#"
        SELECT DISTINCT ON (r.id)
            r.region_name,
            COALESCE(r.state_name, '') as state_name,
            ST_Y(r.geometry::geometry) as latitude,
            ST_X(r.geometry::geometry) as longitude,
            COALESCE(mh.heat_index, 0.0) as heat_index,
            zh.zhvi_mid_tier as median_price
        FROM regions r
        LEFT JOIN market_heat_index mh ON r.id = mh.region_id
        LEFT JOIN zhvi_home_values zh ON r.id = zh.region_id AND mh.date = zh.date
        WHERE r.geometry IS NOT NULL
        ORDER BY r.id, mh.date DESC
        LIMIT 1000
        "#
    )
    .fetch_all(state.db.pool())
    .await?;

    Ok(Json(data))
}
EOF

# src/routes/admin.rs
cat > src/routes/admin.rs << 'EOF'
use axum::{extract::State, Json};
use std::sync::Arc;
use serde::Serialize;

use crate::{error::AppError, models::User, AppState};

#[derive(Serialize)]
pub struct AdminAnalytics {
    pub total_users: i64,
    pub total_searches: i64,
    pub total_saved_properties: i64,
}

pub async fn list_users(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<User>>, AppError> {
    let users = sqlx::query_as::<_, User>(
        "SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 100"
    )
    .fetch_all(state.db.pool())
    .await?;

    Ok(Json(users))
}

pub async fn get_analytics(
    State(state): State<Arc<AppState>>,
) -> Result<Json<AdminAnalytics>, AppError> {
    let total_users: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(state.db.pool())
        .await?;

    let total_searches: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM search_history")
        .fetch_one(state.db.pool())
        .await?;

    let total_saved: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM saved_properties")
        .fetch_one(state.db.pool())
        .await?;

    Ok(Json(AdminAnalytics {
        total_users,
        total_searches,
        total_saved_properties: total_saved,
    }))
}
EOF

# src/routes/openapi.rs
cat > src/routes/openapi.rs << 'EOF'
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::routes::health::health_check,
        crate::routes::auth::register,
        crate::routes::auth::login,
        crate::routes::auth::refresh_token,
        crate::routes::regions::list_regions,
        crate::routes::regions::get_region,
        crate::routes::regions::get_metrics,
        crate::routes::regions::get_trends,
        crate::routes::search::search_properties,
        crate::routes::search::advanced_search,
        crate::routes::search::geospatial_search,
        crate::routes::ai::chat,
        crate::routes::ai::get_recommendations,
        crate::routes::ai::predict_price,
    ),
    components(
        schemas(
            crate::models::Region,
            crate::models::RegionMetrics,
            crate::models::MarketTrend,
            crate::models::SearchQuery,
            crate::models::SearchResult,
            crate::models::GeoSearchQuery,
            crate::models::User,
            crate::models::RegisterRequest,
            crate::models::LoginRequest,
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
            crate::models::MarketAnalytics,
            crate::models::HeatmapData,
        )
    ),
    tags(
        (name = "auth", description = "Authentication endpoints"),
        (name = "regions", description = "Region and market data"),
        (name = "search", description = "Property search"),
        (name = "ai", description = "AI-powered features"),
        (name = "user", description = "User management"),
        (name = "analytics", description = "Market analytics"),
    )
)]
pub struct ApiDoc;

pub fn create_openapi_spec() -> utoipa::openapi::OpenApi {
    ApiDoc::openapi()
}
EOF

# src/services/recommendation.rs
cat > src/services/recommendation.rs << 'EOF'
use crate::{
    db::Database,
    error::AppError,
    models::{RecommendationResponse, RegionMetrics, UserPreferences},
};
use uuid::Uuid;

pub struct RecommendationEngine {
    db: Database,
}

impl RecommendationEngine {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub async fn generate_recommendations(
        &self,
        _user_id: &Uuid,
        preferences: Option<UserPreferences>,
        budget_max: Option<f64>,
        _saved_regions: &[i32],
        limit: i64,
    ) -> Result<RecommendationResponse, AppError> {
        let mut query = String::from(
            r#"
            SELECT DISTINCT ON (r.id)
                r.id as region_id,
                r.region_name,
                r.state_name,
                zh.zhvi_mid_tier as current_value,
                sl.median_list_price,
                sm.median_sale_price,
                sl.inventory,
                sl.new_listings,
                sm.sales_count,
                mt.days_to_pending,
                mt.days_to_close,
                mh.heat_index,
                af.affordability_ratio,
                zh.date as last_updated
            FROM regions r
            LEFT JOIN zhvi_home_values zh ON r.id = zh.region_id
            LEFT JOIN for_sale_listings sl ON r.id = sl.region_id AND zh.date = sl.date
            LEFT JOIN sales_metrics sm ON r.id = sm.region_id AND zh.date = sm.date
            LEFT JOIN market_timing_metrics mt ON r.id = mt.region_id AND zh.date = mt.date
            LEFT JOIN market_heat_index mh ON r.id = mh.region_id AND zh.date = mh.date
            LEFT JOIN affordability_metrics af ON r.id = af.region_id AND zh.date = af.date
            WHERE 1=1
            "#
        );

        if let Some(max_budget) = budget_max {
            query.push_str(&format!(" AND zh.zhvi_mid_tier <= {}", max_budget));
        }

        if let Some(prefs) = preferences {
            if let Some(min_afford) = prefs.min_affordability {
                query.push_str(&format!(" AND af.affordability_ratio >= {}", min_afford));
            }
        }

        query.push_str(&format!(" ORDER BY r.id, mh.heat_index DESC, zh.date DESC LIMIT {}", limit));

        let recommendations = sqlx::query_as::<_, RegionMetrics>(&query)
            .fetch_all(self.db.pool())
            .await?;

        let reasoning = format!(
            "Found {} properties matching your preferences based on market heat index and affordability",
            recommendations.len()
        );

        Ok(RecommendationResponse {
            recommendations,
            reasoning,
        })
    }
}
EOF

# src/services/search.rs
cat > src/services/search.rs << 'EOF'
use crate::{
    db::{Database, SearchQueryBuilder},
    error::AppError,
    models::{RegionMetrics, SearchQuery, SearchResult},
};

pub struct SearchService {
    db: Database,
}

impl SearchService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub async fn advanced_search(&self, params: SearchQuery) -> Result<SearchResult, AppError> {
        let mut builder = SearchQueryBuilder::new();

        if let Some(location) = params.location {
            builder = builder.region_name(&location);
        }

        if let Some(state) = params.state {
            builder = builder.state(&state);
        }

        if let Some(min) = params.price_min {
            builder = builder.price_min(min);
        }

        if let Some(max) = params.price_max {
            builder = builder.price_max(max);
        }

        let limit = params.limit.unwrap_or(20);
        let offset = params.offset.unwrap_or(0);

        builder = builder.limit(limit).offset(offset);

        let query = builder.build();
        let results = sqlx::query_as::<_, RegionMetrics>(&query)
            .fetch_all(self.db.pool())
            .await?;

        let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM regions")
            .fetch_one(self.db.pool())
            .await?;

        Ok(SearchResult {
            total,
            page: offset / limit,
            page_size: limit,
            results,
        })
    }
}
EOF

echo -e "${GREEN}✅ All module files created!${NC}"

echo ""
echo -e "${BLUE}📝 Now you need to:${NC}"
echo "1. Copy the artifact files from Claude into their respective locations:"
echo "   - Cargo.toml (from artifact 'cargo_toml')"
echo "   - src/main.rs (from artifact 'main_rs')"
echo "   - src/config.rs (from artifact 'config_rs')"
echo "   - src/db/mod.rs (from artifact 'database_rs')"
echo "   - src/models/mod.rs (from artifact 'models_rs')"
echo "   - src/routes/regions.rs (from artifact 'routes_regions')"
echo "   - src/routes/search.rs (from artifact 'routes_search')"
echo "   - src/routes/ai.rs (from artifact 'routes_ai')"
echo "   - src/routes/auth.rs (from artifact 'routes_auth')"
echo "   - src/services/ai.rs (from artifact 'services_ai')"
echo "   - src/middleware/auth.rs (from artifact 'middleware_auth')"
echo "   - src/error.rs (from artifact 'error_handling')"
echo "   - .env (from artifact 'env_file')"
echo ""
echo "2. Install dependencies:"
echo "   cargo add regex"
echo ""
echo "3. Build the project:"
echo "   cargo build"
echo ""
echo "4. Run the server:"
echo "   cargo run"
echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
EOF

chmod +x setup.sh