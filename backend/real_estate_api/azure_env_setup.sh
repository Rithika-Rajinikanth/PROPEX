#!/bin/bash
# ============================================================
# Azure Container Apps — environment variable setup
# Run this once to push all secrets to your container app.
#
# Prerequisites:
#   az login
#   az extension add --name containerapp
#
# Replace every <PLACEHOLDER> below with your real values.
# ============================================================

RESOURCE_GROUP="rithika"
APP_NAME="real-estate-backend"
LOCATION="eastasia"   # match your existing deployment

# ── 1. Set all environment variables in one command ─────────
az containerapp update \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars \
    HOST="0.0.0.0" \
    PORT="3000" \
    ENVIRONMENT="production" \
    DATABASE_URL="postgres://<DB_USER>:<DB_PASSWORD>@<AZURE_PG_HOST>:5432/<DB_NAME>?sslmode=require" \
    REDIS_URL="rediss://:<REDIS_KEY>@<REDIS_HOST>:6380" \
    JWT_SECRET="<YOUR_SECURE_JWT_SECRET>" \
    JWT_EXPIRY_HOURS="24" \
    GROQ_API_KEY="<YOUR_GROQ_API_KEY>" \
    RUST_LOG="info,real_estate_api=debug,sqlx=warn"

echo "✅ Environment variables updated"
echo ""
echo "⚠️  Critical things to verify:"
echo "   1. HOST must be 0.0.0.0 (not 127.0.0.1)"
echo "   2. DATABASE_URL must point to Azure PostgreSQL hostname"
echo "   3. REDIS_URL must use rediss:// (TLS) for Azure Cache for Redis"
echo "   4. JWT_SECRET must be a single line with no spaces/newlines"
echo "   5. GROQ_API_KEY must be the new key you set"
echo ""

# ── 2. Verify the ingress is set to external ────────────────
az containerapp ingress show \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "{external:external, targetPort:targetPort, transport:transport}"

# Expected output:
# {
#   "external": true,
#   "targetPort": 3000,
#   "transport": "auto"
# }
#
# If external is false, fix it with:
# az containerapp ingress update \
#   --name "$APP_NAME" \
#   --resource-group "$RESOURCE_GROUP" \
#   --type external \
#   --target-port 3000

echo ""
echo "🔍 Tailing logs to verify startup..."
az containerapp logs show \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --follow \
  --tail 50
