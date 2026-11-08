// Mock Claude Code terminal sessions. Each script is a list of lines that get
// "typed" into the terminal body in sequence. No real execution happens.
document.addEventListener('DOMContentLoaded', () => {
  const body = document.getElementById('terminal-body');
  const buttons = Array.from(document.querySelectorAll('#cli-buttons button'));
  const replayBtn = document.getElementById('replay-btn');
  const skipBtn = document.getElementById('skip-btn');

  if (!body || !buttons.length) return;

  const PROMPT = '<span class="prompt">❯</span> <span class="path">my-app</span> ';

  const scripts = {
    init: [
      { t: 'cmd', text: '/init' },
      { t: 'out', text: 'Scanning project structure…' },
      { t: 'out', text: 'Detected: Node.js, React, Vite, Jest' },
      { t: 'out', text: 'Reading package.json, tsconfig.json, .eslintrc' },
      { t: 'out', text: 'Found 3 existing test suites, 1 README' },
      { t: 'ok',  text: '✓ Wrote CLAUDE.md with project conventions, build commands, and test instructions' },
      { t: 'muted', text: 'Tip: commit CLAUDE.md so future sessions start with full context.' }
    ],
    dev: [
      { t: 'cmd', text: '/dev add a dark mode toggle to the settings page' },
      { t: 'out', text: 'Reading src/pages/Settings.tsx and theme/ThemeProvider.tsx' },
      { t: 'out', text: 'Context gathered — planning a minimal change' },
      { t: 'out', text: 'Editing src/theme/ThemeProvider.tsx' },
      { t: 'out', text: '  + const [mode, setMode] = useState(getStoredTheme());' },
      { t: 'out', text: '  + document.documentElement.dataset.theme = mode;' },
      { t: 'out', text: 'Editing src/pages/Settings.tsx' },
      { t: 'out', text: '  + <ToggleRow label="Dark mode" checked={mode === \'dark\'} onChange={toggleTheme} />' },
      { t: 'out', text: 'Running: npm run build' },
      { t: 'ok',  text: '✓ Build succeeded in 4.2s' },
      { t: 'out', text: 'Running: npm test -- Settings' },
      { t: 'ok',  text: '✓ 6 passed, 0 failed' }
    ],
    fix: [
      { t: 'cmd', text: '/fix npm test is failing on checkout.test.ts' },
      { t: 'out', text: 'Running: npm test -- checkout.test.ts' },
      { t: 'out', text: 'FAIL  src/checkout/checkout.test.ts' },
      { t: 'out', text: '  ✕ applies discount before tax (12 ms)' },
      { t: 'out', text: '    Expected: 90.00  Received: 97.20' },
      { t: 'out', text: 'Reading src/checkout/pricing.ts' },
      { t: 'out', text: 'Found it: tax is applied before the discount, order should be reversed' },
      { t: 'out', text: 'Editing src/checkout/pricing.ts' },
      { t: 'out', text: '  - const total = applyTax(subtotal); return applyDiscount(total, code);' },
      { t: 'out', text: '  + const discounted = applyDiscount(subtotal, code); return applyTax(discounted);' },
      { t: 'out', text: 'Running: npm test -- checkout.test.ts' },
      { t: 'ok',  text: '✓ 1 passed, 0 failed' }
    ],
    review: [
      { t: 'cmd', text: '/review' },
      { t: 'out', text: 'Diffing against origin/main… 4 files changed, 86 insertions, 12 deletions' },
      { t: 'out', text: 'Checking for correctness issues, unused code, and missing error handling' },
      { t: 'out', text: 'src/api/users.ts:41 — response.data is used before the fetch is awaited' },
      { t: 'out', text: 'src/api/users.ts:58 — duplicate validation logic also exists in validators.ts' },
      { t: 'ok',  text: '✓ No blocking issues — 2 cleanup suggestions above' }
    ]
  };

  let activeTimeouts = [];
  let currentLines = [];
  let currentStep = 0;

  function clearTimers() {
    activeTimeouts.forEach(clearTimeout);
    activeTimeouts = [];
  }

  function renderLine(line) {
    const p = document.createElement('p');
    if (line.t === 'cmd') {
      p.className = 'term-line cmd';
      p.innerHTML = PROMPT + escapeHtml(line.text);
    } else {
      p.className = 'term-line ' + line.t;
      p.textContent = line.text;
    }
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function playFrom(index) {
    clearTimers();
    for (let i = index; i < currentLines.length; i++) {
      const delay = (i - index) * 420 + (currentLines[i].t === 'cmd' ? 0 : 160);
      const id = setTimeout(() => {
        renderLine(currentLines[i]);
        currentStep = i + 1;
      }, delay);
      activeTimeouts.push(id);
    }
  }

  function runScript(name) {
    const script = scripts[name];
    if (!script) return;
    body.innerHTML = '';
    currentLines = script;
    currentStep = 0;
    buttons.forEach((b) => b.classList.toggle('running', b.dataset.cmd === name));
    playFrom(0);
  }

  function skipToEnd() {
    clearTimers();
    if (!currentLines.length) return;
    body.innerHTML = '';
    currentLines.forEach(renderLine);
    currentStep = currentLines.length;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => runScript(btn.dataset.cmd));
  });

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      const activeBtn = buttons.find((b) => b.classList.contains('running'));
      runScript(activeBtn ? activeBtn.dataset.cmd : 'init');
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', skipToEnd);
  }
});
