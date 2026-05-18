// Medium import helper — paste into DevTools console at https://medium.com/me/stories/drafts
//
// Why this exists:
//   Medium's importer rejects programmatic typing into its contenteditable URL field,
//   so the normal sync script can't drive it. ClipboardEvent('paste') gets through.
//   Medium also rate-limits silently (no error, just stops accepting imports), so
//   this snippet paces itself.
//
// Why an iframe:
//   A previous version drove the top window directly. The first navigation killed
//   the pasted script before any log line fired. An iframe stays embedded in the
//   drafts page; the parent JS survives across the iframe's internal navigations.
//
// Usage:
//   1. Open https://medium.com/me/stories/drafts in Chrome, signed in.
//   2. DevTools (Cmd+Option+I) → Console.
//   3. Paste this entire file. The iframe appears bottom-right (you can resize).
//   4. Watch the console — green ✓ or red ✗ lines log as each import completes.
//   5. Results land in window.__importResults at the end.

const URLS = [
  // 18 remaining as of 2026-05-18 (12 already-drafted are excluded)
  'https://harshit.cloud/til/git-interactive-rebase-magic',
  'https://harshit.cloud/blog/github-actions-gitlab-ci-comparison',
  'https://harshit.cloud/blog/favorite-shows-sitcoms-detective',
  'https://harshit.cloud/blog/ja4-fingerprinting-network-security',
  'https://harshit.cloud/til/ja4-fingerprint-bot-detection',
  'https://harshit.cloud/til/delivery-social-engineering',
  'https://harshit.cloud/blog/netlify-to-dokploy-migration',
  'https://harshit.cloud/blog/victorialogs-vs-loki',
  'https://harshit.cloud/blog/akamai-browser-extensions-blocking',
  'https://harshit.cloud/til/blocking-ai-crawlers',
  'https://harshit.cloud/blog/self-hosting-simplelogin',
  'https://harshit.cloud/blog/lazy-security-part-1-supply-chain',
  'https://harshit.cloud/blog/lazy-security-part-2-github-actions',
  'https://harshit.cloud/blog/lazy-security-part-3-unsexy-list',
  'https://harshit.cloud/blog/lazy-security-part-4-dns-records',
  'https://harshit.cloud/blog/lazy-security-part-5-dev-laptops',
  'https://harshit.cloud/blog/bypassing-claude-code-mdm-managed-settings',
  'https://harshit.cloud/blog/lazy-security-part-6-network-plane',
];

const DELAY_MS = 75_000;   // pause between imports
const LOAD_MS = 5_000;     // time to let /p/import hydrate
const SUBMIT_MS = 12_000;  // time to wait for editor URL after clicking Import

(async () => {
  const results = (window.__importResults = []);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // (Re-)create the iframe
  let iframe = document.getElementById('__medium_import_iframe');
  if (iframe) iframe.remove();
  iframe = document.createElement('iframe');
  iframe.id = '__medium_import_iframe';
  iframe.style.cssText =
    'position:fixed;bottom:10px;right:10px;width:600px;height:420px;z-index:9999;border:2px solid #B7410E;background:white;box-shadow:0 4px 24px rgba(0,0,0,0.3);';
  document.body.appendChild(iframe);
  console.log('[medium-import] iframe attached. Starting in 3s…');
  await sleep(3000);

  const loadIframe = (url) =>
    new Promise((resolve) => {
      const onLoad = () => {
        iframe.removeEventListener('load', onLoad);
        resolve();
      };
      iframe.addEventListener('load', onLoad);
      iframe.src = url;
    });

  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    const tag = `[${i + 1}/${URLS.length}] ${url}`;

    try {
      await loadIframe('https://medium.com/p/import');
      await sleep(LOAD_MS);

      const idoc = iframe.contentDocument;
      const iwin = iframe.contentWindow;
      if (!idoc || !iwin) throw new Error('iframe blocked (cross-origin?)');

      // Suppress beforeunload in the iframe so editor → import navigation is clean
      iwin.onbeforeunload = null;

      const div = idoc.querySelectorAll('[contenteditable]')[0];
      if (!div) throw new Error('no contenteditable in iframe — Medium may have updated');

      div.focus();
      div.textContent = '';
      const dt = new iwin.DataTransfer();
      dt.setData('text/plain', url);
      div.dispatchEvent(
        new iwin.ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })
      );

      await sleep(800);

      const btn = Array.from(idoc.querySelectorAll('button')).find(
        (b) => b.textContent.trim() === 'Import'
      );
      if (!btn) throw new Error('Import button not found in iframe');
      btn.click();

      await sleep(SUBMIT_MS);

      const finalPath = iwin.location.pathname;
      if (/^\/p\/[a-f0-9]+\/edit$/.test(finalPath)) {
        const id = finalPath.split('/')[2];
        results.push({ url, ok: true, mediumId: id, editUrl: iwin.location.href });
        console.log('%c✓ ' + tag + ' → ' + id, 'color: green');
      } else {
        results.push({ url, ok: false, finalPath });
        console.warn('✗ ' + tag + ' → stuck at ' + finalPath + ' (rate-limited?)');
      }
    } catch (e) {
      results.push({ url, ok: false, error: e.message });
      console.error('✗ ' + tag + ' → ' + e.message);
    }

    if (i < URLS.length - 1) {
      console.log('[medium-import] sleeping ' + DELAY_MS / 1000 + 's before next…');
      await sleep(DELAY_MS);
    }
  }

  console.log('%c=== Done ===', 'color: green; font-weight: bold');
  console.table(results);
  console.log('Full results: window.__importResults');
  console.log("Copy as JSON:  copy(JSON.stringify(window.__importResults, null, 2))");
})();
