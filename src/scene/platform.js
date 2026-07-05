// 平台树系统:「平台化」策略开启时出现的独立服务树(权限/门控/审计/基础设施)。

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GOLD, PLAT } from '../config.js';
import { PLATFORM_NODES } from '../data/platform.js';
import { spinners } from '../core/registry.js';
import { V3, makeCylinder, setCylinder } from '../core/three-utils.js';
import { scene } from './context.js';

export const platformGroup = new THREE.Group();
platformGroup.position.set(0, 0, -20); platformGroup.visible = false;
scene.add(platformGroup);

export const platNodes = {};   // 平台服务 key → mesh(纠缠线平台化后的挂点)
export let platLabelObj = null;

export function buildPlatform() {
  const mat = () => new THREE.MeshStandardMaterial({ color: PLAT, emissive: PLAT, emissiveIntensity: .35, roughness: .4, metalness: .2, transparent: true });
  const edgeMat = new THREE.MeshBasicMaterial({ color: PLAT, transparent: true, opacity: .5 });
  const rootPos = V3(0, 17.5, 0);
  const root = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 18), mat()); root.position.copy(rootPos);
  platformGroup.add(root);
  const rim = new THREE.Mesh(new THREE.SphereGeometry(1.45, 14, 10),
    new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: .45 }));
  rim.position.copy(rootPos); platformGroup.add(rim);
  spinners.push({ obj: rim, axis: V3(0, 1, 0), speed: .3 });
  Object.entries(PLATFORM_NODES).forEach(([k, name], i) => {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const p = V3(Math.cos(a) * 5.4, 11.8, Math.sin(a) * 5.4);
    const m = new THREE.Mesh(new THREE.SphereGeometry(.62, 20, 14), mat()); m.position.copy(p);
    platformGroup.add(m);
    const em = makeCylinder(.06, edgeMat); setCylinder(em, rootPos, p); platformGroup.add(em);
    m.userData.node = { gid: 'plat.' + k, name, level: 1, tree: -1, tangles: [], platform: true };
    platNodes[k] = m;
  });
  const el = document.createElement('div');
  el.className = 'tlabel plabel';
  el.innerHTML = `<b>平台树 · 显式共享</b><span class="ssot">横切关注点的新 SSOT</span>`;
  const lab = new CSS2DObject(el); lab.position.set(0, 20.6, 0); lab.visible = false;
  platformGroup.add(lab);
  platLabelObj = lab;
}
