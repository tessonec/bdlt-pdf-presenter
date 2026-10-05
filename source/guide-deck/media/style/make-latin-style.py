#!/usr/bin/env python3
"""make-latin-style.py -- the house style of widgets with Source Sans cut down to what the figures show.

    python3 make-latin-style.py /path/to/bdlt-beamer-media     -> bdlt-style-latin.css (next to this file)

bdltplots/web/bdlt-style.css of the repository carries the complete Source Sans 3 in two weights
(413 kB of 415 kB). The guide deck of BDLT PDF Presenter is downloaded by every visitor, so its
figures take the same style with the same font in both weights, cut down to the letters, digits
and signs of the keyboard (U+0020 to U+007E) and every other character that the sources of the
figures contain (they are collected below, so a new one is taken in by the next build).
About 17 kB for both weights; with all of Latin-1 it was 34 kB. Everything else of the file is
taken over unchanged. A figure can only show these characters in Source Sans; any other character
falls back to the device's font. Needs fonttools and brotli (pip install fonttools brotli).
"""
import base64, glob, io, os, re, sys
from fontTools import subset
from fontTools.ttLib import TTFont

REPO = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Projects/bdlt-beamer-media")
HERE = os.path.dirname(os.path.abspath(__file__))
# the keyboard's characters, and whatever else the figures' own sources contain
SOURCES = sorted(glob.glob(os.path.join(HERE, "..", "*", "*.src.html")) + glob.glob(os.path.join(HERE, "..", "bar", "*")))
SOURCES = [f for f in SOURCES if os.sep + "figures" + os.sep not in f]          # figures/ is made from the others
extra = sorted({c for f in SOURCES for c in open(f, encoding="utf-8").read() if ord(c) > 0x7E and not c.isspace()})
UNICODES = ",".join(["U+0020-007E"] + ["U+%04X" % ord(c) for c in extra])

css = open(os.path.join(REPO, "bdltplots", "web", "bdlt-style.css"), encoding="utf-8").read()

def cut(m):
    font = TTFont(io.BytesIO(base64.b64decode(m.group(1))), recalcTimestamp=False)   # the font keeps its own date: the same input gives the same file
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "tnum"]      # tnum: the chips and outputs use tabular digits
    # the hints stay: without them the letters come out a shade different on some screens (2 kB saved, not worth it)
    opts.name_IDs = [1, 2, 4, 6]
    opts.recalc_timestamp = False
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(UNICODES))
    s.subset(font)
    out = io.BytesIO(); font.flavor = "woff2"; font.save(out)
    return "base64," + base64.b64encode(out.getvalue()).decode("ascii")

new, n = re.subn(r"base64,([A-Za-z0-9+/=]+)", cut, css)
assert n == 2, f"expected two embedded fonts in bdlt-style.css, found {n}"
head = ("/* bdlt-style-latin.css -- made by make-latin-style.py from bdltplots/web/bdlt-style.css:\n"
        "   the same style, Source Sans 3 cut down to what the figures show (" + UNICODES + "). Do not edit. */\n")
open(os.path.join(HERE, "bdlt-style-latin.css"), "w", encoding="utf-8").write(head + new)
print(f"bdlt-style-latin.css: {len(head + new)} bytes (bdlt-style.css: {len(css)} bytes); beyond the keyboard: {' '.join(extra) or 'nothing'}")
