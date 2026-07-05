// 主循环:只做调度——帧率门控、逐系统 update、渲染、画质自适应。
// 空闲即停渲染(不自转/无动画/无近期交互时直接 return,CPU 归零);
// 环境 30fps / 交互(拖拽·缩放·切步)临时 60fps;后台标签页不渲染。

import { renderer, css2d, scene, camera, controls, clock,
  wakeUntil, smoothUntil, degradeQuality, pixelRatio, AMBIENT_FPS, SMOOTH_FPS } from '../scene/context.js';
import { tweens, stepTweens } from '../core/tween.js';
import { spinners, pulses, rootRings } from '../core/registry.js';
import { stratOn, runtime } from '../core/state.js';
import { updateGravity } from '../scene/gravity.js';
import { updateGhosts } from '../scene/ghosts.js';
import { updateMeta, metaGroup } from '../scene/meta-tree.js';
import { rebuildTangles, updateTangleHighlight } from '../scene/tangles.js';
import { updateCollapse } from '../scene/collapse.js';
import { radar } from '../scene/strategies-fx.js';
import { timersActive } from './director.js';
import { doHover } from './hover.js';
import { paintEntropy } from '../ui/entropy-meter.js';

let frame = 0;
// 自适应画质:测「每帧实际渲染耗时」(不受帧率上限影响),持续跟不上才逐级降像素比,只降不升。
let _workMs = 8, _lastUpdMs = performance.now(), _lastFrameMs = 0;
function adaptQuality() {
  if (frame < 90 || frame % 45 !== 0 || pixelRatio() <= 1) return;
  if (_workMs > 26) { // 单帧渲染 >26ms(连 ~38fps 都吃不住)→ 降一档
    if (degradeQuality()) _workMs = 8;
  }
}
// 场景是否需要继续渲染:自转 / 动画补间 / 近期交互 / stage3 揭示轮播 / stage9 生长——都不满足则静止停渲染。
function sceneActive(now) {
  return controls.autoRotate || tweens.size > 0 || now < wakeUntil() || timersActive() || metaGroup.visible;
}

function animate() {
  requestAnimationFrame(animate);
  if (document.hidden) return;        // 后台标签页:不渲染
  const nowMs = performance.now();
  if (!sceneActive(nowMs)) { _lastUpdMs = nowMs; return; }          // 完全静止 → 停渲染,CPU 归零
  const frameMs = (tweens.size > 0 || nowMs < smoothUntil()) ? (1000 / SMOOTH_FPS) : (1000 / AMBIENT_FPS);
  if (nowMs - _lastFrameMs < frameMs - 1.5) return;                 // 帧率上限(环境 30 / 交互 60)
  _lastFrameMs = nowMs;
  const dt = Math.min(.05, (nowMs - _lastUpdMs) / 1000); _lastUpdMs = nowMs; const fk = dt * 60; // fk:把「按帧累加」的量归一到 60fps 基准

  const t = clock.getElapsedTime();
  stepTweens();
  updateGravity(t);
  updateGhosts(t);
  updateMeta(t);
  if (runtime.linkDirty) { rebuildTangles(); runtime.linkDirty = false; }
  controls.update(dt);             // 传真实时间步 → 自转速度与帧率无关

  for (const s of spinners) if (s.obj.visible) s.obj.rotateOnAxis(s.axis, s.speed * .016 * fk); // 隐藏对象不空转;按 fk 归一

  // SDD 脉冲(端点实时读取,跟随引力形变)
  const sdd = stratOn('sdd');
  for (const p of pulses) {
    p.dot.visible = sdd;
    if (sdd) {
      const k = (t * .3 + p.phase) % 1;
      p.dot.position.lerpVectors(p.e.na.mesh.position, p.e.nb.mesh.position, k);
      p.dot.material.opacity = .9 * Math.sin(k * Math.PI);
    }
  }
  for (const r of rootRings) if (r.visible) { const s = 1 + .18 * Math.sin(t * 2.4); r.scale.setScalar(s); }

  if (radar.visible) radar.rotation.z = t * .5;

  updateCollapse(t, fk);
  updateTangleHighlight(t);

  if (frame % 2 === 0) doHover();
  paintEntropy();
  frame++;
  renderer.render(scene, camera);
  css2d.render(scene, camera);
  _workMs += ((performance.now() - nowMs) - _workMs) * .1; // EMA 单帧实际耗时,供 adaptQuality 判断真实压力
  adaptQuality();
}

export function startLoop() { animate(); }
