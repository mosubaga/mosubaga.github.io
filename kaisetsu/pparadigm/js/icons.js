'use strict';
// Decorative icons always accompany visible text; code examples stay untouched.
document.addEventListener('DOMContentLoaded', () => {
  function decorate(element, name, badge = false) {
    if (!element || element.querySelector(':scope > .friendly-icon')) return;
    const icon = document.createElement('i');
    icon.className = 'friendly-icon ' + name + (badge ? ' icon-badge' : '');
    icon.setAttribute('aria-hidden', 'true');
    element.prepend(icon);
  }
  const conceptIcons = {
    classes: 'fa-solid fa-drafting-compass', objects: 'fa-solid fa-cubes',
    attributes: 'fa-solid fa-sliders', methods: 'fa-solid fa-bolt',
    encapsulation: 'fa-solid fa-shield-halved', abstraction: 'fa-solid fa-wand-magic-sparkles',
    inheritance: 'fa-solid fa-sitemap', polymorphism: 'fa-solid fa-shapes',
    'pure-functions': 'fa-solid fa-star', immutability: 'fa-solid fa-lock',
    'higher-order': 'fa-solid fa-paper-plane', composition: 'fa-solid fa-link',
    recursion: 'fa-solid fa-rotate'
  };
  for (const [id, icon] of Object.entries(conceptIcons)) {
    decorate(document.querySelector('#' + id + ' h3'), icon, true);
    decorate(document.querySelector('.sidebar a[href="#' + id + '"]'), icon);
  }
  const destinations = {
    '#oop': 'fa-solid fa-cubes', '#fp': 'fa-solid fa-code-branch',
    '#playground': 'fa-solid fa-flask', 'tips.html': 'fa-solid fa-lightbulb',
    'index.html': 'fa-solid fa-book-open', '#tips': 'fa-solid fa-lightbulb',
    '#comparison': 'fa-solid fa-scale-balanced', '#': 'fa-solid fa-arrow-up',
    '#python': 'fa-brands fa-python', '#java': 'fa-brands fa-java',
    '#javascript': 'fa-brands fa-js', '#cpp': 'fa-solid fa-code'
  };
  for (const link of document.querySelectorAll('nav a, .sidebar > a, .site-footer a')) {
    decorate(link, destinations[link.getAttribute('href')] || 'fa-solid fa-compass');
  }
  for (const lesson of document.querySelectorAll('.lesson')) {
    decorate(lesson.querySelector('.analogy'), 'fa-regular fa-lightbulb');
    decorate(lesson.querySelector('.focus'), 'fa-solid fa-magnifying-glass');
    decorate(lesson.querySelector('.output > span'), 'fa-solid fa-terminal');
  }
  const languages = {python:'fa-brands fa-python',java:'fa-brands fa-java',javascript:'fa-brands fa-js',cpp:'fa-solid fa-code'};
  for (const [id, icon] of Object.entries(languages)) {
    const section = document.getElementById(id);
    if (!section) continue;
    decorate(section.querySelector('h2'), icon, true);
    const examples = section.querySelectorAll('.tip-example h3');
    decorate(examples[0], 'fa-solid fa-cubes');
    decorate(examples[1], 'fa-solid fa-code-branch');
  }
  for (const note of document.querySelectorAll('.tip-notes > div:first-child h3')) decorate(note, 'fa-solid fa-seedling');
  for (const note of document.querySelectorAll('.tip-notes > div:last-child h3')) decorate(note, 'fa-solid fa-circle-info');
  for (const note of document.querySelectorAll('.alert > strong')) decorate(note, note.closest('.alert--success') ? 'fa-solid fa-circle-check' : 'fa-solid fa-terminal');
  const steps = ['fa-solid fa-list-check','fa-solid fa-cube','fa-solid fa-calculator','fa-solid fa-puzzle-piece','fa-solid fa-vial'];
  document.querySelectorAll('.practice-steps li > strong').forEach((step, index) => decorate(step, steps[index]));
  document.querySelectorAll('.hero-meta span').forEach((item, index) => decorate(item, ['fa-solid fa-book-open','fa-solid fa-code','fa-solid fa-rocket'][index]));
  decorate(document.querySelector('label[for="language"]'), 'fa-solid fa-code');
  decorate(document.querySelector('.pipeline-controls label'), 'fa-solid fa-hashtag');
  function updateCopyIcon(button) {
    decorate(button, button.textContent.includes('Copied!') ? 'fa-solid fa-check' : 'fa-regular fa-copy');
  }
  for (const button of document.querySelectorAll('.copy-button')) {
    updateCopyIcon(button);
    // Copy feedback replaces text, so restore the icon after each status change.
    new MutationObserver(() => updateCopyIcon(button)).observe(button, {childList:true});
  }
});
