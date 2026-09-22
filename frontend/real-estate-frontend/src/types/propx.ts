// src/types/propx.ts
// Domain types for PropX Dubai: Liquid Real Estate & Asset Exchange

export type AssetCategory =
  | 'Residential'
  | 'Commercial'
  | 'HotelHospitality'
  | 'Industrial'
  | 'FractionalPartition';

export type AssetLifecycle =
  | 'Draft'
  | 'AuditPending'
  | 'AuditApproved'
  | 'TradingActive'
  | 'Delisted';

export type UserRole =
  | 'Investor'
  | 'LandlordOwner'
  | 'HotelOperator'
  | 'InstitutionalDeveloper'
  | 'Auditor';

export type KycTier = 'Tier0Unverified' | 'Tier1Basic' | 'Tier2Verified' | 'Tier3Accredited';

export type OrderDirection = 'Buy' | 'Sell';

export type OrderState =
  | 'Open'
  | 'PartiallyFilled'
  | 'Filled'
  | 'Cancelled'
  | 'Expired';

export type AuditVerdict = 'Pending' | 'Passed' | 'Flagged' | 'Rejected';

export interface PropXProperty {
  id: string;
  issuer_id: string;
  title: string;
  description: string | null;
  category: AssetCategory;
  status: AssetLifecycle;
  makani_number: string;
  plot_number: string;
  unit_number: string;
  building_name: string;
  district: string;
  total_valuation_aed: number;
  total_shares: number;
  available_shares: number;
  initial_share_price_aed: number;
  annual_gross_rent_aed: number;
  service_charge_per_sqft_aed: number;
  projected_net_yield_pct: number;
  property_type?: string;
  share_price_aed?: number;
  rental_yield_pct?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  splat_url?: string;
}

export interface PropertyAudit {
  id: string;
  property_id: string;
  deed_file_url: string;
  raw_ocr_text?: string;
  ocr_owner_name?: string;
  ocr_national_id?: string;
  ocr_makani?: string;
  name_levenshtein_similarity: number;
  dld_registry_verified: boolean;
  active_mortgage_detected: boolean;
  bank_noc_verified: boolean;
  duplicate_listing_attempt: boolean;
  overall_risk_score: number;
  verdict: AuditVerdict;
  audit_notes?: string;
  audited_at: string;
}

export interface OrderBookDepthLevel {
  price_aed: number;
  total_shares: number;
  order_count: number;
}

export interface OrderBookDepthResponse {
  property_id: string;
  bids: OrderBookDepthLevel[];
  asks: OrderBookDepthLevel[];
  spread_aed: number | null;
  last_traded_price_aed: number | null;
}

export interface CreateOrderRequest {
  property_id: string;
  direction: OrderDirection;
  quantity: number;
  price_per_share_aed: number;
}

export interface TradeExecutionSummary {
  trade_id: string;
  shares: number;
  price_aed: number;
  total_aed: number;
}

export interface OrderResponse {
  order_id: string;
  status: OrderState;
  executed_trades: TradeExecutionSummary[];
  remaining_quantity: number;
}

export interface PartitionSimulationRequest {
  property_id: string;
  additional_partitions: number;
  average_partition_rent_aed?: number;
}

export interface PartitionSimulationResponse {
  property_id: string;
  current_gross_annual_rent_aed: number;
  simulated_gross_annual_rent_aed: number;
  yield_increase_pct: number;
  estimated_renovation_cost_aed: number;
  payback_period_months: number;
}

export interface UserHoldingDetail {
  property_id: string;
  title: string;
  district: string;
  shares_count: number;
  cost_basis_aed: number;
  current_market_price_aed: number;
  unrealized_pnl_aed: number;
  unrealized_pnl_pct: number;
  projected_annual_dividend_aed: number;
}

export interface UserPortfolioSummary {
  user_id: string;
  wallet_balance_aed: number;
  total_portfolio_value_aed: number;
  total_shares_owned: number;
  holdings: UserHoldingDetail[];
}

export interface OrderBookWsMessage {
  type: 'depth_update' | 'trade_executed' | 'heartbeat';
  property_id: string;
  bids?: OrderBookDepthLevel[];
  asks?: OrderBookDepthLevel[];
  last_traded_price_aed?: number;
  trade?: TradeExecutionSummary;
  timestamp?: string;
}
