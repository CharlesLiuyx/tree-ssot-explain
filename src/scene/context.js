// 渲染上下文:renderer / scene / camera / controls / 灯光 / 地面网格,
// 以及帧率调度(wake)、自适应画质与相机飞行(flyCamera)。其他 scene 系统从这里拿 scene 挂载自己。

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { tweenVec, cancelTween } from '../core/tween.js';
import { labelsResize } from './labels.js';

export const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: false, powerPreference: 'high-performance' });
// 像素比是全屏满帧的最大开销来源:Retina 下 dpr=2 意味着 4× 片元着色。
// 场景大量叠加透明 + 雾 = 片元受限,dpr 封到 1.5 几乎无损画质却省 ~44% 片元。
let pixelRatioCap = Math.min(devicePixelRatio, 1.5);
renderer.setPixelRatio(pixelRatioCap);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0e16, 0.0030);

export const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 900);
camera.position.set(0, 60, 152);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.minDistance = 10; controls.maxDistance = 380; controls.maxPolarAngle = Math.PI * .52;
controls.target.set(0, 6, -14);
controls.autoRotateSpeed = .55;

/* ===== 帧率调度:这是 CPU 占用的核心开关 =====
   全场景经过实例化/池化后单帧成本足够低:环境态直接跑 60fps,交互态放开到显示器刷新率(封 120);
   完全静止(不自转、无动画、近期无交互)→ 直接停止渲染,CPU 归零。
   若机器持续跟不上,自适应画质会先降像素比、最后才把环境帧率退回 30(只降不升)。
   自转用 controls.update(dt) 时间步驱动,转速与帧率解耦。 */
export const SMOOTH_FPS = 120;
let _ambientFps = 60;
export const ambientFps = () => _ambientFps;
let _wakeUntil = 0, _smoothUntil = 0;
export function wake(ms = 500) { const n = performance.now() + ms; if (n > _wakeUntil) _wakeUntil = n; }
export function smoothWake(ms = 240) { const n = performance.now() + ms; if (n > _smoothUntil) _smoothUntil = n; wake(ms); }
export const wakeUntil = () => _wakeUntil;
export const smoothUntil = () => _smoothUntil;
controls.addEventListener('change', () => { if (!controls.autoRotate) smoothWake(260); }); // 手动拖拽/缩放/释放后的惯性 → 满帧
['pointerdown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => smoothWake(), { passive: true }));
['keydown', 'pointerup', 'click'].forEach(ev => addEventListener(ev, () => wake(2600)));   // 换步/开关策略后,留时间让形变与熵值动画收敛

/* ===== 交互期动态分辨率 =====
   Retina 满帧的主要压力在片元:dpr 1.5 ≈ 2.25× 像素,叠加大面积 additive 透明(圆盘/光束/光环)。
   拖拽/缩放期间画面本来就在动,暂降到 dpr 1.2(片元省 ~36%)换稳定满帧;
   手势结束后自动恢复满分辨率——setPixelRatio 会重建绘制缓冲,
   因此恢复的那一帧必须立即渲染(由主循环保证),否则画布会停在空白。
   信号只取画布上的真实手势(按下-抬起区间 + 松手后 600ms 惯性尾巴 + 滚轮):
   不挂 controls.change——它对一切相机移动都触发(切步飞行/停自转后的余摆),那些该保持满清晰度;
   点面板按钮/拖面板滑杆也不会降档,背景不闪糊。
   与 degradeQuality 的「只降不升」永久降档互补:这里是可逆的、按手势作用域的临时降档。 */
const INTERACT_DPR = 1.2;
let _dprDrag = false, _dprUntil = 0, _dprLow = false;
function dprWake(ms) { const n = performance.now() + ms; if (n > _dprUntil) _dprUntil = n; }
export const dprLowered = () => _dprLow;
export function applyInteractDpr(now) {
  const want = (_dprDrag || now < _dprUntil) && pixelRatioCap >= INTERACT_DPR + .2; // 上限已降到 1.2 附近则无意义,不再切换
  if (want === _dprLow) return;
  _dprLow = want;
  renderer.setPixelRatio(want ? INTERACT_DPR : pixelRatioCap);
}
function dprRelease() { if (_dprDrag) { _dprDrag = false; dprWake(600); } } // 惯性大头在低档内收敛,亚像素尾巴回满档
renderer.domElement.addEventListener('pointerdown', () => { _dprDrag = true; dprWake(0); }, { passive: true });
addEventListener('pointerup', dprRelease, { passive: true });      // 释放可能发生在画布外
addEventListener('pointercancel', dprRelease, { passive: true });
renderer.domElement.addEventListener('wheel', () => dprWake(420), { passive: true });

/* 自适应画质:持续跟不上才逐级降档(像素比 1.5→1.25→1.0,最后环境帧率 60→30),只降不升。
   由主循环喂入单帧真实耗时。 */
export function degradeQuality() {
  if (pixelRatioCap > 1) {
    pixelRatioCap = Math.max(1, Math.round((pixelRatioCap - .25) * 100) / 100);
    if (!_dprLow) renderer.setPixelRatio(pixelRatioCap); // 交互降档中不抢:恢复时自然应用新上限
    return true;
  }
  if (_ambientFps > 30) { _ambientFps = 30; return true; }
  return false;
}

scene.add(new THREE.AmbientLight(0xbfd0ff, .55));
const dir = new THREE.DirectionalLight(0xffffff, 1.1); dir.position.set(24, 48, 20); scene.add(dir);
scene.add(new THREE.HemisphereLight(0x3a4a70, 0x0a0d14, .5));

const grid = new THREE.GridHelper(320, 78, 0x2a3446, 0x141b28);
grid.material.transparent = true; grid.material.opacity = .3;
grid.matrixAutoUpdate = false; grid.updateMatrix();
scene.add(grid);

/* 全局时钟:主循环与树之树生长动画共用同一时间基准 */
export const clock = new THREE.Clock();

/* 相机飞行:同时补间相机位置与注视点;窄视口(竖屏/分栏)按比例推远,避免两侧的树被裁掉 */
let camTweenA = null, camTweenB = null;
export function flyCamera(pos, tgt, dur = 1.6, ease) {
  cancelTween(camTweenA); cancelTween(camTweenB);
  const k = camera.aspect < 1.45 ? Math.min(1.8, 1.45 / camera.aspect) : 1;
  const p = tgt.clone().add(pos.clone().sub(tgt).multiplyScalar(k));
  camTweenA = tweenVec(camera.position, p, dur, null, null, ease);
  camTweenB = tweenVec(controls.target, tgt, dur, null, null, ease);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labelsResize();
  wake(800);
});

/* 调试 / 自动化测试钩子(与 window.__vp 同类,只读) */
window.__three = { renderer, scene, camera };

