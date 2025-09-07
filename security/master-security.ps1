#!/usr/bin/env pwsh
# Oracle Lumira - Master Security Operations Script

param(
    [ValidateSet("scan", "fix", "test", "validate", "all")]
    [string]$Operation = "all",
    
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",
    
    [switch]$DryRun,
    [switch]$Verbose,
    [switch]$ContinueOnError,
    [string]$BaseUrl = "http://localhost:8080",
    [switch]$AutoFix
)

# Script metadata
$scriptVersion = "1.0.0"
$scriptName = "Oracle Lumira Security Operations"

Write-Host "🛡️  $scriptName v$scriptVersion" -ForegroundColor Green
Write-Host "Operation: $Operation | Environment: $Environment" -ForegroundColor Cyan
if ($DryRun) { Write-Host "DRY RUN MODE - No changes will be applied" -ForegroundColor Yellow }

$masterResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    version = $scriptVersion
    operation = $Operation
    environment = $Environment
    dry_run = $DryRun.IsPresent
    operations = @()
    summary = @{
        total_operations = 0
        successful_operations = 0
        failed_operations = 0
        overall_status = "PENDING"
    }
}

function Write-OperationHeader {
    param([string]$Title, [string]$Description = "")
    Write-Host "`n" + ("="*60) -ForegroundColor Gray
    Write-Host "🔧 $Title" -ForegroundColor Yellow
    if ($Description) { Write-Host "$Description" -ForegroundColor Gray }
    Write-Host ("="*60) -ForegroundColor Gray
}

