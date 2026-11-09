// ---------- Lightweight syntax highlighter ----------
// No external library — a small line/token-based tokenizer per language,
// wrapping matches in <span class="tok-*"> styled in style.css.
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const TOKEN_RULES = {
  python: [
    { name: 'com', pattern: '#.*' },
    { name: 'str', pattern: '"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
    { name: 'num', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { name: 'kw', pattern: '\\b(?:def|class|import|from|return|if|elif|else|raise|try|except|finally|with|as|async|await|True|False|None|and|or|not|in|is|lambda|yield|global|nonlocal|pass|break|continue|for|while|assert)\\b' },
  ],
  js: [
    { name: 'com', pattern: '//.*' },
    { name: 'str', pattern: '`(?:\\\\.|[^`\\\\])*`|"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
    { name: 'num', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { name: 'kw', pattern: '\\b(?:const|let|var|function|return|if|else|async|await|import|from|export|default|class|new|typeof|instanceof|true|false|null|undefined|test|expect)\\b' },
  ],
  yaml: [
    { name: 'com', pattern: '#.*' },
    { name: 'str', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
    { name: 'num', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
    { name: 'kw', pattern: '\\btrue\\b|\\bfalse\\b' },
  ],
  bash: [
    { name: 'com', pattern: '#.*' },
    { name: 'str', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
    { name: 'fn', pattern: '\\$\\{[^}]+\\}|\\$[A-Za-z_][A-Za-z0-9_]*|(?:^|\\s)--?[A-Za-z][\\w-]*' },
  ],
  tree: [
    { name: 'com', pattern: '#.*' },
  ],
};

function tokenizeLine(line, rules) {
  const master = new RegExp(rules.map((r) => `(?<${r.name}>${r.pattern})`).join('|'), 'g');
  let out = '';
  let last = 0;
  let m;
  while ((m = master.exec(line))) {
    if (m.index > last) out += escapeHtml(line.slice(last, m.index));
    const type = Object.keys(m.groups).find((k) => m.groups[k] !== undefined);
    out += `<span class="tok-${type}">${escapeHtml(m[0])}</span>`;
    last = master.lastIndex;
    if (m[0].length === 0) master.lastIndex += 1;
  }
  out += escapeHtml(line.slice(last));
  return out;
}

function highlightYamlLine(line) {
  const keyMatch = line.match(/^(\s*(?:-\s*)?)([\w./-]+)(:)(?=\s|$)/);
  if (!keyMatch) return tokenizeLine(line, TOKEN_RULES.yaml);
  const [full, indent, key, colon] = keyMatch;
  const rest = tokenizeLine(line.slice(full.length), TOKEN_RULES.yaml);
  return `${escapeHtml(indent)}<span class="tok-tag">${escapeHtml(key)}</span>${escapeHtml(colon)}${rest}`;
}

function inlineMarkdown(text) {
  return escapeHtml(text).replace(/`([^`]+)`/g, '<span class="tok-str">`$1`</span>');
}

function highlightMarkdownLine(line) {
  if (/^-{3,}\s*$/.test(line)) return `<span class="tok-com">${escapeHtml(line)}</span>`;
  if (/^#{1,6}\s/.test(line)) return `<span class="tok-tag">${escapeHtml(line)}</span>`;
  let m = line.match(/^(\s*)([-*])(\s)(.*)$/);
  if (m) return `${escapeHtml(m[1])}<span class="tok-bul">${escapeHtml(m[2])}</span>${escapeHtml(m[3])}${inlineMarkdown(m[4])}`;
  m = line.match(/^(\s*)(\d+\.)(\s)(.*)$/);
  if (m) return `${escapeHtml(m[1])}<span class="tok-bul">${escapeHtml(m[2])}</span>${escapeHtml(m[3])}${inlineMarkdown(m[4])}`;
  m = line.match(/^([\w-]+)(:)(\s*)(.*)$/);
  if (m) return `<span class="tok-tag">${escapeHtml(m[1])}</span>${escapeHtml(m[2])}${escapeHtml(m[3])}${inlineMarkdown(m[4])}`;
  return inlineMarkdown(line);
}

function highlightCodeBlocks() {
  document.querySelectorAll('pre[data-lang]').forEach((pre) => {
    const lang = pre.getAttribute('data-lang');
    if (lang === 'text' || pre.dataset.highlighted) return;
    const lines = pre.textContent.split('\n');
    let html;
    if (lang === 'markdown') {
      html = lines.map(highlightMarkdownLine).join('\n');
    } else if (lang === 'yaml') {
      html = lines.map(highlightYamlLine).join('\n');
    } else if (TOKEN_RULES[lang]) {
      html = lines.map((line) => tokenizeLine(line, TOKEN_RULES[lang])).join('\n');
    } else {
      return;
    }
    pre.innerHTML = html;
    pre.dataset.highlighted = 'true';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  highlightCodeBlocks();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    const icon = toggle.querySelector('i');
    const setIcon = (isOpen) => {
      if (!icon) return;
      icon.classList.toggle('fa-bars', !isOpen);
      icon.classList.toggle('fa-xmark', isOpen);
    };
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      setIcon(isOpen);
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        setIcon(false);
      });
    });
  }

  // Footer year
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Accessible tabs: each tablist controls only its adjacent panels.
  document.querySelectorAll('.tabs').forEach((tabGroup) => {
    const buttons = Array.from(tabGroup.querySelectorAll('.tab-btn'));
    const panels = [];
    let sibling = tabGroup.nextElementSibling;
    while (sibling && sibling.classList.contains('tab-panel')) {
      panels.push(sibling);
      sibling = sibling.nextElementSibling;
    }

    const activate = (button, focus = false) => {
      buttons.forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        const selected = panel.id === button.dataset.tab;
        panel.classList.toggle('active', selected);
        panel.hidden = !selected;
      });
      if (focus) button.focus();
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button));
      button.addEventListener('keydown', (event) => {
        let next;
        switch (event.key) {
          case 'ArrowRight': next = (index + 1) % buttons.length; break;
          case 'ArrowLeft': next = (index - 1 + buttons.length) % buttons.length; break;
          case 'Home': next = 0; break;
          case 'End': next = buttons.length - 1; break;
          default: return;
        }
        event.preventDefault();
        activate(buttons[next], true);
      });
    });
  });

  // Copy-to-clipboard buttons
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const block = btn.closest('.code-block');
      const codeEl = block ? block.querySelector('pre') : null;
      if (!codeEl) return;
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        const original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1500);
      } catch (err) {
        btn.textContent = 'Press ⌘/Ctrl+C';
      }
    });
  });

  // Scrollspy: highlight the nav link for the section in view
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav a');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const linkFor = (id) => Array.from(navLinks).find((a) => a.getAttribute('href') === `#${id}`);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove('active'));
          const link = linkFor(entry.target.id);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
  }

  // Back-to-top visibility
  const backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
  }
});
