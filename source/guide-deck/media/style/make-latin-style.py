#!/usr/bin/env python3
"""make-latin-style.py -- the house style of widgets with Source Sans cut down to Latin.

    python3 make-latin-style.py /path/to/bdlt-beamer-media     -> bdlt-style-latin.css (next to this file)

bdltplots/web/bdlt-style.css of the repository carries the complete Source Sans 3 in two weights
(413 kB of 415 kB). The guide deck of BDLT PDF Presenter is downloaded by every visitor, so its
widgets take the same style with the same font, cut down to the characters listed below
(34 kB for both weights). Everything else of the file is taken over unchanged.
A widget that uses this style can only show these characters in Source Sans; any other
character falls back to the device's font. Needs fonttools and brotli (pip install fonttools brotli).
"""
import base64, io, os, re, sys
from fontTools import subset
from fontTools.ttLib import TTFont

REPO = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Projects/bdlt-beamer-media")
HERE = os.path.dirname(os.path.abspath(__file__))
# Basic Latin, Latin-1 (accents, x, degree sign), dashes, quotes, ellipsis, bullet, minus, arrows, thin spaces
UNICODES = "U+0020-007E,U+00A0-00FF,U+2009,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+202F,U+2190-2193,U+2212"

css = open(os.path.join(REPO, "bdltplots", "web", "bdlt-style.css"), encoding="utf-8").read()

def cut(m):
    font = TTFont(io.BytesIO(base64.b64decode(m.group(1))))
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "tnum", "lnum", "pnum"]
    opts.name_IDs = [1, 2, 4, 6]
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(UNICODES))
    s.subset(font)
    out = io.BytesIO(); font.flavor = "woff2"; font.save(out)
    return "base64," + base64.b64encode(out.getvalue()).decode("ascii")

new, n = re.subn(r"base64,([A-Za-z0-9+/=]+)", cut, css)
assert n == 2, f"expected two embedded fonts in bdlt-style.css, found {n}"
head = ("/* bdlt-style-latin.css -- made by make-latin-style.py from bdltplots/web/bdlt-style.css:\n"
        "   the same style, Source Sans 3 cut down to Latin (" + UNICODES + "). Do not edit. */\n")
open(os.path.join(HERE, "bdlt-style-latin.css"), "w", encoding="utf-8").write(head + new)
print(f"bdlt-style-latin.css: {len(head + new)} bytes (bdlt-style.css: {len(css)} bytes)")
