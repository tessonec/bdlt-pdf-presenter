// Builds test/media/media-test-v1.pdf: a hand-made PDF that follows docs/media-spec.md (v1).
// Run: node test/media/make-test-pdf.js   (needs pdf-lib; assets in test/media/src)
const fs = require('fs'), path = require('path');
const { PDFDocument, StandardFonts, rgb, PDFString, PDFName } = require('pdf-lib');

const SRC = path.join(__dirname, 'src'), OUT = path.join(__dirname, 'media-test-v1.pdf');
const W = 960, H = 540, BLUE = rgb(0, 0.157, 0.647), INK = rgb(0.07, 0.07, 0.07), MUTE = rgb(0.4, 0.42, 0.48);

(async () => {
  const doc = await PDFDocument.create();
  doc.setTitle('BDLT media test deck (spec v1)');
  const hb = await doc.embedFont(StandardFonts.HelveticaBold), h = await doc.embedFont(StandardFonts.Helvetica);
  const read = f => fs.readFileSync(path.join(SRC, f));
  const attached = new Set();
  const attach = async (name, mime) => { if (attached.has(name)) return; attached.add(name); await doc.attach(read(name), name, { mimeType: mime, description: name }); };
  const png = async f => doc.embedPng(read(f));

  // A marker: invisible link annotation over the placeholder, URI = bdlt-media:v1;...
  function marker(page, x, y, w, hgt, uri) {
    const annot = doc.context.obj({
      Type: 'Annot', Subtype: 'Link', Rect: [x, y, x + w, y + hgt], Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(uri) },
    });
    page.node.addAnnot(doc.context.register(annot));
  }
  function slide(title, note) {
    const p = doc.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
    p.drawText(title, { x: 40, y: H - 60, size: 28, font: hb, color: INK });
    if (note) p.drawText(note, { x: 40, y: 34, size: 11, font: h, color: MUTE, maxWidth: 640, lineHeight: 13 });
    p.drawText(`BDLT media test deck · spec v1 · ${doc.getPageCount()}`, { x: W - 230, y: 14, size: 10, font: h, color: MUTE });
    return p;
  }
  async function placeholder(p, file, x, y, w, hgt) { const img = await png(file); p.drawImage(img, { x, y, width: w, height: hgt }); }

  // 1. Title
  let p = slide('BDLT media test deck');
  [ 'Follows docs/media-spec.md, version 1. Every media item is embedded in this PDF.',
    '2-3  Video (MP4, controls), kept playing across two overlay steps (same id)',
    '4    Frame animation (20 PNG frames, the \\animategraphics replacement)',
    '5    Animated GIF (image type)',
    '6    Interactive widget, offline: network with PageRank, drag nodes, damping slider',
    '7    Interactive widget with Plotly loaded from the web (needs internet)',
    '8    Muted video that starts by itself and loops',
    '9    Unknown spec version: must stay a plain picture',
  ].forEach((t, i) => p.drawText(t, { x: 40, y: H - 130 - i * 34, size: i ? 18 : 20, font: i ? h : hb, color: i ? INK : BLUE }));

  // 2-3. Video with overlay continuity
  await attach('test-video.mp4', 'video/mp4');
  const vr = [180, 80, 600, 337.5];
  p = slide('Video: tap to play', 'Marker: type=video;src=attach:test-video.mp4;id=vid1;controls');
  await placeholder(p, 'test-video-poster.png', ...vr);
  marker(p, ...vr, 'bdlt-media:v1;type=video;src=attach:test-video.mp4;id=vid1;controls');
  p = slide('Video, overlay step 2: it keeps playing', 'Same id and rectangle as the previous page, so the presenter keeps the same player.');
  await placeholder(p, 'test-video-poster.png', ...vr);
  p.drawText('Step 2 adds this line.', { x: 40, y: H - 100, size: 18, font: h, color: BLUE });
  marker(p, ...vr, 'bdlt-media:v1;type=video;src=attach:test-video.mp4;id=vid1;controls');

  // 4. Frames
  for (let k = 0; k < 20; k++) await attach(`frame-${String(k).padStart(2, '0')}.png`, 'image/png');
  p = slide('Frame animation (animate replacement)', 'Marker: type=frames;src=attach:frame-%02d.png;first=0;last=19;fps=3;loop;controls');
  const fr = [160, 70, 640, 360];
  await placeholder(p, 'frame-00.png', ...fr);
  marker(p, ...fr, 'bdlt-media:v1;type=frames;src=attach:frame-%2502d.png;first=0;last=19;fps=3;loop;controls');

  // 5. Animated GIF
  await attach('pulse.gif', 'image/gif');
  p = slide('Animated GIF', 'Marker: type=image;src=attach:pulse.gif');
  const gr = [320, 180, 320, 180];
  await placeholder(p, 'pulse-poster.png', ...gr);
  marker(p, ...gr, 'bdlt-media:v1;type=image;src=attach:pulse.gif');

  // 6. Offline widget
  await attach('network-widget.html', 'text/html');
  p = slide('Widget: PageRank on a network', 'Drag nodes with a finger, move the slider; the Pencil still writes on top. Marker: type=widget;src=attach:network-widget.html;sync=state;x-damping=0.85');
  const wr = [150, 62, 660, 371.25];
  await placeholder(p, 'network-widget-poster.png', ...wr);
  marker(p, ...wr, 'bdlt-media:v1;type=widget;src=attach:network-widget.html;id=net;sync=state;x-damping=0.85;title=PageRank%20network');

  // 7. Plotly widget from the web
  await attach('plotly-widget.html', 'text/html');
  p = slide('Widget: Plotly (loaded from the web)', 'Needs an internet connection for Plotly. Marker: type=widget;src=attach:plotly-widget.html');
  await placeholder(p, 'plotly-widget-poster.png', ...wr);
  marker(p, ...wr, 'bdlt-media:v1;type=widget;src=attach:plotly-widget.html;sync=state');

  // 8. Muted autoplay loop
  p = slide('Muted video: starts by itself and loops', 'Marker: type=video;src=attach:test-video.mp4;autoplay;muted;loop;controls=0;start=2;end=6');
  const sr = [280, 110, 400, 225];
  await placeholder(p, 'test-video-poster.png', ...sr);
  marker(p, ...sr, 'bdlt-media:v1;type=video;src=attach:test-video.mp4;autoplay;muted;loop;controls=0;start=2;end=6');

  // 9. Unknown version
  p = slide('Unknown version: stays a picture', 'Marker: bdlt-media:v9;... The presenter must leave the placeholder alone.');
  await placeholder(p, 'pulse-poster.png', ...gr);
  marker(p, ...gr, 'bdlt-media:v9;type=image;src=attach:pulse.gif');

  fs.writeFileSync(OUT, await doc.save());
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(2), 'MB');
})();
