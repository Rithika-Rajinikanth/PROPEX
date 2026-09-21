#[cfg(test)]
mod rag_tests {
    use crate::services::rag::RagService;
    use crate::db::Database;

    #[tokio::test]
    async fn test_intent_detection() {
        let db = setup_test_db().await;
        let service = RagService::new(db);
        
        // Property search intent
        let intent = service.detect_intent("I want a house in California").await.unwrap();
        assert!(matches!(intent, QueryIntent::PropertySearch));
        
        // Market info intent
        let intent = service.detect_intent("What are the market trends?").await.unwrap();
        assert!(matches!(intent, QueryIntent::MarketInfo));
        
        // General chat intent
        let intent = service.detect_intent("Hello, how are you?").await.unwrap();
        assert!(matches!(intent, QueryIntent::General));
    }

    #[tokio::test]
    async fn test_criteria_extraction() {
        let db = setup_test_db().await;
        let service = RagService::new(db);
        
        let criteria = service.extract_criteria_with_ai(
            "I want a house in California under $500k"
        ).await.unwrap();
        
        assert_eq!(criteria.location, Some("California".to_string()));
        assert_eq!(criteria.price_max, Some(500000.0));
    }

    #[tokio::test]
    async fn test_fallback_logic() {
        let db = setup_test_db().await;
        let service = RagService::new(db);
        
        // Search for something that doesn't exist
        let response = service.process_query(
            "houses in Antarctica", None
        ).await.unwrap();
        
        // Should provide alternatives
        assert!(response.message.contains("nearby") || 
                response.message.contains("alternative"));
        assert!(response.suggestions.is_some());
    }
}