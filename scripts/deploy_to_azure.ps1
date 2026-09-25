# ==============================================================================
# PropX Azure for Students ($100 Credit) Automated Deployment Script
# Resource Group: realestate-rg | Location: southeastasia
# ==============================================================================

param(
    [string]$ResourceGroup = "realestate-rg",
    [string]$Location = "southeastasia",
    [string]$DatabaseUrl = "",
    [string]$RedisUrl = "",
    [string]$JwtSecret = "super_secure_propx_production_jwt_secret_2026",
    [string]$GroqApiKey = ""
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🏙️  PROPEX DUBAI — AZURE FOR STUDENTS DEPLOYMENT ($100 CREDIT OPTIMIZED)" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Verify Azure CLI Authentication
Write-Host "`n[Step 1/6] Checking Azure CLI Authentication..." -ForegroundColor White
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "⚠️ Azure session expired or not logged in. Launching 'az login'..." -ForegroundColor Yellow
    az login
    $account = az account show --output json | ConvertFrom-Json
}

Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "   Subscription: $($account.name) ($($account.id))" -ForegroundColor Cyan

# Set target subscription
az account set --subscription $account.id

# 2. Check / Retrieve Container Apps Environment
Write-Host "`n[Step 2/6] Detecting Container Apps Environment in $ResourceGroup..." -ForegroundColor White
$envName = az containerapp env list --resource-group $ResourceGroup --query "[0].name" -o tsv 2>$null

if (-not $envName) {
    $envName = "propx-env"
    Write-Host "Creating Container Apps Environment: $envName in $Location..." -ForegroundColor Yellow
    az containerapp env create `
        --name $envName `
        --resource-group $ResourceGroup `
        --location $Location `
        --output none
}
Write-Host "✅ Using Container Apps Environment: $envName" -ForegroundColor Green

# 3. Deploy/Update Python AI/ML Microservice (Internal Ingress)
Write-Host "`n[Step 3/6] Deploying Python AI/ML Microservice (propx-ml)..." -ForegroundColor White
Write-Host "   Target: 0.25 vCPU, 0.5 GiB, min-replicas 0 (Scale to zero = $0 idle cost)" -ForegroundColor DarkGray

az containerapp up `
    --name "propx-ml" `
    --resource-group $ResourceGroup `
    --environment $envName `
    --source "./ml_service" `
    --ingress internal `
    --target-port 8000 `
    --cpu 0.25 `
    --memory 0.5Gi `
    --min-replicas 0 `
    --max-replicas 1

Write-Host "✅ Python AI/ML service deployed as internal container app." -ForegroundColor Green

# 4. Deploy/Update Rust Backend Core API (Internal Ingress)
Write-Host "`n[Step 4/6] Deploying Rust Backend API (propx-backend)..." -ForegroundColor White
Write-Host "   Target: 0.25 vCPU, 0.5 GiB, min-replicas 0 (Scale to zero = $0 idle cost)" -ForegroundColor DarkGray

# Build env vars array
$backendEnvVars = @(
    "PORT=8080",
    "HOST=0.0.0.0",
    "JWT_SECRET=$JwtSecret",
    "ML_SERVICE_URL=http://propx-ml"
)
if ($DatabaseUrl) { $backendEnvVars += "DATABASE_URL=$DatabaseUrl" }
if ($RedisUrl) { $backendEnvVars += "REDIS_URL=$RedisUrl" }
if ($GroqApiKey) { $backendEnvVars += "GROQ_API_KEY=$GroqApiKey" }

az containerapp up `
    --name "propx-backend" `
    --resource-group $ResourceGroup `
    --environment $envName `
    --source "./backend/real_estate_api" `
    --ingress internal `
    --target-port 8080 `
    --cpu 0.25 `
    --memory 0.5Gi `
    --min-replicas 0 `
    --max-replicas 1 `
    --env-vars $backendEnvVars

Write-Host "✅ Rust Backend API deployed as internal container app." -ForegroundColor Green

# 5. Deploy/Update Next.js 15 WebGL Frontend (Public Ingress)
Write-Host "`n[Step 5/6] Updating Next.js Frontend (real-estate-frontend)..." -ForegroundColor White
Write-Host "   Connecting to internal backend (http://propx-backend) and ML (http://propx-ml)..." -ForegroundColor DarkGray

az containerapp up `
    --name "real-estate-frontend" `
    --resource-group $ResourceGroup `
    --environment $envName `
    --source "./frontend/real-estate-frontend" `
    --ingress external `
    --target-port 3000 `
    --cpu 0.5 `
    --memory 1.0Gi `
    --min-replicas 0 `
    --max-replicas 1 `
    --env-vars "API_URL=http://propx-backend" "ML_URL=http://propx-ml"

Write-Host "✅ Next.js Frontend updated with live reverse-proxy routing!" -ForegroundColor Green

# 6. Retrieve Live Public URL
Write-Host "`n[Step 6/6] Fetching Live Public Endpoint..." -ForegroundColor White
$fqdn = az containerapp show `
    --name "real-estate-frontend" `
    --resource-group $ResourceGroup `
    --query "properties.configuration.ingress.fqdn" `
    -o tsv

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE! YOUR PROPEX PLATFORM IS LIVE ON AZURE:" -ForegroundColor Yellow
Write-Host "   https://$fqdn" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "💡 Cost Guard: All services configured with min-replicas 0." -ForegroundColor White
Write-Host "   When no users are browsing, containers sleep at $0.00 cost!" -ForegroundColor Green
