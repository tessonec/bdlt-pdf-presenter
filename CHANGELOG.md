# Changelog

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
