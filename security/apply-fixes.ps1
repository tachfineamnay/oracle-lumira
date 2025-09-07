#!/usr/bin/env pwsh
# Oracle Lumira - Quick Security Fix Application Script

param(
    [switch]$DryRun,
    [switch]$SkipBackup,
    [string]$Component = "all"
)

Write-Host "🔧 Oracle Lumira Security Quick Fix" -ForegroundColor Green
Write-Host "Component: $Component" -ForegroundColor Cyan
if ($DryRun) { Write-Host "DRY RUN MODE - No changes will be applied" -ForegroundColor Yellow }

$fixesApplied = 0
$totalFixes = 0

# Create backup function
function Create-Backup {
    param([string]$FilePath)
    if (-not $SkipBackup -and (Test-Path $FilePath)) {
        $backupPath = "$FilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $FilePath $backupPath
        Write-Host "📋 Backup created: $backupPath" -ForegroundColor Gray
    }
}

# Fix 1: Docker nginx permissions
if ($Component -eq "all" -or $Component -eq "docker") {
    Write-Host "`n🐳 Fix 1: Docker Nginx Permissions..." -ForegroundColor Yellow
    $totalFixes++
    
    if (Test-Path "Dockerfile") {
        $dockerfileContent = Get-Content "Dockerfile" -Raw
        
        # Check if fix is already applied
        if ($dockerfileContent -match "/var/lib/nginx/tmp/client_body" -and $dockerfileContent -match "chmod 755 /var/lib/nginx") {
            Write-Host "✅ Docker nginx permissions already fixed" -ForegroundColor Green
            $fixesApplied++
        } else {
            Create-Backup "Dockerfile"
            
            # Apply the fix
            $fixedContent = $dockerfileContent -replace 
                'RUN mkdir -p /run/nginx /var/log/nginx /var/cache/nginx /var/lib/nginx && \\[\r\n\s]*chown -R lumira:lumira /var/log/nginx /var/cache/nginx /run/nginx',
                'RUN mkdir -p /run/nginx /var/log/nginx /var/cache/nginx /var/lib/nginx/tmp/client_body /var/lib/nginx/tmp/proxy /var/lib/nginx/tmp/fastcgi /var/lib/nginx/tmp/uwsgi /var/lib/nginx/tmp/scgi /var/lib/nginx/logs && \
    chown -R lumira:lumira /var/log/nginx /var/cache/nginx /run/nginx /var/lib/nginx && \
    chmod 755 /var/lib/nginx/tmp && chmod 755 /var/lib/nginx/logs'
            
            if (-not $DryRun) {
                $fixedContent | Out-File "Dockerfile" -Encoding UTF8 -NoNewline
                Write-Host "✅ Docker nginx permissions fixed" -ForegroundColor Green
                $fixesApplied++
            } else {
                Write-Host "🔍 Would fix Docker nginx permissions" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ Dockerfile not found" -ForegroundColor Red
    }
}

# Fix 2: Nginx configuration
if ($Component -eq "all" -or $Component -eq "nginx") {
    Write-Host "`n🌐 Fix 2: Nginx Configuration..." -ForegroundColor Yellow
    $totalFixes++
    
    if (Test-Path "nginx-fullstack.conf") {
        $nginxContent = Get-Content "nginx-fullstack.conf" -Raw
        
        # Check if fix is already applied
        if ($nginxContent -match "/var/lib/nginx/logs/access.log" -and $nginxContent -match "client_body_temp_path") {
            Write-Host "✅ Nginx configuration already fixed" -ForegroundColor Green
            $fixesApplied++
        } else {
            Create-Backup "nginx-fullstack.conf"
            
            # Apply nginx fixes
            $fixedNginxContent = $nginxContent
            
            # Fix log paths
            $fixedNginxContent = $fixedNginxContent -replace 
                'access_log /var/log/nginx/access.log;',
                'access_log /var/lib/nginx/logs/access.log;'
            
            $fixedNginxContent = $fixedNginxContent -replace 
                'error_log /var/log/nginx/error.log warn;',
                'error_log /var/lib/nginx/logs/error.log warn;'
            
            # Add PID file configuration
            if ($fixedNginxContent -notmatch "pid /run/nginx/nginx.pid;") {
                $fixedNginxContent = $fixedNginxContent -replace 
                    '(events\s*\{\s*)',
                    "# Process running as non-root user`npid /run/nginx/nginx.pid;`n`n`$1"
            }
            
            # Add temp directories
            if ($fixedNginxContent -notmatch "client_body_temp_path") {
                $tempDirs = @"
    # Temporary directories for non-root execution
    client_body_temp_path /var/lib/nginx/tmp/client_body;
    proxy_temp_path /var/lib/nginx/tmp/proxy;
    fastcgi_temp_path /var/lib/nginx/tmp/fastcgi;
    uwsgi_temp_path /var/lib/nginx/tmp/uwsgi;
    scgi_temp_path /var/lib/nginx/tmp/scgi;
    
"@
                $fixedNginxContent = $fixedNginxContent -replace 
                    '(http\s*\{\s*)',
                    "`$1`n$tempDirs"
            }
            
            if (-not $DryRun) {
                $fixedNginxContent | Out-File "nginx-fullstack.conf" -Encoding UTF8 -NoNewline
                Write-Host "✅ Nginx configuration fixed" -ForegroundColor Green
                $fixesApplied++
            } else {
                Write-Host "🔍 Would fix Nginx configuration" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ nginx-fullstack.conf not found" -ForegroundColor Red
    }
}

# Fix 3: Frontend dependencies
if ($Component -eq "all" -or $Component -eq "frontend") {
    Write-Host "`n📦 Fix 3: Frontend Dependencies..." -ForegroundColor Yellow
    $totalFixes++
    
    if (Test-Path "apps/main-app/package.json") {
        Push-Location "apps/main-app"
        
        # Check current vulnerable packages
        try {
            $auditResult = npm audit --json | ConvertFrom-Json
            $highVulns = $auditResult.metadata.vulnerabilities.high
            
            if ($highVulns -eq 0) {
                Write-Host "✅ No high-severity vulnerabilities found" -ForegroundColor Green
                $fixesApplied++
            } else {
                Write-Host "🔄 Updating vulnerable packages..." -ForegroundColor Yellow
                
                if (-not $DryRun) {
                    # Update specific vulnerable packages
                    $packagesToUpdate = @("cross-spawn", "vite", "@babel/helpers", "esbuild", "nanoid", "brace-expansion")
                    foreach ($package in $packagesToUpdate) {
                        Write-Host "  Updating $package..." -ForegroundColor Gray
                        npm update $package 2>$null
                    }
                    
                    # Verify fix
                    $newAuditResult = npm audit --json | ConvertFrom-Json
                    $newHighVulns = $newAuditResult.metadata.vulnerabilities.high
                    
                    if ($newHighVulns -lt $highVulns) {
                        Write-Host "✅ High-severity vulnerabilities reduced from $highVulns to $newHighVulns" -ForegroundColor Green
                        $fixesApplied++
                    } else {
                        Write-Host "⚠️  Manual intervention may be required for remaining vulnerabilities" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "🔍 Would update vulnerable frontend packages" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "❌ Failed to check frontend vulnerabilities: $_" -ForegroundColor Red
        }
        
        Pop-Location
    } else {
        Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
    }
}

# Fix 4: Logging configuration
if ($Component -eq "all" -or $Component -eq "logging") {
    Write-Host "`n📄 Fix 4: Logging Configuration..." -ForegroundColor Yellow
    $totalFixes++
    
    if (Test-Path "ecosystem.config.json") {
        $ecosystemContent = Get-Content "ecosystem.config.json" -Raw | ConvertFrom-Json
        
        # Check if structured logging is configured
        $hasStructuredLogging = $ecosystemContent.apps[0].env.PSObject.Properties["LOG_LEVEL"] -ne $null -and 
                               $ecosystemContent.apps[0].log_type -eq "json"
        
        if ($hasStructuredLogging) {
            Write-Host "✅ Structured logging already configured" -ForegroundColor Green
            $fixesApplied++
        } else {
            Create-Backup "ecosystem.config.json"
            
            # Apply logging configuration
            $ecosystemContent.apps[0].env | Add-Member -NotePropertyName "LOG_LEVEL" -NotePropertyValue "info" -Force
            $ecosystemContent.apps[0].env | Add-Member -NotePropertyName "REQUEST_ID_HEADER" -NotePropertyValue "x-request-id" -Force
            $ecosystemContent.apps[0] | Add-Member -NotePropertyName "log_type" -NotePropertyValue "json" -Force
            $ecosystemContent.apps[0] | Add-Member -NotePropertyName "combine_logs" -NotePropertyValue $true -Force
            $ecosystemContent.apps[0] | Add-Member -NotePropertyName "merge_logs" -NotePropertyValue $true -Force
            $ecosystemContent.apps[0] | Add-Member -NotePropertyName "time" -NotePropertyValue $true -Force
            
            if (-not $DryRun) {
                $ecosystemContent | ConvertTo-Json -Depth 10 | Out-File "ecosystem.config.json" -Encoding UTF8
                Write-Host "✅ Logging configuration updated" -ForegroundColor Green
                $fixesApplied++
            } else {
                Write-Host "🔍 Would update logging configuration" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ ecosystem.config.json not found" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n📊 Security Fix Summary:" -ForegroundColor Cyan
Write-Host "Fixes Applied: $fixesApplied/$totalFixes" -ForegroundColor $(if($fixesApplied -eq $totalFixes){"Green"}else{"Yellow"})

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN COMPLETED - No actual changes made" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to apply fixes" -ForegroundColor Yellow
} elseif ($fixesApplied -eq $totalFixes) {
    Write-Host "`n✅ All security fixes applied successfully!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test the configuration: .\security\nginx-test.ps1" -ForegroundColor White
    Write-Host "  2. Run vulnerability scan: .\security\vulnerability-scan.ps1" -ForegroundColor White
    Write-Host "  3. Commit changes: git add . && git commit -m 'Security hardening fixes'" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some fixes could not be applied automatically" -ForegroundColor Yellow
    Write-Host "Review the SECURITY-HARDENING-PATCHES.md for manual steps" -ForegroundColor Yellow
}

exit $(if($fixesApplied -eq $totalFixes) {0} else {1})
