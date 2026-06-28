/* ============================================================
   MD Editor — editor.js
   Depends on: CodeMirror 5 (global), markdown-it (global), KaTeX (global)
   ============================================================ */

// ── Constants ────────────────────────────────────────────────
const AUTOSAVE_KEY      = 'mdeditor_v1_content';
const AUTOSAVE_NAME_KEY = 'mdeditor_v1_filename';
const AUTOSAVE_INTERVAL = 30_000;
const VALIDATION_DELAY  = 800;

// ── State ────────────────────────────────────────────────────
const hasFS = 'showOpenFilePicker' in window;
let fileHandle       = null;
let isDirty          = false;
let currentFilename  = 'Untitled.md';
let scrollSyncSource = null;
let scrollSyncTimer  = null;
let validationTimer  = null;
let pendingIssues    = [];

// ── LaTeX / KaTeX markdown-it plugin ─────────────────────────
function mathPlugin(md) {
  // ── Inline math: $...$ ──────────────────────────────────
  // Runs before emphasis so $a_1 + a_2$ is never mangled by italic rules.
  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    const src   = state.src;
    const start = state.pos;

    if (src[start] !== '$' || src[start + 1] === '$') return false;

    let end = start + 1;
    while (end < src.length) {
      if (src[end] === '\n') return false;     // no multi-line inline math
      if (src[end] === '$') break;
      end++;
    }
    if (end >= src.length || end === start + 1) return false; // unclosed or empty

    if (!silent) {
      const tok     = state.push('math_inline', '', 0);
      tok.content   = src.slice(start + 1, end);
      tok.markup    = '$';
    }
    state.pos = end + 1;
    return true;
  });

  // ── Block math: $$...$$ ─────────────────────────────────
  md.block.ruler.after('fence', 'math_block', (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const startMax = state.eMarks[startLine];

    if (startMax - startPos < 2) return false;
    if (state.src[startPos] !== '$' || state.src[startPos + 1] !== '$') return false;

    if (silent) return true;

    // Text on the same line as the opening $$
    const openRest = state.src.slice(startPos + 2, startMax).trim();

    // Single-line: $$...$$ or $$ content $$
    if (openRest.endsWith('$$') && openRest.length > 2) {
      const tok   = state.push('math_block', '', 0);
      tok.content = openRest.slice(0, -2).trim();
      tok.map     = [startLine, startLine + 1];
      state.line  = startLine + 1;
      return true;
    }

    // Multi-line: scan forward for a line that is just $$
    let nextLine = startLine + 1;
    let found    = false;
    while (nextLine < endLine) {
      const lPos = state.bMarks[nextLine] + state.tShift[nextLine];
      const lMax = state.eMarks[nextLine];
      if (state.src.slice(lPos, lMax).trim() === '$$') { found = true; break; }
      nextLine++;
    }
    if (!found) return false;

    const lines = openRest ? [openRest] : [];
    for (let i = startLine + 1; i < nextLine; i++) {
      lines.push(state.src.slice(state.bMarks[i], state.eMarks[i]));
    }

    const tok   = state.push('math_block', '', 0);
    tok.content = lines.join('\n').trim();
    tok.map     = [startLine, nextLine + 1];
    state.line  = nextLine + 1;
    return true;
  });

  // ── Renderers ────────────────────────────────────────────
  md.renderer.rules.math_inline = (tokens, idx) => {
    try {
      return window.katex.renderToString(tokens[idx].content, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `<code class="math-error">${tokens[idx].content}</code>`;
    }
  };

  md.renderer.rules.math_block = (tokens, idx) => {
    try {
      return `<div class="math-display">${window.katex.renderToString(tokens[idx].content, {
        throwOnError: false,
        displayMode: true,
      })}</div>\n`;
    } catch {
      return `<pre class="math-error">$$\n${tokens[idx].content}\n$$</pre>\n`;
    }
  };
}

// ── markdown-it ──────────────────────────────────────────────
const md = window.markdownit({ html: true, linkify: true, typographer: true })
  .use(mathPlugin);

// ── CodeMirror ───────────────────────────────────────────────
const cm = CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: { name: 'markdown', xml: true },
  lineNumbers: true,
  lineWrapping: true,
  autofocus: true,
  indentUnit: 2,
  tabSize: 2,
  extraKeys: {
    'Ctrl-S':       () => save(),
    'Cmd-S':        () => save(),
    'Ctrl-F':       'findPersistent',
    'Cmd-F':        'findPersistent',
    'Ctrl-H':       'replace',
    'Cmd-H':        'replace',
    'Shift-Ctrl-H': 'replaceAll',
    'Shift-Cmd-H':  'replaceAll',
  }
});

