// Shared site behavior: mobile nav toggle + active link detection.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    const icon = toggle.querySelector('i');
    const setIcon = (isOpen) => {
      if (!icon) return;
      icon.classList.toggle('fa-bars', !isOpen);
      icon.classList.toggle('fa-xmark', isOpen);
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      setIcon(isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        setIcon(false);
      });
    });
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
