# BDLT PDF Presenter

A full-screen PDF presenter for iPad and Apple Pencil, by the Blockchain & DLT Research Group, UZH.
It runs in Safari; use Share › Add to Home Screen to install it as a full-screen app.

## What it does

- Tap the right or left third of a slide for the next or previous slide.
- Tap the top centre to show or hide the toolbar.
- Triple-tap the lower quarter for the slide overview.
- Pinch to zoom, drag with one finger to pan, double-tap to fit.
- Pen, highlighter, laser pointer and eraser for Apple Pencil, in UZH colours.
- Save writes the ink into a new PDF.
- Settings (gear icon): pen colours (up to 10 of the 10 UZH colours), highlighter colours
  (the six UZH accents) and laser colour (UZH berry or dark green), remembered per device.
- Presenter mode (two screens): a separate projector window kept in sync with the iPad
  (page, ink, laser, zoom), plus a timer and next-slide preview. Needs Stage Manager with an
  external display set to extend (iPad with M1 chip or later), in Safari.

PDFs are opened and annotated on the iPad only; they are never uploaded.

## Files

| File | Purpose |
|---|---|
| `public/index.html` | The app (HTML, CSS and JavaScript in one file) |
| `public/sample.pdf` | The guide deck that opens first; replace it to change the default deck |
| `public/icon.png` | Home Screen icon (iPad only accepts PNG; at least 180×180 px) |
| `public/icon.svg` | Browser tab icon and editable icon source |
| `source/guide-deck.pptx` | Editable source of `sample.pdf`, on the BDLT26 template |

The app loads PDF.js and pdf-lib from cdnjs, so it needs an internet connection when opened.

## Deployment

Every push to the default branch publishes `public/` with GitLab Pages (see `.gitlab-ci.yml`).
The address is shown under Deploy › Pages. After changing `icon.png`, remove the app from the
iPad's Home Screen and add it again; iPadOS keeps the old icon otherwise.
