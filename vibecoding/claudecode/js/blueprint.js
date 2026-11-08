// Architecture Blueprint Generator: pick an app type, render folder tree,
// a CLAUDE.md starting template, and a prompting strategy.
document.addEventListener('DOMContentLoaded', () => {
  const optionsEl = document.getElementById('blueprint-options');
  const outputEl = document.getElementById('blueprint-output');
  if (!optionsEl || !outputEl) return;

  const blueprints = {
    saas: {
      icon: 'fa-puzzle-piece',
      title: 'Full-Stack SaaS',
      desc: 'Multi-tenant app with auth, billing, and a database.',
      tree:
`my-saas-app/
├── apps/
│   ├── web/              # Next.js / React frontend
│   └── api/              # REST or GraphQL backend
├── packages/
│   ├── db/               # Prisma schema + migrations
│   └── ui/               # Shared component library
├── tests/
├── CLAUDE.md
└── package.json`,
      claude:
`# Project: <name>
## Stack
Next.js, Node/Express, PostgreSQL (Prisma), Tailwind

## Commands
- Dev: npm run dev
- Test: npm test
- Build: npm run build
- Lint: npm run lint

## Conventions
- Feature folders under apps/web/src/features/*
- All API input validated with zod at the route boundary
- Schema changes go through "prisma migrate", never hand-edited

## Do not
- Do not edit generated Prisma client files`,
      strategy: [
        ['Start with /init', 'Let Claude Code map the monorepo and write the first CLAUDE.md before you ask for features.'],
        ['Ship one vertical slice at a time', 'Request UI + API + DB together for a single feature rather than a whole area at once.'],
        ['Verify schema changes', 'Always ask it to run the migration and the test suite after touching the DB schema.'],
        ['Review before merge', 'Run /review on the diff before opening a pull request.']
      ]
    },
    portfolio: {
      icon: 'fa-image',
      title: 'Portfolio',
      desc: 'A fast, static personal site showcasing your work.',
      tree:
`my-portfolio/
├── src/
│   ├── pages/
│   ├── components/
│   └── content/          # Markdown case studies
├── public/
│   └── images/
├── CLAUDE.md
└── package.json`,
      claude:
`# Project: Personal Portfolio
## Stack
Static HTML/CSS/JS (or Astro), static export, no backend

## Commands
- Dev: npm run dev
- Build: npm run build

## Conventions
- Content lives in src/content/*.md, never hardcoded in components
- Keep the bundle small — avoid heavy UI frameworks for static pages

## Goals
- Fast load time, accessible, mobile-first`,
      strategy: [
        ['Define your voice once', 'Put a short description of your tone/brand in CLAUDE.md so copy suggestions stay consistent.'],
        ['Build section by section', 'Ask for the hero, then projects, then contact — not the whole page in one prompt.'],
        ['Close with a performance pass', 'Ask Claude Code to check image sizes, unused CSS, and basic accessibility before you call it done.']
      ]
    },
    ecommerce: {
      icon: 'fa-cart-shopping',
      title: 'E-commerce Front-end',
      desc: 'A storefront UI backed by a commerce or payments API.',
      tree:
`my-storefront/
├── src/
│   ├── pages/
│   │   ├── product/[slug].tsx
│   │   └── cart.tsx
│   ├── components/
│   │   ├── ProductCard/
│   │   └── CartDrawer/
│   ├── lib/
│   │   └── api/           # calls to the commerce backend
│   └── store/              # cart / session state
├── CLAUDE.md
└── package.json`,
      claude:
`# Project: Storefront Front-end
## Stack
React/Next.js, Tailwind, commerce API (Shopify/Stripe/etc.)

## Commands
- Dev: npm run dev
- Test: npm test
- Build: npm run build

## Conventions
- Never hardcode prices or inventory — always fetch from the commerce API
- Cart state lives in store/cart.ts, not component state

## Do not
- Do not commit API keys — use .env.local, never a live secret in code`,
      strategy: [
        ['Mock the API first', 'Build against a mocked commerce API so UI work isn\'t blocked on backend access.'],
        ['Ask for every state explicitly', 'Loading, empty, and error states are easy to skip — name them in the prompt.'],
        ['Test payments in test mode only', 'Verify checkout changes against a sandbox provider, never live keys.']
      ]
    },
    api: {
      icon: 'fa-plug',
      title: 'API / Backend Service',
      desc: 'A standalone service exposing endpoints to other apps.',
      tree:
`my-api-service/
├── src/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── db/
│       └── migrations/
├── tests/
├── CLAUDE.md
└── package.json`,
      claude:
`# Project: Backend API Service
## Stack
Node.js/Express (or FastAPI), PostgreSQL

## Commands
- Dev: npm run dev
- Test: npm test
- Migrate: npm run db:migrate

## Conventions
- Business logic lives in services/, routes stay thin
- All inputs validated at the route boundary

## Do not
- Do not skip running tests to "save time" — run them after every change`,
      strategy: [
        ['Hand over the spec first', 'Give Claude Code the OpenAPI/schema spec as context before implementing endpoints.'],
        ['One endpoint per prompt', 'Route + service + test, together, per prompt — not the whole API surface at once.'],
        ['Verify with a real request', 'Check new endpoints with curl/httpie or a test, not just a read-through of the diff.']
      ]
    }
  };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function highlightClaude(text) {
    return escapeHtml(text).split('\n').map((line) => {
      if (/^##\s/.test(line)) return `<span class="tok-ice">${line}</span>`;
      if (/^#\s/.test(line)) return `<span class="tok-pink">${line}</span>`;
      if (/^-\s/.test(line)) return `<span class="tok-lav">-</span>${line.slice(1)}`;
      return `<span class="tok-muted">${line}</span>`;
    }).join('\n');
  }

  function renderOutput(key) {
    const bp = blueprints[key];
    if (!bp) return;

    outputEl.innerHTML = `
      <div>
        <h3><i class="fa-solid fa-folder-tree" aria-hidden="true"></i>Folder structure</h3>
        <div class="code-panel">
          <div class="code-panel-head">
            <div class="code-dots"><span></span><span></span><span></span></div>
            <span class="code-panel-name"><i class="fa-solid fa-folder-tree" aria-hidden="true"></i>tree</span>
          </div>
          <pre><code>${escapeHtml(bp.tree)}</code></pre>
        </div>
      </div>
      <div>
        <h3><i class="fa-solid fa-file-lines" aria-hidden="true"></i>CLAUDE.md starter</h3>
        <div class="code-panel">
          <div class="code-panel-head">
            <div class="code-dots"><span></span><span></span><span></span></div>
            <span class="code-panel-name"><i class="fa-solid fa-file-lines" aria-hidden="true"></i>CLAUDE.md</span>
          </div>
          <pre><code>${highlightClaude(bp.claude)}</code></pre>
        </div>
      </div>
      <div>
        <h3><i class="fa-solid fa-bullseye" aria-hidden="true"></i>Prompting strategy</h3>
        <ul class="strategy-list">
          ${bp.strategy.map(([head, body]) => `<li><b><i class="fa-solid fa-check" aria-hidden="true"></i>${escapeHtml(head)}</b>${escapeHtml(body)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  optionsEl.innerHTML = Object.entries(blueprints).map(([key, bp]) => `
    <button class="blueprint-option" data-key="${key}" type="button">
      <i class="fa-solid ${bp.icon} bp-icon" aria-hidden="true"></i>
      <span class="bp-title">${escapeHtml(bp.title)}</span>
      <span class="bp-desc">${escapeHtml(bp.desc)}</span>
    </button>
  `).join('');

  const optionButtons = Array.from(optionsEl.querySelectorAll('.blueprint-option'));

  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      optionButtons.forEach((b) => b.classList.toggle('selected', b === btn));
      renderOutput(btn.dataset.key);
      outputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  optionButtons[0].classList.add('selected');
  renderOutput(optionButtons[0].dataset.key);
});
