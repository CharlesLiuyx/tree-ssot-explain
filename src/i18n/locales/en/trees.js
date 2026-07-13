// Tree & node copy (en): `trees` = per-tree text (key = tree id), `nodes` = node names (key = gid).
// Structure (positions/colors/hierarchy) lives in src/data/trees.js;
// key-set parity with zh is enforced by check-narrative.

export const trees = {
  edit:   { name:'Edit Core Tree (domain)', short:'Edit Core', constraint:'Perspective: data model & consistency', tradeoff:'Domain complexity: Blender’s scene/dependency graphs, VS Code’s text model — can’t be removed, shouldn’t be', rootName:'Edit Core SSOT' },
  ui:     { name:'UI Tree (domain)', short:'UI', constraint:'Perspective: interaction paradigm & state', tradeoff:'Domain complexity: viewport / gizmos / command palette / extension host — the tool’s entire “feel” lives here', rootName:'UI SSOT' },
  arch:   { name:'Architecture Tree', short:'Architecture', constraint:'Constraint: extensibility', tradeoff:'Price: added abstraction layers → short-term performance loss', rootName:'Architecture SSOT' },
  perf:   { name:'Performance Tree', short:'Performance', constraint:'Constraint: throughput & latency', tradeoff:'Price: specialization / flattening / cache coupling → extensibility suffers', rootName:'Performance SSOT' },
  authz:  { name:'Permissions Tree', short:'Permissions', constraint:'Constraint: safety & compliance', tradeoff:'Risk: skip the general model → ad-hoc patches pile up, complexity never dissolves', rootName:'Permissions SSOT' },
  gate:   { name:'Gating Tree', short:'Gating', constraint:'Constraint: release safety & experiments', tradeoff:'Price: every flag is a forked universe', rootName:'Gating SSOT' },
  obs:    { name:'Observability Tree', short:'Observability', constraint:'Constraint: diagnosability', tradeoff:'Price: instrumentation and tracing eat performance themselves; the fuller the logs, the riskier the privacy', rootName:'Observability SSOT' },
  conc:   { name:'Concurrency Tree', short:'Concurrency', constraint:'Constraint: ordering & consistency', tradeoff:'Price: parallel wants fast, consistent wants slow — every feature must answer “which thread runs this”', rootName:'Concurrency SSOT' },
  fault:  { name:'Fault Tolerance Tree', short:'Fault Tolerance', constraint:'Constraint: failure semantics', tradeoff:'Price: every path must answer “what if this fails” — retries and idempotency hold each other hostage', rootName:'Fault Tolerance SSOT' },
  compat: { name:'Compatibility Tree', short:'Compatibility', constraint:'Constraint: never break a promise', tradeoff:'Price: every data or API change must pass it — a bigger veto than even Performance holds', rootName:'Compatibility SSOT' },
  sec:    { name:'Security Tree', short:'Security', constraint:'Constraint: minimize the attack surface', tradeoff:'Price: Permissions governs “who may do what”; Security governs “what nobody may do” — every check is new friction', rootName:'Security SSOT' },
  priv:   { name:'Privacy Tree', short:'Privacy', constraint:'Constraint: the data’s very existence must be compliant', tradeoff:'Price: Permissions decides “who can see”; Privacy decides “may it be stored, and for how long” — deletion chases into every cache and backup', rootName:'Privacy SSOT' },
  i18n:   { name:'i18n / Accessibility Tree', short:'i18n·a11y', constraint:'Constraint: usable by everyone', tradeoff:'Price: every string, every control, every keybinding is cut across — the shallowest tree, and the widest', rootName:'i18n SSOT' },
  collab: { name:'Collaboration Tree', short:'Collaboration', constraint:'Constraint: everything must merge', tradeoff:'Price: the data model, undo, and permissions all get their semantics rewritten — the most expensive tree of all', rootName:'Collaboration SSOT' },
  bill:   { name:'Billing Tree', short:'Billing', constraint:'Constraint: usage is revenue', tradeoff:'Price: entitlements shadow every flag, quotas dictate API shape — monitoring may sample, billing may not lose one record', rootName:'Billing SSOT' },
  tenant: { name:'Multi-tenancy Tree', short:'Multi-tenancy', constraint:'Constraint: tenants must never see each other', tradeoff:'Price: every cache key, every table, every queue carries one extra tenant dimension', rootName:'Multi-tenancy SSOT' },
};

