// 详情 HTML 构建器:节点 / 纠缠线 / 引力对 / 幽灵根 / 树之树元节点。
// 悬停提示(app/hover.js)与视口历史的节点详情(ui/viewport-panel.js)共用。

import { trees } from '../core/registry.js';
import { state, stratOn, runtime } from '../core/state.js';

export function nodeInfoHTML(n) {
  if (n.platform)
    return `<b>${n.name}</b><span class="tt-kind">平台树 · 横切关注点的显式归属</span>`;
  const kind = n.level === 0 ? 'SSOT · 由人守护' : (n.hasChildren ? '骨架 · 谨慎交给 AI' : '叶子 · AI 自由区（需测试锚定）');
  const treeName = n.tree >= 0 ? trees[n.tree].def.name : '平台树';
  const revealed = n.tangles.filter(t => t.revealedNow);
  let h = `<b>${n.name}</b><span class="tt-kind">${treeName} · ${kind}</span>`;
  h += `<div class="tt-mean">含义数：${1 + revealed.length}${revealed.length ? '（多义！）' : '（单义 ✓）'}</div>`;
  if (revealed.length) {
    h += '<ul>' + revealed.map(t => {
      const other = t.aNode === n ? t.bName : t.aName;
      return `<li><b>与「${other}」交织</b>：${t.why}</li>`;
    }).join('') + '</ul>';
  }
  if (n.gravity && runtime.gravityPull > .4) {
    const other = n.gravity.na === n ? n.gravity.bName : n.gravity.aName;
    h += `<div class="tt-grav">⚡ 本征耦合：与「${other}」势必靠近</div><ul><li>${n.gravity.why}</li></ul>`;
  }
  if (n.ghost && state.stage >= 5) {
    h += `<div class="tt-ghost">👻 真相在图外：由「${n.ghost.n}」决定——AI 从文本读不到</div>`;
  }
  return h;
}

export function tangleInfoHTML(t) {
  let mode = '<span style="color:#ff4d6d">● 纠缠中</span>';
  if (stratOn('platform')) mode = '<span style="color:#ffd166">● 已平台化：双方只依赖平台服务</span>';
  else if (stratOn('layer')) mode = '<span style="color:#ffb84d">● 已契约化：必须穿过层间接口</span>';
  else if (t.resolvedByLoops) mode = '<span style="color:#9ad1b6">● 本轮循环中已消解</span>';
  return `<b>${t.aName} ↔ ${t.bName}</b><div style="margin:3px 0">${t.why}</div>${mode}`;
}

export function gravityInfoHTML(g) {
  const mode = stratOn('fusion')
    ? '<span style="color:#ffd166">● 已共域：同一模块、一起设计、一个 owner</span>'
    : '<span style="color:#ff2fd0">● 本征耦合 —— 拆不开，只能共域</span>';
  return `<b>${g.aName} ⚡ ${g.bName}</b><div style="margin:3px 0">${g.why}</div>${mode}`;
}

export function ghostInfoHTML(g) {
  const mode = stratOn('explicit')
    ? '<span style="color:#ffd166">● 已收编：真相已显式化入库（装配文件 / 订阅表 / golden-file / schema）</span>'
    : '<span style="color:#7de8ff">● 游离在图外 —— AI 从文本静态读不到它</span>';
  return `<b>👻 ${g.n}</b><div style="margin:3px 0">${g.why}</div><div style="margin:3px 0;color:#93a0b8"><b style="color:#dfe6f3">出路</b>：${g.fix}</div>${mode}`;
}

export function metaInfoHTML(meta) {
  const p = meta.parentDef;
  return `<b>${meta.seq.p ? '' : '🌱 '}${meta.def.name}</b>` +
    `<span class="tt-kind">树之树 · 第 ${meta.idx + 1} 个长出${p ? ` · 从「${p.short}」的痛点里长出` : ' · 元根'}</span>` +
    `<div class="tt-desc">${meta.seq.why}</div>` +
    `<div style="margin-top:4px;color:#93a0b8">${meta.def.constraint}</div>`;
}
