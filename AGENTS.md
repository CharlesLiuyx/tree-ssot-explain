# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single, purely client-side product**: an interactive 3D three.js
visualization ("多树形结构 · 节点交织模型"). There is **no backend and no database** — all
runtime dependencies (three.js r160 + addons) are vendored under `vendor/`. The package
manager is **pnpm**, used only for build/test-time devDependencies (`esbuild`,
`puppeteer-core`): run `pnpm install --frozen-lockfile` once.

### Running the app (dev)
- Source version (`index.html`) uses ES-module `importmap` and **must be served over HTTP**
 (browsers block ES modules on `file://`). Serve it with the command documented in `README.md`
 / `.claude/launch.json`: `python3 -m http.server 4173 --bind 127.0.0.1`, then open
 `http://127.0.0.1:4173/`.
- Embedded version (`index-embedded.html`) is a self-contained single file with three.js inlined;
 it opens directly in a browser with zero external requests. It is a **build artifact and is NOT
 committed** (gitignored) — generate it locally with `pnpm run build`; CI builds it on deploy.

### Build
- `pnpm run build` (= `node scripts/build-embedded.mjs`) generates `index-embedded.html` from
 `index.html` + `src/` + `styles/` + `vendor/`. The build is deterministic. Run it after
 editing `index.html`/`src/`/`styles/` if you need the single-file version.

### Lint / test
- `pnpm run check` (~0.2s): esbuild static pass over the whole import graph — catches syntax
 errors, broken import paths, and missing stylesheet links. Run it after every edit.
- `pnpm run smoke` (~30s): headless-Chrome smoke test — boots the source version, steps through
 all 10 narrative stages with ←/→, fails on any console error / uncaught exception / failed
 request, and keeps per-stage screenshots in `test-artifacts/` only on failure (gitignored);
 successful runs clean them up. Uses the system Chrome (no browser download); override the binary
 with `CHROME_PATH` if needed.
- `pnpm run smoke:embedded` (~30s): same, but loads the built `index-embedded.html` over
 `file://` (the double-click path). Requires `pnpm run build` first.
- `pnpm run verify`: check → smoke → build → smoke:embedded — the same gate CI runs before
 deploying to GitHub Pages (`.github/workflows/deploy-pages.yml`).
- There is no linter config. For UI changes, also verify visually in a browser (narrative ←/→
 keys and node click-to-zoom interactions) — the smoke test does not cover click-to-zoom.
