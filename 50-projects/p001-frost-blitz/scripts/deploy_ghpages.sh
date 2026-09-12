#!/usr/bin/env bash
# Deploy dist/ to gh-pages branch (alternative Pages path if not using Actions)
set -euo pipefail
cd "$(dirname "$0")/.."
npm --prefix game run build
git worktree add -B gh-pages .gh-pages-tmp
rm -rf .gh-pages-tmp/*
cp -r game/dist/* .gh-pages-tmp/
cd .gh-pages-tmp
git add -A
git commit -m "deploy: build $(date -u +%Y-%m-%dT%H%M%SZ)" || true
git push origin gh-pages -f
cd ..
git worktree remove .gh-pages-tmp --force
echo "✅ Deployed to gh-pages"
