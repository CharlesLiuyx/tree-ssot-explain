// 叙事面板组件:步骤文案 / STEP 3-4 案例栏 / STEP 4 引力对分组列表 / STEP 7-8 策略开关与统计 /
// STEP 8 法则卡片 / STEP 9 演化路径 / 上下步导航。
// 行为回调(切步/开关策略/点引力对/点法则/切路径)由 app/director.js 装配时注入——组件只管渲染。

import { mount, $ } from './dom.js';
import { STAGES } from '../story/stages.js';
import { LAWS } from '../story/laws.js';
import { STRATS } from '../data/strategies.js';
import { META_PATHS } from '../data/meta-paths.js';
import { GRAVITY, GRAVITY_KINDS, GRAVITY_KIND_DESC } from '../data/gravity.js';
import { GHOSTS } from '../data/ghosts.js';
import { state, runtime } from '../core/state.js';
import { annotateTerms } from './terms.js';

mount(`
<aside id="panel">
  <span id="stage-chip"></span>
  <h2 id="stage-title"></h2>
  <div id="stage-body"></div>
  <div id="case-box"></div>
  <div id="strategies">
    <div id="strat-list"></div>
    <div id="tangle-stats"></div>
  </div>
  <div id="nav">
    <button id="prev">← 上一步</button>
    <button id="next">下一步 →</button>
  </div>
</aside>`);

let handlers = {}; // {onPrev,onNext,onStratToggle,onGravPick,onLaw,onMetaPath}
export function initPanel(h) {
  handlers = h;
  $('prev').onclick = () => handlers.onPrev();
  $('next').onclick = () => handlers.onNext();
}

export function renderPanel() {
  const s = STAGES[state.stage];
  // 案例栏是常驻元素,可被临时移进正文槽位(STEP 4)——重建正文前必须先归位,否则会被 innerHTML 抹掉
  const cb = $('case-box');
  if (cb.parentElement !== $('panel')) $('panel').insertBefore(cb, $('strategies'));
  $('stage-chip').textContent = s.chip;
  $('stage-title').textContent = s.title;
  $('stage-body').innerHTML = s.body;
  const caseOn = state.stage === 3 || state.stage === 4;
  cb.style.display = caseOn ? 'block' : 'none';
  cb.classList.toggle('mg', state.stage === 4); // 引力阶段:案例栏转洋红
  if (state.stage === 3) cb.innerHTML = '<span class="dim">纠缠正在产生……</span>';
  const slot = $('grav-case-slot');
  if (slot) slot.appendChild(cb); // STEP 4:案例栏上移到开篇段落之后,不必滚动就能看到点名
  $('strategies').style.display = (state.stage >= 7 && state.stage <= 8) ? 'block' : 'none';
  $('prev').style.visibility = state.stage === 0 ? 'hidden' : 'visible';
  $('next').textContent = state.stage === STAGES.length - 1 ? '↺ 回到总览' : '下一步 →';
  $('panel').scrollTop = 0;
  annotateTerms($('stage-body'));
  if (state.stage === 4) renderGravList();
  if (state.stage === 8) renderLaws();
  if (state.stage === 9) renderMetaUI();
}

/* STEP 4:引力对按「长法」分组的点选列表(容器在 stage 4 文案里)。
   首次进入构建一次,轮播点名时只翻 .on 类。 */
export function renderGravList() {
  const box = $('grav-groups'); if (!box) return;
  if (!box.childElementCount) {
    for (const kind of Object.keys(GRAVITY_KINDS)) {
      const head = document.createElement('div');
      head.className = 'gv-kind';
      const items = GRAVITY.map((g, i) => ({ g, i })).filter(x => x.g.kind === kind);
      head.innerHTML = `<b>${GRAVITY_KINDS[kind]}</b><span>${GRAVITY_KIND_DESC[kind]} · ${items.length} 对</span>`;
      box.appendChild(head);
      for (const { g, i } of items) {
        const b = document.createElement('button');
        b.className = 'gv-row'; b.dataset.i = i;
        b.innerHTML = `${g.aName} <i>⚡</i> ${g.bName}`;
        b.onclick = () => handlers.onGravPick(i);
        box.appendChild(b);
      }
    }
  }
  box.querySelectorAll('.gv-row').forEach(b =>
    b.classList.toggle('on', +b.dataset.i === runtime.highlightGravity));
}

