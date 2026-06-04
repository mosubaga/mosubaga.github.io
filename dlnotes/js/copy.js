document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    pre.appendChild(btn);

    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      const text = (code ? code.textContent : pre.textContent).trim();

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for browsers without Clipboard API
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }

      btn.textContent = 'Copied!';
      btn.classList.add('copy-btn--success');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copy-btn--success');
      }, 2000);
    });
  });
});
