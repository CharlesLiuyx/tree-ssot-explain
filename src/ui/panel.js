// 叙事面板组件:步骤文案 / STEP 3 案例栏 / STEP 7-8 策略开关与统计 / STEP 9 演化路径 / 上下步导航。
// 行为回调(切步/开关策略/切路径)由 app/director.js 装配时注入——组件只管渲染。

import { mount, $ } from './dom.js';
import { STAGES } from '../story/stages.js';
import { STRATS } from '../data/strategies.js';
import { META_PATHS } from '../data/meta-paths.js';
import { GRAVITY } from '../data/gravity.js';
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

let handlers = {}; // {onPrev,onNext,onStratToggle,onMetaPath}
export function initPanel(h) {
  handlers = h;
  $('prev').onclick = () => handlers.onPrev();
  $('next').onclick = () => handlers.onNext();
}

export function renderPanel() {
  const s = STAGES[state.stage];
  $('stage-chip').textContent = s.chip;
  $('stage-title').textContent = s.title;
  $('stage-body').innerHTML = s.body;
  $('case-box').style.display = state.stage === 3 ? 'block' : 'none';
  if (state.stage === 3) $('case-box').innerHTML = '<span class="dim">纠缠正在产生……</span>';
  $('strategies').style.display = (state.stage >= 7 && state.stage <= 8) ? 'block' : 'none';
  $('prev').style.visibility = state.stage === 0 ? 'hidden' : 'visible';
  $('next').textContent = state.stage === STAGES.length - 1 ? '↺ 回到总览' : '下一步 →';
  $('panel').scrollTop = 0;
  annotateTerms($('stage-body'));
  if (state.stage === 9) renderMetaUI();
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
