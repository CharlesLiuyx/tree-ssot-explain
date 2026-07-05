// three.js 工具:确定性随机、共享临时向量、圆柱枝干、静态矩阵、两点线段、解析拾取。

import * as THREE from 'three';

export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const UP = V3(0, 1, 0);

/* 确定性随机(种子 42):树形抖动、光环姿态等全部可复现。
   注意:rng 的调用顺序决定形状——建树/建光环的初始化顺序不可随意调换。 */
function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const rng = mulberry32(42);

/* 共享临时向量(避免每帧分配)。setCylinder 内部占用 _v1——调用方同帧只能用 _v2/_v3/_v4 */
export const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();

/* 帧率无关的渐近系数:blend += (target-blend)*expK(dt,k)。k 为 60fps 下等效每帧系数的连续化速率 */
export const expK = (dt, k) => 1 - Math.exp(-k * dt);

/* 静态对象:关掉逐帧矩阵重组(位置/旋转/缩放定型后调用;之后再改动需手动 updateMatrix) */
export function statik(o) { o.matrixAutoUpdate = false; o.updateMatrix(); return o; }

/* 单位长度圆柱 + scale.y 拉伸,便于每帧更新(引力形变时枝干跟着拉长)。
   动态圆柱统一走 setCylinder(内部负责 updateMatrix),故关闭自动矩阵。 */
export function makeCylinder(r, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 6, 1, true), mat);
  m.matrixAutoUpdate = false;
  return m;
}
export function setCylinder(mesh, a, b) {
  const d = _v1.copy(b).sub(a), len = Math.max(.001, d.length());
  mesh.position.copy(a).addScaledVector(d, .5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  mesh.scale.set(1, len, 1);
  mesh.updateMatrix();
}

/* 两点线段:预分配几何,每帧就地写端点(替代 setFromPoints 的逐帧分配)。dashed = 需要 lineDistance */
export function makeLine2(mat, dashed) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  if (dashed) g.setAttribute('lineDistance', new THREE.BufferAttribute(new Float32Array(2), 1));
  const line = new THREE.Line(g, mat);
  line.frustumCulled = false;
  return statik(line);
}
export function setLine2(line, a, b) {
  const p = line.geometry.attributes.position;
  p.array[0] = a.x; p.array[1] = a.y; p.array[2] = a.z;
  p.array[3] = b.x; p.array[4] = b.y; p.array[5] = b.z;
  p.needsUpdate = true;
  const ld = line.geometry.attributes.lineDistance;
  if (ld) { ld.array[1] = _v1.copy(b).sub(a).length(); ld.needsUpdate = true; }
}

export function disposeGroup(g) {
  for (const c of [...g.children]) {
    g.remove(c);
    c.traverse(o => {
      if (o.isLabel) o.dispose();
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose && o.material.dispose();
    });
  }
}

// 把一组线段烘焙为一份合并圆柱几何(仅 position + index;枝干用不吃光照的材质,无需法线)。
// 每段 vertsPerSeg 个顶点连续排布——调用方可按段区间写顶点色等附加属性。
export function bakeCylinders(segs, r) {
  const tpl = new THREE.CylinderGeometry(r, r, 1, 6, 1, true);
  const tp = tpl.attributes.position, ti = tpl.index.array, tvc = tp.count;
  const pos = new Float32Array(segs.length * tvc * 3);
  const total = segs.length * tvc;
  const idx = total > 65535 ? new Uint32Array(segs.length * ti.length) : new Uint16Array(segs.length * ti.length);
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), mid = new THREE.Vector3(), d = new THREE.Vector3();
  segs.forEach((sg, k) => {
    d.copy(sg.b).sub(sg.a); const len = Math.max(.001, d.length());
    mid.copy(sg.a).addScaledVector(d, .5);
    q.setFromUnitVectors(UP, d.normalize());
    m.compose(mid, q, s.set(1, len, 1));
    for (let i = 0; i < tvc; i++) {
      v.fromBufferAttribute(tp, i).applyMatrix4(m);
      const o = (k * tvc + i) * 3;
      pos[o] = v.x; pos[o + 1] = v.y; pos[o + 2] = v.z;
    }
    for (let i = 0; i < ti.length; i++) idx[k * ti.length + i] = ti[i] + k * tvc;
  });
  tpl.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return { geo: g, vertsPerSeg: tvc };
}

/* 解析求交:射线 × 球。命中返回沿射线距离,未命中返回 -1(替代三角形遍历的拾取) */
const _oc = new THREE.Vector3();
export function raySphereT(ray, center, r) {
  _oc.copy(ray.origin).sub(center);
  const b = _oc.dot(ray.direction);
  const c = _oc.lengthSq() - r * r;
  const disc = b * b - c;
  if (disc < 0) return -1;
  const sq = Math.sqrt(disc);
  const t0 = -b - sq;
  if (t0 >= 0) return t0;
  const t1 = -b + sq;
  return t1 >= 0 ? t1 : -1;
}
