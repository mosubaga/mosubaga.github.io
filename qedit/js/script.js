(function () {
  const fileInput = document.getElementById("fileInput");
  const dropzone = document.getElementById("dropzone");
  const saveBtn = document.getElementById("saveBtn");
  const copyBtn = document.getElementById("copyBtn");
  const fileMeta = document.getElementById("fileMeta");
  const editorWrap = document.getElementById("editorWrap");

  let editor = null;
  let currentName = "untitled.txt";
  copyBtn.disabled = true;

  function ensureEditor() {
    if (editor) return editor;
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/text");
    editor.setFontSize("18px");
    return editor;
  }

  function setModeFromFilename(name) {
    const ext = (name.split(".").pop() || "").toLowerCase();
    const map = {
      pl : "perl",
      pm : "perl",
      js: "javascript",
      mjs: "javascript",
      cjs: "javascript",
      ts: "typescript",
      tsx: "tsx",
      jsx: "jsx",
      html: "html",
      htm: "html",
      css: "css",
      json: "javascript",
      md: "markdown",
      markdown: "markdown",
      txt: "text",
      py: "python",
      rb: "ruby",
      java: "java",
      c: "c_cpp",
      h: "c_cpp",
      cpp: "c_cpp",
      hpp: "c_cpp",
      go: "golang",
      rs: "rust",
      php: "php",
      sh: "sh",
      yaml: "yaml",
      yml: "yaml",
      xml: "xml",
    };
    const mode = map[ext] || "text";
    editor.session.setMode(`ace/mode/${mode}`);
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
      const ed = ensureEditor();
      ed.setValue(text, -1);
      currentName = file.name || "untitled.txt";
      setModeFromFilename(currentName);
        fileMeta.textContent = `${currentName} (${file.size || 0} bytes)`;
        copyBtn.disabled = false;
      showEditor();
    } catch (e) {
      fileMeta.textContent = "Could not read file.";
    }
  }

  function saveAs() {
    const ed = ensureEditor();
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

  saveBtn.addEventListener("click", saveAs);
  copyBtn.addEventListener("click", async () => {
    const ed = ensureEditor();
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
