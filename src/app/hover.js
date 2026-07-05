// 悬停系统:射线拾取节点/纠缠线/引力束/幽灵根/元节点,推送详情到 tooltip 组件。
// 仅在鼠标移动后才重新拾取;鼠标悬在 UI 面板上时让位给名词解释。

import * as THREE from 'three';
import { GRAVITY } from '../data/gravity.js';
import { GHOSTS } from '../data/ghosts.js';
import { allNodes } from '../core/registry.js';
import { state, runtime } from '../core/state.js';
import { camera, wake, smoothWake } from '../scene/context.js';
import { rayTubes } from '../scene/tangles.js';
import { platNodes } from '../scene/platform.js';
import { metaItems } from '../scene/meta-tree.js';
import { showTooltip, hideTooltip } from '../ui/tooltip.js';
import { nodeInfoHTML, tangleInfoHTML, gravityInfoHTML, ghostInfoHTML, metaInfoHTML } from '../ui/node-info.js';

const raycaster = new THREE.Raycaster();
raycaster.params.Line.threshold = 1.0;
const pointer = new THREE.Vector2(-2, -2); // 初始在视锥外:鼠标未动时不凭空触发悬停
let overUI = false;
let pointerMoved = true;   // 仅在鼠标移动后才重新射线拾取;静止/自动旋转时跳过整套 raycast

export function initHover() {
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    pointerMoved = true;
    if (e.buttons) smoothWake(); else wake(500);   // 拖拽 → 60fps;仅移动 → 唤醒一小段以更新悬停
    overUI = !!(e.target && e.target.closest && e.target.closest('#panel,#topbar,#meter,#legend,#dots,#rotate-toggle,#vp-panel,#vp-back,#vp-map,#vp-pill'));
  });
}

let _staticNodeMeshes = null; // 节点 + 平台节点是固定集合,只建一次
function staticNodeMeshes() {
  if (!_staticNodeMeshes) _staticNodeMeshes = allNodes.map(n => n.mesh).concat(Object.values(platNodes));
  return _staticNodeMeshes;
}

function unhover() {
  const h = runtime.hoveredMesh;
  if (!h) return;
  const n = h.userData.node;
  if (n && n.mat) n.mat.emissiveIntensity = .38;
  runtime.hoveredMesh = null;
  hideTooltip();
}

/* 主循环隔帧调用 */
export function doHover() {
  if (overUI) { // 鼠标在 UI 面板上:3D 悬停让位给名词解释
    unhover();
    pointerMoved = false;
    return;
  }
  if (!pointerMoved) return; // 鼠标未移动:沿用上次拾取结果,省下整套 raycast
  pointerMoved = false;
  raycaster.setFromCamera(pointer, camera);
  const metaMode = state.stage === 9;
  const nodeMeshes = metaMode ? [] : staticNodeMeshes();
  const metaOrbs = metaMode ? metaItems.map(m => m.orb).filter(o => o.visible) : [];
  const beamsG = GRAVITY.map(g => g.beam).filter(b => b.visible);
  const ghostHit = [];
  for (const g of GHOSTS) if (g.wire.visible) {
    ghostHit.push(g.wire, g.inner);
    for (const l of g.dashed) if (l.visible) ghostHit.push(l);
    for (const l of g.solid) if (l.visible) ghostHit.push(l);
  }
  const hits = raycaster.intersectObjects(nodeMeshes.concat(rayTubes, beamsG, ghostHit, metaOrbs), false);
  let target = null;
  if (hits.length) target = hits[0].object;
  if (runtime.hoveredMesh && runtime.hoveredMesh !== target) unhover();
  if (target && target !== runtime.hoveredMesh) {
    runtime.hoveredMesh = target;
    const n = target.userData.node, t = target.userData.tangle, gv = target.userData.gravity, gh = target.userData.ghost, mt = target.userData.meta;
    if (n) {
      if (n.mat) n.mat.emissiveIntensity = 1.0;
      showTooltip(nodeInfoHTML(n));
    } else if (mt) {
      showTooltip(metaInfoHTML(mt));
    } else if (t) {
      showTooltip(tangleInfoHTML(t));
    } else if (gv) {
      showTooltip(gravityInfoHTML(gv));
    } else if (gh) {
      showTooltip(ghostInfoHTML(gh));
    }
  }
}
