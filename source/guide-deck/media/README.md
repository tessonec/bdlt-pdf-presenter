# Live figures of the guide deck: start here

This folder holds the media of the guide deck of BDLT PDF Presenter (`../deck.tex`): the cover and
two live figures that document the presenter by being operated. Made on 5 October 2026 with the
release beamer-v3.4.1 of `bdlt-beamer-media`, by the rules of the skill `bdlt-media`, with the
departures listed under "Decisions".

## What is here

| Folder | Command | Slide | What it is | A pattern for |
|---|---|---|---|---|
| `gestures/` | in words (an interactive figure) | S06 | The page with its four tap zones; a tapped zone lights up like a lamp of the Simon game | a figure that answers taps at places; state-driven flashes that also show on the projector; a triple tap with a time limit |
| `alive/` | in words (a small simulation) | S15 | One figure twice: a still picture on the left, running on the right | a run computed once from a seed and looked up per step; a slide that tells readers of other viewers what they miss |
| `figures/` | | S06, S15 | `guide-figures.html`: both figures in one file, which is what the deck embeds (decision 7) | several figures of a deck sharing their fonts and library |
| `cover.svg`, `cover.pdf`, `make-cover.mjs` | | S01 | the picture of the title slide, as a vector drawing | |

## What they share

- `style/`: `make-latin-style.py` writes `bdlt-style-latin.css`, the house style of widgets
  (`bdltplots/web/bdlt-style.css`) with Source Sans 3 cut down to the keyboard's characters and
  whatever else the sources of the figures contain: 28 kB in place of 415 kB (decision 10).
- `bar/`: `bdlt-bar.css` and `bdlt-bar.js`, the row under the picture with chips of fixed width.
  A minimal copy written here, because the release v3.4.1 has no `bar/`.
- `make-poster-tikz.mjs`: the poster of a figure as a TikZ drawing, read off the figure in the
  browser (`<name>/<name>-poster.tex`); `poster.tex`: `\guideposter`, which lays such a poster
  under the figure's place on the slide; `blank-poster.pdf`: the empty page the theme is given
  as poster file; `check-posters.py`: each poster against its figure (decision 10).
- No `math/`: neither figure shows a formula.
- D3, only the modules the figures use (d3-selection 3.0.0, d3-transition 3.0.1 and what they
  need: d3-color, d3-dispatch, d3-ease, d3-interpolate, d3-timer), pinned in the sources and
  inlined by `tools/inline-widget.py` of the repository: 51 kB in place of the 280 kB of d3 7.9.0.

## Decisions

1. **The figures are part of the documentation** (Claudio, 5 October 2026): "what I wanted was a
   visualisation that is embedded in the logic of the documentation of the presenter. I want a
   showcase of why the presenter is there, while documenting it." So not a figure on a BDLT topic:
   one shows why the presenter exists (`alive`), one lets the gestures be tried (`gestures`).
2. **The zones light up like the Simon game** (Claudio, 5 October 2026): "I would make the area
   glow as a Simon '80 game.. when you click on a zone". Four colours, one per zone; no sound.
