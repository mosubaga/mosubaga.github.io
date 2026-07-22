(function () {
  'use strict';

  function attachCopyButtons() {
    document.querySelectorAll('pre').forEach(function (pre) {
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.setAttribute('aria-live', 'polite');
      setButtonState(btn, 'fa-copy', 'Copy');
      wrapper.appendChild(btn);

      btn.addEventListener('click', function () {
        var text = pre.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showCopied(btn);
          }).catch(function () {
            fallbackCopy(text, btn);
          });
        } else {
          fallbackCopy(text, btn);
        }
      });
    });
  }

  function setButtonState(btn, icon, label) {
    btn.setAttribute('aria-label', label);
    btn.replaceChildren();
    var symbol = document.createElement('i');
    symbol.className = 'fa-solid ' + icon;
    symbol.setAttribute('aria-hidden', 'true');
    btn.appendChild(symbol);
    btn.appendChild(document.createTextNode(' ' + label));
  }

  function showCopied(btn) {
    setButtonState(btn, 'fa-check', 'Copied!');
    btn.classList.add('copy-btn--done');
    setTimeout(function () {
      setButtonState(btn, 'fa-copy', 'Copy');
      btn.classList.remove('copy-btn--done');
    }, 2000);
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch (e) {
      setButtonState(btn, 'fa-triangle-exclamation', 'Copy failed');
      setTimeout(function () { setButtonState(btn, 'fa-copy', 'Copy'); }, 2000);
    }
    document.body.removeChild(ta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachCopyButtons);
  } else {
    attachCopyButtons();
  }
})();
