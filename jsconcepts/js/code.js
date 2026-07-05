(function () {
  'use strict';

  // ─── JavaScript syntax highlighter ───────────────────────────────────────
  // Sequential tokenizer: strings/comments always take priority so keywords
  // are never matched inside them.

  const KEYWORDS = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for',
    'from', 'function', 'get', 'if', 'import', 'in', 'instanceof', 'let',
    'new', 'null', 'of', 'return', 'set', 'static', 'super', 'switch',
    'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void',
    'while', 'yield', 'async', 'await'
  ]);

  function esc(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function span(cls, text) {
    return '<span class="' + cls + '">' + esc(text) + '</span>';
  }

  function highlightJS(raw) {
    var out = '';
    var i = 0;
    var n = raw.length;

    while (i < n) {
      var ch = raw[i];

      // Single-line comment //
      if (ch === '/' && raw[i + 1] === '/') {
        var j = i;
        while (j < n && raw[j] !== '\n') j++;
        out += span('hl-comment', raw.slice(i, j));
        i = j;
        continue;
      }

      // Block comment /* … */
      if (ch === '/' && raw[i + 1] === '*') {
        var j = i + 2;
        while (j < n - 1 && !(raw[j] === '*' && raw[j + 1] === '/')) j++;
        j += 2;
        out += span('hl-comment', raw.slice(i, j));
        i = j;
        continue;
      }

      // Template literal `…`
      if (ch === '`') {
        var j = i + 1;
        while (j < n && raw[j] !== '`') {
          if (raw[j] === '\\') j++;
          j++;
        }
        out += span('hl-string', raw.slice(i, j + 1));
        i = j + 1;
        continue;
      }

      // String ' or "
      if (ch === '"' || ch === "'") {
        var j = i + 1;
        while (j < n && raw[j] !== ch && raw[j] !== '\n') {
          if (raw[j] === '\\') j++;
          j++;
        }
        out += span('hl-string', raw.slice(i, j + 1));
        i = j + 1;
        continue;
      }

      // Number (not mid-identifier)
      if (/\d/.test(ch) && (i === 0 || !/[a-zA-Z0-9_$]/.test(raw[i - 1]))) {
        var j = i;
        while (j < n && /[\d.eExXoObBn_]/.test(raw[j])) j++;
        out += span('hl-number', raw.slice(i, j));
        i = j;
        continue;
      }

      // Identifier, keyword, or function call
      if (/[a-zA-Z_$]/.test(ch)) {
        var j = i;
        while (j < n && /[a-zA-Z0-9_$]/.test(raw[j])) j++;
        var word = raw.slice(i, j);

        // Peek past spaces to detect a function call
        var k = j;
        while (k < n && raw[k] === ' ') k++;

        if (KEYWORDS.has(word)) {
          out += span('hl-keyword', word);
        } else if (raw[k] === '(') {
          out += span('hl-function', word);
        } else {
          out += esc(word);
        }

        i = j;
        continue;
      }

      out += esc(ch);
      i++;
    }

    return out;
  }

  // ─── Copy button ──────────────────────────────────────────────────────────

  function copyIcon() { return '<i class="fa-regular fa-copy"></i> Copy'; }
  function checkIcon() { return '<i class="fa-solid fa-check"></i> Copied!'; }

  function addCopyButton(pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = copyIcon();
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', function () {
      var codeEl = pre.querySelector('code') || pre;
      var text = codeEl.innerText;

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

    pre.appendChild(btn);
  }

  function showCopied(btn) {
    btn.innerHTML = checkIcon();
    btn.classList.add('copied');
    setTimeout(function () {
      btn.innerHTML = copyIcon();
      btn.classList.remove('copied');
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
    }
    document.body.removeChild(ta);
  }

  // ─── Nav icons ────────────────────────────────────────────────────────────

  function addNavIcons() {
    var iconMap = {
      'index.html':        'fa-house',
      'callstack.html':    'fa-layer-group',
      'closures.html':     'fa-lock',
      'eventloop.html':    'fa-arrows-rotate',
      'fucntions.html':    'fa-code',
      'hoisting.html':     'fa-arrow-up',
      'modules.html':      'fa-puzzle-piece',
      'typecoercion.html': 'fa-right-left'
    };

    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      var iconCls = iconMap[href];
      if (iconCls) {
        a.insertAdjacentHTML('afterbegin', '<i class="fa-solid ' + iconCls + '"></i>');
      }
    });
  }

  // ─── Callout / note box icons ─────────────────────────────────────────────

  function addCalloutIcons() {
    var rules = [
      { sel: 'div.callout, div.note',         icon: 'fa-solid fa-circle-info',         cls: 'ci-info'    },
      { sel: 'div.good',                       icon: 'fa-solid fa-circle-check',         cls: 'ci-good'    },
      { sel: 'div.warn, div.warning',          icon: 'fa-solid fa-triangle-exclamation', cls: 'ci-warn'    },
      { sel: 'div.danger',                     icon: 'fa-solid fa-circle-exclamation',   cls: 'ci-danger'  }
    ];

    rules.forEach(function (rule) {
      document.querySelectorAll(rule.sel).forEach(function (el) {
        el.insertAdjacentHTML('afterbegin',
          '<i class="callout-icon ' + rule.icon + ' ' + rule.cls + '" aria-hidden="true"></i>');
      });
    });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    // Syntax highlight + copy button on every <pre><code>
    document.querySelectorAll('pre > code').forEach(function (codeEl) {
      if (codeEl.querySelector('span')) return; // already highlighted
      codeEl.innerHTML = highlightJS(codeEl.textContent);
      addCopyButton(codeEl.parentElement);
    });

    addNavIcons();
    addCalloutIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
