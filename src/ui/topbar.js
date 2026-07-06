// 顶栏组件:标题 + 全局快捷键提示(纯静态)。

import { mount } from './dom.js';

mount(`
<header id="topbar">
  <div>
    <h1>
      <span>多树形结构 · <em>节点交织</em>模型</span>
      <span class="author">by Charles Liu</span>
      <a class="github-link" href="https://github.com/CharlesLiuyx/tree-ssot-explain" target="_blank" rel="noopener noreferrer" aria-label="GitHub: CharlesLiuyx/tree-ssot-explain">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.27-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98 0 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.68.41.36.77 1.06.77 2.13v3.02c0 .31.21.67.79.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
        </svg>
      </a>
    </h1>
    <div class="sub">Multi-Tree / Node-Entanglement Model —— 为什么项目复杂到某一刻，AI 突然就「糊」了</div>
  </div>
  <div class="keys">拖动旋转 · 滚轮缩放 · <b>点击节点</b> Zoom in · <b>Esc</b> 返回 · <b>V</b> 视口全景 · <b>←/→</b> 切换步骤 · 悬停看详情</div>
</header>`);
