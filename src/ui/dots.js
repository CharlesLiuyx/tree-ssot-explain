// 底部步骤导航点组件:一步一枚,点击跳转。

import { mount, $ } from './dom.js';
import { DOT_NAMES } from '../story/stages.js';
import { state } from '../core/state.js';

mount('<div id="dots"></div>');

let onSelect = null;
export function initDots(fn) { onSelect = fn; }

export function renderDots() {
  const box = $('dots'); box.innerHTML = '';
  DOT_NAMES.forEach((n, i) => {
    const d = document.createElement('span');
    d.className = 'dot' + (i === state.stage ? ' cur' : '');
    d.textContent = n;
    d.onclick = () => onSelect(i);
    box.appendChild(d);
  });
}
