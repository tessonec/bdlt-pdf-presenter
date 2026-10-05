#!/usr/bin/env bash
# build.sh -- makes this component again from what is in this folder.
#   ./build.sh          the built file and its poster        ./build.sh check    then the check in the presenter
#   ./build.sh clean    removes what build.sh makes (then ./build.sh must make the same files again)
#   ./build.sh fresh    for ../check-posters.py: the figure built again into ../../build/, with its poster and a picture of it
# Needs the repository bdlt-beamer-media (BDLT_REPO=/path), Python 3 with fonttools and brotli, and Node with
# Playwright for the poster (CHROMIUM=/path to use another browser). "check" builds the deck and runs ../../check.mjs.
set -euo pipefail
cd "$(dirname "$0")"
R="${BDLT_REPO:-$HOME/Projects/bdlt-beamer-media}"
# AREA: Full Image, 1147 x 445 CSS px (32.36 x 12.57 cm on the slide)
NAME=alive; AREA=1147x445; KEYS="start=0"               # the slide starts with the first block only
POSTER="start=12"                                     # the poster: the finished chain in both halves
if [ "${1:-}" = clean ]; then rm -rf check built.txt "$NAME.html" "$NAME-poster.tex"; exit; fi
if [ "${1:-}" = fresh ]; then
  mkdir -p ../../build
  python3 "$R/tools/inline-widget.py" "$NAME.src.html" -o "../../build/$NAME-fresh.html" >/dev/null
  node ../make-poster-tikz.mjs "../../build/$NAME-fresh.html" "$AREA" "$POSTER" "../../build/$NAME-poster-fresh.tex" "../../build/$NAME-live.png" >/dev/null
  exit
fi
[ -f ../style/bdlt-style-latin.css ] || python3 ../style/make-latin-style.py "$R"     # Source Sans cut down to Latin
python3 "$R/tools/inline-widget.py" "$NAME.src.html" -o "$NAME.html"
node ../make-poster-tikz.mjs "$NAME.html" "$AREA" "$POSTER" "$NAME-poster.tex"         # the poster, read off the figure and written as TikZ
if [ "${1:-}" = check ]; then (cd ../.. && ./build.sh check); fi
V="$(git -C "$R" describe --tags --always --dirty 2>/dev/null || true)"
[ -n "$V" ] || V="$(sed -n 's/^## \(v[0-9.]*\).*/beamer-\1/p' "$R/CHANGELOG.md" | head -1), a copy without git"
echo "bdlt-beamer-media $V" | tee built.txt
