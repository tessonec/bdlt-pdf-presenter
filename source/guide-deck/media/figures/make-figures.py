#!/usr/bin/env python3
"""make-figures.py -- one file for both live figures of the guide deck.

    python3 make-figures.py        -> guide-figures.src.html (then tools/inline-widget.py makes guide-figures.html)

The guide deck is downloaded by every visitor of the presenter. Each figure built alone carries
Source Sans and D3; put into one file they carry them once. The deck embeds guide-figures.html
once and shows it on two slides, with the key x-figure=gestures or x-figure=alive.
Nothing is written by hand here: the style, the markup and the script of each figure are taken
from its own source (../<name>/<name>.src.html), which stays the place to edit.
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
FIGURES = ["gestures", "alive"]

def parts(name):
    s = open(os.path.join(HERE, "..", name, name + ".src.html"), encoding="utf-8").read()
    head, body = s.split("</head>", 1)
    style = re.search(r"<style>(.*?)</style>", head, re.S).group(1)
    markup, script = re.search(r"<body>(.*?)<script>(.*?)</script>\s*</body>", body, re.S).groups()
    script = re.sub(r"/\* BEGIN bdlt-stub.*?/\* END bdlt-stub \*/\n?", "", script, flags=re.S)
    assert "</script" not in script and "</template" not in markup
    links = re.findall(r"^<(?:link|script src)[^\n]*$", head, re.M)
    return style, markup.strip(), script.strip(), links

got = {n: parts(n) for n in FIGURES}
links = got[FIGURES[0]][3]
assert all(got[n][3] == links for n in FIGURES), "the figures must share the lines of their heads"
out = ["""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The live figures of the guide deck of BDLT PDF Presenter</title>
<!-- Written by make-figures.py from the sources of the figures; do not edit. The key "figure"
     (x-figure=... on the slide, ?figure=... in a browser) chooses which one runs. -->"""]
out += links
out.append("</head>\n<body>")
for n in FIGURES:
    style, markup, script, _ = got[n]
    out.append('<template id="fig-%s">\n<style>%s</style>\n%s\n</template>' % (n, style, markup))
    out.append('<script type="text/plain" id="code-%s">\n%s\n</script>' % (n, script))
out.append("""<script>
/* BEGIN bdlt-stub (copied from widgets/lib/bdlt-stub.js by tools/inline-widget.py) */
/* END bdlt-stub */
// put the chosen figure into the page, then run its script
(function () {
  var name = window.bdlt.params.figure || '%s';
  var fig = document.getElementById('fig-' + name), code = document.getElementById('code-' + name);
  if (!fig || !code) { document.body.textContent = 'This file has no figure "' + name + '".'; return; }
  document.body.appendChild(fig.content.cloneNode(true));
  var run = document.createElement('script'); run.textContent = code.textContent; document.body.appendChild(run);
})();
</script>
</body>
</html>""" % FIGURES[0])
open(os.path.join(HERE, "guide-figures.src.html"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("guide-figures.src.html:", ", ".join(FIGURES))