// ── DOM refs ─────────────────────────────────────────────────
const previewEl    = document.getElementById('preview-content');
const validationEl = document.getElementById('validation-card');
const dirtyDot     = document.getElementById('dirty-dot');
const fileLabelEl  = document.getElementById('file-label');
const btnSave      = document.getElementById('btn-save');
const btnSaveAs    = document.getElementById('btn-save-as');
const btnCopy      = document.getElementById('btn-copy');
const dropOverlay  = document.getElementById('drop-overlay');
const tplModal     = document.getElementById('tpl-modal');
const tplBody      = document.getElementById('tpl-body');

// ── Preview ──────────────────────────────────────────────────
function renderPreview() {
  previewEl.innerHTML = md.render(cm.getValue());
}

// ── Dirty state ──────────────────────────────────────────────
function setDirty(val) {
  isDirty = val;
  dirtyDot.classList.toggle('hidden', !val);
}

function setFilename(name) {
  currentFilename         = name;
  fileLabelEl.textContent = name;
  document.title          = name + ' — MD Editor';
}

function updateSaveButtons() {
  if (hasFS && fileHandle) {
    btnSave.style.display = '';
    btnSaveAs.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save As';
  } else if (hasFS) {
    btnSave.style.display = 'none';
    btnSaveAs.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save As';
  } else {
    btnSave.style.display = 'none';
    btnSaveAs.innerHTML = '<i class="fa-solid fa-download"></i> Save As';
  }
}

function confirmDiscard() {
  return confirm('You have unsaved changes. Discard them?');
}

// ── Load text into editor ────────────────────────────────────
function loadText(text, name) {
  cm.setValue(text);
  setFilename(name);
  setDirty(false);
  updateSaveButtons();
  renderPreview();
}

// ── On editor change ─────────────────────────────────────────
cm.on('change', () => {
  setDirty(true);
  renderPreview();
  scheduleValidation();
});

// ── Scroll sync ──────────────────────────────────────────────
cm.on('scroll', () => {
  if (scrollSyncSource === 'preview') return;
  scrollSyncSource = 'editor';
  const info  = cm.getScrollInfo();
  const ratio = info.top / Math.max(1, info.height - info.clientHeight);
  previewEl.scrollTop = ratio * Math.max(0, previewEl.scrollHeight - previewEl.clientHeight);
  clearTimeout(scrollSyncTimer);
  scrollSyncTimer = setTimeout(() => { scrollSyncSource = null; }, 80);
});

previewEl.addEventListener('scroll', () => {
  if (scrollSyncSource === 'editor') return;
  scrollSyncSource = 'preview';
  const ratio = previewEl.scrollTop / Math.max(1, previewEl.scrollHeight - previewEl.clientHeight);
  const info  = cm.getScrollInfo();
  cm.scrollTo(null, ratio * Math.max(0, info.height - info.clientHeight));
  clearTimeout(scrollSyncTimer);
  scrollSyncTimer = setTimeout(() => { scrollSyncSource = null; }, 80);
});

// ── File operations ───────────────────────────────────────────
async function openFile() {
  if (isDirty && !confirmDiscard()) return;
  if (hasFS) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Markdown / Text', accept: { 'text/markdown': ['.md', '.markdown', '.txt'] } }]
      });
      fileHandle = handle;
      const file = await handle.getFile();
      loadText(await file.text(), file.name);
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    }
  } else {
    document.getElementById('file-input').click();
  }
}

async function newFile() {
  if (isDirty && !confirmDiscard()) return;
  fileHandle = null;
  loadText('', 'Untitled.md');
}

async function save() {
  if (hasFS && fileHandle) {
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(cm.getValue());
      await writable.close();
      setDirty(false);
    } catch (e) {
      if (e.name !== 'AbortError') alert('Save failed: ' + e.message);
    }
  } else {
    await saveAs();
  }
}

