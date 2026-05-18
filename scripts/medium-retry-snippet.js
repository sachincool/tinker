// Medium import — retry snippet
//
// As of 2026-05-19, the syndication backfill is complete:
//   - 15 posts published on Medium with original dates preserved
//   - 12 posts sitting as drafts at /me/stories/drafts (publish when you want)
//   - 3 short TILs deliberately skipped (see syndication-state.json)
//
// If a NEW post on harshit.cloud needs to land on Medium, paste this into
// DevTools at https://medium.com/p/import after replacing the URL.
// Then click Import in the page. Medium will read your canonical/published
// date from the source page meta tags, so the imported draft keeps the
// original publish date.
//
// Why this lives in the repo: Medium has no API for new accounts, and the
// importer blocks programmatic typing/paste behind a behavioural rate limit
// that opens for small bursts then locks down. Character-by-character
// keystrokes (computer.key) can squeeze through when paste fails, but
// neither approach is reliable enough for a 30-post bulk run.

const URL_TO_IMPORT = 'https://harshit.cloud/blog/REPLACE-ME';

(() => {
  const div = document.querySelectorAll('[contenteditable]')[0];
  if (!div) throw new Error('Not on /p/import — open https://medium.com/p/import first');
  div.focus();
  div.textContent = '';
  const dt = new DataTransfer();
  dt.setData('text/plain', URL_TO_IMPORT);
  div.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  setTimeout(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Import');
    btn?.click();
  }, 800);
})();
