// 法则聚光(STEP 8):点击法则卡片后,该法则在场景里的「现场」元素做呼吸脉冲——
// 人守根→全部树根;AI 写叶→全部叶子;分清耦合→引力对节点与共域气泡;
// 让真相住图内→幽灵根、金色收编线与被牵住的节点;持续治理→平台树节点与雷达。
// 脉冲有截止时间(runtime.lawFocusUntil):到期自动复位,之后每帧零成本。
// 必须在 updateGravity / updateGhosts 之后调用——气泡与幽灵根的透明度由它们每帧重写,本系统在其上叠加。

import { GRAVITY } from '../data/gravity.js';
import { GHOSTS } from '../data/ghosts.js';
import { allNodes } from '../core/registry.js';
import { runtime, lawPulseK } from '../core/state.js';
import { setNodeEmissive } from './pools.js';
import { platNodes } from './platform.js';
import { radar } from './strategies-fx.js';

let sets = null, lastK = '';
function lawNodes(k) {
  if (!sets) sets = {
    roots: allNodes.filter(n => n.level === 0),
    leaves: allNodes.filter(n => n.level > 0 && !n.hasChildren),
    coupling: GRAVITY.flatMap(g => [g.na, g.nb]),
    explicit: GHOSTS.flatMap(g => g.targets),
    govern: [],
  };
  return sets[k] || [];
}

export function updateLawFx(t) {
  const k = lawPulseK();
  if (!k && !lastK) return;
  if (lastK && lastK !== k) { // 换灯/熄灯:上一组一次性复位
    for (const n of lawNodes(lastK)) if (runtime.hovered !== n) setNodeEmissive(n, .38);
    if (lastK === 'govern') {
      for (const m of Object.values(platNodes))
        if (runtime.hovered !== m.userData.node) m.material.emissiveIntensity = .35;
      radar.material.opacity = .1;
    }
  }
  lastK = k;
  if (!k) return;
  const pulse = .5 + .5 * Math.sin(t * 4.2);
  const e = .38 + .85 * pulse;
  for (const n of lawNodes(k)) if (runtime.hovered !== n) setNodeEmissive(n, e);
  if (k === 'coupling') for (const g of GRAVITY) { // 共域气泡跟着亮(updateGravity 每帧重写,此处叠加)
    if (!g.bubble.visible) continue;
    g.bubble.material.opacity += .10 * pulse;
    g.bubbleWire.material.opacity += .30 * pulse;
  }
  if (k === 'explicit') for (const g of GHOSTS) { // 收编后的幽灵根与金色实线跟着亮
    if (!g.wire.visible) continue;
    g.wire.material.opacity = Math.min(1, g.wire.material.opacity + .3 * pulse);
    for (const sl of g.solid) sl.material.opacity = Math.min(1, sl.material.opacity + .35 * pulse);
  }
  if (k === 'govern') {
    for (const m of Object.values(platNodes))
      if (runtime.hovered !== m.userData.node) m.material.emissiveIntensity = .35 + .65 * pulse;
    radar.material.opacity = .1 + .08 * pulse;
  }
}
