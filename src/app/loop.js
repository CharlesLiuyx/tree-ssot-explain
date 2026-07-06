// 主循环:只做调度——帧率门控、逐系统 update、渲染、画质自适应。
// 空闲即停渲染(不自转/无动画/无近期交互时直接 return,CPU 归零);
// 环境 60fps / 交互(拖拽·缩放·切步)放开到刷新率(封 120);后台标签页不渲染;
// 机器跟不上时自适应降档(像素比 → 环境帧率)。

import { renderer, scene, camera, controls, clock,
  wakeUntil, smoothUntil, degradeQuality, ambientFps, SMOOTH_FPS } from '../scene/context.js';
import { tweens, stepTweens } from '../core/tween.js';
import { spinners } from '../core/registry.js';
import { runtime } from '../core/state.js';
import { updatePools } from '../scene/pools.js';
import { updateGravity } from '../scene/gravity.js';
import { updateGhosts } from '../scene/ghosts.js';
import { updateLawFx } from '../scene/law-fx.js';
import { updateMeta, metaActive } from '../scene/meta-tree.js';
import { rebuildTangles, updateTangleHighlight } from '../scene/tangles.js';
import { updateCollapse } from '../scene/collapse.js';
import { radar } from '../scene/strategies-fx.js';
import { renderLabels } from '../scene/labels.js';
import { timersActive } from './director.js';
import { doHover } from './hover.js';
import { paintEntropy } from '../ui/entropy-meter.js';

let frame = 0;
// 自适应画质:测「每帧实际渲染耗时」(不受帧率上限影响),持续跟不上才逐级降档,只降不升。
let _workMs = 4, _lastUpdMs = performance.now(), _lastFrameMs = 0;
function adaptQuality() {
  if (frame < 90 || frame % 45 !== 0) return;
  if (_workMs > 12) { // 单帧 >12ms(60fps 预算的七成)→ 降一档
    if (degradeQuality()) _workMs = 4;
  }
}
// 场景是否需要继续渲染:自转 / 动画补间 / 近期交互 / stage3-4 播放计时器 / stage9 正在生长——
// 都不满足则静止停渲染。所有自动播放均需点击才开始,故页面默认态就是零渲染。
function sceneActive(now) {
  return controls.autoRotate || tweens.size > 0 || now < wakeUntil() || timersActive() || metaActive();
}

function animate() {
  requestAnimationFrame(animate);
  if (document.hidden) return;        // 后台标签页:不渲染
  const nowMs = performance.now();
  if (!sceneActive(nowMs)) { _lastUpdMs = nowMs; return; }          // 完全静止 → 停渲染,CPU 归零
  const frameMs = (tweens.size > 0 || nowMs < smoothUntil()) ? (1000 / SMOOTH_FPS) : (1000 / ambientFps());
  if (nowMs - _lastFrameMs < frameMs - 1.5) return;                 // 帧率上限(环境 / 交互)
  _lastFrameMs = nowMs;
  const dt = Math.min(.05, (nowMs - _lastUpdMs) / 1000); _lastUpdMs = nowMs; const fk = dt * 60; // fk:把「按帧累加」的量归一到 60fps 基准

  const t = clock.getElapsedTime();
  stepTweens();
  updateGravity(t, dt);            // 节点位移时会置 runtime.linkDirty
  updateGhosts(t, dt);
  updateLawFx(t);                  // 法则聚光:叠加在引力/幽灵根每帧重写的透明度之上,必须在其后
  updateMeta(t, dt);
  const moved = runtime.linkDirty;
  if (moved) { rebuildTangles(); runtime.linkDirty = false; }
  updatePools(t, moved);           // 实例矩阵同步:节点(位移帧)+ 装饰(自旋/开关)+ SDD 脉冲
  controls.update(dt);             // 传真实时间步 → 自转速度与帧率无关

  for (const s of spinners) if (s.obj.visible) s.obj.rotateOnAxis(s.axis, s.speed * .016 * fk); // 平台根环/AI 球壳/幽灵根

  if (radar.visible) radar.rotation.z = t * .5;

  updateCollapse(t, fk);
  updateTangleHighlight(t);

  if (frame % 2 === 0) doHover();
  paintEntropy(dt);
  frame++;
  renderer.render(scene, camera);
  renderLabels(camera);
  _workMs += ((performance.now() - nowMs) - _workMs) * .1; // EMA 单帧实际耗时,供 adaptQuality 判断真实压力
  adaptQuality();
}

export function startLoop() { animate(); }
