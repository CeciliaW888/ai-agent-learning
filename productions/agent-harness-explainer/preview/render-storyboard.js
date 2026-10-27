// Usage: node render-storyboard.js ../storyboard.html <outDir>
// Render storyboard sheet + each frame at 1080x1920. Google Fonts are fetched with curl (proxy-aware) and served to Chromium.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const [,, html, outDir] = process.argv;
const url = 'file://' + path.resolve(html);
const cache = new Map();
async function route(page){
  await page.route(/fonts\.(googleapis|gstatic)\.com/, async r => {
    const u = r.request().url();
    try {
      if(!cache.has(u)) cache.set(u, execFileSync('curl', ['-sS','-m','30','-A','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36', u], {maxBuffer: 64<<20}));
      const body = cache.get(u);
      const ct = u.includes('googleapis') ? 'text/css' : 'font/woff2';
      await r.fulfill({ status: 200, body, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
    } catch(e){ await r.abort(); }
  });
}
(async () => {
  const b = await chromium.launch();
  const issues = [];
  // full frames
  const fp = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await route(fp);
  for (let i = 0; i < 12; i++) {
    for (const g of [false, true]) {
      await fp.goto(url + '?frame=' + i + (g ? '&guides=1' : ''), { waitUntil: 'networkidle' });
      await fp.evaluate(() => document.fonts.ready);
      if (!g) {
        const r = await fp.evaluate(() => {
          const out = []; const fr = document.querySelector('.frame').getBoundingClientRect();
          document.querySelectorAll('.frame *').forEach(el => {
            if (el.closest('svg') || el.classList.contains('g')) return;
            const cs = getComputedStyle(el); if (cs.opacity === '0') return;
            const b = el.getBoundingClientRect(); if (!b.width) return;
            if (b.right > fr.right + 1 || b.bottom > fr.bottom + 1 || b.left < -1) out.push('outside-frame ' + el.className + ' ' + el.textContent.slice(0, 20));
            if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') out.push('overflow ' + el.className);
            const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
            if (txt) {
              if (b.top < 168) out.push('text-in-top-band ' + el.textContent.slice(0, 16));
              if (b.bottom > 1330) out.push('text-below-1330 ' + el.textContent.slice(0, 16));
              if (b.right > 940 && b.bottom > 820) out.push('text-in-right-rail ' + el.textContent.slice(0, 16));
              const fs = parseFloat(cs.fontSize); if (fs < 28) out.push('small-text ' + fs + ' ' + el.textContent.slice(0, 16));
            }
          });
          const fam = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family);
          return { out, fonts: [...new Set(fam)] };
        });
        issues.push({ frame: i, ...r });
      }
      await fp.screenshot({ path: `${outDir}/frame-${String(i + 1).padStart(2, '0')}${g ? '-safezones' : ''}.png` });
    }
  }
  // sheet
  const sp = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1.5 });
  await route(sp);
  await sp.goto(url, { waitUntil: 'networkidle' });
  await sp.evaluate(() => document.fonts.ready);
  await sp.screenshot({ path: `${outDir}/storyboard-sheet.png`, fullPage: true });
  await sp.emulateMedia({ media: 'screen' });
  const H = await sp.evaluate(() => document.documentElement.scrollHeight);
  await sp.pdf({ path: `${outDir}/storyboard-sheet.pdf`, width: '1280px', height: (H + 20) + 'px', printBackground: true, pageRanges: '1' });
  const mob = await b.newPage({ viewport: { width: 390, height: 844 } });
  await route(mob);
  await mob.goto(url, { waitUntil: 'networkidle' });
  const hs = await mob.evaluate(() => document.documentElement.scrollWidth);
  issues.push({ mobileScrollWidth: hs });
  console.log(JSON.stringify(issues, null, 1));
  await b.close();
})();
