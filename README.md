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
The address is shown under Deploy › Pages. After changing `icon.png`, remove the app from the
iPad's Home Screen and add it again; iPadOS keeps the old icon otherwise.