async function saveAs() {
  if (hasFS) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: currentFilename,
        types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }]
      });
      fileHandle = handle;
      const writable = await handle.createWritable();
      await writable.write(cm.getValue());
      await writable.close();
      const file = await handle.getFile();
      setFilename(file.name);
      setDirty(false);
      updateSaveButtons();
    } catch (e) {
      if (e.name !== 'AbortError') alert('Save failed: ' + e.message);
    }
  } else {
    const blob = new Blob([cm.getValue()], { type: 'text/markdown' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = currentFilename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

function copyAll() {
  navigator.clipboard.writeText(cm.getValue()).then(() => {
    const orig = btnCopy.innerHTML;
    btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => { btnCopy.innerHTML = orig; }, 1500);
  });
}

// ── Button wiring ────────────────────────────────────────────
document.getElementById('btn-new').addEventListener('click', newFile);
document.getElementById('btn-open').addEventListener('click', openFile);
btnSave.addEventListener('click', save);
btnSaveAs.addEventListener('click', saveAs);
btnCopy.addEventListener('click', copyAll);
document.getElementById('btn-templates').addEventListener('click', openTemplateModal);

// ── File input fallback ──────────────────────────────────────
document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (isDirty && !confirmDiscard()) { e.target.value = ''; return; }
  loadText(await file.text(), file.name);
  e.target.value = '';
});

// ── Drag and drop ────────────────────────────────────────────
let dragCounter = 0;

document.addEventListener('dragenter', (e) => {
  if ([...e.dataTransfer.types].includes('Files')) {
    dragCounter++;
    dropOverlay.classList.add('active');
  }
});
document.addEventListener('dragleave', () => {
  dragCounter = Math.max(0, dragCounter - 1);
  if (dragCounter === 0) dropOverlay.classList.remove('active');
});
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', async (e) => {
  e.preventDefault();
  dragCounter = 0;
  dropOverlay.classList.remove('active');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (isDirty && !confirmDiscard()) return;
  fileHandle = null;
  loadText(await file.text(), file.name);
});

// ── Unsaved-changes warning ───────────────────────────────────
window.addEventListener('beforeunload', (e) => {
  if (isDirty) { e.preventDefault(); e.returnValue = ''; }
});

// ── Autosave ─────────────────────────────────────────────────
setInterval(() => {
  localStorage.setItem(AUTOSAVE_KEY, cm.getValue());
  localStorage.setItem(AUTOSAVE_NAME_KEY, currentFilename);
}, AUTOSAVE_INTERVAL);

// ── Validation (debounced) ────────────────────────────────────
function scheduleValidation() {
  clearTimeout(validationTimer);
  validationTimer = setTimeout(runValidation, VALIDATION_DELAY);
}

function runValidation() {
  const text  = cm.getValue();
  const found = [];

  const inFencedBlock = (lineIdx, lines) => {
    let depth = 0;
    for (let i = 0; i < lineIdx; i++) {
      if (/^(`{3,}|~{3,})/.test(lines[i])) depth = depth ? 0 : 1;
    }
    return depth > 0;
  };

  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (inFencedBlock(i, lines)) return;
    if (/^(    |\t)/.test(line)) return;
    const stripped = line.replace(/`[^`]+`/g, '');
    let dollars = 0;
    for (let j = 0; j < stripped.length; j++) {
      if (stripped[j] === '$' && stripped[j + 1] !== '$' && stripped[j - 1] !== '$') dollars++;
    }
    if (dollars % 2 !== 0) {
      found.push({ desc: `Line ${i + 1}: odd number of \`$\` — possible unclosed inline math.`, fix: null });
    }
  });

  const unclosedLink = /\[([^\]\n]*)\]\(([^)\n]*)$/gm;
  let m;
  while ((m = unclosedLink.exec(text)) !== null) {
    const lineNum = text.slice(0, m.index).split('\n').length;
    found.push({
      desc: `Line ${lineNum}: link \`[${m[1]}](\` is missing its closing \`)\`.`,
      fix: { offset: m.index + m[0].length, insert: ')' }
    });
  }

  const emptyRef = /^\[([^\]]+)\]:\s*$/gm;
  while ((m = emptyRef.exec(text)) !== null) {
    const lineNum = text.slice(0, m.index).split('\n').length;
    found.push({ desc: `Line ${lineNum}: reference \`[${m[1]}]:\` has no URL.`, fix: null });
  }

  pendingIssues = found;
  renderValidation();
}

