#[cfg(test)]
mod embedding_tests {
    use crate::services::embedding::EmbeddingService;

    #[tokio::test]
    async fn test_embedding_service_health() {
        let service = EmbeddingService::new();
        let healthy = service.health_check().await;
        assert!(healthy, "ML service should be running on localhost:8000");
    }

    #[tokio::test]
    async fn test_generate_embedding() {
        let service = EmbeddingService::new();
        
        let text = "Beautiful beachfront property in California";
        let result = service.generate_embedding(text).await;
        
        assert!(result.is_ok(), "Should generate embedding successfully");
        
        let embedding = result.unwrap();
        assert_eq!(embedding.len(), 384, "Should be 384 dimensions");
        
        // Check that values are normalized (for cosine similarity)
        let magnitude: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!((magnitude - 1.0).abs() < 0.01, "Should be normalized");
    }

    #[tokio::test]
    async fn test_embedding_similarity() {
        let service = EmbeddingService::new();
        
        // Similar texts should have similar embeddings
        let emb1 = service.generate_embedding("beach house California").await.unwrap();
        let emb2 = service.generate_embedding("oceanfront property CA").await.unwrap();
        
        // Cosine similarity
        let similarity: f32 = emb1.iter().zip(emb2.iter()).map(|(a, b)| a * b).sum();
        
        assert!(similarity > 0.7, "Similar texts should have high similarity (got {})", similarity);
    }

    #[tokio::test]
    async fn test_embedding_different_texts() {
        let service = EmbeddingService::new();
        
        // Different texts should have different embeddings
        let emb1 = service.generate_embedding("beach house").await.unwrap();
        let emb2 = service.generate_embedding("mountain cabin").await.unwrap();
        
        let similarity: f32 = emb1.iter().zip(emb2.iter()).map(|(a, b)| a * b).sum();
        
        assert!(similarity < 0.9, "Different texts should have lower similarity");
    }
}