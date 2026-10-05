# Guide deck of BDLT PDF Presenter

The PDF that opens first in the presenter (`public/sample.pdf`) and in the viewer edition
(`public/sample-viewer.pdf`), written in LaTeX Beamer on the group's BDLT26 theme. It replaces the
PowerPoint guide of releases up to 1.4.0.

```bash
./build.sh          # both decks -> build/, copied to ../../public/sample.pdf and sample-viewer.pdf
./build.sh media    # first makes the two live figures and the cover again, then the decks
./build.sh check    # the decks, then check.mjs: both live figures operated inside the presenter
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

Every picture is a vector drawing: the PDF has no bitmap. The presenter's deck is 202 kB (the
PowerPoint guide was 678 kB): 136 kB of slides and 66 kB for the two live figures, which share
one embedded file. `media/README.md`, decisions 3, 7 and 8, says how it was kept small.
Ghostscript and qpdf are used where they are installed; without them the deck is about 20 kB larger.
