#!/usr/bin/env bash
set -euo pipefail

ASSETS_DIR="$(cd "$(dirname "$0")/../public/assets" && pwd)"
BACKUP_DIR="$ASSETS_DIR/originals"

echo "=== Video Optimization Script ==="
echo "Assets directory: $ASSETS_DIR"

# Check for ffmpeg
if ! command -v ffmpeg &> /dev/null; then
  echo "ERROR: ffmpeg is not installed. Install with: brew install ffmpeg"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Process each MP4
for src in "$ASSETS_DIR"/*.mp4; do
  [ -f "$src" ] || continue
  filename="$(basename "$src")"
  name="${filename%.mp4}"

  echo ""
  echo "--- Processing: $filename ---"
  original_size=$(stat -f%z "$src")

  # Backup original
  cp "$src" "$BACKUP_DIR/$filename"
  echo "  Backed up to originals/$filename"

  # Compressed MP4
  tmp_mp4="$ASSETS_DIR/${name}_tmp.mp4"
  ffmpeg -y -i "$src" \
    -c:v libx264 \
    -crf 28 \
    -preset slow \
    -profile:v main \
    -level 4.0 \
    -pix_fmt yuv420p \
    -r 24 \
    -an \
    -movflags +faststart \
    "$tmp_mp4" 2>/dev/null
  mv "$tmp_mp4" "$src"
  mp4_size=$(stat -f%z "$src")
  echo "  MP4: $(( original_size / 1024 ))K -> $(( mp4_size / 1024 ))K ($(( mp4_size * 100 / original_size ))% of original)"

  # WebM (VP9 two-pass)
  webm_out="$ASSETS_DIR/${name}.webm"
  ffmpeg -y -i "$BACKUP_DIR/$filename" \
    -c:v libvpx-vp9 \
    -b:v 0 \
    -crf 35 \
    -pass 1 \
    -row-mt 1 \
    -tile-columns 2 \
    -r 24 \
    -an \
    -f webm \
    /dev/null 2>/dev/null

  ffmpeg -y -i "$BACKUP_DIR/$filename" \
    -c:v libvpx-vp9 \
    -b:v 0 \
    -crf 35 \
    -pass 2 \
    -row-mt 1 \
    -tile-columns 2 \
    -r 24 \
    -an \
    "$webm_out" 2>/dev/null

  # Clean up VP9 log files
  rm -f ffmpeg2pass-0.log 2>/dev/null

  webm_size=$(stat -f%z "$webm_out")
  echo "  WebM: $(( webm_size / 1024 ))K ($(( webm_size * 100 / original_size ))% of original)"
done

echo ""
echo "=== Done! ==="
echo "Originals backed up to: $BACKUP_DIR/"
