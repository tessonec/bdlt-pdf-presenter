#!/usr/bin/env bash
# build.sh -- the guide decks of BDLT PDF Presenter, from this folder.
#   ./build.sh          both editions: build/deck.pdf (presenter) and build/deck-viewer.pdf (students),
#                       copied to ../../public/sample.pdf and ../../public/sample-viewer.pdf
#   ./build.sh media    first makes the two live figures again (media/*/build.sh), then the decks
#   ./build.sh check    the decks, then media/check-posters.py (each poster against its figure) and
#                       check.mjs (both live figures operated inside the presenter)
# Needs the repository bdlt-beamer-media (BDLT_REPO=/path) with its TeX set-up, and Python 3.
# "media" and "check" also need Node with Playwright (npm install playwright). Ghostscript and qpdf
# are used where they are installed, to make the posters and the finished files a little smaller.
set -euo pipefail
cd "$(dirname "$0")"
R="${BDLT_REPO:-$HOME/Projects/bdlt-beamer-media}"
PUBLIC="${PUBLIC:-../../public}"
if [ "${1:-}" = media ]; then
  python3 media/style/make-latin-style.py "$R"
  node media/make-cover.mjs
  for b in media/*/build.sh; do bash "$b"; done
fi
# both figures in one file for the deck: Source Sans and D3 once (media/figures/make-figures.py)
python3 media/figures/make-figures.py
python3 "$R/tools/inline-widget.py" media/figures/guide-figures.src.html -o media/figures/guide-figures.html
python3 make-icons.py
# the release this guide describes, for the title slide: the one written in the presenter itself
V="$(sed -n "s/.*const APP_RELEASE = '\([0-9.]*\)'.*/\1/p" "$PUBLIC/index.html" 2>/dev/null | head -1)"
printf '%%%% guide-version.tex -- written by build.sh from public/index.html; do not edit.\n\\def\\guideversion{%s}\n' "$V" > guide-version.tex
# the viewer edition is the same source with \guideviewer set; a file of its own, so that its slides keep their IDs
{ echo '% deck-viewer.tex -- written by build.sh from deck.tex: the viewer edition (students). Do not edit; edit deck.tex.'
  echo '\def\guideviewer{}'; tail -n +2 deck.tex; } > deck-viewer.tex
python3 "$R/tools/bdlt-deck.py" build deck.tex
python3 "$R/tools/bdlt-deck.py" build deck-viewer.tex --no-handout
# qpdf, where it is installed, packs the finished files a little tighter (about 3 kB each); the pages stay the same
if command -v qpdf >/dev/null 2>&1; then
  for f in build/deck.pdf build/deck-viewer.pdf; do
    qpdf --object-streams=generate --recompress-flate --compression-level=9 "$f" "$f.tmp" && mv "$f.tmp" "$f"
  done
fi
python3 "$R/tools/check-media.py" build/deck.pdf | tail -1
if [ -d "$PUBLIC" ]; then
  cp build/deck.pdf "$PUBLIC/sample.pdf"; cp build/deck-viewer.pdf "$PUBLIC/sample-viewer.pdf"
  ls -l "$PUBLIC/sample.pdf" "$PUBLIC/sample-viewer.pdf"
fi
if [ "${1:-}" = check ]; then
  for b in media/*/build.sh; do bash "$b" fresh; done      # each poster made again, and a picture of each figure
  python3 media/check-posters.py                            # the posters are up to date and look like the figures
  PUBLIC="$PUBLIC" node check.mjs
fi
