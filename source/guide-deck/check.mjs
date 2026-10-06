// check.mjs -- the two live figures of the guide deck, operated inside BDLT PDF Presenter.
//
//   node check.mjs            (./build.sh check runs it after building the decks)
//
// Serves ../../public (the presenter) with build/deck.pdf, opens it, switches to separate views
// (a projector window), and then for each figure: taps and presses in the lecturer's copy, and
// compares the state and the picture of the projector's copy after every step. Also: the figures
// load nothing from the network, nothing overflows its box, and every chip keeps its width.
// Needs Playwright (npm install playwright; CHROMIUM=/path to use another browser).
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(here, process.env.PUBLIC || '../../public');
const DECK = path.join(here, 'build', 'deck.pdf');
const TYPES = { '.html': 'text/html', '.pdf': 'application/pdf', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.js': 'text/javascript' };
const server = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = u === '/deck.pdf' ? DECK : path.join(PUBLIC, u === '/' ? 'index.html' : u);
  if (!f.startsWith(PUBLIC) && f !== DECK) { s.writeHead(403); return s.end(); }
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); s.end(d); });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;

let failed = 0;
const ok = (cond, what, detail) => { console.log((cond ? 'ok    ' : 'FAIL  ') + what + (detail && !cond ? '   ' + detail : '')); if (!cond) failed++; };
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await browser.newContext({ viewport: { width: 1180, height: 800 } });
const page = await ctx.newPage();
const errors = [], fromFrames = [];
page.on('pageerror', e => errors.push(e.message));
ctx.on('request', q => { let fr = null; try { fr = q.frame(); } catch (e) {} if (fr && fr.parentFrame() && !/^(data|blob|about):/.test(q.url())) fromFrames.push(q.url()); });
await page.goto(base + '/index.html?pdf=deck.pdf'); await page.waitForTimeout(4000);
const pages = parseInt((await page.textContent('#counter')).split('/')[1], 10);
ok(pages >= 12, 'the deck opens in the presenter', 'counter: ' + await page.textContent('#counter'));
const [aud] = await Promise.all([ctx.waitForEvent('page'), page.click('#bPresent')]);
aud.on('pageerror', e => errors.push('projector: ' + e.message));
await aud.setViewportSize({ width: 1280, height: 720 }); await page.waitForTimeout(3000);

// the live figure of the page that is shown, in a window: its frame, or null
async function figure(win, marker) {
  for (let i = 0; i < 40; i++) {
    for (const fr of win.frames()) {
      if (fr === win.mainFrame()) continue;
      try { if (await fr.evaluate(m => !!document.querySelector(m) && !!(window.bdlt && window.bdlt.state), marker)) {
        const shown = await (await fr.frameElement()).evaluate(n => { const m = n.closest('.media'); return !!m && !m.hidden; });
        if (shown) return fr; } } catch (e) {}
    }
    await win.waitForTimeout(250);
  }
  return null;
}
async function goTo(title) {          // the page whose text has this title
  for (let n = 1; n <= pages; n++) {
    await page.keyboard.press(n === 1 ? 'Home' : 'ArrowRight'); await page.waitForTimeout(350);
    const has = await page.evaluate(t => [...document.querySelectorAll('#media .media')].some(m => !m.hidden && (m.querySelector('iframe')?.title || '').includes(t)), title);
    if (has) { await page.waitForTimeout(1800); return n; }
  }
  return 0;
}
// a click at a place of the figure, through the presenter (as a finger or the mouse would)
async function clickAt(fr, x, y) {
  const sc = await (await fr.frameElement()).evaluate(n => { const r = n.getBoundingClientRect(); return [r.left, r.top, r.width / n.offsetWidth]; });
  await page.mouse.click(sc[0] + x * sc[2], sc[1] + y * sc[2]); await page.waitForTimeout(260);
}
const centre = (fr, sel) => fr.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, sel);
const picture = fr => fr.evaluate(() => JSON.stringify({ state: window.bdlt.state, chips: [...document.querySelectorAll('.chip')].map(c => c.textContent),
  note: document.querySelector('#msg').textContent, marks: [...document.querySelectorAll('svg rect, svg line, svg text')].filter(e => e.getAttribute('display') !== 'none' && !e.closest('[display="none"]') && !e.classList.contains('glow'))
    .map(e => e.tagName + ':' + (e.textContent || '') + ':' + (e.getAttribute('class') || '').replace(' lit', '') + ':' + (e.getAttribute('stroke') || '')).join('|') }));
