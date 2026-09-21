// src/services/exchange.rs
// High-Concurrency Order Matching Engine & Fractional Trading Service

use chrono::Utc;
use rust_decimal::Decimal;
use sha2::{Digest, Sha256};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::{
    error::AppError,
    models::propx::{
        CreateOrderRequest, OrderBookDepthLevel, OrderBookDepthResponse, OrderDirection,
        OrderResponse, OrderState, PartitionSimulationRequest, PartitionSimulationResponse,
        Property, TradeExecutionSummary, UserHoldingDetail, UserPortfolioSummary,
    },
};

pub struct ExchangeService;

impl ExchangeService {
    /// Retrieve all verified active properties for the exchange
    pub async fn list_active_properties(pool: &PgPool) -> Result<Vec<Property>, AppError> {
        let properties = sqlx::query_as::<_, Property>(
            r#"
            SELECT 
                id, issuer_id, title, description, category, status,
                makani_number, plot_number, unit_number, building_name, district,
                total_valuation_aed, total_shares, available_shares, initial_share_price_aed,
                annual_gross_rent_aed, service_charge_per_sqft_aed, projected_net_yield_pct,
                created_at, updated_at
            FROM properties
            WHERE status = 'verified_active'
            ORDER BY projected_net_yield_pct DESC
            "#,
        )
        .fetch_all(pool)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to fetch active properties: {}", e)))?;

        Ok(properties)
    }

