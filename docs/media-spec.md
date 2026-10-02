# BDLT media in PDF slides: specification v1

Status: v1, 1 October 2026; clarified 2 October 2026 (additions marked *1.1*)
Owner of this document: `bdlt-pdf-presenter` (this repository)
Producer side: `bdlt-beamer-media` (LaTeX package, widgets, decks)

This document is the contract between the two projects. The **producer** writes PDF slides
(normally LaTeX/Beamer on the BDLT26 template) that contain media markers. The **presenter**
(BDLT PDF Presenter) finds the markers and plays the media live on top of the slide. Neither
side needs to know the other's internals; both follow this document.

The key words MUST, SHOULD and MAY are used in their usual sense.

---

## 1. Principles

1. **The PDF stays a normal PDF.** Every slide with media still looks right in any PDF viewer
   or on paper: the producer draws a placeholder (poster) image where the media goes.
2. **One file.** Media SHOULD travel inside the PDF as embedded files, so a single PDF works
   offline on the iPad. Web addresses (https) are allowed for very large media.
3. **The marker is a link annotation.** It covers the placeholder exactly. Its rectangle is
   where the presenter puts the live media; its URI carries the description.
4. **Media sit under the ink.** The presenter draws Pencil ink on top of media, so the lecturer
   can annotate a running video or widget.

---

## 2. The marker

A marker is a PDF **Link annotation** (`/Subtype /Link`) with a **URI action**
(`/A << /S /URI /URI (...) >>`) whose URI starts with `bdlt-media:v1`.

- The annotation's `/Rect` defines the media area on the page (PDF user space). The presenter
  maps it to the screen exactly as it maps the page, including zoom.
- The link MUST be invisible: no border (`/Border [0 0 0]`), no highlight colour.
- A page MAY carry several markers. Markers MUST NOT overlap.

### 2.1 URI syntax

```
bdlt-media:v1;type=<type>;src=<source>[;<key>[=<value>]]...
```

- Fields are separated by `;`. Each field is `key=value`, or a bare `key` meaning `key=1`.
- Keys are lower case ASCII. Unknown keys MUST be ignored by the presenter.
- Values are percent-encoded (RFC 3986) when they contain `;`, `=`, `%`, `#`, spaces or
  non-ASCII characters. In LaTeX, a literal `%` must be written `\%` inside `\href`.
- Booleans: `1`/`0`. A bare key means `1`. Absent means the default listed below.
- The version (`v1`) comes first. A presenter that does not know the version MUST leave the
  placeholder untouched.

Example (one line):

```
bdlt-media:v1;type=video;src=attach:consensus.mp4;id=consensus;controls;muted;autoplay
```

### 2.2 Common keys (all types)

| Key | Value | Default | Meaning |
|---|---|---|---|
| `type` | `video`, `audio`, `image`, `frames`, `widget` | required | Kind of media (section 3) |
| `src` | source (section 2.3) | required | Where the media is |
| `id` | `[A-Za-z0-9_-]+` | none | Identity across pages. Pages with a marker of the same `id` and the same rectangle (Beamer overlays, `\pause`) keep the **same live element**: a video keeps playing, a widget keeps its state. Without `id`, every page starts fresh. *1.1:* an `id` is **document-wide** and MUST refer to one media file (one `src`) in the whole PDF; the presenter keeps one element per `id`, wherever its pages are. |
| `fit` | `contain`, `cover`, `fill` | `contain` | How the media fills the rectangle (CSS `object-fit`) |
| `bg` | `#RRGGBB` or `none` | `none` | Background behind the media inside the rectangle |
| `title` | text | none | Accessible label; shown in the presenter's slide strip |

### 2.3 Sources

| Form | Meaning |
|---|---|
| `attach:<name>` | A file embedded in the PDF's document-level **EmbeddedFiles** name tree, looked up by its name (the `/F` / `/UF` file name, matched exactly, case-sensitive). This is the preferred form. |
| `https://...` | A file on the web (percent-encode `;`). Needs a network connection during the lecture. The server MUST allow cross-origin reads (CORS) for `widget` and `frames`. |

Embedded file names SHOULD be unique per PDF and use only `[A-Za-z0-9._-]`. Producers SHOULD
set the MIME type (`/Subtype`) of each embedded file; the presenter also infers it from the
extension.

---

## 3. Media types

### 3.1 `video`

Plays with the platform video player. Formats: MP4 (H.264 or HEVC, AAC audio) works
everywhere the presenter runs; WebM is not supported on older iPads and SHOULD be avoided.

| Key | Default | Meaning |
|---|---|---|
| `controls` | `1` | Show play/pause, scrubber and time |
| `autoplay` | `0` | Start when the slide appears. iPadOS only allows this for muted video; otherwise the presenter shows a play button and the video starts on the first tap. |
| `muted` | `0` | Start muted |
| `loop` | `0` | Repeat |
| `start` | `0` | Start time in seconds (decimal) |
| `end` | none | Stop (and loop back to `start`, if `loop`) at this time in seconds |
| `rate` | `1` | Playback speed |

