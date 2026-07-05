// three.js 工具:确定性随机、共享临时向量、圆柱枝干、几何合并与缓存。

import * as THREE from 'three';

export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const UP = V3(0, 1, 0);

/* 确定性随机(种子 42):树形抖动、光环姿态等全部可复现。
   注意:rng 的调用顺序决定形状——建树/建光环的初始化顺序不可随意调换。 */
function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const rng = mulberry32(42);

/* 共享临时向量(避免每帧分配)。setCylinder 内部占用 _v1——调用方同帧只能用 _v2/_v3/_v4 */
export const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();

/* 单位长度圆柱 + scale.y 拉伸,便于每帧更新(引力形变时枝干跟着拉长) */
export function makeCylinder(r, mat) {
  return new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 6, 1, true), mat);
}
export function setCylinder(mesh, a, b) {
  const d = _v1.copy(b).sub(a), len = Math.max(.001, d.length());
  mesh.position.copy(a).addScaledVector(d, .5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  mesh.scale.set(1, len, 1);
}

export function disposeGroup(g) {
  for (const c of [...g.children]) {
    g.remove(c);
    c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose && o.material.dispose(); });
  }
}

// 把一组网格的几何按各自的 local 矩阵烘焙进一份合并几何(只保留 position + index)。
// 枝干用 MeshBasicMaterial(不吃光照),无需法线,合并后一棵树的上百条枝 = 1 个 draw call。
export function mergeMeshGeoms(meshes) {
  let vc = 0, ic = 0;
  for (const m of meshes) { vc += m.geometry.attributes.position.count; ic += m.geometry.index.count; }
  const pos = new Float32Array(vc * 3);
  const idx = vc > 65535 ? new Uint32Array(ic) : new Uint16Array(ic);
  let vo = 0, io = 0; const v = new THREE.Vector3();
  for (const m of meshes) {
    m.updateMatrix();
    const p = m.geometry.attributes.position, index = m.geometry.index.array;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m.matrix);
      pos[(vo + i) * 3] = v.x; pos[(vo + i) * 3 + 1] = v.y; pos[(vo + i) * 3 + 2] = v.z;
    }
    for (let i = 0; i < index.length; i++) idx[io + i] = index[i] + vo;
    vo += p.count; io += index.length;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

// 球体几何按「半径×细分」缓存并共享:数百个节点按尺寸复用,几何体从数百降到个位数。
const _sphereGeoCache = new Map();
export function sphereGeo(size, w, h) {
  const key = size.toFixed(3) + '|' + w + '|' + h;
  let g = _sphereGeoCache.get(key);
  if (!g) { g = new THREE.SphereGeometry(size, w, h); _sphereGeoCache.set(key, g); }
  return g;
}
