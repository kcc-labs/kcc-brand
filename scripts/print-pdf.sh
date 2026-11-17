#!/bin/sh
# Print a single-file HTML page to PDF (Playwright, see print-pdf.ts) and render each page to PNG for review.
# Usage: scripts/print-pdf.sh page.html out.pdf [scale]   (macOS for the PNGs; uses PDFKit via swift)
set -eu
here=$(cd "$(dirname "$0")" && pwd)
node "$here/print-pdf.ts" "$1" "$2" --scale "${3:-1}"
out=$(cd "$(dirname "$2")" && pwd)/$(basename "$2"); dir="${out%.pdf}-pages"; mkdir -p "$dir"
(cd "$dir" && swift "$here/render-pdf-pages.swift" "$out" >/dev/null)
echo "page images: $dir"
