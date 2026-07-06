// 全局常量:调色板、树形体型、布局锚点、叙事焦点。
// 纯数据、零依赖——任何层都可以引用。

/* 调色板(3D 材质用 hex number;CSS 侧在 styles/base.css 的 :root 变量里另有同色值) */
export const GOLD = 0xffd166, RED = 0xff4d6d, GREEN = 0x5dd39e, AMBER = 0xffb84d,
  PLAT = 0xf3e9c8, GREY = 0x9ad1b6, MAGENTA = 0xff2fd0, GHOSTC = 0x7de8ff;

/* 两种树形体型:业务树(biz)更高、可长到 5 层;横切树(cross)浅而拉通 */
export const LVL = {
  biz:  { Y: [19, 13.6, 8.8, 4.2, 1.0], R: [0, 5.2, 9.4, 11.6, 12.6], S: [1.05, .7, .53, .42, .33] },
  cross:{ Y: [15, 9.8, 4.9, .9],        R: [0, 4.6, 8.8, 12.2],       S: [1.05, .68, .5, .4] },
};
export const lvlOf = (kind, level) => {
  const t = LVL[kind] || LVL.cross, i = Math.min(level, t.Y.length - 1);
  return { y: t.Y[i], r: t.R[i], s: t.S[i] };
};

/* 分层墙的 x 坐标(「分层」策略下 8 层 × 前后 2 排的层间分界) */
export const WALL_XS = [-75, -50, -25, 0, 25, 50, 75];

/* 仓库边界中心:幽灵根系统与树之树(STEP 9)共用的场景锚点 */
export const BOUNDARY_CENTER = [0, 0, -22];

/* 崩塌阶段(STEP 6)的叙事焦点:被 7 个含义压垮的「缓存策略」节点及其上下文集合 */
export const FOCUS_ID = 'perf.cache';
export const FOCUS_SET = new Set([FOCUS_ID, 'authz.rowacl', 'gate.canary', 'arch.cfg', 'perf.root',
  'compat.dualread', 'priv.forget', 'tenant.dataisol']);

/* 动效时长(秒):所有转场与移动都要清爽、快速 */
export const FAST_DUR = 0.12;   // 视口导航(点击 Zoom in / 返回)
export const STAGE_DUR = 0.15;  // 叙事切步转场(相机飞行 ≤150ms;引力等步进信息同步消隐)
export const MOVE_DUR = 0.45;   // 场内位移与引导飞行(分层排布/平台弹出/法则现场)

/* 视口历史(点击 Zoom in) */
export const VP_MAX = 30;      // 视口总数上限,超过即触发 LRU 垃圾回收
