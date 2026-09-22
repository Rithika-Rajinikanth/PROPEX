// src/services/external_data.rs
// Fetch external data from ML service

use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ExternalDataRequest {
    region_name: String,
    state: String,
}

#[derive(Debug, Deserialize)]
pub struct ExternalDataResponse {
    pub status: String,
    pub data: Option<ExternalData>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ExternalData {
    pub redfin: Option<RedfinData>,
    pub crime: Option<CrimeData>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct RedfinData {
    pub median_sale_price: Option<f64>,
    pub median_dom: Option<f64>,
    pub inventory: Option<i32>,
    pub source: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CrimeData {
    pub violent_crime: i32,
    pub property_crime: i32,
    pub source: String,
}

pub struct ExternalDataService {
    client: Client,
    ml_service_url: String,
}

impl ExternalDataService {
    pub fn new() -> Self {
        let ml_service_url =
            std::env::var("ML_SERVICE_URL").unwrap_or_else(|_| "http://localhost:8000".to_string());

        tracing::info!("🔌 External data service: {}", ml_service_url);

        Self {
            client: Client::new(),
            ml_service_url,
        }
    }

    /// Fetch combined external data
    pub async fn get_combined_data(
        &self,
        region_name: &str,
        state: &str,
    ) -> anyhow::Result<ExternalData> {
        tracing::debug!("Fetching external data for {} {}", region_name, state);

        let response = self
            .client
            .post(format!("{}/external/combined", self.ml_service_url))
            .json(&ExternalDataRequest {
                region_name: region_name.to_string(),
                state: state.to_string(),
            })
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("External API error: {}", response.status()));
        }

        let data: ExternalDataResponse = response.json().await?;

        data.data
            .ok_or_else(|| anyhow::anyhow!("No external data available"))
    }

    /// Fetch only Redfin data
    pub async fn get_redfin_data(
        &self,
        region_name: &str,
        state: &str,
    ) -> anyhow::Result<RedfinData> {
        let response = self
            .client
            .post(format!("{}/external/redfin", self.ml_service_url))
            .json(&ExternalDataRequest {
                region_name: region_name.to_string(),
                state: state.to_string(),
            })
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await?;

        #[derive(Deserialize)]
        struct Response {
            status: String,
            data: Option<RedfinData>,
        }

        let data: Response = response.json().await?;

        data.data
            .ok_or_else(|| anyhow::anyhow!("No Redfin data available"))
    }
}

impl Default for ExternalDataService {
    fn default() -> Self {
        Self::new()
    }
}
