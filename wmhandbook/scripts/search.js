const input = document.querySelector('#formula-search');
const results = document.querySelector('#search-results');
const count = document.querySelector('#search-count');
const cards = Array.from(document.querySelectorAll('[data-formula-card]'));
const formulaIndex = JSON.parse(document.querySelector('#formula-index')?.textContent || '[]');

function renderResults(matches, query) {
  if (!query) {
    results.innerHTML = '';
    count.textContent = 'All formulas';
    return;
  }

  count.textContent = `${matches.length} match${matches.length === 1 ? '' : 'es'}`;

  if (matches.length === 0) {
    results.innerHTML = '<p class="empty-result">No formulas matched your search.</p>';
    return;
  }

  results.innerHTML = matches.slice(0, 8).map((formula) => `
    <a class="result-item" href="${formula.sectionHref}">
      <span>${formula.section} / ${formula.group}</span>
      <strong>${formula.name}</strong>
      <em>\\(${formula.latex}\\)</em>
    </a>
  `).join('');

  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([results]);
  }
}

function applySearch() {
  const query = input.value.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const matches = formulaIndex.filter((formula) => {
    const haystack = `${formula.name} ${formula.section} ${formula.group} ${formula.note || ''} ${formula.latex}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  cards.forEach((card) => {
    const haystack = card.dataset.search.toLowerCase();
    const isMatch = terms.every((term) => haystack.includes(term));
    card.hidden = terms.length > 0 && !isMatch;
  });

  renderResults(matches, query);
}

input?.addEventListener('input', applySearch);
