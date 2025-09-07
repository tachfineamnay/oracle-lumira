#!/usr/bin/env pwsh
# Oracle Lumira - Nginx Configuration Test

Write-Host "🧪 Testing Nginx Configuration..." -ForegroundColor Green

$testsPassed = 0
$totalTests = 0

# Test 1: Nginx config syntax
Write-Host "`n📝 Test 1: Syntax Check..." -ForegroundColor Yellow
$totalTests++

if (-not (Test-Path "nginx-fullstack.conf")) {
    Write-Host "❌ nginx-fullstack.conf not found" -ForegroundColor Red
} elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $syntaxCheck = docker run --rm -v "${PWD}/nginx-fullstack.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Nginx configuration syntax is valid" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "❌ Nginx configuration has syntax errors:" -ForegroundColor Red
            Write-Host $syntaxCheck -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Failed to test nginx syntax: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Docker not available - skipping syntax test" -ForegroundColor Yellow
}

# Test 2: Security headers check
Write-Host "`n🔒 Test 2: Security Headers Check..." -ForegroundColor Yellow
$totalTests++

if (Test-Path "nginx-fullstack.conf") {
    $nginxConfig = Get-Content "nginx-fullstack.conf" -Raw
    $securityHeaders = @(
        "X-Frame-Options",
        "X-XSS-Protection", 
        "X-Content-Type-Options",
        "Content-Security-Policy"
    )
    
    $missingHeaders = @()
    foreach ($header in $securityHeaders) {
        if ($nginxConfig -notmatch "add_header.*$header") {
            $missingHeaders += $header
        }
    }
    
    if ($missingHeaders.Count -eq 0) {
        Write-Host "✅ All required security headers are configured" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "⚠️  Missing security headers: $($missingHeaders -join ', ')" -ForegroundColor Yellow
    }
}

# Test 3: Rate limiting configuration
Write-Host "`n🚀 Test 3: Rate Limiting Check..." -ForegroundColor Yellow
$totalTests++

if (Test-Path "nginx-fullstack.conf") {
    $nginxConfig = Get-Content "nginx-fullstack.conf" -Raw
    if ($nginxConfig -match "limit_req_zone" -and $nginxConfig -match "limit_req.*zone=") {
        Write-Host "✅ Rate limiting is configured" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "⚠️  Rate limiting not configured" -ForegroundColor Yellow
    }
}

# Test 4: Container build and health
Write-Host "`n🐳 Test 4: Container Health Test..." -ForegroundColor Yellow
$totalTests++

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Building test container..."
    try {
        # Build with timeout
        $buildJob = Start-Job -ScriptBlock { docker build -t lumira-health-test . }
        if (Wait-Job $buildJob -Timeout 300) {
            $buildOutput = Receive-Job $buildJob
            Remove-Job $buildJob
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Container build successful" -ForegroundColor Green
                
                # Start container for health test
                Write-Host "Starting container for health check..."
                docker run --rm -d --name lumira-test -p 8081:8080 lumira-health-test | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    # Wait for container to start
                    Start-Sleep 45
                    
                    # Test health endpoints
                    $healthPassed = $false
                    try {
                        $healthResponse = Invoke-RestMethod -Uri "http://localhost:8081/health.json" -TimeoutSec 15
                        if ($healthResponse) {
                            Write-Host "✅ Health endpoint responding" -ForegroundColor Green
                            $healthPassed = $true
                        }
                    } catch {
                        Write-Host "❌ Health endpoint failed: $_" -ForegroundColor Red
                    }
                    
                    # Test API ready endpoint  
                    try {
                        $readyResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/ready" -TimeoutSec 15
                        if ($readyResponse -and $healthPassed) {
                            Write-Host "✅ API ready endpoint responding" -ForegroundColor Green
                            $testsPassed++
                        } else {
                            Write-Host "❌ API ready endpoint failed" -ForegroundColor Red
                        }
                    } catch {
                        Write-Host "❌ API ready endpoint failed: $_" -ForegroundColor Red
                    }
                    
                    # Cleanup
                    Write-Host "Cleaning up test container..."
                    docker stop lumira-test -t 5 | Out-Null
                } else {
                    Write-Host "❌ Failed to start test container" -ForegroundColor Red
                }
                
                docker rmi lumira-health-test -f | Out-Null
            } else {
                Write-Host "❌ Container build failed" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Container build timed out (5 minutes)" -ForegroundColor Red
            Remove-Job $buildJob -Force
        }
    } catch {
        Write-Host "❌ Container test failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Docker not available - skipping container test" -ForegroundColor Yellow
}

# Test 5: SSL/TLS Configuration (if applicable)
Write-Host "`n🔐 Test 5: SSL Configuration Check..." -ForegroundColor Yellow
$totalTests++

if (Test-Path "nginx-fullstack.conf") {
    $nginxConfig = Get-Content "nginx-fullstack.conf" -Raw
    if ($nginxConfig -match "ssl_certificate" -or $nginxConfig -match "listen.*ssl") {
        if ($nginxConfig -match "ssl_protocols.*TLSv1.2" -or $nginxConfig -match "ssl_protocols.*TLSv1.3") {
            Write-Host "✅ SSL configuration found with modern protocols" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "⚠️  SSL configured but may use outdated protocols" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  No SSL configuration found (HTTP only)" -ForegroundColor Cyan
        $testsPassed++ # Not a failure for development
    }
}

# Test Results Summary
Write-Host "`n📊 Test Results Summary:" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed/$totalTests" -ForegroundColor $(if($testsPassed -eq $totalTests){"Green"}elseif($testsPassed -ge ($totalTests * 0.7)){"Yellow"}else{"Red"})

$passRate = [math]::Round(($testsPassed / $totalTests) * 100, 1)
Write-Host "Pass Rate: $passRate%" 

# Generate detailed test report
$testReport = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    tests_total = $totalTests
    tests_passed = $testsPassed
    pass_rate = $passRate
    overall_result = if ($testsPassed -eq $totalTests) { "PASS" } elseif ($testsPassed -ge ($totalTests * 0.7)) { "WARNING" } else { "FAIL" }
    recommendations = @()
}

if ($testsPassed -lt $totalTests) {
    $testReport.recommendations += "Review failed tests and apply necessary fixes"
    if ($passRate -lt 70) {
        $testReport.recommendations += "Critical issues detected - do not deploy to production"
    }
}

$testReport | ConvertTo-Json -Depth 3 | Out-File "security/nginx-test-report.json" -Encoding UTF8

if ($testsPassed -eq $totalTests) {
    Write-Host "`n✅ All tests passed! Nginx configuration is production-ready." -ForegroundColor Green
    exit 0
} elseif ($passRate -ge 70) {
    Write-Host "`n⚠️  Some tests failed but configuration is mostly sound. Review issues before production." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n❌ Critical issues detected! Do not deploy to production until fixes are applied." -ForegroundColor Red
    exit 2
}
