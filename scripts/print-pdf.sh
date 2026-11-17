#!/bin/sh
# Print a single-file HTML page to PDF with headless Chrome, then render each page to PNG for review.
# Usage: scripts/print-pdf.sh page.html out.pdf   (macOS; uses PDFKit via swift for the PNGs)
set -eu
in=$(cd "$(dirname "$1")" && pwd)/$(basename "$1"); out=$2
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --allow-file-access-from-files --virtual-time-budget=8000 --print-to-pdf="$out" "file://$in" 2>/dev/null
dir="${out%.pdf}-pages"; mkdir -p "$dir"; here=$(cd "$(dirname "$0")" && pwd)
(cd "$dir" && swift "$here/render-pdf-pages.swift" "$(cd "$(dirname "$out")" && pwd)/$(basename "$out")")
echo "PDF: $out; page images: $dir"
