// Syntax highlighting, copy-to-clipboard buttons and the back-to-top button.
(function () {
  if (window.hljs) {
    hljs.highlightAll();
  }

  document.querySelectorAll(".code-block").forEach(function (figure) {
    var code = figure.querySelector("pre code");
    if (!code || !navigator.clipboard) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "copy-btn";
    button.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i> Copy';
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(code.textContent).then(function () {
        button.classList.add("is-done");
        button.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copied';
        setTimeout(function () {
          button.classList.remove("is-done");
          button.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i> Copy';
        }, 1600);
      });
    });
    figure.appendChild(button);
  });

  var toTop = document.querySelector(".to-top");
  if (toTop) {
    var update = function () {
      toTop.classList.toggle("is-visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", update, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
  }
})();
