# Auto-pull watcher for Git repository
param(
    [int]$IntervalSeconds = 15,
    [string]$Branch = "main",
    [string]$Remote = "origin"
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " CivicGridAi Auto-Pull Watcher Active" -ForegroundColor Green
Write-Host " Monitoring branch: $Remote/$Branch (polling every ${IntervalSeconds}s)" -ForegroundColor Yellow
Write-Host " Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host "=================================================" -ForegroundColor Cyan

while ($true) {
    try {
        # Fetch latest changes from remote silently
        git fetch $Remote $Branch --quiet 2>$null
        
        $localCommit = (git rev-parse HEAD).Trim()
        $remoteCommit = (git rev-parse "$Remote/$Branch").Trim()
        
        if ($localCommit -ne $remoteCommit) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Write-Host "[$timestamp] New changes detected on $Remote/$Branch! Pulling..." -ForegroundColor Yellow
            
            $pullOutput = git pull $Remote $Branch
            Write-Host "[$timestamp] Pull completed:" -ForegroundColor Green
            Write-Host $pullOutput
        }
    }
    catch {
        Write-Warning "Failed to check or pull updates: $_"
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}
