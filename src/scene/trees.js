// 建树系统:按 TREE_DEFS 生成十六棵树。节点是纯记录(渲染走 scene/pools 实例化池),
// 静态枝干烘焙为每树一个合并网格,受引力牵动的枝保留独立圆柱逐帧形变。
// 树形由确定性 rng 决定——调用顺序即形状,勿调整初始化次序。

import * as THREE from 'three';
import { GOLD, lvlOf } from '../config.js';
import { TREE_DEFS } from '../data/trees.js';
import { nodesById, trees, allNodes, treeById, pulses, labelEls } from '../core/registry.js';
import { V3, rng, makeCylinder, setCylinder, bakeCylinders, statik } from '../core/three-utils.js';
import { addNodeSlot, addRimSlot, addShellSlot, addDotSlot, addRingSlot } from './pools.js';
import { Label } from './labels.js';
import { scene } from './context.js';

export const flexEdges = []; // 受引力牵动的枝干 {tree,e}(gravity 系统逐帧 setCylinder)

function addNode(tree, gid, name, level, pos, hasChildren) {
  const size = lvlOf(tree.def.kind, level).s;
  const color = level === 0 ? GOLD : tree.def.color;
  const node = { gid, name, level, tree: tree.idx, grp: tree.group,
    pos: pos.clone(), anchor: pos.clone(), radius: size, hasChildren,
    base: color, color, opacity: 1, emissiveK: .38,
    tangles: [], haloSlots: [], gravity: null, ghost: null,
    idx: -1, rimIdx: -1, shellIdx: -1, rimOn: false, shellOn: false, mat: null };
  addNodeSlot(node);
  if (level === 0) {
    addRimSlot(node); // 根:金色线框描边(自旋)
  } else if (!hasChildren) {
    addRimSlot(node); // 叶子:绿描边(AI 自由区)
    addShellSlot(node, V3(rng() - .5, 1, rng() - .5).normalize()); // TDD 护栏壳
  }
  nodesById.set(gid, node); allNodes.push(node); tree.nodes.push(node);
  return node;
}

function buildNodeRec(tree, def, level, angle, parent) {
  const L = lvlOf(tree.def.kind, level);
  let pos;
  if (level === 0) pos = V3(0, L.y, 0);
  else {
    const y = L.y + (level >= 2 ? (rng() * 1.6 - .8) : 0);
    const r = L.r + (level >= 3 ? (rng() * 1.6 - .8) : 0); // 深层半径抖动:树冠更有机(幅度需保证冠幅 ≤ 树环半径)
    pos = V3(Math.cos(angle) * r, y, Math.sin(angle) * r);
  }
  const node = addNode(tree, tree.def.id + '.' + def.id, def.n, level, pos, !!(def.c && def.c.length));
  if (parent) tree.edges.push({ na: parent, nb: node, mesh: null });
  (def.c || []).forEach((cd, i) => {
    let a2;
    if (level === 0) a2 = -Math.PI / 2 + i * (Math.PI * 2 / def.c.length) + .42;
    else {
      const base = level === 1 ? .62 : .38;
      const spread = def.c.length >= 3 ? base * .78 : base; // 子分支多时收拢,避免与邻枝相撞
      a2 = angle + (i - (def.c.length - 1) / 2) * spread;
    }
    buildNodeRec(tree, cd, level + 1, a2, node);
  });
  return node;
}

/* 生成全部树,填充 registry */
export function buildTrees() {
  TREE_DEFS.forEach((def, idx) => {
    const group = new THREE.Group();
    group.position.set(...def.pos);
    scene.add(group);
    const edgeMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: .4 });
    const tree = { def, idx, group, nodes: [], edges: [], edgeMat };
    trees.push(tree); treeById[def.id] = tree;
    buildNodeRec(tree, { id: 'root', n: def.rootName, c: def.l1 }, 0, 0, null);

    // SDD 脉冲点(沿树边流动,发光点池里的一个槽位)
    tree.edges.forEach(e => pulses.push({ slot: addDotSlot(.14), e, phase: rng() }));
    // SDD 根环(实例化池)
    addRingSlot(group, lvlOf(def.kind, 0).y);

    // 树标签
    const el = document.createElement('div');
    el.className = 'tlabel';
    el.innerHTML = `<b style="color:#${def.color.toString(16).padStart(6, '0')}">${def.name}</b><span class="ssot">root = SSOT</span><i>${def.constraint}<br>${def.tradeoff}</i>`;
    const lab = new Label(el); lab.position.set(0, lvlOf(def.kind, 0).y + 3.4, 0); group.add(lab);
    labelEls.push(el);
  });
}

// 枝干:两端都不受引力牵动的静态枝,整棵树烘焙成一个合并网格(上百条 draw call → 1 条);
// 受引力的枝保留独立圆柱、由 gravity 系统逐帧 setCylinder。
// 必须在引力登记(scene/gravity.js)之后调用——依赖 node.gravity 判定动/静。
export function buildBranches() {
  for (const tr of trees) {
    const statics = [];
    for (const e of tr.edges) {
      if (e.na.gravity || e.nb.gravity) {
        e.mesh = makeCylinder(.055, tr.edgeMat);
        setCylinder(e.mesh, e.na.pos, e.nb.pos);
        tr.group.add(e.mesh);
        flexEdges.push({ tree: tr, e });
      } else {
        statics.push({ a: e.na.anchor, b: e.nb.anchor });
      }
    }
    if (!statics.length) continue;
    const { geo } = bakeCylinders(statics, .055);
    const merged = new THREE.Mesh(geo, tr.edgeMat);
    merged.frustumCulled = false;
    tr.group.add(statik(merged));
  }
}
