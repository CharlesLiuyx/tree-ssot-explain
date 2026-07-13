// UI & scene-label copy (en): grouped by component; parameterized entries are template functions
// (each language owns its word order). Key-set parity with zh/ui.js is enforced by check-narrative.

export const ui = {
  topbar: {
    title: 'The Multi-Tree · <em>Node-Entanglement</em> Model',
    subtitle: 'Why AI suddenly goes blurry once a project crosses a certain complexity',
    keys: 'Drag to rotate · Scroll to zoom · <b>Click a node</b> to zoom in · <b>Esc</b> back · <b>V</b> viewport map · <b>←/→</b> steps · Hover for details',
    langBtn: '中文',                      // the button shows the language you would switch TO
    langBtnTitle: '切换到中文',           // and its tooltip speaks that language
  },
  meter: {
    title: 'Semantic entropy · AI confusion',
    scaleOk: 'OK', scaleMid: 'human-in-loop', scaleBad: 'collapse',
    zoneOk: 'AI can handle this', zoneMid: 'strained · needs human-in-the-loop', zoneBad: 'confusion collapse zone',
  },
  legend: (biz, cross) => `
  <span class="sw" style="background:#ffd166"></span>Root / SSOT — guarded by humans<br>
  <span class="sw" style="background:#d9e650"></span><span class="sw" style="background:#ff7fb2;margin-left:-3px"></span>Domain trees ×${biz} (deep)　<span class="sw" style="background:#5b8cff"></span><span class="sw" style="background:#7ee08a;margin-left:-3px"></span><span class="sw" style="background:#dcc98a;margin-left:-3px"></span>Cross-cutting trees ×${cross} (pervasive)<br>
  <span class="sw" style="background:#ff4d6d"></span>Accidental coupling (dissolvable)　<span class="sw" style="background:#ff2fd0"></span>Essential gravity (fusion only)<br>
  <span class="sw" style="background:#7de8ff"></span>Ghost roots — truth off-graph (explicitation only)<br>
  <span class="sw" style="background:transparent;border:1.5px dashed #7de8ff"></span>Repository boundary (nestable) — every tree can be its own repo / sub-repo<br>
  <span class="sw" style="background:transparent;border:1.5px solid #5dd39e"></span>Leaves · AI free zone　<span class="sw" style="background:#ffb84d"></span>Contracted　<span class="sw" style="background:#f3e9c8"></span>Platform tree`,
  rotate: {
    title: 'Pause / resume the overview auto-rotation (Space; you can also just drag the view)',
    stop: 'Stop rotating', start: 'Auto-rotate',
  },
  nav: { prev: '← Back', next: 'Next →', restart: '↺ Back to overview' },
  caseCtrl: {
    rangeTitle: 'Drag: play up to case N',
    allBtn: '⚡ Show all', allTitle: 'Light up every tangle at once — no carousel afterwards',
    pause: '⏸ Pause', replay: '▶ Replay', resume: '▶ Resume', play: '▶ Play',
    playTitle: 'Reveal the tangle cases one by one (plays only when clicked)',
    cycleStop: '⏸ Stop roll call', cycleStart: '▶ Roll call',
    cycleTitle: 'Calls one gravity pair every 5 seconds (plays only when clicked)',
  },
  director: {
    caseIdle: n => `<span class="dim">${n} real tangle cases waiting — press ▶ to play them one by one, drag the bar to freeze on any case, or “⚡ Show all” to light everything up</span>`,
    caseItem: (i, n, a, b, why) => `<b>Case ${i}/${n}</b>　${a} ↔ ${b}<br>${why}`,
    caseDone: n => `<br><span class="dim">✓ All ${n} cases shown — no carousel; drag the bar to revisit any case</span>`,
    gravIdle: n => `<span class="dim">${n} essentially coupled pairs await roll call — press ▶ to start, or click any pair in the list below</span>`,
    gravItem: (i, n, a, b, kindName, why) => `<b>Pair ${i}/${n}</b>　${a} ⚡ ${b}<span class="gkind">${kindName}</span><br>${why}`,
  },
  panel: {
    gravGroup: (kindName, kindDesc, count) => `<b>${kindName}</b><span>${kindDesc} · ${count} pairs</span>`,
    lawBack: 'back to panorama ↩', lawGo: 'see the scene ↗',
    lawScenePrefix: '📍 ',
    stratPct: pct => `${pct} entropy`,
    statsTangles: ({ red, amber, grey, plat }) =>
      `Accidental coupling: <span class="r">${red} still tangled</span> · <span class="am">${amber} contracted</span> · <span class="dim">${grey} dissolved this loop</span> · <span class="g">${plat} platformized</span>`,
    statsGravity: (n, fused) =>
      `Essential gravity: ${fused ? `<span class="g">${n} pairs fused (golden bubbles)</span>` : `<span class="mg">${n} pairs still straining</span>`}`,
    statsGhosts: (n, explicit) =>
      `Off-graph truth: ${explicit ? `<span class="g">${n} ghost roots annexed into the repo</span>` : `<span class="gh">${n} ghost roots adrift outside</span>`}`,
    metaPathTitle: (proto, desc) => `${proto} — ${desc}`,
    metaPlay: '▶ Grow', metaPause: '⏸ Pause',
    metaPlayTitle: 'Start / pause growth (click again when finished = replay from the start)',
    metaSpeed: 'Growth speed', metaSpeedTitle: 'Drag: adjust how fast the tree of trees grows',
    metaReplay: '↻ Replay', metaReplayTitle: 'Regrow at the current speed',
    metaTraits: (proto, desc, strong, weak) =>
      `<div class="quote"><b style="color:#dfe6f3">${proto}</b> — ${desc}<br><b class="g">Skeleton</b>: ${strong}<br><b class="r">Prosthetics</b>: ${weak}</div>`,
  },
  nodeInfo: {
    platformKind: 'Platform tree · the explicit home of a cross-cutting concern',
    kindRoot: 'SSOT · guarded by humans',
    kindSkeleton: 'Skeleton · hand to AI with care',
    kindLeaf: 'Leaf · AI free zone (needs test anchoring)',
    platformTreeName: 'Platform tree',
    meanings: (n, multi) => `Meanings: ${n}${multi ? ' (polysemous!)' : ' (single ✓)'}`,
    tangleItem: (other, why) => `<li><b>Tangled with “${other}”</b>: ${why}</li>`,
    gravNote: (kindName, other) => `⚡ Essential coupling (${kindName}): bound to draw close to “${other}”`,
    ghostNote: name => `👻 Truth off-graph: decided by “${name}” — AI cannot read it from the text`,
    tangleActive: '● Tangled',
    tanglePlatformed: '● Platformized: both sides now depend only on the platform service',
    tangleContracted: '● Contracted: must pass through the inter-layer interface',
    tangleLooped: '● Dissolved in this loop',
    gravKindLabel: kindName => `Essential coupling · ${kindName}`,
    gravFused: '● Fused: one module, designed together, one owner',
    gravActive: '● Essential coupling — cannot be split, only fused',
    ghostCollected: '● Annexed: the truth is now explicit in the repo (wiring file / subscription table / golden files / schema)',
    ghostFree: '● Adrift off-graph — AI cannot read it statically from the text',
    ghostFix: fix => `<b style="color:#dfe6f3">Way out</b>: ${fix}`,
    metaKind: (idx, parentShort) =>
      `Tree of trees · grew ${ordinal(idx)}${parentShort ? ` · out of “${parentShort}”’s pain` : ' · the meta-root'}`,
  },
  tooltip: { termFallback: 'Glossary' },
  scene: {
    rootSsot: 'root = SSOT',
    boundaryLabel: '<b>Repository boundary</b><span>inside the ring = all the text AI can read</span><span>small dashed rings = every tree can be its own repo / sub-repo</span>',
    treeRingLabel: '<b>Every tree can be a repo</b><span>dashed ring = this tree’s own repository boundary · standalone repo or sub-repo</span>',
    ghostLabel: name => `<b>👻 ${name}</b><span>ghost root · the real SSOT is off-graph</span>`,
    platformLabel: '<b>Platform tree · explicit sharing</b><span class="ssot">the new SSOT for cross-cutting concerns</span>',
    metaRootBadge: 'meta-root · first-principle assumption',
    aiLabel: 'AI<span>finite attention budget</span>',
    gravNameplate: (a, b, kindName) => `<b>${a} ⚡ ${b}</b><span>essential coupling · ${kindName}</span>`,
  },
  vp: {
    back: '← Back one view', backTitle: 'Return to the previous viewport (Esc)',
    pill: 'Viewport history', pillTitle: 'Expand the viewport-history panel (nav tree + node details)',
    title: 'Viewport history',
    collapse: '— Collapse', collapseTitle: 'Collapse to a pill (history kept)',
    mapBtn: '⛶ Map', mapBtnTitle: 'Show the full viewport-history map (V)',
    home: '⌂ Start view', homeTitle: 'Return to this step’s starting view',
    clear: '⌫ Clear', clearTitle: 'Clear this step’s viewport history (keeps the start view and flies back)',
    detailEmpty: 'Click any node to <b>zoom in</b> and see details',
    navTree: 'Navigation tree (click any node to jump)',
    gcSuffix: n => ` · ${n} recycled`,
    startLabel: 'Start view',
    mapTitle: 'Viewport history · Map',
    mapClose: '✕ Close <span class="kbd">Esc</span>',
    mapStats: (depth, count, max) => `Depth ${depth} · viewports ${count} / ${max}`,
    mapFoot: max => `Click any viewport to jump (120 ms) · <b>V</b> toggles this map anytime · each step grows a fresh history tree · beyond ${max} viewports, the least-recently-visited side leaves are recycled — the root and the current path never are`,
    chipTitle: label => `Jump to “${label}”`,
    chipRootTitle: 'Back to this step’s starting view',
    current: 'now',
    mapEmpty: 'No zoom-ins yet — click any node in the 3D scene and a history tree will grow here.',
  },
};

/* 1 → "1st", 2 → "2nd" … (used by the meta-tree node details) */
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
