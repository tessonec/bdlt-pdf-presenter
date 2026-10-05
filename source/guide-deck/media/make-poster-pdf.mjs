// make-poster-pdf.mjs -- the poster of a widget as a vector PDF (tools/make-poster.sh of the
// repository takes a screenshot, which is a bitmap).
//
//   node make-poster-pdf.mjs <widget.html> <WxH in CSS px> "<keys>" <out.pdf>
//
// The page is exactly W x H CSS px, so the poster has the shape of its picture area; text stays
// text and lines stay lines. Needs Playwright (npm install playwright) and its Chromium
// (CHROMIUM=/path/to/chrome to use another one). The widget must not use blurs or shadows in
// the state of the poster: a PDF holds those as bitmaps. With Ghostscript on the PATH (GS=/path/to/gs)
// the poster comes out about a quarter smaller.
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
const [file, size, keys, out] = process.argv.slice(2);
if (!out) { console.error('usage: node make-poster-pdf.mjs <widget.html> <WxH> "<keys>" <out.pdf>'); process.exit(1); }
const [W, H] = size.split('x').map(Number);
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.route('**/*', r => (r.request().url().startsWith('file:') ? r.continue() : r.abort()));     // offline, as in the PDF
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('file://' + path.resolve(file) + (keys ? '?' + keys : ''));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.emulateMedia({ media: 'screen' });
await page.addStyleTag({ content: '@page { size: ' + W + 'px ' + H + 'px; margin: 0 } html, body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden }' });
await page.pdf({ path: out, width: W + 'px', height: H + 'px', printBackground: true, pageRanges: '1', preferCSSPageSize: true });
await browser.close();
if (errors.length) { console.error('errors in the page:', errors); process.exit(1); }
// Chrome writes every letter several times over. Ghostscript, where it is installed (it comes with
// MacTeX and TeX Live), writes the same page more tightly; without it the poster is kept as it is.
let note = '';
try {
  const { execFileSync } = require('child_process'); const fs = require('fs');
  const tmp = out + '.gs.pdf', before = fs.statSync(out).size;
  execFileSync(process.env.GS || 'gs', ['-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5', '-dSubsetFonts=true', '-dCompressFonts=true', '-sOutputFile=' + tmp, out], { stdio: 'ignore' });
  if (fs.statSync(tmp).size < before) { fs.renameSync(tmp, out); note = ', ' + before + ' -> ' + fs.statSync(out).size + ' bytes with Ghostscript'; } else fs.unlinkSync(tmp);
} catch (e) { note = ', Ghostscript not found: kept as Chrome wrote it'; }
console.log('wrote ' + out + ' (' + W + ' x ' + H + ' CSS px, vector' + note + ')');
