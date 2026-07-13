// Strategy & platform-service copy (en): strategies keyed by strategy k (src/data/strategies.js),
// platform keyed by platform-service key (src/data/platform.js). The entropy percentage is derived
// from the numeric factor — it never appears in copy.

export const strategies = {
  layer:    { name:'Layering', desc:'Arrange the trees into layers; cross-tree calls must pass through explicit interface rings — accidental coupling decays into inter-layer contracts. But beware: <b>gravity pairs will not be pulled apart</b>; forcing layers only stretches their branches longer and longer.' },
  sdd:      { name:'SDD · Spec-driven', desc:'Strengthen every tree’s root: any node’s meaning can be derived down from the spec (golden pulses flow from root to canopy), so AI never has to read the whole graph and guess.' },
  tdd:      { name:'TDD · Test-anchored', desc:'Pin down each leaf’s behavior with tests (the green guard shells). Even a node referenced by many trees can no longer drift — the precondition for “let AI write here with confidence”.' },
  loops:    { name:'Loops · Short cycles', desc:'Rate-limit the entanglement: each loop may grow only so much new tangle, and the end of every loop must clean up (the radar sweeps; some red lines turn grey) — density stays pinned below the attention budget.' },
  platform: { name:'Platformize · Explicit sharing', desc:'Extract cross-cutting capabilities like permissions and gating into a standalone platform tree that everything else depends on at the root — implicit entanglement becomes explicit dependency.' },
  fusion:   { name:'Fusion · Own the gravity', desc:'Stop tugging at <b>essential coupling</b>: put each gravity pair into the same module, the same layer — and if the two trees have already split into separate repositories, move the pair into one. Designed together, tested together, one owner; the golden bubble = legal cohabitation.' },
  explicit: { name:'Explicitation · Annex the ghost roots', desc:'Drag the <i>off-graph truth</i> back onto the graph: DI collapsed into one explicit wiring file, events into a typed subscription table, old files sampled into golden-file tests, config written as schema, unwritten API behavior locked into contract tests — the ghost roots are annexed inside the repository boundary, and dashed lines turn solid.' },
};

export const platform = { authz:'Permission Service', gate:'Gating Service', audit:'Audit Service', infra:'Infrastructure' };
