#!/usr/bin/env pwsh
# Oracle Lumira - Automated Security Testing Suite

param(
    [string]$Environment = "development",
    [switch]$Verbose,
    [switch]$ContinueOnError,
    [string]$OutputFormat = "console" # console, json, html
)

Write-Host "🛡️  Oracle Lumira Security Testing Suite" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Output Format: $OutputFormat" -ForegroundColor Gray

$testResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    environment = $Environment
    tests = @()
    summary = @{
        total = 0
        passed = 0
        failed = 0
        warnings = 0
        skipped = 0
    }
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status, # PASS, FAIL, WARN, SKIP
        [string]$Message,
        [hashtable]$Details = @{}
    )
    
    $colors = @{
        "PASS" = "Green"
        "FAIL" = "Red"  
        "WARN" = "Yellow"
        "SKIP" = "Gray"
    }
    
    $symbol = @{
        "PASS" = "✅"
        "FAIL" = "❌"
        "WARN" = "⚠️ "
        "SKIP" = "⏭️ "
    }
    
    Write-Host "$($symbol[$Status]) $TestName`: $Message" -ForegroundColor $colors[$Status]
    
    if ($Verbose -and $Details.Count -gt 0) {
        $Details.GetEnumerator() | ForEach-Object {
            Write-Host "    $($_.Key): $($_.Value)" -ForegroundColor Gray
        }
    }
    
    $testResults.tests += @{
        name = $TestName
        status = $Status
        message = $Message
        details = $Details
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $testResults.summary.total++
    switch ($Status) {
        "PASS" { $testResults.summary.passed++ }
        "FAIL" { $testResults.summary.failed++ }
        "WARN" { $testResults.summary.warnings++ }
        "SKIP" { $testResults.summary.skipped++ }
    }
}

# Test 1: Dependency Vulnerabilities
Write-Host "`n📦 Testing Package Vulnerabilities..." -ForegroundColor Yellow

try {
    # Frontend
    Push-Location "apps/main-app"
    $frontendAudit = npm audit --json 2>$null | ConvertFrom-Json
    $frontendHighVulns = $frontendAudit.metadata.vulnerabilities.high
    Pop-Location
    
    # Backend  
    Push-Location "apps/api-backend"
    $backendAudit = npm audit --json 2>$null | ConvertFrom-Json
    $backendHighVulns = $backendAudit.metadata.vulnerabilities.high
    Pop-Location
    
    $totalHighVulns = $frontendHighVulns + $backendHighVulns
    
    if ($totalHighVulns -eq 0) {
        Write-TestResult "Package Vulnerabilities" "PASS" "No high-severity vulnerabilities found" @{
            frontend_total = $frontendAudit.metadata.vulnerabilities.total
            backend_total = $backendAudit.metadata.vulnerabilities.total
        }
    } elseif ($totalHighVulns -le 2 -and $Environment -eq "development") {
        Write-TestResult "Package Vulnerabilities" "WARN" "$totalHighVulns high-severity vulnerabilities (acceptable in dev)" @{
            frontend_high = $frontendHighVulns
            backend_high = $backendHighVulns
        }
    } else {
        Write-TestResult "Package Vulnerabilities" "FAIL" "$totalHighVulns high-severity vulnerabilities found" @{
            frontend_high = $frontendHighVulns
            backend_high = $backendHighVulns
        }
    }
} catch {
    Write-TestResult "Package Vulnerabilities" "FAIL" "Failed to run vulnerability scan: $_"
}

# Test 2: Docker Security
Write-Host "`n🐳 Testing Docker Security..." -ForegroundColor Yellow

if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        # Build test image
        $buildOutput = docker build -t lumira-security-test . 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Test container startup as non-root
            $runOutput = docker run --rm -d --name lumira-sec-test lumira-security-test 2>&1
            if ($LASTEXITCODE -eq 0) {
                Start-Sleep 10
                
                # Check if running as non-root
                $userCheck = docker exec lumira-sec-test whoami 2>&1
                docker stop lumira-sec-test | Out-Null
                
                if ($userCheck -eq "lumira") {
                    Write-TestResult "Docker Security" "PASS" "Container runs as non-root user 'lumira'" @{
                        user = $userCheck
                    }
                } else {
                    Write-TestResult "Docker Security" "FAIL" "Container not running as expected non-root user" @{
                        actual_user = $userCheck
                        expected_user = "lumira"
                    }
                }
            } else {
                Write-TestResult "Docker Security" "FAIL" "Container failed to start: $runOutput"
            }
            
            docker rmi lumira-security-test -f | Out-Null
        } else {
            Write-TestResult "Docker Security" "FAIL" "Docker build failed: $buildOutput"
        }
    } catch {
        Write-TestResult "Docker Security" "FAIL" "Docker security test failed: $_"
    }
} else {
    Write-TestResult "Docker Security" "SKIP" "Docker not available"
}