const fits = fr => fr.evaluate(() => { const d = document.documentElement, bar = document.querySelector('.bar'); return d.scrollWidth <= innerWidth && d.scrollHeight <= innerHeight && (!bar || bar.scrollWidth <= bar.clientWidth + 1); });
const chipWidths = fr => fr.evaluate(() => [...document.querySelectorAll('.chip')].map(c => Math.round(c.getBoundingClientRect().width)).join(','));
async function same(l, a, what) { await page.waitForTimeout(450); const x = await picture(l), y = await picture(a); ok(x === y, 'projector shows the same: ' + what, x === y ? '' : '\n   lecturer  ' + x.slice(0, 300) + '\n   projector ' + y.slice(0, 300)); }

// ---- The four zones together (the live gesture slide)
let at = await goTo('tap zones');
ok(at > 0, 'the slide with the gestures figure is found');
let L = await figure(page, '#svg'), A = await figure(aud, '#svg');
ok(!!L && !!A, 'the figure runs in the lecturer view and in the projector window');
if (L && A) {
  ok(await L.evaluate(() => bdlt.role) === 'lecturer' && await A.evaluate(() => bdlt.role) === 'projector', 'roles: lecturer and projector');
  ok(await L.evaluate(() => bdlt.state.p === 1 && !bdlt.state.bar && !bdlt.state.sheet), 'starts at slide 1, toolbar off, overview closed');
  const w0 = await chipWidths(L);
  const zone = async (fx, fy) => { const b = await L.evaluate(() => { const r = document.querySelector('#svg g rect').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }); await clickAt(L, b[0] + fx * b[2], b[1] + fy * b[3]); };
  await zone(0.85, 0.4); ok(await L.evaluate(() => bdlt.state.p === 2 && bdlt.state.hit === 'next'), 'right third: next slide'); await same(L, A, 'after next');
  ok((await page.textContent('#counter')).startsWith(at + ' '), 'the tap stays in the figure: the presenter does not turn its page');
  await zone(0.15, 0.4); ok(await L.evaluate(() => bdlt.state.p === 1), 'left third: previous slide');
  await zone(0.15, 0.4); ok(await L.evaluate(() => bdlt.state.p === 1 && bdlt.state.msg === 'first'), 'left third on the first slide: stays, and says so');
  await zone(0.5, 0.1); ok(await L.evaluate(() => bdlt.state.bar === true), 'top centre: the toolbar shows'); await same(L, A, 'toolbar on');
  await zone(0.5, 0.5); ok(await L.evaluate(() => bdlt.state.msg === 'middle' && bdlt.state.p === 1), 'the middle does nothing');
  await zone(0.5, 0.88); await page.waitForTimeout(700);
  ok(await L.evaluate(() => bdlt.state.taps === 0 && !bdlt.state.sheet && bdlt.state.msg === 'slow'), 'one tap in the lower quarter is forgotten after a moment');
  for (let i = 0; i < 3; i++) await zone(0.5, 0.88);
  ok(await L.evaluate(() => bdlt.state.sheet === true), 'three quick taps: the overview opens'); await same(L, A, 'overview open');
  await zone(0.5, 0.5); ok(await L.evaluate(() => !bdlt.state.sheet && bdlt.state.msg === 'close'), 'with the overview open, the next tap closes it'); await same(L, A, 'overview closed again');
  // the lamp: a zone is lit at once when it is tapped, then fades
  const lit = await L.evaluate(() => { const r = document.querySelector('#svg g rect').getBoundingClientRect(), s = document.querySelector('#svg');
    s.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width * 0.85, clientY: r.top + r.height * 0.4, button: 0, pointerType: 'touch', bubbles: true }));
    return [...document.querySelectorAll('.zone')].map(z => +z.getAttribute('fill-opacity')); });
  ok(lit.filter(o => o > 0.8).length === 1, 'the tapped zone lights up', 'fill opacities ' + lit); await page.waitForTimeout(900);
  ok((await L.evaluate(() => [...document.querySelectorAll('.zone')].map(z => +z.getAttribute('fill-opacity')))).every(o => o < 0.3), 'and goes dark again');
  ok(await L.evaluate(() => document.querySelectorAll('.label .hand').length === 5 && [...document.querySelectorAll('.label .head')].map(t => t.textContent).join('|') === 'Tap here|Tap here|Tap here|Triple-tap here'), 'each zone has its hand and its words');
  // hidden: the taps of a zapateo (right, right, left, right, right) start a memory game on the four lamps
  for (const fx of [0.85, 0.85, 0.15, 0.85, 0.85]) await zone(fx, 0.4);
  ok(await L.evaluate(() => !!bdlt.state.g && bdlt.state.g.seq.length === 8), 'right, right, left, right, right starts the memory game');
  const PADS = { prev: [0.17, 0.5], next: [0.83, 0.5], bar: [0.5, 0.19], sheet: [0.5, 0.81] };
  const turn = async n => { for (let i = 0; i < 150; i++) { if (await L.evaluate(n => bdlt.state.g.ph === 'input' && bdlt.state.g.n === n && !bdlt.state.g.on, n)) return true; await page.waitForTimeout(50); } return false; };
  ok(await turn(1), 'the game shows one lamp and waits for the answer'); await same(L, A, 'the game, round 1');
  const seq = await L.evaluate(() => bdlt.state.g.seq);
  await zone(...PADS[seq[0]]); ok(await turn(2), 'the right lamp leads to round 2');
  ok(await L.evaluate(() => bdlt.state.best === 1), 'the best round is kept');
  await zone(...PADS[seq[0]]); await zone(...PADS[Object.keys(PADS).find(k => k !== seq[1])]);
  ok(await L.evaluate(() => bdlt.state.g.ph === 'lost' && bdlt.state.g.why === 'wrong'), 'a wrong lamp loses'); await page.waitForTimeout(1700); await same(L, A, 'after losing');
  ok(await L.evaluate(() => getComputedStyle(document.querySelector('.label')).display === 'none'), 'in the game the hands and words are gone');
  await zone(0.5, 0.5); await page.waitForTimeout(600);
  ok(await L.evaluate(() => !bdlt.state.g && bdlt.state.p === 1), 'a tap in the middle ends the game'); await same(L, A, 'the zones again');
  ok(await chipWidths(L) === w0, 'every chip kept its width', w0 + ' -> ' + await chipWidths(L));
  ok(await fits(L) && await fits(A), 'nothing overflows its box');
}

