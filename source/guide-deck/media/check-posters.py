#!/usr/bin/env python3
"""check-posters.py -- is each poster in the decks what its figure shows?

    python3 media/check-posters.py        (from the folder of the deck, after ./build.sh and media/<name>/build.sh fresh)

A poster is a TikZ drawing read off the figure (make-poster-tikz.mjs). Two things can go wrong:
the figure was changed and the poster was not made again, or TeX draws something differently
from the browser. So, for each figure:
  1. the poster made again just now (build/<name>-poster-fresh.tex) must be the poster kept in
     media/<name>/ (apart from the two lines of comment at its top);
  2. on its slide in build/deck.pdf and build/deck-viewer.pdf, the poster must look like the
     picture of the figure taken in the browser (build/<name>-live.png). Both are blurred by
     1.5 CSS px first, so that the soft edges of letters do not count; then at most 0.05 % of the
     picture may differ clearly. A missing word, a wrong colour or a shift of two pixels is more.
./build.sh check runs it. Needs pypdfium2 and Pillow (as tools/bdlt-deck.py does).
"""
import os, sys
import pypdfium2 as pdfium
from PIL import Image, ImageChops, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
DECK = os.path.dirname(HERE)
# name, title of its slide, size of the figure in CSS px (AREA in its build.sh)
FIGURES = [("gestures", "Try the gestures", 1147, 445), ("alive", "A slide that runs", 1147, 445)]
AREA_CM = (0.75, 2.42, 32.36, 12.57)          # the picture area of \bdltfullimage: x, y, width, height
BLUR, CLEAR, LIMIT = 3, 48, 0.05              # blur in px of the picture (2 per CSS px); a clear difference (of 255); % allowed
CM = 72 / 2.54
bad = 0

def say(ok, text):
    global bad
    print(("ok    " if ok else "FAIL  ") + text)
    bad += 0 if ok else 1

def body(path):
    return [l for l in open(path, encoding="utf-8").read().split("\n") if not l.startswith("%")]

for name, title, W, H in FIGURES:
    fresh, kept, live = (os.path.join(DECK, "build", name + "-poster-fresh.tex"), os.path.join(HERE, name, name + "-poster.tex"),
                         os.path.join(DECK, "build", name + "-live.png"))
    if not (os.path.exists(fresh) and os.path.exists(live)):
        sys.exit("Run media/%s/build.sh fresh first (./build.sh check does)." % name)
    say(body(fresh) == body(kept), "%s: the poster kept in media/%s/ is the one the figure gives now" % (name, name))
    shot = Image.open(live).convert("RGB")
    for deck in ("deck.pdf", "deck-viewer.pdf"):
        pdf = pdfium.PdfDocument(os.path.join(DECK, "build", deck))
        pages = [i for i in range(len(pdf)) if title in pdf[i].get_textpage().get_text_range()]
        if len(pages) != 1:
            say(False, "%s: %s has %d slides titled \"%s\"" % (name, deck, len(pages), title)); continue
        x, y, w, h = (v * CM for v in AREA_CM)
        u = min(w / W, h / H)                                   # the poster is fitted into the area and centred
        x0, y0, s = x + (w - W * u) / 2, y + (h - H * u) / 2, shot.size[0] / (W * u)
        page = pdf[pages[0]].render(scale=s).to_pil().convert("RGB")
        part = page.crop((round(x0 * s), round(y0 * s), round(x0 * s) + shot.size[0], round(y0 * s) + shot.size[1]))
        d = ImageChops.difference(shot.filter(ImageFilter.GaussianBlur(BLUR)), part.filter(ImageFilter.GaussianBlur(BLUR))).convert("L")
        share = 100 * sum(d.histogram()[CLEAR:]) / (d.size[0] * d.size[1])
        say(share <= LIMIT, "%s: on slide %d of %s the poster looks like the figure (%.3f %% differs clearly, %.2f %% allowed)" % (name, pages[0] + 1, deck, share, LIMIT))
        if share > LIMIT:
            out = os.path.join(DECK, "build", "%s-%s-differs.png" % (name, deck[:-4]))
            d.point(lambda v: 255 - min(255, v * 4)).save(out); print("      where: " + out)
print("All posters match their figures." if not bad else "%d problem(s)." % bad)
sys.exit(1 if bad else 0)
