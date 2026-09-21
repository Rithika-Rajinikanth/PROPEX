// src/models/propx.rs
// PropX Dubai Liquid Real Estate & Asset Exchange Data Models

use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

// ============================================================================
// ENUMS
// ============================================================================

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    Investor,
    Owner,
    Institutional,
    Admin,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "kyc_tier", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum KycTier {
    Tier0Anonymous,
    Tier1IdentityVerified,
    Tier2AccreditedInvestor,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "asset_category", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AssetCategory {
    ResidentialApartment,
    LuxuryVilla,
    HotelSuite,
    CommercialFloor,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "asset_lifecycle", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AssetLifecycle {
    Draft,
    Auditing,
    VerifiedActive,
    TradingHalted,
    Delisted,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "audit_result", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AuditResult {
    Approved,
    FlaggedInvestigation,
    RejectedFraudulent,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "splat_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum SplatStatus {
    Queued,
    Processing,
    Completed,
    Failed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "order_direction", rename_all = "lowercase")]
pub enum OrderDirection {
    #[serde(rename = "buy", alias = "Buy", alias = "BUY")]
    Buy,
    #[serde(rename = "sell", alias = "Sell", alias = "SELL")]
    Sell,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "order_state", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum OrderState {
    Open,
    Partial,
    Filled,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "escrow_state", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum EscrowState {
    Initiated,
    Funded,
    ConditionsMet,
    Disbursed,
    CancelledRefunded,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, utoipa::ToSchema)]
#[sqlx(type_name = "emi_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum EmiStatus {
    Applied,
    Approved,
    Active,
    Completed,
    Defaulted,
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct PropXUser {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub full_name: String,
    pub phone_number: Option<String>,
    pub roles: Vec<UserRole>,
    pub kyc_level: KycTier,
    pub wallet_balance_aed: Decimal,
    pub locked_escrow_aed: Decimal,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct Property {
    pub id: Uuid,
    pub issuer_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub category: AssetCategory,
    pub status: AssetLifecycle,
    pub makani_number: String,
    pub plot_number: String,
    pub unit_number: String,
    pub building_name: String,
    pub district: String,
    pub total_valuation_aed: Decimal,
    pub total_shares: i32,
    pub available_shares: i32,
    pub initial_share_price_aed: Decimal,
    pub annual_gross_rent_aed: Decimal,
    pub service_charge_per_sqft_aed: Decimal,
    pub projected_net_yield_pct: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct PropertyAudit {
    pub id: Uuid,
    pub property_id: Uuid,
    pub deed_file_url: String,
    pub raw_ocr_text: Option<String>,
    pub ocr_owner_name: Option<String>,
    pub ocr_national_id: Option<String>,
    pub ocr_makani: Option<String>,
    pub name_levenshtein_similarity: Decimal,
    pub dld_registry_verified: bool,
    pub active_mortgage_detected: bool,
    pub bank_noc_verified: bool,
    pub duplicate_listing_attempt: bool,
    pub overall_risk_score: i32,
    pub verdict: AuditResult,
    pub audit_notes: Option<String>,
    pub audited_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct PropertyShare {
    pub id: Uuid,
    pub property_id: Uuid,
    pub user_id: Uuid,
    pub shares_count: i32,
    pub cost_basis_per_share_aed: Decimal,
    pub acquired_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct OrderBookEntry {
    pub id: Uuid,
    pub property_id: Uuid,
    pub user_id: Uuid,
    pub direction: OrderDirection,
    pub quantity: i32,
    pub filled_quantity: i32,
    pub price_per_share_aed: Decimal,
    pub status: OrderState,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct TradeExecution {
    pub id: Uuid,
    pub property_id: Uuid,
    pub buy_order_id: Uuid,
    pub sell_order_id: Uuid,
    pub buyer_id: Uuid,
    pub seller_id: Uuid,
    pub shares_traded: i32,
    pub price_per_share_aed: Decimal,
    pub total_amount_aed: Decimal,
    pub platform_fee_aed: Decimal,
    pub previous_trade_hash: Option<String>,
    pub current_trade_hash: String,
    pub executed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct DirectEscrow {
    pub id: Uuid,
    pub property_id: Uuid,
    pub buyer_id: Uuid,
    pub seller_id: Uuid,
    pub agreed_price_aed: Decimal,
    pub deposit_amount_aed: Decimal,
    pub status: EscrowState,
    pub buyer_signed_at: Option<DateTime<Utc>>,
    pub seller_signed_at: Option<DateTime<Utc>>,
    pub dld_transfer_reference: Option<String>,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct DividendDistribution {
    pub id: Uuid,
    pub property_id: Uuid,
    pub period_start: chrono::NaiveDate,
    pub period_end: chrono::NaiveDate,
    pub gross_rent_collected_aed: Decimal,
    pub service_maintenance_fees_aed: Decimal,
    pub net_rent_distributed_aed: Decimal,
    pub dividend_per_share_aed: Decimal,
    pub distributed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
pub struct EmiPlan {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub property_id: Uuid,
    pub total_financed_amount_aed: Decimal,
    pub downpayment_amount_aed: Decimal,
    pub monthly_installment_aed: Decimal,
    pub tenor_months: i32,
    pub months_paid: i32,
    pub interest_rate_pct: Decimal,
    pub status: EmiStatus,
    pub auditor_solvency_score: i32,
    pub created_at: DateTime<Utc>,
}

// ============================================================================
// REQUEST & RESPONSE DTOS
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct CreateOrderRequest {
    pub property_id: Uuid,
    pub direction: OrderDirection,
    #[validate(range(min = 1, max = 10000))]
    pub quantity: i32,
    pub price_per_share_aed: Decimal,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct OrderResponse {
    pub order_id: Uuid,
    pub status: OrderState,
    pub executed_trades: Vec<TradeExecutionSummary>,
    pub remaining_quantity: i32,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct TradeExecutionSummary {
    pub trade_id: Uuid,
    pub shares: i32,
    pub price_aed: Decimal,
    pub total_aed: Decimal,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct OrderBookDepthLevel {
    pub price_aed: Decimal,
    pub total_shares: i32,
    pub order_count: i32,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct OrderBookDepthResponse {
    pub property_id: Uuid,
    pub bids: Vec<OrderBookDepthLevel>,
    pub asks: Vec<OrderBookDepthLevel>,
    pub spread_aed: Option<Decimal>,
    pub last_traded_price_aed: Option<Decimal>,
}

#[derive(Debug, Serialize, Deserialize, Validate, utoipa::ToSchema)]
pub struct PartitionSimulationRequest {
    pub property_id: Uuid,
    #[validate(range(min = 1, max = 6))]
    pub additional_partitions: i32,
    pub average_partition_rent_aed: Option<Decimal>,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct PartitionSimulationResponse {
    pub property_id: Uuid,
    pub current_gross_annual_rent_aed: Decimal,
    pub simulated_gross_annual_rent_aed: Decimal,
    pub yield_increase_pct: Decimal,
    pub estimated_renovation_cost_aed: Decimal,
    pub payback_period_months: Decimal,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserPortfolioSummary {
    pub user_id: Uuid,
    pub wallet_balance_aed: Decimal,
    pub total_portfolio_value_aed: Decimal,
    pub total_shares_owned: i32,
    pub holdings: Vec<UserHoldingDetail>,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserHoldingDetail {
    pub property_id: Uuid,
    pub title: String,
    pub district: String,
    pub shares_count: i32,
    pub cost_basis_aed: Decimal,
    pub current_market_price_aed: Decimal,
    pub unrealized_pnl_aed: Decimal,
    pub unrealized_pnl_pct: Decimal,
    pub projected_annual_dividend_aed: Decimal,
}