3. **Small before complete** (Claudio, 5 October 2026): "Ok we go with no Pagella, Latin-only
   Source Sans, with D3", and later "let us go below a reasonable threshold". The guide deck is
   downloaded by every visitor of the presenter. A standard built widget is 417 kB inside the PDF
   (complete Source Sans 313 kB, D3 92 kB); each of these alone is 61 kB (Latin Source Sans 34 kB,
   D3's selections and transitions 16 kB). A character outside Latin would fall back to the
   device's font; a D3 function outside those modules (scales, axes, forces) is not there.
4. **Vector pictures throughout** (Claudio, 5 October 2026): "use vector images all the time".
   Posters are not made by `tools/make-poster.sh` (a screenshot): they are TikZ drawings read
   off the figures (decision 10). A poster state must not use blurs, shadows or gradients:
   `make-poster-tikz.mjs` stops when it meets one.
5. **Checked inside the presenter.** The release has no `check-widget.mjs`; `../check.mjs` opens
   the built deck in `public/index.html` with a projector window and compares both copies after
   every step. That is a stronger check for this deck, and it needs the presenter next to it.
6. **The slide starts at the beginning, the poster shows the point.** `gestures`: lamps off on
   the slide, all on in the poster. `alive`: one block on the slide, the finished chain in the
   poster.
7. **One embedded file for both figures.** `figures/make-figures.py` puts the style, markup and
   script of both sources into `figures/guide-figures.html`; the key `x-figure` chooses which one
   runs. The deck embeds it once and so carries Source Sans and D3 once: 66 kB for both figures,
   in place of 125 kB for two files. Each figure keeps its own folder, source, poster and a built
   file of its own (for the gallery deck, the live view and reuse elsewhere). (52 kB since
   decision 10.)
8. **The finished PDF is repacked** with qpdf where it is installed (about 3 kB). With all of
   this the presenter's guide is 202 kB and the viewer's 200 kB, without a bitmap: 136 kB of
   slides (posters 67 kB, the three logos of the footer 40 kB) and 66 kB for the figures.
   Superseded by decision 10: 147 kB and 144 kB.
9. **A hidden game** (Claudio, 5 October 2026): "if the user clicks a specific area in a given
   sequence of clicks, an Easter egg is triggered that shows a Simon game of the 80s, more or
   less resembling it, with the four colors ... you have the same sounds". It is in `gestures`,
   started by the taps of a zapateo, "right, right, left, right, right"; `gestures/README.md`
   has the rules and the source of the tones. The slide does not mention it.
10. **Posters drawn by TeX, and a narrower typeface in the figures** (Claudio, 5 October 2026):
   "Ok, shrink as you suggested", the UZH logo kept as it is, and for the posters: "trying to
   reproduce the actual visuals with text, to me is fine as long as it is completely
   consistent". Until then a poster was a print of the figure from the browser, which holds
   every letter as a shape of its own: 45 kB for two posters. Now `make-poster-tikz.mjs` opens
   the figure in its poster state and writes every box, line, shape and line of text as TikZ,
   at the place, size, weight and colour the browser gave it; TeX sets the text in the deck's
   own Source Sans (regular and semibold, as in the figures). Two posters cost 8 kB of drawing
   and 4 kB for the semibold weight. Nothing is drawn by hand, so a poster cannot drift from
   its figure: `check-posters.py` (in `../build.sh check`) makes each poster again and expects
   the one kept here, and compares the poster on its slide with a picture of the figure, after
   blurring both by 1.5 CSS px; at most 0.05 % of the picture may differ clearly (measured:
   0.008 % and 0.000 %). The browser is started with exact letter widths
   (`--font-render-hinting=none`), as a Mac or an iPad lays text out; on Linux it would round
   every letter to a whole pixel. In the figures, Source Sans keeps both weights and its hints
   (the figures render as before, pixel for pixel) but only the keyboard's characters: 17 kB
   in place of 34 kB. A character beyond them that a source uses is taken in by the next build.
   The guide decks are 147 kB (presenter) and 144 kB (viewer).
11. **The gestures figure is the page itself** (Claudio, 6 October 2026): "slide 6 in the guide
   serves no purpose, it can be merged in slide 7 ... no need for the controls below ... we do
   not need even the right part explanation, all can go into the slide", and, choosing between
   a larger tablet and the flat page: "without a round cover to the device. This would be more
   transparent as there is no interface nested artificially". So the figure is drawn as the
   page of slides S03 to S05, with the hand and words of those slides at the same places (their
   positions are those of `\guidezonetall` and `\guidezonewide` in `../deck.tex`), and stands on
   S06 in place of the static triple-tap slide; S14 is gone. Departures from the rules of
   `bdlt-media`, both asked for: no bar under the picture, and the chips stand inside it, in
   the middle of the page, where a tap does nothing. The words in the zones of S03 to S05 are
   set in semibold, the weight the figure has. The guide decks are 143 kB and 141 kB.
   Later the same day S05, the static slide of the toolbar zone, went as well ("Slide 5 is not
   needed at all it is already in slide 6 (which would need a new title)"): S06 is titled
   "Toolbar at the top, overview below: try all four zones". Then S03 and S04 went too
   ("they are not needed with the clickable one"): S06 is the only slide on the gestures,
   titled "The four tap zones of a slide: try them here", and the macros that drew the static
   gesture slides are gone from `../deck.tex`.

## Build, check, look

```bash
./gestures/build.sh            # or ./alive/build.sh: the built file and its poster (a .tex file)
../build.sh media              # everything of this folder (also figures/guide-figures.html), then both decks
../build.sh check              # the decks, then check-posters.py and ../check.mjs
```

Needs `BDLT_REPO` (default `~/Projects/bdlt-beamer-media`), Python 3 with `fonttools` and
`brotli`, Node with Playwright. A built file opens alone in a browser, with its keys in the
address: `gestures/gestures.html?lit=1&p=2`, `alive/alive.html?start=6`. The gallery deck is
`gallery.tex` (`python3 $BDLT_REPO/tools/bdlt-deck.py build gallery.tex --no-handout`).

Building a component again gives the same `.html` and the same poster, byte for byte.

## Use a figure in another deck

Copy its folder with `style/`, `bar/`, `make-poster-tikz.mjs`, `poster.tex` and
`blank-poster.pdf` into the `media/` of that deck, put `\usetikzlibrary{svg.path}` and
`\input{media/poster.tex}` into its preamble, and take the frame from the figure's README. Both figures are about BDLT PDF Presenter, so they fit decks
that introduce it (a first lecture of a course, a workshop on the tools).

## Make a new one here

Start from `gestures/gestures.src.html` (taps at places) or `alive/alive.src.html` (play, step,
back). Keep the head lines, the stub markers and the state block at the end; rewrite the rest.
Add the frame to `../deck.tex`, a row to `../outline.md` and to the table above, and a part to
`../check.mjs` and to `FIGURES` in `check-posters.py`.

## Not done, and to know

- Not checked on an iPad, with the Pencil, or in Safari: only Chromium.
- `tools/bdlt-deck.py new` of v3.4.1 stops with "unsupported format character"; the deck files
  were written by hand.
- The helper that hands the page-turning keys back from a figure to the presenter is part of
  the presenter since 1.5.0: with an earlier release, a click in a figure keeps the keyboard.
