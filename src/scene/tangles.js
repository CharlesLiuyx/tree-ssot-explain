// 偶然交织系统:把 TANGLES 登记到节点上(多义性光环),并按当前策略重建纠缠线——
// 纠缠中(红)/ 已契约化走层间接口(琥珀)/ 循环中消解(灰)/ 已平台化改挂平台服务(金)。
//
// 性能核心:纠缠管几何全部预分配在两个大缓冲里(additive 池 + normal 池),
// 重建 = 就地重写顶点/顶点色 + drawRange,不再逐帧 new TubeGeometry / dispose(迁移动画不卡顿的关键)。

import * as THREE from 'three';
import { GOLD, RED, AMBER, GREY, WALL_XS, FOCUS_ID } from '../config.js';
import { TANGLES } from '../data/tangles.js';
import { nodesById, allNodes, nodeWorld } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';
import { V3, rng } from '../core/three-utils.js';
import { addHaloSlot } from './pools.js';
import { scene } from './context.js';
import { platNodes, platWorld } from './platform.js';

/* 登记交织关系 + 给被焊住的节点长出多义性光环(电子轨道隐喻:每一条交织 = 多出一个含义) */
export function registerTangles() {
  TANGLES.forEach((t, i) => {
    t.idx = i;
    t.aNode = nodesById.get(t.a); t.bNode = nodesById.get(t.b);
    if (!t.aNode || !t.bNode) throw new Error('TANGLE 节点不存在: ' + t.a + ' / ' + t.b);
    t.aName = t.aNode.name; t.bName = t.bNode.name;
    t.aNode.tangles.push(t); t.bNode.tangles.push(t);
    t.revealedNow = false; t.tubes = []; t.picks = [];
  });
  const _e = new THREE.Euler();
  for (const n of allNodes) {
    n.tangles.forEach((t, j) => {
      const q0 = new THREE.Quaternion().setFromEuler(_e.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI));
      const axis = V3(rng() - .5, rng() - .5, rng() - .5).normalize();
      addHaloSlot(n, j, q0, axis, .5 + rng() * .6);
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

/* ===== 预分配管道池 ===== */
const SEG = 40, RING = 6, VPT = (SEG + 1) * RING, IPT = SEG * RING * 6; // 每管顶点数 / 索引数

function makePool(cap, blending) {
  const geo = new THREE.BufferGeometry();
  const pos = new THREE.BufferAttribute(new Float32Array(cap * VPT * 3), 3).setUsage(THREE.DynamicDrawUsage);
  const col = new THREE.BufferAttribute(new Float32Array(cap * VPT * 4), 4).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', pos);
  geo.setAttribute('color', col);
  const idx = new (cap * VPT > 65535 ? Uint32Array : Uint16Array)(cap * IPT);
  for (let k = 0; k < cap; k++) {
    const vo = k * VPT, io = k * IPT;
    for (let i = 0; i < SEG; i++) for (let j = 0; j < RING; j++) {
      const j2 = (j + 1) % RING, o = io + (i * RING + j) * 6;
      const a = vo + i * RING + j, b = vo + (i + 1) * RING + j, c = vo + (i + 1) * RING + j2, d = vo + i * RING + j2;
      idx[o] = a; idx[o + 1] = b; idx[o + 2] = d;
      idx[o + 3] = b; idx[o + 4] = c; idx[o + 5] = d;
    }
  }
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.setDrawRange(0, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, blending, depthWrite: false, side: THREE.DoubleSide,
  }));
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;
  mesh.renderOrder = 3;
  scene.add(mesh);
  return { mesh, geo, pos, col, used: 0 };
}

let poolAdd = null, poolNorm = null;
export function buildTanglePool() {
  poolAdd = makePool(TANGLES.length * 2, THREE.AdditiveBlending);  // 平台化模式每条 2 根金管
  poolNorm = makePool(TANGLES.length, THREE.NormalBlending);       // Loops 消解的灰管
}

/* 曲线采样(世界坐标)写进 samples(Float32Array (SEG+1)*3),供扫掠与悬停拾取共用 */
const _p = new THREE.Vector3();
function sampleCurve(curve, samples) {
  for (let i = 0; i <= SEG; i++) {
    curve.getPoint(i / SEG, _p);
    samples[i * 3] = _p.x; samples[i * 3 + 1] = _p.y; samples[i * 3 + 2] = _p.z;
  }
}

/* 沿采样折线扫出半径 r 的管(平行传输标架,无扭转),顶点色 RGBA 常量 */
const _tan = new THREE.Vector3(), _nrm = new THREE.Vector3(), _bin = new THREE.Vector3(), _c = new THREE.Color();
function sweepTube(pool, slot, samples, r, hex, alpha) {
  const P = pool.pos.array, C = pool.col.array;
  _c.setHex(hex);
  let po = slot * VPT * 3, co = slot * VPT * 4;
  _tan.set(samples[3] - samples[0], samples[4] - samples[1], samples[5] - samples[2]).normalize();
  _nrm.set(-_tan.z, 0, _tan.x); // 与竖直轴叉积 → 水平初始法线
  if (_nrm.lengthSq() < 1e-6) _nrm.set(1, 0, 0); else _nrm.normalize();
  for (let i = 0; i <= SEG; i++) {
    const i0 = Math.max(0, i - 1) * 3, i1 = Math.min(SEG, i + 1) * 3;
    _tan.set(samples[i1] - samples[i0], samples[i1 + 1] - samples[i0 + 1], samples[i1 + 2] - samples[i0 + 2]).normalize();
    _nrm.addScaledVector(_tan, -_nrm.dot(_tan)); // 平行传输:去掉切向分量
    if (_nrm.lengthSq() < 1e-6) _nrm.set(-_tan.z, 0, _tan.x);
    _nrm.normalize();
    _bin.crossVectors(_tan, _nrm);
    const cx = samples[i * 3], cy = samples[i * 3 + 1], cz = samples[i * 3 + 2];
    for (let j = 0; j < RING; j++) {
      const a = j / RING * Math.PI * 2, ca = Math.cos(a) * r, sa = Math.sin(a) * r;
      P[po] = cx + _nrm.x * ca + _bin.x * sa;
      P[po + 1] = cy + _nrm.y * ca + _bin.y * sa;
      P[po + 2] = cz + _nrm.z * ca + _bin.z * sa;
      C[co] = _c.r; C[co + 1] = _c.g; C[co + 2] = _c.b; C[co + 3] = alpha;
      po += 3; co += 4;
    }
  }
}

/* 写一条管的透明度(STEP 3 高亮呼吸用;只动 alpha 分量 + 增量上传) */
function setTubeAlpha(pool, slot, alpha) {
  const C = pool.col.array;
  for (let o = slot * VPT * 4 + 3, end = (slot + 1) * VPT * 4; o < end; o += 4) C[o] = alpha;
  pool.col.addUpdateRange(slot * VPT * 4, VPT * 4);
  pool.col.needsUpdate = true;
}

let onRebuilt = null;       // 重建后的回调(main.js 装配为策略统计栏刷新)
export function setOnTanglesRebuilt(fn) { onRebuilt = fn; }

/* 曲线复用(避免每次重建的分配) */
const _qb = new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
const _cr = new THREE.CatmullRomCurve3([], false, 'catmullrom', .2);
const _pa = new THREE.Vector3(), _pb = new THREE.Vector3(), _pn = new THREE.Vector3(), _mid = new THREE.Vector3();

function pickBuf(t, i) {
  if (!t.picks[i]) t.picks[i] = new Float32Array((SEG + 1) * 3);
  return t.picks[i];
}

/* 重建全部纠缠线(树移动/策略切换/逐条揭示时调用;就地重写预分配缓冲) */
export function rebuildTangles() {
  poolAdd.used = 0; poolNorm.used = 0;
  runtime.tangleCounts = { red: 0, amber: 0, grey: 0, plat: 0 };
  const counts = runtime.tangleCounts;
  const stage = state.stage;
  for (const t of TANGLES) {
    t.tubes.length = 0; t.pickCount = 0;
    if (!t.revealedNow) continue;
    nodeWorld(t.aNode, _pa); nodeWorld(t.bNode, _pb);
    if (stratOn('platform')) {
      platWorld(platNodes[t.platform], _pn);
      for (const p of [_pa, _pb]) {
        _qb.v0.copy(p); _qb.v2.copy(_pn);
        _qb.v1.copy(p).add(_pn).multiplyScalar(.5); _qb.v1.y += 3.5;
        const s = pickBuf(t, t.pickCount++);
        sampleCurve(_qb, s);
        sweepTube(poolAdd, poolAdd.used, s, .06, GOLD, .5);
        t.tubes.push({ pool: poolAdd, slot: poolAdd.used++, alpha: .5 });
      }
      counts.plat++;
    } else if (stratOn('layer')) {
      const gates = WALL_XS.filter(x => x > Math.min(_pa.x, _pb.x) && x < Math.max(_pa.x, _pb.x))
        .sort((x, y) => _pa.x < _pb.x ? x - y : y - x).map(x => V3(x, 9, 0));
      _cr.points = [_pa.clone(), ...gates, _pb.clone()];
      const s = pickBuf(t, t.pickCount++);
      sampleCurve(_cr, s);
      sweepTube(poolAdd, poolAdd.used, s, .08, AMBER, .55);
      t.tubes.push({ pool: poolAdd, slot: poolAdd.used++, alpha: .55 });
      counts.amber++;
    } else if (t.resolvedByLoops) {
      _qb.v0.copy(_pa); _qb.v2.copy(_pb);
      _qb.v1.copy(_pa).add(_pb).multiplyScalar(.5); _qb.v1.y += 4;
      const s = pickBuf(t, t.pickCount++);
      sampleCurve(_qb, s);
      sweepTube(poolNorm, poolNorm.used, s, .04, GREY, .22);
      t.tubes.push({ pool: poolNorm, slot: poolNorm.used++, alpha: .22 });
      counts.grey++;
    } else {
      _qb.v0.copy(_pa); _qb.v2.copy(_pb);
      _mid.copy(_pa).add(_pb).multiplyScalar(.5);
      _mid.y += 5 + _pa.distanceTo(_pb) * .1;
      _qb.v1.copy(_mid);
      let op = stage === 0 ? .28 : .6;
      if (stage === 4) op = .22;      // 引力阶段:红线退后,突出洋红
      if (stage === 5) op = .18;      // 图外真相阶段:红线退后,突出幽灵根
      if (stage === 6) op = (t.aNode.gid === FOCUS_ID || t.bNode.gid === FOCUS_ID) ? .9 : .06;
      const s = pickBuf(t, t.pickCount++);
      sampleCurve(_qb, s);
      sweepTube(poolAdd, poolAdd.used, s, .11, RED, op);
      t.tubes.push({ pool: poolAdd, slot: poolAdd.used++, alpha: op });
      counts.red++;
    }
  }
  for (const pool of [poolAdd, poolNorm]) {
    pool.geo.setDrawRange(0, pool.used * IPT);
    pool.pos.clearUpdateRanges(); pool.pos.addUpdateRange(0, pool.used * VPT * 3); pool.pos.needsUpdate = true;
    pool.col.clearUpdateRanges(); pool.col.addUpdateRange(0, pool.used * VPT * 4); pool.col.needsUpdate = true;
  }
  onRebuilt && onRebuilt();
}

/* STEP 3 案例逐条揭示时的高亮呼吸(主循环每帧调用;只写发生变化的管) */
export function updateTangleHighlight(t) {
  if (state.stage !== 3 || runtime.highlightTangle < 0) return;
  TANGLES.forEach((tg, i) => {
    const target = i === runtime.highlightTangle ? .75 + .25 * Math.sin(t * 5) : .5;
    for (const tube of tg.tubes) {
      if (tube.alpha === target) continue;
      tube.alpha = target;
      setTubeAlpha(tube.pool, tube.slot, target);
    }
  });
}

/* 悬停拾取:对可见纠缠管做「射线-折线段距离」检测(替代三角形求交)。
   返回 { tangle, t } —— t 为沿射线距离,便于与节点拾取比远近。 */
const _sa = new THREE.Vector3(), _sb = new THREE.Vector3(), _onRay = new THREE.Vector3();
export function pickTangle(ray) {
  let best = null, bestT = Infinity;
  for (const tg of TANGLES) {
    if (!tg.revealedNow || !tg.pickCount) continue;
    for (let c = 0; c < tg.pickCount; c++) {
      const S = tg.picks[c];
      const r = tg.tubes[c] ? Math.max(.3, 2.6 * (tg.tubes[c].pool === poolNorm ? .04 : .11)) : .3;
      for (let i = 0; i < SEG; i += 2) { // 隔段检测足够精确(段长 ≪ 阈值)
        _sa.fromArray(S, i * 3); _sb.fromArray(S, Math.min(SEG, i + 2) * 3);
        if (ray.distanceSqToSegment(_sa, _sb, _onRay) < r * r) {
          const along = _onRay.distanceTo(ray.origin);
          if (along < bestT) { bestT = along; best = tg; }
          break;
        }
      }
    }
  }
  return best ? { tangle: best, t: bestT } : null;
}
