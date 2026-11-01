// 主循环:只做调度——帧率门控、逐系统 update、渲染、画质自适应。
// 空闲即停渲染(不自转/无动画/无近期交互时直接 return,CPU 归零);
// 环境 60fps / 交互(拖拽·缩放·切步)放开到刷新率(封 120);后台标签页不渲染;
// 画布手势期间临时降 dpr 换满帧,手势结束恢复满分辨率并立即补渲一帧(applyInteractDpr);
// 机器跟不上时自适应降档(像素比 → 环境帧率):CPU 侧看单帧实际耗时,GPU 侧看 rAF 节拍被拉长。

import { renderer, scene, camera, controls, clock,
  wakeUntil, smoothUntil, degradeQuality, ambientFps, SMOOTH_FPS,
  applyInteractDpr, dprLowered } from '../scene/context.js';
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
// 自适应画质:持续跟不上才逐级降档,只降不升。两路信号:
// ① CPU:每帧实际耗时 _workMs(不受帧率上限影响);
// ② GPU:rAF 节拍。renderer.render 把命令交给 GPU 后立即返回,片元受限(Retina 全屏 + 大面积 additive 透明)
//    在 CPU 耗时上完全看不见,只会表现为合成器等不到帧、rAF 间隔被拉长。
//    以「见过的最短 rAF 间隔」当显示器节拍基线(GPU 压力只会拉长间隔,不会缩短),
//    渲染期 EMA 间隔持续超过基线 1.6 倍(且低于 ~45fps)即判定 GPU 跟不上。
let _workMs = 4, _lastUpdMs = performance.now(), _lastFrameMs = 0;
let _rafPrev = 0, _rafBase = Infinity, _rafEma = 0, _activeRun = 0;
function trackRaf(nowMs) {
  const gap = _rafPrev ? nowMs - _rafPrev : 0;
  _rafPrev = nowMs;
  if (gap >= 4 && gap <= 40 && gap < _rafBase) _rafBase = gap; // 学习显示器节拍(60Hz≈16.7 / 120Hz≈8.3);过长的是切标签页/卡顿,不算
  return gap;
}
function adaptQuality() {
  if (frame < 90 || frame % 45 !== 0) return;
  const gpuBound = _activeRun > 90 && _rafBase < 100 && _rafEma > Math.max(_rafBase * 1.6, 22);
  if (_workMs > 12 || gpuBound) { // CPU 单帧 >12ms(60fps 预算的七成)或 GPU 掉帧 → 降一档
    if (degradeQuality()) { _workMs = 4; _rafEma = _rafBase; }
  }
}
// 场景是否需要继续渲染:自转 / 动画补间 / 近期交互 / stage3-4 播放计时器 / stage9 正在生长——
// 都不满足则静止停渲染。所有自动播放均需点击才开始,故页面默认态就是零渲染。
function sceneActive(now) {
  return controls.autoRotate || tweens.size > 0 || now < wakeUntil() || timersActive() || metaActive();
}

function animate() {
  requestAnimationFrame(animate);
  if (document.hidden) { _rafPrev = 0; return; } // 后台标签页:不渲染(回前台后首个间隔不计入节拍)
  const nowMs = performance.now();
  const rafGap = trackRaf(nowMs);
  let restoreFrame = false;           // 交互降档刚恢复满分辨率的收尾帧:缓冲已重建,必须立即渲染
  if (!sceneActive(nowMs)) {
    _activeRun = 0; _rafEma = _rafBase; // 静止期:GPU 判定重新起算
    const wasLow = dprLowered();
    applyInteractDpr(nowMs);          // 手势结束 → 恢复满分辨率;仍按住不动 → 保持低档零渲染
    if (!wasLow || dprLowered()) { _lastUpdMs = nowMs; return; } // 完全静止 → 停渲染,CPU 归零
    restoreFrame = true;
  } else if (rafGap > 0 && rafGap < 250) { // 渲染期 rAF 节拍 EMA(>250ms 的是切标签页/断点,不算)
    _rafEma = _activeRun ? _rafEma + (rafGap - _rafEma) * .1 : rafGap;
    _activeRun++;
  }
  const frameMs = (tweens.size > 0 || nowMs < smoothUntil()) ? (1000 / SMOOTH_FPS) : (1000 / ambientFps());
  if (!restoreFrame && nowMs - _lastFrameMs < frameMs - 1.5) return; // 帧率上限(环境 / 交互;恢复帧不受门控)
  applyInteractDpr(nowMs);            // 手势进行中 → 本帧起以低分辨率渲染(恢复帧上是无操作)
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