function Add-OperationResult {
    param(
        [string]$OperationName,
        [bool]$Success,
        [string]$Message,
        [int]$ExitCode = 0,
        [hashtable]$Details = @{}
    )
    
    $masterResults.operations += @{
        operation = $OperationName
        success = $Success
        message = $Message
        exit_code = $ExitCode
        details = $Details
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $masterResults.summary.total_operations++
    if ($Success) {
        $masterResults.summary.successful_operations++
        Write-Host "✅ $OperationName`: $Message" -ForegroundColor Green
    } else {
        $masterResults.summary.failed_operations++
        Write-Host "❌ $OperationName`: $Message" -ForegroundColor Red
        if (-not $ContinueOnError) {
            Write-Host "🛑 Stopping due to failure (use -ContinueOnError to continue)" -ForegroundColor Red
            return $false
        }
    }
    return $true
}

function Invoke-SecurityOperation {
    param(
        [string]$ScriptName,
        [string]$OperationName,
        [array]$Arguments = @()
    )
    
    $scriptPath = "security/$ScriptName"
    if (-not (Test-Path $scriptPath)) {
        Add-OperationResult $OperationName $false "Script not found: $scriptPath"
        return $false
    }
    
    try {
        $process = Start-Process -FilePath "powershell.exe" -ArgumentList @("-ExecutionPolicy", "Bypass", "-File", $scriptPath) + $Arguments -Wait -PassThru -NoNewWindow
        
        $success = $process.ExitCode -eq 0 -or ($process.ExitCode -eq 1 -and $ContinueOnError)
        $message = if ($success) { "Completed successfully" } else { "Failed with exit code $($process.ExitCode)" }
        
        Add-OperationResult $OperationName $success $message $process.ExitCode @{
            script = $scriptPath
            arguments = ($Arguments -join " ")
        }
        
        return $success
    } catch {
        Add-OperationResult $OperationName $false "Execution failed: $_"
        return $false
    }
}

# Main operation execution
$continueExecution = $true

# Operation 1: Vulnerability Scanning
if (($Operation -eq "all" -or $Operation -eq "scan") -and $continueExecution) {
    Write-OperationHeader "Vulnerability Scanning" "Scanning for security vulnerabilities in dependencies and configuration"
    $continueExecution = Invoke-SecurityOperation "vulnerability-scan.ps1" "Vulnerability Scan"
}

# Operation 2: Security Fixes (if AutoFix is enabled or fix operation requested)
if (($Operation -eq "all" -or $Operation -eq "fix" -or $AutoFix) -and $continueExecution) {
    Write-OperationHeader "Security Fixes" "Applying automated security fixes"
    
    $fixArgs = @()
    if ($DryRun) { $fixArgs += "-DryRun" }
    if ($Verbose) { $fixArgs += "-Verbose" }
    
    $continueExecution = Invoke-SecurityOperation "apply-fixes.ps1" "Security Fixes" $fixArgs
}

# Operation 3: Security Testing
if (($Operation -eq "all" -or $Operation -eq "test") -and $continueExecution) {
    Write-OperationHeader "Security Testing" "Running comprehensive security tests"
    
    $testArgs = @("-Environment", $Environment)
    if ($Verbose) { $testArgs += "-Verbose" }
    if ($ContinueOnError) { $testArgs += "-ContinueOnError" }
    $testArgs += @("-OutputFormat", "json")
    
    $continueExecution = Invoke-SecurityOperation "run-tests.ps1" "Security Testing" $testArgs
}

# Operation 4: Deployment Validation
if (($Operation -eq "all" -or $Operation -eq "validate") -and $continueExecution) {
    Write-OperationHeader "Deployment Validation" "Validating deployment readiness and runtime checks"
    
    $validateArgs = @("-Environment", $Environment, "-BaseUrl", $BaseUrl)
    if ($Verbose) { $validateArgs += "-Detailed" }
    
    $continueExecution = Invoke-SecurityOperation "validate-deployment.ps1" "Deployment Validation" $validateArgs
}

# Additional Operations: Nginx Testing (always run if config exists)
if ((Test-Path "nginx-fullstack.conf") -and $continueExecution) {
    Write-OperationHeader "Nginx Configuration Testing" "Validating nginx configuration and security"
    $continueExecution = Invoke-SecurityOperation "nginx-test.ps1" "Nginx Testing"
}

# Generate Master Report
Write-OperationHeader "Security Operations Summary"

$successRate = if ($masterResults.summary.total_operations -gt 0) {
    [math]::Round(($masterResults.summary.successful_operations / $masterResults.summary.total_operations) * 100, 1)
} else { 0 }

# Determine overall status
$overallStatus = if ($masterResults.summary.failed_operations -eq 0) {
    "SUCCESS"
} elseif ($masterResults.summary.successful_operations -gt $masterResults.summary.failed_operations) {
    "PARTIAL_SUCCESS"
} else {
    "FAILURE"
}

$masterResults.summary.overall_status = $overallStatus
$masterResults.summary.success_rate = $successRate

Write-Host "Total Operations: $($masterResults.summary.total_operations)" -ForegroundColor White
Write-Host "Successful: $($masterResults.summary.successful_operations)" -ForegroundColor Green
Write-Host "Failed: $($masterResults.summary.failed_operations)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if($successRate -ge 80){"Green"}elseif($successRate -ge 60){"Yellow"}else{"Red"})
Write-Host "Overall Status: $overallStatus" -ForegroundColor $(
    switch($overallStatus) {
        "SUCCESS" {"Green"}
        "PARTIAL_SUCCESS" {"Yellow"}
        "FAILURE" {"Red"}
    }
)

# Operation-specific recommendations
Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan

switch ($overallStatus) {
    "SUCCESS" {
        Write-Host "✅ All security operations completed successfully!" -ForegroundColor Green
        if ($Environment -eq "production") {
            Write-Host "🚀 System is ready for production deployment" -ForegroundColor Green
        } else {
            Write-Host "🧪 System is ready for $Environment testing" -ForegroundColor Green
        }
    }
    "PARTIAL_SUCCESS" {
        Write-Host "⚠️  Some operations completed with issues" -ForegroundColor Yellow
        Write-Host "📋 Review failed operations and consider manual intervention" -ForegroundColor Yellow
        if ($Environment -eq "production") {
            Write-Host "🔍 Carefully review issues before production deployment" -ForegroundColor Yellow
        }
    }
    "FAILURE" {
        Write-Host "❌ Multiple operations failed" -ForegroundColor Red
        Write-Host "🛠️  Manual troubleshooting required" -ForegroundColor Red
        if ($Environment -eq "production") {
            Write-Host "🚨 DO NOT deploy to production until issues are resolved" -ForegroundColor Red
        }
    }
}

# Environment-specific guidance
Write-Host "`n🎯 Environment-Specific Guidance:" -ForegroundColor Cyan
switch ($Environment) {
    "development" {
        Write-Host "- Review and fix any security issues" -ForegroundColor White
        Write-Host "- Run tests frequently during development" -ForegroundColor White
        Write-Host "- Use -AutoFix for quick issue resolution" -ForegroundColor White
    }
    "staging" {
        Write-Host "- Ensure all security tests pass" -ForegroundColor White
        Write-Host "- Validate deployment thoroughly" -ForegroundColor White
        Write-Host "- Test with production-like configuration" -ForegroundColor White
    }
    "production" {
        Write-Host "- Zero tolerance for failed security checks" -ForegroundColor White
        Write-Host "- Monitor deployment validation continuously" -ForegroundColor White
        Write-Host "- Have rollback plan ready" -ForegroundColor White
    }
}

# Next steps
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "1. Review dry run results" -ForegroundColor White
    Write-Host "2. Run without -DryRun to apply changes" -ForegroundColor White
    Write-Host "3. Re-run validation after changes" -ForegroundColor White
} else {
    Write-Host "1. Review individual operation reports in security/ directory" -ForegroundColor White
    Write-Host "2. Address any failed operations" -ForegroundColor White
    if ($overallStatus -eq "SUCCESS") {
        Write-Host "3. Proceed with deployment" -ForegroundColor White
    } else {
        Write-Host "3. Re-run after fixes: .\security\master-security.ps1 -Operation all" -ForegroundColor White
    }
}

