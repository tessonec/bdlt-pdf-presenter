// make-cover.mjs -- cover.pdf from cover.svg, as a vector drawing (the picture of the title slide).
//   node make-cover.mjs        Needs Playwright (CHROMIUM=/path to use another browser).
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }
const here = path.dirname(fileURLToPath(import.meta.url));
const svg = fs.readFileSync(path.join(here, 'cover.svg'), 'utf8');
const [, W, H] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage();
await page.setContent(`<style>@page{size:${W}px ${H}px;margin:0}html,body{margin:0}svg{display:block}</style>` + svg);
await page.pdf({ path: path.join(here, 'cover.pdf'), width: W + 'px', height: H + 'px', printBackground: true, pageRanges: '1', preferCSSPageSize: true });
await browser.close();
console.log('wrote cover.pdf (' + W + ' x ' + H + ', vector)');
