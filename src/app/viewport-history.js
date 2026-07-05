// 视口历史(点击 Zoom in):undo-tree 式导航模型。
// 每次导航都往树里记一笔:root(本步起始视角)为根,Zoom in 一个节点 = 挂一个子节点。
// 返回 = 回到父节点;点历史树任意节点 = 跳过去(从别处再 Zoom 会长出新分支,历史永不丢失)。
// 视口数超过 VP_MAX 触发垃圾回收:回收最久未访问的旁支叶子,根与当前路径永不回收。

import * as THREE from 'three';
import { FAST_DUR, VP_MAX } from '../config.js';
import { nodesById, allNodes } from '../core/registry.js';
import { easeOut } from '../core/tween.js';
import { renderer, scene, camera, controls, flyCamera } from '../scene/context.js';
import { platformGroup, platNodes } from '../scene/platform.js';
import { initVpPanel, renderVpPanel } from '../ui/viewport-panel.js';
import { initVpMap, renderVpMap, setVpMapOpen } from '../ui/viewport-map.js';

let vpRoot = null, vpCurrent = null, vpSeq = 0, vpGCCount = 0;
let vpPanelOpen = false;  // 「视口历史」面板默认收起为胶囊;展开/收起是用户意图,跨步骤保留
let vpMapOn = false;
let afterRender = null;   // 渲染后的钩子(main.js 装配为导演的自动旋转同步)

function makeVP(pos, target, label, meta) {
  return { id: ++vpSeq, pos: pos.clone(), target: target.clone(), label, meta: meta || {},
    parent: null, children: [], at: performance.now() }; // at = 最近访问时间(GC 的 LRU 依据)
}
export function vpDepth() { let d = 0, n = vpCurrent; while (n && n.parent) { d++; n = n.parent; } return d; }
function vpCount(n) { let c = 1; for (const k of n.children) c += vpCount(k); return c; }
// 离开当前视口前,把「此刻真实相机位姿」存回去——返回时能精确回到你刚才所在处(含手动旋转/缩放)
function vpSnapshot() { if (vpCurrent) { vpCurrent.pos.copy(camera.position); vpCurrent.target.copy(controls.target); } }

const vm = () => ({ root: vpRoot, current: vpCurrent, depth: vpDepth(), count: vpCount(vpRoot), gcCount: vpGCCount, panelOpen: vpPanelOpen });
function render() {
  renderVpPanel(vm());
  afterRender && afterRender(); // 聚焦节点时暂停总览自动旋转,回到根再恢复
}

export function vpReset(pos, target, label) {  // 切换步骤时重置为一棵新树(根 = 本步起始视角)
  vpSeq = 0; vpGCCount = 0;
  vpRoot = makeVP(pos, target, label || '起始视角', { kind: 'stage' });
  vpCurrent = vpRoot;
  closeMap();
  render();
}
function vpNavigate(node) {                     // 跳到历史树中已存在的某个视口
  if (!node || node === vpCurrent) return;
  vpSnapshot();
  vpCurrent = node;
  node.at = performance.now();
  flyCamera(node.pos.clone(), node.target.clone(), FAST_DUR, easeOut);
  render();
}
export function vpBack() { if (vpCurrent && vpCurrent.parent) vpNavigate(vpCurrent.parent); }

// 垃圾回收:超过上限时,反复摘掉「最久未访问的旁支叶子」直到达标。
// 根与当前路径(current 及其全部祖先)永不回收;若全树都在当前路径上(超深链),允许暂时超限。
function vpGC() {
  let total = vpCount(vpRoot);
  if (total <= VP_MAX) return;
  const keep = new Set();
  for (let n = vpCurrent; n; n = n.parent) keep.add(n);
  while (total > VP_MAX) {
    let victim = null;
    (function walk(n) {
      if (!n.children.length) { if (!keep.has(n) && (!victim || n.at < victim.at)) victim = n; return; }
      n.children.forEach(walk);
    })(vpRoot);
    if (!victim) break;
    victim.parent.children.splice(victim.parent.children.indexOf(victim), 1);
    victim.parent = null;
    vpGCCount++; total--;
  }
}

