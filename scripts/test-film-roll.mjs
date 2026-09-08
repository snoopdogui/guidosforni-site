#!/usr/bin/env node
/**
 * Film-roll viewer test harness.
 *
 * Drives a real headless Chrome over CDP and checks the three things that are
 * easy to break and impossible to see in a screenshot:
 *   sizing   — no frame upscaled beyond its natural size or overflowing its slide
 *   snap     — a gesture settles exactly on a frame, never half-between two
 *   falloff  — the --d focus value varies continuously with scroll position
 *   feel     — (optional, --flicks) characterises gentle/moderate/hard gestures
 *
 * It cannot judge feel. It measures that the implementation behaves as
 * designed; whether the constants feel right is still a human call.
 *
 * Usage:
 *   node scripts/test-film-roll.mjs                    # all galleries, sizing+snap+falloff
 *   node scripts/test-film-roll.mjs transcendence      # one gallery
 *   node scripts/test-film-roll.mjs --flicks ando      # add flick characterisation
 *   node scripts/test-film-roll.mjs --width 390         # check a mobile breakpoint
 *   node scripts/test-film-roll.mjs --base http://localhost:3001
 *
 * Assumes the site is already being served (npm run build && npm run start).
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const GALLERIES = [
  'loose-ends', 'ilmuro', 'clarity', 'branco', 'soft-guidance',
  'transcendence', 'ando', 'higher-land', 'gentle-shifts',
];

const argv = process.argv.slice(2);
const withFlicks = argv.includes('--flicks');
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 ? argv[i + 1] : dflt;
};
const BASE = flag('base', 'http://localhost:3000');
const WIDTH = Number(flag('width', 1440));
const HEIGHT = Number(flag('height', WIDTH < 768 ? 844 : 1080));
const VALUED = new Set(['--base', '--width', '--height']);
const only = argv.filter((a, i) => !a.startsWith('--') && !VALUED.has(argv[i - 1]));
const targets = only.length ? only : GALLERIES;
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- locate a headless chrome ------------------------------------------------
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(cache)) {
    const dirs = readdirSync(cache)
      .filter((d) => d.startsWith('chromium_headless_shell-') || d.startsWith('chromium-'))
      .sort()
      .reverse();
    for (const d of dirs) {
      for (const rel of [
        'chrome-headless-shell-mac-arm64/chrome-headless-shell',
        'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
      ]) {
        const p = join(cache, d, rel);
        if (existsSync(p)) return p;
      }
    }
  }
  for (const p of [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ]) if (existsSync(p)) return p;
  return null;
}

// --- minimal CDP client ------------------------------------------------------
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); }
  static async open(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const c = new CDP(ws);
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && c.p.has(m.id)) { c.p.get(m.id)(m); c.p.delete(m.id); }
    };
    return c;
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res) => {
      this.p.set(id, (m) => res(m.error ? { __error: m.error } : m.result));
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression, awaitPromise = true) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
    if (r.__error) throw new Error(JSON.stringify(r.__error));
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || 'evaluate threw');
    }
    return r.result.value;
  }
}

// --- checks ------------------------------------------------------------------
const SIZING = `(async () => {
  const roll = document.querySelector('[role="region"]');
  if (!roll) return { error: 'no film roll on page' };
  const fs = [...roll.querySelectorAll('img')];
  fs.forEach(f => { f.loading = 'eager'; });
  await Promise.all(fs.map(f => f.complete ? 1 : new Promise(r => { f.onload = r; f.onerror = r; })));
  await new Promise(r => requestAnimationFrame(r));
  const slide = fs[0]?.parentElement;
  const box = { w: slide.offsetWidth, h: slide.offsetHeight };
  const frames = fs.map((f, i) => ({
    i,
    layout: [f.offsetWidth, f.offsetHeight],
    natural: [f.naturalWidth, f.naturalHeight],
    portrait: f.naturalHeight > f.naturalWidth,
    upscaled: f.offsetWidth > f.naturalWidth + 0.5 || f.offsetHeight > f.naturalHeight + 0.5,
    overflows: f.offsetWidth > box.w + 1 || f.offsetHeight > box.h + 1,
    broken: f.naturalWidth === 0,
  }));
  return {
    box, count: frames.length,
    snapType: getComputedStyle(roll).scrollSnapType,
    upscaled: frames.filter(f => f.upscaled).map(f => f.i),
    overflowing: frames.filter(f => f.overflows).map(f => f.i),
    broken: frames.filter(f => f.broken).map(f => f.i),
    portraits: frames.filter(f => f.portrait).length,
    landscapes: frames.filter(f => !f.portrait).length,
    widths: [...new Set(frames.map(f => f.layout[0]))].sort((a, b) => a - b),
    heights: [...new Set(frames.map(f => f.layout[1]))].sort((a, b) => a - b),
  };
})()`;

const FALLOFF = `(async () => {
  const roll = document.querySelector('[role="region"]');
  const fs = [...roll.querySelectorAll('img')];
  const cw = roll.clientWidth;
  const prev = roll.style.scrollSnapType;
  roll.style.scrollSnapType = 'none';      // else programmatic scrollLeft gets snapped
  roll.style.scrollBehavior = 'auto';
  const f = () => new Promise(r => requestAnimationFrame(r));
  roll.scrollLeft = 0; await f(); await f();
  const rows = [];
  for (let x = 0; x <= cw * 2; x += cw / 24) {
    roll.scrollLeft = x; await f(); await f();
    rows.push([Math.round(roll.scrollLeft), +(fs[0].style.getPropertyValue('--d') || -1)]);
  }
  roll.style.scrollSnapType = prev; roll.style.scrollBehavior = '';
  roll.scrollLeft = 0;
  let maxJump = 0, nonMono = 0;
  for (let i = 1; i < rows.length; i++) {
    maxJump = Math.max(maxJump, Math.abs(rows[i][1] - rows[i - 1][1]));
    if (rows[i][1] < rows[i - 1][1] - 1e-6) nonMono++;
  }
  return { steps: rows.length, maxDJump: +maxJump.toFixed(4), nonMonotonic: nonMono,
           first: rows[0][1], last: rows.at(-1)[1] };
})()`;

const FLICKS = {
  'nudge': [4, 7, 9, 6, 3],
  'gentle': [6, 12, 20, 24, 20, 12, 6],
  'moderate': [8, 18, 34, 48, 56, 56, 52, 40, 26, 14, 8, 4],
  'hard': [12, 30, 60, 90, 120, 140, 140, 130, 110, 90, 70, 50, 34, 20, 12, 6],
};

async function runFlick(cdp, geo, deltas) {
  await cdp.evaluate(`(async () => { const r = document.querySelector('[role="region"]');
    r.style.scrollBehavior='auto'; r.scrollLeft = r.clientWidth * 2;
    await new Promise(x => requestAnimationFrame(x)); r.style.scrollBehavior=''; return r.scrollLeft; })()`);
  await sleep(700);
  await cdp.evaluate(`(() => { const r = document.querySelector('[role="region"]');
    window.__s=[]; window.__go=true;
    const tick=()=>{ if(!window.__go) return; window.__s.push(+r.scrollLeft.toFixed(2)); requestAnimationFrame(tick); };
    requestAnimationFrame(tick); return 1; })()`, false);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: geo.x, y: geo.y });
  for (const dy of deltas) {
    await cdp.send('Input.dispatchMouseEvent',
      { type: 'mouseWheel', x: geo.x, y: geo.y, deltaX: 0, deltaY: dy, pointerType: 'mouse' });
    await sleep(16);
  }
  await sleep(1900);
  return cdp.evaluate(`(() => { window.__go=false; const s=window.__s; const cw=document.querySelector('[role="region"]').clientWidth;
    const start=s[0], peak=Math.max(...s), settled=s.at(-1);
    return { deltaY:${deltas.reduce((a, b) => a + b, 0)}, travel:+(peak-start).toFixed(1), settled,
      frames:+((settled-start)/cw).toFixed(3),
      offSnap:+Math.abs(settled-Math.round(settled/cw)*cw).toFixed(2),
      reversal:+(peak-Math.max(settled,start)).toFixed(1) }; })()`);
}

// --- main --------------------------------------------------------------------
const chrome = findChrome();
if (!chrome) { console.error('No Chrome found. Set CHROME_PATH.'); process.exit(1); }

const proc = spawn(chrome, [
  '--headless', `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/film-roll-test-profile',
  `--window-size=${WIDTH},${HEIGHT}`, '--disable-gpu', '--no-first-run', 'about:blank',
], { stdio: 'ignore', detached: false });

let cdp;
for (let i = 0; i < 40 && !cdp; i++) {
  await sleep(250);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const page = list.find((t) => t.type === 'page');
    if (page) cdp = await CDP.open(page.webSocketDebuggerUrl);
  } catch { /* not up yet */ }
}
if (!cdp) { proc.kill(); console.error('Could not attach to Chrome.'); process.exit(1); }

