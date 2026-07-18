(function () {
  function addCopyButtons() {
    document.querySelectorAll('.code-example').forEach(function (block) {
      // Avoid adding a second button if the script runs more than once
      if (block.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
        'aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/>' +
        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
        '<span>Copy</span>';

      block.appendChild(btn);

      btn.addEventListener('click', function () {
        const codeEl = block.querySelector('code');
        const text = codeEl ? codeEl.innerText : block.innerText;

        function showCopied() {
          btn.classList.add('copied');
          btn.querySelector('span').textContent = 'Copied!';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.querySelector('span').textContent = 'Copy';
          }, 2000);
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
        } else {
          fallbackCopy();
        }

        function fallbackCopy() {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); showCopied(); } catch (_) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
