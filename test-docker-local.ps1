#!/usr/bin/env pwsh
# Oracle Lumira - Test Docker Local pour Coolify

param(
    [string]$Tag = "oracle-lumira:local-test",
    [int]$Port = 8080,
    [switch]$Verbose,
    [switch]$CleanUp
)

Write-Host "🐳 Oracle Lumira - Test Docker Local" -ForegroundColor Green
Write-Host "Tag: $Tag" -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor Cyan

if ($CleanUp) {
    Write-Host "`n🧹 Nettoyage des images/containers..." -ForegroundColor Yellow
    docker stop oracle-lumira-test -t 10 2>$null
    docker rm oracle-lumira-test -f 2>$null
    docker rmi $Tag -f 2>$null
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
    exit 0
}

# Étape 1: Build de l'image
Write-Host "`n📦 Build de l'image Docker..." -ForegroundColor Yellow
$buildStart = Get-Date
docker build -t $Tag . --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec du build Docker" -ForegroundColor Red
    exit 1
}
$buildDuration = (Get-Date) - $buildStart
Write-Host "✅ Build terminé en $([math]::Round($buildDuration.TotalMinutes, 1)) minutes" -ForegroundColor Green

# Étape 2: Démarrage du container
Write-Host "`n🚀 Démarrage du container..." -ForegroundColor Yellow
docker run --rm -d --name oracle-lumira-test -p ${Port}:8080 `
    -e NODE_ENV=test `
    -e PORT=3001 `
    -e MONGODB_URI="mongodb://localhost:27017/lumira-test" `
    -e JWT_SECRET="test-jwt-secret-key" `
    $Tag

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec du démarrage container" -ForegroundColor Red
    exit 1
}

# Étape 3: Attendre le démarrage
Write-Host "`n⏳ Attente du démarrage (90s max)..." -ForegroundColor Yellow
$timeout = 90
$elapsed = 0
$healthy = $false

while ($elapsed -lt $timeout -and -not $healthy) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health.json" -TimeoutSec 5
        if ($response.status -eq "healthy") {
            $healthy = $true
            Write-Host "✅ Container opérationnel !" -ForegroundColor Green
            break
        }
    } catch {
        # Continue d'attendre
    }
    
    Start-Sleep 5
    $elapsed += 5
    Write-Host "  Attente... ${elapsed}s" -ForegroundColor Gray
}

if (-not $healthy) {
    Write-Host "❌ Timeout - Container non opérationnel" -ForegroundColor Red
    Write-Host "`n📋 Logs du container:" -ForegroundColor Yellow
    docker logs oracle-lumira-test --tail 50
    docker stop oracle-lumira-test -t 10
    exit 1
}

# Étape 4: Tests de validation
Write-Host "`n🧪 Tests de validation..." -ForegroundColor Yellow

$tests = @(
    @{ name = "Health Check"; url = "/health.json"; expected = "healthy" }
    @{ name = "Frontend"; url = "/"; expected = "<!DOCTYPE html>" }
    @{ name = "API Ready"; url = "/api/ready"; expected = "ready" }
)

$passed = 0
foreach ($test in $tests) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port$($test.url)" -TimeoutSec 10 -UseBasicParsing
        if ($response.Content -like "*$($test.expected)*") {
            Write-Host "  ✅ $($test.name)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ❌ $($test.name) - Réponse inattendue" -ForegroundColor Red
            if ($Verbose) {
                Write-Host "    Réponse: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  ❌ $($test.name) - Erreur: $_" -ForegroundColor Red
    }
}

# Étape 5: Informations du container
if ($Verbose) {
    Write-Host "`n📊 Informations container:" -ForegroundColor Yellow
    
    # Stats
    $stats = docker stats oracle-lumira-test --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}"
    Write-Host "Stats: $stats" -ForegroundColor Gray
    
    # Processus
    Write-Host "`n🔄 Processus actifs:" -ForegroundColor Yellow
    docker exec oracle-lumira-test ps aux
}

# Résumé final
Write-Host "`n📊 Résumé des tests:" -ForegroundColor Cyan
Write-Host "Tests réussis: $passed/$($tests.Count)" -ForegroundColor $(if($passed -eq $tests.Count){"Green"}else{"Yellow"})
Write-Host "Container accessible: http://localhost:$Port" -ForegroundColor White

if ($passed -eq $tests.Count) {
    Write-Host "`n✅ SUCCÈS - Container prêt pour Coolify!" -ForegroundColor Green
    $exitCode = 0
} else {
    Write-Host "`n⚠️  AVERTISSEMENT - Certains tests ont échoué" -ForegroundColor Yellow
    $exitCode = 1
}

Write-Host "`n🛑 Pour arrêter le container:" -ForegroundColor Gray
Write-Host "docker stop oracle-lumira-test" -ForegroundColor Gray
Write-Host "`n🧹 Pour nettoyer complètement:" -ForegroundColor Gray
Write-Host ".\test-docker-local.ps1 -CleanUp" -ForegroundColor Gray

exit $exitCode
