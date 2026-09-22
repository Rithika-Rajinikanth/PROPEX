// src/services/rag.rs
// Key fixes applied:
// 1. RagService::new() no longer panics — returns Result instead of unwrapping GROQ_API_KEY
// 2. Model name read from GROQ_MODEL env var (matches Azure config) with hardcoded fallback
// 3. All Groq response accesses use .get(0) / .first() — no more index panics on error responses
// 4. extract_criteria_with_ai checks HTTP status before deserializing
// 5. handle_general_chat and generate_response check HTTP status before deserializing

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::{
    db::Database,
    error::AppError,
    models::{ChatMessage, ChatResponse, RegionMetrics},
    services::embedding::EmbeddingService,
};

#[derive(Deserialize, Debug)]
struct GroqResponse {
    choices: Vec<GroqChoice>,
    // Groq error responses have an "error" field instead of "choices"
    error: Option<GroqError>,
}

#[derive(Deserialize, Debug)]
struct GroqError {
    message: String,
}

#[derive(Deserialize, Debug)]
struct GroqChoice {
    message: GroqMessage,
}

#[derive(Deserialize, Debug)]
struct GroqMessage {
    content: String,
}

pub struct RagService {
    client: Client,
    groq_key: String,
    groq_model: String,
    db: Database,
}

impl RagService {
    /// FIX 1: Returns Result instead of panicking when GROQ_API_KEY is missing.
    /// Callers (routes/ai.rs) should propagate the error via `?`.
    pub fn new(db: Database) -> Result<Self, AppError> {
        let groq_key = std::env::var("GROQ_API_KEY").map_err(|_| {
            AppError::Internal("GROQ_API_KEY environment variable not set".to_string())
        })?;

        if groq_key.is_empty() {
            return Err(AppError::Internal(
                "GROQ_API_KEY is set but empty".to_string(),
            ));
        }

        // FIX 2: Read model from GROQ_MODEL env var (matches Azure container config).
        // Falls back to active Groq openai/gpt-oss-20b so nothing breaks if the var is missing.
        let groq_model =
            std::env::var("GROQ_MODEL").unwrap_or_else(|_| "openai/gpt-oss-20b".to_string());

        tracing::info!("✅ RAG service initialized — model: {}", groq_model);

        Ok(Self {
            client: Client::new(),
            groq_key,
            groq_model,
            db,
        })
    }

    pub async fn process_query(
        &self,
        user_query: &str,
        _context: Option<Vec<ChatMessage>>,
    ) -> anyhow::Result<ChatResponse> {
        tracing::info!("🤖 Processing RAG query: {}", user_query);

        let intent = self.detect_intent(user_query).await?;
        tracing::info!("📊 Detected intent: {:?}", intent);

        match intent {
            QueryIntent::PropertySearch => self.handle_property_search(user_query).await,
            QueryIntent::MarketInfo => self.handle_market_info(user_query).await,
            QueryIntent::General => self.handle_general_chat(user_query).await,
        }
    }

    async fn detect_intent(&self, query: &str) -> anyhow::Result<QueryIntent> {
        let query_lower = query.to_lowercase();

        let property_keywords = [
            "house",
            "home",
            "property",
            "properties",
            "buy",
            "rent",
            "looking for",
            "want",
            "find",
            "search",
            "show me",
            "need",
            "apartment",
            "condo",
            "link",
            "links",
            "details",
            "bedroom",
        ];

        let market_keywords = [
            "market",
            "trend",
            "hottest",
            "investment",
            "hot market",
            "expensive",
            "cheap",
            "affordable",
            "analysis",
            "forecast",
            "prediction",
        ];

        if property_keywords.iter().any(|k| query_lower.contains(k)) {
            Ok(QueryIntent::PropertySearch)
        } else if market_keywords.iter().any(|k| query_lower.contains(k)) {
            Ok(QueryIntent::MarketInfo)
        } else {
            Ok(QueryIntent::General)
        }
    }