    /// Retrieve a single property with details
    pub async fn get_property_by_id(pool: &PgPool, id: Uuid) -> Result<Property, AppError> {
        let property = sqlx::query_as::<_, Property>(
            r#"
            SELECT 
                id, issuer_id, title, description, category, status,
                makani_number, plot_number, unit_number, building_name, district,
                total_valuation_aed, total_shares, available_shares, initial_share_price_aed,
                annual_gross_rent_aed, service_charge_per_sqft_aed, projected_net_yield_pct,
                created_at, updated_at
            FROM properties
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await
        .map_err(|e| AppError::Internal(format!("Database error fetching property: {}", e)))?
        .ok_or(AppError::NotFound)?;

        Ok(property)
    }

    /// Place an order and execute matching with Price-Time Priority (FIFO)
    pub async fn place_and_match_order(
        pool: &PgPool,
        user_id: Uuid,
        req: CreateOrderRequest,
    ) -> Result<OrderResponse, AppError> {
        let mut tx: Transaction<'_, Postgres> = pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(format!("Failed to begin transaction: {}", e)))?;

        // 1. Balance or Share validation
        match req.direction {
            OrderDirection::Buy => {
                let required_funds = req.price_per_share_aed * Decimal::from(req.quantity);
                let balance: (Decimal,) = sqlx::query_as(
                    "SELECT wallet_balance_aed FROM users WHERE id = $1 FOR UPDATE",
                )
                .bind(user_id)
                .fetch_one(&mut *tx)
                .await
                .map_err(|_| AppError::NotFound)?;

                if balance.0 < required_funds {
                    return Err(AppError::BadRequest(format!(
                        "Insufficient wallet balance: Required {} AED, available {} AED",
                        required_funds, balance.0
                    )));
                }
            }
            OrderDirection::Sell => {
                let shares: Option<(i32,)> = sqlx::query_as(
                    "SELECT shares_count FROM property_shares WHERE user_id = $1 AND property_id = $2 FOR UPDATE",
                )
                .bind(user_id)
                .bind(req.property_id)
                .fetch_optional(&mut *tx)
                .await
                .map_err(|e| AppError::Internal(format!("Failed to check shares: {}", e)))?;

                let owned = shares.map(|s| s.0).unwrap_or(0);
                if owned < req.quantity {
                    return Err(AppError::BadRequest(format!(
                        "Insufficient shares to sell: Required {}, owned {}",
                        req.quantity, owned
                    )));
                }
            }
        }

        // 2. Insert new order into Order Book
        let new_order_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO order_book (
                id, property_id, user_id, direction, quantity, filled_quantity, price_per_share_aed, status
            ) VALUES ($1, $2, $3, $4, $5, 0, $6, 'open')
            "#,
        )
        .bind(new_order_id)
        .bind(req.property_id)
        .bind(user_id)
        .bind(&req.direction)
        .bind(req.quantity)
        .bind(req.price_per_share_aed)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to insert order: {}", e)))?;

        // 3. Matching Engine Loop
        let mut executed_trades = Vec::new();
        let mut remaining_quantity = req.quantity;

        // Fetch candidate opposite orders
        let candidates: Vec<(Uuid, Uuid, i32, i32, Decimal)> = match req.direction {
            OrderDirection::Buy => {
                // For Buy, match with Sells where sell.price <= buy.price, lowest price first
                sqlx::query_as(
                    r#"
                    SELECT id, user_id, quantity, filled_quantity, price_per_share_aed
                    FROM order_book
                    WHERE property_id = $1 
                      AND direction = 'sell' 
                      AND status IN ('open', 'partial')
                      AND price_per_share_aed <= $2
                      AND user_id != $3
                    ORDER BY price_per_share_aed ASC, created_at ASC
                    FOR UPDATE
                    "#,
                )
                .bind(req.property_id)
                .bind(req.price_per_share_aed)
                .bind(user_id)
                .fetch_all(&mut *tx)
                .await
                .unwrap_or_default()
            }
            OrderDirection::Sell => {
                // For Sell, match with Buys where buy.price >= sell.price, highest price first
                sqlx::query_as(
                    r#"
                    SELECT id, user_id, quantity, filled_quantity, price_per_share_aed
                    FROM order_book
                    WHERE property_id = $1 
                      AND direction = 'buy' 
                      AND status IN ('open', 'partial')
                      AND price_per_share_aed >= $2
                      AND user_id != $3
                    ORDER BY price_per_share_aed DESC, created_at ASC
                    FOR UPDATE
                    "#,
                )
                .bind(req.property_id)
                .bind(req.price_per_share_aed)
                .bind(user_id)
                .fetch_all(&mut *tx)
                .await
                .unwrap_or_default()
            }
        };

        for (cand_id, cand_user_id, cand_qty, cand_filled, cand_price) in candidates {
            if remaining_quantity == 0 {
                break;
            }

            let cand_available = cand_qty - cand_filled;
            let match_qty = remaining_quantity.min(cand_available);
            let trade_price = cand_price; // Maker price rules
            let total_trade_amount = trade_price * Decimal::from(match_qty);
            let platform_fee = total_trade_amount * Decimal::from_f64_retain(0.005).unwrap_or(Decimal::ZERO); // 0.5% fee

            let (buyer_id, seller_id, buy_order_id, sell_order_id) = match req.direction {
                OrderDirection::Buy => (user_id, cand_user_id, new_order_id, cand_id),
                OrderDirection::Sell => (cand_user_id, user_id, cand_id, new_order_id),
            };

            // Compute Cryptographic Audit Hash for the trade
            let mut hasher = Sha256::new();
            hasher.update(format!(
                "{}:{}:{}:{}:{}",
                req.property_id, buyer_id, seller_id, total_trade_amount, Utc::now()
            ));
            let current_trade_hash = format!("{:x}", hasher.finalize());

            let trade_id = Uuid::new_v4();
            sqlx::query(
                r#"
                INSERT INTO trade_executions (
                    id, property_id, buy_order_id, sell_order_id, buyer_id, seller_id,
                    shares_traded, price_per_share_aed, total_amount_aed, platform_fee_aed,
                    current_trade_hash
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                "#,
            )
            .bind(trade_id)
            .bind(req.property_id)
            .bind(buy_order_id)
            .bind(sell_order_id)
            .bind(buyer_id)
            .bind(seller_id)
            .bind(match_qty)
            .bind(trade_price)
            .bind(total_trade_amount)
            .bind(platform_fee)
            .bind(&current_trade_hash)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(format!("Failed to record trade: {}", e)))?;

            // Update candidate order filled amount and status
            let cand_new_filled = cand_filled + match_qty;
            let cand_status = if cand_new_filled == cand_qty { "filled" } else { "partial" };
            sqlx::query("UPDATE order_book SET filled_quantity = $1, status = $2::order_state WHERE id = $3")
                .bind(cand_new_filled)
                .bind(cand_status)
                .bind(cand_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| AppError::Internal(format!("Failed to update matched order: {}", e)))?;

            // Transfer Funds in Wallet
            sqlx::query("UPDATE users SET wallet_balance_aed = wallet_balance_aed - $1 WHERE id = $2")
                .bind(total_trade_amount)
                .bind(buyer_id)
                .execute(&mut *tx)
                .await?;

            sqlx::query("UPDATE users SET wallet_balance_aed = wallet_balance_aed + ($1 - $2) WHERE id = $3")
                .bind(total_trade_amount)
                .bind(platform_fee)
                .bind(seller_id)
                .execute(&mut *tx)
                .await?;

            // Transfer Shares Ownership
            // Reduce seller shares
            sqlx::query(
                "UPDATE property_shares SET shares_count = shares_count - $1, updated_at = NOW() WHERE user_id = $2 AND property_id = $3",
            )
            .bind(match_qty)
            .bind(seller_id)
            .bind(req.property_id)
            .execute(&mut *tx)
            .await?;

            // Increase buyer shares (upsert)
            sqlx::query(
                r#"
                INSERT INTO property_shares (property_id, user_id, shares_count, cost_basis_per_share_aed)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (property_id, user_id)
                DO UPDATE SET 
                    shares_count = property_shares.shares_count + EXCLUDED.shares_count,
                    cost_basis_per_share_aed = (property_shares.cost_basis_per_share_aed + EXCLUDED.cost_basis_per_share_aed) / 2,
                    updated_at = NOW()
                "#,
            )
            .bind(req.property_id)
            .bind(buyer_id)
            .bind(match_qty)
            .bind(trade_price)
            .execute(&mut *tx)
            .await?;

            executed_trades.push(TradeExecutionSummary {
                trade_id,
                shares: match_qty,
                price_aed: trade_price,
                total_aed: total_trade_amount,
            });

            remaining_quantity -= match_qty;
        }

        // 4. Update initiating order status
        let filled_total = req.quantity - remaining_quantity;
        let final_status = if remaining_quantity == 0 {
            OrderState::Filled
        } else if filled_total > 0 {
            OrderState::Partial
        } else {
            OrderState::Open
        };

        sqlx::query("UPDATE order_book SET filled_quantity = $1, status = $2 WHERE id = $3")
            .bind(filled_total)
            .bind(&final_status)
            .bind(new_order_id)
            .execute(&mut *tx)
            .await?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(format!("Commit failed: {}", e)))?;

