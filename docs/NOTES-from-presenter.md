# Notes from the presenter session (for bdlt-beamer-media)

Presenter release **1.1.1**, 2 October 2026. Answers to `PRESENTER-FINDINGS.md` and to the open
questions in `docs/NOTES-for-presenter.md`. The spec (`docs/media-spec.md`) is updated; additions
are marked *1.1*. Please refresh your copy.

## Findings

| # | Finding | Result in 1.1.1 |
|---|---|---|
| 1 | `bdlt.asset()` and the first `setState` at widget start-up were dropped | Fixed as proposed: the frame is registered before `srcdoc` is assigned. |
| 2 | `rate` had no effect | Fixed as proposed (`defaultPlaybackRate`). |
| 3 | A web source that fails left an empty player | Fixed: on the element's `error` event the player is removed, the poster shows, the lecturer gets a message. Same for images. |
| 4 | A widget cannot get the Pencil | Fixed as proposed: `bdlt.pen = 'widget'` is honoured; default `'presenter'`. In the spec, section 4. |
| 5 | On the iPad no ink inside media boxes | Two changes, not yet confirmed on the device (see below). |

### Point 5, what changed

1. **Stacking.** The ink canvases now have explicit `z-index` above the media layer and their own
   compositing layer. Safari can paint video and iframe layers above a plain canvas, which would
   match "ink shows only outside the boxes".
2. **No native panning on media.** `.media` and its children are `touch-action: none`, and the
   stage prevents `touchstart`/`touchmove` of a stylus also over media. In the widget helper the
   stylus check now looks at all changed touches (a resting palm no longer hides the Pencil) and
   also covers `touchmove`.

For checking on the device there is a new switch, **Settings › Input log**, which shows the last
pointer events on screen (`pen down on iframe`, `widget→ink move ×40`, `stroke kept: 57 points`,
`pen cancel`).

## Also new in 1.1.1

- `design=<px>` for widgets (spec 3.5): the widget is laid out at that CSS width and scaled to
  the rectangle. This answers question 3.
- A projector that connects late receives the current widget state, frame position and video
  position.

## Open questions

3. **Widget size.** Without `design`, a widget rectangle is `PDF pt × fit` CSS px, with
   `fit = min(stage width / page width, stage height / page height)`. On a 16:9 page of 960 pt
   that is about 1.2 on an 11-inch iPad and 2.0 on a 1920 px projector, so layouts differ. With
   `design=<px>` the layout width is fixed. For posters taken at 90 CSS px per template inch,
   write `design = rectangle width in pt × 1.25`.
4. **Media larger than their content.** Yes, as intended: video, images and frames use
   `object-fit` (default `contain`) inside the marker rectangle, so they land on a letterboxed
   poster. Widgets always fill the whole rectangle.
5. **Audio rectangle.** The native audio controls need about 54 CSS px of height. A 31 pt strip
   gives about 38 px on the iPad, which clips them. Use at least 45 pt (1.6 cm) of height and
   230 pt (8 cm) of width on a 960 pt page.
6. **Unknown keys.** Confirmed: ignored. `/H /N` on the link is fine.

Confirmed again: every value is percent-decoded, and a field is split at its first `=`.
