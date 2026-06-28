# Markdown Editor — Implementation Plan

This document is the authoritative spec for building this app. It reflects all decisions made during planning, including framework choice, file-handling strategy, and LaTeX preview scope. Where a decision was revisited mid-planning, only the final decision is binding — rationale is included so the reasoning isn't lost, but should not be treated as alternative options to choose between.

## 1. Overview

A browser-based, client-side-only app for editing and previewing Markdown files.

No backend, no database, no server-side code of any kind. Everything runs in the browser.

## 2. Tech stack

Vanilla Javascript - HTML, CSS, and Javascript


### Page layout (applies to all three pages)

The app should be built out of 2 pages.
- index.html - The Markdown editor
- reference.html - Reference on Markdown syntax.

### Editor layout for Markdown editor

- Split screen: editor pane on the left, preview pane on the right
- Both panes should get generous width — no need to compromise for narrow viewports, since mobile is explicitly out of scope
- **Scroll sync:** scrolling either pane should move the other to the corresponding position

##  Markdown editor — functional spec

- Text editor pane with Markdown syntax highlighting
- Live, rendered preview pane (updates as the user types — see §8 for debounce guidance on validation specifically; live preview rendering itself does not need to be debounced unless performance testing shows otherwise)
- Rendering library: `markdown-it` or `remark` — either is acceptable; choose based on whichever has better support for the plugin ecosystem needed (tables, footnotes, etc.)

### Syntax highlighting

- Should syntax highlighting for markdown

## 7. File operations

**Approach: File System Access API as the primary path, with a download/upload fallback for unsupported browsers.**

This pattern has prior precedent in another deployed project of the requester's (`qedit`, at `https://mosubaga.github.io/qedit/`), which implements the same Open / New / Save pattern with the same browser-support constraints described below — confirming this approach works in production, not just in theory. Also a button must exist so user can COPY the entire text in the editor.

### 7.1 Open
- **Primary (Chrome/Edge):** `showOpenFilePicker()` from the File System Access API.
- **Fallback (Firefox/Safari, or any browser lacking the API):** standard `<input type="file">`.
- Feature-detect API availability at runtime (e.g. `'showOpenFilePicker' in window`) and route to the correct path automatically. No manual user-facing toggle for this.
- **Drag and drop** must be supported for opening files, on both the primary and fallback paths.

### 7.2 Create new

- Clears editor state to a blank/empty document. Purely client-side state reset — no file API involved.
- Must trigger the same unsaved-changes check as closing/switching a file (§7.5) if there are unsaved edits in the currently open document.

### 7.3 Save / Save As — including required UX distinction

- **Primary (Chrome/Edge), after a file has been opened or saved at least once via the API:** `showSaveFilePicker()` provides a file handle. Subsequent **Save** actions should write back to that same handle silently (no repeated file dialog) — this is the in-place-overwrite behavior. A separate **Save As** action should always prompt `showSaveFilePicker()` fresh, regardless of an existing handle.
- **Fallback (Firefox/Safari, or no File System Access API support):** there is no persistent file handle available. Every save — whether triggered via a "Save" or "Save As" control — must trigger a fresh browser download. **The UI must make this distinction visible to the user**, e.g.:
  - If no File System Access API support: label the action "Save As" (or similar), not "Save," since every action produces a new downloaded file rather than overwriting the original.
  - If File System Access API support exists and a handle is held: "Save" should be available and should overwrite in place; "Save As" remains available separately for explicit save-to-new-location.
- Do not present a plain "Save" button on the fallback path that silently behaves like "Save As" with no indication — this was identified as a likely point of user confusion and must be addressed in the UI copy/disabled-state logic, not left implicit.

### 7.4 Single file at a time (v1 scope)
- Only one file may be open at a time. No tabs, no multi-file editing.
- Multi-file/tabbed editing is deferred — see §10. Do not implement tab UI, per-tab dirty state, or per-tab undo history in this version.

### 7.5 Unsaved changes warning
- Prompt the user before: closing the current file, opening/switching to a different file, creating a new file, or navigating away from the page — in every case where there are unsaved edits in the currently open document.

### 7.6 Autosave (safety net, not a save mechanism)
- Periodically persist the current editor content to browser storage (`localStorage` or `IndexedDB`) as a recovery mechanism against crashed tabs or accidental navigation.
- This is explicitly **not** a substitute for explicit file save (§7.3) — it does not write to disk and should not be presented to the user as equivalent to saving.

## 8. Editing features

- Undo / redo
- Search and replace
- Keyboard shortcuts:
  - Save: `Ctrl/Cmd+S`
  - Find: `Ctrl/Cmd+F`
  - Find & Replace: `Ctrl/Cmd+H`
  - Standard editor shortcuts for undo/redo, etc.
- Syntax highlighting for both Markdown and full LaTeX document syntax (not just math mode — see §5.5)

## 9. Syntax validation

**Approach: detect and suggest only. Never silently auto-rewrite the user's source.**

- Detect syntax issues — e.g. unclosed LaTeX braces, mismatched `$...$` delimiters, broken Markdown links/reference definitions — and surface them in a small card at the bottom of the editor.
- Each detected issue must show the problem and a suggested fix. **The user must explicitly click/apply the fix** — the app must never auto-rewrite the source on its own, whether on keystroke or on save.
- Detection should be **debounced** (not re-run on every keystroke), since LaTeX parsing in particular can be expensive enough to cause input lag if run synchronously on every change.

## 10. Theming

- Please use the style.css under the css folder.