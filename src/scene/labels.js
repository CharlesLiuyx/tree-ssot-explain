// 轻量 2D 标签系统(替代 CSS2DRenderer):
// 标签在创建时进登记表,渲染只遍历登记表(几十个),不再每帧递归整个场景图;
// transform / display / zIndex 全部带缓存,不变不写 DOM。

import * as THREE from 'three';

const container = document.createElement('div');
Object.assign(container.style, { position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '4' });
document.body.appendChild(container);

const labels = new Set();

export class Label extends THREE.Object3D {
  constructor(el) {
    super();
    this.isLabel = true;
    this.element = el;
    el.style.position = 'absolute';
    el.style.userSelect = 'none';
    this._shown = false;   // 当前 display 状态缓存
    this._tf = '';         // 当前 transform 缓存
    this._z = '';          // 当前 zIndex 缓存
    this._dist = 0;
    el.style.display = 'none';
    container.appendChild(el);
    labels.add(this);
    this.addEventListener('removed', () => this.dispose());
  }
  dispose() {
    labels.delete(this);
    if (this.element.parentNode) this.element.parentNode.removeChild(this.element);
  }
}

/* 祖先链任一 visible=false 即隐藏(标签层级很浅,逐级上溯开销可忽略) */
function chainVisible(o) {
  for (let n = o; n; n = n.parent) if (!n.visible) return false;
  return true;
}

const _v = new THREE.Vector3();
const _vp = new THREE.Matrix4();
const _visibleNow = [];
let W2 = innerWidth / 2, H2 = innerHeight / 2;

export function labelsResize() { W2 = innerWidth / 2; H2 = innerHeight / 2; }

export function renderLabels(camera) {
  _vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  _visibleNow.length = 0;
  for (const lab of labels) {
    let show = chainVisible(lab);
    if (show) {
      _v.setFromMatrixPosition(lab.matrixWorld).applyMatrix4(_vp);
      show = _v.z >= -1 && _v.z <= 1;
      if (show) {
        const tf = `translate(-50%,-50%) translate(${(_v.x * W2 + W2).toFixed(1)}px,${(-_v.y * H2 + H2).toFixed(1)}px)`;
        if (tf !== lab._tf) { lab._tf = tf; lab.element.style.transform = tf; }
        lab._dist = _v.z;
        _visibleNow.push(lab);
      }
    }
    if (show !== lab._shown) { lab._shown = show; lab.element.style.display = show ? '' : 'none'; }
  }
  // 深度排序 → zIndex(近的盖住远的);只在变化时写
  _visibleNow.sort((a, b) => a._dist - b._dist);
  for (let i = 0; i < _visibleNow.length; i++) {
    const z = String(_visibleNow.length - i);
    const lab = _visibleNow[i];
    if (z !== lab._z) { lab._z = z; lab.element.style.zIndex = z; }
  }
}
