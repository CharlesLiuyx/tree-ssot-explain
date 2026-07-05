// 顶栏组件:标题 + 全局快捷键提示(纯静态)。

import { mount } from './dom.js';

mount(`
<header id="topbar">
  <div>
    <h1>多树形结构 · <em>节点交织</em>模型</h1>
    <div class="sub">Multi-Tree / Node-Entanglement Model —— 为什么项目复杂到某一刻，AI 突然就「糊」了</div>
  </div>
  <div class="keys">拖动旋转 · 滚轮缩放 · <b>点击节点</b> Zoom in · <b>Esc</b> 返回 · <b>V</b> 视口全景 · <b>←/→</b> 切换步骤 · 悬停看详情</div>
</header>`);
