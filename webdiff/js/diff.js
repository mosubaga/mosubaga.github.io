(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Diff Algorithm
  // ---------------------------------------------------------------------------

  function tokenize(text, mode) {
    if (mode === 'char') {
      return [...text]; // spread handles multi-byte Unicode
    }
    if (mode === 'word') {
      // Alternating non-whitespace / whitespace keeps all characters
      const tokens = [];
      const re = /\S+|\s+/g;
      let m;
      while ((m = re.exec(text)) !== null) tokens.push(m[0]);
      return tokens;
    }
    // line
    return text.split('\n');
  }

  // LCS-based diff.  Returns null when the token product exceeds the limit.
  function lcs(a, b) {
    const m = a.length, n = b.length;
    if (m * n > 4_000_000) return null;

    // Build table using flat typed array for speed
    const row = new Uint32Array((m + 1) * (n + 1));
    const W = n + 1;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          row[i * W + j] = row[(i - 1) * W + (j - 1)] + 1;
        } else {
          const above = row[(i - 1) * W + j];
          const left  = row[i * W + (j - 1)];
          row[i * W + j] = above > left ? above : left;
        }
      }
    }

    // Backtrack
    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        result.push({ type: 'equal', value: a[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || row[i * W + (j - 1)] >= row[(i - 1) * W + j])) {
        result.push({ type: 'insert', value: b[j - 1] });
        j--;
      } else {
        result.push({ type: 'delete', value: a[i - 1] });
        i--;
      }
    }
    result.reverse();
    return result;
  }

  function diffTexts(original, modified, mode) {
    const oldTok = tokenize(original, mode);
    const newTok = tokenize(modified, mode);
    const diff = lcs(oldTok, newTok);
    if (diff) return { diff, truncated: false };

    // Fallback for very large inputs: naive all-delete / all-insert
    return {
      diff: [
        ...oldTok.map(v => ({ type: 'delete', value: v })),
        ...newTok.map(v => ({ type: 'insert', value: v })),
      ],
      truncated: true,
    };
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderInlineDiff(diff, mode) {
    let html = '';
    for (let i = 0; i < diff.length; i++) {
      const { type, value } = diff[i];
      const isLast = i === diff.length - 1;
      let text = escHtml(value);
      if (mode === 'line' && !isLast) text += '\n';

      if (type === 'equal') {
        html += text;
      } else if (type === 'insert') {
        html += `<ins class="diff-add">${text}</ins>`;
      } else {
        html += `<del class="diff-del">${text}</del>`;
      }
    }
    return html;
  }

  function getStats(diff) {
    let added = 0, deleted = 0, unchanged = 0;
    for (const { type } of diff) {
      if (type === 'insert')    added++;
      else if (type === 'delete') deleted++;
      else                       unchanged++;
    }
    return { added, deleted, unchanged };
  }

  // ---------------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------------

  const $ = id => document.getElementById(id);

  const originalTA  = $('originalText');
  const modifiedTA  = $('modifiedText');
  const compareBtn  = $('compareBtn');
  const swapBtn     = $('swapBtn');
  const clearAllBtn = $('clearAllBtn');
  const diffResult  = $('diffResult');
  const statsBar    = $('statsBar');
  const diffOutput  = $('diffOutput');

  let currentMode = 'line';

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      if (!diffResult.classList.contains('hidden')) runDiff();
    });
  });

  // Panel clear buttons
  document.querySelectorAll('.panel-clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.target === 'original') originalTA.value = '';
      else modifiedTA.value = '';
      scheduleRealTime();
    });
  });

  compareBtn.addEventListener('click', runDiff);

  swapBtn.addEventListener('click', () => {
    [originalTA.value, modifiedTA.value] = [modifiedTA.value, originalTA.value];
    if (!diffResult.classList.contains('hidden')) runDiff();
  });

  clearAllBtn.addEventListener('click', () => {
    originalTA.value = '';
    modifiedTA.value = '';
    diffResult.classList.add('hidden');
  });

  // Real-time diff (debounced)
  let debounceTimer = null;
  function scheduleRealTime() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (originalTA.value || modifiedTA.value) runDiff();
      else diffResult.classList.add('hidden');
    }, 400);
  }
  originalTA.addEventListener('input', scheduleRealTime);
  modifiedTA.addEventListener('input', scheduleRealTime);

  // ---------------------------------------------------------------------------
  // Main diff runner
  // ---------------------------------------------------------------------------

  function runDiff() {
    const orig = originalTA.value;
    const mod  = modifiedTA.value;

    if (!orig && !mod) {
      diffResult.classList.add('hidden');
      return;
    }

    const { diff, truncated } = diffTexts(orig, mod, currentMode);
    const stats = getStats(diff);
    const unit = { line: 'line', word: 'word', char: 'character' }[currentMode];
    const pl = n => n !== 1 ? 's' : '';

    statsBar.innerHTML = `
      <div class="stat stat-add">+${stats.added} ${unit}${pl(stats.added)} added</div>
      <div class="stat stat-del">&#8722;${stats.deleted} ${unit}${pl(stats.deleted)} removed</div>
      <div class="stat stat-eq">${stats.unchanged} ${unit}${pl(stats.unchanged)} unchanged</div>
      ${truncated ? '<div class="stat stat-warn">Input too large — showing naive diff</div>' : ''}
    `;

    diffOutput.innerHTML = `<pre class="diff-pre">${renderInlineDiff(diff, currentMode)}</pre>`;
    diffResult.classList.remove('hidden');
  }

  // ---------------------------------------------------------------------------
  // Drag & Drop
  // ---------------------------------------------------------------------------

  function setupDropZone(dropId, textarea) {
    const zone = $(dropId);

    zone.addEventListener('dragenter', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragover', e => { e.preventDefault(); });
    zone.addEventListener('dragleave', e => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        textarea.value = ev.target.result;
        scheduleRealTime();
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  setupDropZone('originalDrop', originalTA);
  setupDropZone('modifiedDrop', modifiedTA);

})();