await cdp.send('Runtime.enable');
await cdp.send('Log.enable');
await cdp.send('Emulation.setDeviceMetricsOverride',
  { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH < 768 });
console.log(`viewport ${WIDTH}x${HEIGHT}  base ${BASE}\n`);

let failures = 0;
for (const slug of targets) {
  const consoleErrors = [];
  const onMessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      consoleErrors.push(m.params.entry.text);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(m.params.exceptionDetails.exception?.description || 'exception');
    }
  };
  cdp.ws.addEventListener('message', onMessage);

  await cdp.send('Page.navigate', { url: `${BASE}/archive/${slug}` });
  await sleep(2600);

  const size = await cdp.evaluate(SIZING);
  if (size.error) { console.log(`${slug.padEnd(15)} FAIL  ${size.error}`); failures++; continue; }
  const fall = await cdp.evaluate(FALLOFF);

  const bad = [];
  if (size.upscaled.length) bad.push(`upscaled:${size.upscaled}`);
  if (size.overflowing.length) bad.push(`overflowing:${size.overflowing}`);
  if (size.broken.length) bad.push(`broken:${size.broken}`);
  if (size.snapType !== 'x mandatory') bad.push(`snapType:${size.snapType}`);
  if (fall.maxDJump > 0.06) bad.push(`falloffJump:${fall.maxDJump}`);
  if (fall.nonMonotonic > 0) bad.push(`falloffNonMono:${fall.nonMonotonic}`);
  if (consoleErrors.length) bad.push(`console:${consoleErrors.length}`);
  if (bad.length) failures++;

  console.log(
    `${slug.padEnd(15)} ${bad.length ? 'FAIL' : ' ok '}  ` +
    `n=${String(size.count).padStart(2)} (${size.landscapes}L/${size.portraits}P)  ` +
    `slide=${size.box.w}x${size.box.h}  w=${size.widths.join(',')}  h=${size.heights.join(',')}  ` +
    `falloff(maxJump=${fall.maxDJump},nonMono=${fall.nonMonotonic})` +
    (bad.length ? `  << ${bad.join(' ')}` : '')
  );
  if (consoleErrors.length) consoleErrors.forEach((e) => console.log(`                 console: ${e}`));
  cdp.ws.removeEventListener('message', onMessage);

  if (withFlicks) {
    const geo = await cdp.evaluate(`(() => { const r=document.querySelector('[role="region"]');
      const b=r.getBoundingClientRect();
      return { x:Math.round(b.left+b.width/2), y:Math.round(b.top+b.height/2) }; })()`);
    for (const [name, deltas] of Object.entries(FLICKS)) {
      const r = await runFlick(cdp, geo, deltas);
      console.log(`                 ${name.padEnd(9)} deltaY=${String(r.deltaY).padStart(5)}` +
        ` travel=${String(r.travel).padStart(7)} settled=${String(r.settled).padStart(7)}` +
        ` frames=${String(r.frames).padStart(6)} offSnap=${r.offSnap} reversal=${r.reversal}`);
    }
  }
}

proc.kill();
console.log(failures ? `\n${failures} gallery/galleries with problems` : '\nall galleries ok');
process.exit(failures ? 1 : 0);
