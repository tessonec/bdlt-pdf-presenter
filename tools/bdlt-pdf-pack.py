#!/usr/bin/env python3
"""bdlt-pdf-pack.py: one PDF and BDLT PDF Viewer packed into a single web page.

    bdlt-pdf-pack.py lecture03.pdf                    ->  lecture03.html
    bdlt-pdf-pack.py lecture03.pdf -o view.html --title "Lecture 3"
    bdlt-pdf-pack.py lecture03.pdf --artifact         (page content only, for a page shown in a chat)
    bdlt-pdf-pack.py lecture03.pdf --presenter        (with projector and lecturer views)

The page opens directly on the PDF, with its live media, pen and highlighter. It needs no other
file: the PDF and the icon are inside it. It still loads PDF.js and pdf-lib from cdnjs and the
interface typeface from Google Fonts, so it needs a network connection, as the presenter does.

The presenter is taken from ../public/index.html next to this script (--app names another copy).
Only the Python standard library is used.
"""
import argparse, base64, html, os, re, sys

MARK = re.compile(r'<!-- bdlt:deck\b.*?-->')
LIMIT = 16 * 1024 * 1024          # a page shown in a chat may not be larger


def main():
    ap = argparse.ArgumentParser(description='Pack one PDF and BDLT PDF Viewer into a single web page.')
    ap.add_argument('pdf')
    ap.add_argument('-o', '--output', help='the page to write (default: the name of the PDF with .html)')
    ap.add_argument('--title', help='the name of the page (default: the file name of the PDF)')
    ap.add_argument('--artifact', action='store_true', help='write the page content only, without <html>, <head> and <body>')
    ap.add_argument('--presenter', action='store_true', help='pack the presenter edition in place of the viewer')
    ap.add_argument('--app', help='the index.html of the presenter (default: ../public/index.html next to this script)')
    a = ap.parse_args()

    here = os.path.dirname(os.path.realpath(__file__))
    app = a.app or os.path.join(here, '..', 'public', 'index.html')
    if not os.path.isfile(app):
        sys.exit('Cannot find the presenter (expected %s). Name it with --app.' % os.path.normpath(app))
    page = open(app, encoding='utf-8').read()
    if not MARK.search(page):
        sys.exit('This copy of the presenter cannot carry a PDF: it is older than this tool. Update the presenter.')

    pdf = open(a.pdf, 'rb').read()
    if not pdf.lstrip()[:5] == b'%PDF-':
        sys.exit('%s is not a PDF.' % a.pdf)
    name = os.path.basename(a.pdf)
    title = a.title or re.sub(r'[-_]+', ' ', os.path.splitext(name)[0]).strip() or 'Slides'

    if not a.presenter:   # the same two replacements as the deployment makes for viewer.html
        page = page.replace('BDLT PDF Presenter', 'BDLT PDF Viewer').replace('content="BDLT Presenter"', 'content="BDLT Viewer"')

    # the name of the page
    page, n = re.subn(r'<title>.*?</title>', lambda m: '<title>' + html.escape(title, quote=False) + '</title>', page, count=1, flags=re.S)
    if n != 1:
        sys.exit('The presenter has no <title>: is %s the right file?' % app)

    # the icon, inside the page once: a short script hands it to every place that shows it
    svg, icon = os.path.join(os.path.dirname(app), 'icon.svg'), ''
    if os.path.isfile(svg):
        uri = 'data:image/svg+xml;base64,' + base64.b64encode(open(svg, 'rb').read()).decode()
        page = page.replace('<img src="icon.png"', '<img data-bdlt-icon')
        page = page.replace('<link rel="icon" type="image/svg+xml" href="icon.svg">', '<link rel="icon" type="image/svg+xml" href="data:,">')
        icon = ('\n<script>(function(u){document.querySelectorAll("img[data-bdlt-icon]").forEach(function(i){i.src=u});'
                'var l=document.querySelector(\'link[rel="icon"]\');if(l)l.href=u})("%s")</script>' % uri)
    page = re.sub(r'<link rel="(?:apple-touch-icon|icon)"(?: type="image/png")? href="icon\.png">\n?', '', page)

    # the PDF, inside the page
    b64 = base64.b64encode(pdf).decode()
    lines = '\n'.join(b64[i:i + 120] for i in range(0, len(b64), 120))
    tag = '<script type="application/pdf;base64" id="bdltDeck" data-name="%s"%s>\n%s\n</script>' % (
        html.escape(name, quote=True), '' if a.presenter else ' data-edition="viewer"', lines)
    page = MARK.sub(lambda m: tag + icon, page, count=1)

    if a.artifact:
        i, j = page.find('<body>'), page.rfind('</body>')
        if i < 0 or j < 0:
            sys.exit('The presenter has no <body>: is %s the right file?' % app)
        page = page[i + len('<body>'):j].strip('\n') + '\n'

    out = a.output or os.path.splitext(a.pdf)[0] + '.html'
    data = page.encode('utf-8')
    open(out, 'wb').write(data)
    print('%s  %.0f kB  (PDF %.0f kB, %s edition%s)' % (out, len(data) / 1000, len(pdf) / 1000,
          'presenter' if a.presenter else 'viewer', ', page content only' if a.artifact else ''))
    if a.artifact and len(data) > LIMIT:
        print('Warning: larger than 16 MB, the limit for a page shown in a chat.', file=sys.stderr)


if __name__ == '__main__':
    main()
