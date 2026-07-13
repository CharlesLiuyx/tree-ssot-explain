// 偶然交织(纯结构):需求把不同树的节点焊在一起——可以被策略消解。
// 字段:a/b 两端节点 gid(树id.节点id)、platform 平台化后的归属服务(见 platform.js)。
// 案例文案 why 在 src/i18n/locales/<语言>/tangles.js,键 = 'a|b',按当前语言水合。
// 新增案例:追加一行并在每个语言包登记文案;启动时会校验 a/b 节点存在。

import { L, req } from '../i18n/index.js';

export const TANGLES = [
  {a:'perf.cache', b:'authz.rowacl', platform:'authz'},
  {a:'perf.cache', b:'gate.canary', platform:'gate'},
  {a:'perf.cache', b:'arch.cfg', platform:'infra'},
  {a:'gate.flagcfg', b:'authz.apiauth', platform:'authz'},
  {a:'gate.canary', b:'arch.bus', platform:'gate'},
  {a:'perf.precompute', b:'authz.roleinherit', platform:'authz'},
  {a:'arch.ext', b:'gate.abtest', platform:'gate'},
  {a:'perf.batch', b:'authz.auditlog', platform:'audit'},
  {a:'arch.split', b:'perf.pool', platform:'infra'},
  {a:'gate.envisol', b:'arch.cfg', platform:'infra'},
  {a:'authz.mask', b:'perf.lazy', platform:'authz'},
  {a:'gate.metrics', b:'perf.pool', platform:'infra'},
  // 业务树被卷入的交织
  {a:'ui.lod', b:'perf.lazy', platform:'infra'},
  {a:'edit.snapshot', b:'perf.batch', platform:'infra'},
  {a:'ui.sandbox', b:'authz.apiauth', platform:'authz'},
  {a:'edit.macro', b:'gate.abtest', platform:'gate'},
  {a:'ui.keymap', b:'gate.flagcfg', platform:'gate'},
  {a:'edit.nondestruct', b:'authz.rowacl', platform:'authz'},
  {a:'edit.migrate', b:'gate.flagcfg', platform:'gate'},
  {a:'ui.layoutpersist', b:'edit.fileio', platform:'infra'},
  {a:'ui.progress', b:'perf.batch', platform:'infra'},
  // —— 可观测树 ——
  {a:'obs.logsample', b:'fault.retry', platform:'infra'},
  {a:'obs.traceprop', b:'arch.bus', platform:'infra'},
  {a:'obs.structlog', b:'authz.mask', platform:'audit'},
  {a:'obs.metricstd', b:'gate.abtest', platform:'audit'},
  // —— 并发树 ——
  {a:'conc.cancel', b:'edit.cmdops', platform:'infra'},
  {a:'conc.lockorder', b:'perf.pool', platform:'infra'},
  {a:'conc.workerpool', b:'edit.evalsched', platform:'infra'},
  // —— 容错树 ——
  {a:'fault.idempotent', b:'perf.batch', platform:'infra'},
  {a:'fault.circuit', b:'gate.flagcfg', platform:'gate'},
  {a:'fault.errclass', b:'edit.crashrec', platform:'infra'},
  {a:'fault.fallback', b:'authz.apiauth', platform:'authz'},
  // —— 兼容树 ——
  {a:'compat.dualread', b:'perf.cache', platform:'infra'},
  {a:'compat.semver', b:'ui.apicompat', platform:'infra'},
  {a:'compat.schemamig', b:'edit.migrate', platform:'infra'},
  {a:'compat.verneg', b:'collab.syncengine', platform:'infra'},
  // —— i18n / 无障碍树 ——
  {a:'i18n.textexpand', b:'ui.docking', platform:'infra'},
  {a:'i18n.keynav', b:'ui.keymap', platform:'infra'},
  {a:'i18n.icu', b:'gate.abtest', platform:'gate'},
  {a:'i18n.aria', b:'ui.custompanel', platform:'infra'},
  // —— 安全树 ——
  {a:'sec.sandboxpol', b:'ui.sandbox', platform:'authz'},
  {a:'sec.parsefuzz', b:'edit.fileio', platform:'infra'},
  {a:'sec.keymgmt', b:'arch.cfg', platform:'infra'},
  {a:'sec.depaudit', b:'compat.semver', platform:'infra'},
  // —— 协同树 ——
  {a:'collab.offline', b:'edit.autosave', platform:'infra'},
  {a:'collab.awareness', b:'perf.pool', platform:'infra'},
  {a:'collab.merge', b:'authz.rowacl', platform:'authz'},
  // —— 隐私树 ——
  {a:'priv.forget', b:'perf.cache', platform:'audit'},
  {a:'priv.retention', b:'obs.trace', platform:'audit'},
  {a:'priv.region', b:'tenant.shardkey', platform:'infra'},
  {a:'priv.piitag', b:'gate.metrics', platform:'audit'},
  // —— 计费树 ——
  {a:'bill.entitlecheck', b:'gate.flagcfg', platform:'gate'},
  {a:'bill.ratelimit', b:'perf.batch', platform:'infra'},
  {a:'bill.usagemeter', b:'obs.metricstd', platform:'audit'},
  {a:'bill.plans', b:'authz.rbac', platform:'authz'},
  // —— 多租户树 ——
  {a:'tenant.dataisol', b:'perf.cache', platform:'infra'},
  {a:'tenant.tenantflag', b:'gate.flagcfg', platform:'gate'},
  {a:'tenant.noisy', b:'conc.workerpool', platform:'infra'},
  {a:'tenant.percfg', b:'arch.cfg', platform:'infra'},
];

/* 文案水合:案例文案来自当前语言包(键 = 'a|b') */
for (const t of TANGLES) t.why = req(L.tangles, `${t.a}|${t.b}`, 'tangles');
