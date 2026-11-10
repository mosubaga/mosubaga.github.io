/* Adds a "Copy" button to every code snippet (<pre><code>). */
(function () {
  "use strict";

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
    return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return fallbackCopy(text);
  }

  var LABELS = {
    copy: '<i class="fa-regular fa-copy" aria-hidden="true"></i> Copy',
    copied: '<i class="fa-solid fa-check" aria-hidden="true"></i> Copied!',
    failed: '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Failed'
  };

  function flash(button, state) {
    button.innerHTML = LABELS[state];
    clearTimeout(button._ykTimer);
    button._ykTimer = setTimeout(function () {
      button.innerHTML = LABELS.copy;
      button.classList.remove("copied");
    }, 1600);
  }

  function addCopyButtons() {
    document.querySelectorAll("pre > code").forEach(function (code) {
      var pre = code.parentElement;
      if (pre.querySelector(".yk-copy")) return;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "yk-copy";
      button.innerHTML = LABELS.copy;
      button.setAttribute("aria-label", "Copy code to clipboard");

      button.addEventListener("click", function () {
        copyText(code.innerText)
          .then(function () {
            button.classList.add("copied");
            flash(button, "copied");
          })
          .catch(function () { flash(button, "failed"); });
      });

      pre.classList.add("yk-code");
      pre.appendChild(button);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
