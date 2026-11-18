/* Adds a "Copy" button to every code block (<pre><code>).
   Copies the exact plain text, so it pastes cleanly into any editor. */
(function () {
  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; },
                                                      function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function init() {
    document.querySelectorAll("pre > code").forEach(function (code) {
      var pre = code.parentElement;
      var wrap = pre.parentElement;
      if (!wrap.classList.contains("code-block")) {
        wrap = document.createElement("div");
        wrap.className = "code-block";
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
      }
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", function () {
        copyText(code.textContent).then(function (ok) {
          btn.textContent = ok ? "Copied!" : "Press Ctrl/⌘+C";
          btn.classList.toggle("copied", ok);
          if (!ok) {
            var range = document.createRange();
            range.selectNodeContents(code);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
          setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 2000);
        });
      });
      wrap.appendChild(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
