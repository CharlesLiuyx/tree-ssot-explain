// 偶然交织系统:把 TANGLES 登记到节点上(多义性光环),并按当前策略重建纠缠线——
// 纠缠中(红)/ 已契约化走层间接口(琥珀)/ 循环中消解(灰)/ 已平台化改挂平台服务(金)。

import * as THREE from 'three';
import { GOLD, RED, AMBER, GREY, WALL_XS, FOCUS_ID } from '../config.js';
import { TANGLES } from '../data/tangles.js';
import { nodesById, allNodes, spinners } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';
import { V3, rng, disposeGroup } from '../core/three-utils.js';
import { scene } from './context.js';
import { platNodes } from './platform.js';

export const tangleGroup = new THREE.Group(); scene.add(tangleGroup);
export let rayTubes = [];   // 悬停射线拾取用的当前纠缠线集合

let onRebuilt = null;       // 重建后的回调(main.js 装配为策略统计栏刷新)
export function setOnTanglesRebuilt(fn) { onRebuilt = fn; }

/* 登记交织关系 + 给被焊住的节点长出多义性光环(电子轨道隐喻:每一条交织 = 多出一个含义) */
export function registerTangles() {
  TANGLES.forEach((t, i) => {
    t.idx = i;
    t.aNode = nodesById.get(t.a); t.bNode = nodesById.get(t.b);
    if (!t.aNode || !t.bNode) throw new Error('TANGLE 节点不存在: ' + t.a + ' / ' + t.b);
    t.aName = t.aNode.name; t.bName = t.bNode.name;
    t.aNode.tangles.push(t); t.bNode.tangles.push(t);
    t.revealedNow = false; t.meshes = [];
  });
  for (const n of allNodes) {
    n.tangles.forEach((t, j) => {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(.95 + j * .32, .035, 6, 40),
        new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      halo.visible = false;
      n.mesh.add(halo); n.halos.push(halo);
      spinners.push({ obj: halo, axis: V3(rng() - .5, rng() - .5, rng() - .5).normalize(), speed: .5 + rng() * .6 });
    });
  }
}

/* 按当前阶段刷新每条交织的可见/消解标记 */
export function refreshTangleFlags() {
  const show = state.stage === 0 || (state.stage >= 3 && state.stage !== 9);
  TANGLES.forEach((t, i) => {
    t.revealedNow = show && (state.stage !== 3 || i < state.revealed);
    t.resolvedByLoops = stratOn('loops') && !stratOn('platform') && !stratOn('layer') && i % 3 === 0;
  });
}

function tubeMesh(curve, r, color, opacity, additive = true) {
  const geo = new THREE.TubeGeometry(curve, 40, r, 6, false);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false });
  return new THREE.Mesh(geo, mat);
}

/* 重建全部纠缠线(树移动/策略切换/逐条揭示时调用;几何整体重建) */
export function rebuildTangles() {
  scene.updateMatrixWorld(true);
  disposeGroup(tangleGroup);
  rayTubes = []; runtime.tangleCounts = { red: 0, amber: 0, grey: 0, plat: 0 };
  const counts = runtime.tangleCounts;
  const stage = state.stage;
  for (const t of TANGLES) {
    t.meshes = [];
    if (!t.revealedNow) continue;
    const pa = t.aNode.mesh.getWorldPosition(new THREE.Vector3());
    const pb = t.bNode.mesh.getWorldPosition(new THREE.Vector3());
    let meshes = [];
    if (stratOn('platform')) {
      const pn = platNodes[t.platform].getWorldPosition(new THREE.Vector3());
      for (const p of [pa, pb]) {
        const mid = p.clone().add(pn).multiplyScalar(.5); mid.y += 3.5;
        meshes.push(tubeMesh(new THREE.QuadraticBezierCurve3(p, mid, pn), .06, GOLD, .5));
      }
      counts.plat++;
    } else if (stratOn('layer')) {
      const gates = WALL_XS.filter(x => x > Math.min(pa.x, pb.x) && x < Math.max(pa.x, pb.x))
        .sort((x, y) => pa.x < pb.x ? x - y : y - x).map(x => V3(x, 9, 0));
      const curve = new THREE.CatmullRomCurve3([pa, ...gates, pb], false, 'catmullrom', .2);
      meshes.push(tubeMesh(curve, .08, AMBER, .55));
      counts.amber++;
    } else if (t.resolvedByLoops) {
      const mid = pa.clone().add(pb).multiplyScalar(.5); mid.y += 4;
      meshes.push(tubeMesh(new THREE.QuadraticBezierCurve3(pa, mid, pb), .04, GREY, .22, false));
      counts.grey++;
    } else {
      const mid = pa.clone().add(pb).multiplyScalar(.5);
      mid.y += 5 + pa.distanceTo(pb) * .1;
      let op = stage === 0 ? .28 : .6;
      if (stage === 4) op = .22;      // 引力阶段:红线退后,突出洋红
      if (stage === 5) op = .18;      // 图外真相阶段:红线退后,突出幽灵根
      if (stage === 6) op = (t.aNode.gid === FOCUS_ID || t.bNode.gid === FOCUS_ID) ? .9 : .06;
      meshes.push(tubeMesh(new THREE.QuadraticBezierCurve3(pa, mid, pb), .11, RED, op));
      counts.red++;
    }
    for (const m of meshes) {
      m.userData.tangle = t; tangleGroup.add(m); t.meshes.push(m); rayTubes.push(m);
    }
  }
  onRebuilt && onRebuilt();
}

/* STEP 3 案例逐条揭示时的高亮呼吸(主循环每帧调用) */
export function updateTangleHighlight(t) {
  if (state.stage !== 3 || runtime.highlightTangle < 0) return;
  TANGLES.forEach((tg, i) => {
    for (const m of tg.meshes)
      m.material.opacity = i === runtime.highlightTangle ? .75 + .25 * Math.sin(t * 5) : .5;
  });
}
