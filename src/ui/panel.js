// 叙事面板组件:步骤文案 / STEP 3-4 案例栏(带 ▶ 播放按钮,STEP 3 另有进度条) / STEP 4 引力对分组列表 /
// STEP 7-8 策略开关与统计 / STEP 8 法则卡片 / STEP 9 演化路径与 ▶ 生长/速度控制 / 上下步导航。
// 所有自动播放(揭示/轮播/生长)都必须点击 ▶ 才开始——进场只渲染静止态与待播提示。
// 行为回调(切步/开关策略/拖案例进度/点引力对/点法则/切路径)由 app/director.js 装配时注入——组件只管渲染。
// 界面文案在语言包 ui.panel / ui.caseCtrl / ui.nav 里。

import { mount, $ } from './dom.js';
import { L } from '../i18n/index.js';
import { STAGES } from '../story/stages.js';
import { LAWS } from '../story/laws.js';
import { STRATS } from '../data/strategies.js';
import { META_PATHS } from '../data/meta-paths.js';
import { TANGLES } from '../data/tangles.js';
import { GRAVITY, GRAVITY_KINDS, GRAVITY_KIND_DESC } from '../data/gravity.js';
import { GHOSTS } from '../data/ghosts.js';
import { state, runtime } from '../core/state.js';
import { annotateTerms } from './terms.js';

const T = L.ui;

mount(`
<aside id="panel">
  <span id="stage-chip"></span>
  <h2 id="stage-title"></h2>
  <div id="stage-body"></div>
  <div id="case-box"></div>
  <div id="case-ctrl">
    <button id="case-play"></button>
    <input id="case-range" type="range" min="0" value="0" step="1" title="${T.caseCtrl.rangeTitle}">
    <span id="case-count"></span>
    <button id="case-all" title="${T.caseCtrl.allTitle}">${T.caseCtrl.allBtn}</button>
  </div>
  <div id="strategies">
    <div id="strat-list"></div>
    <div id="tangle-stats"></div>
  </div>
  <div id="nav">
    <button id="prev">${T.nav.prev}</button>
    <button id="next">${T.nav.next}</button>
  </div>
</aside>`);

let handlers = {}; // {onPrev,onNext,onStratToggle,onCaseScrub,onCasePlay,onGravPick,onLaw,onMetaPath,onMetaPlay}
export function initPanel(h) {
  handlers = h;
  $('prev').onclick = () => handlers.onPrev();
  $('next').onclick = () => handlers.onNext();
  $('case-play').onclick = () => handlers.onCasePlay(); // STEP 3 播放揭示 / STEP 4 轮播点名
  $('case-range').max = TANGLES.length;
  $('case-range').oninput = e => handlers.onCaseScrub(+e.target.value);
  $('case-all').onclick = () => handlers.onCaseScrub(TANGLES.length);
}

export function renderPanel() {
  const s = STAGES[state.stage];
  // 案例栏与播放控制是常驻元素,可被临时移进正文槽位(STEP 4)——重建正文前必须先归位,否则会被 innerHTML 抹掉
  const cb = $('case-box'), cc = $('case-ctrl');
  if (cc.parentElement !== $('panel')) $('panel').insertBefore(cc, $('strategies'));
  if (cb.parentElement !== $('panel')) $('panel').insertBefore(cb, cc);
  $('stage-chip').textContent = s.chip;
  $('stage-title').textContent = s.title;
  $('stage-body').innerHTML = s.body;
  const caseOn = state.stage === 3 || state.stage === 4;
  cb.style.display = caseOn ? 'block' : 'none';
  cb.classList.toggle('mg', state.stage === 4); // 引力阶段:案例栏与播放钮转洋红
  cc.classList.toggle('mg', state.stage === 4);
  cc.style.display = caseOn ? 'flex' : 'none';  // 播放控制属于两个可播放阶段(3 揭示 / 4 轮播)
  if (caseOn) renderCaseCtrl();
  const slot = $('grav-case-slot');
  if (slot) { slot.appendChild(cb); slot.appendChild(cc); } // STEP 4:案例栏与 ▶ 上移到开篇段落之后,不必滚动就能看到点名
  $('strategies').style.display = (state.stage >= 7 && state.stage <= 8) ? 'block' : 'none';
  $('prev').style.visibility = state.stage === 0 ? 'hidden' : 'visible';
  $('next').textContent = state.stage === STAGES.length - 1 ? T.nav.restart : T.nav.next;
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
      head.innerHTML = T.panel.gravGroup(GRAVITY_KINDS[kind], GRAVITY_KIND_DESC[kind], items.length);
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
        `<span class="law-gist">${l.gist}</span><span class="law-scene">${T.panel.lawScenePrefix}${l.scene}</span></span>`;
      b.onclick = () => handlers.onLaw(l.k);
      box.appendChild(b);
    }
    annotateTerms(box);
  }
  box.querySelectorAll('.law').forEach(b => {
    const on = b.dataset.k === runtime.lawFocus;
    b.classList.toggle('on', on);
    b.querySelector('.law-name em').textContent = on ? T.panel.lawBack : T.panel.lawGo;
  });
}

