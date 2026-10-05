# Changelog

## Unreleased

### Added
- About panel (Settings › About): icon, version and build, the group, the author, the credit
  to Claude and the libraries used.
- The guide decks have two live figures that document the presenter by being operated: "Try
  the gestures", a small screen whose four tap zones light up like the lamps of the Simon game,
  and "A slide that runs", one figure that is a picture on the left and runs on the right.
- Keys pressed after a click in a live figure still turn the page (arrows, Page Up and Down,
  Home, End, Esc): the figure hands them back to the presenter.

### Changed
- The guide decks are written in LaTeX Beamer on the BDLT26 theme (`source/guide-deck/`), in
  place of PowerPoint, and hold vector drawings only: 202 kB in place of 678 kB (viewer: 200 kB
  in place of 662 kB). A first visit downloads about a third less.

### Removed
- `source/guide-deck.pptx` and `source/guide-deck-viewer.pptx`, the PowerPoint sources of the
  earlier guide decks (they are in the history up to 1.4.0).

## 1.4.0 (5 October 2026)

### Changed
- The toolbar no longer changes width, so every button keeps its place whichever tool is
  selected. The colours have moved out of the toolbar: pen, highlighter and laser show their
  current colour as a dot on the button, and a tap on the tool that is already selected opens
  its colours in a small menu below it.
- The slide counter has a fixed width, so the buttons next to it stay put from slide 9 to 10.
- The laser colour can be picked from the laser button as well as in Settings.
- Guide decks: the tools slide says how to choose a colour.

## 1.3.0 (4 October 2026)

### Added
- Viewer edition for students, `viewer.html` (BDLT PDF Viewer): the same app without separate
  views, laser pointer, Reload button, the overview's status row (elapsed time, clock, slide
  number) and the fine-tuning settings; opening,
  navigating, media, pen, highlighter, eraser and saving stay. It has its own guide deck
  (`sample-viewer.pdf`) and keeps its own settings. The deployment makes it from
  `index.html`; `index.html?viewer=1` shows it locally.

## 1.2.0 (3 October 2026)

### Added
- First and last slide: « and » buttons in the toolbar and thin ones at the two ends of the
  slide overview.
- Reload button in the toolbar (next to Open): reads the PDF again, keeping the slide and the
  ink. A green dot on it shows that the PDF is watched and reloads by itself.
- Desktop shortcuts: ⌘O open, ⌘R reload the PDF (not the app), ⌘S save, ⌘Z undo, ⇧⌘Z or
  Ctrl+Y redo (Ctrl instead of ⌘ on Windows and Linux).
- Redo.
- A PDF that was opened with Open or dropped on the window in Chrome or Edge reloads by
  itself when the file changes on disk, without the preview script.
- `index.html?pdf=<address>` opens a PDF named in the address; `&watch=1` reloads it whenever
  the file changes, keeping the current slide and the ink.
- `tools/bdlt-pdf-preview.sh <file.pdf>`: live preview on your own computer while editing
  slides.
- Guide deck: the toolbar slide shows the new buttons and shortcuts.

### Fixed
- Opening a local file while a PDF from the address is being watched no longer lets the
  watched PDF replace it.

## 1.1.2 (2 October 2026)

### Fixed
- Videos were greyed out on the iPad: Safari draws its own player controls as a grey layer over
  the whole picture. Videos now have the presenter's own slim bar (play/pause, position slider,
  time), which fades while playing; a tap on the picture plays and pauses, and a clear play
  button shows before the first play. Audio keeps the native player. (To be confirmed on the
  device.)

## 1.1.1 (2 October 2026)

### Fixed
- Apple Pencil ink inside media boxes on the iPad: the ink layers are stacked explicitly above
  video and widget layers, and a Pencil stroke that starts on media is no longer taken for a
  pan. (Changed for Safari on the iPad; to be confirmed on the device.)
- A widget's first messages (`setState`, `bdlt.asset()`) sent while it starts are no longer lost.
- The `rate` option of videos now takes effect.
- Media that cannot be loaded (web source unreachable, unsupported format) give way to the
  poster with a short message instead of an empty player.

### Added
- Widgets can take the Pencil themselves with `bdlt.pen = 'widget'` (for example the network
  pad); the default stays the presenter's ink on top.
- `design=<px>` for widgets: laid out at a fixed width and scaled, so a widget looks like its
  poster on every screen.
- A projector window that connects late receives the current state of widgets, frame
  animations and videos.
- Settings › Input log: shows the last touch, mouse and Pencil events on screen for
  troubleshooting.
- Media spec clarified (marked 1.1) and `docs/NOTES-from-presenter.md` with answers for
  `bdlt-beamer-media`.

## 1.1.0 (2 October 2026)

### Added
- Mouse and finger input alongside the Apple Pencil: a Navigate tool, drawing with the mouse
  or a finger, and Pencil mode that switches on at the first Pencil touch.
- Laser that follows the mouse, wheel panning and zooming, and keyboard shortcuts for tools.
- Media in slides (spec v1): video, audio, animated images, frame animations and interactive
  widgets, mirrored to the projector; test deck `public/media-test-v1.pdf`.
- Splash screen with the icon and version; the version is also shown in Settings.
- Update check that offers to reload when a newer version is online.
- Projector window menu (fill the screen, exit full screen, close).
- The slide overview shows elapsed time, the clock and the slide number.

### Changed
- Guide deck: "Three ways to use it", the Navigate tool, media and separate-views steps.

## 1.0 (1 October 2026)

- First version: full-screen PDF presenter for iPad with tap zones, slide overview, pinch
  zoom, pen, highlighter, laser and eraser in UZH colours, saving ink into a new PDF,
  settings, and separate views with a lecturer view and a projector window.
