"use strict";

  const HIGHLIGHT_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js";

  const editor = document.getElementById("editor");
  const fileInput = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");
  const dropOverlay = document.getElementById("dropOverlay");
  const statusMsg = document.getElementById("statusMsg");
  const charCount = document.getElementById("charCount");
  const badge = document.getElementById("fileTypeBadge");

  let currentFileName = "formatted";
  let currentFileType = null; // "json" | "html" | null

  function setStatus(text, type = "") {
    statusMsg.textContent = text;
    statusMsg.className = "status-msg" + (type ? " " + type : "");
    if (type === "success" || type === "info") {
      setTimeout(() => {
        if (statusMsg.textContent === text) clearStatus();
      }, 3000);
    }
  }

  function clearStatus() {
    statusMsg.textContent = "";
    statusMsg.className = "status-msg";
  }

  function getEditorText() {
    return (editor.textContent || "").replace(/\u00a0/g, " ");
  }

  function setEditorText(text, typeHint = null) {
    const safeText = String(text ?? "");
    if (!safeText) {
      editor.textContent = "";
      return;
    }

    const type = typeHint || detectType(safeText);
    if (window.hljs && (type === "json" || type === "html")) {
      const language = type === "json" ? "json" : "xml";
      editor.innerHTML = window.hljs.highlight(safeText, {
        language,
        ignoreIllegals: true
      }).value;
      return;
    }

    editor.textContent = safeText;
  }

  function loadHighlightJs() {
    return new Promise(resolve => {
      if (window.hljs) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = HIGHLIGHT_JS_URL;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  function updateCharCount() {
    const n = getEditorText().length;
    charCount.textContent = n > 0 ? `${n.toLocaleString()} chars` : "";
  }

  function setBadge(type) {
    currentFileType = type;
    if (!type) {
      badge.className = "file-type-badge ff-badge ff-badge-candy";
      return;
    }
    badge.textContent = type.toUpperCase();
    const tone = type === "json" ? "ff-badge-violet" : "ff-badge-blue";
    badge.className = `file-type-badge visible ff-badge ${tone} ${type}`;
  }

  function detectType(text, filename = "") {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    if (ext === "json") return "json";
    if (ext === "html" || ext === "htm") return "html";
    const t = text.trim();
    if (t.startsWith("{") || t.startsWith("[")) return "json";
    if (/^<!doctype\s+html/i.test(t) || /^<html/i.test(t) || /^<[a-z][\s\S]*>/i.test(t)) return "html";
    return null;
  }

  function formatJSON(text) {
    try {
      const parsed = JSON.parse(text);
      return { ok: true, value: JSON.stringify(parsed, null, 2) };
    } catch (err) {
      return { ok: false, error: "JSON parse error: " + err.message };
    }
  }

  function formatHTML(text) {
    const INDENT = "  ";
    const INLINE_TAGS = new Set([
      "a", "abbr", "acronym", "b", "bdo", "big", "br", "cite", "code", "dfn",
      "em", "i", "img", "input", "kbd", "label", "map", "object", "output",
      "q", "samp", "select", "small", "span", "strong", "sub", "sup", "textarea",
      "time", "tt", "u", "var"
    ]);
    const VOID_TAGS = new Set([
      "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
      "meta", "param", "source", "track", "wbr"
    ]);

    const tokens = [];
    const re = /(<[^>]+>)|([^<]+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[1]) tokens.push({ type: "tag", value: m[1] });
      else if (m[2].trim()) tokens.push({ type: "text", value: m[2].trim() });
    }

    let depth = 0;
    let out = "";

    for (const tok of tokens) {
      if (tok.type === "text") {
        out += INDENT.repeat(depth) + tok.value + "\n";
        continue;
      }

      const tag = tok.value;
      const nameMatch = tag.match(/^<\/?([a-z][a-z0-9]*)/i);
      const tagName = nameMatch ? nameMatch[1].toLowerCase() : "";
      const isClose = tag.startsWith("</");
      const isSelfClose = tag.endsWith("/>") || VOID_TAGS.has(tagName);
      const isComment = tag.startsWith("<!--");
      const isDoctype = /^<!doctype/i.test(tag);

      if (isClose && !INLINE_TAGS.has(tagName)) {
        depth = Math.max(0, depth - 1);
        out += INDENT.repeat(depth) + tag + "\n";
      } else if (isComment || isDoctype || isSelfClose || INLINE_TAGS.has(tagName)) {
        out += INDENT.repeat(depth) + tag + "\n";
      } else {
        out += INDENT.repeat(depth) + tag + "\n";
        depth++;
      }
    }

    return out.trimEnd();
  }

  function loadText(text, filename) {
    const type = detectType(text, filename);
    setBadge(type);
    currentFileName = filename ? filename.replace(/\.(json|html|htm)$/i, "") : "formatted";

    try {
      if (type === "json") {
        const result = formatJSON(text);
        if (!result.ok) {
          setEditorText(result.error);
          setStatus(result.error, "error");
        } else {
          setEditorText(result.value, "json");
          setStatus("JSON formatted successfully.", "success");
        }
      } else if (type === "html") {
        setEditorText(formatHTML(text), "html");
        setStatus("HTML formatted successfully.", "success");
      } else {
        setEditorText(text);
        setStatus("Unknown type - displayed as-is.", "info");
      }
    } catch (err) {
      setEditorText(text);
      setStatus("Parse error: " + err.message, "error");
    }

    updateCharCount();
    editor.focus();
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = e => loadText(e.target.result, file.name);
    reader.onerror = () => setStatus("Failed to read file.", "error");
    reader.readAsText(file);
  }

  editor.addEventListener("input", () => {
    updateCharCount();
    setBadge(detectType(getEditorText()));
  });

  editor.addEventListener("paste", e => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    document.execCommand("insertText", false, text);
  });

  document.getElementById("btnUpload").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    readFile(file);
    fileInput.value = "";
  });

  document.getElementById("btnFormat").addEventListener("click", () => {
    const text = getEditorText();
    if (!text.trim()) {
      setStatus("Nothing to format.", "info");
      return;
    }

    const type = detectType(text);
    setBadge(type);

    try {
      if (type === "json") {
        const result = formatJSON(text);
        if (!result.ok) {
          setEditorText(result.error);
          setStatus(result.error, "error");
          updateCharCount();
          return;
        }
        setEditorText(result.value, "json");
        setStatus("JSON formatted.", "success");
      } else if (type === "html") {
        setEditorText(formatHTML(text), "html");
        setStatus("HTML formatted.", "success");
      } else {
        setStatus("Could not detect format. Paste JSON or HTML.", "error");
        return;
      }
    } catch (err) {
      setStatus("Format error: " + err.message, "error");
    }

    updateCharCount();
  });

  document.getElementById("btnSave").addEventListener("click", () => {
    const text = getEditorText();
    if (!text.trim()) {
      setStatus("Nothing to save.", "info");
      return;
    }

    const type = currentFileType || detectType(text);
    const ext = type === "html" ? ".html" : ".json";
    const blob = new Blob([text], { type: type === "html" ? "text/html" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileName + ext;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("File saved.", "success");
  });

  document.getElementById("btnCopy").addEventListener("click", async () => {
    const text = getEditorText();
    if (!text.trim()) {
      setStatus("Nothing to copy.", "info");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to clipboard.", "success");
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
      setStatus("Copied to clipboard.", "success");
    }
  });

  document.getElementById("btnClear").addEventListener("click", () => {
    setEditorText("");
    setBadge(null);
    clearStatus();
    updateCharCount();
    editor.focus();
  });

  ["dragenter", "dragover"].forEach(evt =>
    dropZone.addEventListener(evt, e => {
      e.preventDefault();
      dropOverlay.classList.add("active");
    })
  );

  ["dragleave", "dragend"].forEach(evt =>
    dropZone.addEventListener(evt, e => {
      if (!dropZone.contains(e.relatedTarget)) dropOverlay.classList.remove("active");
    })
  );

  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropOverlay.classList.remove("active");
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  });

  window.addEventListener("dragover", e => e.preventDefault());
  window.addEventListener("drop", e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  });

  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && e.key === "F") {
      e.preventDefault();
      document.getElementById("btnFormat").click();
    }
    if (e.ctrlKey && !e.shiftKey && e.key === "s") {
      e.preventDefault();
      document.getElementById("btnSave").click();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "C") {
      e.preventDefault();
      document.getElementById("btnCopy").click();
    }
  });

  setEditorText("");
  updateCharCount();
  loadHighlightJs().then(() => {
    const text = getEditorText();
    if (!text.trim()) return;
    setEditorText(text, currentFileType || detectType(text));
  });