# Test 3: Nginx Configuration Security
Write-Host "`n🌐 Testing Nginx Security..." -ForegroundColor Yellow

if (Test-Path "nginx-fullstack.conf") {
    $nginxContent = Get-Content "nginx-fullstack.conf" -Raw
    $securityIssues = @()
    
    # Check security headers
    $securityHeaders = @("X-Frame-Options", "X-XSS-Protection", "X-Content-Type-Options", "Content-Security-Policy")
    foreach ($header in $securityHeaders) {
        if ($nginxContent -notmatch "add_header.*$header") {
            $securityIssues += "Missing $header header"
        }
    }
    
    # Check for server tokens
    if ($nginxContent -match "server_tokens\s+off") {
        # Good
    } elseif ($nginxContent -notmatch "server_tokens") {
        $securityIssues += "Server tokens not explicitly disabled"
    }
    
    # Check rate limiting
    if ($nginxContent -notmatch "limit_req") {
        $securityIssues += "No rate limiting configured"
    }
    
    # Check HTTPS redirect (for production)
    if ($Environment -eq "production" -and $nginxContent -notmatch "return 301 https") {
        $securityIssues += "No HTTPS redirect configured"
    }
    
    if ($securityIssues.Count -eq 0) {
        Write-TestResult "Nginx Security" "PASS" "All security configurations present" @{
            headers_configured = $securityHeaders.Count
        }
    } elseif ($securityIssues.Count -le 2) {
        Write-TestResult "Nginx Security" "WARN" "Minor security configurations missing" @{
            issues = $securityIssues -join "; "
        }
    } else {
        Write-TestResult "Nginx Security" "FAIL" "Multiple security configurations missing" @{
            issues = $securityIssues -join "; "
            count = $securityIssues.Count
        }
    }
} else {
    Write-TestResult "Nginx Security" "FAIL" "nginx-fullstack.conf not found"
}

# Test 4: Environment Security
Write-Host "`n⚙️  Testing Environment Security..." -ForegroundColor Yellow

$envIssues = @()

# Check for hardcoded secrets in config files
$configFiles = @("ecosystem.config.json", "docker-compose.yml", "package.json")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $suspiciousPatterns = @(
            "password.*=.*['\"][^'\"]{8,}['\"]",
            "secret.*=.*['\"][^'\"]{16,}['\"]",
            "token.*=.*['\"][^'\"]{20,}['\"]",
            "key.*=.*['\"][^'\"]{16,}['\"]"
        )
        
        foreach ($pattern in $suspiciousPatterns) {
            if ($content -match $pattern) {
                $envIssues += "Potential hardcoded secret in $file"
                break
            }
        }
    }
}

# Check environment variable usage
if (Test-Path "apps/api-backend/src") {
    $srcFiles = Get-ChildItem "apps/api-backend/src" -Recurse -Filter "*.ts" -File
    $hasEnvValidation = $false
    
    foreach ($file in $srcFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "process\.env\.NODE_ENV" -or $content -match "dotenv" -or $content -match "env\..*required") {
            $hasEnvValidation = $true
            break
        }
    }
    
    if (-not $hasEnvValidation) {
        $envIssues += "No environment variable validation detected"
    }
}

if ($envIssues.Count -eq 0) {
    Write-TestResult "Environment Security" "PASS" "No environment security issues detected"
} elseif ($envIssues.Count -le 1) {
    Write-TestResult "Environment Security" "WARN" "Minor environment security issues" @{
        issues = $envIssues -join "; "
    }
} else {
    Write-TestResult "Environment Security" "FAIL" "Multiple environment security issues" @{
        issues = $envIssues -join "; "
        count = $envIssues.Count
    }
}

