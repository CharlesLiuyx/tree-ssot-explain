# AGENTS.md

Instructions for AI coding agents (Cursor, Claude Code, …) working in this repo.

## Project shape

This repo is a **single, purely client-side product**: an interactive 3D three.js
visualization ("多树形结构 · 节点交织模型"). There is **no backend and no database** — all
runtime dependencies (three.js r160 + addons) are vendored under `vendor/`. The package
manager is **pnpm**, used only for build/test-time devDependencies (`esbuild`,
`puppeteer-core`): run `pnpm install --frozen-lockfile` once (this also enables the
git hooks in `.githooks/` via the `prepare` script).

## Running the app (dev)

- Source version (`index.html`) uses ES-module `importmap` and **must be served over HTTP**
  (browsers block ES modules on `file://`). Serve it with the command documented in `README.md`
  / `.claude/launch.json`: `python3 -m http.server 4173 --bind 127.0.0.1`, then open
  `http://127.0.0.1:4173/`.
- Embedded version (`index-embedded.html`) is a self-contained single file with three.js inlined;
  it opens directly in a browser with zero external requests. It is a **build artifact and is NOT
  committed** (gitignored) — generate it locally with `pnpm run build`; CI builds it on deploy.

## Build

- `pnpm run build` (= `node scripts/build-embedded.mjs`) generates `index-embedded.html` from
  `index.html` + `src/` + `styles/` + `vendor/`. The build is deterministic. Run it after
  editing `index.html`/`src/`/`styles/` if you need the single-file version.

## Lint / test

- `pnpm run check` (~0.3s): esbuild static pass over the whole import graph — catches syntax
 errors, broken import paths, and missing stylesheet links — plus `scripts/check-narrative.mjs`,
 which asserts that counts hard-coded in narrative copy (both locale packs, README) match values
 derived from `src/data/` (tangle/gravity/ghost/path/term counts, missing-tree claims, etc.),
 and that the zh/en locale packs' key sets match the data structures in both directions.
 Run it after every edit; when it fails it prints the expected value and where to fix.
- `pnpm run smoke` (~30s): headless-Chrome smoke test — boots the source version (Chinese),
  steps through all 10 narrative stages with ←/→, fails on any console error / uncaught
  exception / failed request, and keeps per-stage screenshots in `test-artifacts/` only on
  failure (gitignored); successful runs clean them up. Uses the system Chrome (no browser
  download); override the binary with `CHROME_PATH` if needed.
- `pnpm run smoke:en` (~30s): same, but with the English locale (`?lang=en`).
- `pnpm run smoke:embedded` (~30s): same, but loads the built `index-embedded.html` over
  `file://` (the double-click path). Requires `pnpm run build` first.
- `pnpm run verify`: check → smoke → smoke:en → build → smoke:embedded — the same gate CI runs
  before deploying to GitHub Pages (`.github/workflows/deploy-pages.yml`).
- There is no linter config. For UI changes, also verify visually in a browser (narrative ←/→
  keys and node click-to-zoom interactions) — the smoke test does not cover click-to-zoom.

## Commit messages

- Conventional Commits: `type(scope): subject`, subject preferably in Chinese (matches
  history), no trailing period. A zero-dependency `commit-msg` hook (`.githooks/`, enabled
  by `pnpm install`) rejects non-conforming messages and prints what's wrong.
- Self-check before committing: `node scripts/check-commit-msg.mjs --message "feat: …"`.
- Full spec (type table, scope names, edge cases): [docs/COMMIT_CONVENTION.md](docs/COMMIT_CONVENTION.md).

## Code layout & rules

- Layered, dependencies point downward only, zero cycles:
  `main → app → ui / scene → core / story / data → i18n / config`. Put changes in the right layer:
  new tree / tangle / gravity pair → structure in `src/data/` **plus copy in every locale pack**
  (`src/i18n/locales/zh/` and `en/` — key sets are gated by `pnpm run check`); narrative copy,
  UI strings, or term glossary → `src/i18n/locales/<code>/` only; visual style → `styles/`;
  a new strategy → register in `data/strategies.js`, add copy per locale, plus its visual
  effect in `scene/`.

## i18n

- Language resolution happens once, in `index.html`'s inline script (`?lang=` → localStorage
  `tree-ssot-lang` → `navigator.language`); modules consume `window.__lang` via `src/i18n/index.js`
  (Node falls back to zh). Switching language persists the choice + current stage and reloads —
  stage state is a pure function of the index, so it restores exactly.
- `src/data/` holds structure only; each data file hydrates display text from the active locale
  pack at load time and fails fast (naming the missing key) if copy is absent. Adding a language =
  copy `locales/zh/` → translate → register in `LOCALES` (src/i18n/index.js) and in the inline
  `known` table of index.html, then add a phrase adapter in `scripts/check-narrative.mjs`.
- English copy must be idiomatic — translate meaning and register, not word order. Keep counts in
  copy matching the canonical phrases the narrative check enforces (it prints them on failure).
- **Narrative stage state must be reversible**: each step's state is (as far as possible) a
  pure function of the step index — stepping ←/→ back and forth must land in the identical
  state. Don't accumulate stage state imperatively.
- Node references (gid) are validated at boot; a wrong gid fails fast naming the missing node.
- Performance matters (see README「渲染架构」): prefer the existing instanced pools /
  preallocated buffers over creating per-frame geometries or new meshes per node.
