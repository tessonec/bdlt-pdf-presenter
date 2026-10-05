// make-poster-tikz.mjs -- the poster of a figure as a TikZ drawing, read off the figure itself.
//
//   node make-poster-tikz.mjs <figure.html> <WxH in CSS px> "<keys>" <out.tex> [<picture.png>]
//
// The figure is opened in the state given by <keys>, and every box, line, shape and line of text
// that the browser has laid out is written as TikZ, at the place and in the size, weight and colour
// the browser gave it. The poster is therefore the figure, not a second drawing of it: change the
// figure, run this again, and the poster follows. The text is set by TeX in the typeface of the
// deck (Source Sans, the same family the figure carries), so the deck holds no second copy of it;
// a print of the page from the browser holds every letter as a shape of its own (make-poster-pdf.mjs).
//
// <out.tex> is one tikzpicture of exactly W x H units, one unit being one CSS px of the figure.
// The length \posterlen says how long that unit is; set it before \input (see \guideposter in
// deck.tex). Needs the TikZ library svg.path where the figure has paths (icons).
//
// What it reads: backgrounds, borders and rounded corners of HTML boxes; SVG rect, circle, ellipse,
// line, polyline, polygon and path with fill, stroke, dashes and opacity; text of HTML and SVG, one
// TikZ node per line of a text. What it does not draw, it reports and stops: shadows, gradients,
// background images, filters (blurs), rotated or skewed SVG, clipping. A poster must not need those.
// With <picture.png> a picture of the figure in that state is saved as well (twice the size, for
// check-posters.py, which compares the poster in the finished deck with it).
// Needs Playwright (npm install playwright); CHROMIUM=/path/to/chrome to use another browser.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
const [file, size, keys, out, shot] = process.argv.slice(2);
if (!out) { console.error('usage: node make-poster-tikz.mjs <figure.html> <WxH> "<keys>" <out.tex> [<picture.png>]'); process.exit(1); }
const [W, H] = size.split('x').map(Number);

