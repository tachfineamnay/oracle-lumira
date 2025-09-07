#!/usr/bin/env pwsh
# Oracle Lumira - Test Docker Local Simple

param(
    [string]$Tag = "oracle-lumira:local-test",
    [int]$Port = 8080,
    [switch]$CleanUp
)

Write-Host "Docker Test Oracle Lumira" -ForegroundColor Green

if ($CleanUp) {
    Write-Host "Nettoyage..." -ForegroundColor Yellow
    docker stop oracle-lumira-test -t 10 2>$null
    docker rm oracle-lumira-test -f 2>$null
    docker rmi $Tag -f 2>$null
    Write-Host "Nettoye" -ForegroundColor Green
    exit 0
}

# Build
Write-Host "Build Docker..." -ForegroundColor Yellow
docker build -t $Tag . --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "Echec build" -ForegroundColor Red
    exit 1
}
Write-Host "Build OK" -ForegroundColor Green

# Start
Write-Host "Demarrage container..." -ForegroundColor Yellow
docker run --rm -d --name oracle-lumira-test -p ${Port}:8080 `
    -e NODE_ENV=test `
    -e PORT=3001 `
    -e JWT_SECRET="test-jwt-secret" `
    $Tag

if ($LASTEXITCODE -ne 0) {
    Write-Host "Echec demarrage" -ForegroundColor Red
    exit 1
}

# Wait
Write-Host "Attente demarrage..." -ForegroundColor Yellow
$timeout = 90
$elapsed = 0
$healthy = $false

while ($elapsed -lt $timeout -and -not $healthy) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health.json" -TimeoutSec 5
        if ($response.status -eq "healthy") {
            $healthy = $true
            Write-Host "Container OK!" -ForegroundColor Green
            break
        }
    } catch {
        # Continue
    }
    
    Start-Sleep 5
    $elapsed += 5
    Write-Host "Attente... ${elapsed}s" -ForegroundColor Gray
}

if (-not $healthy) {
    Write-Host "Timeout" -ForegroundColor Red
    docker logs oracle-lumira-test --tail 20
    docker stop oracle-lumira-test -t 10
    exit 1
}

# Tests
Write-Host "Tests..." -ForegroundColor Yellow
$passed = 0
$total = 3

# Test 1: Health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/health.json" -TimeoutSec 10 -UseBasicParsing
    if ($response.Content -like "*healthy*") {
        Write-Host "  Health OK" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  Health FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "  Health ERROR: $_" -ForegroundColor Red
}

# Test 2: Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/" -TimeoutSec 10 -UseBasicParsing
    if ($response.Content -like "*<!DOCTYPE html>*") {
        Write-Host "  Frontend OK" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  Frontend FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "  Frontend ERROR: $_" -ForegroundColor Red
}

# Test 3: API Ready
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/ready" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  API OK" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  API FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "  API ERROR: $_" -ForegroundColor Red
}

# Resume
Write-Host "`nTests reussis: $passed/$total" -ForegroundColor Cyan
Write-Host "Container: http://localhost:$Port" -ForegroundColor White

if ($passed -eq $total) {
    Write-Host "`nSUCCES - Pret pour Coolify!" -ForegroundColor Green
    $exitCode = 0
} else {
    Write-Host "`nECHEC - Verifier config" -ForegroundColor Red
    $exitCode = 1
}

Write-Host "`nPour arreter: docker stop oracle-lumira-test" -ForegroundColor Gray
exit $exitCode
