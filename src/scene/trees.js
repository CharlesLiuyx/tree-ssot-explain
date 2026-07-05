// 建树系统:按 TREE_DEFS 生成十六棵树(节点球/枝干/树标签/SDD 脉冲/根环),写入 core/registry。
// 树形由确定性 rng 决定——调用顺序即形状,勿调整初始化次序。

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GOLD, GREEN, lvlOf } from '../config.js';
import { TREE_DEFS } from '../data/trees.js';
import { nodesById, trees, allNodes, treeById, spinners, pulses, rootRings, labelEls } from '../core/registry.js';
import { V3, rng, makeCylinder, setCylinder, mergeMeshGeoms, sphereGeo } from '../core/three-utils.js';
import { scene } from './context.js';

function addNode(tree, gid, name, level, pos, hasChildren) {
  const size = lvlOf(tree.def.kind, level).s;
  const color = level === 0 ? GOLD : tree.def.color;
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .38, roughness: .35, metalness: .15, transparent: true, opacity: 1 });
  const mesh = new THREE.Mesh(sphereGeo(size, 18, 12), mat);
  mesh.position.copy(pos);
  const node = { gid, name, level, tree: tree.idx, mesh, mat, base: color, tangles: [], halos: [], rim: null, shell: null,
    gravity: null, ghost: null, anchor: pos.clone(), hasChildren };
  mesh.userData.node = node;
  tree.group.add(mesh);
  if (level === 0) {
    const rim = new THREE.Mesh(sphereGeo(size * 1.45, 12, 9),
      new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: .4 }));
    mesh.add(rim); node.rim = rim;
    spinners.push({ obj: rim, axis: V3(0, 1, 0), speed: .25 });
  } else if (!hasChildren) {
    // 叶子:绿描边(AI 自由区)+ TDD 护栏壳
    const rim = new THREE.Mesh(sphereGeo(size * 1.42, 10, 8),
      new THREE.MeshBasicMaterial({ color: GREEN, wireframe: true, transparent: true, opacity: .24 }));
    mesh.add(rim); node.rim = rim;
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(size * 1.95, 1),
      new THREE.MeshBasicMaterial({ color: GREEN, wireframe: true, transparent: true, opacity: .5 }));
    shell.visible = false; mesh.add(shell); node.shell = shell;
    spinners.push({ obj: shell, axis: V3(rng() - .5, 1, rng() - .5).normalize(), speed: .35 });
  }
  nodesById.set(gid, node); allNodes.push(node); tree.nodes.push(node);
  return node;
}

function makeEdge(tree, na, nb) {
  const mesh = makeCylinder(.055, tree.edgeMat);
  setCylinder(mesh, na.mesh.position, nb.mesh.position);
  tree.group.add(mesh);
  const e = { na, nb, mesh };
  tree.edges.push(e);
  return e;
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
  if (parent) makeEdge(tree, parent, node);
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

    // SDD 脉冲点(沿树边流动,端点取节点实时位置——引力形变时自动跟随)
    tree.edges.forEach(e => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 6),
        new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));
      dot.visible = false; group.add(dot);
      pulses.push({ dot, e, phase: rng() });
    });
    // SDD 根环
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, .05, 8, 48),
      new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.position.set(0, lvlOf(def.kind, 0).y, 0); ring.rotation.x = Math.PI / 2; ring.visible = false;
    group.add(ring); rootRings.push(ring);

    // 树标签
    const el = document.createElement('div');
    el.className = 'tlabel';
    el.innerHTML = `<b style="color:#${def.color.toString(16).padStart(6, '0')}">${def.name}</b><span class="ssot">root = SSOT</span><i>${def.constraint}<br>${def.tradeoff}</i>`;
    const lab = new CSS2DObject(el); lab.position.set(0, lvlOf(def.kind, 0).y + 3.4, 0); group.add(lab);
    labelEls.push(el);
  });
}

// 静态枝干(两端都不受引力牵动 = 永不形变)合并成每棵树一个网格:
// 上百条各自 draw call + 各自透明排序 → 每棵树 1 条。受引力的枝保留独立、逐帧 setCylinder。
// 必须在引力登记(scene/gravity.js)之后调用——依赖 node.gravity 判定动/静。
export function mergeStaticBranches() {
  for (const tr of trees) {
    const staticEdges = tr.edges.filter(e => !(e.na.gravity || e.nb.gravity));
    if (staticEdges.length < 2) continue; // 太少不值当合并
    const merged = new THREE.Mesh(mergeMeshGeoms(staticEdges.map(e => e.mesh)), tr.edgeMat);
    merged.frustumCulled = false;
    tr.group.add(merged);
    for (const e of staticEdges) { tr.group.remove(e.mesh); e.mesh.geometry.dispose(); e.mesh = null; }
  }
}
