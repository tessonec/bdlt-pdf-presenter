# gestures: the tap zones of the presenter, to try on a small screen

| | |
|---|---|
| Command | `INTERACTIVE>` in spirit; asked for in words by Claudio (5 October 2026): "a visualisation that is embedded in the logic of the documentation of the presenter", and "I would make the area glow as a Simon '80 game.. when you click on a zone" |
| Shows | A small screen with a deck of five slides and the four tap zones of BDLT PDF Presenter, each in a colour of its own |
| Operated | A tap (finger or mouse) on a zone does what it does in the presenter: left third previous, right third next, top centre toolbar on or off, three quick taps in the lower quarter open the overview; a tap on a small slide of the overview jumps to it, any other tap closes it. The tapped zone lights up and fades, like a lamp of the Simon game. One button: back to the start |
| Status bar | chips `slide 2 / 5`, `toolbar on / off`, `overview open / closed`; next to them a few words that name the gesture just made |
| Model | none. The zones are those of `public/index.html` (`tap`, `singleTap`): thirds of the width, top quarter of the middle third, lower quarter; three taps within 450 ms |
| Data | none |
| Kept here | `gestures.src.html` (source), `gestures.html` (built, the figure alone), `gestures-poster.pdf`, `build.sh`, `built.txt`. The deck embeds `../figures/guide-figures.html`, which holds this figure and the other one (key `x-figure=gestures`) |
| Derived | nothing |
| Added | the key on the right that names the four zones (a square of each colour, then the words); the sentence that the middle does nothing |
| Area, keys | Full Image, 1147 x 445 CSS px (32.36 x 12.57 cm on the slide). Slide: no keys (slide 1, lamps off). Poster: `lit=1&p=2&bar=1`, every lamp on and the small toolbar shown, so that the picture reads alone. Other keys: `p` (1 to 5), `bar=1`, `sheet=1` |
| Built | `bdlt-beamer-media beamer-v3.4.1, a copy without git`: built in a cloud session from a copy of the repository at 38427da (one commit after the tag beamer-v3.4.1; `bdltmedia/` had uncommitted changes, which this component does not use) |
| Checked | `../../check.mjs` (5 October 2026, Chromium): inside the presenter with a projector window, every zone, the forgotten single tap, the overview and its jump, the lamp lighting and fading, back to the start; the projector shows the same after each; chips keep their width; nothing overflows; nothing is loaded from the network. Looked at: the first picture, a lit zone, the open overview, the poster |
| Not checked | the iPad and the Pencil; Safari |
| To know | In the presenter a single tap in the lower corners also turns the page (the lower quarter belongs to the thirds as well); the small screen leaves that out, as the static slides do. The lamps use a blur, which a PDF would hold as a bitmap: the poster state (`lit=1`) draws no blur. No sound, on purpose (a lecture room) |

```latex
% In the guide deck the file is figures/guide-figures.html, with x-figure=gestures and poster=gestures/gestures-poster.pdf.
% This is the frame for the figure alone:
\begin{frame}
  \bdltfullimage{Try the gestures}
    {\bdltwidget[id=gestures, title={A small screen with the four tap zones}]{gestures/gestures.html}}
    {Tap the zones of the small screen, with a finger or the mouse: it answers like the presenter, and each zone lights up.
     In any other PDF viewer this is a picture.}
\end{frame}
```

## Changes

- 5 October 2026: made.
