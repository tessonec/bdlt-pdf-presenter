# BDLT PDF Presenter

A full-screen PDF presenter for iPad and Apple Pencil, by the Blockchain & DLT Research Group, UZH.
It runs in Safari; use Share › Add to Home Screen to install it as a full-screen app.

## What it does

- Tap the right or left third of a slide for the next or previous slide.
- Tap the top centre to show or hide the toolbar.
- Triple-tap the lower quarter for the slide overview.
- Pinch to zoom, drag with one finger to pan, double-tap to fit.
- First and last slide: the « and » buttons in the toolbar and at the two ends of the slide
  overview.
- Reload (toolbar, next to Open) reads the PDF again and keeps the slide and the ink.
- Pen, highlighter, laser pointer and eraser in UZH colours, for Apple Pencil, mouse or finger.
- Save writes the ink into a new PDF.
- Same view / separate views (toolbar button): mirror one screen, or show the slides full
  screen in a projector window while this window becomes the lecturer view (elapsed time,
  clock, slide number and a permanent slide strip). The projector follows page, ink, laser
  and zoom. Works in Safari (not the Home Screen app); on iPad it needs Stage Manager with an
  external display set to extend (M1 chip or later). Open the projector window by touching
  and holding its button and choosing Open in New Window.
- Settings (gear icon): pen colours (up to 10 of the 10 UZH colours), highlighter colours
  (the six UZH accents), laser colour (UZH berry or dark green), and slide strip speed and
  glide; remembered per device.

PDFs are opened and annotated on the iPad only; they are never uploaded.

## Viewer edition for students

`viewer.html`, next to the presenter, is the same app as **BDLT PDF Viewer**: for reading the
slides, playing their videos, animations and widgets, and taking notes on them.

- Kept: Open, turning pages, first and last slide, slide overview, zoom, pen, highlighter,
  eraser, undo, clear, save, full screen, pen and highlighter colours, Pencil mode.
- Left out: separate views (projector and lecturer), the laser pointer, the Reload button,
  elapsed time and clock in the overview, and the settings for the slide strip and the input
  log.

Its address is the presenter's address plus `viewer.html`, for example
`https://tessonec.github.io/bdlt-pdf-presenter/viewer.html`. A link can open a PDF straight
away: `viewer.html?pdf=<address of the PDF>` (the PDF's server must allow other sites to read
it, or the PDF sits on the same site). It opens `sample-viewer.pdf` as its guide deck and keeps
its settings apart from the presenter's.

`viewer.html` is not in the repository: the deployment makes it as a copy of `index.html`
with the name changed (see `.gitlab-ci.yml` and `.github/workflows/pages.yml`), so there is
one app to maintain. To try it without deploying, open `index.html?viewer=1`.

## Input: Pencil, mouse or finger

The app works on an iPad with Apple Pencil, on a computer with a mouse and on a phone or
tablet with a finger.

- **Navigate tool** (arrow, the default without a Pencil): a click or tap on the right or left
  third turns the page, on the top centre shows or hides the toolbar; three in the lower
  quarter open the slide overview; dragging pans when zoomed.
- **Mouse or finger** (Pencil mode off): pick pen, highlighter, laser or eraser to draw with
  the mouse or finger; pick Navigate or press Esc to go back. Two fingers always pinch-zoom,
  even while a drawing tool is selected. The laser follows the mouse without pressing.
- **Pencil mode**: switches on by itself the first time an Apple Pencil touches the screen
  (and is remembered); then only the Pencil draws and fingers always navigate. It can be
  switched off in Settings.
- **Mouse wheel**: pans when zoomed; Ctrl/⌘ + wheel or a trackpad pinch zooms at the pointer.

| Key | Action |
|---|---|
| → ↓ Space Enter PageDown / ← ↑ Backspace PageUp | Next / previous slide |
| Home / End | First / last slide |
| V or Esc | Navigate tool |
| P / H / L / E | Pen / highlighter / laser / eraser |
| ⌘O or Ctrl+O | Open a PDF |
| ⌘R or Ctrl+R | Reload the PDF, keeping the slide and the ink (⇧⌘R reloads the whole app) |
| ⌘S or Ctrl+S | Save a PDF with the ink |
| ⌘Z or Ctrl+Z | Undo on this slide |
| ⇧⌘Z, Ctrl+Shift+Z or Ctrl+Y | Redo |
| G | Slide overview |
| T | Show or hide the toolbar |
| F | Full screen |