// ---- A slide that runs
at = await goTo('chain of blocks');
ok(at > 0, 'the slide with the chain figure is found');
L = await figure(page, '#stepb'); A = await figure(aud, '#stepb');
ok(!!L && !!A, 'the figure runs in the lecturer view and in the projector window');
if (L && A) {
  const blocks = fr => fr.evaluate(() => [document.querySelectorAll('#a rect').length, document.querySelectorAll('#b rect').length].join(' and '));
  ok(await blocks(L) === '13 and 1', 'starts with the finished chain on the left and one block on the right', await blocks(L));
  const w0 = await chipWidths(L);
  const press = async sel => { const c = await centre(L, sel); await clickAt(L, c[0], c[1]); };
  await press('#stepb'); await press('#stepb'); await press('#stepb');
  ok(await L.evaluate(() => bdlt.state.t === 3) && await blocks(L) === '13 and 4', 'one step adds one block on the right only', await blocks(L)); await same(L, A, 'after three steps');
  await press('#play'); await page.waitForTimeout(1700);
  ok(await L.evaluate(() => bdlt.state.running && bdlt.state.t > 3), 'play runs'); await press('#play');
  ok(await L.evaluate(() => !bdlt.state.running), 'pause stops'); await same(L, A, 'after play and pause');
  await press('#play'); await page.waitForTimeout(9500);
  ok(await L.evaluate(() => bdlt.state.t === 12 && !bdlt.state.running), 'play stops at the last block');
  ok(await L.evaluate(() => document.querySelector('#a').innerHTML.replace(/ opacity="1"/g, '') === document.querySelector('#b').innerHTML.replace(/ opacity="1"/g, '')), 'at the end both halves show the same picture');
  await same(L, A, 'at the end');
  await press('#reset'); ok(await L.evaluate(() => bdlt.state.t === 0) && await blocks(L) === '13 and 1', 'back to the start'); await same(L, A, 'after back to the start');
  ok(await chipWidths(L) === w0, 'every chip kept its width', w0 + ' -> ' + await chipWidths(L));
  ok(await fits(L) && await fits(A), 'nothing overflows its box');
}
ok(fromFrames.length === 0, 'the figures load nothing from the network', fromFrames.slice(0, 3).join(' '));
ok(errors.length === 0, 'no errors in the pages', errors.slice(0, 3).join(' | '));
await browser.close(); server.close();
console.log(failed ? failed + ' check(s) failed.' : 'All checks passed.');
process.exit(failed ? 1 : 0);