    async fn handle_property_search(&self, query: &str) -> anyhow::Result<ChatResponse> {
        tracing::info!("🏠 Handling property search");

        let criteria = self.extract_criteria_with_ai(query).await?;
        tracing::info!("📋 Extracted criteria: {:?}", criteria);

        let results = self.search_with_fallback(&criteria).await?;
        tracing::info!("🔍 Found {} initial results", results.len());

        if !results.is_empty() {
            return Ok(self.format_results(results, query));
        }

        tracing::warn!("❌ No results found, triggering fallback");
        self.intelligent_fallback(&criteria, query).await
    }

    fn extract_criteria_heuristics(&self, query: &str) -> SearchCriteria {
        let q_lower = query.to_lowercase();
        let mut criteria = SearchCriteria::default();
        if q_lower.contains("palm") {
            criteria.location = Some("Palm Jumeirah".to_string());
        } else if q_lower.contains("business bay") {
            criteria.location = Some("Business Bay".to_string());
        } else if q_lower.contains("downtown") {
            criteria.location = Some("Downtown Dubai".to_string());
        } else if q_lower.contains("marina") {
            criteria.location = Some("Dubai Marina".to_string());
        } else if q_lower.contains("burj") {
            criteria.location = Some("Burj Crown".to_string());
        } else if q_lower.contains("opus") {
            criteria.location = Some("The Opus".to_string());
        } else if q_lower.contains("seven palm") {
            criteria.location = Some("Seven Palm".to_string());
        }
        criteria
    }

    async fn extract_criteria_with_ai(&self, query: &str) -> anyhow::Result<SearchCriteria> {
        let mut criteria = self.extract_criteria_heuristics(query);

        let prompt = format!(
            "Extract real estate search criteria from this query: '{}'\n\n\
            Return ONLY valid JSON (no markdown, no backticks, no explanation):\n\
            {{\n\
              \"location\": \"district name like Palm Jumeirah, Downtown Dubai, Business Bay, Dubai Marina or null\",\n\
              \"price_min\": number or null,\n\
              \"price_max\": number or null,\n\
              \"property_type\": \"apartment/villa/hotel_suite/commercial\" or null\n\
            }}\n\n\
            Examples:\n\
            - \"beachfront apartment in Palm Jumeirah\" → {{\"location\":\"Palm Jumeirah\"}}\n\
            - \"commercial spaces in Business Bay or Downtown\" → {{\"location\":\"Business Bay\"}}\n\
            - \"luxury property\" → {{\"price_min\":1000000}}",
            query
        );

        let response = self
            .client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .bearer_auth(&self.groq_key)
            .json(&serde_json::json!({
                "model": self.groq_model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 200
            }))
            .timeout(std::time::Duration::from_secs(15))
            .send()
            .await;

        if let Ok(res) = response {
            if res.status().is_success() {
                if let Ok(data) = res.json::<GroqResponse>().await {
                    if let Some(choice) = data.choices.first() {
                        let json_str = choice
                            .message
                            .content
                            .trim()
                            .trim_start_matches("```json")
                            .trim_start_matches("```")
                            .trim_end_matches("```")
                            .trim();
                        if let Ok(ai_crit) = serde_json::from_str::<SearchCriteria>(json_str) {
                            if ai_crit.location.is_some() {
                                criteria.location = ai_crit.location;
                            }
                            if ai_crit.price_min.is_some() {
                                criteria.price_min = ai_crit.price_min;
                            }
                            if ai_crit.price_max.is_some() {
                                criteria.price_max = ai_crit.price_max;
                            }
                            if ai_crit.property_type.is_some() {
                                criteria.property_type = ai_crit.property_type;
                            }
                        }
                    }
                }
            } else {
                tracing::warn!(
                    "⚠️ Groq criteria extraction unavailable, using heuristic criteria: {:?}",
                    criteria
                );
            }
        }

        Ok(criteria)
    }

    async fn search_with_fallback(
        &self,
        criteria: &SearchCriteria,
    ) -> anyhow::Result<Vec<RegionMetrics>> {
        let has_mv = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mv_search_optimized')",
        )
        .fetch_one(self.db.pool())
        .await
        .unwrap_or(false);

        if !has_mv {
            return self.search_propx_properties(criteria).await;
        }