        Ok(OrderResponse {
            order_id: new_order_id,
            status: final_status,
            executed_trades,
            remaining_quantity,
        })
    }

    /// Retrieve live Order Book Depth (Aggregated Bids and Asks)
    pub async fn get_order_book_depth(
        pool: &PgPool,
        property_id: Uuid,
    ) -> Result<OrderBookDepthResponse, AppError> {
        let bids = sqlx::query_as::<_, (Decimal, i64, i64)>(
            r#"
            SELECT 
                price_per_share_aed,
                SUM(quantity - filled_quantity)::BIGINT as total_shares,
                COUNT(*)::BIGINT as order_count
            FROM order_book
            WHERE property_id = $1 AND direction = 'buy' AND status IN ('open', 'partial')
            GROUP BY price_per_share_aed
            ORDER BY price_per_share_aed DESC
            LIMIT 20
            "#,
        )
        .bind(property_id)
        .fetch_all(pool)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to fetch bids: {}", e)))?
        .into_iter()
        .map(|(price_aed, total_shares, order_count)| OrderBookDepthLevel {
            price_aed,
            total_shares: total_shares as i32,
            order_count: order_count as i32,
        })
        .collect::<Vec<_>>();

        let asks = sqlx::query_as::<_, (Decimal, i64, i64)>(
            r#"
            SELECT 
                price_per_share_aed,
                SUM(quantity - filled_quantity)::BIGINT as total_shares,
                COUNT(*)::BIGINT as order_count
            FROM order_book
            WHERE property_id = $1 AND direction = 'sell' AND status IN ('open', 'partial')
            GROUP BY price_per_share_aed
            ORDER BY price_per_share_aed ASC
            LIMIT 20
            "#,
        )
        .bind(property_id)
        .fetch_all(pool)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to fetch asks: {}", e)))?
        .into_iter()
        .map(|(price_aed, total_shares, order_count)| OrderBookDepthLevel {
            price_aed,
            total_shares: total_shares as i32,
            order_count: order_count as i32,
        })
        .collect::<Vec<_>>();

        let spread_aed = if !bids.is_empty() && !asks.is_empty() {
            Some(asks[0].price_aed - bids[0].price_aed)
        } else {
            None
        };

        let last_trade = sqlx::query_scalar::<_, Decimal>(
            "SELECT price_per_share_aed FROM trade_executions WHERE property_id = $1 ORDER BY executed_at DESC LIMIT 1",
        )
        .bind(property_id)
        .fetch_optional(pool)
        .await
        .unwrap_or(None);

        Ok(OrderBookDepthResponse {
            property_id,
            bids,
            asks,
            spread_aed,
            last_traded_price_aed: last_trade,
        })
    }

    /// Simulate Room Partitioning and Rental Yield Increase
    pub async fn simulate_room_partition(
        pool: &PgPool,
        req: PartitionSimulationRequest,
    ) -> Result<PartitionSimulationResponse, AppError> {
        let property = Self::get_property_by_id(pool, req.property_id).await?;

        // Standard Dubai partitioning model
        // Base annual rent e.g. 235,000 AED
        let current_gross = property.annual_gross_rent_aed;
        let partition_rent = req
            .average_partition_rent_aed
            .unwrap_or_else(|| Decimal::from(3500)); // Default 3,500 AED/month per partition
        
        let additional_annual_revenue = partition_rent * Decimal::from(12) * Decimal::from(req.additional_partitions);
        let simulated_gross = current_gross + additional_annual_revenue;

        let yield_increase_pct = if current_gross > Decimal::ZERO {
            ((simulated_gross - current_gross) / current_gross) * Decimal::from(100)
        } else {
            Decimal::ZERO
        };

        // Average drywall + soundproofing + permit renovation in Dubai is ~8,000 AED per partition
        let estimated_renovation_cost = Decimal::from(8000) * Decimal::from(req.additional_partitions);
        let monthly_additional_revenue = additional_annual_revenue / Decimal::from(12);
        let payback_months = if monthly_additional_revenue > Decimal::ZERO {
            estimated_renovation_cost / monthly_additional_revenue
        } else {
            Decimal::ZERO
        };

        Ok(PartitionSimulationResponse {
            property_id: req.property_id,
            current_gross_annual_rent_aed: current_gross,
            simulated_gross_annual_rent_aed: simulated_gross,
            yield_increase_pct: yield_increase_pct.round_dp(2),
            estimated_renovation_cost_aed: estimated_renovation_cost,
            payback_period_months: payback_months.round_dp(1),
        })
    }

    /// Retrieve User Asset & Fractional Share Portfolio
    pub async fn get_user_portfolio(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<UserPortfolioSummary, AppError> {
        let wallet: (Decimal,) = sqlx::query_as("SELECT wallet_balance_aed FROM users WHERE id = $1")
            .bind(user_id)
            .fetch_one(pool)
            .await
            .map_err(|_| AppError::NotFound)?;

        let shares = sqlx::query_as::<_, (Uuid, String, String, i32, Decimal, Decimal, Decimal)>(
            r#"
            SELECT 
                p.id,
                p.title,
                p.district,
                ps.shares_count,
                ps.cost_basis_per_share_aed,
                COALESCE((
                    SELECT te.price_per_share_aed 
                    FROM trade_executions te 
                    WHERE te.property_id = p.id 
                    ORDER BY te.executed_at DESC LIMIT 1
                ), p.initial_share_price_aed) as current_market_price,
                p.projected_net_yield_pct
            FROM property_shares ps
            JOIN properties p ON ps.property_id = p.id
            WHERE ps.user_id = $1 AND ps.shares_count > 0
            "#,
        )
        .bind(user_id)
        .fetch_all(pool)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to fetch portfolio shares: {}", e)))?;

        let mut total_portfolio_value = Decimal::ZERO;
        let mut total_shares_owned = 0;
        let mut holdings = Vec::new();

        for (prop_id, title, district, shares_cnt, cost_basis, curr_price, yield_pct) in shares {
            let holding_val = curr_price * Decimal::from(shares_cnt);
            let cost_val = cost_basis * Decimal::from(shares_cnt);
            let pnl_aed = holding_val - cost_val;
            let pnl_pct = if cost_val > Decimal::ZERO {
                (pnl_aed / cost_val) * Decimal::from(100)
            } else {
                Decimal::ZERO
            };
            let annual_dividend = (holding_val * yield_pct) / Decimal::from(100);

            total_portfolio_value += holding_val;
            total_shares_owned += shares_cnt;

            holdings.push(UserHoldingDetail {
                property_id: prop_id,
                title,
                district,
                shares_count: shares_cnt,
                cost_basis_aed: cost_basis,
                current_market_price_aed: curr_price,
                unrealized_pnl_aed: pnl_aed.round_dp(2),
                unrealized_pnl_pct: pnl_pct.round_dp(2),
                projected_annual_dividend_aed: annual_dividend.round_dp(2),
            });
        }

        Ok(UserPortfolioSummary {
            user_id,
            wallet_balance_aed: wallet.0,
            total_portfolio_value_aed: total_portfolio_value.round_dp(2),
            total_shares_owned,
            holdings,
        })
    }
}
