// backend/src/routes/search.rs - FINAL WORKING VERSION
use crate::services::embedding::EmbeddingService;
use crate::{
    error::AppError,
    models::{GeoSearchQuery, RegionMetrics, SearchQuery, SearchResult},
    AppState,
};
use axum::{
    extract::{Query, State},
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;
use validator::Validate;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(search_properties))
        .route("/semantic", get(semantic_search))
        .route("/advanced", post(advanced_search))
        .route("/geospatial", post(geospatial_search))
}

#[utoipa::path(get, path = "/api/v1/search/semantic", params(("q" = String, Query)), responses((status = 200, description = "Semantic search results", body = Vec<RegionMetrics>)))]
pub async fn semantic_search(
    State(state): State<Arc<AppState>>,
    Query(query): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<Vec<RegionMetrics>>, AppError> {
    let search_query = query
        .get("q")
        .ok_or(AppError::BadRequest("Missing 'q' parameter".into()))?;
    let embedding_service = EmbeddingService::new();
    let query_embedding = embedding_service
        .generate_embedding(search_query)
        .await
        .map_err(|e| AppError::Internal(format!("Embedding failed: {}", e)))?;
    let embedding_str = format!(
        "[{}]",
        query_embedding
            .iter()
            .map(|f| f.to_string())
            .collect::<Vec<_>>()
            .join(",")
    );

    let results = sqlx::query_as::<_, RegionMetrics>(
        r#"SELECT region_id, region_name, state_name, current_value, median_list_price,
            median_sale_price, inventory, new_listings, sales_count, days_to_pending,
            days_to_close, heat_index, affordability_ratio, last_updated
        FROM mv_search_optimized
        WHERE embedding IS NOT NULL AND current_value IS NOT NULL
        ORDER BY embedding <=> $1::vector(384) LIMIT 20"#,
    )
    .bind(embedding_str)
    .fetch_all(state.db.pool())
    .await?;
    Ok(Json(results))
}

#[utoipa::path(get, path = "/api/v1/search", params(SearchQuery), responses((status = 200, description = "Search results", body = SearchResult)))]
pub async fn search_properties(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>,
) -> Result<Json<SearchResult>, AppError> {
    params.validate()?;
    let limit = params.limit.unwrap_or(20).min(100);
    let offset = params.offset.unwrap_or(0);

    let use_mv = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_search_optimized')",
    )
    .fetch_one(state.db.pool())
    .await
    .unwrap_or(false);

    if use_mv {
        search_with_mv(&state, &params, limit, offset).await
    } else {
        search_direct(&state, &params, limit, offset).await
    }
}

