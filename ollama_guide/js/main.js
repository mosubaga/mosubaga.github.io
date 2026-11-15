// Mobile nav, code copy buttons, syntax highlighting and TOC scroll-spy.
(function () {
  const $ = (s) => document.querySelector(s);

  const menuBtn = $('#mobile-toggle');
  const mobileNav = $('#mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.back-to-top').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));

  let toastTimeout;
  function showToast(message) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = message;
    t.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => (t.hidden = true), 2400);
  }

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.closest('.code-block').querySelector('code').innerText;
      const icon = btn.querySelector('i');
      const label = btn.querySelector('span') || btn;
      const set = (iconCls, text) => { if (icon) icon.className = iconCls; label.textContent = text; };
      const fallbackCopy = () => {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        if (!ok) throw new Error('copy failed');
      };
      try {
        try { await navigator.clipboard.writeText(code); } catch (e) { fallbackCopy(); }
        set('fa-solid fa-check', 'Copied');
        showToast('Code copied to clipboard');
      } catch (e) {
        set('fa-solid fa-xmark', 'Failed');
      }
      setTimeout(() => set('fa-regular fa-copy', 'Copy'), 1600);
    });
  });

  if (window.hljs) {
    document.querySelectorAll('pre code').forEach((el) => window.hljs.highlightElement(el));
  }

  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tocLinks.forEach((a) => a.classList.remove('active'));
          const link = byId.get(entry.target.id);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-110px 0px -65% 0px' });
    byId.forEach((_, id) => { const h = document.getElementById(id); if (h) observer.observe(h); });
  }
})();
