// 导演:叙事推进的总调度。setStage 是唯一入口——
// 重置策略开关、重建场景状态、飞相机、重置视口历史、
// 驱动 STEP 3 的案例揭示(可拖动接管/一键全展示)与 STEP 4 的引力对点名轮播、STEP 8 的法则现场聚光。

import * as THREE from 'three';
import { FOCUS_ID, STAGE_DUR, MOVE_DUR } from '../config.js';
import { STAGES } from '../story/stages.js';
import { LAWS } from '../story/laws.js';
import { TANGLES } from '../data/tangles.js';
import { GRAVITY, GRAVITY_KINDS } from '../data/gravity.js';
import { state, stratOn, runtime } from '../core/state.js';
import { tween, easeOut } from '../core/tween.js';
import { V3 } from '../core/three-utils.js';
import { nodesById, nodeWorld } from '../core/registry.js';
import { controls, flyCamera, wake } from '../scene/context.js';
import { refreshTangleFlags, rebuildTangles, setOnTanglesRebuilt } from '../scene/tangles.js';
import { refreshNodes } from '../scene/appearance.js';
import { applyTreePositions, gatesGroup, radar } from '../scene/strategies-fx.js';
import { platformGroup, platLabelObj } from '../scene/platform.js';
import { buildCollapse, clearCollapse } from '../scene/collapse.js';
import { metaGroup, buildMetaTree, clearMeta } from '../scene/meta-tree.js';
import { $ } from '../ui/dom.js';
import { initPanel, renderPanel, renderStrats, setCaseBox, renderCaseCtrl, updateStats, renderMetaUI, renderLaws, renderGravList } from '../ui/panel.js';
import { initDots, renderDots } from '../ui/dots.js';
import { updateEntropy, setMeterVisible } from '../ui/entropy-meter.js';
import { initRotateToggle, renderRotateToggle } from '../ui/rotate-toggle.js';
import { vpReset, vpDepth } from './viewport-history.js';

let revealTimer = null, cycleTimer = null;
let platformWasVisible = false;

/* STEP 3/4 的揭示/轮播计时器是否在跑(主循环据此保持渲染) */
export const timersActive = () => !!(revealTimer || cycleTimer);

/* 把策略开关与阶段应用到全场景 */
export function applyState() {
  refreshTangleFlags();
  applyTreePositions();
  const platVis = stratOn('platform');
  if (platVis && !platformWasVisible) {
    platformGroup.visible = true; platformGroup.scale.setScalar(.01);
    // 弹出动画期间平台节点在移动:置 linkDirty 让金色纠缠线逐帧跟随(重建已是就地写缓冲,开销可忽略)
    tween(MOVE_DUR, k => { platformGroup.scale.setScalar(.01 + .99 * k); runtime.linkDirty = true; });
  }
  platformGroup.visible = platVis;
  platformWasVisible = platVis;
  if (platLabelObj) platLabelObj.visible = platVis;
  gatesGroup.visible = stratOn('layer');
  radar.visible = stratOn('loops');
  rebuildTangles();
  refreshNodes();
  updateEntropy();
}

function cancelTimers() {
  if (revealTimer) { clearInterval(revealTimer); revealTimer = null; }
  if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
  runtime.highlightTangle = -1;
  runtime.highlightGravity = -1;
}

/* STEP 3:把揭示进度定格到第 n 条(0 = 尚未开始)。自动播放与手动拖动共用同一入口;
   拉满(n = 59)即视为「全展示」——停止自动揭示,此后不再轮播。 */
