'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Navigation works without JavaScript; observation adds reading position feedback.
const menu = $('#menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  $('#sidebar').classList.toggle('open', open);
});
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); $('#sidebar').classList.remove('open'); }
$$('.sidebar nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const navLinks = $$('.sidebar nav a');
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio);
  if (!visible.length) return;
  navLinks.forEach(link => {
    const active = link.hash === '#' + visible[0].target.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-85px 0px -55% 0px', threshold: [0, .1, .3] });
$$('main > section[id]').filter(section => section.id !== 'quickstart').forEach(section => observer.observe(section));

const scenarios = {
  review: [
    ['prompt', '> Review the cart diff for regressions. Report actionable findings with file references; do not edit.'],
    ['dim', '• Reading AGENTS.md and the working tree diff…'],
    ['', '• Tracing quantity updates and existing cart tests…'],
    ['error', 'Finding · src/state/cart.ts:28\nRemoving the final item leaves a stale subtotal.\nReproduction: add one item, then remove it.'],
    ['', '• The empty-cart path does not recalculate totals.\nSuggested regression test: expect an empty cart and zero subtotal.'],
    ['success', '✓ Review complete. No files changed.\nChecks: diff and code inspected; tests were not executed.']
  ],
  feature: [
    ['prompt', '> Add a project search field. Filter by name, ignore case, and test empty results.'],
    ['dim', '• Reading AGENTS.md, package.json, and project components…'],
    ['', '• Found ProjectList and its existing test setup.'],
    ['', '+ src/components/ProjectSearch.tsx\n~ src/components/ProjectList.tsx\n+ tests/project-search.test.tsx'],
    ['dim', '$ npm test -- --run\n  ✓ case-insensitive search\n  ✓ empty results message'],
    ['dim', '$ npm run build'],
    ['success', '✓ Build passed. Search is ready for review.\n  Next: inspect the diff and try it in the browser.']
  ],
  bug: [
    ['prompt', '> Reproduce the cart total failure, fix the rounding, and rerun the relevant tests.'],
    ['dim', '• Reading repository instructions and cart tests…'],
    ['error', '$ npm test -- --run cart\n  FAIL: expected 19.90, received 19.899999'],
    ['', '• The total uses floating-point arithmetic.\n  Updating the calculation to use integer cents.'],
    ['', '~ src/lib/cart.ts\n+ tests/cart-rounding.test.ts'],
    ['dim', '$ npm test -- --run cart\n$ npm run build'],
    ['success', '✓ Cart tests and build passed.\n  Review: totals now round at the currency boundary.']
  ],
  explore: [
    ['prompt', '> Explain the app architecture and trace how project data reaches the page. Do not edit files.'],
    ['dim', '• Reading AGENTS.md and the package scripts…'],
    ['', '• Inspecting routes, data helpers, and test folders…'],
    ['', 'src/app/page.tsx\n  → src/lib/projects.ts\n  → data/projects.json'],
    ['', '• Components render data from the projects helper.\n  Tests live in tests/. Build command: npm run build.'],
    ['success', '✓ Architecture mapped. No files changed.\n  Suggested next step: add a test for missing project data.']
  ]
};
let scenario = 'feature', demoIndex = 0, demoTimer = null, demoRunning = false;
function appendLine(item) {
  const line = document.createElement('p');
  line.className = 'terminal-line ' + item[0]; line.textContent = item[1];
  $('#terminal-output').append(line); $('#terminal-output').scrollTop = $('#terminal-output').scrollHeight;
}
function setDemoRunning(running) {
  demoRunning = running;
  $('#demo-play').innerHTML = running ? '<i class="fa-solid fa-pause" aria-hidden="true"></i> Pause' : '<i class="fa-solid fa-play" aria-hidden="true"></i> ' + (demoIndex >= scenarios[scenario].length ? 'Replay' : demoIndex > 1 ? 'Continue' : 'Run demo');
}
function resetDemo() {
  clearTimeout(demoTimer); demoIndex = 1; setDemoRunning(false);
  $('#terminal-output').replaceChildren(); appendLine(scenarios[scenario][0]);
  appendLine(['dim', 'Select Run demo to follow this session.']);
  $('#demo-status').textContent = 'Ready · scripted example';
}
function advanceDemo() {
  if (!demoRunning) return;
  if (demoIndex < scenarios[scenario].length) appendLine(scenarios[scenario][demoIndex++]);
  if (demoIndex >= scenarios[scenario].length) { setDemoRunning(false); $('#demo-status').textContent = 'Session complete · ready to review'; }
  else { $('#demo-status').textContent = 'Working · step ' + demoIndex + ' of ' + scenarios[scenario].length; demoTimer = setTimeout(advanceDemo, reducedMotion.matches ? 250 : 1000); }
}
$$('[data-scenario]').forEach(button => button.addEventListener('click', () => {
  scenario = button.dataset.scenario;
  $$('[data-scenario]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  resetDemo();
}));
$('#demo-play').addEventListener('click', () => {
  if (demoRunning) { clearTimeout(demoTimer); setDemoRunning(false); $('#demo-status').textContent = 'Paused'; return; }
  if (demoIndex >= scenarios[scenario].length) resetDemo();
  if (demoIndex === 1) { $('#terminal-output').replaceChildren(); appendLine(scenarios[scenario][0]); }
  setDemoRunning(true); advanceDemo();
});
$('#demo-skip').addEventListener('click', () => {
  clearTimeout(demoTimer); $('#terminal-output').replaceChildren();
  scenarios[scenario].forEach(appendLine); demoIndex = scenarios[scenario].length;
  setDemoRunning(false); $('#demo-status').textContent = 'Session complete · ready to review';
});
$('#demo-reset').addEventListener('click', resetDemo); resetDemo();

const stages = [
  ['Give the task a map.', 'Point to relevant files, repository conventions, and checks. Ask Codex to inspect unfamiliar code before making changes.', 'Read AGENTS.md and src/components/.\nExplain how filtering works today.\nIdentify the relevant tests before editing.'],
  ['Make the outcome testable.', 'Name one change, its boundaries, and the acceptance criteria. Small vertical slices are easier to review and repair.', 'Add case-insensitive project search.\nShow a useful empty state.\nPreserve the existing card layout.'],
  ['Ask for evidence.', 'Have Codex run the relevant tests and build, then inspect the diff. For UI work, exercise the page at different widths.', 'Run the search tests and production build.\nCheck keyboard navigation and tablet layout.\nReport results and any unverified behavior.'],
  ['Feed the result back in.', 'Supply the actual error, failing input, or observed behavior. Fix the cause, rerun the failed check, and review the final change.', 'At 768px, the search field overlaps the title.\nReproduce it, adjust the layout, and recheck\n768px and 1024px widths.']
];
let stage = 0, loopTimer = null;
function showStage(index) {
  stage = index;
  $$('[data-stage]').forEach((button, i) => { button.classList.toggle('active', i === index); button.setAttribute('aria-pressed', String(i === index)); });
  const [title, description, prompt] = stages[index];
  const heading = document.createElement('h3'); heading.textContent = title;
  const paragraph = document.createElement('p'); paragraph.textContent = description;
  const text = document.createElement('div'); text.append(heading, paragraph);
  const code = document.createElement('pre'); code.textContent = prompt;
  $('#loop-detail').replaceChildren(text, code);
}
function stopLoop() { clearInterval(loopTimer); loopTimer = null; $('#loop-toggle').setAttribute('aria-pressed','false'); $('#loop-toggle').innerHTML = 'Play the loop <i class="fa-solid fa-play" aria-hidden="true"></i>'; }
$$('[data-stage]').forEach(button => button.addEventListener('click', () => { stopLoop(); showStage(Number(button.dataset.stage)); }));
$('#loop-toggle').addEventListener('click', () => {
  if (loopTimer) { stopLoop(); return; }
  $('#loop-toggle').setAttribute('aria-pressed', 'true'); $('#loop-toggle').innerHTML = 'Pause loop <i class="fa-solid fa-pause" aria-hidden="true"></i>';
  loopTimer = setInterval(() => showStage((stage+1)%4), 4500);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopLoop(); if (demoRunning) { clearTimeout(demoTimer); setDemoRunning(false); $('#demo-status').textContent = 'Paused'; } } });
showStage(0);

const apps = {
  api: { title:'API / backend service', slug:'api-service', stack:'Node.js with TypeScript, Express, and PostgreSQL', tree:'src/\n├── routes/\n├── services/\n├── middleware/\n└── db/\n    └── migrations/\ndocs/openapi.yaml', feature:'Implement a projects endpoint from an OpenAPI contract, with input validation and a service layer. Start with a test database or mock repository.', boundary:'Keep routes thin. Check authorization before accessing records. Return consistent error responses. Apply migrations only to the designated development database.' },
  saas: { title:'Full-stack SaaS', slug:'saas', stack:'Next.js with TypeScript and server routes', tree:'src/\n├── app/\n│   ├── page.tsx\n│   ├── dashboard/page.tsx\n│   └── api/projects/route.ts\n├── components/\n└── lib/\n    ├── auth.ts\n    └── db.ts\nprisma/schema.prisma', feature:'Build a project dashboard with a list and a create-project form. Start with local mock data behind a data-access interface.', boundary:'Validate input on the server. Enforce authorization at data access. Keep credentials server-side; do not add billing yet.' },
  portfolio: { title:'Portfolio', slug:'portfolio', stack:'semantic HTML, CSS, and vanilla JavaScript', tree:'index.html\ncss/style.css\njs/main.js\nassets/\n├── images/\n└── resume.pdf', feature:'Build a responsive portfolio with an introduction, selected projects, and contact links. Use clearly marked placeholder content.', boundary:'Use semantic HTML, visible focus states, and optimized images. Respect reduced-motion preferences. Avoid adding a backend.' },
  commerce: { title:'E-commerce front-end', slug:'shop', stack:'React with TypeScript and Vite', tree:'src/\n├── components/\n│   ├── ProductCard.tsx\n│   └── CartDrawer.tsx\n├── pages/Catalog.tsx\n├── state/cart.ts\n└── data/products.ts\npublic/images/', feature:'Build a product catalog with category filtering and a cart drawer. Use sample products and local cart state.', boundary:'Represent money in integer cents. Label checkout as a demo; do not collect payment or personal data.' }
};
const strategies = {
  saas: ['Read the data model and authentication boundaries before planning a feature.', 'Build one vertical slice: form, route, data access, and its checks.', 'Review authorization and migrations against a development database before expanding.'],
  portfolio: ['Record the audience, visual direction, and writing tone in AGENTS.md.', 'Build the introduction, projects, and contact sections with real content or explicit placeholders.', 'Review keyboard access, image sizes, and phone/tablet layouts before publishing.'],
  commerce: ['Define a sample product contract and mock the data source first.', 'Implement catalog-to-cart behavior, including loading, empty, and error states.', 'Review quantity and currency calculations; keep any later payment integration in test mode.'],
  api: ['Provide the OpenAPI contract and inspect existing routes, middleware, and database conventions.', 'Implement one endpoint with its service and tests, including validation and authorization failures.', 'Verify request/response behavior with integration requests and inspect the final diff.']
};
let app = 'saas', outputTab = 'structure';
function blueprint() {
  const config = apps[app]; const browser = $('#test-strategy').value === 'browser';
  const testTree = browser ? 'tests/e2e/\n└── primary-flow.spec.ts' : 'tests/\n├── unit/\n└── integration/';
  const verification = app === 'api' ? (browser ? 'Use Playwright APIRequestContext for HTTP contract checks. Cover status codes, response schemas, invalid input, and authorization failures.' : 'Use Vitest for service logic and HTTP integration checks against a designated test database. Cover validation, authorization, and failure responses.') : browser ? 'Use Playwright for the primary user journey. Check keyboard access, focus, empty states, and 390px, 768px, and 1440px layouts.' : 'Use Vitest for logic and integration checks. Cover the primary flow, invalid input, and empty states.';
  return {
    structure: `${config.slug}/\n${config.tree}\n${testTree}\nAGENTS.md\nREADME.md\n\n# Suggested structure; adapt to the existing repo.`,
    agents: `# ${config.title}\n\n## Stack\n${config.stack}.\n\n## Conventions\nRead the existing code and package scripts first.\nKeep each change focused and follow local patterns.\n${config.boundary}\n\n## Verification\n${verification}\nRun the relevant checks and production build.\nDocument exact commands in README.md when setting up.\nReport checks run, failures, and verification gaps.`,
    prompt: `Read AGENTS.md and inspect this repository.\n\nGoal: ${config.feature}\n\nConstraints: ${config.boundary}\n\nAcceptance criteria:\n- The primary flow works with realistic sample data.\n- ${app === 'api' ? 'Success, validation, authorization, and empty-result responses follow the contract.' : 'Loading, error, and empty states are considered.'}\n- ${verification}\n\nExplain the plan, implement one working slice, then run\nthe relevant checks and build. Summarize the changes\nand state anything you could not verify.`
  };
}
function renderBlueprint() {
  $('#test-strategy option[value=browser]').textContent = app === 'api' ? 'HTTP contract checks (Playwright)' : 'Browser + accessibility checks';
  $('#project-strategy').replaceChildren(...strategies[app].map(step => { const item = document.createElement('li'); item.textContent = step; return item; }));
  const data = blueprint(); $('#blueprint-code').textContent = data[outputTab];
  $('#blueprint-filename').textContent = outputTab === 'structure' ? apps[app].slug + ' /' : outputTab === 'agents' ? 'AGENTS.md' : 'starter-prompt.txt';
  $$('[data-tab]').forEach(button => { const active = button.dataset.tab === outputTab; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
  $('#blueprint-panel').setAttribute('aria-labelledby', 'tab-' + outputTab);
}
$$('[data-app]').forEach(button => button.addEventListener('click', () => {
  app = button.dataset.app;
  $$('[data-app]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed',String(active)); }); renderBlueprint();
}));
$('#test-strategy').addEventListener('change', renderBlueprint);
$$('[data-tab]').forEach(button => {
  button.addEventListener('click', () => { outputTab = button.dataset.tab; renderBlueprint(); });
  button.addEventListener('keydown', event => {
    const tabs = $$('[data-tab]'); let i = tabs.indexOf(button);
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); i = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    outputTab = tabs[i].dataset.tab; renderBlueprint(); tabs[i].focus();
  });
});
$('#download-blueprint').addEventListener('click', () => {
  const data = blueprint(); const contents = `# ${apps[app].title} blueprint\n\n## Structure\n\n\`\`\`text\n${data.structure}\n\`\`\`\n\n## AGENTS.md\n\n${data.agents}\n\n## First prompt\n\n${data.prompt}\n\n## Prompting strategy\n\n${strategies[app].map((step, i) => `${i + 1}. ${step}`).join('\n')}\n`;
  const url = URL.createObjectURL(new Blob([contents], {type:'text/markdown;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = `${apps[app].slug}-blueprint.md`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#action-status').textContent = 'Blueprint download prepared, including the outputs and prompting strategy.';
}); renderBlueprint();

const commands = [
  ['/plan','slash','Plan an implementation.'],
  ['/skills','slash','Browse available skills.'],
  ['/permissions','slash','Adjust session permissions.'],
  ['/clear','slash','Start a fresh chat.'],
  ['/config','slash','Change terminal preferences.'],
  ['Ctrl + L','key','Clear the view; keep the chat.'],
  ['!command','key','Run a local shell command under current permissions.'],
  ['/init','slash','Draft repository instructions in AGENTS.md.'],
  ['/diff','slash','Inspect the working tree changes.'],
  ['/review','slash','Request a code review.'],
  ['/compact','slash','Summarize earlier context in a long session.'],
  ['/status','slash','Inspect session configuration and usage.'],
  ['/model','slash','Choose an available model.'],
  ['/mcp','slash','Inspect connected MCP tools.'],
  ['/resume','slash','Return to a saved session.'],
  ['codex exec "task"','cli','Run a task non-interactively.'],
  ['codex resume --last','cli','Continue your latest session.'],
  ['codex --cd path','cli','Start in a chosen directory.'],
  ['codex --add-dir path','cli','Allow an additional working directory.'],
  ['codex --help','cli','Check flags for your installed version.'],
  ['Ctrl + R','key','Search prompt history.'],
  ['@','key','Find a file to reference in your prompt.'],
  ['Tab (while working)','key','Queue a follow-up for the next turn.']
];
const categories = {slash:'Slash',cli:'CLI',key:'Keyboard'};
function renderCommands() {
  const query = $('#command-search').value.trim().toLowerCase(), category = $('#command-filter').value;
  const filtered = commands.filter(row => (category === 'all' || row[1] === category) && row.join(' ').toLowerCase().includes(query));
  $('#command-rows').replaceChildren(...filtered.map(([command,type,description]) => {
    const row = document.createElement('tr'); const first = document.createElement('td'), second = document.createElement('td'), third = document.createElement('td');
    const code = document.createElement('code'); code.textContent = command; first.append(code);
    const tag = document.createElement('span'); tag.className = 'category-tag'; tag.textContent = categories[type]; second.append(tag); third.textContent = description; row.append(first,second,third); return row;
  }));
  $('#no-results').hidden = filtered.length !== 0;
  $('#command-count').textContent = `${filtered.length} of ${commands.length} commands`;
}
$('#command-search').addEventListener('input', renderCommands); $('#command-filter').addEventListener('change',renderCommands); renderCommands();

$$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const text = document.getElementById(button.dataset.copy).textContent;
  try {
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); copied = true; } catch { /* Fall back when clipboard permission is unavailable. */ }
    }
    if (!copied) {
      const field = document.createElement('textarea'); field.value = text; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select();
      const copied = document.execCommand('copy'); field.remove(); button.focus(); if (!copied) throw new Error('Clipboard unavailable');
    }
    button.textContent = 'Copied'; setTimeout(() => { button.textContent = 'Copy'; }, 1800);
  } catch { $('#action-status').textContent = 'Clipboard unavailable. Select the text to copy it manually.'; button.textContent = 'Select text'; }
}));
