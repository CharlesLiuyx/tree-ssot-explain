// 本征耦合系统:引力对挣脱树形互相吸引(洋红光束/粒子),「共域」开启后变金色气泡;
// 被牵动的枝干每帧重算形变。runtime.gravityPull 由导演随阶段推进。

import * as THREE from 'three';
import { GOLD, MAGENTA } from '../config.js';
import { GRAVITY } from '../data/gravity.js';
import { nodesById, trees } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';
import { makeCylinder, setCylinder, _v2, _v3, _v4 } from '../core/three-utils.js';
import { scene } from './context.js';

const gravityGroup = new THREE.Group(); scene.add(gravityGroup);
let fuseBlend = 0;               // 0..1,「共域」开关的平滑过渡
const gravityEdges = new Set();  // 被引力节点牵动的枝干(保留独立 mesh,逐帧形变)

/* 登记引力对,创建光束/粒子/共域气泡;并收集受牵动的枝干 */
export function registerGravity() {
  GRAVITY.forEach((g, i) => {
    g.idx = i;
    g.na = nodesById.get(g.a); g.nb = nodesById.get(g.b);
    if (!g.na || !g.nb) throw new Error('GRAVITY 节点不存在: ' + g.a + ' / ' + g.b);
    g.aName = g.na.name; g.bName = g.nb.name;
    g.na.gravity = g; g.nb.gravity = g;
    g.beam = makeCylinder(.14, new THREE.MeshBasicMaterial({ color: MAGENTA, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.beam.visible = false; g.beam.userData.gravity = g;
    gravityGroup.add(g.beam);
    g.parts = [];
    for (let p = 0; p < 4; p++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6),
        new THREE.MeshBasicMaterial({ color: MAGENTA, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
      dot.visible = false; gravityGroup.add(dot); g.parts.push(dot);
    }
    g.bubble = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 14),
      new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
    g.bubbleWire = new THREE.Mesh(new THREE.SphereGeometry(2.62, 14, 10),
      new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0, depthWrite: false }));
    g.bubble.visible = false; g.bubbleWire.visible = false;
    gravityGroup.add(g.bubble); gravityGroup.add(g.bubbleWire);
  });
  for (const tr of trees) for (const e of tr.edges)
    if (e.na.gravity || e.nb.gravity) gravityEdges.add({ tree: tr, e });
}

/* 每帧:按引力强度插值节点位置,更新光束/粒子/气泡与被拉弯的枝干 */
export function updateGravity(time) {
  const fuseTarget = stratOn('fusion') ? 1 : 0;
  fuseBlend += (fuseTarget - fuseBlend) * .06;
  const applied = runtime.gravityPull * (.72 + .26 * fuseBlend);
  const beamOn = runtime.gravityPull > .03;
  for (const g of GRAVITY) {
    const ga = trees[g.na.tree].group, gb = trees[g.nb.tree].group;
    // 树组只有平移,无需矩阵:world = local + group.position
    _v2.copy(g.na.anchor).add(ga.position);
    _v3.copy(g.nb.anchor).add(gb.position);
    _v4.copy(_v2).add(_v3).multiplyScalar(.5); // 引力中点
    _v2.lerp(_v4, applied); _v3.lerp(_v4, applied);
    g.na.mesh.position.copy(_v2).sub(ga.position);
    g.nb.mesh.position.copy(_v3).sub(gb.position);
    g.beam.visible = beamOn;
    if (beamOn) {
      setCylinder(g.beam, _v2, _v3);
      const dimmed = state.stage === 6; // 崩塌阶段聚焦红色纠缠,引力束退后
      g.beam.material.color.setHex(fuseBlend > .5 ? GOLD : MAGENTA);
      g.beam.material.opacity = dimmed ? .07 : (fuseBlend > .5 ? .3 : .38 + .18 * Math.sin(time * 3 + g.idx * 1.7));
      g.parts.forEach((dot, p) => {
        const show = beamOn && !dimmed && fuseBlend < .6;
        dot.visible = show;
        if (show) {
          const k = (time * .45 + p * .25 + g.idx * .13) % 1;
          dot.position.lerpVectors(p % 2 ? _v2 : _v3, _v4, k);
          dot.material.opacity = .85 * (1 - k * .6);
        }
      });
      const bub = fuseBlend > .03 && runtime.gravityPull > .4;
      g.bubble.visible = bub; g.bubbleWire.visible = bub;
      if (bub) {
        g.bubble.position.copy(_v4); g.bubbleWire.position.copy(_v4);
        g.bubble.material.opacity = .09 * fuseBlend;
        g.bubbleWire.material.opacity = .24 * fuseBlend;
      }
    } else {
      g.parts.forEach(d => d.visible = false);
      g.bubble.visible = false; g.bubbleWire.visible = false;
    }
  }
  // 引力节点牵动的枝干(被拉长的形变)
  for (const { e } of gravityEdges) setCylinder(e.mesh, e.na.mesh.position, e.nb.mesh.position);
}