// Letters are laid out at their exact widths, as on a Mac or an iPad. Left to itself, this browser on
// Linux rounds every letter to a whole pixel, which shifts the ends of lines by a pixel or two.
const browser = await chromium.launch({ args: ['--font-render-hinting=none'], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.route('**/*', r => (r.request().url().startsWith('file:') ? r.continue() : r.abort()));     // offline, as in the PDF
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('file://' + path.resolve(file) + (keys ? '?' + keys : ''));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700);
if (shot) await page.screenshot({ path: shot });

// ---- in the page: everything that is drawn, in the order it is drawn
const got = await page.evaluate(() => {
  const ops = [], warn = [];
  const rgba = s => {                                   // 'rgb(1, 2, 3)' or 'rgba(1, 2, 3, 0.5)' -> [r, g, b, a]; null for none
    if (!s || s === 'none' || s === 'transparent') return null;
    const m = s.match(/rgba?\(([^)]+)\)/); if (!m) { warn.push('colour not understood: ' + s); return null; }
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return (p.length > 3 ? p[3] : 1) === 0 ? null : [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const canvas = document.createElement('canvas').getContext('2d');
  const ascentShare = cs => {                           // where the baseline lies in the box of a line of text
    canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = canvas.measureText('Hg'); return m.fontBoundingBoxAscent / (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent);
  };
  const SKIP = new Set(['defs', 'script', 'style', 'template', 'filter', 'clippath', 'mask', 'title', 'desc', 'head', 'meta', 'link']);

  function box(el, cs, op) {                            // background and border of an HTML box
    const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return;
    if (cs.backgroundImage !== 'none') warn.push('background image on <' + el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '>');
    if (cs.boxShadow !== 'none') warn.push('shadow on <' + el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '>');
    for (const ps of ['::before', '::after']) { const c = getComputedStyle(el, ps).content; if (c && c !== 'none' && c !== 'normal') warn.push('pseudo-element ' + ps + ' on <' + el.tagName.toLowerCase() + '>'); }
    let rad = cs.borderTopLeftRadius; rad = rad.endsWith('%') ? parseFloat(rad) / 100 * Math.min(r.width, r.height) : parseFloat(rad) || 0;
    rad = Math.min(rad, r.width / 2, r.height / 2);
    const bg = rgba(cs.backgroundColor);
    const side = k => ({ w: cs['border' + k + 'Style'] === 'none' ? 0 : parseFloat(cs['border' + k + 'Width']) || 0, c: cs['border' + k + 'Color'] });
    const T = side('Top'), R = side('Right'), B = side('Bottom'), L = side('Left');
    const even = T.w > 0 && [R, B, L].every(s => s.w === T.w && s.c === T.c);
    if (bg) ops.push({ t: 'rect', x: r.left, y: r.top, w: r.width, h: r.height, r: rad, fill: bg, op });
    if (even) { const c = rgba(T.c); if (c) ops.push({ t: 'rect', x: r.left + T.w / 2, y: r.top + T.w / 2, w: r.width - T.w, h: r.height - T.w, r: Math.max(0, rad - T.w / 2), stroke: c, sw: T.w, op }); }
    else {
      if (T.w && rgba(T.c)) ops.push({ t: 'line', x1: r.left, y1: r.top + T.w / 2, x2: r.right, y2: r.top + T.w / 2, stroke: rgba(T.c), sw: T.w, op });
      if (B.w && rgba(B.c)) ops.push({ t: 'line', x1: r.left, y1: r.bottom - B.w / 2, x2: r.right, y2: r.bottom - B.w / 2, stroke: rgba(B.c), sw: B.w, op });
      if (L.w && rgba(L.c)) ops.push({ t: 'line', x1: r.left + L.w / 2, y1: r.top, x2: r.left + L.w / 2, y2: r.bottom, stroke: rgba(L.c), sw: L.w, op });
      if (R.w && rgba(R.c)) ops.push({ t: 'line', x1: r.right - R.w / 2, y1: r.top, x2: r.right - R.w / 2, y2: r.bottom, stroke: rgba(R.c), sw: R.w, op });
    }
  }

  function text(node, op) {                             // a text of HTML: one entry per line the browser broke it into
    const el = node.parentElement, cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || !node.data.trim()) return;
    if (parseFloat(cs.letterSpacing)) warn.push('letter spacing in "' + node.data.trim().slice(0, 20) + '"');
    const s = node.data, rg = document.createRange(), lines = []; let cur = null;
    for (let i = 0; i < s.length; i++) {
      rg.setStart(node, i); rg.setEnd(node, i + 1);
      const q = rg.getClientRects()[0]; if (!q) continue;
      const blank = /\s/.test(s[i]); if (blank && q.width === 0) continue;                 // white space the browser folded away
      if (!cur || Math.abs(q.top - cur.top) > q.height * 0.5) { cur = { top: q.top, h: q.height, left: null, right: null, text: '' }; lines.push(cur); }
      cur.text += blank ? ' ' : s[i];
      if (!blank) { if (cur.left === null) cur.left = q.left; cur.right = q.right; }
    }
    const share = ascentShare(cs), align = cs.textAlign, size = parseFloat(cs.fontSize);
    for (const l of lines) {
      const t = l.text.trim(); if (!t || l.left === null) continue;
      const anchor = align === 'center' ? 'mid' : (align === 'right' || align === 'end') ? 'end' : 'start';
      ops.push({ t: 'text', x: anchor === 'mid' ? (l.left + l.right) / 2 : anchor === 'end' ? l.right : l.left, y: l.top + l.h * share, anchor, size,
                 weight: parseInt(cs.fontWeight, 10) || 400, italic: cs.fontStyle !== 'normal', fill: rgba(cs.color),
                 text: cs.textTransform === 'uppercase' ? t.toUpperCase() : t, w: l.right - l.left, op });
    }
  }

  function svgText(el, cs, op) {
    const n = el.getNumberOfChars(); if (!n || !el.textContent.trim()) return;
    const m = el.getScreenCTM(); if (Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6) { warn.push('rotated SVG text'); return; }
    const P = p => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });
    const a = P(el.getStartPositionOfChar(0)), b = P(el.getEndPositionOfChar(n - 1));
    const anchor = cs.textAnchor === 'middle' ? 'mid' : cs.textAnchor === 'end' ? 'end' : 'start';
    ops.push({ t: 'text', x: anchor === 'mid' ? (a.x + b.x) / 2 : anchor === 'end' ? b.x : a.x, y: a.y, anchor, size: parseFloat(cs.fontSize) * Math.abs(m.a),
               weight: parseInt(cs.fontWeight, 10) || 400, italic: cs.fontStyle !== 'normal', fill: rgba(cs.fill), text: el.textContent.trim(), w: b.x - a.x,
               op: op * (parseFloat(cs.fillOpacity) || 1) });
  }

  function shape(el, cs, op) {                          // one SVG shape
    const tag = el.tagName.toLowerCase();
    if (!['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'].includes(tag)) return;
    if (cs.filter !== 'none') { warn.push('filter on SVG <' + tag + '>'); return; }
    const m = el.getScreenCTM();
    if (Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6 || Math.abs(Math.abs(m.a) - Math.abs(m.d)) > 1e-4 || m.a <= 0 || m.d <= 0) { warn.push('rotated, mirrored or stretched SVG <' + tag + '>'); return; }
    const k = m.a, X = x => k * x + m.e, Y = y => k * y + m.f;
    const dash = cs.strokeDasharray === 'none' ? null : cs.strokeDasharray.split(/[\s,]+/).map(v => parseFloat(v) * k);
    const st = { fill: rgba(cs.fill), fo: parseFloat(cs.fillOpacity), stroke: rgba(cs.stroke), so: parseFloat(cs.strokeOpacity), sw: parseFloat(cs.strokeWidth) * k,
                 cap: cs.strokeLinecap, join: cs.strokeLinejoin, dash, op };
    if (!st.stroke || !(st.sw > 0)) { st.stroke = null; }
    if (!st.fill && !st.stroke) return;
    const v = a => el[a].baseVal.value;
    if (tag === 'rect') ops.push({ t: 'rect', x: X(v('x')), y: Y(v('y')), w: k * v('width'), h: k * v('height'), r: k * Math.min(v('rx') || v('ry') || 0, v('width') / 2, v('height') / 2), ...st });
    else if (tag === 'circle') ops.push({ t: 'ellipse', cx: X(v('cx')), cy: Y(v('cy')), rx: k * v('r'), ry: k * v('r'), ...st });
    else if (tag === 'ellipse') ops.push({ t: 'ellipse', cx: X(v('cx')), cy: Y(v('cy')), rx: k * v('rx'), ry: k * v('ry'), ...st });
    else if (tag === 'line') ops.push({ t: 'line', x1: X(v('x1')), y1: Y(v('y1')), x2: X(v('x2')), y2: Y(v('y2')), ...st, fill: null });
    else if (tag === 'polyline' || tag === 'polygon') ops.push({ t: 'poly', pts: [...el.points].map(p => [X(p.x), Y(p.y)]), close: tag === 'polygon', ...st });
    else ops.push({ t: 'path', d: el.getAttribute('d'), k, e: m.e, f: m.f, ...st });
  }

  (function walk(el, op) {
    if (el.nodeType === 3) { if (!(el.parentElement instanceof SVGElement)) text(el, op); return; }
    if (el.nodeType !== 1 || SKIP.has(el.tagName.toLowerCase())) return;
    const cs = getComputedStyle(el); if (cs.display === 'none') return;
    const o = op * parseFloat(cs.opacity); if (!(o > 0.004)) return;
    const hidden = cs.visibility === 'hidden', svg = el instanceof SVGElement, tag = el.tagName.toLowerCase();
    if (cs.overflow !== 'visible' && el.scrollWidth > el.clientWidth + 1 && !svg) warn.push('text cut off in <' + tag + (el.id ? '#' + el.id : '') + '>');
    if (!hidden && (!svg || tag === 'svg')) box(el, cs, o);
    if (svg && tag === 'text') { if (!hidden) svgText(el, cs, o); return; }
    if (!hidden && svg) shape(el, cs, o);
    for (const c of el.childNodes) walk(c, o);
  })(document.body, 1);
  return { ops, warn };
});
await browser.close();
if (errors.length) { console.error('errors in the page:', errors); process.exit(1); }
if (got.warn.length) { console.error('The poster cannot be drawn as it is:\n  ' + [...new Set(got.warn)].join('\n  ')); process.exit(1); }

