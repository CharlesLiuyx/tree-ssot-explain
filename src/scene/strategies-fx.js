// 策略视觉系统:「分层」的墙与接口环、「Loops」的雷达,以及分层时的树位移排布。

import * as THREE from 'three';
import { WALL_XS } from '../config.js';
import { trees } from '../core/registry.js';
import { stratOn, runtime } from '../core/state.js';
import { tweenVec } from '../core/tween.js';
import { V3 } from '../core/three-utils.js';
import { scene } from './context.js';
import { platformGroup } from './platform.js';

/* 分层:半透明墙 + 白色接口环(跨层调用的唯一通道) */
export const gatesGroup = new THREE.Group(); gatesGroup.visible = false; scene.add(gatesGroup);
WALL_XS.forEach(x => {
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(62, 28),
    new THREE.MeshBasicMaterial({ color: 0x9fb6ff, transparent: true, opacity: .035, side: THREE.DoubleSide, depthWrite: false }));
  wall.rotation.y = Math.PI / 2; wall.position.set(x, 14, 0);
  gatesGroup.add(wall);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(wall.geometry),
    new THREE.LineBasicMaterial({ color: 0x9fb6ff, transparent: true, opacity: .18 }));
  edge.rotation.y = Math.PI / 2; edge.position.copy(wall.position);
  gatesGroup.add(edge);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, .08, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.rotation.y = Math.PI / 2; ring.position.set(x, 9, 0);
  gatesGroup.add(ring);
});

/* Loops:轮末清理的扫描雷达 */
export const radar = new THREE.Mesh(new THREE.CircleGeometry(126, 48, 0, .45),
  new THREE.MeshBasicMaterial({ color: 0x3ad6c5, transparent: true, opacity: .1, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
radar.rotation.x = -Math.PI / 2; radar.position.y = .25; radar.visible = false;
scene.add(radar);

/* 树的位置:分层开启时排成 8 层 × 前后 2 排(同层的两棵树共用一段层间契约),关闭时回到森林站位 */
export function applyTreePositions() {
  const layered = stratOn('layer');
  trees.forEach(tr => {
    const tgt = layered ? V3(tr.def.layerX, 0, tr.def.layerZ || 0) : V3(...tr.def.pos);
    if (tr.group.position.distanceTo(tgt) > .05) {
      tweenVec(tr.group.position, tgt, 1.3, () => { runtime.linkDirty = true; }, () => { runtime.linkDirty = true; });
    }
  });
  const ptgt = layered ? V3(0, 0, -52) : V3(0, 0, -20);
  if (platformGroup.position.distanceTo(ptgt) > .05) {
    tweenVec(platformGroup.position, ptgt, 1.3, () => { runtime.linkDirty = true; }, () => { runtime.linkDirty = true; });
  }
}
