// src/lib/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Region,
  RegionMetrics,
  MarketTrend,
  SearchQuery,
  SearchResult,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChatRequest,
  ChatResponse,
  MarketTrendData,
  HeatmapData,
  PricePredictionRequest,
  PricePredictionResponse,
} from '@/types/models';
import type {
  PropXProperty,
  OrderBookDepthResponse,
  CreateOrderRequest,
  OrderResponse,
  PartitionSimulationRequest,
  PartitionSimulationResponse,
  UserPortfolioSummary,
  PropertyAudit,
} from '@/types/propx';

// Empty base URL = relative paths.
// The browser calls /api/v1/... and Next.js middleware proxies it to the
// real backend using the API_URL env var at runtime — works in local dev
// AND any deployed environment without a rebuild.
const API_BASE_PATH = '/api/v1';

// ML service is routed via Next.js middleware /ml/* → ML_URL env var
const ML_BASE_URL = '/ml';

class ApiClient {
  private client: AxiosInstance;
  private mlClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_PATH,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.mlClient = axios.create({
      baseURL: ML_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            await this.refreshToken();
            return this.client.request(error.config!);
          } catch {
            this.logout();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  private logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', credentials);
    this.setToken(data.token);
    this.setRefreshToken(data.refresh_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/register', userData);
    this.setToken(data.token);
    this.setRefreshToken(data.refresh_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async refreshToken(): Promise<void> {
    if (typeof window === 'undefined') return;
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    const { data } = await this.client.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    this.setToken(data.token);
    this.setRefreshToken(data.refresh_token);
  }

  // Regions endpoints
  async getRegions(params?: {
    state?: string;
    region_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<Region[]> {
    const { data } = await this.client.get<Region[]>('/regions', { params });
    return data;
  }

  async getRegion(id: number): Promise<Region> {
    const { data } = await this.client.get<Region>(`/regions/${id}`);
    return data;
  }

  async getRegionMetrics(id: number): Promise<RegionMetrics> {
    const { data } = await this.client.get<RegionMetrics>(`/regions/${id}/metrics`);
    return data;
  }

  async getRegionTrends(
    id: number,
    params?: { metric?: string; months?: number }
  ): Promise<MarketTrend[]> {
    const { data } = await this.client.get<MarketTrend[]>(`/regions/${id}/trends`, { params });
    return data;
  }

  // Search endpoints
  async searchProperties(query: SearchQuery): Promise<SearchResult> {
    const { data } = await this.client.get<SearchResult>('/search', { params: query });
    return data;
  }

  async advancedSearch(query: SearchQuery): Promise<SearchResult> {
    const { data } = await this.client.post<SearchResult>('/search/advanced', query);
    return data;
  }

  async semanticSearch(params: {
    q: string;
    limit?: number;
    state?: string;
  }): Promise<Region[]> {
    const { data } = await this.client.get<Region[]>('/search/semantic', { params });
    return data;
  }

  // Analytics endpoints
  async getMarketTrends(params?: { state?: string; limit?: number }): Promise<MarketTrendData[]> {
    const { data } = await this.client.get<MarketTrendData[]>('/analytics/trends', { params });
    return data;
  }

  async getHeatmap(): Promise<HeatmapData[]> {
    const { data } = await this.client.get<HeatmapData[]>('/analytics/heatmap');
    return data;
  }

  async getAnalyticsSignals(): Promise<any> {
    const { data } = await this.client.get('/analytics/signals');
    return data;
  }

  // AI endpoints
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { data } = await this.client.post<ChatResponse>('/ai/chat', request);
    return data;
  }

  async predictPrice(request: PricePredictionRequest): Promise<PricePredictionResponse> {
    const { data } = await this.client.post<PricePredictionResponse>('/ai/price-predict', request);
    return data;
  }

  // External data endpoints (ML service — proxied via /ml/*)
  async getRedfinData(regionName: string, state: string): Promise<any> {
    const { data } = await this.mlClient.post('/external/redfin', {
      region_name: regionName,
      state: state,
    });
    return data;
  }

  async getCrimeData(state: string): Promise<any> {
    const { data } = await this.mlClient.post('/external/crime', {
      state: state,
    });
    return data;
  }

  async getCombinedExternalData(regionName: string, state: string): Promise<any> {
    const { data } = await this.mlClient.post('/external/combined', {
      region_name: regionName,
      state: state,
    });
    return data;
  }

  async healthCheck(): Promise<any> {
    const { data } = await this.client.get('/health');
    return data;
  }

  // ==========================================================================
  // PropX Liquid Real Estate Exchange Endpoints
  // ==========================================================================

  async getExchangeProperties(): Promise<PropXProperty[]> {
    const { data } = await this.client.get<PropXProperty[]>('/exchange/properties');
    return data;
  }

  async getPropertyDetail(propertyId: string): Promise<PropXProperty> {
    const { data } = await this.client.get<PropXProperty>(`/exchange/properties/${propertyId}`);
    return data;
  }

  async getOrderBookDepth(propertyId: string): Promise<OrderBookDepthResponse> {
    const { data } = await this.client.get<OrderBookDepthResponse>(`/exchange/book/${propertyId}`);
    return data;
  }

  async submitOrder(order: CreateOrderRequest): Promise<OrderResponse> {
    const { data } = await this.client.post<OrderResponse>('/exchange/order', order);
    return data;
  }

  async simulatePartition(request: PartitionSimulationRequest): Promise<PartitionSimulationResponse> {
    const { data } = await this.client.post<PartitionSimulationResponse>('/exchange/simulate-partition', request);
    return data;
  }

  async getUserPortfolio(userId: string): Promise<UserPortfolioSummary> {
    const { data } = await this.client.get<UserPortfolioSummary>(`/exchange/portfolio/${userId}`);
    return data;
  }
}

export const api = new ApiClient();
