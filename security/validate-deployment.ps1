#!/usr/bin/env pwsh
# Oracle Lumira - Production Deployment Validation Script

param(
    [string]$Environment = "production",
    [string]$BaseUrl = "http://localhost:8080",
    [int]$Timeout = 30,
    [switch]$Detailed
)

Write-Host "🚀 Oracle Lumira Deployment Validation" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "Timeout: ${Timeout}s" -ForegroundColor Gray

$validationResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    environment = $Environment
    base_url = $BaseUrl
    checks = @()
    summary = @{
        total = 0
        passed = 0
        failed = 0
        warnings = 0
    }
}

function Add-ValidationResult {
    param(
        [string]$CheckName,
        [string]$Status, # PASS, FAIL, WARN
        [string]$Message,
        [hashtable]$Details = @{},
        [double]$Duration = 0
    )
    
    $colors = @{
        "PASS" = "Green"
        "FAIL" = "Red"
        "WARN" = "Yellow"
    }
    
    $symbols = @{
        "PASS" = "✅"
        "FAIL" = "❌"
        "WARN" = "⚠️ "
    }
    
    $durationText = if ($Duration -gt 0) { " ($([math]::Round($Duration, 2))s)" } else { "" }
    Write-Host "$($symbols[$Status]) $CheckName`: $Message$durationText" -ForegroundColor $colors[$Status]
    
    if ($Detailed -and $Details.Count -gt 0) {
        $Details.GetEnumerator() | ForEach-Object {
            Write-Host "    $($_.Key): $($_.Value)" -ForegroundColor Gray
        }
    }
    
    $validationResults.checks += @{
        name = $CheckName
        status = $Status
        message = $Message
        details = $Details
        duration = $Duration
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $validationResults.summary.total++
    switch ($Status) {
        "PASS" { $validationResults.summary.passed++ }
        "FAIL" { $validationResults.summary.failed++ }
        "WARN" { $validationResults.summary.warnings++ }
    }
}

# Helper function for HTTP requests with timeout
function Invoke-ValidationRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$TimeoutSec = 10
    )
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            TimeoutSec = $TimeoutSec
            UseBasicParsing = $true
        }
        
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body) { $params.Body = $Body }
        
        return Invoke-RestMethod @params
    } catch {
        return @{
            error = $_.Exception.Message
            status_code = $_.Exception.Response.StatusCode.value__
        }
    }
}

Write-Host "`n🏥 Starting Health Checks..." -ForegroundColor Yellow

# Check 1: Basic Health Endpoint
$start = Get-Date
try {
    $healthResponse = Invoke-ValidationRequest -Uri "$BaseUrl/health.json" -TimeoutSec $Timeout
    $duration = (Get-Date) - $start
    
    if ($healthResponse.error) {
        Add-ValidationResult "Health Endpoint" "FAIL" "Health endpoint unreachable: $($healthResponse.error)" @{
            url = "$BaseUrl/health.json"
            status_code = $healthResponse.status_code
        } $duration.TotalSeconds
    } elseif ($healthResponse.status -eq "healthy") {
        Add-ValidationResult "Health Endpoint" "PASS" "Health endpoint responding correctly" @{
            url = "$BaseUrl/health.json"
            response_time = "$([math]::Round($duration.TotalMilliseconds))ms"
        } $duration.TotalSeconds
    } else {
        Add-ValidationResult "Health Endpoint" "WARN" "Health endpoint responding but status unclear" @{
            url = "$BaseUrl/health.json"
            response = ($healthResponse | ConvertTo-Json -Compress)
        } $duration.TotalSeconds
    }
} catch {
    $duration = (Get-Date) - $start
    Add-ValidationResult "Health Endpoint" "FAIL" "Health check failed: $_" @{
        url = "$BaseUrl/health.json"
    } $duration.TotalSeconds
}

