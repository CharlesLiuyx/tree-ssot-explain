// 节点外观状态机:按阶段与策略给出每个节点的颜色/透明度/光环/护栏壳,以及树枝干与标签的显隐。
// 优先级:根(金) > 引力对(洋红/共域金) > 幽灵根(青) > 交织(红/琥珀/金/灰) > 树本色。
// 写入全部走实例化池 setter(带同值短路),之后 markDecorDirty 让池在下一帧重同步装饰矩阵。

import { GOLD, RED, AMBER, GREY, MAGENTA, GHOSTC, FOCUS_SET } from '../config.js';
import { trees, allNodes, labelEls } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';
import { setNodeColor, setNodeOpacity, setRingsVisible, setShellsVisible, setHaloStyle, markDecorDirty } from './pools.js';

export function nodeColor(n) {
  if (n.level === 0) return GOLD;
  if (n.gravity && runtime.gravityPull > .4) return stratOn('fusion') ? GOLD : MAGENTA;
  if (n.ghost && state.stage >= 5 && state.stage !== 6 && state.stage !== 9 && !stratOn('explicit')) return GHOSTC;
  const revealed = n.tangles.filter(t => t.revealedNow);
  if (!revealed.length) return n.base;
  if (stratOn('platform')) return GOLD;
  if (stratOn('layer')) return AMBER;
  return revealed.some(t => !t.resolvedByLoops) ? RED : GREY;
}

export function refreshNodes() {
  const stage = state.stage;
  const tdd = stratOn('tdd');
  for (const n of allNodes) {
    let op = 1;
    if (stage === 1 && n.tree !== 0) op = .1;
    if (stage === 6) op = FOCUS_SET.has(n.gid) ? 1 : .13;
    if (stage === 9) op = .14; // 树之树:森林整体退成背景
    const c = nodeColor(n);
    setNodeColor(n, c);
    setNodeOpacity(n, op);
    if (n.rimIdx >= 0) n.rimOn = op > .5;
    const redState = c === RED;
    n.tangles.forEach((t, j) => {
      n.haloSlots[j].on = redState && t.revealedNow && !t.resolvedByLoops && op > .5;
    });
    if (n.shellIdx >= 0) n.shellOn = tdd && op > .5;
  }
  setHaloStyle(stratOn('sdd') ? .6 : 1, stratOn('sdd') ? .3 : .55);
  setShellsVisible(tdd);
  setRingsVisible(stratOn('sdd'));
  markDecorDirty();
  trees.forEach((tr, ti) => {
    tr.edgeMat.opacity = (stage === 1 && ti !== 0) ? .05 : (stage === 6 ? .07 : (stage === 9 ? .08 : .4));
    labelEls[ti].classList.toggle('ghost', (stage === 1 && ti !== 0) || stage === 9);
    labelEls[ti].classList.toggle('full', stage >= 2 && stage !== 9);
  });
}
