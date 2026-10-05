#!/usr/bin/env bash
# build.sh -- makes this component again from what is in this folder.
#   ./build.sh          the built file and its poster        ./build.sh check    then the check in the presenter
#   ./build.sh clean    removes what build.sh makes (then ./build.sh must make the same files again)
# Needs the repository bdlt-beamer-media (BDLT_REPO=/path), Python 3 with fonttools and brotli, and Node with
# Playwright for the poster (CHROMIUM=/path to use another browser). "check" builds the deck and runs ../../check.mjs.
set -euo pipefail
cd "$(dirname "$0")"
R="${BDLT_REPO:-$HOME/Projects/bdlt-beamer-media}"
# AREA: Full Image, 1147 x 445 CSS px (32.36 x 12.57 cm on the slide)
NAME=gestures; AREA=1147x445; KEYS=""                 # the slide starts at slide 1, lamps off
POSTER="lit=1&p=2&bar=1"                              # the poster: every lamp on, the small toolbar shown
if [ "${1:-}" = clean ]; then rm -rf check built.txt "$NAME.html" "$NAME-poster.pdf"; exit; fi
[ -f ../style/bdlt-style-latin.css ] || python3 ../style/make-latin-style.py "$R"     # Source Sans cut down to Latin
python3 "$R/tools/inline-widget.py" "$NAME.src.html" -o "$NAME.html"
node ../make-poster-pdf.mjs "$NAME.html" "$AREA" "$POSTER" "$NAME-poster.pdf"          # a vector poster, not a screenshot
if [ "${1:-}" = check ]; then (cd ../.. && ./build.sh check); fi
V="$(git -C "$R" describe --tags --always --dirty 2>/dev/null || true)"
[ -n "$V" ] || V="$(sed -n 's/^## \(v[0-9.]*\).*/beamer-\1/p' "$R/CHANGELOG.md" | head -1), a copy without git"
echo "bdlt-beamer-media $V" | tee built.txt
