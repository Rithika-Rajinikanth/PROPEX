use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;

pub mod queries;

#[derive(Clone)]
pub struct Database {
    pool: PgPool,
}

impl Database {
    pub async fn new(database_url: &str) -> anyhow::Result<Self> {
        let pool = PgPoolOptions::new()
            .max_connections(20)
            .acquire_timeout(Duration::from_secs(30))
            .connect(database_url)
            .await?;

        // Run migrations
        //sqlx::migrate!("./migrations").run(&pool).await?;

        tracing::info!("✅ Database connection established");

        Ok(Self { pool })
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    // Health check
    pub async fn ping(&self) -> anyhow::Result<()> {
        sqlx::query("SELECT 1").fetch_one(&self.pool).await?;
        Ok(())
    }
}

// Query builders for complex searches
pub struct SearchQueryBuilder {
    base_query: String,
    conditions: Vec<String>,
    params: Vec<String>,
    limit: Option<i64>,
    offset: Option<i64>,
}

impl SearchQueryBuilder {
    pub fn new() -> Self {
        Self {
            base_query: String::from(
                r#"
                SELECT DISTINCT ON (r.id)
                    r.id,
                    r.region_name,
                    r.state_name,
                    zh.zhvi_mid_tier as current_value,
                    sl.median_list_price,
                    sl.inventory,
                    sm.median_sale_price,
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
            ),
            conditions: Vec::new(),
            params: Vec::new(),
            limit: None,
            offset: None,
        }
    }

    pub fn state(mut self, state: &str) -> Self {
        self.conditions.push(format!("AND r.state_name ILIKE '%{}%'", state));
        self
    }

    pub fn region_name(mut self, name: &str) -> Self {
        self.conditions.push(format!("AND r.region_name ILIKE '%{}%'", name));
        self
    }

    pub fn price_min(mut self, min: f64) -> Self {
        self.conditions.push(format!("AND zh.zhvi_mid_tier >= {}", min));
        self
    }

    pub fn price_max(mut self, max: f64) -> Self {
        self.conditions.push(format!("AND zh.zhvi_mid_tier <= {}", max));
        self
    }

    pub fn heat_index_min(mut self, min: f64) -> Self {
        self.conditions.push(format!("AND mh.heat_index >= {}", min));
        self
    }

    pub fn limit(mut self, limit: i64) -> Self {
        self.limit = Some(limit);
        self
    }

    pub fn offset(mut self, offset: i64) -> Self {
        self.offset = Some(offset);
        self
    }

    pub fn build(self) -> String {
        let mut query = self.base_query;
        
        for condition in self.conditions {
            query.push_str(&format!(" {}", condition));
        }

        query.push_str(" ORDER BY r.id, zh.date DESC NULLS LAST");

        if let Some(limit) = self.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        if let Some(offset) = self.offset {
            query.push_str(&format!(" OFFSET {}", offset));
        }

        query
    }
}

impl Default for SearchQueryBuilder {
    fn default() -> Self {
        Self::new()
    }
}