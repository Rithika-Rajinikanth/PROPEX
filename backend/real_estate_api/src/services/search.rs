use crate::models::SearchQuery;

pub struct SearchService;

impl SearchService {
    pub fn new() -> Self {
        Self
    }

    pub async fn search(&self, _query: &SearchQuery) -> anyhow::Result<Vec<i32>> {
        // Stub implementation
        Ok(vec![])
    }
}