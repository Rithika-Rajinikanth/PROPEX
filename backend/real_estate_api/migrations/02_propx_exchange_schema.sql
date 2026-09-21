-- ============================================================================
-- PROPX DUBAI: LIQUID REAL ESTATE & ASSET EXCHANGE
-- COMPLETE DDL SCHEMA MIGRATION (02_propx_exchange_schema.sql)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- ENUMS & TYPES
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('investor', 'owner', 'institutional', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_tier AS ENUM ('tier_0_anonymous', 'tier_1_identity_verified', 'tier_2_accredited_investor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_category AS ENUM ('residential_apartment', 'luxury_villa', 'hotel_suite', 'commercial_floor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE asset_lifecycle AS ENUM ('draft', 'auditing', 'verified_active', 'trading_halted', 'delisted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_result AS ENUM ('approved', 'flagged_investigation', 'rejected_fraudulent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE splat_status AS ENUM ('queued', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE order_direction AS ENUM ('buy', 'sell');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE order_state AS ENUM ('open', 'partial', 'filled', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_state AS ENUM ('initiated', 'funded', 'conditions_met', 'disbursed', 'cancelled_refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE emi_status AS ENUM ('applied', 'approved', 'active', 'completed', 'defaulted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 1. USERS & UNIFIED IDENTITY
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    roles user_role[] NOT NULL DEFAULT '{"investor"}',
    kyc_level kyc_tier NOT NULL DEFAULT 'tier_0_anonymous',
    emirates_id_hash VARCHAR(64) UNIQUE,
    passport_hash VARCHAR(64),
    wallet_balance_aed NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance_aed >= 0.00),
    locked_escrow_aed NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (locked_escrow_aed >= 0.00),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_emirates_id ON users(emirates_id_hash);

-- ============================================================================
-- 2. PROPERTIES (DUBAI DLD SPECIFIC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issuer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category asset_category NOT NULL,
    status asset_lifecycle NOT NULL DEFAULT 'draft',
    makani_number VARCHAR(20) UNIQUE NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    building_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    total_valuation_aed NUMERIC(15, 2) NOT NULL CHECK (total_valuation_aed > 0),
    total_shares INT NOT NULL CHECK (total_shares > 0),
    available_shares INT NOT NULL CHECK (available_shares >= 0),
    initial_share_price_aed NUMERIC(12, 2) NOT NULL CHECK (initial_share_price_aed > 0),
    annual_gross_rent_aed NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    service_charge_per_sqft_aed NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    projected_net_yield_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    embedding vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_property_unit_plot UNIQUE (plot_number, unit_number)
);

CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_geo ON properties USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_properties_vector ON properties USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- 3. DUAL-SIDED AI AUDITOR & TITLE DEED ANTI-FRAUD
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    deed_file_url TEXT NOT NULL,
    raw_ocr_text TEXT,
    ocr_owner_name VARCHAR(255),
    ocr_national_id VARCHAR(64),
    ocr_makani VARCHAR(20),
    name_levenshtein_similarity NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    dld_registry_verified BOOLEAN NOT NULL DEFAULT FALSE,
    active_mortgage_detected BOOLEAN NOT NULL DEFAULT FALSE,
    bank_noc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate_listing_attempt BOOLEAN NOT NULL DEFAULT FALSE,
    overall_risk_score INT NOT NULL CHECK (overall_risk_score BETWEEN 0 AND 100),
    verdict audit_result NOT NULL DEFAULT 'flagged_investigation',
    audit_notes TEXT,
    audited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_property ON property_audits(property_id);

-- ============================================================================
-- 4. 3D SPATIAL TWINS (SMARTPHONE GAUSSIAN SPLATS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS spatial_3d_twins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID UNIQUE NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    raw_video_url TEXT NOT NULL,
    processed_splat_url TEXT,
    floorplan_mesh_url TEXT,
    video_duration_seconds INT NOT NULL DEFAULT 0,
    keyframe_count INT NOT NULL DEFAULT 0,
    processing_status splat_status NOT NULL DEFAULT 'queued',
    compression_ratio_mb NUMERIC(6, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. FRACTIONAL PARTITIONS (OWNERSHIP LEDGER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    shares_count INT NOT NULL CHECK (shares_count > 0),
    cost_basis_per_share_aed NUMERIC(12, 2) NOT NULL CHECK (cost_basis_per_share_aed > 0),
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_property_shares UNIQUE (property_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_shares_user ON property_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_property ON property_shares(property_id);

-- ============================================================================
-- 6. HIGH-CONCURRENCY ORDER BOOK (SECONDARY MARKET)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    user_id UUID NOT NULL REFERENCES users(id),
    direction order_direction NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    filled_quantity INT NOT NULL DEFAULT 0 CHECK (filled_quantity <= quantity),
    price_per_share_aed NUMERIC(12, 2) NOT NULL CHECK (price_per_share_aed > 0),
    status order_state NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_book_engine ON order_book (
    property_id, direction, status, price_per_share_aed, created_at
);

-- ============================================================================
-- 7. TRADE EXECUTION & TRANSACTION AUDIT TRAIL
-- ============================================================================
CREATE TABLE IF NOT EXISTS trade_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    buy_order_id UUID NOT NULL REFERENCES order_book(id),
    sell_order_id UUID NOT NULL REFERENCES order_book(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    shares_traded INT NOT NULL CHECK (shares_traded > 0),
    price_per_share_aed NUMERIC(12, 2) NOT NULL CHECK (price_per_share_aed > 0),
    total_amount_aed NUMERIC(15, 2) NOT NULL CHECK (total_amount_aed > 0),
    platform_fee_aed NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    previous_trade_hash VARCHAR(64),
    current_trade_hash VARCHAR(64) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_property ON trade_executions(property_id, executed_at DESC);

-- ============================================================================
-- 8. PEER-TO-PEER ESCROW CONTRACTS (DIRECT DEALS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS direct_escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    agreed_price_aed NUMERIC(15, 2) NOT NULL CHECK (agreed_price_aed > 0),
    deposit_amount_aed NUMERIC(15, 2) NOT NULL CHECK (deposit_amount_aed > 0),
    status escrow_state NOT NULL DEFAULT 'initiated',
    buyer_signed_at TIMESTAMPTZ,
    seller_signed_at TIMESTAMPTZ,
    dld_transfer_reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escrows_buyer ON direct_escrows(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrows_seller ON direct_escrows(seller_id);

-- ============================================================================
-- 9. RENTAL DIVIDEND DISTRIBUTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS dividend_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_rent_collected_aed NUMERIC(12, 2) NOT NULL,
    service_maintenance_fees_aed NUMERIC(12, 2) NOT NULL,
    net_rent_distributed_aed NUMERIC(12, 2) NOT NULL,
    dividend_per_share_aed NUMERIC(10, 4) NOT NULL,
    distributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dividends_property ON dividend_distributions(property_id, distributed_at DESC);

-- ============================================================================
-- 10. EMI FINANCING & BUYER SOLVENCY UNDERWRITING
-- ============================================================================
CREATE TABLE IF NOT EXISTS emi_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    total_financed_amount_aed NUMERIC(15, 2) NOT NULL CHECK (total_financed_amount_aed > 0),
    downpayment_amount_aed NUMERIC(15, 2) NOT NULL CHECK (downpayment_amount_aed >= 0),
    monthly_installment_aed NUMERIC(12, 2) NOT NULL CHECK (monthly_installment_aed > 0),
    tenor_months INT NOT NULL CHECK (tenor_months > 0),
    months_paid INT NOT NULL DEFAULT 0,
    interest_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 4.50,
    status emi_status NOT NULL DEFAULT 'applied',
    auditor_solvency_score INT NOT NULL CHECK (auditor_solvency_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emi_buyer ON emi_plans(buyer_id);
