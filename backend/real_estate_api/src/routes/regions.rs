// src/routes/regions.rs - FIXED

use axum::{
    extract::{Path, Query, State},
    routing::get,
    Json, Router,
};

use crate::{
    error::AppError,
    models::{MarketTrend, Region, RegionMetrics},
    AppState,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Debug, Deserialize, utoipa::IntoParams)]
pub struct RegionListQuery {
    pub state: Option<String>,
    pub region_type: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize, utoipa::IntoParams)]
pub struct TrendsQuery {
    pub metric: Option<String>,
    pub months: Option<i32>,
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_regions))
        .route("/{id}", get(get_region))
        .route("/{id}/metrics", get(get_metrics))
        .route("/{id}/trends", get(get_trends))
}

#[utoipa::path(get, path = "/api/v1/regions", params(RegionListQuery), responses((status = 200, description = "List of regions", body = Vec<Region>)))]
pub async fn list_regions(
    State(state): State<Arc<AppState>>,
    Query(params): Query<RegionListQuery>,
) -> Result<Json<Vec<Region>>, AppError> {
    let limit = params.limit.unwrap_or(100).min(1000);
    let offset = params.offset.unwrap_or(0);
    let mut query = String::from(
        "SELECT id, region_name, region_type, state_name, created_at FROM regions WHERE 1=1",
    );
    let mut bindings: Vec<String> = Vec::new();
    if let Some(state_filter) = params.state {
        query.push_str(&format!(" AND state_name = ${}", bindings.len() + 1));
        bindings.push(state_filter.to_uppercase());
    }
    if let Some(region_type) = params.region_type {
        query.push_str(&format!(" AND region_type = ${}", bindings.len() + 1));
        bindings.push(region_type);
    }
    query.push_str(&format!(
        " ORDER BY region_name LIMIT ${} OFFSET ${}",
        bindings.len() + 1,
        bindings.len() + 2
    ));
    let mut db_query = sqlx::query_as::<_, Region>(&query);
    for binding in bindings {
        db_query = db_query.bind(binding);
    }
    db_query = db_query.bind(limit).bind(offset);
    Ok(Json(db_query.fetch_all(state.db.pool()).await?))
}

