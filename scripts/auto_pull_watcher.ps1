param (
    [int]$IntervalSeconds = 10,
    [string]$Remote = "origin",
    [string]$Branch = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🔄 CivicGrid AI - Git Auto-Pull Watcher" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Checking for updates every $IntervalSeconds seconds." -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor Gray

# Ensure we are inside a Git repository
$isGit = git rev-parse --is-inside-work-tree 2>$null
if ($isGit -ne "true") {
    Write-Host "[Error] Current directory is not a Git repository." -ForegroundColor Red
    exit 1
}

$lastCheck = ""

while ($true) {
    try {
        # Determine target branch
        $activeBranch = $Branch
        if ([string]::IsNullOrWhiteSpace($activeBranch)) {
            $activeBranch = (git branch --show-current).Trim()
        }

        if ([string]::IsNullOrWhiteSpace($activeBranch)) {
            Write-Host "[Warning] Detached HEAD state or no branch detected. Retrying..." -ForegroundColor Yellow
            Start-Sleep -Seconds $IntervalSeconds
            continue
        }

        # Fetch quietly from remote
        $fetchOutput = git fetch $Remote $activeBranch 2>&1

        # Check if local is behind remote
        $behindCountStr = (git rev-list HEAD.."$Remote/$activeBranch" --count 2>$null)
        $behindCount = 0
        if ([int]::TryParse($behindCountStr, [ref]$behindCount) -and $behindCount -gt 0) {
            $timestamp = Get-Date -Format "HH:mm:ss"
            Write-Host "`n[$timestamp] 🚀 Detected $behindCount new commit(s) on $Remote/$activeBranch! Pulling immediately..." -ForegroundColor Green
            
            # Execute pull with autostash to protect any local in-progress edits
            $pullResult = git pull --autostash $Remote $activeBranch 2>&1
            Write-Host $pullResult -ForegroundColor White
            
            # Show summary of received commits
            Write-Host "`nRecent commits received:" -ForegroundColor Cyan
            git log -n $behindCount --oneline --color=always
            
            # Detect if package.json or backend dependencies changed
            $changedFiles = (git diff --name-only HEAD~$behindCount HEAD 2>$null)
            if ($changedFiles -match "package\.json") {
                Write-Host "`n⚠️  package.json was modified. You may want to run: npm install" -ForegroundColor Yellow
            }
            if ($changedFiles -match "requirements\.txt") {
                Write-Host "`n⚠️  backend/requirements.txt was modified. You may want to update python dependencies." -ForegroundColor Yellow
            }
            
            Write-Host "`n[$timestamp] ✅ Local repository is now up to date!`n" -ForegroundColor Green
        } else {
            # In-place heartbeat update so the console isn't flooded
            $timeNow = Get-Date -Format "HH:mm:ss"
            Write-Host "`r[$timeNow] Watching $Remote/$activeBranch (checked; up to date) " -NoNewline -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Host "`n[Exception] $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds $IntervalSeconds
}