/* STEP 8:法则卡片(图示 + 一句话 + 点击看现场;容器在 stage 8 文案里)。
   首次进入构建一次,选中态切换时只翻 .on 类与角标文案。 */
export function renderLaws() {
  const box = $('law-list'); if (!box) return;
  if (!box.childElementCount) {
    for (const l of LAWS) {
      const b = document.createElement('button');
      b.className = 'law'; b.dataset.k = l.k;
      b.innerHTML = `<span class="law-fig">${l.svg}</span>` +
        `<span class="law-main"><span class="law-name">${l.name}<em></em></span>` +
        `<span class="law-gist">${l.gist}</span><span class="law-scene">📍 ${l.scene}</span></span>`;
      b.onclick = () => handlers.onLaw(l.k);
      box.appendChild(b);
    }
    annotateTerms(box);
  }
  box.querySelectorAll('.law').forEach(b => {
    const on = b.dataset.k === runtime.lawFocus;
    b.classList.toggle('on', on);
    b.querySelector('.law-name em').textContent = on ? '回全景 ↩' : '看现场 ↗';
  });
}

export function renderStrats() {
  const box = $('strat-list'); box.innerHTML = '';
  STRATS.forEach(st => {
    const b = document.createElement('button');
    b.className = 'strat' + (state.strat[st.k] ? ' on' : '');
    if (state.stage === 8) b.setAttribute('disabled', '');
    b.innerHTML = `<span class="s-name">${st.name}<em>${st.pct} 熵</em></span><span class="s-desc">${st.desc}</span>`;
    b.onclick = () => handlers.onStratToggle(st.k);
    box.appendChild(b);
  });
  annotateTerms(box);
}

/* STEP 3:案例栏逐条揭示 / 轮播文案 */
export function setCaseBox(html) {
  $('case-box').innerHTML = html;
  annotateTerms($('case-box'));
}

/* STEP 7-8:纠缠线分类统计(纠缠线每次重建后由装配好的回调刷新)。
   迁移动画期间每帧都会重建纠缠线——内容没变就不碰 DOM。 */
let lastStats = null;
export function updateStats() {
  const el = $('tangle-stats');
  if (state.stage < 7 || state.stage > 8) {
    if (lastStats !== '') { lastStats = ''; el.textContent = ''; }
    return;
  }
  const { red, amber, grey, plat } = runtime.tangleCounts;
  const html =
    `偶然交织：<span class="r">${red} 条仍在纠缠</span> · <span class="am">${amber} 条已契约化</span> · <span class="dim">${grey} 条循环中消解</span> · <span class="g">${plat} 条已平台化</span><br>` +
    `本征引力：${state.strat.fusion ? `<span class="g">${GRAVITY.length} 对已共域（金色气泡）</span>` : `<span class="mg">${GRAVITY.length} 对仍在拉扯</span>`}<br>` +
    `图外真相：${state.strat.explicit ? `<span class="g">${GHOSTS.length} 个幽灵根已收编入库</span>` : `<span class="gh">${GHOSTS.length} 个幽灵根游离在外</span>`}`;
  if (html === lastStats) return;
  lastStats = html;
  el.innerHTML = html;
  annotateTerms(el);
}

/* STEP 9:两条演化路径的切换按钮 + 骨骼/假肢总结(容器在 stage 9 文案里) */
export function renderMetaUI() {
  const box = $('meta-paths'); if (!box) return;
  box.innerHTML = '';
  META_PATHS.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'strat' + (i === runtime.metaPathIdx ? ' on' : '');
    b.innerHTML = `<span class="s-name">${p.name}<em>${p.pct}</em></span><span class="s-desc"><b style="color:#dfe6f3">${p.proto}</b> —— ${p.desc}</span>`;
    b.onclick = () => handlers.onMetaPath(i); // 点已选中的路径 = 重播生长
    box.appendChild(b);
  });
  const P = META_PATHS[runtime.metaPathIdx];
  $('meta-traits').innerHTML =
    `<div class="quote"><b class="g">骨骼</b>：${P.strong}<br><b class="r">假肢</b>：${P.weak}<br><span class="dim">${P.law}</span></div>`;
  annotateTerms(box); annotateTerms($('meta-traits'));
}