#[utoipa::path(get, path = "/api/v1/regions/{id}", params(("id" = i32, Path)), responses((status = 200, description = "Region details", body = Region)))]
pub async fn get_region(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
) -> Result<Json<Region>, AppError> {
    let region = sqlx::query_as::<_, Region>(
        "SELECT id, region_name, region_type, state_name, created_at FROM regions WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(state.db.pool())
    .await?
    .ok_or(AppError::NotFound)?;
    Ok(Json(region))
}

#[utoipa::path(get, path = "/api/v1/regions/{id}/metrics", params(("id" = i32, Path)), responses((status = 200, description = "Region metrics", body = RegionMetrics)))]
pub async fn get_metrics(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
) -> Result<Json<RegionMetrics>, AppError> {
    // ✅ FIX: Added region_type to SELECT — it was missing, causing FromRow to fail
    // and return nulls for all fields when the column count didn't match the struct.
    let metrics = sqlx::query_as::<_, RegionMetrics>(
        "SELECT region_id, region_name, state_name, region_type, current_value, median_list_price,
                median_sale_price, inventory, new_listings, sales_count, days_to_pending,
                days_to_close, heat_index, affordability_ratio, last_updated
         FROM mv_region_latest_metrics WHERE region_id = $1",
    )
    .bind(id)
    .fetch_optional(state.db.pool())
    .await?;

    let metrics = match metrics {
        Some(m)
            if m.current_value.is_some()
                || m.median_list_price.is_some()
                || m.median_sale_price.is_some() =>
        {
            m
        }
        Some(m) => {
            // MV returned row but all metrics null — try direct query
            let direct = sqlx::query_as::<_, RegionMetrics>(
                r#"SELECT
                    r.id as region_id,
                    r.region_name,
                    r.state_name,
                    r.region_type,
                    (SELECT zh.zhvi_mid_tier::FLOAT8 FROM zhvi_home_values zh WHERE zh.region_id = r.id AND zh.zhvi_mid_tier IS NOT NULL ORDER BY zh.date DESC LIMIT 1) as current_value,
                    (SELECT fsl.median_list_price::FLOAT8 FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as median_list_price,
                    (SELECT sm.median_sale_price::FLOAT8 FROM sales_metrics sm WHERE sm.region_id = r.id ORDER BY sm.date DESC LIMIT 1) as median_sale_price,
                    (SELECT fsl.inventory::INTEGER FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as inventory,
                    (SELECT fsl.new_listings::INTEGER FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as new_listings,
                    (SELECT sm.sales_count::INTEGER FROM sales_metrics sm WHERE sm.region_id = r.id ORDER BY sm.date DESC LIMIT 1) as sales_count,
                    (SELECT mtm.days_to_pending::FLOAT8 FROM market_timing_metrics mtm WHERE mtm.region_id = r.id ORDER BY mtm.date DESC LIMIT 1) as days_to_pending,
                    (SELECT mtm.days_to_close::FLOAT8 FROM market_timing_metrics mtm WHERE mtm.region_id = r.id ORDER BY mtm.date DESC LIMIT 1) as days_to_close,
                    (SELECT mhi.heat_index::FLOAT8 FROM market_heat_index mhi WHERE mhi.region_id = r.id ORDER BY mhi.date DESC LIMIT 1) as heat_index,
                    (SELECT am.affordability_ratio::FLOAT8 FROM affordability_metrics am WHERE am.region_id = r.id ORDER BY am.date DESC LIMIT 1) as affordability_ratio,
                    (SELECT MAX(zh.date) FROM zhvi_home_values zh WHERE zh.region_id = r.id) as last_updated
                FROM regions r WHERE r.id = $1"#,
            )
            .bind(id)
            .fetch_optional(state.db.pool())
            .await?;
            direct.unwrap_or(m)
        }
        None => {
            // MV has no row — try direct query
            sqlx::query_as::<_, RegionMetrics>(
                r#"SELECT
                    r.id as region_id,
                    r.region_name,
                    r.state_name,
                    r.region_type,
                    (SELECT zh.zhvi_mid_tier::FLOAT8 FROM zhvi_home_values zh WHERE zh.region_id = r.id AND zh.zhvi_mid_tier IS NOT NULL ORDER BY zh.date DESC LIMIT 1) as current_value,
                    (SELECT fsl.median_list_price::FLOAT8 FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as median_list_price,
                    (SELECT sm.median_sale_price::FLOAT8 FROM sales_metrics sm WHERE sm.region_id = r.id ORDER BY sm.date DESC LIMIT 1) as median_sale_price,
                    (SELECT fsl.inventory::INTEGER FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as inventory,
                    (SELECT fsl.new_listings::INTEGER FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as new_listings,
                    (SELECT sm.sales_count::INTEGER FROM sales_metrics sm WHERE sm.region_id = r.id ORDER BY sm.date DESC LIMIT 1) as sales_count,
                    (SELECT mtm.days_to_pending::FLOAT8 FROM market_timing_metrics mtm WHERE mtm.region_id = r.id ORDER BY mtm.date DESC LIMIT 1) as days_to_pending,
                    (SELECT mtm.days_to_close::FLOAT8 FROM market_timing_metrics mtm WHERE mtm.region_id = r.id ORDER BY mtm.date DESC LIMIT 1) as days_to_close,
                    (SELECT mhi.heat_index::FLOAT8 FROM market_heat_index mhi WHERE mhi.region_id = r.id ORDER BY mhi.date DESC LIMIT 1) as heat_index,
                    (SELECT am.affordability_ratio::FLOAT8 FROM affordability_metrics am WHERE am.region_id = r.id ORDER BY am.date DESC LIMIT 1) as affordability_ratio,
                    (SELECT MAX(zh.date) FROM zhvi_home_values zh WHERE zh.region_id = r.id) as last_updated
                FROM regions r WHERE r.id = $1"#,
            )
            .bind(id)
            .fetch_optional(state.db.pool())
            .await?
            .ok_or(AppError::NotFound)?
        }
    };

    Ok(Json(metrics))
}

#[utoipa::path(get, path = "/api/v1/regions/{id}/trends", params(("id" = i32, Path), TrendsQuery), responses((status = 200, description = "Historical trends", body = Vec<MarketTrend>)))]
pub async fn get_trends(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
    Query(params): Query<TrendsQuery>,
) -> Result<Json<Vec<MarketTrend>>, AppError> {
    let months = params.months.unwrap_or(12).clamp(1, 120);
    let metric = params.metric.unwrap_or_else(|| "zhvi".to_string());
    let trends = match metric.as_str() {
        "zhvi" | "home_value" => sqlx::query_as::<_, MarketTrend>(
            "SELECT date, zhvi_mid_tier::FLOAT8 as value, 'zhvi' as metric_type FROM zhvi_home_values
             WHERE region_id = $1 AND zhvi_mid_tier IS NOT NULL AND date >= CURRENT_DATE - INTERVAL '1 month' * $2 ORDER BY date ASC")
            .bind(id).bind(months).fetch_all(state.db.pool()).await?,
        "heat" | "heat_index" => sqlx::query_as::<_, MarketTrend>(
            "SELECT date, heat_index::FLOAT8 as value, 'heat' as metric_type FROM market_heat_index
             WHERE region_id = $1 AND heat_index IS NOT NULL AND date >= CURRENT_DATE - INTERVAL '1 month' * $2 ORDER BY date ASC")
            .bind(id).bind(months).fetch_all(state.db.pool()).await?,
        _ => return Err(AppError::BadRequest(format!("Invalid metric: {}", metric)))
    };
    Ok(Json(trends))
}
