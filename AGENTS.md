# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single, purely client-side product**: an interactive 3D three.js
visualization ("多树形结构 · 节点交织模型"). There is **no backend, no database, and no
package manager** — all dependencies (three.js r160 + addons) are vendored under `vendor/`,
so there is nothing to `npm install`. The startup update script is intentionally minimal.

### Running the app (dev)
- Source version (`index.html`) uses ES-module `importmap` and **must be served over HTTP**
  (browsers block ES modules on `file://`). Serve it with the command documented in `README.md`
  / `.claude/launch.json`: `python3 -m http.server 4173 --bind 127.0.0.1`, then open
  `http://127.0.0.1:4173/`.
- Embedded version (`index-embedded.html`) is a self-contained single file with three.js inlined;
  it opens directly in a browser with zero external requests (no server needed).

### Build (optional)
- `node build-embedded.mjs` regenerates `index-embedded.html` from `index.html` using esbuild
  fetched on-demand via `npx -y esbuild` (this first-run fetch needs network access). The build is
  deterministic — running it on an unmodified `index.html` leaves the working tree clean. Only run
  it after editing `index.html`.

### Lint / test
- There is **no lint or automated test suite** in this repo (no test framework, no linter config).
  Verify changes by loading the app in a browser and exercising the narrative (←/→ keys) and node
  click-to-zoom interactions.
