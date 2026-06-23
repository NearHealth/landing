#!/bin/bash
# Build static site for production hosting (DreamHost, etc.)
# Output goes to ./production/ — upload this folder to any static host

set -e

# Public URL the site is served from — used to rewrite SEO/social tags that are
# hardcoded to the GitHub Pages URL. Override with: SITE_URL=https://... ./build-production.sh
SITE_URL="${SITE_URL:-https://near.health}"

echo "🔨 Building production bundle for ${SITE_URL}..."

# Build with base=/ so it works at the root of any domain
VITE_BASE="/" npx vite build --base=/ --outDir production --emptyOutDir

# Inline rendered HTML into production/index.html for SEO + faster first paint.
# Soft-fails (keeps the non-prerendered index.html) if Playwright/Chromium is unavailable.
PRERENDER_OUTDIR=production PRERENDER_BASE=/ node scripts/prerender.mjs

# Repoint hardcoded github.io/landing URLs + font preloads at the real host.
# Runs independently of prerender so a Playwright flake can't skip it.
SITE_URL="$SITE_URL" OUT_DIR=production node scripts/fix-production-urls.mjs

echo ""
echo "✅ Build complete."

# Diff the fresh build against the last uploaded baseline and stage only the
# changed files into ./production-upload/ (read-only: never updates the baseline).
# After you upload, run `npm run deploy:mark` to record this deploy.
node scripts/deploy-diff.mjs
