// 实例化池:节点球 / 根环描边 / 叶描边 / TDD 护壳 / 多义性光环 / 发光点(SDD 脉冲 + 引力粒子)/ SDD 根环。
// 原来每个装饰都是独立 Mesh(数百个 draw call + 每帧数百次矩阵重组),现在同类合并为一个 InstancedMesh:
// draw call 从 ~900 降到 ~12,矩阵只在被写入的实例上重算。
// 节点的颜色 / 自发光强度 / 透明度走 per-instance 属性(aColor / aExtra),由着色器补丁读取。

import * as THREE from 'three';
import { GOLD, GREEN, RED } from '../config.js';
import { nodeWorld, pulses } from '../core/registry.js';
import { stratOn } from '../core/state.js';
import { scene } from './context.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _s = new THREE.Vector3(), _p = new THREE.Vector3(), _p2 = new THREE.Vector3(), _col = new THREE.Color();
const Q_ID = new THREE.Quaternion();
const Q_X90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0); // 隐藏实例 = 零缩放(GPU 上是零面积三角形,近乎免费)
const AXIS_Y = new THREE.Vector3(0, 1, 0);

/* 把「每帧 rotateOnAxis(axis, speed*.016*fk)」的累计角速度换算为绝对时间角速度(rad/s) */
const SPIN = .96;

function instanced(geo, mat, count, renderOrder) {
  const m = new THREE.InstancedMesh(geo, mat, count);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.renderOrder = renderOrder;
  for (let i = 0; i < count; i++) m.setMatrixAt(i, ZERO_M);
  scene.add(m);
  return m;
}

/* ===== 节点球池 ===== */
const nodeList = [];
let nodeMesh = null, aColor = null, aExtra = null;

export function addNodeSlot(n) { n.idx = nodeList.length; nodeList.push(n); }

function makeNodeMaterial() {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .35, metalness: .15, transparent: true });
  mat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', 'attribute vec3 aColor;\nattribute vec2 aExtra;\nvarying vec3 vAColor;\nvarying vec2 vAExtra;\n#include <common>')
      .replace('#include <begin_vertex>', 'vAColor = aColor;\nvAExtra = aExtra;\n#include <begin_vertex>');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', 'varying vec3 vAColor;\nvarying vec2 vAExtra;\n#include <common>')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( diffuse * vAColor, opacity * vAExtra.y );')
      .replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = vAColor * vAExtra.x;');
  };
  mat.customProgramCacheKey = () => 'node-pool';
  return mat;
}

export function setNodeColor(n, hex) {
  if (n.color === hex && n._colInit) return;
  n.color = hex; n._colInit = true;
  _col.setHex(hex);
  aColor.array[n.idx * 3] = _col.r; aColor.array[n.idx * 3 + 1] = _col.g; aColor.array[n.idx * 3 + 2] = _col.b;
  aColor.needsUpdate = true;
}
export function setNodeEmissive(n, k) {
  if (n.emissiveK === k) return;
  n.emissiveK = k;
  aExtra.array[n.idx * 2] = k;
  aExtra.needsUpdate = true;
}
export function setNodeOpacity(n, op) {
  if (n.opacity === op) return;
  n.opacity = op;
  aExtra.array[n.idx * 2 + 1] = op;
  aExtra.needsUpdate = true;
}

function syncNodeMatrices() {
  for (const n of nodeList) {
    _m.compose(nodeWorld(n, _p), Q_ID, _s.setScalar(n.radius));
    nodeMesh.setMatrixAt(n.idx, _m);
  }
  nodeMesh.instanceMatrix.needsUpdate = true;
}

/* ===== 描边 / 护壳 / 光环 / 根环 ===== */
const rootRims = [], leafRims = [], shells = [];
let rootRimMesh = null, leafRimMesh = null, shellMesh = null, ringMesh = null;
let haloMat = null, haloScaleK = 1;
const haloPools = []; // j → { slots:[{n,q0,axis,speed,on}], mesh }
const rings = [];     // {grp,y}
let ringsOn = false, shellsOn = false;

