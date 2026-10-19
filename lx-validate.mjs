#!/usr/bin/env node
/* CDP validation driver for the Lumina landing page.
   Usage: node lx-validate.mjs <url> [width] [height] [label] [reducedMotion] [fullCheck] */
import http from 'node:http';
import fs from 'node:fs';  const [,, urlArg, wArg, hArg, labelArg, rmArg, fullArg] = process.argv;
/* arg order: url W H label rmFlag fullFlag */
const url = urlArg || 'http://127.0.0.1:8123/index.html';
const W = parseInt(wArg || '1536', 10), H = parseInt(hArg || '960', 10);
const label = labelArg || `${W}x${H}`;const RM = rmArg === 'rm';
const NOANIME = rmArg === 'noanime' || fullArg === 'noanime';
const FULL = fullArg === 'full' || rmArg === 'rmfull';

function json(url2) {
  return new Promise((res, rej) => {
    http.get(url2, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const CDP_PORT = process.env.CDP_PORT || '9224';
  const targets = await json(`http://127.0.0.1:${CDP_PORT}/json/list`);
  let page = targets.find(t => t.type === 'page');
  if (!page) { console.error('no page target'); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pend = new Map(); const logs = [];
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pend.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
      logs.push(m.params.type + ': ' + m.params.args.map(a => a.value || a.description || a.type).join(' '));
    } else if (m.method === 'Runtime.exceptionThrown') {
      logs.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    }
  };
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    (function(){ window.__warns = []; var ow = console.warn;
      console.warn = function(){ try { window.__warns.push(String(arguments[0]) + ' :: ' + new Error().stack.split('\\n').slice(2,9).join(' | ')); } catch(e){}
      return ow.apply(console, arguments); };
    })();` });
  if (NOANIME) await send('Network.enable').then(() => send('Network.setBlockedURLs', { urls: ['*animejs*'] }));
  if (RM) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 700 });
  await send('Page.navigate', { url });
  await sleep(6500);

  const evalJS = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

  const result = { label, rm: RM, noanime: NOANIME };
  result.warnStacks = await evalJS('window.__warns ? window.__warns.slice(0,4) : []');
  result.registries = await evalJS(`window.LXAanime ? { rT: window.LXAanime.rT.length, rO: window.LXAanime.rO.length, rS: window.LXAanime.rS.length, pending: (window.LXAanime.pending||[]).length, mode: window.LXAanime.mode } : null`);
  result.title = await evalJS('document.title');
  result.lxAnim = await evalJS(`document.documentElement.classList.contains('lx-anim')`);
  result.lxRm = await evalJS(`document.documentElement.classList.contains('lx-rm')`);
  result.stats = await evalJS(`window.LX ? window.LX.stats : null`);
  result.responsiveMode = await evalJS(`window.LXAanime ? window.LXAanime.mode : 'n/a'`);
  result.hOverflow = await evalJS(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
  result.bodyScrollH = await evalJS(`document.body.scrollHeight`);
  result.sections = await evalJS(`document.querySelectorAll('main section, footer').length`);
  result.playgroundLinks = await evalJS(`[...document.querySelectorAll('a[href="Particle_Interaction_Dual_Hands.html"]')].length`);
  result.animeLoaded = await evalJS(`!!window.anime`);
  result.activeAnims = await evalJS(`window.anime && anime.running ? anime.running.length : 'n/a'`);
  result.dpr = await evalJS(`window.devicePixelRatio`);

  if (FULL) {
    // keyboard: tab a few times and report focus path
    result.focusPath = await (async () => {
      const out = [];
      for (let i = 0; i < 8; i++) {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        await sleep(60);
        const a = await evalJS(`(function(){ const a = document.activeElement; return a ? (a.id || a.className || a.tagName) : 'none'; })()`);
        out.push(a);
      }
      return out;
    })();
    // scroll to bottom in steps (rapid both directions)
    await evalJS(`(async () => { for (let y = 0; y <= document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } })()`);
    await evalJS(`(async () => { for (let y = document.body.scrollHeight; y >= 0; y -= 1200) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 15)); } })()`);
    await sleep(1200);
    result.postScrollOverflow = await evalJS(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
    result.stickyOverlap = await evalJS(`(() => {
      const pins = [...document.querySelectorAll('.mani-pin,.models-pin,.sculpt-pin,.reveal-pin')].filter(el => {
        const r = el.getBoundingClientRect(); return r.height > innerHeight * 0.6 && getComputedStyle(el).position === 'sticky';
      }).length;
      return pins;
    })()`);
  }

  if (FULL) {
    // refresh halfway down: scroll to 40%, reload, re-check integrity
    await evalJS(`window.scrollTo(0, document.body.scrollHeight * 0.4)`);
    await sleep(400);
    logs.length = 0;
    await send('Page.reload');
    await sleep(5000);
    result.reloadOverflow = await evalJS(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
    result.reloadVisible = await evalJS(`(() => {
      const el = document.querySelector('.sec-lede');
      if (!el) return false;
      const s = getComputedStyle(el);
      return parseFloat(s.opacity) > 0.9;
    })()`);
    result.reloadCons = logs.length;
    await evalJS(`window.scrollTo(0,0)`);
    await sleep(600);
  }

  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.mkdirSync('shots', { recursive: true });
  const fname = `shots/lx-${label.replace(/[^a-z0-9x]/gi, '-')}${RM ? '-rm' : ''}.png`;
  fs.writeFileSync(fname, Buffer.from(shot.data, 'base64'));
  result.screenshot = fname;
  result.consoleIssues = logs.slice(0, 12);
  console.log(JSON.stringify(result, null, 1));
  ws.close();
  process.exit(0);
}
main().catch(e => { console.error('DRIVER FAIL:', e.message); process.exit(1); });
