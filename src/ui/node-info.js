// 详情 HTML 构建器:节点 / 纠缠线 / 引力对 / 幽灵根 / 树之树元节点。
// 悬停提示(app/hover.js)与视口历史的节点详情(ui/viewport-panel.js)共用。
// 全部文案模板在语言包 ui.nodeInfo 里(带参数的是模板函数,各语言自理语序)。

import { trees } from '../core/registry.js';
import { GRAVITY_KINDS } from '../data/gravity.js';
import { state, stratOn, runtime } from '../core/state.js';
import { L } from '../i18n/index.js';

const T = L.ui.nodeInfo;

export function nodeInfoHTML(n) {
  if (n.platform)
    return `<b>${n.name}</b><span class="tt-kind">${T.platformKind}</span>`;
  const kind = n.level === 0 ? T.kindRoot : (n.hasChildren ? T.kindSkeleton : T.kindLeaf);
  const treeName = n.tree >= 0 ? trees[n.tree].def.name : T.platformTreeName;
  const revealed = n.tangles.filter(t => t.revealedNow);
  let h = `<b>${n.name}</b><span class="tt-kind">${treeName} · ${kind}</span>`;
  h += `<div class="tt-mean">${T.meanings(1 + revealed.length, revealed.length > 0)}</div>`;
  if (revealed.length) {
    h += '<ul>' + revealed.map(t => {
      const other = t.aNode === n ? t.bName : t.aName;
      return T.tangleItem(other, t.why);
    }).join('') + '</ul>';
  }
  if (n.gravity && runtime.gravityPull > .4) {
    const other = n.gravity.na === n ? n.gravity.bName : n.gravity.aName;
    h += `<div class="tt-grav">${T.gravNote(GRAVITY_KINDS[n.gravity.kind], other)}</div><ul><li>${n.gravity.why}</li></ul>`;
  }
  if (n.ghost && state.stage >= 5) {
    h += `<div class="tt-ghost">${T.ghostNote(n.ghost.n)}</div>`;
  }
  return h;
}

export function tangleInfoHTML(t) {
  let mode = `<span style="color:#ff4d6d">${T.tangleActive}</span>`;
  if (stratOn('platform')) mode = `<span style="color:#ffd166">${T.tanglePlatformed}</span>`;
  else if (stratOn('layer')) mode = `<span style="color:#ffb84d">${T.tangleContracted}</span>`;
  else if (t.resolvedByLoops) mode = `<span style="color:#9ad1b6">${T.tangleLooped}</span>`;
  return `<b>${t.aName} ↔ ${t.bName}</b><div style="margin:3px 0">${t.why}</div>${mode}`;
}

export function gravityInfoHTML(g) {
  const mode = stratOn('fusion')
    ? `<span style="color:#ffd166">${T.gravFused}</span>`
    : `<span style="color:#ff2fd0">${T.gravActive}</span>`;
  return `<b>${g.aName} ⚡ ${g.bName}</b><span class="tt-kind">${T.gravKindLabel(GRAVITY_KINDS[g.kind])}</span>` +
    `<div style="margin:3px 0">${g.why}</div>${mode}`;
}

export function ghostInfoHTML(g) {
  const mode = stratOn('explicit')
    ? `<span style="color:#ffd166">${T.ghostCollected}</span>`
    : `<span style="color:#7de8ff">${T.ghostFree}</span>`;
  return `<b>👻 ${g.n}</b><div style="margin:3px 0">${g.why}</div><div style="margin:3px 0;color:#93a0b8">${T.ghostFix(g.fix)}</div>${mode}`;
}

export function metaInfoHTML(meta) {
  const p = meta.parentDef;
  return `<b>${meta.seq.p ? '' : '🌱 '}${meta.def.name}</b>` +
    `<span class="tt-kind">${T.metaKind(meta.idx + 1, p ? p.short : null)}</span>` +
    `<div class="tt-desc">${meta.seq.why}</div>` +
    `<div style="margin-top:4px;color:#93a0b8">${meta.def.constraint}</div>`;
}