export function addRimSlot(n) {
  if (n.level === 0) { n.rimIdx = rootRims.length; rootRims.push(n); }
  else { n.rimIdx = leafRims.length; leafRims.push(n); }
  n.rimOn = true;
}
export function addShellSlot(n, axis) {
  n.shellIdx = shells.length; n.shellAxis = axis; shells.push(n); n.shellOn = false;
}
export function addHaloSlot(n, j, q0, axis, speed) {
  const pool = haloPools[j] || (haloPools[j] = { slots: [], mesh: null });
  const slot = { n, q0, axis, speed, on: false };
  n.haloSlots.push(slot);
  pool.slots.push(slot);
}
export function addRingSlot(grp, y) { rings.push({ grp, y }); }
export function setRingsVisible(v) { ringsOn = v; }
export function setShellsVisible(v) { shellsOn = v; }
export function setHaloStyle(scaleK, opacity) { haloScaleK = scaleK; if (haloMat) haloMat.opacity = opacity; }

/* ===== 发光点池(SDD 脉冲 + 引力粒子共用;additive 下「颜色×透明度」直接烘进 tint) ===== */
const dots = [];
let dotMesh = null, aTint = null, dotsActive = 0;

export function addDotSlot(scale) {
  const i = dots.length;
  dots.push({ scale, hidden: true });
  return i;
}
export function dotSet(i, pos, hex, alpha) {
  const d = dots[i];
  if (d.hidden) { d.hidden = false; dotsActive++; }
  _m.compose(pos, Q_ID, _s.setScalar(d.scale));
  dotMesh.setMatrixAt(i, _m);
  _col.setHex(hex);
  aTint.array[i * 3] = _col.r * alpha; aTint.array[i * 3 + 1] = _col.g * alpha; aTint.array[i * 3 + 2] = _col.b * alpha;
  dotMesh.count = dots.length; // 槽位固定编址,有活跃点时全量绘制(隐藏槽为零缩放)
  dotMesh.instanceMatrix.needsUpdate = true;
  aTint.needsUpdate = true;
}
export function dotHide(i) {
  const d = dots[i];
  if (d.hidden) return;
  d.hidden = true;
  dotsActive--;
  dotMesh.setMatrixAt(i, ZERO_M);
  if (!dotsActive) dotMesh.count = 0; // 全部熄灭 → 整池跳过顶点管线
  dotMesh.instanceMatrix.needsUpdate = true;
}

function makeTintMaterial() {
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  mat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', 'attribute vec3 aTint;\nvarying vec3 vTint;\n#include <common>')
      .replace('#include <begin_vertex>', 'vTint = aTint;\n#include <begin_vertex>');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', 'varying vec3 vTint;\n#include <common>')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( diffuse * vTint, opacity );');
  };
  mat.customProgramCacheKey = () => 'dot-pool';
  return mat;
}

/* ===== 构建(在全部登记完成后调用一次) ===== */
export function buildPools() {
  const N = nodeList.length;
  nodeMesh = instanced(new THREE.SphereGeometry(1, 18, 12), makeNodeMaterial(), N, 1);
  aColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3).setUsage(THREE.DynamicDrawUsage);
  aExtra = new THREE.InstancedBufferAttribute(new Float32Array(N * 2), 2).setUsage(THREE.DynamicDrawUsage);
  nodeMesh.geometry.setAttribute('aColor', aColor);
  nodeMesh.geometry.setAttribute('aExtra', aExtra);
  for (const n of nodeList) {
    setNodeColor(n, n.color);
    aExtra.array[n.idx * 2] = n.emissiveK; aExtra.array[n.idx * 2 + 1] = n.opacity;
  }
  aExtra.needsUpdate = true;
  syncNodeMatrices();

  rootRimMesh = instanced(new THREE.SphereGeometry(1, 12, 9),
    new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: .4 }), rootRims.length, 2);
  leafRimMesh = instanced(new THREE.SphereGeometry(1, 10, 8),
    new THREE.MeshBasicMaterial({ color: GREEN, wireframe: true, transparent: true, opacity: .24 }), leafRims.length, 2);
  shellMesh = instanced(new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshBasicMaterial({ color: GREEN, wireframe: true, transparent: true, opacity: .5 }), shells.length, 2);

  haloMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false });
  haloPools.forEach((pool, j) => {
    if (!pool) return;
    pool.mesh = instanced(new THREE.TorusGeometry(.95 + j * .32, .035, 6, 40), haloMat, pool.slots.length, 4);
  });

  ringMesh = instanced(new THREE.TorusGeometry(2.1, .05, 8, 48),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false }), rings.length, 4);

  dotMesh = instanced(new THREE.SphereGeometry(1, 8, 6), makeTintMaterial(), dots.length, 5);
  aTint = new THREE.InstancedBufferAttribute(new Float32Array(dots.length * 3), 3).setUsage(THREE.DynamicDrawUsage);
  dotMesh.geometry.setAttribute('aTint', aTint);

  // 初始全部隐藏:count=0,首帧 updatePools 会按可见性打包填充
  dotMesh.count = 0; ringMesh.count = 0; shellMesh.count = 0;
  rootRimMesh.count = 0; leafRimMesh.count = 0;
  haloPools.forEach(p => { if (p) p.mesh.count = 0; });
}

