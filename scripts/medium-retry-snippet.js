// Medium import helper — paste this into DevTools console at https://medium.com/p/import
//
// Why this exists:
//   Medium's importer rejects programmatic typing into its contenteditable URL field,
//   so the normal sync script can't drive it. ClipboardEvent('paste') gets through.
//   Medium also rate-limits at ~9 imports per ~10 minutes (silently — no error, just
//   stops responding), so this snippet paces itself with a long delay between posts.
//
// Usage:
//   1. Open https://medium.com/p/import in Chrome, signed in.
//   2. Open DevTools (Cmd+Option+I), Console tab.
//   3. Paste the whole file. It will start importing and log progress.
//   4. Let it run unattended — each import takes ~30s due to throttling.
//   5. When done, results array is in window.__importResults.
//
// To resume after a partial run: edit URLS below to skip the ones already drafted.

const URLS = [
  // 21 remaining as of 2026-05-18 (the 9 already-drafted are excluded)
  'https://harshit.cloud/blog/kubernetes-debugging-tips',
  'https://harshit.cloud/til/bash-parameter-expansion',
  'https://harshit.cloud/blog/prometheus-grafana-monitoring-guide',
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

// Delay between imports. Medium's silent rate-limit kicks in around 9 imports per
// ~10 minutes, so 75s/post means ~5 imports per cycle — well under the threshold.
const DELAY_MS = 75_000;

(async () => {
  const results = (window.__importResults = []);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Strip the editor's beforeunload prompt so we can navigate freely.
  window.onbeforeunload = null;

  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    const tag = `[${i + 1}/${URLS.length}] ${url}`;

    try {
      // Always start from /p/import. Medium navigates to /p/<id>/edit on success.
      if (location.pathname !== '/p/import') {
        window.onbeforeunload = null;
        location.href = 'https://medium.com/p/import';
        // Wait for navigation + page hydration.
        await sleep(5000);
      } else {
        // Reload to clear any stuck state.
        location.reload();
        await sleep(5000);
      }

      // Paste the URL via a synthetic ClipboardEvent — Medium accepts this even
      // when it ignores typing.
      const div = document.querySelectorAll('[contenteditable]')[0];
      if (!div) throw new Error('contenteditable not found — are you on /p/import?');
      div.focus();
      div.textContent = '';
      const dt = new DataTransfer();
      dt.setData('text/plain', url);
      div.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));

      // Tiny pause so Medium's React internals settle.
      await sleep(800);

      // Click Import.
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Import');
      if (!btn) throw new Error('Import button not found');
      btn.click();

      // Wait for navigation to /p/<id>/edit.
      await sleep(10_000);

      if (location.pathname.match(/^\/p\/[a-f0-9]+\/edit$/)) {
        const id = location.pathname.split('/')[2];
        results.push({ url, ok: true, mediumId: id, editUrl: location.href });
        console.log(`✓ ${tag}  →  ${id}`);
      } else {
        results.push({ url, ok: false, finalUrl: location.href });
        console.warn(`✗ ${tag}  →  rate-limited or failed (still at ${location.pathname})`);
      }
    } catch (e) {
      results.push({ url, ok: false, error: e.message });
      console.error(`✗ ${tag}  →  ${e.message}`);
    }

    // Pace ourselves so Medium doesn't blanket-rate-limit us.
    if (i < URLS.length - 1) await sleep(DELAY_MS);
  }

  console.log('\n=== Done ===');
  console.table(results);
  console.log('Full results in window.__importResults');
  console.log('Copy as JSON:  copy(JSON.stringify(window.__importResults, null, 2))');
})();
