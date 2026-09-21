# PropX Enterprise DevOps and Real-World Reliability Master Test Runner
param(
    [switch]$SkipStart = $false
)

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "PROPEX DUBAI DEVOPS AND REAL-WORLD PRODUCTION RELIABILITY SUITE" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan

$root = Resolve-Path "$PSScriptRoot\.."
Set-Location $root

# 1. Verify / Check Backend and Frontend
Write-Host "`n[Phase 1] Probing Services..." -ForegroundColor White
$backendOnline = $false
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:8085/health" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($res) { $backendOnline = $true }
} catch {
    $backendOnline = $false
}

if ($backendOnline) {
    Write-Host "  Backend is ACTIVE on port 8085" -ForegroundColor Green
} else {
    Write-Host "  Backend is NOT responding on port 8085." -ForegroundColor Yellow
}

$frontendOnline = $false
try {
    $res2 = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/exchange/properties" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($res2) { $frontendOnline = $true }
} catch {
    $frontendOnline = $false
}

if ($frontendOnline) {
    Write-Host "  Next.js 16 Frontend is ACTIVE on port 3000" -ForegroundColor Green
} else {
    Write-Host "  Next.js 16 Frontend is NOT responding on port 3000." -ForegroundColor Yellow
}

$mlOnline = $false
try {
    $res3 = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($res3) { $mlOnline = $true }
} catch {
    $mlOnline = $false
}

if ($mlOnline) {
    Write-Host "  ML Service (HNSW/Fraud/SLM) is ACTIVE on port 8000" -ForegroundColor Green
} else {
    Write-Host "  ML Service is NOT responding on port 8000." -ForegroundColor Yellow
}

Write-Host "`n-----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "EXECUTING TEST BATTERY" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------------------" -ForegroundColor DarkGray

$testResults = @{}

# TEST 1: REDIS CHAOS AND RESILIENCE TEST
Write-Host "`n[1/5] Running Redis Chaos and Circuit Breaker Test..." -ForegroundColor White
python tests/devops_redis_chaos_test.py
if ($LASTEXITCODE -eq 0) {
    $testResults["Redis Chaos and Circuit Breaker"] = "PASS"
} else {
    $testResults["Redis Chaos and Circuit Breaker"] = "FAIL"
}

# TEST 2: CONCURRENCY AND RACE CONDITION TEST
Write-Host "`n[2/5] Running Concurrency and CLOB Order Matching Stress Test..." -ForegroundColor White
python tests/devops_concurrency_stress_test.py
if ($LASTEXITCODE -eq 0) {
    $testResults["CLOB Concurrency and Row Locks"] = "PASS"
} else {
    $testResults["CLOB Concurrency and Row Locks"] = "FAIL"
}

# TEST 3: AI AND RAG EVALUATION HARNESS
Write-Host "`n[3/5] Running AI and RAG Evaluation Suite (GeeksforGeeks Guidelines)..." -ForegroundColor White
python tests/devops_ai_rag_eval.py
if ($LASTEXITCODE -eq 0) {
    $testResults["AI and RAG Evaluation Triad"] = "PASS"
} else {
    $testResults["AI and RAG Evaluation Triad"] = "FAIL"
}

# TEST 4: API URL AND ROBUSTNESS FUZZING
Write-Host "`n[4/5] Running API URL and Reverse Proxy Fuzzing Test..." -ForegroundColor White
python tests/devops_api_fuzz_test.py
if ($LASTEXITCODE -eq 0) {
    $testResults["API Fuzzing and Next.js Proxy"] = "PASS"
} else {
    $testResults["API Fuzzing and Next.js Proxy"] = "FAIL"
}

# TEST 5: ADVANCED AI/ML, ANN & FRAUD DETECTION
Write-Host "`n[5/5] Running Advanced AI/ML, HNSW ANN & Deep Fraud Detection Test..." -ForegroundColor White
python tests/devops_ai_ml_ann_fraud_test.py
if ($LASTEXITCODE -eq 0) {
    $testResults["AI/ML, HNSW ANN & Deep Fraud Audit"] = "PASS"
} else {
    $testResults["AI/ML, HNSW ANN & Deep Fraud Audit"] = "FAIL"
}

Write-Host "`n=======================================================================" -ForegroundColor Cyan
Write-Host "DEVOPS AND PRODUCTION READINESS SCORECARD" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan

$allPass = $true
foreach ($k in $testResults.Keys) {
    $status = $testResults[$k]
    if ($status -eq "PASS") {
        Write-Host "  PASS : $k" -ForegroundColor Green
    } else {
        Write-Host "  FAIL : $k" -ForegroundColor Red
        $allPass = $false
    }
}

Write-Host "=======================================================================" -ForegroundColor Cyan
if ($allPass) {
    Write-Host "ALL DEVOPS, CHAOS, CONCURRENCY AND AI EVALUATION TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "SOME TESTS ENCOUNTERED FAILURES. PLEASE REVIEW LOGS ABOVE." -ForegroundColor Red
    exit 1
}
