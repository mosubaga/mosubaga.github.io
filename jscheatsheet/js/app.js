(() => {
  const NAV_ICONS = {
    'index.html': 'fa-house',
    'arrays.html': 'fa-list',
    'objects.html': 'fa-cube',
    'oop.html': 'fa-sitemap',
    'everyday.html': 'fa-bolt',
    'debug.html': 'fa-bug',
    'async.html': 'fa-clock',
    'fp.html': 'fa-code-branch',
    'dom.html': 'fa-diagram-project',
    'reacthooks.html': 'fa-atom',
    'redux.html': 'fa-database',
    'playwright.html': 'fa-vial',
  };

  function fileNameFromHref(href) {
    return (href || '').split('/').pop().split(/[?#]/)[0];
  }

  function addNavIcons() {
    document.querySelectorAll('.navbar a, .fw-nav a').forEach((link) => {
      if (link.querySelector('i')) return;
      const href = link.getAttribute('href') || '';
      const icon = href.includes('framework/') ? 'fa-puzzle-piece' : NAV_ICONS[fileNameFromHref(href)];
      if (!icon) return;
      const i = document.createElement('i');
      i.className = `fa-solid ${icon}`;
      i.setAttribute('aria-hidden', 'true');
      link.prepend(i, ' ');
    });
  }

  function fallbackCopy(code) {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }

  function addCopyButtons() {
    document.querySelectorAll('pre').forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code || pre.dataset.copyReady) return;
      pre.dataset.copyReady = 'true';
      pre.classList.add('has-copy-btn');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-btn';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.innerHTML = '<i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copy</span>';

      button.addEventListener('click', async () => {
        const text = code.textContent.replace(/\n+$/, '');
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          fallbackCopy(code);
        }

        button.classList.add('copied');
        button.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Copied!</span>';
        window.clearTimeout(button.dataset.resetTimer);
        button.dataset.resetTimer = window.setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = '<i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copy</span>';
        }, 1800);
      });

      pre.appendChild(button);
    });
  }

  function addBackToTop() {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(button);

    const toggleVisibility = () => {
      button.classList.toggle('visible', window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggleVisibility();
  }

  document.addEventListener('DOMContentLoaded', () => {
    addNavIcons();
    addCopyButtons();
    addBackToTop();
  });
})();
