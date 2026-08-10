$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

$Owner = "ozsp12"
$Repository = "physics_anim"
$Description = "Academic browser-based physics animations and interactive simulations."
$Homepage = "https://ozsp12.github.io/physics_anim/"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is required. Install it from https://cli.github.com/ and authenticate with 'gh auth login'."
}

$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run 'gh auth login' and execute this script again."
}

if (-not (Test-Path ".git")) {
    git init -b main
}

git add README.md CONTENTS.md CONTRIBUTING.md PUBLISHING.md REFERENCES.md CITATION.cff .gitignore .nojekyll index.html .github rollercoster_loop publish_repository.ps1 publish_repository.sh
if (-not (git status --porcelain)) {
    Write-Host "No uncommitted changes were found."
} else {
    git commit -m "Update physics animations repository"
}

$existing = gh repo view "$Owner/$Repository" 2>$null
if ($LASTEXITCODE -ne 0) {
    gh repo create "$Owner/$Repository" --public --description $Description --homepage $Homepage --source . --remote origin --push
} else {
    git remote get-url origin 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        git remote add origin "https://github.com/$Owner/$Repository.git"
    }
    git push -u origin main
}

gh api --method POST "repos/$Owner/$Repository/pages" -F "source[branch]=main" -F "source[path]=/" 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    gh api --method PUT "repos/$Owner/$Repository/pages" -F "source[branch]=main" -F "source[path]=/" | Out-Null
}

Write-Host "Repository: https://github.com/$Owner/$Repository"
Write-Host "Pages: $Homepage"