# Test 5: API Endpoint Security
Write-Host "`n🔌 Testing API Security..." -ForegroundColor Yellow

if (Test-Path "apps/api-backend/src/routes") {
    $routeFiles = Get-ChildItem "apps/api-backend/src/routes" -Recurse -Filter "*.ts" -File
    $securityChecks = @{
        auth_middleware = $false
        rate_limiting = $false
        input_validation = $false
        error_handling = $false
    }
    
    foreach ($file in $routeFiles) {
        $content = Get-Content $file.FullName -Raw
        
        if ($content -match "authenticateToken|requireAuth|authMiddleware") {
            $securityChecks.auth_middleware = $true
        }
        if ($content -match "rateLimit|expressRateLimit") {
            $securityChecks.rate_limiting = $true  
        }
        if ($content -match "joi\.|validator\.|express-validator") {
            $securityChecks.input_validation = $true
        }
        if ($content -match "try.*catch|\.catch\(|asyncHandler") {
            $securityChecks.error_handling = $true
        }
    }
    
    $passedChecks = ($securityChecks.Values | Where-Object { $_ -eq $true }).Count
    $totalChecks = $securityChecks.Count
    
    if ($passedChecks -eq $totalChecks) {
        Write-TestResult "API Security" "PASS" "All API security practices implemented" @{
            checks_passed = "$passedChecks/$totalChecks"
        }
    } elseif ($passedChecks -ge ($totalChecks * 0.7)) {
        Write-TestResult "API Security" "WARN" "Most API security practices implemented" @{
            checks_passed = "$passedChecks/$totalChecks"
            missing = ($securityChecks.GetEnumerator() | Where-Object { $_.Value -eq $false } | ForEach-Object { $_.Key }) -join ", "
        }
    } else {
        Write-TestResult "API Security" "FAIL" "Insufficient API security practices" @{
            checks_passed = "$passedChecks/$totalChecks"
            missing = ($securityChecks.GetEnumerator() | Where-Object { $_.Value -eq $false } | ForEach-Object { $_.Key }) -join ", "
        }
    }
} else {
    Write-TestResult "API Security" "SKIP" "API routes directory not found"
}

# Test 6: Database Security  
Write-Host "`n🗄️  Testing Database Security..." -ForegroundColor Yellow

if (Test-Path "apps/api-backend/src/models") {
    $modelFiles = Get-ChildItem "apps/api-backend/src/models" -Recurse -Filter "*.ts" -File
    $dbSecurityChecks = @{
        input_sanitization = $false
        index_optimization = $false
        field_validation = $false
        connection_security = $false
    }
    
    foreach ($file in $modelFiles) {
        $content = Get-Content $file.FullName -Raw
        
        if ($content -match "trim:|lowercase:|sanitize") {
            $dbSecurityChecks.input_sanitization = $true
        }
        if ($content -match "index\(\{.*\}\)") {
            $dbSecurityChecks.index_optimization = $true
        }
        if ($content -match "required:|validate:|match:") {
            $dbSecurityChecks.field_validation = $true
        }
    }
    
    # Check connection security
    $serverFiles = Get-ChildItem "apps/api-backend/src" -Recurse -Filter "*.ts" -File
    foreach ($file in $serverFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "mongoose\.connect.*ssl|authMechanism|authSource") {
            $dbSecurityChecks.connection_security = $true
            break
        }
    }
    
    $passedDbChecks = ($dbSecurityChecks.Values | Where-Object { $_ -eq $true }).Count
    $totalDbChecks = $dbSecurityChecks.Count
    
    if ($passedDbChecks -ge ($totalDbChecks * 0.75)) {
        Write-TestResult "Database Security" "PASS" "Good database security practices" @{
            checks_passed = "$passedDbChecks/$totalDbChecks"
        }
    } elseif ($passedDbChecks -ge ($totalDbChecks * 0.5)) {
        Write-TestResult "Database Security" "WARN" "Basic database security implemented" @{
            checks_passed = "$passedDbChecks/$totalDbChecks"
        }
    } else {
        Write-TestResult "Database Security" "FAIL" "Insufficient database security" @{
            checks_passed = "$passedDbChecks/$totalDbChecks"
        }
    }
} else {
    Write-TestResult "Database Security" "SKIP" "Database models directory not found"
}

