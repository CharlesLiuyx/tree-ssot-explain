// 视口历史全景组件(V 键 / ⛶ 按钮):整棵历史树一屏铺开的模态 overlay。界面文案在语言包 ui.vp 里。

import { mount, $ } from './dom.js';
import { L } from '../i18n/index.js';
import { VP_MAX } from '../config.js';
import { trees } from '../core/registry.js';

const T = L.ui.vp;

const overlay = mount(`
<div id="vp-map">
  <div class="vpm-card">
    <div class="vpm-head">
      <span class="vpm-title">${T.mapTitle}</span>
      <span class="vpm-stats" id="vpm-stats"></span>
      <button class="vpm-close" id="vpm-clear" type="button" title="${T.clearTitle}">${T.clear}</button>
      <button class="vpm-close" id="vpm-close" type="button">${T.mapClose}</button>
    </div>
    <div class="vpm-body" id="vpm-body"></div>
    <div class="vpm-foot">${T.mapFoot(VP_MAX)}</div>
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
    T.mapStats(vm.depth, vm.count, VP_MAX) + (vm.gcCount ? T.gcSuffix(vm.gcCount) : '');
  const path = new Set(); for (let n = vm.current; n; n = n.parent) path.add(n);
  const body = $('vpm-body'); body.innerHTML = '';
  const rootUl = document.createElement('ul'); rootUl.className = 'vpm-tree';
  (function walk(node, ul) {
    const li = document.createElement('li');
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'vpm-chip' + (node === vm.current ? ' cur' : path.has(node) ? ' onpath' : '');
    chip.title = node.parent ? T.chipTitle(node.label) : T.chipRootTitle;
    chip.innerHTML = `<span class="dot" style="background:${vpColor(node)}"></span>` +
      `<span class="nm">${node.parent ? node.label : '⌂ ' + node.label}</span>` +
      `<span class="idx">#${node.id}</span>` + (node === vm.current ? `<span class="badge">${T.current}</span>` : '');
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
    d.textContent = T.mapEmpty;
    body.appendChild(d);
  }
}
