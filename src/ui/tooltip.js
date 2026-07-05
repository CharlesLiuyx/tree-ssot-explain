// 悬停提示组件:跟随指针的浮层。两个来源共用——
// 3D 对象详情(app/hover.js 推送)与名词解释(.term 词条,本组件自理)。

import { mount } from './dom.js';
import { TERMS } from '../story/terms.js';

const el = mount('<div id="tooltip"></div>');

// 跟随指针用 transform(合成器层,不触发布局);隐藏时不写
let visible = false;
let px = 0, py = 0;
function place() { el.style.transform = `translate(${px}px,${py}px)`; }
addEventListener('pointermove', e => {
  px = Math.min(e.clientX + 16, innerWidth - 350);
  py = Math.min(e.clientY + 16, innerHeight - 200);
  if (visible) place();
});

function show(html) { el.innerHTML = html; place(); if (!visible) { visible = true; el.style.display = 'block'; } }
function hide() { if (visible) { visible = false; el.style.display = 'none'; } }

// 名词解释:悬停带虚线下划线的词条
let termEl = null;
addEventListener('mouseover', e => {
  const t = e.target && e.target.closest ? e.target.closest('.term') : null;
  if (t === termEl) return;
  termEl = t;
  if (t && TERMS[t.textContent]) {
    const info = TERMS[t.textContent];
    show(`<b>${t.textContent}</b><span class="tt-kind">${info.en || '名词解释'}</span><div class="tt-desc">${info.d}</div>`);
  } else if (!t) {
    hide();
  }
});

export function showTooltip(html) { show(html); }
/* 隐藏 3D 详情——但名词解释正开着时让位于它 */
export function hideTooltip() { if (!termEl) hide(); }
