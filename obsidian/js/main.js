const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.querySelector(button.dataset.copy);
    if (!target) return;

    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    } catch {
      button.textContent = "Select text";
    }
  });
});

const searchInput = document.querySelector("[data-filter-input]");
const filterItems = [...document.querySelectorAll("[data-filter-item]")];

if (searchInput && filterItems.length) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    filterItems.forEach((item) => {
      item.hidden = query.length > 0 && !item.textContent.toLowerCase().includes(query);
    });
  });
}
