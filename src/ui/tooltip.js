// 悬停提示组件:跟随指针的浮层。两个来源共用——
// 3D 对象详情(app/hover.js 推送)与名词解释(.term 词条,本组件自理)。

import { mount } from './dom.js';
import { TERMS } from '../story/terms.js';

const el = mount('<div id="tooltip"></div>');

addEventListener('pointermove', e => {
  el.style.left = Math.min(e.clientX + 16, innerWidth - 350) + 'px';
  el.style.top = Math.min(e.clientY + 16, innerHeight - 200) + 'px';
});

// 名词解释:悬停带虚线下划线的词条
let termEl = null;
addEventListener('mouseover', e => {
  const t = e.target && e.target.closest ? e.target.closest('.term') : null;
  if (t === termEl) return;
  termEl = t;
  if (t && TERMS[t.textContent]) {
    const info = TERMS[t.textContent];
    el.innerHTML = `<b>${t.textContent}</b><span class="tt-kind">${info.en || '名词解释'}</span><div class="tt-desc">${info.d}</div>`;
    el.style.display = 'block';
  } else if (!t) {
    el.style.display = 'none';
  }
});

export function showTooltip(html) { el.innerHTML = html; el.style.display = 'block'; }
/* 隐藏 3D 详情——但名词解释正开着时让位于它 */
export function hideTooltip() { if (!termEl) el.style.display = 'none'; }