// ---- out of the page: TikZ
const n = v => { const s = (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, ''); return s === '-0' ? '0' : s; };
const colours = new Map();
const col = c => { const key = c.slice(0, 3).map(Math.round).join(','); if (!colours.has(key)) colours.set(key, 'pc' + String.fromCharCode(97 + Math.floor(colours.size / 26)) + String.fromCharCode(97 + colours.size % 26)); return colours.get(key); };
const tex = s => s.replace(/\\/g, '\\textbackslash ').replace(/([{}$&#%_])/g, '\\$1').replace(/\^/g, '\\textasciicircum ').replace(/~/g, '\\textasciitilde ')
  .replace(/’/g, "'").replace(/‘/g, '`').replace(/“/g, '``').replace(/”/g, "''").replace(/–/g, '--').replace(/—/g, '---').replace(/ /g, '~');
const normPath = d => d.replace(/([a-zA-Z])/g, ' $1 ').replace(/(?<=[0-9.])-/g, ' -').replace(/(\.\d+)(?=\.)/g, '$1 ').replace(/,/g, ' ').replace(/(?<![0-9])\.(\d)/g, '0.$1').replace(/\s+/g, ' ').trim();
function style(o) {                                     // fill, stroke and opacity of a shape
  const s = [];
  const fa = o.fill ? o.fill[3] * (o.fo ?? 1) * o.op : 0, sa = o.stroke ? o.stroke[3] * (o.so ?? 1) * o.op : 0;
  if (o.fill) { s.push('fill=' + col(o.fill)); if (fa < 0.996) s.push('fill opacity=' + n(fa)); }
  if (o.stroke) {
    s.push('draw=' + col(o.stroke), 'line width=' + n(o.sw) + '*\\posterk'); if (sa < 0.996) s.push('draw opacity=' + n(sa));
    if (o.cap && o.cap !== 'butt') s.push('line cap=' + (o.cap === 'square' ? 'rect' : o.cap));
    if (o.join && o.join !== 'miter') s.push('line join=' + o.join);
    if (o.dash) s.push('dash pattern=' + o.dash.map((v, i) => (i % 2 ? 'off ' : 'on ') + n(v) + '*\\posterk').join(' '));
  }
  return s;
}
const body = []; let needSvg = false, texts = 0;
for (const o of got.ops) {
  if (o.t === 'rect') { const s = style(o); if (o.r > 0.05) s.push('rounded corners=' + n(o.r) + '*\\posterk'); body.push(`\\path[${s.join(',')}] (${n(o.x)},${n(o.y)}) rectangle (${n(o.x + o.w)},${n(o.y + o.h)});`); }
  else if (o.t === 'ellipse') body.push(`\\path[${style(o).join(',')}] (${n(o.cx)},${n(o.cy)}) ellipse [x radius=${n(o.rx)},y radius=${n(o.ry)}];`);
  else if (o.t === 'line') body.push(`\\path[${style(o).join(',')}] (${n(o.x1)},${n(o.y1)}) -- (${n(o.x2)},${n(o.y2)});`);
  else if (o.t === 'poly') body.push(`\\path[${style(o).join(',')}] ${o.pts.map(p => `(${n(p[0])},${n(p[1])})`).join(' -- ')}${o.close ? ' -- cycle' : ''};`);
  else if (o.t === 'path') { needSvg = true; body.push(`\\path[${style(o).concat([`shift={(${n(o.e)},${n(o.f)})}`, `scale=${n(o.k * 1000) / 1000}*\\posterk`, 'yscale=-1']).join(',')}] svg {${normPath(o.d)}};`); }
  else if (o.t === 'text') {
    if (!o.fill) continue; texts++;
    const a = o.fill[3] * o.op, face = (o.weight >= 700 ? 'b' : o.weight >= 600 ? 's' : 'm') + (o.italic ? 'i' : 'n');
    body.push(`\\T{${o.anchor === 'mid' ? 'base' : o.anchor === 'end' ? 'base east' : 'base west'}}{${col(o.fill)}${a < 0.996 ? ',text opacity=' + n(a) : ''}}{${n(o.x)},${n(o.y)}}{${n(o.size)}}{${face}}{${tex(o.text)}}`);
  }
}
const head = [
  `% ${path.basename(out)} -- written by make-poster-tikz.mjs from ${path.basename(file)}${keys ? ' (' + keys + ')' : ''}; do not edit.`,
  `% The poster of the figure, read off the figure in the browser: ${got.ops.length - texts} shapes and ${texts} lines of text. One unit is one CSS px`,
  `% of the figure (${W} x ${H}); the length \\posterlen says how long it is on the page.${needSvg ? ' Needs \\usetikzlibrary{svg.path}.' : ''}`,
  '\\begingroup\\makeatletter\\edef\\posterk{\\strip@pt\\posterlen}\\makeatother',
  '% \\T{anchor}{colour}{x,y}{size in px}{weight and shape}{text}: one line of text; the weights are regular (m), semibold (s) and bold (b)',
  '\\def\\T#1#2#3#4#5#6{\\node[anchor=#1,inner sep=0pt,outer sep=0pt,text=#2] at (#3) {\\fontsize{#4\\posterlen}{#4\\posterlen}\\csname posterface@#5\\endcsname\\frenchspacing #6};}',
  ...[['mn', 'm', 'n'], ['mi', 'm', 'it'], ['sn', 'sb', 'n'], ['si', 'sb', 'it'], ['bn', 'b', 'n'], ['bi', 'b', 'it']].map(([k, ser, sh]) => `\\expandafter\\def\\csname posterface@${k}\\endcsname{\\fontseries{${ser}}\\fontshape{${sh}}\\selectfont}`),
  ...[...colours].map(([rgb, name]) => `\\definecolor{${name}}{RGB}{${rgb}}`),
  '\\begin{tikzpicture}[x=\\posterlen,y=-\\posterlen]',
  `\\useasboundingbox (0,0) rectangle (${W},${H});`,
];
// the colours are only known once the body is written, so the head is put together last
// outside the picture every line ends in %, so that the file adds no space next to the picture
const outside = l => (l.startsWith('%') || l.startsWith('\\begin{tikzpicture}') ? l : l + '%');
fs.writeFileSync(out, head.map(outside).concat(body, ['\\end{tikzpicture}\\endgroup%']).join('\n') + '\n');
console.log(`wrote ${out} (${W} x ${H} CSS px: ${got.ops.length - texts} shapes, ${texts} lines of text, ${colours.size} colours, ${fs.statSync(out).size} bytes)`);
