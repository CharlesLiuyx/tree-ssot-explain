// 语义熵仪表组件:右上角实时仪表。熵 = f(阶段, 已揭示交织数, 策略开关)。
// updateEntropy() 重算目标值(状态变化时调),paintEntropy(dt) 平滑逼近并绘制(主循环每帧调,收敛后零 DOM 写)。

import { mount, $ } from './dom.js';
import { TANGLES } from '../data/tangles.js';
import { STRAT_FACTORS } from '../data/strategies.js';
import { state } from '../core/state.js';
import { expK } from '../core/three-utils.js';

export const meterEl = mount(`
<div id="meter">
  <div class="m-title">语义熵 · AI 混淆度</div>
  <div class="m-row"><span id="entropy-val">0%</span><span id="entropy-zone"></span></div>
  <div class="bar"><div id="entropy-fill"></div><i style="left:30%"></i><i style="left:65%"></i></div>
  <div class="zones"><span class="z-ok">可驾驭</span><span class="z-mid">吃力·需人在环</span><span class="z-bad">崩塌区</span></div>
</div>`);

let entropyTarget = 0, entropyShown = -1, lastZone = '';
let elFill = null, elZone = null, elVal = null;

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

export function paintEntropy(dt) {
  if (Math.abs(entropyTarget - ((entropyShown < 0) ? 0 : entropyShown)) < .15 && entropyShown >= 0) return;
  entropyShown = (entropyShown < 0) ? entropyTarget : entropyShown + (entropyTarget - entropyShown) * expK(dt, 3.7);
  if (!elFill) { elFill = $('entropy-fill'); elZone = $('entropy-zone'); elVal = $('entropy-val'); }
  elVal.textContent = Math.round(entropyShown) + '%';
  elFill.style.width = Math.max(2, entropyShown) + '%';
  const zone = entropyShown < 30 ? 'ok' : entropyShown < 65 ? 'mid' : 'bad';
  if (zone !== lastZone) { // 区间文案/配色只在跨区时写
    lastZone = zone;
    const [txt, color] = zone === 'ok' ? ['AI 可驾驭', '#5dd39e'] : zone === 'mid' ? ['吃力 · 需人在环', '#ffb84d'] : ['混淆崩塌区', '#ff4d6d'];
    elZone.textContent = txt; elZone.style.color = color; elVal.style.color = color;
    elFill.style.background = `linear-gradient(90deg,#5dd39e,${color})`;
  }
}

/* 树之树(STEP 9)看的是生长顺序,不看熵——整表隐藏 */
export function setMeterVisible(v) { meterEl.style.display = v ? 'block' : 'none'; }
