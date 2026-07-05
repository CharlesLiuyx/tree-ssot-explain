// 视口历史全景组件(V 键 / ⛶ 按钮):整棵历史树一屏铺开的模态 overlay。

import { mount, $ } from './dom.js';
import { VP_MAX } from '../config.js';
import { trees } from '../core/registry.js';

const overlay = mount(`
<div id="vp-map">
  <div class="vpm-card">
    <div class="vpm-head">
      <span class="vpm-title">视口历史 · 全景</span>
      <span class="vpm-stats" id="vpm-stats"></span>
      <button class="vpm-close" id="vpm-clear" type="button" title="清空本步视口历史（只保留起始视角并飞回）">⌫ 清空</button>
      <button class="vpm-close" id="vpm-close" type="button">✕ 关闭 <span class="kbd">Esc</span></button>
    </div>
    <div class="vpm-body" id="vpm-body"></div>
    <div class="vpm-foot">点击任意视口立即跳转（120ms）· <b>V</b> 键随时开关全景 · 每一步一棵历史树，切换步骤后重新生长 · 超过 30 个视口自动回收最久未访问的旁支叶子——根与当前路径永不回收</div>
  </div>
</div>`);

let handlers = {}; // {onNavigate,onClear,onClose}
export function initVpMap(h) {
  handlers = h;
  $('vpm-clear').onclick = () => handlers.onClear();
  $('vpm-close').onclick = () => handlers.onClose();
  overlay.addEventListener('click', e => { if (e.target === e.currentTarget) handlers.onClose(); }); // 点背板关闭
}

export function setVpMapOpen(open) { overlay.classList.toggle('open', open); }

function vpColor(n) { // 视口小圆点用「所属树」的颜色,根/步骤视角用金色
  const m = n.meta || {};
  if (m.kind === 'node' && m.node) {
    if (m.node.platform) return '#f3e9c8';
    if (m.node.tree >= 0) return '#' + trees[m.node.tree].def.color.toString(16).padStart(6, '0');
  }
  return '#ffd166';
}

/* vm = {root,current,depth,count,gcCount} */
export function renderVpMap(vm) {
  $('vpm-stats').textContent =
    `当前深度 ${vm.depth} · 视口 ${vm.count} / ${VP_MAX}` + (vm.gcCount ? ` · 已回收 ${vm.gcCount}` : '');
  const path = new Set(); for (let n = vm.current; n; n = n.parent) path.add(n);
  const body = $('vpm-body'); body.innerHTML = '';
  const rootUl = document.createElement('ul'); rootUl.className = 'vpm-tree';
  (function walk(node, ul) {
    const li = document.createElement('li');
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'vpm-chip' + (node === vm.current ? ' cur' : path.has(node) ? ' onpath' : '');
    chip.title = node.parent ? `跳转到「${node.label}」` : '回到本步起始视角';
    chip.innerHTML = `<span class="dot" style="background:${vpColor(node)}"></span>` +
      `<span class="nm">${node.parent ? node.label : '⌂ ' + node.label}</span>` +
      `<span class="idx">#${node.id}</span>` + (node === vm.current ? '<span class="badge">当前</span>' : '');
    chip.onclick = () => handlers.onNavigate(node);
    li.appendChild(chip);
    if (node.children.length) {
      const cul = document.createElement('ul');
      node.children.forEach(c => walk(c, cul));
      li.appendChild(cul);
    }
    ul.appendChild(li);
  })(vm.root, rootUl);
  body.appendChild(rootUl);
  if (!vm.root.children.length) {
    const d = document.createElement('div');
    d.className = 'vpm-empty';
    d.textContent = '还没有 Zoom in 记录——点击 3D 图中任意节点，这里会长出历史树。';
    body.appendChild(d);
  }
}
