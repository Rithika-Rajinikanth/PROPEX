-- Drop blocking view
DROP VIEW IF EXISTS market_overview CASCADE;

-- Drop existing materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_search_optimized CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_region_latest_metrics CASCADE;

-- Create materialized view with FLOAT8 casts (Rust f64 compatible)
CREATE MATERIALIZED VIEW mv_region_latest_metrics AS
SELECT 
    r.id as region_id,
    r.region_name,
    r.state_name,
    r.region_type,
    (SELECT zhvi_mid_tier::FLOAT8 FROM zhvi_home_values WHERE region_id = r.id AND zhvi_mid_tier IS NOT NULL ORDER BY date DESC LIMIT 1) as current_value,
    (SELECT median_list_price::FLOAT8 FROM for_sale_listings WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as median_list_price,
    (SELECT inventory::INTEGER FROM for_sale_listings WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as inventory,
    (SELECT new_listings::INTEGER FROM for_sale_listings WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as new_listings,
    (SELECT median_sale_price::FLOAT8 FROM sales_metrics WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as median_sale_price,
    (SELECT sales_count::INTEGER FROM sales_metrics WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as sales_count,
    (SELECT days_to_pending::FLOAT8 FROM market_timing_metrics WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as days_to_pending,
    (SELECT days_to_close::FLOAT8 FROM market_timing_metrics WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as days_to_close,
    (SELECT heat_index::FLOAT8 FROM market_heat_index WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as heat_index,
    (SELECT affordability_ratio::FLOAT8 FROM affordability_metrics WHERE region_id = r.id ORDER BY date DESC LIMIT 1) as affordability_ratio,
    GREATEST(
        COALESCE((SELECT MAX(date) FROM zhvi_home_values WHERE region_id = r.id), '1900-01-01'::date),
        COALESCE((SELECT MAX(date) FROM for_sale_listings WHERE region_id = r.id), '1900-01-01'::date)
    ) as last_updated
FROM regions r;

-- Indexes
CREATE INDEX idx_mv_metrics_id ON mv_region_latest_metrics(region_id);
CREATE INDEX idx_mv_metrics_state ON mv_region_latest_metrics(state_name);

-- Search view
CREATE MATERIALIZED VIEW mv_search_optimized AS
SELECT * FROM mv_region_latest_metrics WHERE current_value IS NOT NULL OR median_list_price IS NOT NULL;

CREATE INDEX idx_mv_search_state ON mv_search_optimized(state_name);

-- Refresh
REFRESH MATERIALIZED VIEW mv_region_latest_metrics;
REFRESH MATERIALIZED VIEW mv_search_optimized;

-- Verify
SELECT COUNT(*) as total FROM mv_region_latest_metrics;