# Check 2: API Ready Endpoint
$start = Get-Date
try {
    $readyResponse = Invoke-ValidationRequest -Uri "$BaseUrl/api/ready" -TimeoutSec $Timeout
    $duration = (Get-Date) - $start
    
    if ($readyResponse.error) {
        Add-ValidationResult "API Ready" "FAIL" "API ready endpoint unreachable: $($readyResponse.error)" @{
            url = "$BaseUrl/api/ready"
            status_code = $readyResponse.status_code
        } $duration.TotalSeconds
    } elseif ($readyResponse.status -eq "ready" -or $readyResponse.ready -eq $true) {
        Add-ValidationResult "API Ready" "PASS" "API ready endpoint responding correctly" @{
            url = "$BaseUrl/api/ready"
            response_time = "$([math]::Round($duration.TotalMilliseconds))ms"
        } $duration.TotalSeconds
    } else {
        Add-ValidationResult "API Ready" "WARN" "API ready endpoint responding but status unclear" @{
            url = "$BaseUrl/api/ready"
            response = ($readyResponse | ConvertTo-Json -Compress)
        } $duration.TotalSeconds
    }
} catch {
    $duration = (Get-Date) - $start
    Add-ValidationResult "API Ready" "FAIL" "API ready check failed: $_" @{
        url = "$BaseUrl/api/ready"
    } $duration.TotalSeconds
}

# Check 3: Frontend Static Assets
Write-Host "`n🖥️  Frontend Validation..." -ForegroundColor Yellow

$start = Get-Date
try {
    $indexResponse = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec $Timeout -UseBasicParsing
    $duration = (Get-Date) - $start
    
    if ($indexResponse.StatusCode -eq 200) {
        $hasReactRoot = $indexResponse.Content -match 'id="root"'
        $hasTitle = $indexResponse.Content -match '<title>'
        
        if ($hasReactRoot -and $hasTitle) {
            Add-ValidationResult "Frontend Assets" "PASS" "Frontend loading correctly" @{
                status_code = $indexResponse.StatusCode
                content_length = $indexResponse.Content.Length
                has_react_root = $hasReactRoot
                response_time = "$([math]::Round($duration.TotalMilliseconds))ms"
            } $duration.TotalSeconds
        } else {
            Add-ValidationResult "Frontend Assets" "WARN" "Frontend loading but may be incomplete" @{
                status_code = $indexResponse.StatusCode
                has_react_root = $hasReactRoot
                has_title = $hasTitle
            } $duration.TotalSeconds
        }
    } else {
        Add-ValidationResult "Frontend Assets" "FAIL" "Frontend not loading correctly" @{
            status_code = $indexResponse.StatusCode
        } $duration.TotalSeconds
    }
} catch {
    $duration = (Get-Date) - $start
    Add-ValidationResult "Frontend Assets" "FAIL" "Frontend check failed: $_" @{
        url = $BaseUrl
    } $duration.TotalSeconds
}

# Check 4: API CORS Configuration
Write-Host "`n🌐 CORS Validation..." -ForegroundColor Yellow

$start = Get-Date
try {
    $corsHeaders = @{
        'Origin' = 'https://oraclelumira.com'
        'Access-Control-Request-Method' = 'POST'
        'Access-Control-Request-Headers' = 'content-type'
    }
    
    $corsResponse = Invoke-WebRequest -Uri "$BaseUrl/api/health" -Method OPTIONS -Headers $corsHeaders -TimeoutSec $Timeout -UseBasicParsing
    $duration = (Get-Date) - $start
    
    $allowOrigin = $corsResponse.Headers['Access-Control-Allow-Origin']
    $allowMethods = $corsResponse.Headers['Access-Control-Allow-Methods'] 
    
    if ($allowOrigin -and ($allowOrigin -eq '*' -or $allowOrigin -eq 'https://oraclelumira.com')) {
        Add-ValidationResult "CORS Configuration" "PASS" "CORS properly configured" @{
            allow_origin = $allowOrigin
            allow_methods = $allowMethods
            status_code = $corsResponse.StatusCode
        } $duration.TotalSeconds
    } else {
        Add-ValidationResult "CORS Configuration" "WARN" "CORS may not be properly configured" @{
            allow_origin = $allowOrigin
            allow_methods = $allowMethods
            status_code = $corsResponse.StatusCode
        } $duration.TotalSeconds
    }
} catch {
    $duration = (Get-Date) - $start
    Add-ValidationResult "CORS Configuration" "WARN" "CORS check inconclusive: $_" @{
        note = "CORS may still be working for actual requests"
    } $duration.TotalSeconds
}

# Check 5: Security Headers
Write-Host "`n🔒 Security Headers Validation..." -ForegroundColor Yellow

