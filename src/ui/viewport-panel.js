// 视口历史组件(右侧):返回按钮 / 收起态胶囊 / 展开态面板(节点详情 + 导航树)。
// 数据与导航逻辑在 app/viewport-history.js,这里只按视图模型渲染。

import { mount, $ } from './dom.js';
import { annotateTerms } from './terms.js';
import { nodeInfoHTML } from './node-info.js';

const backBtn = mount(`<button id="vp-back" type="button" title="返回上一个视口（快捷键 Esc）">← 返回上一步 <span class="kbd">Esc</span></button>`);
const pill = mount(`<button id="vp-pill" type="button" title="展开「视口历史」面板（导航树 + 节点详情）">视口历史 <span class="n" id="vp-pill-n"></span></button>`);
mount(`
<aside id="vp-panel">
  <div class="vp-head">
    <span class="vp-title">视口历史</span>
    <span class="vp-act" id="vp-collapse" title="收起为胶囊（历史保留）">— 收起</span>
  </div>
  <div class="vp-acts">
    <span class="vp-act" id="vp-map-btn" title="查看视口历史全景（快捷键 V）">⛶ 全景</span>
    <span class="vp-act" id="vp-home" title="回到本步的起始视角">⌂ 起始视角</span>
    <span class="vp-act" id="vp-clear" title="清空本步视口历史（只保留起始视角并飞回）">⌫ 清空</span>
  </div>
  <div id="vp-detail"></div>
  <div class="vp-sub" id="vp-sub">导航树（点击任意节点跳转）</div>
  <div id="vp-tree"></div>
</aside>`);

let handlers = {}; // {onBack,onHome,onClear,onExpand,onCollapse,onOpenMap,onNavigate}
export function initVpPanel(h) {
  handlers = h;
  backBtn.onclick = () => handlers.onBack();
  pill.onclick = () => handlers.onExpand();
  $('vp-collapse').onclick = () => handlers.onCollapse();
  $('vp-map-btn').onclick = () => handlers.onOpenMap();
  $('vp-home').onclick = () => handlers.onHome();
  $('vp-clear').onclick = () => handlers.onClear();
}

/* vm = {root,current,depth,count,gcCount,panelOpen} */
export function renderVpPanel(vm) {
  backBtn.style.display = vm.depth > 0 ? 'inline-flex' : 'none';
  const has = !!(vm.root && vm.root.children.length);   // 至少 Zoom in 过一次才有历史
  const show = has && vm.panelOpen;                     // 默认收起:有历史时先只给一颗胶囊
  $('vp-panel').style.display = show ? 'block' : 'none';
  pill.style.display = has && !vm.panelOpen ? 'inline-flex' : 'none';
  if (has) $('vp-pill-n').textContent = vm.count;
  if (!show) return;
  const det = $('vp-detail'), m = vm.current && vm.current.meta;
  if (m && m.kind === 'node' && m.node) { det.innerHTML = nodeInfoHTML(m.node); annotateTerms(det); }
  else det.innerHTML = '<div class="vp-empty">点击任意节点 <b>Zoom in</b> 查看详情</div>';
  $('vp-sub').textContent = '导航树（点击任意节点跳转）' + (vm.gcCount ? ` · 已回收 ${vm.gcCount}` : '');
  const tree = $('vp-tree'); tree.innerHTML = '';
  (function walk(node, d) {
    const row = document.createElement('div');
    row.className = 'vp-row' + (node === vm.current ? ' cur' : '');
    row.style.paddingLeft = (7 + d * 15) + 'px';
    const label = d === 0 ? ('⌂ ' + node.label) : node.label;
    row.innerHTML = `<span class="vp-dot"></span><span class="vp-name">${label}</span>`;
    row.title = label;
    row.onclick = () => handlers.onNavigate(node);
    tree.appendChild(row);
    node.children.forEach(c => walk(c, d + 1));
  })(vm.root, 0);
}
