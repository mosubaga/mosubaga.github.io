/* ============================================================
   DB Notes — site behaviour
   1. Copy button on every code block
   2. Mobile menu toggle
   3. Dark mode toggle (persisted in localStorage)
   4. Search/filter boxes
   5. Highlight the current page in the sidebar
   No database connections — UI helpers only.
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. Copy buttons
     Every <pre> is wrapped in a .code-block with a header bar
     showing the language (from data-lang) and a Copy button.
     ---------------------------------------------------------- */
  function setupCopyButtons() {
    document.querySelectorAll("pre").forEach(function (pre) {
      var wrap = document.createElement("div");
      wrap.className = "code-block";

      var head = document.createElement("div");
      head.className = "code-head";

      var lang = document.createElement("span");
      lang.className = "code-lang";
      lang.textContent = pre.getAttribute("data-lang") || "code";
      head.appendChild(lang);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.addEventListener("click", function () {
        copyText(pre.innerText.trim(), btn);
      });
      head.appendChild(btn);

      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(head);
      wrap.appendChild(pre);
    });
  }

  function copyText(text, btn) {
    function done() {
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      }, 1500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  // For older browsers or non-HTTPS contexts (e.g. file://)
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* nothing else we can do */
    }
    document.body.removeChild(ta);
  }

  /* ----------------------------------------------------------
     2. Mobile menu toggle
     ---------------------------------------------------------- */
  function setupMenu() {
    var toggle = document.getElementById("menuToggle");
    var backdrop = document.getElementById("navBackdrop");
    if (!toggle) return;

    function close() {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    if (backdrop) backdrop.addEventListener("click", close);

    // Close the menu after choosing a page
    document.querySelectorAll(".sidebar a").forEach(function (link) {
      link.addEventListener("click", close);
    });
  }

  /* ----------------------------------------------------------
     3. Dark mode toggle
     The theme is applied early by an inline script in <head>
     to avoid a flash; this just wires up the button.
     ---------------------------------------------------------- */
  function setupTheme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    function refreshIcon() {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      btn.textContent = dark ? "☀️" : "🌙"; // sun / moon
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }

    btn.addEventListener("click", function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (dark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("dbnotes-theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("dbnotes-theme", "dark");
      }
      refreshIcon();
    });

    refreshIcon();
  }

  /* ----------------------------------------------------------
     4. Search / filter boxes
     An <input data-filter="#some-id"> hides rows (or list
     items) inside the target that do not match the query.
     ---------------------------------------------------------- */
  function setupFilters() {
    document.querySelectorAll("input[data-filter]").forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-filter"));
      if (!target) return;

      var items = target.querySelectorAll("tbody tr");
      if (items.length === 0) items = target.querySelectorAll("li");

      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var match = item.textContent.toLowerCase().indexOf(q) !== -1;
          item.style.display = q === "" || match ? "" : "none";
        });
      });
    });
  }

  /* ----------------------------------------------------------
     5. Highlight current page in the sidebar
     ---------------------------------------------------------- */
  function highlightNav() {
    var page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".sidebar a").forEach(function (link) {
      if (link.getAttribute("href") === page) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupCopyButtons();
    setupMenu();
    setupTheme();
    setupFilters();
    highlightNav();
  });
})();
