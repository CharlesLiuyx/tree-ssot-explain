// 幽灵根系统:仓库边界大环 + 每树虚线小环(可自成仓库) + 环外幽灵根与虚线;
// 「显式化」开启后幽灵根被收编进边界(虚线变实线、青转金),被牵住的节点停止闪烁。
// 虚线/实线几何为预分配双点缓冲,每帧就地写端点(不再 setFromPoints 分配)。

import * as THREE from 'three';
import { GOLD, GHOSTC, BOUNDARY_CENTER } from '../config.js';
import { GHOSTS } from '../data/ghosts.js';
import { nodesById, trees, spinners, nodeWorld } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';
import { V3, expK, statik, makeLine2, setLine2, _v1, _v2, _v3 } from '../core/three-utils.js';
import { setNodeEmissive } from './pools.js';
import { Label } from './labels.js';
import { scene } from './context.js';

export const boundaryCenter = V3(...BOUNDARY_CENTER);
const ghostGroup = new THREE.Group(); ghostGroup.position.copy(boundaryCenter); scene.add(ghostGroup);

// 仓库边界:圆环之内 = AI 能读到的全部文本
const boundaryRing = new THREE.Mesh(new THREE.TorusGeometry(94, .16, 8, 160),
  new THREE.MeshBasicMaterial({ color: GHOSTC, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
boundaryRing.rotation.x = Math.PI / 2; boundaryRing.position.y = .2; boundaryRing.visible = false;
ghostGroup.add(boundaryRing);

let bLab = null, trLab = null, treeRings = [];
let treeRingMat = null, treeDiscMat = null;

export function buildGhosts() {
  const bEl = document.createElement('div'); bEl.className = 'glabel';
  bEl.innerHTML = '<b>仓库边界</b><span>环内 = AI 能读到的全部文本</span><span>虚线小环 = 每棵树都可以自成仓库 / 子仓库</span>';
  bLab = new Label(bEl); bLab.position.set(0, 2.4, 86); bLab.visible = false;
  ghostGroup.add(bLab);

  // 树环:仓库边界是嵌套的——每棵树都可以是一个独立仓库或子仓库(虚线 = 潜在的边界)
  const TREE_RING_SEGS = 22;
  treeRingMat = new THREE.MeshBasicMaterial({ color: GHOSTC, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  treeDiscMat = new THREE.MeshBasicMaterial({ color: GHOSTC, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  treeRings = trees.map(tr => {
    // 半径 = 树冠实际足迹 + 余量,再按与最近邻树的半距收紧——环与环不相交(仓库不重叠)
    let rMax = 0;
    for (const n of tr.nodes) { const d = Math.hypot(n.anchor.x, n.anchor.z); if (d > rMax) rMax = d; }
    let near = Infinity;
    for (const o of trees) if (o !== tr)
      near = Math.min(near, Math.hypot(o.def.pos[0] - tr.def.pos[0], o.def.pos[2] - tr.def.pos[2]));
    const R = Math.min(rMax + 1.2, near / 2 - .3);
    const arc = new THREE.TorusGeometry(R, .18, 6, 8, Math.PI * 2 / TREE_RING_SEGS * .66);
    const g = new THREE.Group();
    // 22 段虚线环用 InstancedMesh:同一段几何 + 同一材质,仅旋转不同 → 1 个 draw call/树
    const seg = new THREE.InstancedMesh(arc, treeRingMat, TREE_RING_SEGS);
    const _m4 = new THREE.Matrix4();
    for (let i = 0; i < TREE_RING_SEGS; i++) {
      _m4.makeRotationZ(i * Math.PI * 2 / TREE_RING_SEGS);
      seg.setMatrixAt(i, _m4);
    }
    seg.instanceMatrix.needsUpdate = true;
    seg.frustumCulled = false; // 实例绕原点旋转,基础几何包围球不含全部实例,关掉裁剪防误剔
    g.add(statik(seg));
    g.add(statik(new THREE.Mesh(new THREE.CircleGeometry(R - .4, 40), treeDiscMat))); // 领地圆盘:掠射角下比细线更易读
    g.rotation.x = Math.PI / 2; g.position.y = .2; g.visible = false;
    g.userData.radius = R;
    tr.group.add(statik(g));
    return g;
  });
  const trEl = document.createElement('div'); trEl.className = 'glabel';
  trEl.innerHTML = '<b>每棵树可自成一仓</b><span>虚线环 = 这棵树自己的仓库边界 · 独立仓库或子仓库</span>';
  trLab = new Label(trEl); trLab.position.set(0, 1.6, treeRings[1].userData.radius + 1.4); trLab.visible = false;
  trees[1].group.add(trLab);

  GHOSTS.forEach((g, i) => {
    g.idx = i; g.blend = 0;
    g.targets = g.t.map(id => {
      const n = nodesById.get(id);
      if (!n) throw new Error('GHOST 目标不存在: ' + id);
      n.ghost = g; return n;
    });
    g.wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1),
      new THREE.MeshBasicMaterial({ color: GHOSTC, wireframe: true, transparent: true, opacity: 0, depthWrite: false }));
    g.inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0),
      new THREE.MeshBasicMaterial({ color: GHOSTC, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.wire.userData.ghost = g; g.inner.userData.ghost = g;
    g.wire.visible = false; g.inner.visible = false;
    g.wire.renderOrder = 2; g.inner.renderOrder = 2; // 画在节点之后,悬浮发光体正确叠加
    ghostGroup.add(g.wire); ghostGroup.add(g.inner);
    spinners.push({ obj: g.wire, axis: V3(.2, 1, .3).normalize(), speed: .3 });
    const el = document.createElement('div'); el.className = 'glabel';
    el.innerHTML = `<b>👻 ${g.n}</b><span>幽灵根 · 真正的 SSOT 在图外</span>`;
    g.label = new Label(el); g.label.position.set(0, 4.2, 0); g.label.visible = false;
    g.wire.add(g.label);
    g.dashed = []; g.solid = [];
    g.targets.forEach(() => {
      const dl = makeLine2(new THREE.LineDashedMaterial({ color: GHOSTC, transparent: true, opacity: 0, dashSize: 1.2, gapSize: .8, depthWrite: false }), true);
      const sl = makeLine2(new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
      dl.userData.ghost = g; sl.userData.ghost = g;
      dl.renderOrder = 2; sl.renderOrder = 2;
      dl.visible = false; sl.visible = false;
      ghostGroup.add(dl); ghostGroup.add(sl);
      g.dashed.push(dl); g.solid.push(sl);
    });
  });
}

let ghostCollect = 0, ghostLayerK = 1, ringScaleK = 1;

/* 每帧:边界环/树环淡入淡出,幽灵根漂浮或被收编,虚线端点跟随节点 */
export function updateGhosts(t, dt) {
  const stage = state.stage;
  const show = stage === 0 || (stage >= 5 && stage !== 9);
  const faint = stage === 0 ? .45 : 1;
  const dim = stage === 6 ? .15 : 1;
  const k37 = expK(dt, 3.7), k31 = expK(dt, 3.1);
  ghostCollect += ((stratOn('explicit') ? 1 : 0) - ghostCollect) * k31;
  ghostLayerK += ((stratOn('layer') ? 1.45 : 1) - ghostLayerK) * k31;
  ringScaleK += ((stratOn('layer') ? 1.62 : 1) - ringScaleK) * k31;
  boundaryRing.scale.setScalar(ringScaleK);
  const ringTarget = (show ? 1 : 0) * faint * dim * .32;
  boundaryRing.material.opacity += (ringTarget - boundaryRing.material.opacity) * k37;
  boundaryRing.visible = boundaryRing.material.opacity > .01;
  bLab.visible = show && stage >= 5 && dim === 1;
  bLab.position.set(0, 2.4, 86 * ringScaleK);
  // 树环:分层开启时树被压进层间(墙与接口环接管边界感),树环随之淡出
  const layerBlend = Math.min(1, Math.max(0, (ringScaleK - 1) / .62));
  const treeTarget = (show ? 1 : 0) * faint * dim * .42 * (1 - layerBlend);
  treeRingMat.opacity += (treeTarget - treeRingMat.opacity) * k37;
  treeDiscMat.opacity += (treeTarget * .18 - treeDiscMat.opacity) * k37;
  const treeRingVis = treeRingMat.opacity > .01;
  for (const g of treeRings) g.visible = treeRingVis;
  trLab.visible = show && stage >= 5 && dim === 1 && layerBlend < .5;
  for (const g of GHOSTS) {
    g.blend += ((show ? 1 : 0) - g.blend) * k37;
    const on = g.blend > .02;
    g.wire.visible = on; g.inner.visible = on;
    g.label.visible = on && g.blend > .5 && stage >= 5 && dim === 1;
    g.dashed.forEach(l => l.visible = on); g.solid.forEach(l => l.visible = on && ghostCollect > .02);
    if (!on) continue;
    // 位置:游离在边界外 ←→(显式化后)被收编进边界内
    _v1.set(g.pos[0] * ghostLayerK, g.pos[1], g.pos[2] * ghostLayerK);
    _v2.set(g.pos[0] * ghostLayerK * .42, 13, g.pos[2] * ghostLayerK * .42);
    _v1.lerp(_v2, ghostCollect);
    _v1.y += Math.sin(t * .8 + g.idx * 1.9) * .9;
    g.wire.position.copy(_v1); g.inner.position.copy(_v1);
    const op = g.blend * faint * dim;
    const col = ghostCollect > .5 ? GOLD : GHOSTC;
    g.wire.material.color.setHex(col); g.inner.material.color.setHex(col);
    g.wire.material.opacity = (.42 + .2 * Math.sin(t * 2.2 + g.idx)) * op + ghostCollect * .2 * op;
    g.inner.material.opacity = .5 * op;
    g.targets.forEach((n, i) => {
      nodeWorld(n, _v3).sub(ghostGroup.position);
      setLine2(g.dashed[i], _v1, _v3);
      g.dashed[i].material.opacity = .5 * op * (1 - ghostCollect);
      setLine2(g.solid[i], _v1, _v3);
      g.solid[i].material.opacity = .55 * op * ghostCollect;
      // 被幽灵根牵住的节点:语义不稳定地闪烁;显式化后恢复安定
      if (stage >= 5 && stage !== 6 && ghostCollect < .5)
        setNodeEmissive(n, .38 + .5 * Math.abs(Math.sin(t * 5 + g.idx * 2 + i * 1.3)));
      else if (runtime.hovered !== n)
        setNodeEmissive(n, .38);
    });
  }
}
