# alive: the same figure, a picture on the left and running on the right

| | |
|---|---|
| Command | `SIMULATION>` in spirit; asked for in words by Claudio (5 October 2026): "I want a showcase of why the presenter is there, while documenting it" |
| Shows | Two copies of one small figure, a chain of blocks with its forks. The left copy is the finished picture and never moves: it is what any PDF viewer shows. The right copy runs: it is what BDLT PDF Presenter (and its viewer edition) does with the same PDF |
| Operated | back to the start, play and pause, one more block. Only the right half changes |
| Status bar | chips `block 5 / 12` and `orphaned 1`; a few words on what the last block did; at the right the key: a filled blue square "longest chain", a hollow grey square "orphaned" |
| Model | An illustration of the longest-chain rule, not a model with real parameters: 12 blocks are found one after the other; with chance 0.22 a new block competes with the tip (a fork), otherwise it builds on a tip (on either of two, with equal chance). Blocks off the longest chain are orphaned. Standard textbook picture (Nakamoto 2008, section 5, for the rule); the numbers are free choices |
| Data | none |
| Kept here | `alive.src.html` (source), `alive.html` (built, the figure alone), `alive-poster.pdf`, `build.sh`, `built.txt`. The deck embeds `../figures/guide-figures.html`, which holds this figure and the other one (key `x-figure=alive`) |
| Derived | the whole run is computed once from the seed; step t of the picture is a look-up |
| Added | the headings of the two halves |
| Area, keys | Full Image, 1147 x 445 CSS px (32.36 x 12.57 cm on the slide). Slide: `start=0` (the default): one block on the right. Poster: `start=12`: the finished chain in both halves, which is the point for a reader elsewhere. Other keys: `seed` (default 59), `ms` (time per block while it plays, default 700) |
| Built | `bdlt-beamer-media beamer-v3.4.1, a copy without git` (see `gestures/README.md`) |
| Checked | `../../check.mjs` (5 October 2026, Chromium): inside the presenter with a projector window, steps, play, pause, play to the end (it stops at block 12), back to the start; at the end both halves hold the same picture; the projector shows the same after each; chips keep their width; nothing overflows; nothing is loaded from the network. Looked at: the first picture, block 6, the poster |
| Not checked | the iPad and the Pencil; Safari |
| To know | The seed 59 was chosen by eye among 60: three forks, well apart, one won by the competing block and two by the first one, so at most 3 blocks are orphaned (the chip is sized for that). The caption of the slide tells a reader of another PDF viewer that nothing will move there |

```latex
% In the guide deck the file is figures/guide-figures.html, with x-figure=alive and poster=alive/alive-poster.pdf.
% This is the frame for the figure alone:
\begin{frame}
  \bdltfullimage{A slide that runs}
    {\bdltwidget[id=alive, title={A chain of blocks: a picture on the left, running on the right}]{alive/alive.html}}
    {Left: what every PDF viewer shows. Right: the same figure, run by BDLT PDF Presenter.
     If pressing play changes nothing, you are reading this PDF somewhere else.}
\end{frame}
```

## Changes

- 5 October 2026: made.