function renderValidation() {
  if (pendingIssues.length === 0) {
    validationEl.classList.add('hidden');
    return;
  }
  validationEl.classList.remove('hidden');

  const title   = document.createElement('div');
  title.className = 'validation-title';
  title.innerHTML = `<span>Suggestions (${pendingIssues.length})</span>`;
  const dismiss = document.createElement('button');
  dismiss.className   = 'validation-dismiss';
  dismiss.title       = 'Dismiss';
  dismiss.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  dismiss.addEventListener('click', () => validationEl.classList.add('hidden'));
  title.appendChild(dismiss);

  validationEl.innerHTML = '';
  validationEl.appendChild(title);

  pendingIssues.forEach((issue, idx) => {
    const row = document.createElement('div');
    row.className = 'issue-row';

    const desc = document.createElement('span');
    desc.className   = 'issue-desc';
    desc.textContent = issue.desc;
    row.appendChild(desc);

    if (issue.fix) {
      const btn = document.createElement('button');
      btn.className   = 'issue-fix-btn';
      btn.innerHTML = '<i class="fa-solid fa-wrench"></i> Apply fix';
      btn.addEventListener('click', () => {
        const pos = cm.getDoc().posFromIndex(issue.fix.offset);
        cm.getDoc().replaceRange(issue.fix.insert, pos);
        pendingIssues.splice(idx, 1);
        renderValidation();
      });
      row.appendChild(btn);
    }
    validationEl.appendChild(row);
  });
}

