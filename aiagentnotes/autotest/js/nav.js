(function () {
  'use strict';

  function closePanel(btn, panel) {
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    var icon = btn.querySelector('i');
    if (icon) {
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-xmark');
    }
  }

  function openPanel(btn, panel) {
    panel.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    var icon = btn.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    }
  }

  function init() {
    var toggles = document.querySelectorAll('.site-nav__toggle');

    toggles.forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (panel.classList.contains('is-open')) {
          closePanel(btn, panel);
        } else {
          openPanel(btn, panel);
        }
      });

      panel.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          closePanel(btn, panel);
        });
      });
    });

    document.addEventListener('click', function (e) {
      toggles.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel || !panel.classList.contains('is-open')) return;
        if (!panel.contains(e.target) && !btn.contains(e.target)) {
          closePanel(btn, panel);
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      toggles.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel && panel.classList.contains('is-open')) {
          closePanel(btn, panel);
          btn.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
