# Guide deck of BDLT PDF Presenter

The PDF that opens first in the presenter (`public/sample.pdf`) and in the viewer edition
(`public/sample-viewer.pdf`), written in LaTeX Beamer on the group's BDLT26 theme. It replaces the
PowerPoint guide of releases up to 1.4.0.

```bash
./build.sh          # both decks -> build/, copied to ../../public/sample.pdf and sample-viewer.pdf
./build.sh media    # first makes the two live figures and the cover again, then the decks
./build.sh check    # the decks, then each poster against its figure, then both figures operated inside the presenter
```

Needs the repository `bdlt-beamer-media` (theme v3.4.1 or later; `BDLT_REPO=/path` if it is not
in `~/Projects/bdlt-beamer-media`), TeX Live and Python 3. `media` and `check` also need Node with
Playwright (`npm install playwright`); `media` needs `pip install fonttools brotli`.

| File | |
|---|---|
| `deck.tex` | the source of both editions (`\ifguideviewer` marks what differs) |
| `deck-viewer.tex` | written by `build.sh`: `deck.tex` with `\guideviewer` set |
| `deck-handout.tex` | the handout wrapper; built only to check that it carries no live media |
| `outline.md` | one row per slide, with its ID |
| `make-icons.py`, `guide-icons.tex` | the toolbar icons as TikZ drawings (the same paths as in `public/index.html`) |
| `media/` | the cover and the two live figures; start with `media/README.md` |
| `check.mjs` | operates both figures in the presenter, lecturer view and projector window |
| `media/check-posters.py` | compares the poster of each figure, as it stands in the built decks, with the figure in the browser |

Every picture is a vector drawing: the PDF has no bitmap. The presenter's deck is 143 kB (the
PowerPoint guide was 678 kB): 52 kB for the two live figures, which share one embedded file,
38 kB for the three logos of the footer, 30 kB for the contents of the slides (8 kB of it the
two posters), 14 kB for Source Sans in three weights, and the rest structure. `media/README.md`,
decisions 3, 7, 8 and 10, says how it was kept small; decision 11 why slide S06 is live. qpdf is used where it is installed;
without it the deck is about 3 kB larger.
