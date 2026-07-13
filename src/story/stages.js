// 叙事(结构):十步机位 + 底部导航名与文案的装配。
// cam [[相机位置],[目标点]](null = 运行时按焦点节点计算);
// chip/title/body 文案在 src/i18n/locales/<语言>/stages.js,按当前语言逐步合并。

import { L } from '../i18n/index.js';

const CAMS = [
  [[0,60,152],[0,6,-14]],   // STEP 0 总览
  [[-3,19,41],[-15,9.5,9]], // STEP 1 一棵树
  [[0,84,142],[0,0,-22]],   // STEP 2 多棵树
  [[0,66,126],[0,3,-20]],   // STEP 3 交织
  [[0,46,102],[0,4,-10]],   // STEP 4 引力
  [[0,118,138],[0,2,-22]],  // STEP 5 图外真相
  null,                     // STEP 6 崩塌:运行时按焦点节点计算
  [[0,48,112],[0,8,-16]],   // STEP 7 消解
  [[0,74,176],[0,6,-2]],    // STEP 8 法则
  [[0,68,120],[0,62,-22]],  // STEP 9 树之树
];

if (L.stages.length !== CAMS.length)
  throw new Error(`[i18n:${L.meta.code}] stages 文案 ${L.stages.length} 步,机位 ${CAMS.length} 步——两边必须一致`);

export const STAGES = L.stages.map((s, i) => ({ ...s, cam: CAMS[i] }));

export const DOT_NAMES = L.dotNames;