### 3.2 `audio`

As `video` (`controls`, `autoplay`, `loop`, `start`, `end`, `rate`), formats MP3 or M4A/AAC.
The rectangle shows the player controls; it MAY be small.

### 3.3 `image`

A still or animated image shown at full resolution, for example an animated GIF, APNG or
animated WebP that should move during the lecture. No keys beyond the common ones.

### 3.4 `frames` (replacement for `animate`'s `\animategraphics`)

A sequence of images played as an animation, with the same model as `\animategraphics`.

| Key | Default | Meaning |
|---|---|---|
| `src` | required | A printf-style pattern with one integer field, e.g. `attach:L03_pr_pagerankloop-%02d.png`. *1.1:* **inside a marker the `%` must be percent-encoded** (section 2.1), so the marker reads `src=attach:L03_pr_pagerankloop-%2502d.png`; written unencoded, `%02` decodes to a control character and no frame is found. |
| `first` | `0` | First frame number |
| `last` | required | Last frame number (inclusive) |
| `fps` | `1` | Frames per second (decimal allowed) |
| `controls` | `1` | Show play/pause, previous/next frame and a frame slider |
| `autoplay` | `0` | Start when the slide appears (allowed for frames, no sound) |
| `loop` | `0` | Repeat from the first frame |
| `palindrome` | `0` | Play forwards then backwards (as `animate`'s `palindrome`) |

Frames SHOULD be PNG, JPEG or SVG, all with the same size. The placeholder SHOULD be the
first frame. The presenter preloads all frames before playing.

### 3.5 `widget` (interactive HTML)

A self-contained HTML page rendered live inside the rectangle, e.g. sliders with a Plotly plot
or an evolving D3 network.

| Key | Default | Meaning |
|---|---|---|
| `src` | required | `attach:<name>.html` or `https://...` |
| `assets` | none | Comma-separated list of further embedded files the widget may request (`attach:` names without the prefix), e.g. `assets=data.csv,plotly.min.js` |
| `sync` | `state` | `state`: the projector copy follows the lecturer copy through the helper (section 4). `none`: the projector shows its own copy, not synchronised. |
| `scale` | `1` | Zoom factor applied to the widget's content (CSS), so a widget designed at one size can fill a larger rectangle |
| `design` | none | *1.1:* layout width in CSS px the widget was designed at (and its poster taken at). The presenter lays the widget out at exactly this width and scales it to the rectangle, so it looks like its poster on every screen. Without it, the widget is laid out at the rectangle's size on the current screen, which differs between iPad and projector. |
| `x-<name>` | none | Free parameters passed to the widget as `bdlt.params.<name>` (string values). *1.1:* keys are lower-cased, so write names in lower case: `x-myParam` arrives as `bdlt.params.myparam`. |

Rules for widgets:

- The HTML MUST work as one file. Libraries MAY be loaded from a CDN (needs a network) or
  inlined (works offline). Plotly inlined adds about 3.5 MB, which is acceptable.
- The presenter runs the widget in a **sandboxed iframe** (`allow-scripts` only): no access to
  the presenter, cookies, storage, pop-ups or top-level navigation. The widget's own origin is
  opaque, so `localStorage` is not available.
- The page background SHOULD be transparent or match the slide.
- Fingers operate the widget; the Apple Pencil draws ink on top of it (section 5).

---

## 4. Widget helper API (`window.bdlt`)

Before the widget's own scripts run, the presenter injects a small object `window.bdlt`.
A widget that does not use it still works (`sync=none` behaviour). A widget that should look
the same on the projector uses `bdlt.setState` / `bdlt.onState`.

```js
bdlt.version          // "1"
bdlt.role             // "lecturer" | "projector" | "single"
                      //   single = same view (one screen); lecturer/projector = separate views
bdlt.params           // { name: "value", ... } from the marker's x-<name> keys
bdlt.seed             // integer, identical in the lecturer and projector copies
bdlt.random()         // seeded PRNG in [0, 1), identical sequence in both copies
bdlt.setState(obj)    // publish the widget's state (plain JSON, keep it small: < 64 KB)
bdlt.onState(fn)      // fn(obj) is called whenever the state changes, in BOTH copies,
                      //   including the copy that called setState. Drive the UI from here.
bdlt.state            // the last state, or null
bdlt.asset(name)      // Promise<string>: an object URL for an embedded file listed in `assets`
bdlt.onShow(fn)       // the slide became visible (start or resume simulations)
bdlt.onHide(fn)       // the slide was left (pause simulations, stop timers)
bdlt.now()            // ms since the widget was first shown; the projector's clock follows
                      //   the lecturer's, so time-driven animations stay aligned
bdlt.pen              // 1.1: who gets the Apple Pencil inside this widget. Default "presenter":
                      //   the Pencil writes the presenter's ink on top of the widget. A widget that
                      //   is itself edited with the Pencil sets  bdlt.pen = 'widget'  and then
                      //   receives the Pencil's pointer events; the presenter draws no ink in it.
```

Recommended pattern:

```js
const slider = document.querySelector('#damping');
slider.oninput = () => bdlt.setState({ damping: +slider.value });
bdlt.onState(s => { slider.value = s.damping; redraw(s.damping); });
bdlt.setState(bdlt.state || { damping: 0.85 });   // initial state
```

For simulations (force layouts, random walks): seed every random choice with `bdlt.random()`,
and either publish the positions occasionally with `setState` or drive the simulation from
`bdlt.now()`. The projector copy receives no touch input; it only follows the state.

When the helper is absent (the widget opened on its own in a browser), widgets SHOULD fall
back gracefully, for example with `const bdlt = window.bdlt || {...}` stubs.

---

## 5. Presenter behaviour (normative for BDLT PDF Presenter)

1. **Discovery.** For each page, the presenter reads the Link annotations, keeps those whose
   URI starts with `bdlt-media:`, parses them, and resolves `attach:` sources from the PDF's
   EmbeddedFiles. Invalid markers are ignored and the placeholder stays visible.
2. **Layering.** Page image < media < ink < live stroke. The placeholder stays rendered
   underneath and remains visible until the media is ready (no blank flash).
3. **Input.** Inside a media rectangle, finger touches go to the media (controls, sliders,
   dragging, and also pinches that start there); slide-navigation tap zones do not apply
   there. To zoom the page, pinch outside the media. The Pencil always draws ink, also over
   media: inside a widget the helper forwards Pencil events to the presenter, so the widget
   never sees them, unless the widget sets `bdlt.pen = 'widget'` (*1.1*, section 4). A mouse
   operates media like a finger.
4. **Zoom and pan.** Media scale and move with the page.
5. **Slide changes.** On leaving a page, video and audio pause and widgets receive `onHide`,
   unless the next page has a marker with the same `id` and rectangle (overlay continuity).
   Returning to a page resumes from where it was.
6. **Separate views.** The projector window shows the same media at the same place. A projector
   that connects later receives the current state of every live element (*1.1*). The
   lecturer's play, pause, seek, frame position and widget state are mirrored to the projector.
   Audio plays on the lecturer's device only, unless the projector is the one with speakers,
   which is configurable.
7. **Saving.** Saving an annotated PDF keeps markers and embedded files unchanged.
8. **Other viewers.** Nothing is required: they show the placeholder, and following the link
   does nothing useful.
9. **Failures** (*1.1*). Media that cannot be loaded (missing embedded file, web source
   unreachable, format the device cannot play) are removed so the placeholder shows, and the
   lecturer gets a short message.
10. **Widget start-up** (*1.1*). Messages a widget sends while it starts (`setState`,
   `bdlt.asset()`) are handled; `bdlt.asset()` always resolves or rejects.

---

## 6. Producer guidance (non-normative, for `bdlt-beamer-media`)

- **Placeholder plus marker.** The simplest construction in LaTeX is a hyperref link around the
  placeholder image:
  ```latex
  \href{bdlt-media:v1;type=video;src=attach:consensus.mp4;id=consensus;controls}%
       {\includegraphics[width=.9\textwidth]{media/consensus-poster.png}}
  ```
  with links made invisible (`\hypersetup{hidelinks}` or `pdfborder={0 0 0}`).
- **Embedding.** Use the `embedfile` package (`\embedfile[filespec=consensus.mp4,
  mimetype=video/mp4]{media/consensus.mp4}`), which writes the document-level EmbeddedFiles
  name tree. File attachment annotations (`attachfile`) are **not** read by the presenter.
- **Size of the marker.** The link rectangle should match the placeholder exactly; hyperref
  takes it from the box it wraps.
- **Overlays.** Give media an `id` when it spans several overlay steps, so a video does not
  restart on `\pause`.
- **Compatibility macro.** A drop-in `\bdltanimate[opts]{fps}{prefix}{first}{last}` with the
  same arguments as `\animategraphics` makes migration a one-word change; it embeds the frames
  and emits a `frames` marker. An option MAY switch it back to real `animate` for Acrobat.
- **Posters.** For videos, use a representative frame (e.g. `ffmpeg -ss 1 -i in.mp4 -frames:v 1
  poster.png`); for widgets, a screenshot of the initial state.
- **Test files.** Compiled test PDFs go to `bdlt-pdf-presenter/test/media/` with a note of the
  spec version they follow.

---

## 7. Versioning

This is version 1. Additive changes (new optional keys, new types) keep `v1`; the presenter
ignores what it does not know. Incompatible changes get `v2`, and the presenter will support
both for at least one teaching semester.
