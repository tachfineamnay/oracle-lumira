#!/usr/bin/env pwsh
# Oracle Lumira - Validation des Correctifs Appliques

Write-Host "🔍 Validation des Correctifs Oracle Lumira" -ForegroundColor Green

$validationResults = @{
    dockerfile_permissions = $false
    nginx_config_updated = $false
    node_version_locked = $false
    pm2_optimized = $false
    frontend_vulnerabilities = $false
    ecosystem_enhanced = $false
}

$totalChecks = $validationResults.Count
$passedChecks = 0

# Check 1: Dockerfile permissions nginx
Write-Host "`n📦 Verification Dockerfile..." -ForegroundColor Yellow
$dockerContent = Get-Content "Dockerfile" -Raw
if ($dockerContent -match "/var/lib/nginx/tmp/client_body" -and $dockerContent -match "chmod 755") {
    Write-Host "✅ Permissions nginx configurees" -ForegroundColor Green
    $validationResults.dockerfile_permissions = $true
    $passedChecks++
} else {
    Write-Host "❌ Permissions nginx manquantes" -ForegroundColor Red
}

# Check 2: Nginx configuration
Write-Host "`n🌐 Verification Nginx config..." -ForegroundColor Yellow
$nginxContent = Get-Content "nginx-fullstack.conf" -Raw
if ($nginxContent -match "client_body_temp_path" -and $nginxContent -match "/var/lib/nginx/logs") {
    Write-Host "✅ Configuration nginx optimisee" -ForegroundColor Green
    $validationResults.nginx_config_updated = $true
    $passedChecks++
} else {
    Write-Host "❌ Configuration nginx incomplete" -ForegroundColor Red
}

# Check 3: Node version locked
Write-Host "`n📌 Verification version Node.js..." -ForegroundColor Yellow
if ($dockerContent -match "node:20.18.1-alpine") {
    Write-Host "✅ Version Node.js verrouillee (20.18.1)" -ForegroundColor Green
    $validationResults.node_version_locked = $true
    $passedChecks++
} else {
    Write-Host "❌ Version Node.js non verrouillee" -ForegroundColor Red
}

# Check 4: PM2 ecosystem enhanced
Write-Host "`n⚙️  Verification PM2 ecosystem..." -ForegroundColor Yellow
$ecosystemContent = Get-Content "ecosystem.config.json" -Raw | ConvertFrom-Json
if ($ecosystemContent.apps[0].log_type -eq "json" -and $ecosystemContent.apps[0].max_restarts) {
    Write-Host "✅ PM2 ecosystem optimise" -ForegroundColor Green
    $validationResults.pm2_optimized = $true
    $passedChecks++
} else {
    Write-Host "❌ PM2 ecosystem non optimise" -ForegroundColor Red
}

# Check 5: Frontend vulnerabilities
Write-Host "`n🛡️  Verification vulnerabilites frontend..." -ForegroundColor Yellow
Push-Location "apps/main-app"
try {
    $auditResult = npm audit --json --audit-level=high 2>$null | ConvertFrom-Json
    $highVulns = $auditResult.metadata.vulnerabilities.high
    if ($highVulns -eq 0) {
        Write-Host "✅ Aucune vulnerabilite HIGH" -ForegroundColor Green
        $validationResults.frontend_vulnerabilities = $true
        $passedChecks++
    } else {
        Write-Host "⚠️  $highVulns vulnerabilites HIGH restantes" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Verification vulnerabilites echouee" -ForegroundColor Yellow
}
Pop-Location

# Check 6: Ecosystem enhanced
Write-Host "`n📄 Verification logging structure..." -ForegroundColor Yellow
if (Test-Path "apps/api-backend/src/middleware/logging.ts") {
    Write-Host "✅ Middleware logging cree" -ForegroundColor Green
    $validationResults.ecosystem_enhanced = $true
    $passedChecks++
} else {
    Write-Host "❌ Middleware logging manquant" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 RESUME VALIDATION" -ForegroundColor Cyan
Write-Host "Correctifs appliques: $passedChecks/$totalChecks" -ForegroundColor White

$successRate = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
Write-Host "Taux de reussite: $successRate%" -ForegroundColor $(if($successRate -ge 80){"Green"}elseif($successRate -ge 60){"Yellow"}else{"Red"})

# Detailed results
Write-Host "`n📋 DETAILS VALIDATION:" -ForegroundColor Yellow
$validationResults.GetEnumerator() | ForEach-Object {
    $status = if ($_.Value) { "✅" } else { "❌" }
    $color = if ($_.Value) { "Green" } else { "Red" }
    Write-Host "  $status $($_.Key.Replace('_', ' '))" -ForegroundColor $color
}

# Next steps
if ($passedChecks -eq $totalChecks) {
    Write-Host "`n🎉 TOUS LES CORRECTIFS APPLIQUES!" -ForegroundColor Green
    Write-Host "✅ Pret pour deploiement Coolify" -ForegroundColor Green
    
    Write-Host "`n🚀 PROCHAINES ETAPES:" -ForegroundColor Cyan
    Write-Host "1. Tester Docker (si Docker Desktop disponible):" -ForegroundColor White
    Write-Host "   docker build -t oracle-lumira:test ." -ForegroundColor Gray
    Write-Host "2. Valider securite:" -ForegroundColor White  
    Write-Host "   .\security\master-security.ps1 -Operation all" -ForegroundColor Gray
    Write-Host "3. Commiter changements:" -ForegroundColor White
    Write-Host "   git add . && git commit -m 'feat: docker + nginx optimizations for coolify'" -ForegroundColor Gray
    Write-Host "4. Deployer sur Coolify v4" -ForegroundColor White
    
    $exitCode = 0
} elseif ($passedChecks -ge ($totalChecks * 0.7)) {
    Write-Host "`n⚠️  CORRECTIFS PARTIELLEMENT APPLIQUES" -ForegroundColor Yellow
    Write-Host "La plupart des optimisations sont en place" -ForegroundColor Yellow
    Write-Host "Verifier les elements manquants ci-dessus" -ForegroundColor Yellow
    $exitCode = 1
} else {
    Write-Host "`n❌ CORRECTIFS INSUFFISANTS" -ForegroundColor Red
    Write-Host "Appliquer les correctifs manquants avant deploiement" -ForegroundColor Red
    $exitCode = 2
}

# Create validation report
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    validation_results = $validationResults
    success_rate = $successRate
    passed_checks = $passedChecks
    total_checks = $totalChecks
    status = if ($exitCode -eq 0) { "READY" } elseif ($exitCode -eq 1) { "MOSTLY_READY" } else { "NOT_READY" }
}

$report | ConvertTo-Json -Depth 3 | Out-File "validation-report.json" -Encoding UTF8
Write-Host "`n📄 Rapport sauvegarde: validation-report.json" -ForegroundColor Gray

exit $exitCode
