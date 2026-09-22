export interface Region {
  id: number;
  region_name: string;
  state_name: string;
  region_type: string;
  created_at?: string;
  current_value?: number;
  median_list_price?: number;
  median_sale_price?: number;
  inventory?: number;
  new_listings?: number;
  sales_count?: number;
  days_to_pending?: number;
  days_to_close?: number;
  heat_index?: number;
  affordability_ratio?: number;
  last_updated?: string;
}

export interface RegionMetrics {
  region_id: number;
  region_name: string;
  state_name: string;
  region_type?: string;
  current_value?: number | null;
  median_list_price?: number | null;
  median_sale_price?: number| null;
  inventory?: number | null;
  new_listings?: number | null;
  sales_count?: number | null;
  days_to_pending?: number | null;
  days_to_close?: number | null;
  heat_index?: number | null;
  affordability_ratio?: number | null;
  last_updated?: string | null;
}

export interface MarketTrend {
  date: string;
  value: number;
  metric_type: string;
}

export interface SearchQuery {
  state?: string;
  location?: string;
  region_type?: string;
  price_min?: number;
  price_max?: number;
  heat_index_min?: number;
  inventory_min?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  results: RegionMetrics[];
  total: number;
  page: number;
  page_size: number;
}

export interface User {
  id: string | number;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
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
  name?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  context?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export interface MarketTrendData {
  state: string;
  median_sale_price: number;
  heat_index?: number;
  inventory?: number;
}

export interface HeatmapData {
  region_id?: number;
  region_name?: string;
  state?: string;
  heat_index?: number;
  median_sale_price?: number;
  inventory?: number;
  new_listings?: number;
}

export interface PricePredictionRequest {
  region_id: number;
}

export interface PricePredictionResponse {
  predicted_price: number;
  confidence: number;
}

export interface BackendTrendData {
  date: string;
  avg_value: number;
  region_count: number;
}

export interface BackendHeatmapData {
  region_id: number;
  region_name: string;
  state_name: string;
  heat_index: number | null;
  current_value: number | null;
}