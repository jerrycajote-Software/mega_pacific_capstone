# Mega Pacific - Merge Test to Main Script
# Automatically pulls the latest test branch, merges into main, and pushes to GitHub origin.

$ErrorActionPreference = "Stop"

Write-Host "Checking git repository status..." -ForegroundColor Cyan

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH."
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Warning "You have uncommitted changes in your working tree:"
    git status -s
    Write-Host "Please commit or stash your changes before merging test into main." -ForegroundColor Yellow
    exit 1
}

$currentBranch = (git branch --show-current).Trim()
Write-Host "Current branch: $currentBranch" -ForegroundColor DarkCyan

# Fetch latest branches from origin
Write-Host "Fetching latest updates from origin..." -ForegroundColor Cyan
git fetch origin

# Switch to main
Write-Host "Switching to main branch..." -ForegroundColor Cyan
git checkout main

# Update local main
Write-Host "Pulling latest main from origin..." -ForegroundColor Cyan
git pull origin main

# Merge test branch
Write-Host "Merging test into main..." -ForegroundColor Cyan
try {
    git merge test -m "chore(sync): merge test branch updates into main"
    Write-Host "Merge completed successfully." -ForegroundColor Green
} catch {
    Write-Error "Merge conflict detected! Please resolve conflicts manually in your editor."
    exit 1
}

# Push to origin main
Write-Host "Pushing merged changes to origin/main..." -ForegroundColor Cyan
git push origin main

# Switch back to original branch
if ($currentBranch -and $currentBranch -ne "main") {
    Write-Host "Returning to previous branch ($currentBranch)..." -ForegroundColor Cyan
    git checkout $currentBranch
}

Write-Host "Done! Successfully merged test updates into main and pushed to GitHub." -ForegroundColor Green

