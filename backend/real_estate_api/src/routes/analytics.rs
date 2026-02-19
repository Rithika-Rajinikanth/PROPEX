// src/routes/analytics.rs - FINAL CORRECTED VERSION

use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use std::sync::Arc;

use crate::{
    error::AppError,
    models::{HeatmapData, MarketTrendData},
    AppState,
};

#[derive(Debug, Deserialize, utoipa::IntoParams)]
pub struct TrendsQuery {
    pub state: Option<String>,
    pub limit: Option<i64>,
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/trends", get(get_market_trends))
        .route("/heatmap", get(get_heatmap))
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/trends",
    params(TrendsQuery),
    responses(
        (status = 200, description = "Market trends", body = Vec<MarketTrendData>)
    )
)]
pub async fn get_market_trends(
    State(state): State<Arc<AppState>>,
    Query(params): Query<TrendsQuery>,
) -> Result<Json<Vec<MarketTrendData>>, AppError> {
    let limit = params.limit.unwrap_or(12).min(120);

    let trends = if let Some(state_filter) = params.state {
        sqlx::query_as::<_, MarketTrendData>(
            r#"
            SELECT 
                zh.date,
                AVG(zh.zhvi_mid_tier) as avg_value,
                COUNT(*) as region_count
            FROM zhvi_home_values zh
            INNER JOIN regions r ON zh.region_id = r.id
            WHERE zh.date >= CURRENT_DATE - INTERVAL '12 months'
              AND r.state_name = $1
              AND zh.zhvi_mid_tier IS NOT NULL
            GROUP BY zh.date
            ORDER BY zh.date DESC
            LIMIT $2
            "#,
        )
        .bind(state_filter.to_uppercase())
        .bind(limit)
        .fetch_all(state.db.pool())
        .await?
    } else {
        sqlx::query_as::<_, MarketTrendData>(
            r#"
            SELECT 
                date,
                AVG(zhvi_mid_tier) as avg_value,
                COUNT(*) as region_count
            FROM zhvi_home_values
            WHERE date >= CURRENT_DATE - INTERVAL '12 months'
              AND zhvi_mid_tier IS NOT NULL
            GROUP BY date
            ORDER BY date DESC
            LIMIT $1
            "#,
        )
        .bind(limit)
        .fetch_all(state.db.pool())
        .await?
    };

    tracing::info!("Retrieved {} market trend data points", trends.len());
    Ok(Json(trends))
}

#[utoipa::path(
    get,
    path = "/api/v1/analytics/heatmap",
    responses(
        (status = 200, description = "Market heatmap data", body = Vec<HeatmapData>)
    )
)]
pub async fn get_heatmap(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<HeatmapData>>, AppError> {
    // Check if materialized view exists
    let use_mv = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_region_latest_metrics')"
    )
    .fetch_one(state.db.pool())
    .await
    .unwrap_or(false);

    let data = if use_mv {
        sqlx::query_as::<_, HeatmapData>(
            r#"
            SELECT region_id, region_name, state_name, heat_index::FLOAT8 as heat_index, current_value::FLOAT8 as current_value
            FROM mv_region_latest_metrics
            WHERE heat_index IS NOT NULL
            ORDER BY heat_index DESC
            LIMIT 100
            "#,
        )
        .fetch_all(state.db.pool())
        .await?
    } else {
        sqlx::query_as::<_, HeatmapData>(
            r#"
            SELECT DISTINCT ON (r.id)
                r.id as region_id,
                r.region_name,
                r.state_name,
                mhi.heat_index,
                zh.zhvi_mid_tier as current_value
            FROM regions r
            LEFT JOIN LATERAL (
                SELECT heat_index FROM market_heat_index 
                WHERE region_id = r.id AND heat_index IS NOT NULL
                ORDER BY date DESC LIMIT 1
            ) mhi ON true
            LEFT JOIN LATERAL (
                SELECT zhvi_mid_tier FROM zhvi_home_values 
                WHERE region_id = r.id ORDER BY date DESC LIMIT 1
            ) zh ON true
            WHERE mhi.heat_index IS NOT NULL
            ORDER BY r.id, mhi.heat_index DESC
            LIMIT 100
            "#,
        )
        .fetch_all(state.db.pool())
        .await?
    };

    tracing::info!("Retrieved {} heatmap points", data.len());
    Ok(Json(data))
}
