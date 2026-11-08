// Command & Slash Command Matrix: render rows, then filter by category + search.
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('cmd-tbody');
  const searchInput = document.getElementById('cmd-search');
  const filterBtns = Array.from(document.querySelectorAll('[data-filter]'));
  const emptyEl = document.getElementById('cmd-empty');
  if (!tbody) return;

  const categoryLabels = {
    slash: 'Slash Command',
    keyboard: 'Keyboard Shortcut',
    input: 'Input Shortcut',
    flag: 'CLI Flag'
  };
  const categoryBadge = {
    slash: 'badge-lavender',
    keyboard: 'badge-pink',
    input: 'badge-ice',
    flag: 'badge-lavender'
  };
  const categoryIcon = {
    slash: 'fa-slash',
    keyboard: 'fa-keyboard',
    input: 'fa-at',
    flag: 'fa-sliders'
  };

  const rows = [
    { cat: 'slash', name: '/init', desc: 'Analyzes the repo and generates a starting CLAUDE.md with conventions and commands.' },
    { cat: 'slash', name: '/help', desc: 'Lists available commands and basic usage.' },
    { cat: 'slash', name: '/clear', desc: 'Clears the conversation and starts a fresh context window.' },
    { cat: 'slash', name: '/compact', desc: 'Summarizes the current conversation to free up context space without losing key decisions.' },
    { cat: 'slash', name: '/cost', desc: 'Shows token usage and estimated cost for the current session.' },
    { cat: 'slash', name: '/doctor', desc: 'Diagnoses installation and configuration issues with Claude Code itself.' },
    { cat: 'slash', name: '/memory', desc: 'Opens CLAUDE.md files for direct editing so you can update persistent project context.' },
    { cat: 'slash', name: '/model', desc: 'Switches the active model for the session.' },
    { cat: 'slash', name: '/permissions', desc: 'Views or edits which tools and actions are auto-approved for this session.' },
    { cat: 'slash', name: '/review', desc: 'Reviews the current diff or a given PR for bugs and cleanup opportunities.' },
    { cat: 'slash', name: '/resume', desc: 'Resumes a previous conversation/session.' },
    { cat: 'slash', name: '/agents', desc: 'Lists or configures specialized subagents available in this project.' },
    { cat: 'slash', name: '/mcp', desc: 'Manages connected MCP servers — view status, authenticate, or reconnect.' },
    { cat: 'slash', name: '/config', desc: 'Opens interactive settings for theme, model defaults, and behavior.' },
    { cat: 'slash', name: '/bug', desc: 'Reports an issue with Claude Code directly to Anthropic.' },
    { cat: 'slash', name: '/vim', desc: 'Toggles Vim-style key bindings in the input prompt.' },

    { cat: 'keyboard', name: 'Ctrl + C', desc: 'Cancels the current generation or running tool call.' },
    { cat: 'keyboard', name: 'Ctrl + D', desc: 'Exits the Claude Code session.' },
    { cat: 'keyboard', name: 'Ctrl + L', desc: 'Clears the terminal screen (keeps conversation history).' },
    { cat: 'keyboard', name: 'Ctrl + R', desc: 'Searches backwards through input history.' },
    { cat: 'keyboard', name: '↑ / ↓', desc: 'Cycles through previous prompts you\'ve sent.' },
    { cat: 'keyboard', name: 'Esc', desc: 'Interrupts the current response.' },
    { cat: 'keyboard', name: 'Esc Esc', desc: 'Edits a previous message and rewinds the conversation to that point.' },
    { cat: 'keyboard', name: 'Shift + Tab', desc: 'Cycles input modes — e.g. toggling auto-accept edits or plan mode.' },

    { cat: 'input', name: '@file', desc: 'References a specific file by path so Claude Code reads it as context.' },
    { cat: 'input', name: '!', desc: 'Prefix to run a one-off shell command directly (bash mode) without leaving the session.' },
    { cat: 'input', name: '#', desc: 'Prefix to append a note straight into project memory (CLAUDE.md).' },
    { cat: 'input', name: '/', desc: 'Prefix that triggers the slash command menu.' },

    { cat: 'flag', name: '--print, -p', desc: 'Runs one prompt non-interactively and prints the result — useful for scripts and CI.' },
    { cat: 'flag', name: '--continue, -c', desc: 'Continues the most recent conversation in this directory.' },
    { cat: 'flag', name: '--resume, -r', desc: 'Resumes a specific past session by ID.' },
    { cat: 'flag', name: '--model', desc: 'Sets which model to use for the session.' },
    { cat: 'flag', name: '--permission-mode', desc: 'Sets the default permission mode (e.g. plan, acceptEdits) at launch.' },
    { cat: 'flag', name: '--add-dir', desc: 'Grants access to an additional directory outside the current working directory.' },
    { cat: 'flag', name: '--mcp-config', desc: 'Loads MCP server definitions from a config file at startup.' },
    { cat: 'flag', name: '--output-format', desc: 'Controls output format (text, json, stream-json) for scripted/non-interactive use.' },
    { cat: 'flag', name: '--verbose', desc: 'Prints additional debug detail about tool calls and turns.' },
    { cat: 'flag', name: '--dangerously-skip-permissions', desc: 'Skips permission prompts entirely — use only in fully sandboxed environments.' }
  ];

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  tbody.innerHTML = rows.map((r) => `
    <tr data-cat="${r.cat}" data-search="${escapeHtml((r.name + ' ' + r.desc).toLowerCase())}">
      <td><code class="inline-code">${escapeHtml(r.name)}</code></td>
      <td><span class="badge ${categoryBadge[r.cat]}"><i class="fa-solid ${categoryIcon[r.cat]}" aria-hidden="true"></i>${categoryLabels[r.cat]}</span></td>
      <td>${escapeHtml(r.desc)}</td>
    </tr>
  `).join('');

  const trs = Array.from(tbody.querySelectorAll('tr'));
  let activeFilter = 'all';

  function applyFilters() {
    const query = (searchInput.value || '').trim().toLowerCase();
    let visibleCount = 0;

    trs.forEach((tr) => {
      const matchesCat = activeFilter === 'all' || tr.dataset.cat === activeFilter;
      const matchesSearch = !query || tr.dataset.search.includes(query);
      const show = matchesCat && matchesSearch;
      tr.classList.toggle('cmd-row-hidden', !show);
      if (show) visibleCount++;
    });

    emptyEl.classList.toggle('show', visibleCount === 0);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  applyFilters();
});
