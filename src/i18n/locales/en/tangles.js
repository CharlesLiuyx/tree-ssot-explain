// Accidental-coupling case copy (en): key = 'a|b' (the two node gids, matching src/data/tangles.js).

export const tangles = {
  'perf.cache|authz.rowacl':'Leave permission info out of the cache key and you serve data to people who shouldn’t see it; put it in and the hit rate craters — two trees rewriting each other’s semantics on the same node',
  'perf.cache|gate.canary':'During a canary, two versions of the data structure coexist — the same cache key may be holding values of two different shapes',
  'perf.cache|arch.cfg':'Cache TTLs are scattered across the config center; whoever edits a config value has no idea which cache they are about to punch through',
  'gate.flagcfg|authz.apiauth':'Every new feature flag must be stacked with a permission check: if (flag && can(user)) — the two conditions are inseparable from that day on',
  'gate.canary|arch.bus':'Events from canary users must route to both the old and new consumers at once — the event bus is forced to understand release state',
  'perf.precompute|authz.roleinherit':'One role change invalidates every precomputed result — the invalidation cascade spans two trees',
  'arch.ext|gate.abtest':'Experiment parameters must be injected through the plugin boundary — the plugin’s isolation gets holes punched in it',
  'perf.batch|authz.auditlog':'Batch operations must be unbundled into per-item audit records — the audit requirement cancels out the batch’s performance win',
  'arch.split|perf.pool':'The more services you split out, the more connection pools you run — and the database’s total connection count explodes',
  'gate.envisol|arch.cfg':'Environment config and flag config are two separate sources of truth — the SSOTs start fighting',
  'authz.mask|perf.lazy':'Masking must happen before serialization, and lazy loading makes “before serialization” unpredictable',
  'gate.metrics|perf.pool':'Instrumentation traffic shares the data path with the business — switch on an experiment and throughput starts to judder',
  // Tangles that drag in the domain trees
  'ui.lod|perf.lazy':'Viewport degradation wants to compute less; lazy loading wants to compute later — two corner-cutting strategies stepping on each other, with no SSOT for timing',
  'edit.snapshot|perf.batch':'Undo snapshots ride the batched-write channel — batching reorders the timeline of history itself',
  'ui.sandbox|authz.apiauth':'The plugin sandbox reuses the API-auth model, but a plugin’s “subject” is not a user — the permission model is forced to grow a second grammatical subject',
  'edit.macro|gate.abtest':'A macro records behavior from an experiment branch; by replay time the experiment is gone — the recording carries a gating timestamp',
  'ui.keymap|gate.flagcfg':'A shortcut’s bound command doesn’t exist while the flag is off — the keymap is forced to be aware of switch state',
  'edit.nondestruct|authz.rowacl':'Non-destructive editing keeps references to the original data: an object that passed row-level filtering can still reach back through the modifier stack to the raw rows',
  'edit.migrate|gate.flagcfg':'The new data structure hides behind a feature flag, so the migrator must read the flag before deciding how to migrate — the same file migrates to two different results on either side of the switch, and rolling the flag back mass-produces files “from the future”',
  'ui.layoutpersist|edit.fileio':'Layout persistence hitched a ride on the project file: UI state written into the document format (exactly what Blender’s .blend does) — now changing one panel field counts as changing the file format, and the two domain trees are welded together on disk',
  'ui.progress|perf.batch':'Batched writes merge tasks for throughput, but the progress bar needs per-item completion events — either the progress bar lies, or you unbatch and kill throughput: one progress bar, two trees playing tug-of-war',
  // —— Observability tree ——
  'obs.logsample|fault.retry':'Retry storms strike exactly when traffic is at its fiercest — which is when the sampler drops logs hardest: the moment you most need evidence is the moment you have the least',
  'obs.traceprop|arch.bus':'Trace context has to cross the event bus’s async boundary — the bus is forced to carry a trace header in every event: the “decoupled” bus is now coupled to observability',
  'obs.structlog|authz.mask':'Logs want to see everything; masking wants it covered — the same log line has two legal shapes in two trees, with debugging and compliance each holding their own copy of the truth',
  'obs.metricstd|gate.abtest':'Experiment metrics and alert metrics share one instrumentation point but two definitions — the experiment says up, the alert says down, and nobody knows which to believe',
  // —— Concurrency tree ——
  'conc.cancel|edit.cmdops':'Does a half-cancelled command go into the undo stack? Cancellation propagation collides with command-based ops — “half an operation” is defined in neither tree',
  'conc.lockorder|perf.pool':'The connection pool has its own locks and the business has its own — two lock-ordering conventions waiting on each other at peak load, with deadlocks that reproduce only in production',
  'conc.workerpool|edit.evalsched':'The dependency graph’s parallel scheduler and the global worker pool fight over cores — both trees think they own the CPU, and nobody owns the resulting jank',
  // —— Fault Tolerance tree ——
  'fault.idempotent|perf.batch':'One item in the batch fails: retrying the whole batch demands idempotency, splitting the batch kills throughput — batch boundaries and idempotency keys holding each other hostage',
  'fault.circuit|gate.flagcfg':'A circuit breaker is a switch and a canary is a switch — “why is this feature off” now has two sources of truth that don’t know about each other',
  'fault.errclass|edit.crashrec':'Crash recovery must know which errors are recoverable — but the classification table for error semantics grows on another tree, so recovery logic reads the table across trees',
  'fault.fallback|authz.apiauth':'Fallback paths are usually old code — old code never onboarded the new auth model, so the moment you degrade, permissions are silently bypassed',
  // —— Compatibility tree ——
  'compat.dualread|perf.cache':'During dual read/write, one key holds values of two shapes — the cache must understand schema versions or it serves data “from the past”',
  'compat.semver|ui.apicompat':'The plugin marketplace’s compatibility promise has two rulebooks: the domain tree’s deprecation cycle and the compatibility tree’s semantic versioning — no SSOT for which one wins',
  'compat.schemamig|edit.migrate':'File-version migration and schema migration are two mechanisms migrating the same data — run them one step out of order and you migrate a file into corruption',
  'compat.verneg|collab.syncengine':'Old and new clients share one collaboration room, so the protocol must negotiate downward in real time — compatibility goes from a release-day problem to an every-second problem',
  // —— i18n / Accessibility tree ——
  'i18n.textexpand|ui.docking':'German copy runs about thirty percent longer than English — every dockable panel’s minimum width gets recomputed: in every language, the layout is a different layout',
  'i18n.keynav|ui.keymap':'Accessibility demands every feature be reachable by keyboard — shortcut conflict-resolution now carries an extra “reserved, hands off” list',
  'i18n.icu|gate.abtest':'The experiment group changed the copy and the translation pipeline didn’t keep up — canary users see the fallback source language, and the experiment data is polluted by language',
  'i18n.aria|ui.custompanel':'Plugins ship custom panels without semantic annotation — the product’s overall accessibility compliance is dragged down by the third-party ecosystem',
  // —— Security tree ——
  'sec.sandboxpol|ui.sandbox':'Security policy and sandbox implementation live in different trees — policy tightens, implementation lags, and the gap in between is the vulnerability',
  'sec.parsefuzz|edit.fileio':'Every file you open is one exposure of the parsing attack surface — the more forgiving the format compatibility, the harder the parser is to harden',
  'sec.keymgmt|arch.cfg':'Do secrets live in the config center or the key service? Two SSOTs fighting over the same secret — during every rotation, one side is still using the old key',
  'sec.depaudit|compat.semver':'The supply chain wants you to upgrade a dependency for a CVE; the compatibility promise forbids breaking — two trees tugging the same upgrade in opposite directions',
  // —— Collaboration tree ——
  'collab.offline|edit.autosave':'Offline replay and autosave both want to restore the scene — two sets of recovery points overwrite each other, and “latest state” has two answers',
  'collab.awareness|perf.pool':'Presence broadcasts in a ten-thousand-person room saturate the connections — presence is a traffic amplifier: the livelier the collaboration, the faster performance kneels',
  'collab.merge|authz.rowacl':'When an offline user merges back, rows they had no right to see took part in conflict resolution — permission filtering and semantic merging undermining each other',
  // —— Privacy tree ——
  'priv.forget|perf.cache':'The right to be forgotten demands deletion chase into every cache layer and every backup — one “delete it all” action cutting across every store',
  'priv.retention|obs.trace':'Traces carry user trajectories: observability wants 90 days for debugging, the compliance red line allows 30 — one dataset, two countdown clocks',
  'priv.region|tenant.shardkey':'Sharding is computed by load; data residency is computed by national borders — two sharding logics fighting over one routing table',
  'priv.piitag|gate.metrics':'Every new instrumentation point must pass PII review — “instrument more, experiment better” and data minimization are natural enemies',
  // —— Billing tree ——
  'bill.entitlecheck|gate.flagcfg':'if (flag && paid && can(user)) — gating, billing, and permissions, three trees welded into a single line of code',
  'bill.ratelimit|perf.batch':'Does a batch count as one call or N? The rate-limiting rulebook ends up dictating the shape of the API',
  'bill.usagemeter|obs.metricstd':'Billable usage and monitoring metrics ride the same instrumentation pipe — monitoring may sample; billing may not lose a single record',
  'bill.plans|authz.rbac':'The plan says whether you bought it; the role says whether you may — two models of “what you can use” stacked at every entry point',
  // —— Multi-tenancy tree ——
  'tenant.dataisol|perf.cache':'Forget the tenant prefix in a cache key and you have just shipped company A’s data to company B — isolation is a requirement written into the spelling of every key',
  'tenant.tenantflag|gate.flagcfg':'Tenant-level switches stack on top of global flags — answering “who is this feature on for” now takes two trees',
  'tenant.noisy|conc.workerpool':'One tenant’s heavy job fills the worker pool and every other tenant starves — isolation has to be driven deep into the scheduler',
  'tenant.percfg|arch.cfg':'The config center grows a tenant dimension — every config item goes from one value to a whole table, and nobody can quite explain the default-and-override chain',
};