// 手动清空:丢弃全部历史、只留根(本步起始视角),并飞回根
function vpClear() {
  if (!vpRoot) return;
  vpRoot.children.length = 0;
  vpSeq = 1; vpGCCount = 0;        // 根保持 #1,下一次 Zoom in 从 #2 重新编号
  vpCurrent = vpRoot;
  vpRoot.at = performance.now();
  flyCamera(vpRoot.pos.clone(), vpRoot.target.clone(), FAST_DUR, easeOut);
  render();
  if (vpMapOn) renderVpMap(vm());
}

function zoomToNode(mesh) {
  const node = mesh.userData.node; if (!node) return;
  if (vpCurrent && vpCurrent.meta && vpCurrent.meta.node === node) return; // 已聚焦该节点
  scene.updateMatrixWorld(true);
  const wp = mesh.getWorldPosition(new THREE.Vector3());
  const r = (mesh.geometry.parameters && mesh.geometry.parameters.radius) || 0.6;
  const dist = 12 + r * 7;                     // 框住节点 + 它的直接邻域(子节点 / 交织 / 引力)
  let dir = camera.position.clone().sub(controls.target);
  if (dir.lengthSq() < 1e-4) dir.set(0, .5, 1);
  dir.normalize();
  if (dir.y < .12) { dir.y = .12; dir.normalize(); } // 略抬高视角,避免正贴地/正俯视
  const pos = wp.clone().add(dir.multiplyScalar(dist));
  vpSnapshot();                                // 先把出发点位姿存进父节点
  const child = makeVP(pos, wp, node.name, { kind: 'node', gid: node.gid, node });
  child.parent = vpCurrent; vpCurrent.children.push(child); vpCurrent = child;
  vpGC();                                      // 树长大了:超限则回收最久未访问的旁支
  flyCamera(pos.clone(), wp.clone(), FAST_DUR, easeOut);
  render();
}

// 命中拾取:只认「看得见」的节点(被淡化到 op<.5 的不参与),含可见的平台树节点
const pickRay = new THREE.Raycaster();
const pickV = new THREE.Vector2();
function pickNodeAt(cx, cy) {
  pickV.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
  pickRay.setFromCamera(pickV, camera);
  const meshes = allNodes.filter(n => n.mat.opacity > .5).map(n => n.mesh);
  if (platformGroup.visible) meshes.push(...Object.values(platNodes));
  const hits = pickRay.intersectObjects(meshes, false);
  return hits.length ? hits[0].object : null;
}

/* ---- 全景总览:整棵视口历史树一屏铺开,点击任意视口快速跳转 ---- */
export const isMapOpen = () => vpMapOn;
export function openMap() { if (!vpRoot) return; vpMapOn = true; renderVpMap(vm()); setVpMapOpen(true); }
export function closeMap() { if (!vpMapOn) return; vpMapOn = false; setVpMapOpen(false); }

export function initViewportHistory(opts) {
  afterRender = opts && opts.afterRender;
  initVpPanel({
    onBack: vpBack,
    onHome: () => vpNavigate(vpRoot),
    onClear: vpClear,
    onExpand: () => { vpPanelOpen = true; render(); },
    onCollapse: () => { vpPanelOpen = false; render(); },
    onOpenMap: openMap,
    onNavigate: vpNavigate,
  });
  initVpMap({
    onNavigate: n => { closeMap(); vpNavigate(n); },
    onClear: vpClear,
    onClose: closeMap,
  });

  // 区分「点击」与「拖拽旋转」:位移 < 6px 且 < 500ms 才算点击
  let dnX = 0, dnY = 0, dnT = 0, dnOK = false;
  renderer.domElement.addEventListener('pointerdown', e => {
    if (e.button !== 0) { dnOK = false; return; }
    dnX = e.clientX; dnY = e.clientY; dnT = performance.now(); dnOK = true;
  });
  renderer.domElement.addEventListener('pointerup', e => {
    if (e.button !== 0 || !dnOK) return; dnOK = false;
    if (Math.hypot(e.clientX - dnX, e.clientY - dnY) > 6 || performance.now() - dnT > 500) return;
    const m = pickNodeAt(e.clientX, e.clientY);
    if (m) zoomToNode(m);
  });

  // 调试 / 自动化测试钩子(编程式导航 + 只读统计)
  window.__vp = {
    zoomTo: gid => { const n = nodesById.get(gid); if (n) zoomToNode(n.mesh); },
    back: vpBack, home: () => vpNavigate(vpRoot), clear: vpClear, depth: vpDepth,
    count: () => vpCount(vpRoot), gc: () => vpGCCount, gids: () => [...nodesById.keys()],
  };
}