// ── Templates ─────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'claude-md',
    name: 'CLAUDE.md',
    filename: 'CLAUDE.md',
    category: 'AI / Codex',
    categoryColor: 'blue',
    description: 'Claude Code project-level AI instructions — commands, conventions, and context.',
    content: `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

<!-- Describe what this project does and its primary purpose. -->

## Tech Stack

- **Language(s)**:
- **Runtime / Platform**:
- **Key Libraries**:
- **Build Tool**:
- **Package Manager**:

## Repository Layout

\`\`\`
.
├── src/          # Application source
├── tests/        # Test suites
├── docs/         # Documentation
└── scripts/      # Utility scripts
\`\`\`

## Development Workflow

\`\`\`bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Lint and format
npm run lint

# Build for production
npm run build
\`\`\`

## Code Conventions

- **Formatting**: [e.g. Prettier with 2-space indent]
- **Naming**: [e.g. camelCase for variables, PascalCase for types]
- **Imports**: [e.g. absolute paths via alias, sorted alphabetically]
- **Comments**: [e.g. only for non-obvious WHY, not WHAT]

## Testing

<!-- Describe how tests are organized and when to write them. -->

- Test files live next to source in \`__tests__/\` or use \`.test.ts\` suffix
- Run a single file: \`npm test -- path/to/file.test.ts\`
- Coverage: \`npm run test:coverage\`

## Environment Variables

| Variable | Description | Required |
| -------- | ----------- | -------- |
| \`API_URL\` | Backend base URL | Yes |
| \`DEBUG\` | Enable verbose logging | No |

## Common Tasks

<!-- Add repeatable patterns Claude should follow when asked to do X. -->

### Adding a new feature
1. Create the feature branch
2. Write the implementation in \`src/\`
3. Add tests
4. Update relevant docs

## Things to Avoid

- Do not commit \`.env\` files or secrets
- Do not use \`any\` types in TypeScript without justification
- Do not skip tests for business-logic changes
- [Add project-specific anti-patterns here]
`,
  },

  {
    id: 'agents-md',
    name: 'AGENTS.md',
    filename: 'AGENTS.md',
    category: 'AI / Codex',
    categoryColor: 'blue',
    description: 'Describes the AI agents and tools available in this project for Codex / multi-agent setups.',
    content: `# AGENTS.md

Describes the AI agents, tools, and automation present in this project.

## Overview

<!-- What agents or AI tooling does this project use, and why? -->

## Agents

### [Agent Name]

- **Role**: What this agent is responsible for
- **Trigger**: When / how it is invoked (e.g. on PR open, on schedule, via CLI)
- **Model**: \`claude-sonnet-4-6\` or similar
- **Tools**: List the tools this agent can call
- **Inputs**: What data / context it receives
- **Outputs**: What it produces (PR comment, file, API call, etc.)
- **Notes**: Constraints or special behavior

---

### Example: Code Reviewer

- **Role**: Reviews pull requests for bugs, style, and security issues
- **Trigger**: GitHub Action on \`pull_request\` opened or synchronized
- **Model**: \`claude-opus-4-8\`
- **Tools**: \`read_file\`, \`search_code\`, \`post_pr_comment\`
- **Inputs**: Diff of changed files, PR description
- **Outputs**: Inline review comments on the PR
- **Notes**: Never approves or merges — review only

## Tools Available to Agents

| Tool | Description | Auth |
| ---- | ----------- | ---- |
| \`read_file\` | Read any file in the repo | Repo access |
| \`search_code\` | Grep / semantic search | None |
| \`post_pr_comment\` | Post a GitHub PR comment | GitHub token |
| \`run_tests\` | Execute the test suite | CI environment |

## Shared Prompt Guidelines

<!-- Instructions that apply to all agents in this project. -->

- Always produce concise, actionable output
- Cite specific file paths and line numbers when referencing code
- Never commit or push directly — surface changes for human review
- When uncertain, ask for clarification rather than guess

## Safety Constraints

- Agents must not exfiltrate secrets or environment variables
- Agents must not make production deployments without explicit human approval
- Agents must not send external HTTP requests outside of approved domains

## Data Flow

\`\`\`
User / CI trigger
      │
      ▼
  Orchestrator agent
      │
      ├── Sub-agent: Reviewer
      │       └── Tools: read_file, search_code
      │
      └── Sub-agent: Fixer
              └── Tools: read_file, edit_file, run_tests
\`\`\`
`,
  },

  {
    id: 'skills-md',
    name: 'SKILLS.md',
    filename: 'SKILLS.md',
    category: 'AI / Codex',
    categoryColor: 'blue',
    description: 'Documents custom Claude Code slash commands (skills) available in this project.',
    content: `# SKILLS.md

Custom slash commands available in this project via \`.claude/commands/\`.

Each \`.md\` file in \`.claude/commands/\` becomes a \`/command-name\` slash command inside Claude Code.

## Available Skills

| Command | Description | File |
| ------- | ----------- | ---- |
| \`/review\` | Review the current diff for bugs and style issues | \`.claude/commands/review.md\` |
| \`/test\` | Generate or update tests for the selected code | \`.claude/commands/test.md\` |
| \`/explain\` | Explain what the selected code does | \`.claude/commands/explain.md\` |
| \`/refactor\` | Suggest and apply a refactor to the selection | \`.claude/commands/refactor.md\` |
| \`/changelog\` | Draft a CHANGELOG entry for recent commits | \`.claude/commands/changelog.md\` |

## Usage

\`\`\`
/review                    # Review staged changes
/test src/utils/parse.ts   # Generate tests for a specific file
/explain $SELECTION        # Explain highlighted code
\`\`\`

## Creating a New Skill

1. Create a Markdown file in \`.claude/commands/\`
2. Name it after the slash command: \`deploy.md\` → \`/deploy\`
3. Describe what Claude should do in plain English
4. Use \`$ARGUMENTS\` to refer to text the user types after the command

## Skill Template

\`\`\`markdown
# /command-name

One-line description of what this command does.

## Instructions

1. [First thing Claude should do]
2. [Second thing]
3. [Third thing]

## Parameters

- \`$ARGUMENTS\` — [Describe what the user passes after the command name]

## Example

\`\`\`
/command-name my-input
\`\`\`

Expected output: [Describe what a good response looks like]
\`\`\`

## References

- [Claude Code Skills docs](https://docs.anthropic.com/claude-code)
`,
  },

  {
    id: 'readme',
    name: 'README.md',
    filename: 'README.md',
    category: 'Project',
    categoryColor: 'pink',
    description: 'Standard open-source project README with badges, install, usage, and contributing.',
    content: `# Project Name

> One-line description of what this project does.

![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)

## Overview

<!-- 2–3 sentences explaining the problem this project solves and who it's for. -->

## Features

- ✅ Feature one
- ✅ Feature two
- ✅ Feature three

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

\`\`\`bash
git clone https://github.com/username/project-name.git
cd project-name
npm install
\`\`\`

### Running locally

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

\`\`\`bash
# Example usage
npm run build
npm start
\`\`\`

## Configuration

| Environment Variable | Default | Description |
| -------------------- | ------- | ----------- |
| \`PORT\` | \`3000\` | HTTP server port |
| \`DATABASE_URL\` | — | PostgreSQL connection string |

## Project Structure

\`\`\`
project-name/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── tests/
├── public/
└── README.md
\`\`\`

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create a feature branch: \`git checkout -b feat/my-feature\`
3. Commit your changes: \`git commit -m 'feat: add my feature'\`
4. Push and open a pull request

## License

[MIT](LICENSE) © [Your Name]
`,
  },

  {
    id: 'prd',
    name: 'PRD.md',
    filename: 'PRD.md',
    category: 'Project',
    categoryColor: 'pink',
    description: 'Product Requirements Document — problem, goals, scope, user stories, and success metrics.',
    content: `# Product Requirements Document

**Feature / Product**: [Name]
**Author**: [Your name]
**Status**: Draft · In Review · Approved
**Last Updated**: ${new Date().toISOString().slice(0, 10)}

---

## 1. Problem Statement

<!-- What user pain or business need does this address? Be specific. -->

## 2. Goals

- **Primary goal**: [What outcome are we optimizing for?]
- **Secondary goals**: [Other desirable outcomes]
- **Non-goals**: [What this explicitly does NOT address]

## 3. Background & Context

<!-- Relevant history, prior attempts, research, or data that informs this decision. -->

## 4. User Stories

| As a…        | I want to…                        | So that…                         |
| ------------ | --------------------------------- | -------------------------------- |
| New user     | sign up with my email             | I can access my dashboard        |
| Power user   | use keyboard shortcuts            | I can work faster                |
| Admin        | manage team members               | I can control access             |

## 5. Functional Requirements

### Must Have (P0)
- [ ] Requirement 1
- [ ] Requirement 2

### Should Have (P1)
- [ ] Requirement 3

### Nice to Have (P2)
- [ ] Requirement 4

## 6. Non-Functional Requirements

- **Performance**: Page load under 2 seconds on 4G
- **Availability**: 99.9% uptime SLA
- **Security**: All PII encrypted at rest and in transit
- **Accessibility**: WCAG 2.1 AA compliance

## 7. Design & UX

<!-- Link to Figma, wireframes, or describe the user experience. -->

## 8. Technical Approach

<!-- High-level architecture or implementation strategy. To be filled in with engineering. -->

## 9. Open Questions

| # | Question | Owner | Due |
| - | -------- | ----- | --- |
| 1 | [Question] | [Name] | [Date] |

## 10. Success Metrics

| Metric | Baseline | Target | Measurement |
| ------ | -------- | ------ | ----------- |
| User sign-up rate | 5% | 12% | Analytics |

## 11. Timeline

| Milestone | Date |
| --------- | ---- |
| Spec approved | [Date] |
| Design complete | [Date] |
| Engineering complete | [Date] |
| Launch | [Date] |
`,
  },

  {
    id: 'changelog',
    name: 'CHANGELOG.md',
    filename: 'CHANGELOG.md',
    category: 'Documentation',
    categoryColor: 'yellow',
    description: 'Keep a Changelog format — human-readable version history grouped by release.',
    content: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
-

### Changed
-

### Deprecated
-

### Removed
-

### Fixed
-

### Security
-

---

## [1.0.0] — ${new Date().toISOString().slice(0, 10)}

### Added
- Initial public release
- Core feature set

[Unreleased]: https://github.com/username/project/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/project/releases/tag/v1.0.0
`,
  },

  {
    id: 'contributing',
    name: 'CONTRIBUTING.md',
    filename: 'CONTRIBUTING.md',
    category: 'Documentation',
    categoryColor: 'yellow',
    description: 'Contributor guide — development setup, branch strategy, PR process, and code standards.',
    content: `# Contributing Guide

Thank you for your interest in contributing! This document explains how to get started.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Development Setup

\`\`\`bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/project-name.git
cd project-name

# 2. Install dependencies
npm install

# 3. Create your feature branch
git checkout -b feat/your-feature

# 4. Start the dev server
npm run dev
\`\`\`

## Branch Naming

| Type | Pattern | Example |
| ---- | ------- | ------- |
| Feature | \`feat/<name>\` | \`feat/dark-mode\` |
| Bug fix | \`fix/<name>\` | \`fix/login-crash\` |
| Docs | \`docs/<name>\` | \`docs/api-update\` |
| Refactor | \`refactor/<name>\` | \`refactor/auth-module\` |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
feat: add dark mode toggle
fix: prevent crash on empty input
docs: update installation steps
chore: bump dependency versions
\`\`\`

## Pull Requests

1. Ensure all tests pass: \`npm test\`
2. Ensure linting passes: \`npm run lint\`
3. Fill in the PR template completely
4. Link related issues with \`Closes #123\`
5. Request review from a maintainer

## Testing

- Write tests for all new features and bug fixes
- Test files should live next to source or in \`__tests__/\`
- Run: \`npm test\`
- Coverage: \`npm run test:coverage\` (target: 80%+)

## Code Style

- We use [Prettier](https://prettier.io/) for formatting — run \`npm run format\`
- We use [ESLint](https://eslint.org/) for linting — run \`npm run lint\`
- TypeScript strict mode is enabled — avoid \`any\`

## Reporting Bugs

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshot or error log if applicable

## Requesting Features

Open a GitHub Discussion or Issue labeled \`enhancement\`.
Describe the use case before proposing a solution.
`,
  },

  {
    id: 'adr',
    name: 'ADR.md',
    filename: 'docs/adr/0001-title.md',
    category: 'Documentation',
    categoryColor: 'yellow',
    description: 'Architecture Decision Record — captures a single architectural decision with context and consequences.',
    content: `# ADR-0001: [Short Title of Decision]

**Date**: ${new Date().toISOString().slice(0, 10)}
**Status**: Proposed · Accepted · Deprecated · Superseded by [ADR-XXXX]
**Deciders**: [Names or team]

---

## Context

<!-- What is the issue that is motivating this decision or change?
     Describe the forces at play: technical, political, social, project.
     These forces are probably in tension, and should be described here. -->

## Decision

<!-- What is the change that we're actually proposing or making? -->

We will …

## Considered Alternatives

### Option A — [Name]

**Pros**:
-

**Cons**:
-

### Option B — [Name]

**Pros**:
-

**Cons**:
-

## Consequences

### Positive
-

### Negative
-

### Neutral / Risks
-

## References

- [Link to related issue, RFC, or design doc]
`,
  },
];

