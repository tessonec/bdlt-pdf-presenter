#!/usr/bin/env python3
"""make-icons.py -- writes guide-icons.tex: the icons of the guide deck as TikZ drawings.

    python3 make-icons.py

The icons are those of the toolbar of BDLT PDF Presenter (24 x 24, lines only, round ends; the
same path data as in public/index.html, most of them from Tabler Icons, MIT licence), plus the
hands of the gesture slides. Drawing them with TikZ keeps the deck free of bitmaps.
    \\guideicon[colour]{name}{size in cm}         the bare icon
    \\guidetile[active]{name}{size in cm}         the icon on its dark tile, as a toolbar button
"""
import re
UI = {
 'open': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 'reload': '<path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747"/><path d="M20 4v5h-5"/>',
 'first': '<path d="M11 6l-6 6 6 6M19 6l-6 6 6 6"/>', 'last': '<path d="M13 6l6 6-6 6M5 6l6 6-6 6"/>',
 'prev': '<path d="M15 5l-7 7 7 7"/>', 'next': '<path d="M9 5l7 7-7 7"/>',
 'grid': '<rect x="3" y="5" width="8" height="6" rx="1"/><rect x="13" y="5" width="8" height="6" rx="1"/><rect x="3" y="13" width="8" height="6" rx="1"/><rect x="13" y="13" width="8" height="6" rx="1"/>',
 'select': '<path d="M4 8v-2a2 2 0 0 1 2 -2h2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2a2 2 0 0 0 2 -2v-2"/><path d="M12 16v-7"/><path d="M9 9h6"/>',
 'textcursor': '<path d="M10 12h4"/><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3"/><path d="M15 4a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3"/>',
 'marquee': '<path d="M4 6v-1a1 1 0 0 1 1 -1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2m0 5v1a1 1 0 0 1 -1 1h-1m-5 0h-2m-5 0h-1a1 1 0 0 1 -1 -1v-1m0 -5v-2"/>',
 'pen': '<path d="M4 20l1.2-4.4L15.6 5.2a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.4 18.8z"/><path d="M13.5 7.3l3.2 3.2"/>',
 'highlighter': '<path d="M9 14l-4 4v2h5l2-2"/><path d="M9 14l7-9 4 3-7 9z"/><path d="M4 21h16"/>',
 'laser': '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
 'eraser': '<path d="M9 20h11"/><path d="M4.6 14.6l9-9a2 2 0 0 1 2.8 0l2 2a2 2 0 0 1 0 2.8L11 18H8z"/>',
 'undo': '<path d="M9 6L4 11l5 5"/><path d="M4 11h10a5 5 0 0 1 0 10h-3"/>',
 'clear': '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 'save': '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
 'fs': '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 'hide': '<path d="M6 15l6-6 6 6"/>',
 'hand': '<path d="M7.904 17.563a1.2 1.2 0 0 0 2.228 .308l2.09 -3.093l4.907 4.907a1.067 1.067 0 0 0 1.509 0l1.047 -1.047a1.067 1.067 0 0 0 0 -1.509l-4.907 -4.907l3.113 -2.09a1.2 1.2 0 0 0 -.309 -2.228l-13.582 -3.904l3.904 13.563"/>',
 'mouse': '<path d="M6 7a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-4a4 4 0 0 1 -4 -4l0 -10"/><path d="M12 7l0 4"/>',
 'split': '<rect x="2" y="6" width="11" height="8" rx="1"/><rect x="11" y="3" width="11" height="8" rx="1"/><path d="M5 19h6M8 14v5M14 11v4h5"/>',
 'settings': '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
 'mirror': '<rect x="2" y="6" width="9" height="7" rx="1"/><path d="M4.5 17h4M6.5 13v4"/><rect x="13" y="6" width="9" height="7" rx="1"/><path d="M15.5 17h4M17.5 13v4"/>',
 'screen': '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>',
 'info': '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v4h1"/>',
 'play': '<path d="M7 4v16l13 -8z"/>',
 'frames': '<rect x="3" y="7" width="13" height="10" rx="1.5"/><path d="M19 8.5v7M22 10v4"/>',
 'sliders': '<circle cx="14" cy="6" r="2"/><path d="M4 6h8M16 6h4"/><circle cx="8" cy="12" r="2"/><path d="M4 12h2M10 12h10"/><circle cx="17" cy="18" r="2"/><path d="M4 18h11M19 18h1"/>',
 'tap': '<path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"/><path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5"/><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"/><path d="M5 3l-1 -1"/><path d="M4 7h-1"/><path d="M14 3l1 -1"/><path d="M15 6h1"/>',
 'handonly': '<path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"/><path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5"/><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"/>',
}

def norm(d):
    """SVG path data with every number and letter separated by spaces, as pgf's parser reads it best."""
    d = re.sub(r'([a-zA-Z])', r' \1 ', d)
    d = re.sub(r'(?<=[0-9.])-', ' -', d)                    # 1-2 -> 1 -2
    d = re.sub(r'(\.\d+)(?=\.)', r'\1 ', d)                 # .5.5 -> .5 .5
    d = d.replace(',', ' ')
    d = re.sub(r'(?<![0-9])\.(\d)', r'0.\1', d)             # .426 -> 0.426
    return re.sub(r'\s+', ' ', d).strip()

def tikz(body):
    out = []
    for tag, attrs in re.findall(r'<(\w+)([^>]*)/>', body):
        a = dict(re.findall(r'(\w+)="([^"]*)"', attrs))
        if tag == 'path':
            out.append('\\draw svg {%s};' % norm(a['d']))
        elif tag == 'rect':
            x, y, w, h = (float(a[k]) for k in ('x', 'y', 'width', 'height'))
            rc = ('[rounded corners=%spt]' % a['rx']) if 'rx' in a else ''
            out.append('\\draw%s (%gpt,%gpt) rectangle (%gpt,%gpt);' % (rc, x, y, x + w, y + h))
        elif tag == 'circle':
            out.append('\\draw (%spt,%spt) circle [radius=%spt];' % (a['cx'], a['cy'], a['r']))
    return ' '.join(out)

lines = ['% guide-icons.tex -- written by make-icons.py; do not edit.']
for name, body in UI.items():
    lines.append('\\expandafter\\def\\csname guideicon@%s\\endcsname{%s}' % (name, tikz(body)))
open('guide-icons.tex', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('guide-icons.tex:', len(UI), 'icons')
