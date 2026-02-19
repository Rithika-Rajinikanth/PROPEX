use crate::models::{ChatMessage, ChatResponse, PricePredictionResponse};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
struct OpenAIChatResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Deserialize, Debug)]
struct ChatChoice {
    message: ChatMessageResponse,
}

#[derive(Deserialize, Debug)]
struct ChatMessageResponse {
    content: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MLRequest {
    pub region_id: i32,
    pub historical_prices: Vec<f64>,
    pub months_ahead: i32,
}

pub struct AiService {
    client: Client,
    api_key: String,
    api_url: String,
    model: String,
    ml_service_url: String,
}

impl AiService {
    pub fn new() -> Self {
        // Try Groq first, fallback to OpenAI, then mock
        let (api_key, api_url, model) = if let Ok(groq_key) = std::env::var("GROQ_API_KEY") {
            (groq_key, "https://api.groq.com/openai/v1/chat/completions".to_string(), "llama-3.3-70b-versatile".to_string())
        } else if let Ok(openai_key) = std::env::var("OPENAI_API_KEY") {
            (openai_key, "https://api.openai.com/v1/chat/completions".to_string(), "gpt-4o-mini".to_string())
        } else {
            ("mock-key".to_string(), String::new(), String::new())
        };

        let ml_service_url = std::env::var("ML_SERVICE_URL")
            .unwrap_or_else(|_| "http://localhost:8000".to_string());

        Self {
            client: Client::new(),
            api_key,
            api_url,
            model,
            ml_service_url,
        }
    }

    pub async fn process_chat(
        &self,
        _user_id: &i32,
        message: &str,
        context: Option<Vec<ChatMessage>>,
    ) -> anyhow::Result<ChatResponse> {
        if self.api_key == "mock-key" || self.api_key.is_empty() {
            tracing::warn!("No API key set, returning mock response");
            return Ok(ChatResponse {
                message: format!(
                    "I received your message: '{}'. However, AI chat is not configured. \
                    Please set GROQ_API_KEY or OPENAI_API_KEY environment variable.",
                    message
                ),
                suggestions: Some(self.generate_suggestions()),
            });
        }

        let mut messages = vec![serde_json::json!({"role": "system", "content": "You are a helpful real estate assistant."})];
        if let Some(history) = context {
            for msg in history {
                messages.push(serde_json::json!({"role": msg.role, "content": msg.content}));
            }
        }
        messages.push(serde_json::json!({"role": "user", "content": message}));

        let response = self.client.post(&self.api_url).bearer_auth(&self.api_key)
            .json(&serde_json::json!({"model": self.model, "messages": messages, "temperature": 0.7, "max_tokens": 500}))
            .timeout(std::time::Duration::from_secs(30)).send().await?;

        if !response.status().is_success() {
            return Ok(ChatResponse {
                message: format!("AI service temporarily unavailable."),
                suggestions: Some(self.generate_suggestions()),
            });
        }

        let ai_response: OpenAIChatResponse = response.json().await?;
        let reply = ai_response.choices.first().map(|c| c.message.content.clone())
            .unwrap_or_else(|| "Unable to generate response.".to_string());

        Ok(ChatResponse { message: reply, suggestions: Some(self.generate_suggestions()) })
    }

    pub async fn predict_price(&self, region_id: i32, historical_prices: Vec<f64>, months_ahead: i32) 
        -> anyhow::Result<PricePredictionResponse> {
        if historical_prices.len() < 2 {
            return Err(anyhow::anyhow!("At least 2 historical prices required"));
        }
        let response = self.client.post(format!("{}/predict", self.ml_service_url))
            .json(&MLRequest { region_id, historical_prices, months_ahead })
            .timeout(std::time::Duration::from_secs(30)).send().await?;
        Ok(response.json().await?)
    }

    fn generate_suggestions(&self) -> Vec<String> {
        vec!["Show me properties in California".to_string(), "What are the market trends?".to_string()]
    }
}

impl Default for AiService {
    fn default() -> Self {
        Self::new()
    }
}