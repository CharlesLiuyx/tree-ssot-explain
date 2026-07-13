// 幽灵根 · 图外真相(纯结构):这些节点的真正 SSOT 不在仓库里——AI 从文本静态读不到。
// 字段:pos 相对仓库边界中心(config.BOUNDARY_CENTER)的位置,半径需大于边界圆环(94);
//       t 被牵住的节点 gid 列表。名称/事故文案/显式化出路在 src/i18n/locales/<语言>/ghosts.js。

import { L, req } from '../i18n/index.js';

export const GHOSTS = [
  {id:'di',     pos:[-112,15,42],  t:['arch.di','ui.pluginapi']},
  {id:'bus',    pos:[-92,20,-64],  t:['arch.bus','ui.twoway']},
  {id:'disk',   pos:[112,16,44],   t:['edit.fileio','edit.scenegraph']},
  {id:'deploy', pos:[94,21,-66],   t:['arch.cfg','gate.envisol']},
  {id:'hyrum',  pos:[6,26,-114],   t:['compat.apicontract','ui.apicompat']},
];

/* 文案水合:n 名称 / why 事故文案 / fix 显式化出路,来自当前语言包(键 = id) */
for (const g of GHOSTS) Object.assign(g, req(L.ghosts, g.id, 'ghosts'));
