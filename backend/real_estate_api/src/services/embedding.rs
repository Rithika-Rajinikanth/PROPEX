// src/services/embedding.rs
// Service to call ML service for embeddings

use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct EmbeddingRequest {
    text: String,
}

#[derive(Deserialize)]
pub struct EmbeddingResponse {
    pub embedding: Vec<f32>,
    pub dimensions: usize,
    pub model: String,
}

pub struct EmbeddingService {
    client: Client,
    ml_service_url: String,
}

impl EmbeddingService {
    pub fn new() -> Self {
        let ml_service_url = std::env::var("ML_SERVICE_URL")
            .unwrap_or_else(|_| "http://localhost:8000".to_string());
        
        tracing::info!("🔌 Embedding service connected to: {}", ml_service_url);
        
        Self {
            client: Client::new(),
            ml_service_url,
        }
    }
    
    /// Generate embedding for a single text
    pub async fn generate_embedding(&self, text: &str) -> anyhow::Result<Vec<f32>> {
        tracing::debug!("Generating embedding for: {}", &text[..text.len().min(50)]);
        
        let response = self.client
            .post(format!("{}/embed", self.ml_service_url))
            .json(&EmbeddingRequest {
                text: text.to_string(),
            })
            .timeout(std::time::Duration::from_secs(10))
            .send()
            .await?;
        
        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!(
                "ML service error {}: {}", 
                status, 
                error_text
            ));
        }
        
        let data: EmbeddingResponse = response.json().await?;
        
        tracing::debug!("✅ Generated {}-dimensional embedding", data.dimensions);
        
        Ok(data.embedding)
    }
    
    /// Check if ML service is available
    pub async fn health_check(&self) -> bool {
        match self.client
            .get(format!("{}/health", self.ml_service_url))
            .timeout(std::time::Duration::from_secs(5))
            .send()
            .await
        {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }
}

impl Default for EmbeddingService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_embedding_service() {
        let service = EmbeddingService::new();
        
        // Test health check
        let healthy = service.health_check().await;
        assert!(healthy, "ML service should be running");
        
        // Test embedding generation
        let embedding = service.generate_embedding("test property").await;
        assert!(embedding.is_ok(), "Should generate embedding");
        
        let emb = embedding.unwrap();
        assert_eq!(emb.len(), 384, "Should be 384 dimensions");
    }
}