$start = Get-Date
try {
    $securityResponse = Invoke-WebRequest -Uri $BaseUrl -Method GET -TimeoutSec $Timeout -UseBasicParsing
    $duration = (Get-Date) - $start
    
    $securityHeaders = @{
        'X-Frame-Options' = $securityResponse.Headers['X-Frame-Options']
        'X-XSS-Protection' = $securityResponse.Headers['X-XSS-Protection']
        'X-Content-Type-Options' = $securityResponse.Headers['X-Content-Type-Options']
        'Content-Security-Policy' = $securityResponse.Headers['Content-Security-Policy']
        'Referrer-Policy' = $securityResponse.Headers['Referrer-Policy']
    }
    
    $presentHeaders = ($securityHeaders.GetEnumerator() | Where-Object { $_.Value }).Count
    $totalHeaders = $securityHeaders.Count
    
    if ($presentHeaders -eq $totalHeaders) {
        Add-ValidationResult "Security Headers" "PASS" "All security headers present" @{
            headers_present = "$presentHeaders/$totalHeaders"
        } $duration.TotalSeconds
    } elseif ($presentHeaders -ge ($totalHeaders * 0.6)) {
        Add-ValidationResult "Security Headers" "WARN" "Most security headers present" @{
            headers_present = "$presentHeaders/$totalHeaders"
            missing = ($securityHeaders.GetEnumerator() | Where-Object { -not $_.Value } | ForEach-Object { $_.Key }) -join ", "
        } $duration.TotalSeconds
    } else {
        Add-ValidationResult "Security Headers" "FAIL" "Insufficient security headers" @{
            headers_present = "$presentHeaders/$totalHeaders"
            missing = ($securityHeaders.GetEnumerator() | Where-Object { -not $_.Value } | ForEach-Object { $_.Key }) -join ", "
        } $duration.TotalSeconds
    }
} catch {
    $duration = (Get-Date) - $start
    Add-ValidationResult "Security Headers" "FAIL" "Security headers check failed: $_" $duration.TotalSeconds
}

# Check 6: Performance Baseline
Write-Host "`n⚡ Performance Validation..." -ForegroundColor Yellow

$performanceTests = @(
    @{ name = "Home Page"; url = $BaseUrl; threshold = 2000 }
    @{ name = "API Health"; url = "$BaseUrl/api/ready"; threshold = 1000 }
    @{ name = "Static Asset"; url = "$BaseUrl/health.json"; threshold = 500 }
)

foreach ($test in $performanceTests) {
    $start = Get-Date
    try {
        $response = Invoke-WebRequest -Uri $test.url -TimeoutSec $Timeout -UseBasicParsing
        $duration = (Get-Date) - $start
        $responseTimeMs = [math]::Round($duration.TotalMilliseconds)
        
        if ($responseTimeMs -le $test.threshold) {
            Add-ValidationResult "Performance ($($test.name))" "PASS" "Response time within threshold" @{
                response_time = "${responseTimeMs}ms"
                threshold = "$($test.threshold)ms"
                url = $test.url
            } $duration.TotalSeconds
        } else {
            Add-ValidationResult "Performance ($($test.name))" "WARN" "Response time exceeds threshold" @{
                response_time = "${responseTimeMs}ms"
                threshold = "$($test.threshold)ms"
                url = $test.url
            } $duration.TotalSeconds
        }
    } catch {
        $duration = (Get-Date) - $start
        Add-ValidationResult "Performance ($($test.name))" "FAIL" "Performance test failed: $_" @{
            url = $test.url
        } $duration.TotalSeconds
    }
}