export function renderStrats() {
  const box = $('strat-list'); box.innerHTML = '';
  STRATS.forEach(st => {
    const b = document.createElement('button');
    b.className = 'strat' + (state.strat[st.k] ? ' on' : '');
    if (state.stage === 8) b.setAttribute('disabled', '');
    b.innerHTML = `<span class="s-name">${st.name}<em>${T.panel.stratPct(st.pct)}</em></span><span class="s-desc">${st.desc}</span>`;
    b.onclick = () => handlers.onStratToggle(st.k);
    box.appendChild(b);
  });
  annotateTerms(box);
}

/* STEP 3:案例栏逐条揭示 / 拖动回看文案 */
export function setCaseBox(html) {
  $('case-box').innerHTML = html;
  annotateTerms($('case-box'));
}

/* STEP 3/4 播放控制:▶ 按钮双阶段共用(3 = 逐条揭示,4 = 点名轮播),必须点击才开始播放;
   进度条/计数/全展示只属于 STEP 3。 */
export function renderCaseCtrl() {
  const s3 = state.stage === 3;
  for (const id of ['case-range', 'case-count', 'case-all']) $(id).style.display = s3 ? '' : 'none';
  const play = $('case-play');
  if (s3) {
    $('case-range').value = state.revealed;
    $('case-count').textContent = `${state.revealed}/${TANGLES.length}`;
    $('case-all').disabled = state.revealed >= TANGLES.length;
    play.textContent = runtime.casePlaying ? T.caseCtrl.pause
      : state.revealed >= TANGLES.length ? T.caseCtrl.replay
      : state.revealed > 0 ? T.caseCtrl.resume : T.caseCtrl.play;
    play.title = T.caseCtrl.playTitle;
  } else {
    play.textContent = runtime.gravCycling ? T.caseCtrl.cycleStop : T.caseCtrl.cycleStart;
    play.title = T.caseCtrl.cycleTitle;
  }
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
  const html =
    `${T.panel.statsTangles(runtime.tangleCounts)}<br>` +
    `${T.panel.statsGravity(GRAVITY.length, !!state.strat.fusion)}<br>` +
    T.panel.statsGhosts(GHOSTS.length, !!state.strat.explicit);
  if (html === lastStats) return;
  lastStats = html;
  el.innerHTML = html;
  annotateTerms(el);
}

/* STEP 9:演化路径切换按钮(七条;积木族首条带 grp 分组标) + 生长速度滑杆 + 骨骼/假肢总结(容器在 stage 9 文案里) */
export function renderMetaUI() {
  const box = $('meta-paths'); if (!box) return;
  box.innerHTML = '';
  META_PATHS.forEach((p, i) => {
    if (p.grp) { const g = document.createElement('div'); g.className = 'meta-grp'; g.textContent = p.grp; box.appendChild(g); }
    const b = document.createElement('button');
    b.className = 'strat' + (i === runtime.metaPathIdx ? ' on' : '');
    b.innerHTML = `<span class="s-name">${p.name}<em>${p.pct}</em></span>`;
    b.title = T.panel.metaPathTitle(p.proto, p.desc); // 原型与简介进悬停提示,完整版在下方骨骼/假肢总结里
    b.onclick = () => handlers.onMetaPath(i); // 点已选中的路径 = 重播生长
    box.appendChild(b);
  });
  // 播放/暂停 + 生长速度:生长必须点 ▶ 才开始;滑杆实时调速(生长中途调也平滑),↻ 重播 = 以当前速度重新长一遍
  const sp = document.createElement('div');
  sp.className = 'meta-speed';
  sp.innerHTML = `<button class="meta-play" title="${T.panel.metaPlayTitle}">${runtime.metaPlaying ? T.panel.metaPause : T.panel.metaPlay}</button>` +
    `<span>${T.panel.metaSpeed}</span><input type="range" min="0.5" max="3" step="0.5" value="${runtime.metaSpeed}" title="${T.panel.metaSpeedTitle}"><b>${runtime.metaSpeed}×</b>` +
    `<button class="meta-replay" title="${T.panel.metaReplayTitle}">${T.panel.metaReplay}</button>`;
  const rng = sp.querySelector('input'), val = sp.querySelector('b');
  rng.oninput = () => { runtime.metaSpeed = +rng.value; val.textContent = runtime.metaSpeed + '×'; };
  sp.querySelector('.meta-play').onclick = () => handlers.onMetaPlay();
  sp.querySelector('.meta-replay').onclick = () => handlers.onMetaPath(runtime.metaPathIdx);
  box.appendChild(sp);
  const P = META_PATHS[runtime.metaPathIdx];
  $('meta-traits').innerHTML = T.panel.metaTraits(P.proto, P.desc, P.strong, P.weak);
  annotateTerms(box); annotateTerms($('meta-traits'));
}
