# Building with Codex

A static, responsive learning guide built with HTML, CSS, and vanilla JavaScript. No build step or API key is required.

## Preview

From this directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. The same files can be served by GitHub Pages at `/vibecoding/codex/`.

## Contents

- Four scripted CLI workflows with run, pause, continue, replay, skip-to-end, and reset controls.
- Four-stage workflow loop with manual selection and optional autoplay.
- Blueprint generator for SaaS, portfolio, commerce, and API/backend projects, with two verification strategies, keyboard-accessible output tabs, copy actions, a project-specific prompting strategy, and a Markdown download.
- Searchable command reference with category filtering and empty results.
- Skills example, six reusable Skill ideas, triggering guidance, and MCP use-case and troubleshooting notes with official/publisher documentation links.

The simulator does not execute commands. Blueprints are examples to adapt, not generated application code. Font Awesome Free loads from cdnjs; the site's text and controls remain usable if that CDN is unavailable.

## Maintenance

- `index.html`: page content, navigation, and source links.
- `css/style.css`: original Mist Lavender theme plus responsive field-guide styles.
- `js/app.js`: interactive behavior and command/blueprint data.
- `tasks.md`: original task specification, preserved.

Documentation was checked November 8, 2026. Recheck the linked official CLI reference before updating version-sensitive commands.

## Verification performed

- `node --check js/app.js` passed.
- HTML IDs, internal anchors, and local asset references checked.
- Browser checks at 1440, 1024, 768, and 390 pixels found no document-level horizontal overflow.
- Exercised all simulator scenarios, pause/reset, workflow playback/manual selection, all blueprint types and tabs, strategy selection, arrow-key tab navigation, Markdown download, clipboard fallback, command search/category/empty results, and mobile navigation.
- Desktop and iPad screenshots reviewed; no browser console errors in the final run.
