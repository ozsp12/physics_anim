#!/usr/bin/env bash
set -euo pipefail

OWNER="ozsp12"
REPOSITORY="physics_anim"
DESCRIPTION="Academic browser-based physics animations and interactive simulations."
HOMEPAGE="https://ozsp12.github.io/physics_anim/"

command -v gh >/dev/null 2>&1 || {
  echo "GitHub CLI (gh) is required: https://cli.github.com/" >&2
  exit 1
}

gh auth status >/dev/null

if [[ ! -d .git ]]; then
  git init -b main
fi

git add README.md CONTENTS.md CONTRIBUTING.md PUBLISHING.md REFERENCES.md CITATION.cff .gitignore .nojekyll index.html .github rollercoster_loop publish_repository.ps1 publish_repository.sh
if [[ -n "$(git status --porcelain)" ]]; then
  git commit -m "Update physics animations repository"
fi

if gh repo view "$OWNER/$REPOSITORY" >/dev/null 2>&1; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/$OWNER/$REPOSITORY.git"
  fi
  git push -u origin main
else
  gh repo create "$OWNER/$REPOSITORY" \
    --public \
    --description "$DESCRIPTION" \
    --homepage "$HOMEPAGE" \
    --source . \
    --remote origin \
    --push
fi

if ! gh api --method POST "repos/$OWNER/$REPOSITORY/pages" -F "source[branch]=main" -F "source[path]=/" >/dev/null 2>&1; then
  gh api --method PUT "repos/$OWNER/$REPOSITORY/pages" -F "source[branch]=main" -F "source[path]=/" >/dev/null
fi

echo "Repository: https://github.com/$OWNER/$REPOSITORY"
echo "Pages: $HOMEPAGE"
