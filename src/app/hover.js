// 悬停系统:解析拾取节点/纠缠线/引力束/幽灵根/元节点,推送详情到 tooltip 组件。
// 全部用「射线×球 / 射线×线段」解析求交(不再对数百个网格做三角形遍历);
// 仅在鼠标移动后才重新拾取;鼠标悬在 UI 面板上时让位给名词解释。

import * as THREE from 'three';
import { GRAVITY } from '../data/gravity.js';
import { GHOSTS } from '../data/ghosts.js';
import { allNodes, nodeWorld } from '../core/registry.js';
import { state, runtime } from '../core/state.js';
import { raySphereT } from '../core/three-utils.js';
import { camera, wake, smoothWake } from '../scene/context.js';
import { pickTangle } from '../scene/tangles.js';
import { setNodeEmissive } from '../scene/pools.js';
import { platNodes, platWorld, platformGroup } from '../scene/platform.js';
import { metaItems, metaGroup } from '../scene/meta-tree.js';
import { boundaryCenter } from '../scene/ghosts.js';
import { showTooltip, hideTooltip } from '../ui/tooltip.js';
import { nodeInfoHTML, tangleInfoHTML, gravityInfoHTML, ghostInfoHTML, metaInfoHTML } from '../ui/node-info.js';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-2, -2); // 初始在视锥外:鼠标未动时不凭空触发悬停
let overUI = false;
let pointerMoved = true;   // 仅在鼠标移动后才重新拾取;静止/自动旋转时跳过整套检测

export function initHover() {
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    pointerMoved = true;
    overUI = !!(e.target && e.target.closest && e.target.closest('#panel,#topbar,#meter,#legend,#dots,#rotate-toggle,#vp-panel,#vp-back,#vp-map,#vp-pill'));
    // 拖拽 → 满帧;场景内移动 → 唤醒一小段以更新悬停;在 UI 面板上滚动/阅读 → 只给几帧清掉旧悬停,不空转渲染
    if (e.buttons) smoothWake(); else wake(overUI ? 160 : 500);
  });
}

function unhover() {
  const h = runtime.hovered;
  if (!h) return;
  if (runtime.hoveredKind === 'node' && !h.platform) setNodeEmissive(h, .38);
  if (runtime.hoveredKind === 'node' && h.platform) h.mat.emissiveIntensity = .35;
  runtime.hovered = null; runtime.hoveredKind = '';
  hideTooltip();
}

const _c = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _onRay = new THREE.Vector3();
const LINE_TH = 1.0; // 幽灵根虚线的拾取半径(与旧版 raycaster.params.Line.threshold 一致)

/* 主循环隔帧调用 */
export function doHover() {
  if (overUI) { // 鼠标在 UI 面板上:3D 悬停让位给名词解释
    unhover();
    pointerMoved = false;
    return;
  }
  if (!pointerMoved) return; // 鼠标未移动:沿用上次拾取结果,省下整套检测
  pointerMoved = false;
  raycaster.setFromCamera(pointer, camera);
  const ray = raycaster.ray;
  let kind = '', data = null, bestT = Infinity;
  const take = (t, k, d) => { if (t >= 0 && t < bestT) { bestT = t; kind = k; data = d; } };

  // 节点球(树之树阶段让位给元节点)
  if (state.stage !== 9) {
    for (const n of allNodes) take(raySphereT(ray, nodeWorld(n, _c), n.radius), 'node', n);
    if (platformGroup.visible)
      for (const m of Object.values(platNodes))
        take(raySphereT(ray, platWorld(m, _c), m.userData.node.radius), 'node', m.userData.node);
  } else {
    for (const it of metaItems) {
      if (!it.orb.visible) continue;
      _c.copy(it.orb.position).add(metaGroup.position);
      take(raySphereT(ray, _c, it.orb.geometry.parameters.radius * it.orb.scale.x), 'meta', it.orb.userData.meta);
    }
  }
  // 纠缠管(射线-折线段距离)
  const tg = pickTangle(ray);
  if (tg) take(tg.t, 'tangle', tg.tangle);
  // 引力束(线段)
  for (const g of GRAVITY) {
    if (!g.beam.visible) continue;
    nodeWorld(g.na, _a); nodeWorld(g.nb, _b);
    if (ray.distanceSqToSegment(_a, _b, _onRay) < .45 * .45) take(_onRay.distanceTo(ray.origin), 'gravity', g);
  }
  // 幽灵根(球壳 + 虚线)
  for (const g of GHOSTS) {
    if (!g.wire.visible) continue;
    _c.copy(g.wire.position).add(boundaryCenter);
    take(raySphereT(ray, _c, 2.6), 'ghost', g);
    for (const n of g.targets) {
      nodeWorld(n, _b);
      if (ray.distanceSqToSegment(_c, _b, _onRay) < LINE_TH * LINE_TH) take(_onRay.distanceTo(ray.origin), 'ghost', g);
    }
  }

  if (runtime.hovered && runtime.hovered !== data) unhover();
  if (data && data !== runtime.hovered) {
    runtime.hovered = data; runtime.hoveredKind = kind;
    if (kind === 'node') {
      if (data.platform) data.mat.emissiveIntensity = 1.0;
      else setNodeEmissive(data, 1.0);
      showTooltip(nodeInfoHTML(data));
    } else if (kind === 'meta') showTooltip(metaInfoHTML(data));
    else if (kind === 'tangle') showTooltip(tangleInfoHTML(data));
    else if (kind === 'gravity') showTooltip(gravityInfoHTML(data));
    else if (kind === 'ghost') showTooltip(ghostInfoHTML(data));
  }
}
