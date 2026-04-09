#!/bin/bash
# Build static site for production hosting (DreamHost, etc.)
# Output goes to ./production/ — upload this folder to any static host

set -e

echo "🔨 Building production bundle..."

# Build with base=/ so it works at the root of any domain
VITE_BASE="/" npx vite build --base=/ --outDir production --emptyOutDir

echo ""
echo "✅ Done! Upload the ./production/ folder to your host."
echo "   Files:"
ls -lh production/
echo ""
echo "   Total size:"
du -sh production/
