// 自动旋转开关组件(左下角,仅总览步骤可见)。开关状态由 app/director.js 管理,这里只渲染。

import { mount } from './dom.js';
import { L } from '../i18n/index.js';

const btn = mount(`
<button id="rotate-toggle" type="button" title="${L.ui.rotate.title}">
  <span class="rt-ico"></span><span class="rt-txt"></span><span class="kbd">Space</span>
</button>`);

export function initRotateToggle(onToggle) { btn.onclick = onToggle; }

export function renderRotateToggle({ visible, wanted }) {
  btn.style.display = visible ? 'inline-flex' : 'none'; // 仅总览会自动旋转,其余步骤按钮无意义
  btn.classList.toggle('paused', !wanted);
  btn.querySelector('.rt-ico').textContent = wanted ? '⏸' : '⟳';
  btn.querySelector('.rt-txt').textContent = wanted ? L.ui.rotate.stop : L.ui.rotate.start;
}
