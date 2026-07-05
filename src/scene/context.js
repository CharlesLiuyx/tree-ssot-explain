// 渲染上下文:renderer / CSS2D / scene / camera / controls / 灯光 / 地面网格,
// 以及帧率调度(wake)与相机飞行(flyCamera)。其他 scene 系统从这里拿 scene 挂载自己。

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { tweenVec, cancelTween } from '../core/tween.js';

export const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
// 像素比是全屏满帧的最大开销来源:Retina 下 dpr=2 意味着 4× 片元着色。
// 场景大量叠加透明 + 雾 = 片元受限,dpr 封到 1.5 几乎无损画质却省 ~44% 片元。
let pixelRatioCap = Math.min(devicePixelRatio, 1.5);
renderer.setPixelRatio(pixelRatioCap);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

export const css2d = new CSS2DRenderer();
css2d.setSize(innerWidth, innerHeight);
Object.assign(css2d.domElement.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '4' });
document.body.appendChild(css2d.domElement);

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
   环境(缓慢自转/呼吸)30fps 足够顺;交互(拖拽/缩放/切步动画)临时提到 60fps 保证跟手;
   完全静止(不自转、无动画、近期无交互)→ 直接停止渲染,CPU 归零。
   自转用 controls.update(dt) 时间步驱动,转速与帧率解耦。 */
export const AMBIENT_FPS = 30, SMOOTH_FPS = 60;
let _wakeUntil = 0, _smoothUntil = 0;
export function wake(ms = 500) { const n = performance.now() + ms; if (n > _wakeUntil) _wakeUntil = n; }
export function smoothWake(ms = 240) { const n = performance.now() + ms; if (n > _smoothUntil) _smoothUntil = n; wake(ms); }
export const wakeUntil = () => _wakeUntil;
export const smoothUntil = () => _smoothUntil;
controls.addEventListener('change', () => { if (!controls.autoRotate) smoothWake(260); }); // 手动拖拽/缩放/释放后的惯性 → 60fps
['pointerdown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => smoothWake(), { passive: true }));
['keydown', 'pointerup', 'click'].forEach(ev => addEventListener(ev, () => wake(2600)));   // 换步/开关策略后,留时间让形变与熵值动画收敛

/* 自适应画质:持续跟不上才逐级降像素比(1.5→1.25→1.0),只降不升。由主循环喂入单帧真实耗时。 */
export function degradeQuality() {
  if (pixelRatioCap <= 1) return false;
  pixelRatioCap = Math.max(1, Math.round((pixelRatioCap - .25) * 100) / 100);
  renderer.setPixelRatio(pixelRatioCap);
  return true;
}
export const pixelRatio = () => pixelRatioCap;

scene.add(new THREE.AmbientLight(0xbfd0ff, .55));
const dir = new THREE.DirectionalLight(0xffffff, 1.1); dir.position.set(24, 48, 20); scene.add(dir);
scene.add(new THREE.HemisphereLight(0x3a4a70, 0x0a0d14, .5));

const grid = new THREE.GridHelper(320, 78, 0x2a3446, 0x141b28);
grid.material.transparent = true; grid.material.opacity = .3; scene.add(grid);

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
  css2d.setSize(innerWidth, innerHeight);
  wake(800);
});
