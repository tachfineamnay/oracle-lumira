#!/usr/bin/env pwsh
# Oracle Lumira - Validation Simple

Write-Host "Validation Correctifs Oracle Lumira" -ForegroundColor Green

$checks = 0
$total = 6

# Check 1: Dockerfile
if ((Get-Content "Dockerfile" -Raw) -match "/var/lib/nginx/tmp/client_body") {
    Write-Host "OK - Dockerfile permissions nginx" -ForegroundColor Green
    $checks++
} else {
    Write-Host "FAIL - Dockerfile permissions" -ForegroundColor Red
}

# Check 2: Nginx config  
if ((Get-Content "nginx-fullstack.conf" -Raw) -match "client_body_temp_path") {
    Write-Host "OK - Nginx configuration" -ForegroundColor Green
    $checks++
} else {
    Write-Host "FAIL - Nginx config" -ForegroundColor Red
}

# Check 3: Node version
if ((Get-Content "Dockerfile" -Raw) -match "node:20.18.1-alpine") {
    Write-Host "OK - Node version locked" -ForegroundColor Green
    $checks++
} else {
    Write-Host "FAIL - Node version" -ForegroundColor Red
}

# Check 4: PM2 config
$eco = Get-Content "ecosystem.config.json" -Raw | ConvertFrom-Json
if ($eco.apps[0].log_type -eq "json") {
    Write-Host "OK - PM2 ecosystem" -ForegroundColor Green
    $checks++
} else {
    Write-Host "FAIL - PM2 config" -ForegroundColor Red
}

# Check 5: Logging middleware
if (Test-Path "apps/api-backend/src/middleware/logging.ts") {
    Write-Host "OK - Logging middleware" -ForegroundColor Green
    $checks++
} else {
    Write-Host "FAIL - Logging middleware" -ForegroundColor Red
}

# Check 6: Security scripts
if (Test-Path "security/master-security.ps1") {
    Write-Host "OK - Security scripts" -ForegroundColor Green
    $checks++
} else {
    Write-Host "FAIL - Security scripts" -ForegroundColor Red
}

Write-Host "`nRESULTATS: $checks/$total correctifs appliques" -ForegroundColor Cyan

if ($checks -eq $total) {
    Write-Host "SUCCES - Pret pour Coolify!" -ForegroundColor Green
    Write-Host "`nEtapes suivantes:" -ForegroundColor White
    Write-Host "1. git add ." -ForegroundColor Gray  
    Write-Host "2. git commit -m 'feat: docker nginx optimizations'" -ForegroundColor Gray
    Write-Host "3. git push origin main" -ForegroundColor Gray
    Write-Host "4. Deployer sur Coolify" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "ECHEC - Correctifs incomplets" -ForegroundColor Red
    exit 1
}
