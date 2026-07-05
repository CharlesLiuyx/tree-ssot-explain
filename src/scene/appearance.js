// 节点外观状态机:按阶段与策略给出每个节点的颜色/透明度/光环/护栏壳,以及树枝干与标签的显隐。
// 优先级:根(金) > 引力对(洋红/共域金) > 幽灵根(青) > 交织(红/琥珀/金/灰) > 树本色。

import { GOLD, RED, AMBER, GREY, MAGENTA, GHOSTC, FOCUS_SET } from '../config.js';
import { trees, allNodes, rootRings, labelEls } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';

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
  for (const n of allNodes) {
    let op = 1;
    if (stage === 1 && n.tree !== 0) op = .1;
    if (stage === 6) op = FOCUS_SET.has(n.gid) ? 1 : .13;
    if (stage === 9) op = .14; // 树之树:森林整体退成背景
    const c = nodeColor(n);
    n.mat.color.setHex(c); n.mat.emissive.setHex(c);
    n.mat.opacity = op;
    if (n.rim) n.rim.visible = op > .5;
    const redState = c === RED;
    n.tangles.forEach((t, j) => {
      const h = n.halos[j];
      h.visible = redState && t.revealedNow && !t.resolvedByLoops && op > .5;
      const s = stratOn('sdd') ? .6 : 1;
      h.scale.setScalar(s);
      h.material.opacity = stratOn('sdd') ? .3 : .55;
    });
    if (n.shell) n.shell.visible = stratOn('tdd') && op > .5;
  }
  trees.forEach((tr, ti) => {
    tr.edgeMat.opacity = (stage === 1 && ti !== 0) ? .05 : (stage === 6 ? .07 : (stage === 9 ? .08 : .4));
    labelEls[ti].classList.toggle('ghost', (stage === 1 && ti !== 0) || stage === 9);
    labelEls[ti].classList.toggle('full', stage >= 2 && stage !== 9);
  });
  rootRings.forEach(r => r.visible = stratOn('sdd'));
}
