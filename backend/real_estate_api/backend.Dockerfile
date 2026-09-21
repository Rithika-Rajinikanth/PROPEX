# backend/real_estate_api/Dockerfile
#
# REQUIRES: .sqlx/ folder committed to git (run `cargo sqlx prepare` first)
# See FRESH_DEPLOY_GUIDE.md Phase 0 for instructions.

FROM rust:1.88-slim-bookworm AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y \
    pkg-config libssl-dev libpq-dev ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY src ./src
# Copy the sqlx offline cache — this is what allows building without a DB
COPY .sqlx ./.sqlx

# Skip live DB connection during compile — reads from .sqlx/ cache instead
ENV SQLX_OFFLINE=true

RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libpq5 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/real_estate_api ./real_estate_api

RUN useradd -m -u 1001 appuser && chown appuser:appuser ./real_estate_api
USER appuser

EXPOSE 8080
STOPSIGNAL SIGTERM
CMD ["./real_estate_api"]