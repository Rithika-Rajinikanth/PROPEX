#!/usr/bin/env bash
# ==============================================================================
# PropX Azure for Students ($100 Credit) Automated Deployment Script (Bash)
# Resource Group: realestate-rg | Location: southeastasia
# ==============================================================================

set -e

RESOURCE_GROUP="realestate-rg"
LOCATION="southeastasia"
DATABASE_URL="${DATABASE_URL:-}"
REDIS_URL="${REDIS_URL:-}"
JWT_SECRET="${JWT_SECRET:-super_secure_propx_production_jwt_secret_2026}"
GROQ_API_KEY="${GROQ_API_KEY:-}"

echo "======================================================================"
echo "🏙️  PROPEX DUBAI — AZURE FOR STUDENTS DEPLOYMENT ($100 CREDIT OPTIMIZED)"
echo "======================================================================"

# 1. Verify Azure CLI Authentication
echo ""
echo "[Step 1/6] Checking Azure CLI Authentication..."
if ! az account show >/dev/null 2>&1; then
    echo "⚠️ Azure session expired or not logged in. Launching 'az login'..."
    az login
fi

SUB_ID=$(az account show --query id -o tsv)
SUB_NAME=$(az account show --query name -o tsv)
echo "✅ Active Subscription: $SUB_NAME ($SUB_ID)"

# 2. Check / Retrieve Container Apps Environment
echo ""
echo "[Step 2/6] Detecting Container Apps Environment in $RESOURCE_GROUP..."
ENV_NAME=$(az containerapp env list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv 2>/dev/null || true)

if [ -z "$ENV_NAME" ]; then
    ENV_NAME="propx-env"
    echo "Creating Container Apps Environment: $ENV_NAME in $LOCATION..."
    az containerapp env create \
        --name "$ENV_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --output none
fi
echo "✅ Using Container Apps Environment: $ENV_NAME"

# 3. Deploy Python AI/ML Microservice (Internal Ingress)
echo ""
echo "[Step 3/6] Deploying Python AI/ML Microservice (propx-ml)..."
echo "   Target: 0.25 vCPU, 0.5 GiB, min-replicas 0 (Scale to zero = $0 idle cost)"

az containerapp up \
    --name "propx-ml" \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$ENV_NAME" \
    --source "./ml_service" \
    --ingress internal \
    --target-port 8000 \
    --cpu 0.25 \
    --memory 0.5Gi \
    --min-replicas 0 \
    --max-replicas 1

echo "✅ Python AI/ML service deployed as internal container app."

# 4. Deploy Rust Backend Core API (Internal Ingress)
echo ""
echo "[Step 4/6] Deploying Rust Backend API (propx-backend)..."
echo "   Target: 0.25 vCPU, 0.5 GiB, min-replicas 0 (Scale to zero = $0 idle cost)"

BACKEND_ENVS=("PORT=8080" "HOST=0.0.0.0" "JWT_SECRET=$JWT_SECRET" "ML_SERVICE_URL=http://propx-ml")
[ -n "$DATABASE_URL" ] && BACKEND_ENVS+=("DATABASE_URL=$DATABASE_URL")
[ -n "$REDIS_URL" ] && BACKEND_ENVS+=("REDIS_URL=$REDIS_URL")
[ -n "$GROQ_API_KEY" ] && BACKEND_ENVS+=("GROQ_API_KEY=$GROQ_API_KEY")

az containerapp up \
    --name "propx-backend" \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$ENV_NAME" \
    --source "./backend/real_estate_api" \
    --ingress internal \
    --target-port 8080 \
    --cpu 0.25 \
    --memory 0.5Gi \
    --min-replicas 0 \
    --max-replicas 1 \
    --env-vars "${BACKEND_ENVS[@]}"

echo "✅ Rust Backend API deployed as internal container app."

# 5. Deploy Next.js Frontend (Public Ingress)
echo ""
echo "[Step 5/6] Updating Next.js Frontend (real-estate-frontend)..."
echo "   Connecting to internal backend (http://propx-backend) and ML (http://propx-ml)..."

az containerapp up \
    --name "real-estate-frontend" \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$ENV_NAME" \
    --source "./frontend/real-estate-frontend" \
    --ingress external \
    --target-port 3000 \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 0 \
    --max-replicas 1 \
    --env-vars API_URL="http://propx-backend" ML_URL="http://propx-ml"

echo "✅ Next.js Frontend updated with live reverse-proxy routing!"

# 6. Retrieve Live Public URL
echo ""
echo "[Step 6/6] Fetching Live Public Endpoint..."
FQDN=$(az containerapp show \
    --name "real-estate-frontend" \
    --resource-group "$RESOURCE_GROUP" \
    --query "properties.configuration.ingress.fqdn" \
    -o tsv)

echo ""
echo "======================================================================"
echo "🎉 DEPLOYMENT COMPLETE! YOUR PROPEX PLATFORM IS LIVE ON AZURE:"
echo "   https://$FQDN"
echo "======================================================================"
echo "💡 Cost Guard: All services configured with min-replicas 0."
echo "   When no users are browsing, containers sleep at $0.00 cost!"