/* ===== 每帧更新(moved = 节点/树发生位移,需重同步所有跟随位置) =====
   自旋/开关类装饰每次都整池重写,因此按「可见实例排前面 + mesh.count 截断」紧凑打包:
   隐藏实例完全不进顶点管线(弱 GPU / 软渲染下这是省顶点算力的关键)。 */
let decorDirty = true, wasShells = false, wasSdd = false;
export function markDecorDirty() { decorDirty = true; }

export function updatePools(t, moved) {
  const syncAll = moved || decorDirty;
  if (moved) syncNodeMatrices();

  // 根环描边:自旋 → 每帧重组(仅 16 个)
  let w = 0;
  for (const n of rootRims) {
    if (!n.rimOn) continue;
    _q.setFromAxisAngle(AXIS_Y, t * .25 * SPIN);
    _m.compose(nodeWorld(n, _p), _q, _s.setScalar(n.radius * 1.45));
    rootRimMesh.setMatrixAt(w++, _m);
  }
  rootRimMesh.count = w;
  rootRimMesh.instanceMatrix.needsUpdate = true;

  // 叶描边:不自旋 → 只在位移/外观变化时重组
  if (syncAll) {
    w = 0;
    for (const n of leafRims) {
      if (!n.rimOn) continue;
      _m.compose(nodeWorld(n, _p), Q_ID, _s.setScalar(n.radius * 1.42));
      leafRimMesh.setMatrixAt(w++, _m);
    }
    leafRimMesh.count = w;
    leafRimMesh.instanceMatrix.needsUpdate = true;
  }

  // TDD 护壳:开启时自旋
  if (shellsOn) {
    w = 0;
    for (const n of shells) {
      if (!n.shellOn) continue;
      _q.setFromAxisAngle(n.shellAxis, t * .35 * SPIN);
      _m.compose(nodeWorld(n, _p), _q, _s.setScalar(n.radius * 1.95));
      shellMesh.setMatrixAt(w++, _m);
    }
    shellMesh.count = w;
    shellMesh.instanceMatrix.needsUpdate = true;
    wasShells = true;
  } else if (wasShells || decorDirty) {
    shellMesh.count = 0;
    wasShells = false;
  }

  // 多义性光环:可见的自旋并打包到前排
  for (const pool of haloPools) {
    if (!pool) continue;
    w = 0;
    for (const slot of pool.slots) {
      if (!slot.on) continue;
      _q2.setFromAxisAngle(slot.axis, t * slot.speed * SPIN);
      _q.multiplyQuaternions(slot.q0, _q2);
      _m.compose(nodeWorld(slot.n, _p), _q, _s.setScalar(haloScaleK));
      pool.mesh.setMatrixAt(w++, _m);
    }
    pool.mesh.count = w;
    pool.mesh.visible = w > 0;
    if (w) pool.mesh.instanceMatrix.needsUpdate = true;
  }

  // SDD 根环:呼吸缩放
  if (ringsOn) {
    const k = 1 + .18 * Math.sin(t * 2.4);
    rings.forEach((r, i) => {
      _p.copy(r.grp.position); _p.y += r.y;
      _m.compose(_p, Q_X90, _s.setScalar(k));
      ringMesh.setMatrixAt(i, _m);
    });
    ringMesh.count = rings.length;
    ringMesh.instanceMatrix.needsUpdate = true;
  } else ringMesh.count = 0;

  // SDD 脉冲:沿树边流动(端点实时读取,跟随引力形变)
  const sdd = stratOn('sdd');
  if (sdd) {
    for (const pu of pulses) {
      const k = (t * .3 + pu.phase) % 1;
      nodeWorld(pu.e.na, _p).lerp(nodeWorld(pu.e.nb, _p2), k);
      dotSet(pu.slot, _p, GOLD, .9 * Math.sin(k * Math.PI));
    }
    wasSdd = true;
  } else if (wasSdd) {
    for (const pu of pulses) dotHide(pu.slot);
    wasSdd = false;
  }

  decorDirty = false;
}
