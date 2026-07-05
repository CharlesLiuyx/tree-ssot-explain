// 本征耦合系统:引力对挣脱树形互相吸引(洋红光束/粒子),「共域」开启后变金色气泡;
// 被牵动的枝干在位移帧重算形变。runtime.gravityPull 由导演随阶段推进。
// 静止时(无引力、无过渡)整个系统零开销,位置精确归位到锚点。

import * as THREE from 'three';
import { GOLD, MAGENTA } from '../config.js';
import { GRAVITY } from '../data/gravity.js';
import { nodesById, nodeWorld } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';
import { makeCylinder, setCylinder, expK, _v2, _v3, _v4 } from '../core/three-utils.js';
import { dotSet, dotHide, addDotSlot } from './pools.js';
import { flexEdges } from './trees.js';
import { scene } from './context.js';

const gravityGroup = new THREE.Group(); scene.add(gravityGroup);
let fuseBlend = 0;               // 0..1,「共域」开关的平滑过渡
let lastApplied = -1, atRest = false;
const _pt = new THREE.Vector3(); // 粒子插值专用(setCylinder 占用 _v1)

/* 登记引力对,创建光束/共域气泡,并在发光点池里申请粒子槽位 */
export function registerGravity() {
  GRAVITY.forEach((g, i) => {
    g.idx = i;
    g.na = nodesById.get(g.a); g.nb = nodesById.get(g.b);
    if (!g.na || !g.nb) throw new Error('GRAVITY 节点不存在: ' + g.a + ' / ' + g.b);
    g.aName = g.na.name; g.bName = g.nb.name;
    g.na.gravity = g; g.nb.gravity = g;
    g.beam = makeCylinder(.14, new THREE.MeshBasicMaterial({ color: MAGENTA, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.beam.visible = false; g.beam.userData.gravity = g;
    g.beam.renderOrder = 2; // 发光体画在节点(renderOrder 1)之后:前挡时正确叠加,后挡时被深度剔除
    gravityGroup.add(g.beam);
    g.partSlots = [];
    for (let p = 0; p < 4; p++) g.partSlots.push(addDotSlot(.13));
    g.bubble = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 14),
      new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, depthWrite: false }));
    g.bubbleWire = new THREE.Mesh(new THREE.SphereGeometry(2.62, 14, 10),
      new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0, depthWrite: false }));
    g.bubble.visible = false; g.bubbleWire.visible = false;
    g.bubble.renderOrder = 2; g.bubbleWire.renderOrder = 2;
    gravityGroup.add(g.bubble); gravityGroup.add(g.bubbleWire);
  });
}

/* 每帧:按引力强度插值节点位置,更新光束/粒子/气泡与被拉弯的枝干 */
export function updateGravity(time, dt) {
  const fuseTarget = stratOn('fusion') ? 1 : 0;
  fuseBlend += (fuseTarget - fuseBlend) * expK(dt, 3.7);
  if (Math.abs(fuseTarget - fuseBlend) < .002) fuseBlend = fuseTarget;
  const applied = runtime.gravityPull * (.72 + .26 * fuseBlend);
  const beamOn = runtime.gravityPull > .03;
  const moved = Math.abs(applied - lastApplied) > 1e-4;
  lastApplied = applied;

  // 静止捷径:引力归零且不在过渡 → 一次性精确归位并隐藏全部动效,之后每帧零成本
  if (!beamOn && !moved) {
    if (!atRest) {
      atRest = true;
      for (const g of GRAVITY) {
        g.na.pos.copy(g.na.anchor); g.nb.pos.copy(g.nb.anchor);
        g.beam.visible = false;
        for (const s of g.partSlots) dotHide(s);
        g.bubble.visible = false; g.bubbleWire.visible = false;
      }
      for (const { e } of flexEdges) setCylinder(e.mesh, e.na.pos, e.nb.pos);
      runtime.linkDirty = true;
    }
    return;
  }
  atRest = false;
  if (moved) runtime.linkDirty = true; // 节点在动:纠缠线与实例矩阵本帧需重同步

  for (const g of GRAVITY) {
    // 树组只有平移,无需矩阵:anchor 的世界坐标 = anchor + group.position
    _v2.copy(g.na.anchor).add(g.na.grp.position);
    _v3.copy(g.nb.anchor).add(g.nb.grp.position);
    _v4.copy(_v2).add(_v3).multiplyScalar(.5); // 引力中点
    _v2.lerp(_v4, applied); _v3.lerp(_v4, applied);
    g.na.pos.copy(_v2).sub(g.na.grp.position);
    g.nb.pos.copy(_v3).sub(g.nb.grp.position);
    g.beam.visible = beamOn;
    if (beamOn) {
      setCylinder(g.beam, _v2, _v3);
      const dimmed = state.stage === 6; // 崩塌阶段聚焦红色纠缠,引力束退后
      g.beam.material.color.setHex(fuseBlend > .5 ? GOLD : MAGENTA);
      g.beam.material.opacity = dimmed ? .07 : (fuseBlend > .5 ? .3 : .38 + .18 * Math.sin(time * 3 + g.idx * 1.7));
      const show = !dimmed && fuseBlend < .6;
      g.partSlots.forEach((slot, p) => {
        if (show) {
          const k = (time * .45 + p * .25 + g.idx * .13) % 1;
          _pt.lerpVectors(p % 2 ? _v2 : _v3, _v4, k);
          dotSet(slot, _pt, MAGENTA, .85 * (1 - k * .6));
        } else dotHide(slot);
      });
      const bub = fuseBlend > .03 && runtime.gravityPull > .4;
      g.bubble.visible = bub; g.bubbleWire.visible = bub;
      if (bub) {
        g.bubble.position.copy(_v4); g.bubbleWire.position.copy(_v4);
        g.bubble.material.opacity = .09 * fuseBlend;
        g.bubbleWire.material.opacity = .24 * fuseBlend;
      }
    } else {
      for (const s of g.partSlots) dotHide(s);
      g.bubble.visible = false; g.bubbleWire.visible = false;
    }
  }
  // 引力节点牵动的枝干(被拉长的形变)——仅在节点真的移动过的帧重算
  if (moved) for (const { e } of flexEdges) setCylinder(e.mesh, e.na.pos, e.nb.pos);
}
