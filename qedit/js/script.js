(function () {
  const monacoVersion = "0.52.2";
  const monacoBaseUrl = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${monacoVersion}/min`;
  const fileInput = document.getElementById("fileInput");
  const dropzone = document.getElementById("dropzone");
  const saveBtn = document.getElementById("saveBtn");
  const copyBtn = document.getElementById("copyBtn");
  const fileMeta = document.getElementById("fileMeta");
  const editorWrap = document.getElementById("editorWrap");

  let editor = null;
  let monacoReady = null;
  let currentName = "untitled.txt";
  copyBtn.disabled = true;

  function loadMonaco() {
    if (window.monaco && window.monaco.editor) {
      return Promise.resolve(window.monaco);
    }
    if (monacoReady) return monacoReady;
    monacoReady = new Promise((resolve, reject) => {
      window.MonacoEnvironment = {
        getWorkerUrl() {
          const workerSource =
            `self.MonacoEnvironment={baseUrl:'${monacoBaseUrl}/'};` +
            `importScripts('${monacoBaseUrl}/vs/base/worker/workerMain.min.js');`;
          return `data:text/javascript;charset=utf-8,${encodeURIComponent(workerSource)}`;
        },
      };
      if (!window.require) {
        reject(new Error("Monaco loader is unavailable."));
        return;
      }
      window.require.config({ paths: { vs: `${monacoBaseUrl}/vs` } });
      window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
    });
    return monacoReady;
  }

  async function ensureEditor() {
    if (editor) return editor;
    const monaco = await loadMonaco();
    editor = monaco.editor.create(document.getElementById("editor"), {
      value: "",
      language: "plaintext",
      theme: "vs-dark",
      fontSize: 18,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });
    return editor;
  }

  function setModeFromFilename(name) {
    if (!editor || !window.monaco) return;
    const ext = (name.split(".").pop() || "").toLowerCase();
    const map = {
      pl: "perl",
      pm: "perl",
      js: "javascript",
      mjs: "javascript",
      cjs: "javascript",
      ts: "typescript",
      tsx: "typescript",
      jsx: "javascript",
      html: "html",
      htm: "html",
      css: "css",
      json: "json",
      md: "markdown",
      markdown: "markdown",
      txt: "plaintext",
      py: "python",
      rb: "ruby",
      java: "java",
      c: "c",
      h: "cpp",
      cpp: "cpp",
      hpp: "cpp",
      go: "go",
      rs: "rust",
      php: "php",
      sh: "shell",
      yaml: "yaml",
      yml: "yaml",
      xml: "xml",
    };
    const language = map[ext] || "plaintext";
    const model = editor.getModel();
    if (model) {
      window.monaco.editor.setModelLanguage(model, language);
    }
  }

  function showEditor() {
    editorWrap.setAttribute("aria-hidden", "false");
    editorWrap.classList.add("is-visible");
    dropzone.classList.add("is-hidden");
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Failed to read file."));
      reader.readAsText(file, "utf-8");
    });
  }

  async function openFile(file) {
    if (!file) return;
    try {
      const text = await readFile(file);
      const ed = await ensureEditor();
      ed.setValue(text);
      currentName = file.name || "untitled.txt";
      setModeFromFilename(currentName);
      fileMeta.textContent = `${currentName} (${file.size || 0} bytes)`;
      copyBtn.disabled = false;
      showEditor();
    } catch (e) {
      fileMeta.textContent = "Could not read file.";
    }
  }

  async function saveAs() {
    const ed = await ensureEditor();
    const blob = new Blob([ed.getValue()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentName || "untitled.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    openFile(file);
  });

  ["dragenter", "dragover", "dragleave", "drop"].forEach((evtName) => {
    dropzone.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  dropzone.addEventListener("dragover", () => dropzone.classList.add("is-over"));
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-over"));
  dropzone.addEventListener("drop", (e) => {
    dropzone.classList.remove("is-over");
    const dt = e.dataTransfer;
    const file = dt && dt.files && dt.files[0];
    openFile(file);
  });

  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") fileInput.click();
  });

  saveBtn.addEventListener("click", () => {
    saveAs();
  });
  copyBtn.addEventListener("click", async () => {
    const ed = await ensureEditor();
    const text = ed.getValue();
    let ok = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    copyBtn.textContent = ok ? "Copied!" : "Copy failed";
    setTimeout(() => {
      copyBtn.textContent = "Copy Text";
    }, 1200);
  });
})();