// ── Template modal ────────────────────────────────────────────
function openTemplateModal() {
  buildTemplateList();
  tplModal.classList.remove('hidden');
  tplModal.querySelector('.tpl-panel').focus();
}

function closeTemplateModal() {
  tplModal.classList.add('hidden');
}

function buildTemplateList() {
  tplBody.innerHTML = '';
  TEMPLATES.forEach((tpl) => {
    const card = document.createElement('div');
    card.className = 'tpl-card';

    const top = document.createElement('div');
    top.className = 'tpl-card-top';

    const name = document.createElement('span');
    name.className = 'tpl-card-name';
    name.textContent = tpl.name;

    const cat = document.createElement('span');
    cat.className = `tpl-cat tpl-cat--${tpl.categoryColor}`;
    cat.textContent = tpl.category;

    top.appendChild(name);
    top.appendChild(cat);

    const desc = document.createElement('p');
    desc.className   = 'tpl-desc';
    desc.textContent = tpl.description;

    const useBtn = document.createElement('button');
    useBtn.className   = 'tpl-use-btn';
    useBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Use template';
    useBtn.addEventListener('click', () => applyTemplate(tpl));

    card.appendChild(top);
    card.appendChild(desc);
    card.appendChild(useBtn);
    tplBody.appendChild(card);
  });
}

function applyTemplate(tpl) {
  const hasContent = cm.getValue().trim().length > 0;
  if (hasContent && !confirm(`Replace current content with the "${tpl.name}" template?`)) return;
  closeTemplateModal();
  const suggestedName = tpl.filename.includes('/') ? tpl.filename.split('/').pop() : tpl.filename;
  loadText(tpl.content, suggestedName);
  setDirty(true);
}

// Close on backdrop click or Escape
document.getElementById('tpl-backdrop').addEventListener('click', closeTemplateModal);
document.getElementById('tpl-close').addEventListener('click', closeTemplateModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !tplModal.classList.contains('hidden')) closeTemplateModal();
});

// ── Init ──────────────────────────────────────────────────────
updateSaveButtons();
setFilename('Untitled.md');

const savedContent = localStorage.getItem(AUTOSAVE_KEY);
if (savedContent && savedContent.trim()) {
  const savedName = localStorage.getItem(AUTOSAVE_NAME_KEY) || 'Untitled.md';
  if (confirm(`Restore autosaved "${savedName}"?`)) {
    cm.setValue(savedContent);
    setFilename(savedName);
    setDirty(true);
    renderPreview();
  } else {
    renderPreview();
  }
} else {
  renderPreview();
}
