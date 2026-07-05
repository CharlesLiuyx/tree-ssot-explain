// 语义熵仪表组件:右上角实时仪表。熵 = f(阶段, 已揭示交织数, 策略开关)。
// updateEntropy() 重算目标值(状态变化时调),paintEntropy() 平滑逼近并绘制(主循环每帧调)。

import { mount, $ } from './dom.js';
import { TANGLES } from '../data/tangles.js';
import { STRAT_FACTORS } from '../data/strategies.js';
import { state } from '../core/state.js';

export const meterEl = mount(`
<div id="meter">
  <div class="m-title">语义熵 · AI 混淆度</div>
  <div class="m-row"><span id="entropy-val">0%</span><span id="entropy-zone"></span></div>
  <div class="bar"><div id="entropy-fill"></div><i style="left:30%"></i><i style="left:65%"></i></div>
  <div class="zones"><span class="z-ok">可驾驭</span><span class="z-mid">吃力·需人在环</span><span class="z-bad">崩塌区</span></div>
</div>`);

let entropyTarget = 0, entropyShown = -1;

function calcEntropy() {
  const s = state.stage;
  if (s === 0) return 72;
  if (s === 1) return 8;
  if (s === 2) return 20;
  if (s === 3) return 26 + 62 * (state.revealed / TANGLES.length);
  if (s === 4) return 88;
  if (s === 5) return 94;
  if (s === 6) return 100;
  let e = 100;
  for (const [k, f] of Object.entries(STRAT_FACTORS)) if (state.strat[k]) e *= f;
  return e;
}

export function updateEntropy() { entropyTarget = calcEntropy(); }

export function paintEntropy() {
  if (Math.abs(entropyTarget - ((entropyShown < 0) ? 0 : entropyShown)) < .15 && entropyShown >= 0) return;
  entropyShown = (entropyShown < 0) ? entropyTarget : entropyShown + (entropyTarget - entropyShown) * .06;
  const v = Math.round(entropyShown);
  const fill = $('entropy-fill');
  const zone = $('entropy-zone');
  const val = $('entropy-val');
  val.textContent = v + '%';
  fill.style.width = Math.max(2, entropyShown) + '%';
  let txt, color;
  if (entropyShown < 30) { txt = 'AI 可驾驭'; color = '#5dd39e'; }
  else if (entropyShown < 65) { txt = '吃力 · 需人在环'; color = '#ffb84d'; }
  else { txt = '混淆崩塌区'; color = '#ff4d6d'; }
  zone.textContent = txt; zone.style.color = color; val.style.color = color;
  fill.style.background = `linear-gradient(90deg,#5dd39e,${entropyShown < 30 ? '#5dd39e' : entropyShown < 65 ? '#ffb84d' : '#ff4d6d'})`;
}

/* 树之树(STEP 9)看的是生长顺序,不看熵——整表隐藏 */
export function setMeterVisible(v) { meterEl.style.display = v ? 'block' : 'none'; }
