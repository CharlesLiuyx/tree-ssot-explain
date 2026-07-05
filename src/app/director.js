// 导演:叙事推进的总调度。setStage 是唯一入口——
// 重置策略开关、重建场景状态、飞相机、重置视口历史、驱动 STEP 3 的案例揭示与轮播。

import * as THREE from 'three';
import { FOCUS_ID } from '../config.js';
import { STAGES } from '../story/stages.js';
import { TANGLES } from '../data/tangles.js';
import { state, stratOn, runtime } from '../core/state.js';
import { tween } from '../core/tween.js';
import { V3 } from '../core/three-utils.js';
import { nodesById } from '../core/registry.js';
import { controls, flyCamera, wake } from '../scene/context.js';
import { refreshTangleFlags, rebuildTangles, setOnTanglesRebuilt } from '../scene/tangles.js';
import { refreshNodes } from '../scene/appearance.js';
import { applyTreePositions, gatesGroup, radar } from '../scene/strategies-fx.js';
import { platformGroup, platLabelObj } from '../scene/platform.js';
import { buildCollapse, clearCollapse } from '../scene/collapse.js';
import { metaGroup, buildMetaTree, clearMeta } from '../scene/meta-tree.js';
import { $ } from '../ui/dom.js';
import { initPanel, renderPanel, renderStrats, setCaseBox, updateStats, renderMetaUI } from '../ui/panel.js';
import { initDots, renderDots } from '../ui/dots.js';
import { updateEntropy, setMeterVisible } from '../ui/entropy-meter.js';
import { initRotateToggle, renderRotateToggle } from '../ui/rotate-toggle.js';
import { vpReset, vpDepth } from './viewport-history.js';

let revealTimer = null, cycleTimer = null;
let platformWasVisible = false;

/* STEP 3 的揭示/轮播计时器是否在跑(主循环据此保持渲染) */
export const timersActive = () => !!(revealTimer || cycleTimer);

/* 把策略开关与阶段应用到全场景 */
export function applyState() {
  refreshTangleFlags();
  applyTreePositions();
  const platVis = stratOn('platform');
  if (platVis && !platformWasVisible) {
    platformGroup.visible = true; platformGroup.scale.setScalar(.01);
    tween(.9, k => platformGroup.scale.setScalar(.01 + .99 * k));
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
  // 手术开关 = 当前步骤的纯函数:仅第 8 步(终态)全开,其余步骤(含刚进入的第 7 步)一律清零。
  // 于是无论从哪个方向进入某一步,其状态都可复现——从第 8 步 ← 退回第 7 步会回到干净的可操作起点,
  // 不会残留「全开」,避免「进入后续状态后就退不回之前状态」的单向性。
  Object.keys(state.strat).forEach(k => state.strat[k] = (n === 8));
  state.revealed = n === 3 ? 0 : TANGLES.length;
  renderPanel(); renderDots(); renderStrats();
  $('vignette').classList.toggle('danger', n === 6);
  setMeterVisible(n !== 9); // 树之树看的是生长顺序,不看熵
  syncRotate();

  // 树之树:进入即重新生长;离开即拆除(含 CSS2D 标签)
  if (n === 9) { metaGroup.visible = true; buildMetaTree(); }
  else if (metaGroup.visible) { metaGroup.visible = false; clearMeta(); }

  // 引力强度随阶段推进(总览预告 + 引力阶段之后常驻;树之树阶段回收)
  const gTarget = (n === 0 || (n >= 4 && n !== 9)) ? 1 : 0;
  if (Math.abs(gTarget - runtime.gravityPull) > .01) {
    const g0 = runtime.gravityPull;
    tween(1.6, k => { runtime.gravityPull = g0 + (gTarget - g0) * k; runtime.linkDirty = true; }, () => { runtime.linkDirty = true; refreshNodes(); });
  }

  let camPos, camTgt;
  if (n === 6) {
    applyState(); buildCollapse();
    const fp = nodesById.get(FOCUS_ID).mesh.getWorldPosition(new THREE.Vector3());
    camPos = fp.clone().add(V3(15, 11, 26)); camTgt = fp.clone().add(V3(-2, 4, 0));
    flyCamera(camPos, camTgt, 1.8);
  } else {
    clearCollapse(); applyState();
    const c = STAGES[n].cam;
    camPos = V3(...c[0]); camTgt = V3(...c[1]);
    flyCamera(camPos, camTgt, 1.7);
  }
  // 每切一步 = 一棵新的视口历史树,根 = 本步的起始视角
  vpReset(camPos, camTgt, STAGES[n].chip.split('·').pop().trim());

  if (n === 3) { // 逐条揭示偶然交织(59 条,快节奏揭示)
    revealTimer = setInterval(() => {
      state.revealed++;
      const t = TANGLES[state.revealed - 1];
      setCaseBox(`<b>案例 ${state.revealed}/${TANGLES.length}</b>　${t.aName} ↔ ${t.bName}<br>${t.why}`);
      runtime.highlightTangle = state.revealed - 1;
      refreshTangleFlags(); rebuildTangles(); refreshNodes(); updateEntropy();
      if (state.revealed >= TANGLES.length) {
        clearInterval(revealTimer); revealTimer = null;
        let ci = 0;
        cycleTimer = setInterval(() => {
          ci = (ci + 1) % TANGLES.length;
          const t2 = TANGLES[ci]; runtime.highlightTangle = ci;
          setCaseBox(`<b>案例 ${ci + 1}/${TANGLES.length}</b>　${t2.aName} ↔ ${t2.bName}<br>${t2.why}`);
        }, 4500);
      }
    }, 420);
  }
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
      if (k === 'layer') { // 分层重排场面变大:相机跟着推远/收回
        if (state.strat.layer) flyCamera(V3(0, 62, 182), V3(0, 10, 0), 1.6);
        else flyCamera(V3(0, 48, 112), V3(0, 8, -16), 1.6);
      }
      applyState(); renderStrats();
    },
    onMetaPath: i => { runtime.metaPathIdx = i; buildMetaTree(); renderMetaUI(); },
  });
  initDots(setStage);
  initRotateToggle(toggleAutoRotate);
}