async fn search_with_mv(
    state: &Arc<AppState>,
    params: &SearchQuery,
    limit: i64,
    offset: i64,
) -> Result<Json<SearchResult>, AppError> {
    // Build base query
    let base_select =
        "SELECT region_id, region_name, state_name, region_type, current_value, median_list_price, 
                median_sale_price, inventory, new_listings, sales_count, days_to_pending, 
                days_to_close, heat_index, affordability_ratio, last_updated 
         FROM mv_search_optimized 
         WHERE current_value IS NOT NULL";

    let base_count = "SELECT COUNT(*) FROM mv_search_optimized WHERE current_value IS NOT NULL";

    // Build WHERE conditions and collect bindings
    let mut conditions: Vec<String> = Vec::new();
    let mut param_index = 1;

    // String bindings (location, state, region_type)
    let location_binding = params.location.as_ref().map(|loc| format!("%{}%", loc));
    if location_binding.is_some() {
        conditions.push(format!("LOWER(region_name) LIKE LOWER(${})", param_index));
        param_index += 1;
    }

    let state_binding = params.state.as_ref().map(|s| s.to_uppercase());
    if state_binding.is_some() {
        conditions.push(format!("state_name = ${}", param_index));
        param_index += 1;
    }

    let region_type_binding = params.region_type.clone();
    if region_type_binding.is_some() {
        conditions.push(format!("region_type = ${}", param_index));
        param_index += 1;
    }

    // Numeric bindings (heat_index_min, price_min, price_max, inventory_min)
    if params.heat_index_min.is_some() {
        conditions.push(format!("heat_index >= ${}", param_index));
        param_index += 1;
    }

    if params.price_min.is_some() {
        conditions.push(format!("current_value >= ${}", param_index));
        param_index += 1;
    }

    if params.price_max.is_some() {
        conditions.push(format!("current_value <= ${}", param_index));
        param_index += 1;
    }

    if params.inventory_min.is_some() {
        conditions.push(format!("inventory >= ${}", param_index));
        param_index += 1;
    }

    // Build final query strings
    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!(" AND {}", conditions.join(" AND "))
    };

    let query_str = format!(
        "{}{} ORDER BY heat_index DESC NULLS LAST, region_name LIMIT ${} OFFSET ${}",
        base_select,
        where_clause,
        param_index,
        param_index + 1
    );

    let count_str = format!("{}{}", base_count, where_clause);

    // Build and execute main query
    let mut query = sqlx::query_as::<_, RegionMetrics>(&query_str);

    // Bind parameters in order
    if let Some(ref loc) = location_binding {
        query = query.bind(loc);
    }
    if let Some(ref state) = state_binding {
        query = query.bind(state);
    }
    if let Some(ref rt) = region_type_binding {
        query = query.bind(rt);
    }
    if let Some(heat) = params.heat_index_min {
        query = query.bind(heat); // Bind as f64
    }
    if let Some(price_min) = params.price_min {
        query = query.bind(price_min); // Bind as f64
    }
    if let Some(price_max) = params.price_max {
        query = query.bind(price_max); // Bind as f64
    }
    if let Some(inv) = params.inventory_min {
        query = query.bind(inv as i32); // Bind as i32
    }

    // Bind pagination
    query = query.bind(limit).bind(offset);

    let results = query.fetch_all(state.db.pool()).await.map_err(|e| {
        tracing::error!("Search query failed: {:?}", e);
        AppError::Internal(format!("Database error: {}", e))
    })?;

    // Build and execute count query
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_str);

    if let Some(ref loc) = location_binding {
        count_query = count_query.bind(loc);
    }
    if let Some(ref state) = state_binding {
        count_query = count_query.bind(state);
    }
    if let Some(ref rt) = region_type_binding {
        count_query = count_query.bind(rt);
    }
    if let Some(heat) = params.heat_index_min {
        count_query = count_query.bind(heat);
    }
    if let Some(price_min) = params.price_min {
        count_query = count_query.bind(price_min);
    }
    if let Some(price_max) = params.price_max {
        count_query = count_query.bind(price_max);
    }
    if let Some(inv) = params.inventory_min {
        count_query = count_query.bind(inv as i32);
    }

    let total = count_query.fetch_one(state.db.pool()).await.unwrap_or(0);

    tracing::info!(
        "Search (MV): {} results, filters: state={:?} type={:?} heat>={:?} price={:?}-{:?}",
        results.len(),
        params.state,
        params.region_type,
        params.heat_index_min,
        params.price_min,
        params.price_max
    );

    Ok(Json(SearchResult {
        total,
        page: offset / limit,
        page_size: limit,
        results,
    }))
}

