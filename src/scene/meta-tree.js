// 树之树系统(STEP 9):每棵树坍缩成一个元节点,按「从谁的痛点里长出来」连成更大的树;
// 金色序号 = 生长次序;虚线垂向下方森林里这棵树的真身。切路径(runtime.metaPathIdx)后重新生长。

import * as THREE from 'three';
import { GOLD, lvlOf } from '../config.js';
import { META_PATHS } from '../data/meta-paths.js';
import { treeById } from '../core/registry.js';
import { runtime } from '../core/state.js';
import { easeOut } from '../core/tween.js';
import { V3, makeCylinder, setCylinder, makeLine2, setLine2, disposeGroup, _v2, _v3 } from '../core/three-utils.js';
import { Label } from './labels.js';
import { scene, clock } from './context.js';
import { boundaryCenter } from './ghosts.js';

export const metaGroup = new THREE.Group();
metaGroup.position.copy(boundaryCenter); metaGroup.visible = false; scene.add(metaGroup);

export let metaItems = [];
let metaStart = 0;
const META_STEP = .72, META_GROW = .62;

export function clearMeta() {
  disposeGroup(metaGroup); // Label 元素随 removed 事件自动摘除
  metaItems = [];
}

export function buildMetaTree() {
  clearMeta();
  const P = META_PATHS[runtime.metaPathIdx];
  const kids = {}, depth = {};
  P.seq.forEach(s => { kids[s.t] = []; });
  P.seq.forEach(s => { if (s.p) kids[s.p].push(s.t); depth[s.t] = s.p ? depth[s.p] + 1 : 0; });
  // 叶序定 x:整棵元树自然摊开
  const xs = {}; let leaf = 0;
  (function place(id) {
    const c = kids[id];
    if (!c.length) { xs[id] = leaf++; return; }
    c.forEach(place);
    xs[id] = (xs[c[0]] + xs[c[c.length - 1]]) / 2;
  })(P.seq[0].t);
  const W = 18, DY = 11.5, Y0 = 24;
  const posOf = id => V3((xs[id] - (leaf - 1) / 2) * W, Y0 + depth[id] * DY, 0);
  P.seq.forEach((s, i) => {
    const tr = treeById[s.t], color = tr.def.color, pos = posOf(s.t);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(tr.def.kind === 'biz' ? 3.0 : 2.5, 24, 18),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .5, roughness: .35, metalness: .15, transparent: true }));
    orb.position.copy(pos); orb.visible = false;
    orb.userData.meta = { seq: s, idx: i, def: tr.def, parentDef: s.p ? treeById[s.p].def : null };
    metaGroup.add(orb);
    let rim = null;
    if (!s.p) { // 元根:金色线框环,与树根同款语义(第一性假设由人守护)
      rim = new THREE.Mesh(new THREE.SphereGeometry(3.9, 14, 10),
        new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: .4 }));
      orb.add(rim); // 自转在 updateMeta 里做——metaGroup 会反复重建,不能挂进全局 spinners
    }
    const el = document.createElement('div');
    el.className = 'mlabel';
    el.innerHTML = `<span style="color:#${color.toString(16).padStart(6, '0')}"><span class="seq">${i + 1}</span>${tr.def.short}</span>` +
      (s.p ? '' : '<span class="mroot">元根 · 第一性假设</span>');
    const lab = new Label(el); lab.position.set(0, tr.def.kind === 'biz' ? 4.6 : 4.1, 0); lab.visible = false;
    orb.add(lab);
    let edge = null, parentPos = null;
    if (s.p) {
      parentPos = posOf(s.p);
      edge = makeCylinder(.2, new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .4 }));
      edge.visible = false; metaGroup.add(edge);
    }
    const drop = makeLine2(new THREE.LineDashedMaterial({ color, transparent: true, opacity: .22, dashSize: 1.6, gapSize: 1.3, depthWrite: false }), true);
    drop.renderOrder = 2; // 垂线画在退成背景的森林节点之后
    drop.visible = false; metaGroup.add(drop);
    metaItems.push({ s, i, tr, orb, lab, edge, parentPos, pos, drop, rim, at: .35 + i * META_STEP });
  });
  metaStart = clock.getElapsedTime();
}

/* 每帧:按拓扑序逐个「长出」——先从父节点把枝长过来,长到了球再冒出来 */
export function updateMeta(t) {
  if (!metaGroup.visible) return;
  const el = t - metaStart;
  for (const m of metaItems) {
    const k = Math.min(1, Math.max(0, (el - m.at) / META_GROW));
    if (m.edge) {
      m.edge.visible = k > 0;
      if (k > 0) {
        // 注意:setCylinder 内部占用 _v1 做临时量,这里只能用 _v2/_v3
        _v2.copy(m.parentPos);
        _v3.copy(m.parentPos).lerp(m.pos, easeOut(Math.min(1, k / .62)));
        setCylinder(m.edge, _v2, _v3);
      }
    }
    const ok = m.s.p ? Math.max(0, (k - .55) / .45) : k;
    m.orb.visible = ok > 0;
    if (ok > 0) {
      m.orb.scale.setScalar(.01 + easeOut(ok) * .99);
      m.orb.material.emissiveIntensity = .45 + .18 * Math.sin(t * 2.1 + m.i * .8) + (k < 1 ? .6 * (1 - k) : 0);
      if (m.rim) m.rim.rotation.y = t * .5;
    }
    m.lab.visible = ok > .72;
    // 虚线垂向森林里的真身(树可能还在归位动画中,端点逐帧取)
    const dropOn = ok > .4;
    m.drop.visible = dropOn;
    if (dropOn) {
      _v3.set(m.tr.group.position.x, lvlOf(m.tr.def.kind, 0).y, m.tr.group.position.z).sub(metaGroup.position);
      setLine2(m.drop, m.pos, _v3);
      m.drop.material.opacity = .2 * Math.min(1, (ok - .4) / .6) * (.7 + .3 * Math.sin(t * 1.6 + m.i));
    }
  }
}
