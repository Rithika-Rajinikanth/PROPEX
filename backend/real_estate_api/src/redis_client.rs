// src/redis_client.rs
use fred::prelude::*;
use tokio::time::Duration;

pub async fn create_redis_pool(redis_url: &str) -> Result<RedisPool, fred::error::RedisError> {
    tracing::info!("Connecting to Redis (centralized mode)");

    let mut config = RedisConfig::from_url(redis_url)?;
    config.fail_fast = false;

    let reconnect = ReconnectPolicy::new_exponential(0, 200, 5_000, 2);

    let connection_config = ConnectionConfig {
        connection_timeout: Duration::from_millis(1500),
        internal_command_timeout: Duration::from_millis(1000),
        tcp: TcpConfig {
            nodelay: Some(true),
            ..Default::default()
        },
        ..Default::default()
    };

    let perf_config = PerformanceConfig {
        default_command_timeout: Duration::from_millis(1000),
        ..Default::default()
    };

    let pool = RedisPool::new(
        config,
        Some(perf_config),
        Some(connection_config),
        Some(reconnect),
        3,
    )?;

    pool.connect();

    // Fast, non-blocking liveness check (1.5s max).
    // If Redis is offline, proceed immediately — all services gracefully fall back to direct PostgreSQL.
    match tokio::time::timeout(Duration::from_millis(1500), pool.wait_for_connect()).await {
        Ok(Ok(_)) => {
            tracing::info!("✅ Redis pool connected successfully");
            match tokio::time::timeout(Duration::from_millis(500), pool.ping::<String>()).await {
                Ok(Ok(r)) => tracing::info!("✅ Redis PING response: {}", r),
                Ok(Err(e)) => tracing::warn!("⚠️ Redis PING error: {} — fallback active", e),
                Err(_) => tracing::warn!("⚠️ Redis PING timeout — fallback active"),
            }
        }
        Ok(Err(e)) => {
            tracing::warn!("⚠️ Redis connect error: {} — operating in PostgreSQL-direct fallback mode", e);
        }
        Err(_) => {
            tracing::warn!("⚠️ Redis connect timeout (1.5s) — operating in PostgreSQL-direct fallback mode");
        }
    }

    Ok(pool)
}