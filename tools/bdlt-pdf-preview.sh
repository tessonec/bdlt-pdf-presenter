#!/usr/bin/env bash
# bdlt-pdf-preview.sh: live preview of a PDF in BDLT PDF Presenter.
#
#   bdlt-pdf-preview.sh lecture03.pdf [port]
#
# Opens the presenter in your browser, showing the PDF, and reloads it whenever the file
# changes on disk (for example each time LaTeX recompiles). The slide you are on is kept.
# The PDF may not exist yet: the preview waits for it. Stop with Ctrl+C.
#
# Everything is served from this computer only (127.0.0.1); nothing is uploaded.
set -euo pipefail

if [ $# -lt 1 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0
fi

# the presenter's files: ../public next to this script (also when the script is symlinked)
SELF="$0"
while [ -L "$SELF" ]; do
  LINK="$(readlink "$SELF")"
  case "$LINK" in /*) SELF="$LINK" ;; *) SELF="$(dirname "$SELF")/$LINK" ;; esac
done
APP="$(cd "$(dirname "$SELF")/../public" && pwd)"
[ -f "$APP/index.html" ] || { echo "Cannot find the presenter (expected $APP/index.html)." >&2; exit 1; }

PDF="$1"
case "$PDF" in /*) ;; *) PDF="$PWD/$PDF" ;; esac
DECK_DIR="$(cd "$(dirname "$PDF")" 2>/dev/null && pwd)" || { echo "Folder not found: $(dirname "$PDF")" >&2; exit 1; }
DECK_NAME="$(basename "$PDF")"
PORT="${2:-8765}"

command -v python3 >/dev/null || { echo "python3 is needed (install the Xcode command line tools: xcode-select --install)." >&2; exit 1; }

export BDLT_APP="$APP" BDLT_DECK_DIR="$DECK_DIR" BDLT_DECK_NAME="$DECK_NAME" BDLT_PORT="$PORT"
exec python3 - <<'PY'
import http.server, os, socketserver, subprocess, sys, urllib.parse

APP, DECK_DIR, DECK = os.environ['BDLT_APP'], os.environ['BDLT_DECK_DIR'], os.environ['BDLT_DECK_NAME']
port = int(os.environ['BDLT_PORT'])

class Handler(http.server.SimpleHTTPRequestHandler):
    """/ serves the presenter, /deck/ serves the folder of the PDF. Nothing is cached."""
    def translate_path(self, path):
        path = urllib.parse.unquote(path.split('?', 1)[0].split('#', 1)[0])
        if path.startswith('/deck/'):
            root, rel = DECK_DIR, path[len('/deck/'):]
        else:
            root, rel = APP, path.lstrip('/')
        full = os.path.normpath(os.path.join(root, rel))
        return full if full == root or full.startswith(root + os.sep) else os.path.join(root, '__outside__')
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        try:   # exact modification time, so that two builds within one second are told apart
            st = os.stat(self.translate_path(self.path))
            self.send_header('X-Mtime', str(st.st_mtime_ns))
        except OSError:
            pass
        super().end_headers()
    def log_message(self, *args):
        pass

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

httpd = None
for p in range(port, port + 20):
    try:
        httpd = Server(('127.0.0.1', p), Handler); port = p; break
    except OSError:
        continue
if httpd is None:
    sys.exit('No free port between %d and %d.' % (port, port + 19))

url = 'http://127.0.0.1:%d/index.html?pdf=%s&watch=1' % (port, urllib.parse.quote('deck/' + DECK))
print('BDLT PDF Presenter, live preview')
print('  PDF      ' + os.path.join(DECK_DIR, DECK) + ('' if os.path.exists(os.path.join(DECK_DIR, DECK)) else '   (not there yet: waiting for it)'))
print('  Preview  ' + url)
print('  The preview reloads when the PDF changes. Stop with Ctrl+C.')
opener = 'open' if sys.platform == 'darwin' else 'xdg-open'
try:
    subprocess.Popen([opener, url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
except OSError:
    print('  Open the address above in your browser.')
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print('\nPreview stopped.')
PY
