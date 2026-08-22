/* =====================================================================
   site.js — shared behaviour for every page of the Rust guide.
   Progressive enhancement only: with JS disabled the pages still read,
   the nav still links, and the first tab of each group stays visible.
   ===================================================================== */

(function () {
    "use strict";

    /* ------------------------------------------------------------------
       1. Mobile / tablet navigation disclosure
       ------------------------------------------------------------------ */
    function initNav() {
        var toggle = document.querySelector(".nav-toggle");
        var links = document.getElementById("nav-links");
        if (!toggle || !links) return;

        function setOpen(open) {
            links.classList.toggle("open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            var icon = toggle.querySelector("i");
            if (icon) {
                icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
            }
        }

        toggle.addEventListener("click", function () {
            setOpen(!links.classList.contains("open"));
        });

        // Close after picking a destination, and on Escape.
        links.addEventListener("click", function (event) {
            if (event.target.closest("a")) setOpen(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && links.classList.contains("open")) {
                setOpen(false);
                toggle.focus();
            }
        });

        // If the viewport grows past the collapse breakpoint, drop the
        // "open" state so the inline bar is not left in menu mode.
        // Must match the nav collapse breakpoint in css/style.css.
        var wide = window.matchMedia("(min-width: 1241px)");
        var onChange = function (event) {
            if (event.matches) setOpen(false);
        };
        if (wide.addEventListener) wide.addEventListener("change", onChange);
        else if (wide.addListener) wide.addListener(onChange);
    }

    /* ------------------------------------------------------------------
       2. Highlight the nav entry for the page we are on
       ------------------------------------------------------------------ */
    function initActiveLink() {
        var path = window.location.pathname.split("/").pop() || "index.html";
        var anchors = document.querySelectorAll("#nav-links a");
        for (var i = 0; i < anchors.length; i++) {
            var href = anchors[i].getAttribute("href");
            if (href === path) {
                anchors[i].classList.add("active");
                anchors[i].setAttribute("aria-current", "page");
            }
        }
    }

    /* ------------------------------------------------------------------
       3. Tab groups
       Scoped to the closest .tab-container so several independent tab
       groups can live on one page without fighting over each other.
       ------------------------------------------------------------------ */
    function activateTab(button) {
        var container = button.closest(".tab-container");
        if (!container) return;

        var panels = container.querySelectorAll(".tab-content");
        var buttons = container.querySelectorAll(".tab-btn");
        var targetId = button.getAttribute("data-tab");

        for (var i = 0; i < panels.length; i++) {
            panels[i].classList.remove("active");
        }
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].classList.remove("active");
            buttons[j].setAttribute("aria-selected", "false");
            buttons[j].setAttribute("tabindex", "-1");
        }

        var panel = document.getElementById(targetId);
        if (panel) panel.classList.add("active");
        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        button.setAttribute("tabindex", "0");
    }

    function initTabs() {
        var containers = document.querySelectorAll(".tab-container");

        Array.prototype.forEach.call(containers, function (container) {
            var header = container.querySelector(".tab-header");
            var buttons = container.querySelectorAll(".tab-btn");
            if (!header || !buttons.length) return;

            header.setAttribute("role", "tablist");

            Array.prototype.forEach.call(buttons, function (button) {
                var targetId = button.getAttribute("data-tab");
                var panel = targetId ? document.getElementById(targetId) : null;

                button.setAttribute("role", "tab");
                button.setAttribute("type", "button");
                if (panel) {
                    button.setAttribute("aria-controls", targetId);
                    panel.setAttribute("role", "tabpanel");
                    panel.setAttribute("tabindex", "0");
                    if (button.id) panel.setAttribute("aria-labelledby", button.id);
                }

                var isActive = button.classList.contains("active");
                button.setAttribute("aria-selected", isActive ? "true" : "false");
                button.setAttribute("tabindex", isActive ? "0" : "-1");

                button.addEventListener("click", function () {
                    activateTab(button);
                });
            });

            // Left/Right arrow keys move between tabs, as ARIA expects.
            header.addEventListener("keydown", function (event) {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                var list = Array.prototype.slice.call(buttons);
                var current = list.indexOf(document.activeElement);
                if (current === -1) return;
                event.preventDefault();
                var step = event.key === "ArrowRight" ? 1 : -1;
                var next = list[(current + step + list.length) % list.length];
                next.focus();
                activateTab(next);
            });
        });
    }

    /* ------------------------------------------------------------------
       4. Copy-to-clipboard on every code block
       ------------------------------------------------------------------ */
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback for pages opened straight off the filesystem.
        return new Promise(function (resolve, reject) {
            var area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            var ok = false;
            try {
                ok = document.execCommand("copy");
            } catch (err) {
                ok = false;
            }
            document.body.removeChild(area);
            ok ? resolve() : reject(new Error("copy unavailable"));
        });
    }

    function initCopyButtons() {
        var blocks = document.querySelectorAll("pre");

        Array.prototype.forEach.call(blocks, function (pre) {
            if (pre.closest(".no-copy")) return;

            var wrapper = document.createElement("div");
            wrapper.className = "code-block";

            var head = document.createElement("div");
            head.className = "code-head";

            var label = document.createElement("span");
            label.textContent = pre.getAttribute("data-lang") || "code";

            var button = document.createElement("button");
            button.className = "copy-btn";
            button.type = "button";
            button.innerHTML = '<i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copy</span>';
            button.setAttribute("aria-label", "Copy this code block to the clipboard");

            button.addEventListener("click", function () {
                copyText(pre.innerText).then(function () {
                    button.classList.add("copied");
                    button.innerHTML =
                        '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Copied</span>';
                    window.setTimeout(function () {
                        button.classList.remove("copied");
                        button.innerHTML =
                            '<i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copy</span>';
                    }, 1800);
                }).catch(function () {
                    button.innerHTML =
                        '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Select manually</span>';
                });
            });

            head.appendChild(label);
            head.appendChild(button);

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(head);
            wrapper.appendChild(pre);
        });
    }

    /* ------------------------------------------------------------------
       5. Back-to-top control
       ------------------------------------------------------------------ */
    function initBackToTop() {
        var button = document.createElement("button");
        button.className = "to-top";
        button.type = "button";
        button.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        button.setAttribute("aria-label", "Back to top of page");
        document.body.appendChild(button);

        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        var ticking = false;
        window.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                button.classList.toggle("visible", window.scrollY > 600);
                ticking = false;
            });
        }, { passive: true });
    }

    /* ------------------------------------------------------------------
       Boot
       ------------------------------------------------------------------ */
    function init() {
        initNav();
        initActiveLink();
        initCopyButtons();
        initTabs();
        initBackToTop();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