async fn search_direct(
    state: &Arc<AppState>,
    params: &SearchQuery,
    limit: i64,
    offset: i64,
) -> Result<Json<SearchResult>, AppError> {
    let base_query = r#"
        SELECT r.id as region_id, r.region_name, r.state_name, r.region_type,
            (SELECT zh.zhvi_mid_tier FROM zhvi_home_values zh WHERE zh.region_id = r.id ORDER BY zh.date DESC LIMIT 1) as current_value,
            (SELECT fsl.median_list_price FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as median_list_price,
            (SELECT sm.median_sale_price FROM sales_metrics sm WHERE sm.region_id = r.id ORDER BY sm.date DESC LIMIT 1) as median_sale_price,
            (SELECT fsl.inventory FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as inventory,
            (SELECT fsl.new_listings FROM for_sale_listings fsl WHERE fsl.region_id = r.id ORDER BY fsl.date DESC LIMIT 1) as new_listings,
            (SELECT sm.sales_count FROM sales_metrics sm WHERE sm.region_id = r.id ORDER BY sm.date DESC LIMIT 1) as sales_count,
            (SELECT mtm.days_to_pending FROM market_timing_metrics mtm WHERE mtm.region_id = r.id ORDER BY mtm.date DESC LIMIT 1) as days_to_pending,
            (SELECT mtm.days_to_close FROM market_timing_metrics mtm WHERE mtm.region_id = r.id ORDER BY mtm.date DESC LIMIT 1) as days_to_close,
            (SELECT mhi.heat_index FROM market_heat_index mhi WHERE mhi.region_id = r.id ORDER BY mhi.date DESC LIMIT 1) as heat_index,
            (SELECT am.affordability_ratio FROM affordability_metrics am WHERE am.region_id = r.id ORDER BY am.date DESC LIMIT 1) as affordability_ratio,
            (SELECT MAX(zh.date) FROM zhvi_home_values zh WHERE zh.region_id = r.id) as last_updated
        FROM regions r 
        WHERE EXISTS (SELECT 1 FROM zhvi_home_values zh WHERE zh.region_id = r.id AND zh.zhvi_mid_tier IS NOT NULL)
    "#;

    let mut conditions: Vec<String> = Vec::new();
    let mut bindings: Vec<String> = Vec::new();

    if let Some(ref location) = params.location {
        conditions.push(format!(
            "LOWER(r.region_name) LIKE LOWER(${})",
            bindings.len() + 1
        ));
        bindings.push(format!("%{}%", location));
    }
    if let Some(ref state) = params.state {
        conditions.push(format!("r.state_name = ${}", bindings.len() + 1));
        bindings.push(state.to_uppercase());
    }
    if let Some(ref region_type) = params.region_type {
        conditions.push(format!("r.region_type = ${}", bindings.len() + 1));
        bindings.push(region_type.clone());
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!(" AND {}", conditions.join(" AND "))
    };

    let query_str = format!(
        "{}{} ORDER BY r.region_name LIMIT ${} OFFSET ${}",
        base_query,
        where_clause,
        bindings.len() + 1,
        bindings.len() + 2
    );

    let mut query = sqlx::query_as::<_, RegionMetrics>(&query_str);
    for binding in &bindings {
        query = query.bind(binding);
    }
    query = query.bind(limit).bind(offset);

    let mut results = query.fetch_all(state.db.pool()).await?;

    // Apply numeric filters in memory for direct path
    if let Some(min_heat) = params.heat_index_min {
        results.retain(|r| r.heat_index.is_some_and(|h| h >= min_heat));
    }
    if let Some(min_price) = params.price_min {
        results.retain(|r| r.current_value.is_some_and(|p| p >= min_price));
    }
    if let Some(max_price) = params.price_max {
        results.retain(|r| r.current_value.is_some_and(|p| p <= max_price));
    }

    let count_str = format!("SELECT COUNT(*) FROM regions r WHERE EXISTS (SELECT 1 FROM zhvi_home_values zh WHERE zh.region_id = r.id){}", where_clause);
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_str);
    for binding in &bindings {
        count_query = count_query.bind(binding);
    }
    let total = count_query.fetch_one(state.db.pool()).await.unwrap_or(0);

    Ok(Json(SearchResult {
        total,
        page: offset / limit,
        page_size: limit,
        results,
    }))
}

#[utoipa::path(post, path = "/api/v1/search/advanced", request_body = SearchQuery, responses((status = 200, description = "Advanced search results", body = SearchResult)))]
pub async fn advanced_search(
    State(state): State<Arc<AppState>>,
    Json(params): Json<SearchQuery>,
) -> Result<Json<SearchResult>, AppError> {
    search_properties(State(state), Query(params)).await
}

#[utoipa::path(post, path = "/api/v1/search/geospatial", request_body = GeoSearchQuery, responses((status = 200, description = "Nearby properties", body = Vec<RegionMetrics>)))]
pub async fn geospatial_search(
    State(_state): State<Arc<AppState>>,
    Json(params): Json<GeoSearchQuery>,
) -> Result<Json<Vec<RegionMetrics>>, AppError> {
    params.validate()?;
    Err(AppError::BadRequest(
        "Geospatial search requires PostGIS and geometry data.".to_string(),
    ))
}
