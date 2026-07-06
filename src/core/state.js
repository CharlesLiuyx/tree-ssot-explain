// 全局状态(SSOT):叙事状态 state + 跨系统运行时标志 runtime。
// 各系统间需要互通的可变量一律收敛到这里——不允许散落的隐式全局。

import { STRATS } from '../data/strategies.js';

/* 叙事状态:stage 当前步骤(0..9)、strat 七种手术开关、revealed STEP 3 已揭示的交织数 */
export const state = {
  stage: 0,
  strat: Object.fromEntries(STRATS.map(s => [s.k, false])),
  revealed: 0,
};

/* 策略是否生效 = 开关打开 且 处于消解/法则阶段 */
export function stratOn(k) { return state.strat[k] && state.stage >= 7; }

/* 跨系统运行时标志(写方 → 读方):
   gravityPull      0..1 引力强度,导演推进 → 引力/外观/悬停详情
   linkDirty        节点/树在移动,纠缠线与实例矩阵需重同步:引力/分层/平台动画 → 主循环
   hovered          当前悬停的对象(节点记录/纠缠/引力对/幽灵根/元节点):悬停系统 → 幽灵根(闪烁让位)
   hoveredKind      悬停对象类别('node'|'tangle'|'gravity'|'ghost'|'meta')
   highlightTangle  STEP 3 正在高亮的案例序号:导演 → 主循环
   highlightGravity STEP 4 案例栏正在点名的引力对序号:导演 → 引力系统(光束增亮/节点呼吸)
   tangleCounts     纠缠线分类计数:纠缠系统 → 策略统计栏
   metaPathIdx      STEP 9 当前演化路径:路径切换 → 树之树/面板 */
export const runtime = {
  gravityPull: 0,
  linkDirty: false,
  hovered: null,
  hoveredKind: '',
  highlightTangle: -1,
  highlightGravity: -1,
  tangleCounts: { red: 0, amber: 0, grey: 0, plat: 0 },
  metaPathIdx: 0,
  lawFocus: '',      // STEP 8 当前选中的法则 k(空 = 全景视角)
  lawFocusUntil: 0,  // 法则聚光脉冲的截止时间戳(到期后场景高亮自动复位)
};

/* 法则聚光是否仍在脉冲期:返回法则 k 或 ''(scene 各系统据此点亮对应元素) */
export function lawPulseK() {
  return runtime.lawFocus && performance.now() < runtime.lawFocusUntil ? runtime.lawFocus : '';
}
