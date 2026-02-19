export interface Region {
  id: number;
  region_name: string;
  region_type: string;
  state_name: string;
  created_at: string;
}

export interface RegionMetrics {
  region_id: number;
  region_name: string;
  state_name: string;
  current_value: number | null;
  median_list_price: number | null;
  median_sale_price: number | null;
  inventory: number | null;
  new_listings: number | null;
  sales_count: number | null;
  days_to_pending: number | null;
  days_to_close: number | null;
  heat_index: number | null;
  affordability_ratio: number | null;
  last_updated: string | null;
}

export interface MarketTrend {
  date: string;
  value: number;
  metric_type: string;
}

export interface SearchQuery {
  location?: string;
  state?: string;
  region_type?: string;
  price_min?: number;
  price_max?: number;
  heat_index_min?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  total: number;
  page: number;
  page_size: number;
  results: RegionMetrics[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  preferences: any;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  context?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export interface MarketTrendData {
  date: string;
  avg_value: number;
  region_count: number;
}

export interface HeatmapData {
  region_id: number;
  region_name: string;
  state_name: string;
  heat_index: number | null;
  current_value: number | null;
}

export interface PricePredictionRequest {
  region_id: number;
  months_ahead?: number;
}

export interface PricePredictionResponse {
  region_id: number;
  current_price: number | null;
  predicted_price: number | null;
  confidence: number;
  factors: string[];
}