        let has_embeddings = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS (SELECT 1 FROM mv_search_optimized WHERE embedding IS NOT NULL LIMIT 1)",
        )
        .fetch_one(self.db.pool())
        .await
        .unwrap_or(false);

        if has_embeddings {
            match self.semantic_search(criteria).await {
                Ok(results) if !results.is_empty() => return Ok(results),
                _ => tracing::warn!("Semantic search failed or empty, falling back to SQL"),
            }
        }

        self.sql_filter_search(criteria).await
    }

    async fn search_propx_properties(
        &self,
        criteria: &SearchCriteria,
    ) -> anyhow::Result<Vec<RegionMetrics>> {
        tracing::info!("🔎 Searching PropX properties table directly");

        let mut query_str = String::from(
            "SELECT 
                1::INT4 as region_id,
                title as region_name,
                district as state_name,
                category::TEXT as region_type,
                total_valuation_aed::FLOAT8 as current_value,
                total_valuation_aed::FLOAT8 as median_list_price,
                total_valuation_aed::FLOAT8 as median_sale_price,
                available_shares::INT4 as inventory,
                10::INT4 as new_listings,
                5::INT4 as sales_count,
                14.0::FLOAT8 as days_to_pending,
                30.0::FLOAT8 as days_to_close,
                (projected_net_yield_pct * 10.0)::FLOAT8 as heat_index,
                3.5::FLOAT8 as affordability_ratio,
                CURRENT_DATE as last_updated
             FROM properties
             WHERE status::TEXT = 'verified_active'",
        );

        let mut loc_binding: Option<String> = None;
        if let Some(ref loc) = criteria.location {
            if !loc.trim().is_empty() {
                query_str.push_str(" AND (district ILIKE $1 OR title ILIKE $1)");
                loc_binding = Some(format!("%{}%", loc.trim()));
            }
        }

        query_str.push_str(" ORDER BY projected_net_yield_pct DESC LIMIT 10");

        let mut q = sqlx::query_as::<_, RegionMetrics>(&query_str);
        if let Some(ref loc) = loc_binding {
            q = q.bind(loc);
        }

        let results = q.fetch_all(self.db.pool()).await.unwrap_or_default();
        if results.is_empty() {
            let fallback = sqlx::query_as::<_, RegionMetrics>(
                "SELECT 
                    1::INT4 as region_id,
                    title as region_name,
                    district as state_name,
                    category::TEXT as region_type,
                    total_valuation_aed::FLOAT8 as current_value,
                    total_valuation_aed::FLOAT8 as median_list_price,
                    total_valuation_aed::FLOAT8 as median_sale_price,
                    available_shares::INT4 as inventory,
                    10::INT4 as new_listings,
                    5::INT4 as sales_count,
                    14.0::FLOAT8 as days_to_pending,
                    30.0::FLOAT8 as days_to_close,
                    (projected_net_yield_pct * 10.0)::FLOAT8 as heat_index,
                    3.5::FLOAT8 as affordability_ratio,
                    CURRENT_DATE as last_updated
                 FROM properties
                 WHERE status::TEXT = 'verified_active'
                 ORDER BY projected_net_yield_pct DESC
                 LIMIT 10",
            )
            .fetch_all(self.db.pool())
            .await
            .unwrap_or_default();
            return Ok(fallback);
        }

        Ok(results)
    }

    async fn sql_filter_search(
        &self,
        criteria: &SearchCriteria,
    ) -> anyhow::Result<Vec<RegionMetrics>> {
        tracing::info!("🔎 SQL filter search (no embeddings)");

        let mut query_str = String::from(
            "SELECT region_id, region_name, state_name, region_type, current_value,
                    median_list_price, median_sale_price, inventory, new_listings,
                    sales_count, days_to_pending, days_to_close, heat_index,
                    affordability_ratio, last_updated
             FROM mv_search_optimized
             WHERE current_value IS NOT NULL",
        );

        let mut param_index = 1;

        let state_binding = criteria.location.as_ref().map(|l| l.to_uppercase());
        if state_binding.is_some() {
            query_str.push_str(&format!(" AND state_name = ${}", param_index));
            param_index += 1;
        }

        if criteria.price_min.is_some() {
            query_str.push_str(&format!(" AND current_value >= ${}", param_index));
            param_index += 1;
        }

        if criteria.price_max.is_some() {
            query_str.push_str(&format!(" AND current_value <= ${}", param_index));
        }

        query_str.push_str(" ORDER BY heat_index DESC NULLS LAST LIMIT 10");

        let mut q = sqlx::query_as::<_, RegionMetrics>(&query_str);

        if let Some(ref state) = state_binding {
            q = q.bind(state);
        }
        if let Some(min) = criteria.price_min {
            q = q.bind(min);
        }
        if let Some(max) = criteria.price_max {
            q = q.bind(max);
        }

        let results = q.fetch_all(self.db.pool()).await?;
        tracing::info!("🔎 SQL filter found {} results", results.len());
        Ok(results)
    }

    async fn semantic_search(
        &self,
        criteria: &SearchCriteria,
    ) -> anyhow::Result<Vec<RegionMetrics>> {
        let search_text = format!(
            "{} {} {}",
            criteria.location.as_deref().unwrap_or(""),
            criteria.property_type.as_deref().unwrap_or(""),
            criteria
                .price_max
                .map(|p| format!("under ${}", p))
                .unwrap_or_default()
        );

        tracing::info!("🔎 Semantic search for: {}", search_text);

        let embedding_service = EmbeddingService::new();
        let embedding = embedding_service.generate_embedding(&search_text).await?;

        let embedding_str = format!(
            "[{}]",
            embedding
                .iter()
                .map(|f| f.to_string())
                .collect::<Vec<_>>()
                .join(",")
        );

        let mut query_str = String::from(
            "SELECT region_id, region_name, state_name, region_type, current_value,
                    median_list_price, median_sale_price, inventory, new_listings,
                    sales_count, days_to_pending, days_to_close, heat_index,
                    affordability_ratio, last_updated
             FROM mv_search_optimized
             WHERE embedding IS NOT NULL AND current_value IS NOT NULL",
        );

        let mut param_index = 1;

        let state_binding = criteria.location.as_ref().map(|l| l.to_uppercase());
        if state_binding.is_some() {
            query_str.push_str(&format!(" AND state_name = ${}", param_index));
            param_index += 1;
        }
        if criteria.price_min.is_some() {
            query_str.push_str(&format!(" AND current_value >= ${}", param_index));
            param_index += 1;
        }
        if criteria.price_max.is_some() {
            query_str.push_str(&format!(" AND current_value <= ${}", param_index));
            param_index += 1;
        }

        query_str.push_str(&format!(
            " ORDER BY embedding <=> ${}::vector(384) LIMIT 10",
            param_index
        ));

        let mut q = sqlx::query_as::<_, RegionMetrics>(&query_str);

        if let Some(ref state) = state_binding {
            q = q.bind(state);
        }
        if let Some(min) = criteria.price_min {
            q = q.bind(min);
        }
        if let Some(max) = criteria.price_max {
            q = q.bind(max);
        }
        q = q.bind(&embedding_str);

        Ok(q.fetch_all(self.db.pool()).await?)
    }

    async fn intelligent_fallback(
        &self,
        criteria: &SearchCriteria,
        original_query: &str,
    ) -> anyhow::Result<ChatResponse> {
        tracing::info!("🔄 Attempting intelligent fallback");

        let relaxed_criteria = SearchCriteria {
            price_min: criteria.price_min.map(|p| p * 0.8),
            price_max: criteria.price_max.map(|p| p * 1.2),
            ..criteria.clone()
        };

        let alternatives = self.search_with_fallback(&relaxed_criteria).await?;

        if alternatives.is_empty() {
            return self.suggest_nearby_states(criteria).await;
        }

        let context = format!(
            "User searched for: {}\n\
            No exact matches found. Found these alternatives with slightly adjusted prices:\n{}",
            original_query,
            alternatives
                .iter()
                .take(5)
                .map(|r| format!(
                    "- {} ({}): ${}",
                    r.region_name,
                    r.state_name,
                    r.current_value
                        .map(|v| format!("{:.0}", v))
                        .unwrap_or("N/A".to_string())
                ))
                .collect::<Vec<_>>()
                .join("\n")
        );

        let ai_message = self
            .generate_response(
                &context,
                "Write a friendly 2-3 sentence suggestion mentioning these alternatives. \
                Include that we relaxed the budget slightly to find these options.",
            )
            .await?;

        Ok(ChatResponse {
            message: ai_message,
            suggestions: Some(
                alternatives
                    .iter()
                    .take(3)
                    .map(|a| format!("Explore {} ({})", a.region_name, a.state_name))
                    .collect(),
            ),
        })
    }

    async fn suggest_nearby_states(
        &self,
        criteria: &SearchCriteria,
    ) -> anyhow::Result<ChatResponse> {
        let nearby_map: HashMap<&str, Vec<&str>> = [
            ("CA", vec!["NV", "OR", "AZ"]),
            ("NY", vec!["NJ", "CT", "PA"]),
            ("TX", vec!["LA", "OK", "NM"]),
            ("FL", vec!["GA", "AL"]),
            ("WA", vec!["OR", "ID"]),
            ("IL", vec!["IN", "WI", "IA"]),
            ("MA", vec!["CT", "RI", "NH"]),
            ("PA", vec!["NJ", "NY", "OH"]),
        ]
        .iter()
        .cloned()
        .collect();

        let location = criteria.location.as_deref().unwrap_or("");
        let nearby_states = nearby_map.get(location).cloned().unwrap_or_default();

        let message = if !nearby_states.is_empty() {
            format!(
                "I couldn't find properties matching your exact criteria in {}. \
                Would you like to explore nearby states like {}? \
                They often have similar markets with great opportunities!",
                location,
                nearby_states.join(", ")
            )
        } else {
            "I couldn't find properties matching your criteria. Here are some suggestions:\n\n\
            • Try increasing your budget\n\
            • Expand your location search to neighboring states\n\
            • Consider different property types\n\
            • Adjust your requirements slightly\n\n\
            I'm here to help you find the perfect property!"
                .to_string()
        };

        Ok(ChatResponse {
            message,
            suggestions: Some(
                nearby_states
                    .iter()
                    .map(|s| format!("Search in {}", s))
                    .collect(),
            ),
        })
    }

    async fn generate_response(&self, context: &str, instruction: &str) -> anyhow::Result<String> {
        // FIX 5: Check status before deserializing
        let response = self
            .client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .bearer_auth(&self.groq_key)
            .json(&serde_json::json!({
                "model": self.groq_model,
                "messages": [
                    {"role": "system", "content": "You are a helpful real estate assistant."},
                    {"role": "user", "content": format!("{}\n\n{}", context, instruction)}
                ],
                "temperature": 0.7,
                "max_tokens": 300
            }))
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            tracing::warn!("⚠️ Groq generate_response non-success ({}, {}) — activating deterministic fallback", status, body);
            return Ok(format!(
                "Here is the verified market intelligence summary:\n\n{}",
                context
            ));
        }

        let data: GroqResponse = response.json().await.unwrap_or(GroqResponse {
            choices: vec![],
            error: None,
        });

        match data.choices.first() {
            Some(choice) => Ok(choice.message.content.clone()),
            None => {
                tracing::warn!("⚠️ Groq returned no choices — using formatted context");
                Ok(format!("Verified real estate telemetry:\n\n{}", context))
            }
        }
    }

    fn format_results(&self, results: Vec<RegionMetrics>, _query: &str) -> ChatResponse {
        let listings = results
            .iter()
            .take(5)
            .map(|r| {
                format!(
                    "**{}** ({}) — AED {} | Net Yield: {:.1}% | Available Shares: {} | Asset ID: /regions/{}",
                    r.region_name,
                    r.state_name,
                    r.current_value
                        .map(|v| format!("{:.0}", v))
                        .unwrap_or("N/A".to_string()),
                    r.heat_index.map(|h| h / 10.0).unwrap_or(8.0),
                    r.inventory.unwrap_or(0),
                    r.region_id
                )
            })
            .collect::<Vec<_>>()
            .join("\n\n");

        ChatResponse {
            message: format!(
                "Found **{}** verified Dubai properties matching your search criteria:\n\n{}",
                results.len(),
                listings
            ),
            suggestions: Some(vec![
                "Show order book for this property".to_string(),
                "Calculate partition rental yield".to_string(),
                "Compare rental yields across districts".to_string(),
            ]),
        }
    }

    async fn handle_market_info(&self, query: &str) -> anyhow::Result<ChatResponse> {
        let has_mv = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mv_search_optimized')",
        )
        .fetch_one(self.db.pool())
        .await
        .unwrap_or(false);

        let trends = if has_mv {
            sqlx::query_as::<_, (Option<String>, Option<f64>, Option<f64>)>(
                "SELECT state_name, AVG(current_value) as avg_value, AVG(heat_index) as avg_heat
                 FROM mv_search_optimized
                 WHERE current_value IS NOT NULL
                 GROUP BY state_name
                 ORDER BY avg_heat DESC NULLS LAST
                 LIMIT 5",
            )
            .fetch_all(self.db.pool())
            .await
            .unwrap_or_default()
        } else {
            sqlx::query_as::<_, (Option<String>, Option<f64>, Option<f64>)>(
                "SELECT district as state_name, AVG(total_valuation_aed)::FLOAT8 as avg_value, AVG(projected_net_yield_pct * 10.0)::FLOAT8 as avg_heat
                 FROM properties
                 WHERE status = 'verified_active'
                 GROUP BY district
                 ORDER BY avg_heat DESC NULLS LAST
                 LIMIT 5"
            )
            .fetch_all(self.db.pool())
            .await
            .unwrap_or_default()
        };

        let context = format!(
            "User asked: {}\n\nTop 5 hottest markets by heat index:\n{}",
            query,
            trends
                .iter()
                .map(|t| format!(
                    "{}: Average ${:.0} (Heat Index: {:.1})",
                    t.0.as_deref().unwrap_or("Unknown"),
                    t.1.unwrap_or(0.0),
                    t.2.unwrap_or(0.0)
                ))
                .collect::<Vec<_>>()
                .join("\n")
        );

        let response = self
            .generate_response(
                &context,
                "Answer the user's question about market trends based on this data. \
                Be informative and helpful.",
            )
            .await?;

        Ok(ChatResponse {
            message: response,
            suggestions: Some(vec![
                "Tell me about California market".to_string(),
                "Compare top markets".to_string(),
                "Show market trends".to_string(),
            ]),
        })
    }

    async fn handle_general_chat(&self, query: &str) -> anyhow::Result<ChatResponse> {
        tracing::info!("💬 Handling general chat");

        // FIX 7: Check status before deserializing
        let response = self
            .client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .bearer_auth(&self.groq_key)
            .json(&serde_json::json!({
                "model": self.groq_model,
                "messages": [
                    {"role": "system", "content": "You are a helpful and friendly real estate assistant. Be conversational and helpful."},
                    {"role": "user", "content": query}
                ],
                "temperature": 0.7,
                "max_tokens": 300
            }))
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            tracing::warn!(
                "⚠️ Groq general chat status {} — activating PropX Dubai fallback",
                status
            );
            return Ok(ChatResponse {
                message: "Welcome to PropX Dubai Real Estate Exchange. You can search verified properties across Palm Jumeirah, Downtown, and Business Bay, view real-time CLOB order books, calculate drywall partitioning yields, and review DLD-backed tokenized assets.".to_string(),
                suggestions: Some(vec![
                    "Show properties in Palm Jumeirah".to_string(),
                    "Explore Downtown luxury suites".to_string(),
                    "Market analysis and yields".to_string(),
                ]),
            });
        }

        let data: GroqResponse = response.json().await.unwrap_or(GroqResponse {
            choices: vec![],
            error: None,
        });

        let reply = match data.choices.first() {
            Some(c) => c.message.content.clone(),
            None => {
                "Welcome to PropX Dubai. Search verified properties or check real-time order books."
                    .to_string()
            }
        };

        Ok(ChatResponse {
            message: reply,
            suggestions: Some(vec![
                "Search for properties".to_string(),
                "Market analysis".to_string(),
            ]),
        })
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SearchCriteria {
    pub location: Option<String>,
    pub price_min: Option<f64>,
    pub price_max: Option<f64>,
    pub property_type: Option<String>,
}

#[derive(Debug)]
enum QueryIntent {
    PropertySearch,
    MarketInfo,
    General,
}
