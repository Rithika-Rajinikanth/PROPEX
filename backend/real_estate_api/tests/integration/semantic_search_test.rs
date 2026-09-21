#[cfg(test)]
mod semantic_search_tests {
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    async fn setup_test_app() -> Router {
        // Setup test database and app
        let config = Config::from_env().unwrap();
        let db = Database::new(&config.database_url).await.unwrap();
        // ... setup app
        create_router(Arc::new(app_state))
    }

    #[tokio::test]
    async fn test_semantic_search_endpoint() {
        let app = setup_test_app().await;
        
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/v1/search/semantic?q=beach%20house%20California")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        
        assert_eq!(response.status(), StatusCode::OK);
        
        let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
        let results: Vec<RegionMetrics> = serde_json::from_slice(&body).unwrap();
        
        assert!(!results.is_empty(), "Should return results");
        assert!(results.len() <= 20, "Should respect limit");
    }

    #[tokio::test]
    async fn test_semantic_search_relevance() {
        let app = setup_test_app().await;
        
        // Search for "affordable family neighborhoods"
        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/api/v1/search/semantic?q=affordable%20family%20neighborhoods")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        
        let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
        let results: Vec<RegionMetrics> = serde_json::from_slice(&body).unwrap();
        
        // Results should be reasonably priced (not luxury)
        let avg_price: f64 = results.iter()
            .filter_map(|r| r.current_value)
            .sum::<f64>() / results.len() as f64;
        
        assert!(avg_price < 1_000_000.0, "Affordable search should return lower-priced results");
    }
}