# Check 7: Container Resource Usage (if Docker is available)
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "`n📊 Resource Usage Check..." -ForegroundColor Yellow
    
    try {
        $containers = docker ps --filter "ancestor=lumira" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
        if ($containers -and $containers.Count -gt 1) {
            $containerName = ($containers[1] -split '\s+')[0]
            
            $stats = docker stats $containerName --no-stream --format "{{.CPUPerc}}\t{{.MemUsage}}" 2>$null
            if ($stats) {
                $cpuPerc = ($stats -split '\t')[0] -replace '%', ''
                $memUsage = ($stats -split '\t')[1]
                
                $cpuFloat = [float]$cpuPerc
                $memMB = if ($memUsage -match '(\d+(?:\.\d+)?)MiB') { [float]$matches[1] } else { 0 }
                
                if ($cpuFloat -lt 80 -and $memMB -lt 1024) {
                    Add-ValidationResult "Resource Usage" "PASS" "Container resource usage normal" @{
                        cpu_usage = "$cpuPerc%"
                        memory_usage = $memUsage
                        container = $containerName
                    }
                } elseif ($cpuFloat -lt 95 -and $memMB -lt 2048) {
                    Add-ValidationResult "Resource Usage" "WARN" "Container resource usage elevated" @{
                        cpu_usage = "$cpuPerc%"
                        memory_usage = $memUsage
                        container = $containerName
                    }
                } else {
                    Add-ValidationResult "Resource Usage" "FAIL" "Container resource usage critical" @{
                        cpu_usage = "$cpuPerc%"
                        memory_usage = $memUsage
                        container = $containerName
                    }
                }
            } else {
                Add-ValidationResult "Resource Usage" "WARN" "Could not retrieve container stats"
            }
        } else {
            Add-ValidationResult "Resource Usage" "WARN" "No running containers found" @{
                note = "Container may not be running or named differently"
            }
        }
    } catch {
        Add-ValidationResult "Resource Usage" "WARN" "Container resource check failed: $_"
    }
} else {
    Add-ValidationResult "Resource Usage" "WARN" "Docker not available for resource monitoring"
}

# Final Summary
Write-Host "`n📊 Deployment Validation Summary:" -ForegroundColor Cyan
Write-Host "Total Checks: $($validationResults.summary.total)" -ForegroundColor White
Write-Host "Passed: $($validationResults.summary.passed)" -ForegroundColor Green
Write-Host "Failed: $($validationResults.summary.failed)" -ForegroundColor Red
Write-Host "Warnings: $($validationResults.summary.warnings)" -ForegroundColor Yellow

$passRate = if ($validationResults.summary.total -gt 0) {
    [math]::Round(($validationResults.summary.passed / $validationResults.summary.total) * 100, 1)
} else { 0 }

Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 90){"Green"}elseif($passRate -ge 75){"Yellow"}else{"Red"})

# Determine deployment readiness
$deploymentStatus = if ($validationResults.summary.failed -eq 0 -and $passRate -ge 90) {
    "READY"
} elseif ($validationResults.summary.failed -le 1 -and $passRate -ge 75) {
    "READY_WITH_WARNINGS"
} elseif ($validationResults.summary.failed -le 2 -or $passRate -ge 60) {
    "NOT_READY"
} else {
    "CRITICAL_ISSUES"
}

$validationResults.summary.deployment_status = $deploymentStatus
$validationResults.summary.pass_rate = $passRate

Write-Host "`nDeployment Status: $deploymentStatus" -ForegroundColor $(
    switch($deploymentStatus) {
        "READY" {"Green"}
        "READY_WITH_WARNINGS" {"Yellow"}
        "NOT_READY" {"Red"}
        "CRITICAL_ISSUES" {"Red"}
    }
)

# Recommendations
Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
switch ($deploymentStatus) {
    "READY" {
        Write-Host "✅ Deployment is ready for production!" -ForegroundColor Green
    }
    "READY_WITH_WARNINGS" {
        Write-Host "⚠️  Deployment is mostly ready but monitor warnings closely" -ForegroundColor Yellow
        Write-Host "   Consider addressing warnings before peak traffic periods" -ForegroundColor Yellow
    }
    "NOT_READY" {
        Write-Host "❌ Deployment needs fixes before production release" -ForegroundColor Red
        Write-Host "   Address failed checks and re-run validation" -ForegroundColor Red
    }
    "CRITICAL_ISSUES" {
        Write-Host "🚨 CRITICAL: Do not deploy to production!" -ForegroundColor Red
        Write-Host "   Multiple critical issues must be resolved first" -ForegroundColor Red
    }
}

# Save validation results
$validationResults | ConvertTo-Json -Depth 5 | Out-File "security/deployment-validation.json" -Encoding UTF8
Write-Host "`n📄 Full validation results saved to security/deployment-validation.json" -ForegroundColor Gray

# Exit with appropriate code
$exitCode = switch ($deploymentStatus) {
    "READY" { 0 }
    "READY_WITH_WARNINGS" { 1 }
    "NOT_READY" { 2 }
    "CRITICAL_ISSUES" { 3 }
}

exit $exitCode