export const nodes = {
  // —— Edit Core tree ——
  'edit.docmodel':'Scene / Document Model', 'edit.scenegraph':'Nodes & Hierarchy', 'edit.instancing':'Instances & References',
  'edit.linkdup':'Linked Duplicates', 'edit.overridelib':'Reference Overrides', 'edit.xform':'Parent-Child Transforms', 'edit.xformcache':'World-Matrix Cache',
  'edit.collections':'Collections & Grouping', 'edit.depsgraph':'Dependency Graph', 'edit.increval':'Incremental Evaluation',
  'edit.dirtyprop':'Dirty-Flag Propagation', 'edit.evalsched':'Parallel Eval Scheduling', 'edit.cycles':'Cycle Detection',
  'edit.datablock':'Datablocks & IDs', 'edit.uniquename':'Unique Naming', 'edit.refcount':'Refcounts & Orphans',
  'edit.selection':'Selection System', 'edit.selset':'Selection Set', 'edit.multisel':'Multi-Object Selection', 'edit.modes':'Mode Switching',
  'edit.active':'Active Item & Focus', 'edit.softsel':'Soft Selection', 'edit.falloff':'Weight Falloff',
  'edit.history':'History & Persistence', 'edit.undo':'Undo / Redo Stack', 'edit.snapshot':'Snapshots & Deltas',
  'edit.snapgran':'Snapshot Granularity', 'edit.coalesce':'Coalescing Policy', 'edit.fileio':'File Format',
  'edit.fwdcompat':'Forward Compatibility', 'edit.migrate':'Version Migration', 'edit.autosave':'Autosave', 'edit.crashrec':'Crash Recovery',
  'edit.ops':'Editing Operations', 'edit.cmdops':'Command-Based Ops', 'edit.replay':'Parameterized Replay', 'edit.ctxresolve':'Context Re-resolution',
  'edit.macro':'Macro Recording', 'edit.modstack':'Modifier Stack', 'edit.nondestruct':'Non-Destructive Editing',
  'edit.stackorder':'Stack Eval Order', 'edit.stackcache':'Intermediate Caches', 'edit.transform':'Transform Ops',
  'edit.numeric':'Exact Numeric Input', 'edit.propedit':'Proportional Editing',
  'edit.driversys':'Constraints & Drivers', 'edit.drivers':'Drivers', 'edit.exprdrv':'Expression Evaluation',
  'edit.drvtarget':'Target Rebinding', 'edit.constraints':'Constraint Solving', 'edit.solveorder':'Solve Order',
  // —— UI tree ——
  'ui.feedback':'Feedback & Notifications', 'ui.statusbar':'Status Bar', 'ui.progress':'Long-Task Progress',
  'ui.toast':'Toasts & Confirmations', 'ui.undotoast':'Undoable Toasts',
  'ui.panels':'Panels & Layout', 'ui.docking':'Dockable Layout', 'ui.layoutpersist':'Layout Persistence', 'ui.workspaces':'Workspace Presets',
  'ui.props':'Property Panels', 'ui.twoway':'Two-Way Binding', 'ui.multiedit':'Multi-Select Batch Edit', 'ui.proppath':'Property-Path Addressing',
  'ui.outliner':'Outliner', 'ui.treesync':'Scene Sync', 'ui.dragdrop':'Drag-and-Drop Reorder',
  'ui.exthost':'Extension Host', 'ui.pluginapi':'Plugin API', 'ui.sandbox':'Sandbox Isolation', 'ui.capgrant':'Capability Grants',
  'ui.apicompat':'Version Compatibility', 'ui.deprecate':'Deprecation Cycle', 'ui.uicontrib':'UI Injection Points',
  'ui.custompanel':'Custom Panels', 'ui.theming':'Themes & Styling',
  'ui.viewport':'Viewport', 'ui.realtime':'Realtime Rendering', 'ui.dirtyrect':'Dirty-Region Redraw', 'ui.overlaycomp':'Overlay Compositing',
  'ui.lod':'LOD / Degradation', 'ui.proxydisp':'Proxy Display While Interacting', 'ui.gizmo':'Gizmos',
  'ui.dragconstraint':'Drag Constraints', 'ui.snap':'Snapping', 'ui.snapprio':'Snap-Target Priority',
  'ui.nav3d':'View Navigation', 'ui.camctl':'Orbit / Walkthrough', 'ui.multiview':'Linked Multi-View',
  'ui.command':'Command System', 'ui.palette':'Command Palette', 'ui.fuzzy':'Fuzzy Search', 'ui.recent':'Recents & Suggestions',
  'ui.keymap':'Keyboard Shortcuts', 'ui.keyconflict':'Conflict Resolution', 'ui.ctxscope':'Context Scoping', 'ui.chords':'Key Chords',
  'ui.menus':'Menus & Toolbars', 'ui.ctxmenu':'Context Menus',
  // —— Architecture tree ——
  'arch.layers':'Domain Layering', 'arch.di':'Dependency Injection', 'arch.bus':'Event Bus',
  'arch.split':'Service Decomposition', 'arch.gw':'API Gateway', 'arch.cfg':'Config Center',
  'arch.plugin':'Plugin Mechanism', 'arch.ext':'Extension-Point Registry', 'arch.lc':'Lifecycle',
  // —— Performance tree ——
  'perf.cachesys':'Caching System', 'perf.cache':'Cache Policy', 'perf.invalidate':'Invalidation Cascade',
  'perf.datapath':'Data Path', 'perf.batch':'Batched Writes', 'perf.pool':'Connection Pool',
  'perf.compute':'Compute Strategy', 'perf.precompute':'Precompute', 'perf.lazy':'Lazy Loading',
  // —— Permissions tree ——
  'authz.rbac':'RBAC Model', 'authz.roleinherit':'Role Inheritance', 'authz.apiauth':'API Auth',
  'authz.acl':'Resource ACLs', 'authz.rowacl':'Row-Level Permissions', 'authz.mask':'Field Masking',
  'authz.audit':'Audit', 'authz.auditlog':'Audit Log', 'authz.replay2':'Operation Replay',
  // —— Gating tree ——
  'gate.flag':'Feature Flags', 'gate.flagcfg':'Flag Configuration', 'gate.vergate':'Version Gates',
  'gate.release':'Release Strategy', 'gate.canary':'Canary Release', 'gate.envisol':'Environment Isolation',
  'gate.exp':'Experiments', 'gate.abtest':'A/B Testing', 'gate.metrics':'Metric Instrumentation',
  // —— Observability tree ——
  'obs.logs':'Logging System', 'obs.structlog':'Structured Logging', 'obs.logsample':'Log Sampling',
  'obs.trace':'Distributed Tracing', 'obs.traceprop':'Context Propagation', 'obs.spanmap':'Call-Graph Reconstruction',
  'obs.slo':'Metrics & Alerting', 'obs.metricstd':'Metric Definitions', 'obs.alertrule':'Alert Rules',
  // —— Concurrency tree ——
  'conc.threading':'Threading Model', 'conc.mainthread':'Main-Thread Contract', 'conc.workerpool':'Worker Pool',
  'conc.syncprim':'Sync Primitives', 'conc.lockorder':'Lock Ordering', 'conc.atomics':'Lock-Free Structures',
  'conc.asynctask':'Async Tasks', 'conc.cancel':'Cancellation Propagation', 'conc.backpressure':'Backpressure Control',
  // —— Fault Tolerance tree ——
  'fault.errmodel':'Error Semantics', 'fault.errclass':'Recoverability Classes', 'fault.partialfail':'Partial Failure',
  'fault.retry':'Retry & Backoff', 'fault.idempotent':'Idempotency Keys', 'fault.backoff':'Backoff Budget',
  'fault.degrade':'Degradation & Breakers', 'fault.circuit':'Circuit Breaker', 'fault.fallback':'Fallback Paths',
  // —— Compatibility tree ——
  'compat.apicontract':'API Contract', 'compat.semver':'Semantic Versioning', 'compat.depwindow':'Deprecation Window',
  'compat.dataevo':'Data Evolution', 'compat.schemamig':'Schema Migration', 'compat.dualread':'Dual Read/Write',
  'compat.protocol':'Protocol Negotiation', 'compat.verneg':'Version Negotiation', 'compat.capdetect':'Capability Detection',
  // —— Security tree ——
  'sec.inputline':'Input Defenses', 'sec.validate':'Validation & Sanitizing', 'sec.parsefuzz':'Parser Hardening',
  'sec.secretmgmt':'Keys & Trust', 'sec.keymgmt':'Key Rotation', 'sec.signing':'Signature Verification',
  'sec.supply':'Supply Chain', 'sec.depaudit':'Dependency Audit', 'sec.sandboxpol':'Sandbox Policy',
  // —— Privacy tree ——
  'priv.pii':'PII Governance', 'priv.piitag':'Field-Level Tagging', 'priv.minimize':'Data Minimization',
  'priv.datalife':'Data Lifecycle', 'priv.retention':'Retention Policy', 'priv.forget':'Right to Be Forgotten',
  'priv.residency':'Data Residency', 'priv.region':'Regional Residency', 'priv.xborder':'Cross-Border Transfer',
  // —— i18n / Accessibility tree ——
  'i18n.textsys':'Copy System', 'i18n.icu':'Plurals & Word Order', 'i18n.glossary':'Terminology Glossary',
  'i18n.layoutfit':'Layout Adaptation', 'i18n.rtl':'RTL Mirroring', 'i18n.textexpand':'Text Expansion',
  'i18n.a11y':'Accessibility', 'i18n.aria':'Semantic Annotation', 'i18n.keynav':'Keyboard Reachability',
  // —— Collaboration tree ——
  'collab.syncengine':'Sync Engine', 'collab.crdt':'CRDT Merging', 'collab.oplog':'Operation Log',
  'collab.presence':'Presence System', 'collab.cursors':'Multiplayer Cursors', 'collab.awareness':'State Broadcast',
  'collab.conflict':'Conflict Governance', 'collab.merge':'Semantic Merging', 'collab.offline':'Offline Replay',
  // —— Billing tree ——
  'bill.entitle':'Entitlement System', 'bill.plans':'Plan Matrix', 'bill.entitlecheck':'Entitlement Checks',
  'bill.quota':'Quotas & Rate Limits', 'bill.ratelimit':'Rate Limiting', 'bill.quotacount':'Usage Counting',
  'bill.meter':'Metering & Billing', 'bill.usagemeter':'Usage Reporting', 'bill.billevent':'Billing Events',
  // —— Multi-tenancy tree ——
  'tenant.isolation':'Isolation Model', 'tenant.dataisol':'Data Isolation', 'tenant.noisy':'Noisy Neighbors',
  'tenant.tcfg':'Tenant Configuration', 'tenant.percfg':'Per-Tenant Overrides', 'tenant.tenantflag':'Tenant-Level Flags',
  'tenant.sharding':'Shard Routing', 'tenant.shardkey':'Shard Keys', 'tenant.rebalance':'Rebalancing',
};
