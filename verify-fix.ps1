# PowerShell script to verify and fix the template literal issue
Write-Host "🔍 Verifying CommandeTemple.tsx template literal fix..." -ForegroundColor Cyan

$filePath = "c:\Users\hp\Desktop\LumiraV1-MVP\apps\main-app\src\pages\CommandeTemple.tsx"

# Read the file content
$content = Get-Content $filePath -Raw

# Check for the problematic syntax
if ($content -match '\$\{"\$"\}') {
    Write-Host "❌ Found corrupted template literal syntax!" -ForegroundColor Red
    
    # Fix the corrupted syntax
    $fixedContent = $content -replace '\$\{"\$"\}\{window\.location\.origin\}/confirmation\?order_id=\{orderId\}', '`${window.location.origin}/confirmation?order_id=${orderId}`'
    
    # Write the fixed content
    Set-Content -Path $filePath -Value $fixedContent -NoNewline
    
    Write-Host "✅ Fixed template literal syntax!" -ForegroundColor Green
    Write-Host "Fixed: return_url: `${window.location.origin}/confirmation?order_id=`${orderId}`" -ForegroundColor Green
    
    # Stage, commit and push
    git add $filePath
    git commit -m "fix: Critical ESBuild template literal correction for deployment"
    git push
    
    Write-Host "📤 Changes pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "✅ Template literal syntax is already correct!" -ForegroundColor Green
}

# Display the relevant line to confirm
Write-Host "`n📝 Current line 33 content:" -ForegroundColor Yellow
$lines = $content -split "`n"
for ($i = 30; $i -le 35; $i++) {
    if ($i -lt $lines.Count) {
        Write-Host "$($i+1): $($lines[$i])" -ForegroundColor Gray
    }
}

Write-Host "`n🚀 Ready for Coolify deployment!" -ForegroundColor Green