function applyReveal(n) {
  state.revealed = Math.max(0, Math.min(TANGLES.length, n));
  const full = state.revealed >= TANGLES.length;
  runtime.highlightTangle = full ? -1 : state.revealed - 1; // 全展示后画面安定,不再呼吸高亮
  if (state.revealed === 0) {
    setCaseBox('<span class="dim">纠缠正在产生……</span>');
  } else {
    const t = TANGLES[state.revealed - 1];
    setCaseBox(`<b>案例 ${state.revealed}/${TANGLES.length}</b>　${t.aName} ↔ ${t.bName}<br>${t.why}` +
      (full ? `<br><span class="dim">✓ ${TANGLES.length} 条已全部展示——不再轮播,拖动进度条可回看任意一条</span>` : ''));
  }
  refreshTangleFlags(); rebuildTangles(); refreshNodes(); updateEntropy();
  renderCaseCtrl();
  if (full && revealTimer) { clearInterval(revealTimer); revealTimer = null; }
}

/* 手动拖动进度条 / 点「全展示」:接管播放(自动揭示停止),定格到第 n 条 */
function scrubCases(n) {
  if (state.stage !== 3) return;
  if (revealTimer) { clearInterval(revealTimer); revealTimer = null; }
  applyReveal(n);
  wake(900);
}

/* STEP 4:案例栏点名一对引力(场景里对应光束增亮、节点呼吸、中点浮出标签),列表同步高亮 */
function showGravityCase(i) {
  runtime.highlightGravity = i;
  const g = GRAVITY[i];
  setCaseBox(`<b>引力对 ${i + 1}/${GRAVITY.length}</b>　${g.aName} ⚡ ${g.bName}` +
    `<span class="gkind">${GRAVITY_KINDS[g.kind]}</span><br>${g.why}`);
  renderGravList();
}

/* 点击列表某一对:立即点名,并从这一对起重新轮播 */
function pickGravityCase(i) {
  if (state.stage !== 4) return;
  if (cycleTimer) clearInterval(cycleTimer);
  let gi = i;
  showGravityCase(i);
  cycleTimer = setInterval(() => { gi = (gi + 1) % GRAVITY.length; showGravityCase(gi); }, 5200);
  wake(2800);
}

// 自动旋转 = 用户意图 × 当前步骤(仅总览自动旋转;用户可随时暂停/恢复,意图跨步骤保留)
let autoRotateWanted = true;
export function syncRotate() {
  controls.autoRotate = autoRotateWanted && state.stage === 0 && vpDepth() === 0; // Zoom in 聚焦时不自转
  renderRotateToggle({ visible: state.stage === 0, wanted: autoRotateWanted });
}
export function toggleAutoRotate() { autoRotateWanted = !autoRotateWanted; syncRotate(); }

