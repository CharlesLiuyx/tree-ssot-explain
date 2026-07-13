// 本征耦合 · 引力对(纯结构):问题本身要求这些节点在一起——势必靠近,无法远离。
// 字段:a/b 两端节点 gid、kind 长法(mirror 互为镜像 | faces 一体两面 | halves 同一机制的两半)。
// 「为什么拆不开」与长法名称在 src/i18n/locales/<语言>/gravity.js,按当前语言水合。
// 注意:一个节点最多属于一对引力(登记时 node.gravity 会被覆盖),新增时勿复用已登记节点。

import { L, req } from '../i18n/index.js';

export const GRAVITY_KINDS = {};      // kind → 长法名称
export const GRAVITY_KIND_DESC = {};  // kind → 长法副题
for (const k of ['mirror', 'faces', 'halves']) {
  const t = req(L.gravityKinds, k, 'gravityKinds');
  GRAVITY_KINDS[k] = t.name;
  GRAVITY_KIND_DESC[k] = t.desc;
}

export const GRAVITY = [
  // —— 互为镜像:改一边必改另一边 ——
  {a:'edit.undo', b:'ui.command', kind:'mirror'},
  {a:'edit.dirtyprop', b:'perf.invalidate', kind:'mirror'},
  {a:'edit.modes', b:'ui.ctxscope', kind:'mirror'},
  {a:'conc.mainthread', b:'ui.dirtyrect', kind:'mirror'},
  // —— 一体两面:同一份状态的两个投影 ——
  {a:'edit.selset', b:'ui.gizmo', kind:'faces'},
  {a:'edit.depsgraph', b:'ui.realtime', kind:'faces'},
  {a:'edit.multisel', b:'ui.multiedit', kind:'faces'},
  {a:'collab.cursors', b:'edit.active', kind:'faces'},
  // —— 同一机制的两半:合起来才是一个完整的东西 ——
  {a:'ui.pluginapi', b:'arch.ext', kind:'halves'},
  {a:'collab.oplog', b:'edit.snapshot', kind:'halves'},
  {a:'collab.crdt', b:'edit.datablock', kind:'halves'},
  {a:'fault.idempotent', b:'bill.billevent', kind:'halves'},
];

/* 文案水合:每对「为什么拆不开」来自当前语言包(键 = 'a|b') */
for (const g of GRAVITY) g.why = req(L.gravityPairs, `${g.a}|${g.b}`, 'gravityPairs');