## Live preview while editing slides

```bash
tools/bdlt-pdf-preview.sh lecture03.pdf
```

opens the presenter in your browser, showing that PDF, and reloads it whenever the file
changes on disk (for example each time LaTeX recompiles). The slide you are on and your ink
are kept; a half-written PDF is ignored until the build has finished. The PDF may not exist
yet when you start. Everything is served from your own computer (127.0.0.1); stop with Ctrl+C.

To call it from anywhere, link it into a folder on your `PATH`:

```bash
ln -s ~/Projects/bdlt-pdf-presenter/tools/bdlt-pdf-preview.sh /usr/local/bin/bdlt-pdf-preview.sh
```

The same works on any server: `index.html?pdf=<address of a PDF>` opens that PDF instead of
the guide deck, and adding `&watch=1` reloads it when it changes.

### When does the PDF reload by itself?

A green dot on the Reload button means the open PDF is being watched and reloads by itself.

| How the PDF was opened | Reloads by itself | Reload button, ⌘R |
|---|---|---|
| `tools/bdlt-pdf-preview.sh file.pdf` (any browser) | yes | yes |
| Open or drag and drop, in Chrome or Edge | yes | yes |
| Open or drag and drop, in Safari or Firefox | no | yes, where the browser allows reading the file again; otherwise open it once more with ⌘O |
| `?pdf=<address>` without `&watch=1` | no | yes |

Browsers do not let a web page watch files on disk; Chrome and Edge offer a way for a file
the user picked, Safari and Firefox do not. For Safari, use the preview script.

## Media in slides (video, animations, interactive widgets)

PDFs can carry live media that the presenter plays on top of the slide: MP4 video, audio,
animated images, frame animations (the replacement for `animate`'s `\animategraphics`) and
interactive HTML widgets (sliders, Plotly, D3 networks). The format is defined in
[`docs/media-spec.md`](docs/media-spec.md) (v1); the LaTeX side lives in `bdlt-beamer-media`.
Other PDF viewers simply show the placeholder image.

`public/media-test-v1.pdf` is a hand-made test deck covering every media type; rebuild it with
`node test/media/make-test-pdf.js` (needs `pdf-lib`).

## Files

| File | Purpose |
|---|---|
| `public/index.html` | The app (HTML, CSS and JavaScript in one file) |
| `public/sample.pdf` | The guide deck that opens first; replace it to change the default deck |
| `public/icon.png` | Home Screen icon (iPad only accepts PNG; at least 180×180 px) |
| `public/icon.svg` | Browser tab icon and editable icon source |
| `source/guide-deck.pptx` | Editable source of `sample.pdf`, on the BDLT26 template |
| `public/sample-viewer.pdf` | The guide deck of the viewer edition |
| `source/guide-deck-viewer.pptx` | Editable source of `sample-viewer.pdf` |

The app loads PDF.js and pdf-lib from cdnjs, so it needs an internet connection when opened.

- Update check: each deployment is stamped with its commit id (see `.gitlab-ci.yml`); the
  app compares it with `version.json` when it opens or comes back to the foreground and
  offers to reload when a newer version is online. A splash screen at start and the Settings
  panel show the version: the release number (`APP_RELEASE` in `index.html`, raised by hand)
  and the first four characters of the deployed commit id.
- Projector window menu: touch the projector screen to show a menu button (top left) with
  Fill the screen / Exit full screen and Close projector window.

## Deployment

Every push to the default branch publishes `public/` with GitLab Pages (see `.gitlab-ci.yml`).
The address is shown under Deploy › Pages.

The same push can also publish to GitHub Pages, which needs no login to open
(`.github/workflows/pages.yml`). One-time setup, with `<account>` your GitHub user or
organisation:

1. Create an empty public repository `bdlt-pdf-presenter` on GitHub.
2. Let `git push` send to both servers:
   ```bash
   git remote set-url --add --push origin git@gitlab.uzh.ch:bdlt/bdlt-pdf-presenter.git
   git remote set-url --add --push origin git@github.com:<account>/bdlt-pdf-presenter.git
   git push origin master --tags
   ```
3. On GitHub: Settings › Pages › Source: **GitHub Actions**, then Actions › Pages › Run workflow
   once (later pushes deploy by themselves).

The site is then at `https://<account>.github.io/bdlt-pdf-presenter/`. After changing `icon.png`, remove the app from the
iPad's Home Screen and add it again; iPadOS keeps the old icon otherwise.
