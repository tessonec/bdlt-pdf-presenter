# gestures: the four tap zones of the presenter, to try on the page itself

| | |
|---|---|
| Command | `INTERACTIVE>` in spirit; asked for in words by Claudio (5 October 2026): "a visualisation that is embedded in the logic of the documentation of the presenter", and "I would make the area glow as a Simon '80 game.. when you click on a zone" |
| Shows | The page of a slide with the four tap zones of BDLT PDF Presenter, drawn as on the two slides before it in the guide deck: each zone with a hand and its words at the same places, each in a colour of its own. No device frame, no bar below, no text at the side |
| Operated | A tap (finger or mouse) on a zone is counted as what it does in the presenter: left third previous, right third next, top centre toolbar on or off, three quick taps in the lower quarter open the overview, and the next tap closes it. The tapped zone lights up and fades, like a lamp of the Simon game. No button |
| Status bar | none below the picture (Claudio: "no need for the controls below"). Three chips of fixed width stand in the middle of the page, the part that does nothing: `slide 2 / 5`, `toolbar on / off`, `overview open / closed`; under them a few words that name the gesture just made. In the hidden game: `round 3 / 8`, `watch / your turn / well done / try again`, `best 5` |
| Hidden | **A memory game on the four lamps**, not mentioned on the slide. Tapping right, right, left, right, right (a zapateo) starts it: the hands and words go and the zones are four lamps, the lamps play a growing sequence with a tone each, the player repeats it, eight in a row win. A wrong lamp, or three seconds without an answer, loses with a low buzz; a tap on a lamp then starts again. A tap in the middle of the page ends it, and so does leaving the slide. |
| Model | none. The zones are those of `public/index.html` (`tap`, `singleTap`): thirds of the width, top quarter of the middle third, lower quarter; three taps within 450 ms. The game follows the electronic game Simon of 1978, with the tones and times measured on an original (waitingforfriday.com, "Reverse engineering an MB Electronic Simon game"): square waves of 415 Hz (green, here the left pad), 310 Hz (red, right), 252 Hz (yellow, top) and 209 Hz (blue, bottom); 0.42 s per lamp up to five lamps and 0.32 s from six on, 0.05 s between lamps; 3 s to answer; losing: 42 Hz for 1.5 s; winning: six short beeps of the last lamp; 8 lamps win (its first level). The look is this figure's own, not the toy's |
| Data | none |
| Kept here | `gestures.src.html` (source), `gestures.html` (built, the figure alone), `gestures-poster.tex` (the poster as a TikZ drawing, read off the figure by `../make-poster-tikz.mjs`), `build.sh`, `built.txt`. The deck embeds `../figures/guide-figures.html`, which holds this figure and the other one (key `x-figure=gestures`) |
| Derived | nothing |
| Added | the three chips and the line of words in the middle of the page; "Tap the middle to end the game" during the game |
| Area, keys | The page of a diagram slide, 1147 x 507 CSS px (32.36 x 14.31 cm on the slide, placed with `\bdltarea`). Slide: no keys (lamps off). Poster: `lit=1`, every lamp on, so that the picture reads alone as the summary of the four gestures. Other keys: `p` (1 to 5), `bar=1`, `sheet=1`, `sound=0` |
| Built | `bdlt-beamer-media beamer-v3.4.1, a copy without git`: built in a cloud session from a copy of the repository at 38427da (one commit after the tag beamer-v3.4.1; `bdltmedia/` had uncommitted changes, which this component does not use) |
| Checked | `../../check.mjs` (6 October 2026, Chromium): inside the presenter with a projector window, every zone, the forgotten single tap, the overview opening and closing, the lamp lighting and fading, the hand and words of each zone, and the hidden game (its start, a right lamp, a wrong lamp, its end by a tap in the middle); the projector shows the same after each; chips keep their width; nothing overflows; nothing is loaded from the network. Looked at: the first picture, a lit zone, the open overview, the poster |
| Not checked | the iPad and the Pencil; Safari; the sound was counted (78 tones in a won game, at the four frequencies, and the 42 Hz buzz) but not heard |
| To know | In the presenter a single tap in the lower corners also turns the page (the lower quarter belongs to the thirds as well); the figure leaves that out, as the static slides do. The lamps use a blur, which a PDF would hold as a bitmap: the poster state (`lit=1`) draws no blur. The gestures make no sound, on purpose (a lecture room); the hidden game does, in the copy that is operated and never in the projector's window (`x-sound=0` silences it). A browser lets a page sound only after a touch has ended, and an iPad in silent mode stays mute. The sequence of a game is drawn once with `Math.random` and kept in the state, so both copies show the same game The overview of the figure does not show slides and cannot jump: the words of the zone say what the real one does. The places of hands and words are numbers taken from `../../deck.tex`; if the gesture slides change, change them here, and `check-posters.py` will not notice, since it compares the poster with this figure, not with the other slides. |

```latex
% In the guide deck the file is figures/guide-figures.html, with x-figure=gestures; the poster is the same.
% The preamble needs \usetikzlibrary{svg.path} and \input{media/poster.tex} (\guideposter).
% This is the frame for the figure alone:
\begin{frame}{Toolbar at the top, overview below: try all four zones}
  \bdltarea{0.75}{2.42}{32.36}{14.31}
    {\guideposter{media/gestures/gestures-poster.tex}{1147}{507}%
     \bdltwidget[id=gestures, poster=blank-poster.pdf, title={This page with its four tap zones}]{gestures/gestures.html}}
\end{frame}
```

## Changes

- 5 October 2026: made.
- 5 October 2026: the hidden memory game (Claudio: "an Easter egg ... a Simon game of the 80s ... you play and you have the same sounds"; the taps that start it: "right, right, left, right, right").
- 5 October 2026: the poster is a TikZ drawing read off the figure, in place of a print from the browser; Source Sans in the figure is cut down to the keyboard's characters (Claudio: "shrink as you suggested ... as long as it is completely consistent"; decision 10 of `../README.md`).
- 6 October 2026: redrawn flat, as the page of the gesture slides, and moved to slide S06, which it replaces together with the old S14 (Claudio: "slide 6 in the guide serves no purpose, it can be merged in slide 7 ... no need for the controls below ... we do not need even the right part explanation, all can go into the slide", and of the two forms he named: "without a round cover to the device. This would be more transparent as there is no interface nested artificially"). The small deck with its numeral, toolbar and overview strip is gone; the overview no longer jumps; the game is ended by a tap in the middle.
- 6 October 2026: the static slide of the toolbar zone (S05) is gone too; this slide is now the only one that shows the toolbar zone and the triple tap, and its title says so.
