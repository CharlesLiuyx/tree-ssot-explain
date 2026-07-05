// 图例组件:配色语义速查(静态;术语标注由 main.js 启动时统一执行)。

import { mount } from './dom.js';

export const legendEl = mount(`
<div id="legend">
  <span class="sw" style="background:#ffd166"></span>根 / SSOT —— 由人守护<br>
  <span class="sw" style="background:#d9e650"></span><span class="sw" style="background:#ff7fb2;margin-left:-3px"></span>业务树 ×2（深）　<span class="sw" style="background:#5b8cff"></span><span class="sw" style="background:#7ee08a;margin-left:-3px"></span><span class="sw" style="background:#dcc98a;margin-left:-3px"></span>横切树 ×14（拉通）<br>
  <span class="sw" style="background:#ff4d6d"></span>偶然交织（可消解）　<span class="sw" style="background:#ff2fd0"></span>本征引力（只能共域）<br>
  <span class="sw" style="background:#7de8ff"></span>幽灵根 —— 真相在图外（只能显式化收编）<br>
  <span class="sw" style="background:transparent;border:1.5px dashed #7de8ff"></span>仓库边界（可嵌套）—— 每棵树可自成仓库 / 子仓库<br>
  <span class="sw" style="background:transparent;border:1.5px solid #5dd39e"></span>叶子 · AI 自由区　<span class="sw" style="background:#ffb84d"></span>已契约化　<span class="sw" style="background:#f3e9c8"></span>平台树
</div>`);