# Save master report
$masterResults | ConvertTo-Json -Depth 6 | Out-File "security/master-security-report.json" -Encoding UTF8
Write-Host "`n📄 Master report saved to security/master-security-report.json" -ForegroundColor Gray

# Generate executive summary
$executiveSummary = @"
# Oracle Lumira Security Operations Executive Summary

**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Operation**: $Operation
**Environment**: $Environment
**Overall Status**: $overallStatus

## Results Overview
- Total Operations: $($masterResults.summary.total_operations)
- Successful: $($masterResults.summary.successful_operations)
- Failed: $($masterResults.summary.failed_operations)  
- Success Rate: $successRate%

## Operation Details
"@

foreach ($op in $masterResults.operations) {
    $status = if ($op.success) { "✅ PASS" } else { "❌ FAIL" }
    $executiveSummary += "`n- **$($op.operation)**: $status - $($op.message)"
}

$executiveSummary += @"

## Recommendations
$(switch ($overallStatus) {
    "SUCCESS" { "System is ready for deployment to $Environment environment." }
    "PARTIAL_SUCCESS" { "Review failed operations before proceeding to $Environment deployment." }
    "FAILURE" { "Critical issues detected. Do not deploy until resolved." }
})

---
*Generated by Oracle Lumira Security Operations v$scriptVersion*
"@

$executiveSummary | Out-File "security/EXECUTIVE-SUMMARY.md" -Encoding UTF8
Write-Host "📊 Executive summary saved to security/EXECUTIVE-SUMMARY.md" -ForegroundColor Gray

# Final exit code
$finalExitCode = switch ($overallStatus) {
    "SUCCESS" { 0 }
    "PARTIAL_SUCCESS" { 1 }
    "FAILURE" { 2 }
}

Write-Host "`n🏁 Security operations completed with status: $overallStatus" -ForegroundColor $(
    switch($overallStatus) {
        "SUCCESS" {"Green"}
        "PARTIAL_SUCCESS" {"Yellow"}
        "FAILURE" {"Red"}
    }
)

exit $finalExitCode
