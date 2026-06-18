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
      btn.textContent = 'Copy';
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

  function showCopied(btn) {
    btn.textContent = 'Copied!';
    btn.classList.add('copy-btn--done');
    setTimeout(function () {
      btn.textContent = 'Copy';
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
      btn.textContent = 'Error';
      setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
    }
    document.body.removeChild(ta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachCopyButtons);
  } else {
    attachCopyButtons();
  }
})();
