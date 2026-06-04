(function () {
  const MONACO_VER  = "0.52.2";
  const MONACO_BASE = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${MONACO_VER}/min`;

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const fileInput    = document.getElementById("fileInput");
  const openBtn      = document.getElementById("openBtn");
  const newFileBtn   = document.getElementById("newFileBtn");
  const saveBtn      = document.getElementById("saveBtn");
  const copyBtn      = document.getElementById("copyBtn");
  const clearBtn     = document.getElementById("clearBtn");
  const fileMeta     = document.getElementById("fileMeta");
  const langMeta     = document.getElementById("langMeta");
  const tabBarEl     = document.getElementById("tabBar");
  const explorerTree = document.getElementById("explorerTree");
  const dropOverlay  = document.getElementById("dropOverlay");
  const wispField    = document.getElementById("wispField");

  // ── State ─────────────────────────────────────────────────────────────────
  let tabs        = [];   // { id, name, model, language, size, modified }
  let activeTabId = null;
  let tabCounter  = 0;
  let editor      = null;
  let monacoReady = null;

  // ── Monaco loader ─────────────────────────────────────────────────────────
  function loadMonaco() {
    if (window.monaco) return Promise.resolve(window.monaco);
    if (monacoReady) return monacoReady;
    monacoReady = new Promise((resolve, reject) => {
      window.MonacoEnvironment = {
        getWorkerUrl() {
          const src =
            `self.MonacoEnvironment={baseUrl:'${MONACO_BASE}/'};` +
            `importScripts('${MONACO_BASE}/vs/base/worker/workerMain.min.js');`;
          return `data:text/javascript;charset=utf-8,${encodeURIComponent(src)}`;
        },
      };
      if (!window.require) { reject(new Error("Monaco loader unavailable.")); return; }
      window.require.config({ paths: { vs: `${MONACO_BASE}/vs` } });
      window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
    });
    return monacoReady;
  }

  async function ensureEditor() {
    await loadMonaco();
    if (editor) return editor;
    editor = window.monaco.editor.create(document.getElementById("editor"), {
      model: null,
      theme: "vs",
      fontSize: 17,
      fontFamily: "'Cascadia Code','JetBrains Mono','Fira Code',Menlo,monospace",
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
      lineNumbersMinChars: 3,
      renderLineHighlight: "gutter",
      smoothScrolling: true,
      cursorSmoothCaretAnimation: "on",
    });
    return editor;
  }

  // ── Language helpers ──────────────────────────────────────────────────────
  const EXT_MAP = {
    pl:"perl",pm:"perl",
    js:"javascript",mjs:"javascript",cjs:"javascript",
    ts:"typescript",tsx:"typescript",jsx:"javascript",
    html:"html",htm:"html",css:"css",json:"json",
    md:"markdown",markdown:"markdown",txt:"plaintext",
    py:"python",rb:"ruby",java:"java",
    c:"c",h:"cpp",cpp:"cpp",hpp:"cpp",
    go:"go",rs:"rust",php:"php",sh:"shell",bash:"shell",
    yaml:"yaml",yml:"yaml",xml:"xml",sql:"sql",
    swift:"swift",kt:"kotlin",r:"r",
  };

  const LANG_LABELS = {
    javascript:"JavaScript",typescript:"TypeScript",python:"Python",
    ruby:"Ruby",java:"Java",cpp:"C++",c:"C",go:"Go",rust:"Rust",
    php:"PHP",shell:"Shell",perl:"Perl",html:"HTML",css:"CSS",
    json:"JSON",markdown:"Markdown",yaml:"YAML",xml:"XML",sql:"SQL",
    swift:"Swift",kotlin:"Kotlin",r:"R",plaintext:"Plain Text",
  };

  function langFromName(name) {
    const ext = (name.split(".").pop() || "").toLowerCase();
    return EXT_MAP[ext] || "plaintext";
  }

  function formatSize(bytes) {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ── Untitled name ─────────────────────────────────────────────────────────
  function nextUntitledName() {
    let n = 1;
    while (tabs.some(t => t.name === `untitled-${n}.txt`)) n++;
    return `untitled-${n}.txt`;
  }

  // ── Tab management ────────────────────────────────────────────────────────
  function createTab(name, text, language, size) {
    const id    = ++tabCounter;
    const uri   = window.monaco.Uri.parse(`inmemory://model/${id}`);
    const model = window.monaco.editor.createModel(text, language, uri);
    const tab   = { id, name, model, language, size: size || 0, modified: false };

    model.onDidChangeContent(() => {
      if (!tab.modified) {
        tab.modified = true;
        renderTabs();
      }
    });

    tabs.push(tab);
    return tab;
  }

  function getActiveTab() {
    return tabs.find(t => t.id === activeTabId) || null;
  }

  function renderTabs() {
    if (tabs.length === 0) {
      tabBarEl.innerHTML = "";
      setButtonStates(false);
      return;
    }
    setButtonStates(true);

    tabBarEl.innerHTML = tabs.map(tab => `
      <div class="tab${tab.id === activeTabId ? " active" : ""}" data-id="${tab.id}">
        <span class="tab-name" title="${esc(tab.name)}">${esc(tab.name)}</span>
        ${tab.modified ? '<span class="tab-dot" title="Unsaved changes">●</span>' : ""}
        <span class="tab-close" data-close="${tab.id}" title="Close tab">×</span>
      </div>`).join("");

    tabBarEl.querySelectorAll(".tab").forEach(el => {
      el.addEventListener("click", e => {
        if (e.target.closest(".tab-close")) return;
        switchToTab(Number(el.dataset.id));
      });
    });

    tabBarEl.querySelectorAll(".tab-close").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        closeTab(Number(el.dataset.close));
      });
    });
  }

  function switchToTab(id) {
    const tab = tabs.find(t => t.id === id);
    if (!tab || !editor) return;
    activeTabId = id;
    editor.setModel(tab.model);
    editor.focus();
    renderTabs();
    refreshSidebar(tab);
  }

  async function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    const tab = tabs[idx];

    if (tab.modified) {
      const wantSave = window.confirm(
        `"${tab.name}" has unsaved changes.\nSave before closing?`
      );
      if (wantSave) await saveTabAs(tab);
    }

    tab.model.dispose();
    tabs.splice(idx, 1);

    if (activeTabId === id) {
      if (tabs.length > 0) {
        switchToTab(tabs[Math.min(idx, tabs.length - 1)].id);
      } else {
        activeTabId = null;
        if (editor) editor.setModel(null);
        resetSidebar();
        renderTabs();
      }
    } else {
      renderTabs();
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function saveTabAs(tab) {
    if (!tab) return;
    const blob = new Blob([tab.model.getValue()], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = tab.name;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    tab.modified = false;
    renderTabs();
  }

  // ── Sidebar / status bar ──────────────────────────────────────────────────
  function refreshSidebar(tab) {
    const label   = LANG_LABELS[tab.language] || tab.language;
    const sizeStr = formatSize(tab.size);
    fileMeta.textContent = `${tab.name}  ·  ${sizeStr}`;
    langMeta.textContent = label;
    explorerTree.innerHTML = `
      <div class="explorer-item">
        <div class="explorer-file active">📄 ${esc(tab.name)}</div>
      </div>
      <div class="explorer-meta">
        <div>Size: ${sizeStr}</div>
        <div>Language: ${label}</div>
      </div>`;
  }

  function resetSidebar() {
    fileMeta.textContent = "No file open — drag a file anywhere or click Open ✦";
    langMeta.textContent = "";
    explorerTree.innerHTML =
      `<div class="explorer-empty">Open or drop<br>a file to begin ✦</div>`;
  }

  function setButtonStates(hasTab) {
    copyBtn.disabled  = !hasTab;
    clearBtn.disabled = !hasTab;
  }

  // ── File I/O ──────────────────────────────────────────────────────────────
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Failed to read file."));
      reader.readAsText(file, "utf-8");
    });
  }

  async function openFile(file) {
    if (!file) return;
    try {
      const text = await readFile(file);
      await ensureEditor();
      const lang = langFromName(file.name);
      const tab  = createTab(file.name, text, lang, file.size);
      switchToTab(tab.id);
    } catch {
      fileMeta.textContent = "⚠ Could not read file.";
    }
  }

  async function newFile() {
    await ensureEditor();
    const tab = createTab(nextUntitledName(), "", "plaintext", 0);
    switchToTab(tab.id);
    editor.focus();
  }

  // ── Button events ─────────────────────────────────────────────────────────
  openBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (f) openFile(f);
    fileInput.value = "";
  });

  newFileBtn.addEventListener("click", newFile);

  saveBtn.addEventListener("click", () => saveTabAs(getActiveTab()));

  clearBtn.addEventListener("click", () => {
    if (!editor || !getActiveTab()) return;
    if (!window.confirm("Clear all text in this tab?")) return;
    editor.setValue("");
    editor.focus();
  });

  copyBtn.addEventListener("click", async () => {
    if (!editor) return;
    const text = editor.getValue();
    let ok = false;
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); ok = true; } catch { ok = false; }
    }
    if (!ok) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;opacity:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      document.body.removeChild(ta);
    }
    copyBtn.textContent = ok ? "✓ Copied!" : "✕ Failed";
    setTimeout(() => { copyBtn.textContent = "📋 Copy"; }, 1400);
  });

  // ── Full-page drag & drop ─────────────────────────────────────────────────
  let dragDepth = 0;

  document.addEventListener("dragenter", e => {
    e.preventDefault();
    if (++dragDepth === 1) dropOverlay.style.display = "grid";
  });
  document.addEventListener("dragleave", e => {
    e.preventDefault();
    if (--dragDepth <= 0) { dragDepth = 0; dropOverlay.style.display = "none"; }
  });
  document.addEventListener("dragover",  e => e.preventDefault());
  document.addEventListener("drop", e => {
    e.preventDefault();
    dragDepth = 0;
    dropOverlay.style.display = "none";
    const f = e.dataTransfer?.files?.[0];
    if (f) openFile(f);
  });

  // ── Unsaved-changes guard on page close ───────────────────────────────────
  window.addEventListener("beforeunload", e => {
    if (tabs.some(t => t.modified)) { e.preventDefault(); e.returnValue = ""; }
  });

  // ── Floating wisps ────────────────────────────────────────────────────────
  (function spawnWisps() {
    const colors = [
      "rgba(247,197,216,0.75)", "rgba(212,186,240,0.70)",
      "rgba(184,216,248,0.75)", "rgba(236,160,191,0.65)",
      "rgba(150,196,240,0.65)",
    ];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("div");
      el.className = "ff-wisp";
      const sz = 5 + Math.random() * 13;
      el.style.cssText = [
        `width:${sz}px`, `height:${sz}px`,
        `left:${Math.random() * 100}%`,
        `background:${colors[Math.floor(Math.random() * colors.length)]}`,
        `animation-duration:${14 + Math.random() * 22}s`,
        `animation-delay:${-(Math.random() * 28)}s`,
        `--wisp-drift:${(Math.random() - 0.5) * 130}px`,
      ].join(";");
      wispField.appendChild(el);
    }
  })();

  // Pre-warm Monaco
  ensureEditor();
})();