export function setStage(n) {
  cancelTimers();
  wake(2800);          // 换步会触发飞行/形变/熵值动画,唤醒足够时长让其收敛
  state.stage = n;
  runtime.lawFocus = ''; runtime.lawFocusUntil = 0; // STEP 8 的法则聚光不跨步骤保留
  // 手术开关 = 当前步骤的纯函数:仅第 8 步(终态)全开,其余步骤(含刚进入的第 7 步)一律清零。
  // 于是无论从哪个方向进入某一步,其状态都可复现——从第 8 步 ← 退回第 7 步会回到干净的可操作起点,
  // 不会残留「全开」,避免「进入后续状态后就退不回之前状态」的单向性。
  Object.keys(state.strat).forEach(k => state.strat[k] = (n === 8));
  state.revealed = n === 3 ? 0 : TANGLES.length;
  renderPanel(); renderDots(); renderStrats();
  $('vignette').classList.toggle('danger', n === 6);
  setMeterVisible(n !== 9); // 树之树看的是生长顺序,不看熵
  syncRotate();

  // 树之树:进入即重新生长;离开即拆除(含 2D 标签)
  if (n === 9) { metaGroup.visible = true; buildMetaTree(); }
  else if (metaGroup.visible) { metaGroup.visible = false; clearMeta(); }

  // 引力强度随阶段推进(总览预告 + 引力阶段之后常驻;树之树阶段回收)。
  // 消隐必须跟上 150ms 的切步转场——洋红交织信息在换步瞬间同步退场;出现稍缓,留出「被吸住」的过程感。
  const gTarget = (n === 0 || (n >= 4 && n !== 9)) ? 1 : 0;
  if (Math.abs(gTarget - runtime.gravityPull) > .01) {
    const g0 = runtime.gravityPull;
    tween(gTarget ? .5 : STAGE_DUR, k => { runtime.gravityPull = g0 + (gTarget - g0) * k; runtime.linkDirty = true; }, () => { runtime.linkDirty = true; refreshNodes(); });
  }

  let camPos, camTgt;
  if (n === 6) {
    applyState(); buildCollapse();
    const fp = nodeWorld(nodesById.get(FOCUS_ID), new THREE.Vector3());
    camPos = fp.clone().add(V3(15, 11, 26)); camTgt = fp.clone().add(V3(-2, 4, 0));
    flyCamera(camPos, camTgt, STAGE_DUR, easeOut);
  } else {
    clearCollapse(); applyState();
    const c = STAGES[n].cam;
    camPos = V3(...c[0]); camTgt = V3(...c[1]);
    flyCamera(camPos, camTgt, STAGE_DUR, easeOut);
  }
  // 每切一步 = 一棵新的视口历史树,根 = 本步的起始视角
  vpReset(camPos, camTgt, STAGES[n].chip.split('·').pop().trim());

  if (n === 3) { // 逐条揭示偶然交织(59 条,快节奏揭示;进度条可随时拖动接管,揭示完毕停格不轮播)
    revealTimer = setInterval(() => applyReveal(state.revealed + 1), 420);
  }

  if (n === 4) { // 引力对逐一点名轮播(相机不动,场景里对应光束增亮)
    let gi = 0;
    showGravityCase(0);
    cycleTimer = setInterval(() => { gi = (gi + 1) % GRAVITY.length; showGravityCase(gi); }, 5200);
  }
}

/* STEP 8:点击法则卡片 → 镜头飞到该法则的活现场,现场元素聚光脉冲若干秒;再点一次收回全景。
   脉冲有截止时间:到期后场景自动安定下来,渲染循环照常休眠(空闲零 CPU 的原则不破)。 */
export function focusLaw(k) {
  if (state.stage !== 8) return;
  const law = LAWS.find(l => l.k === k);
  if (!law || runtime.lawFocus === k) { // 再点当前卡片:回到全景
    runtime.lawFocus = ''; runtime.lawFocusUntil = 0;
    const c = STAGES[8].cam;
    flyCamera(V3(...c[0]), V3(...c[1]), MOVE_DUR, easeOut);
    wake(2200);
  } else {
    runtime.lawFocus = k;
    runtime.lawFocusUntil = performance.now() + 6500;
    flyCamera(V3(...law.cam[0]), V3(...law.cam[1]), MOVE_DUR, easeOut);
    wake(7200); // 比脉冲多留一点:让聚光元素在最后一帧安定复位
  }
  renderLaws();
}

export const nextStage = () => setStage((state.stage + 1) % STAGES.length);
export const prevStage = () => setStage(Math.max(0, state.stage - 1));

/* 装配 UI 回调与纠缠重建后的统计刷新 */
export function initDirector() {
  setOnTanglesRebuilt(updateStats);
  initPanel({
    onPrev: prevStage,
    onNext: nextStage,
    onStratToggle: k => {
      state.strat[k] = !state.strat[k];
      if (k === 'layer') { // 分层重排场面变大:相机跟着推远/收回(与树位移同节奏)
        if (state.strat.layer) flyCamera(V3(0, 62, 182), V3(0, 10, 0), MOVE_DUR, easeOut);
        else flyCamera(V3(0, 48, 112), V3(0, 8, -16), MOVE_DUR, easeOut);
      }
      applyState(); renderStrats();
    },
    onGravPick: pickGravityCase,
    onCaseScrub: scrubCases,
    onLaw: focusLaw,
    onMetaPath: i => { runtime.metaPathIdx = i; buildMetaTree(); renderMetaUI(); },
  });
  initDots(setStage);
  initRotateToggle(toggleAutoRotate);
}