# Generate Final Report
Write-Host "`n📊 Security Testing Summary:" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.summary.total)" -ForegroundColor White
Write-Host "Passed: $($testResults.summary.passed)" -ForegroundColor Green  
Write-Host "Failed: $($testResults.summary.failed)" -ForegroundColor Red
Write-Host "Warnings: $($testResults.summary.warnings)" -ForegroundColor Yellow
Write-Host "Skipped: $($testResults.summary.skipped)" -ForegroundColor Gray

$passRate = if ($testResults.summary.total -gt 0) { 
    [math]::Round(($testResults.summary.passed / $testResults.summary.total) * 100, 1) 
} else { 0 }

Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 80){"Green"}elseif($passRate -ge 60){"Yellow"}else{"Red"})

# Determine overall security status
$overallStatus = if ($testResults.summary.failed -eq 0 -and $testResults.summary.warnings -le 1) {
    "EXCELLENT"
} elseif ($testResults.summary.failed -le 1 -and $passRate -ge 70) {
    "GOOD"
} elseif ($testResults.summary.failed -le 2 -or $passRate -ge 50) {
    "NEEDS_IMPROVEMENT"
} else {
    "CRITICAL"
}

$testResults.summary.overall_status = $overallStatus
$testResults.summary.pass_rate = $passRate

Write-Host "`nOverall Security Status: $overallStatus" -ForegroundColor $(
    switch($overallStatus) {
        "EXCELLENT" {"Green"}
        "GOOD" {"Green"} 
        "NEEDS_IMPROVEMENT" {"Yellow"}
        "CRITICAL" {"Red"}
    }
)

# Output results in requested format
switch ($OutputFormat) {
    "json" {
        $testResults | ConvertTo-Json -Depth 5 | Out-File "security/security-test-results.json" -Encoding UTF8
        Write-Host "`n✅ Results saved to security/security-test-results.json" -ForegroundColor Green
    }
    "html" {
        # Create simple HTML report
        $htmlReport = @"
<!DOCTYPE html>
<html>
<head>
    <title>Oracle Lumira Security Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .pass { color: green; }
        .fail { color: red; }
        .warn { color: orange; }
        .skip { color: gray; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Oracle Lumira Security Test Results</h1>
    <p><strong>Timestamp:</strong> $($testResults.timestamp)</p>
    <p><strong>Environment:</strong> $($testResults.environment)</p>
    <p><strong>Overall Status:</strong> <span class="$($overallStatus.ToLower())">$overallStatus</span></p>
    
    <h2>Summary</h2>
    <ul>
        <li>Total Tests: $($testResults.summary.total)</li>
        <li>Passed: $($testResults.summary.passed)</li>
        <li>Failed: $($testResults.summary.failed)</li>
        <li>Warnings: $($testResults.summary.warnings)</li>
        <li>Pass Rate: $passRate%</li>
    </ul>
    
    <h2>Test Results</h2>
    <table>
        <tr><th>Test Name</th><th>Status</th><th>Message</th></tr>
"@
        
        foreach ($test in $testResults.tests) {
            $statusClass = $test.status.ToLower()
            $htmlReport += "<tr><td>$($test.name)</td><td class=`"$statusClass`">$($test.status)</td><td>$($test.message)</td></tr>`n"
        }
        
        $htmlReport += @"
    </table>
</body>
</html>
"@
        
        $htmlReport | Out-File "security/security-test-results.html" -Encoding UTF8
        Write-Host "`n✅ Results saved to security/security-test-results.html" -ForegroundColor Green
    }
    default {
        $testResults | ConvertTo-Json -Depth 5 | Out-File "security/security-test-results.json" -Encoding UTF8
        Write-Host "`n✅ Results also saved to security/security-test-results.json" -ForegroundColor Green
    }
}

# Exit with appropriate code
$exitCode = if ($overallStatus -eq "CRITICAL") {
    2
} elseif ($testResults.summary.failed -gt 0) {
    1  
} else {
    0
}

if ($exitCode -eq 2) {
    Write-Host "`n🚨 CRITICAL SECURITY ISSUES - Immediate attention required!" -ForegroundColor Red
} elseif ($exitCode -eq 1) {
    Write-Host "`n⚠️  Security issues detected - Review before production deployment" -ForegroundColor Yellow  
} else {
    Write-Host "`n✅ Security testing completed successfully" -ForegroundColor Green
}

exit $exitCode
