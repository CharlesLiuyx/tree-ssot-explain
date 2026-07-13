// 七种手术(纯结构):STEP 7 的策略开关。
// STRAT_FACTORS:开启后语义熵的乘法因子(0.65 = 降 35%);STRATS 的按钮文案来自语言包,
// pct(「−35%」)由因子推导——数值只有一个出处。
// k 是策略键,同时被 core/state.js(开关状态)与 scene 各系统(视觉效果)引用。

import { L, req } from '../i18n/index.js';

export const STRAT_FACTORS = { layer: .65, sdd: .75, tdd: .8, loops: .85, platform: .5, fusion: .85, explicit: .6 };

export const STRATS = Object.keys(STRAT_FACTORS).map(k => {
  const t = req(L.strategies, k, 'strategies');
  return { k, name: t.name, desc: t.desc, pct: `−${Math.round((1 - STRAT_FACTORS[k]) * 100)}%` };
});
