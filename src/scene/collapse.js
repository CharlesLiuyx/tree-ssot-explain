// 崩塌系统(STEP 6):AI 球盯住焦点节点,7 条上下文光束里预算只够 2 条实线——
// 红色虚线在挣扎地闪烁,即「装不进上下文的含义」。

import * as THREE from 'three';
import { GOLD, RED, FOCUS_ID } from '../config.js';
import { nodesById, spinners, nodeWorld } from '../core/registry.js';
import { V3, disposeGroup } from '../core/three-utils.js';
import { Label } from './labels.js';
import { scene, camera } from './context.js';
import { L } from '../i18n/index.js';

const aiGroup = new THREE.Group(); aiGroup.visible = false; scene.add(aiGroup);
let orb = null, beams = [], focusRing = null;

// 必须同时保持的上下文:原义(根) + 6 个交织伙伴;预算只够 2 条实线
const BEAM_TARGETS = [
  { id: 'perf.root', solid: true }, { id: 'authz.rowacl', solid: true },
  { id: 'gate.canary', solid: false }, { id: 'arch.cfg', solid: false },
  { id: 'compat.dualread', solid: false }, { id: 'priv.forget', solid: false }, { id: 'tenant.dataisol', solid: false },
];

export function buildCollapse() {
  clearCollapse();
  const fp = nodeWorld(nodesById.get(FOCUS_ID), new THREE.Vector3());
  const orbPos = fp.clone().add(V3(-4, 11, 6));
  orb = new THREE.Group();
  const shellM = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1),
    new THREE.MeshBasicMaterial({ color: 0xcfe0ff, wireframe: true, transparent: true, opacity: .8 }));
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.85, 0),
    new THREE.MeshStandardMaterial({ color: 0x9fb6ff, emissive: 0x9fb6ff, emissiveIntensity: .6, transparent: true }));
  orb.add(shellM); orb.add(core); orb.position.copy(orbPos);
  spinners.push({ obj: shellM, axis: V3(.3, 1, .2).normalize(), speed: .6 });
  const el = document.createElement('div');
  el.className = 'ailabel'; el.innerHTML = L.ui.scene.aiLabel;
  const lab = new Label(el); lab.position.set(0, 2.6, 0); orb.add(lab);
  aiGroup.add(orb);

  beams = BEAM_TARGETS.map((tg, i) => {
    const p = nodeWorld(nodesById.get(tg.id), new THREE.Vector3());
    const geo = new THREE.BufferGeometry().setFromPoints([orbPos, p]);
    let line;
    if (tg.solid) {
      line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .85, depthWrite: false }));
    } else {
      line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: RED, transparent: true, opacity: .5, dashSize: .9, gapSize: .7, depthWrite: false }));
      line.computeLineDistances();
    }
    line.userData.flicker = !tg.solid; line.userData.ph = i * 1.3;
    line.renderOrder = 2;
    aiGroup.add(line);
    return line;
  });
  const mainGeo = new THREE.BufferGeometry().setFromPoints([orbPos, fp]);
  const main = new THREE.Line(mainGeo, new THREE.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: .9, depthWrite: false }));
  main.renderOrder = 2;
  aiGroup.add(main);

  focusRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, .07, 8, 48),
    new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
  focusRing.position.copy(fp);
  focusRing.renderOrder = 4;
  aiGroup.add(focusRing);
  aiGroup.visible = true;
}

export function clearCollapse() {
  for (const s of [...spinners]) if (orb && s.obj.parent === orb) spinners.splice(spinners.indexOf(s), 1);
  disposeGroup(aiGroup);
  aiGroup.visible = false; orb = null; beams = []; focusRing = null;
}

/* 每帧:虚线光束闪烁、焦点环呼吸并朝向相机、AI 球浮动(fk = 帧率归一系数) */
export function updateCollapse(t, fk) {
  if (!aiGroup.visible) return;
  for (const b of beams) if (b.userData.flicker)
    b.material.opacity = .2 + .4 * Math.abs(Math.sin(t * 4 + b.userData.ph));
  if (focusRing) {
    const s = 1 + .25 * Math.sin(t * 3);
    focusRing.scale.setScalar(s);
    focusRing.lookAt(camera.position);
  }
  if (orb) orb.position.y += Math.sin(t * 1.2) * .006 * fk;
}
