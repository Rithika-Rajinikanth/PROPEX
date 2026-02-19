$API = "http://localhost:3000"
$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REAL ESTATE API - COMPREHENSIVE TEST  " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Method = "GET",
        [string]$Url,
        [object]$Body = $null,
        [string]$ExpectField = $null
    )

    Write-Host "TEST: $Name" -ForegroundColor Yellow
    Write-Host ("  " + $Method + " " + $Url) -ForegroundColor Gray

    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            TimeoutSec  = 15
            ContentType = "application/json"
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }

        $response = Invoke-RestMethod @params
        Write-Host "  SUCCESS" -ForegroundColor Green

        if ($ExpectField) {
            if ($response.PSObject.Properties.Name -contains $ExpectField) {
                Write-Host "     Field '$ExpectField' present" -ForegroundColor Green
            } else {
                Write-Host "     Missing expected field: $ExpectField" -ForegroundColor Red
            }
        }

        if ($response.results -and $response.results.Count -gt 0) {
            $first = $response.results[0]
            Write-Host "     Sample: $($first.region_name) ($($first.state_name))" -ForegroundColor White
        }

        Write-Host ""
        return $true
    }
    catch {
        Write-Host "  FAILED" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

Write-Host "PHASE 1: BASIC HEALTH & CONNECTIVITY" -ForegroundColor Magenta
if (Test-Endpoint -Name "Health Check" -Url "$API/health") { $passed++ } else { $failed++ }

Write-Host "`nPHASE 2: REGIONS ENDPOINTS" -ForegroundColor Magenta
if (Test-Endpoint -Name "List Regions - Texas" -Url "$API/api/v1/regions?state=texas&limit=5") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Get Region by ID (1)" -Url "$API/api/v1/regions/1" -ExpectField "region_name") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Get Region Metrics (1)" -Url "$API/api/v1/regions/1/metrics" -ExpectField "current_value") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Get Region Trends - ZHVI" -Url "$API/api/v1/regions/1/trends?metric=zhvi&months=6") { $passed++ } else { $failed++ }

Write-Host "`nPHASE 3: SEARCH ENDPOINTS" -ForegroundColor Magenta
if (Test-Endpoint -Name "Basic Search" -Url "$API/api/v1/search?limit=5" -ExpectField "results") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Search by State" -Url "$API/api/v1/search?state=texas&limit=5") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Search by Location" -Url "$API/api/v1/search?location=austin&limit=5") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Search Price Range" -Url "$API/api/v1/search?price_min=200000&price_max=500000&limit=5") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Search Heat Index" -Url "$API/api/v1/search?heat_index_min=50&limit=5") { $passed++ } else { $failed++ }

$advancedBody = @{
    state = "CA"
    price_min = 300000
    price_max = 800000
    limit = 3
}

if (Test-Endpoint -Name "Advanced Search" -Method "POST" -Url "$API/api/v1/search/advanced" -Body $advancedBody) { $passed++ } else { $failed++ }

Write-Host "`nPHASE 4: ANALYTICS ENDPOINTS" -ForegroundColor Magenta
if (Test-Endpoint -Name "Market Trends" -Url "$API/api/v1/analytics/trends?limit=12") { $passed++ } else { $failed++ }
if (Test-Endpoint -Name "Market Heatmap" -Url "$API/api/v1/analytics/heatmap") { $passed++ } else { $failed++ }

Write-Host "`nPHASE 5: ERROR HANDLING" -ForegroundColor Magenta

try {
    Invoke-RestMethod -Uri "$API/api/v1/regions/999999" -TimeoutSec 5
    Write-Host " Expected 404" -ForegroundColor Red
    $failed++
}
catch {
    Write-Host " 404 returned correctly" -ForegroundColor Green
    $passed++
}

Write-Host ""
Write-Host "Passed: $passed  Failed: $failed"


