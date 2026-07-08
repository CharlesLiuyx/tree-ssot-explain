#!/usr/bin/env node
// 叙事一致性校验:文案(src/story/*、README)里的硬编码计数与结构声明,必须与数据源(src/data/*)的推导值一致。
// 动机:计数散落多处、靠人手同步,出现过「新增幽灵根漏改 README」「缺角树数错」类回归——
// 这里把「叙事严谨」变成门禁:随 pnpm run check 执行,失败信息直接给出期望值与所在位置。
// 只 import 纯数据层(data / story / config,均零依赖);scene / ui import three,Node 下不可解析,不触碰。

import { readFileSync } from 'node:fs';
import { TREE_DEFS } from '../src/data/trees.js';
import { TANGLES } from '../src/data/tangles.js';
import { GRAVITY } from '../src/data/gravity.js';
import { GHOSTS } from '../src/data/ghosts.js';
import { META_PATHS } from '../src/data/meta-paths.js';
import { STAGES } from '../src/story/stages.js';
import { LAWS } from '../src/story/laws.js';
import { FOCUS_ID, FOCUS_SET } from '../src/config.js';

const errs = [];
const ok = (cond, msg) => { if (!cond) errs.push(msg); };

/* 汉字数词:计数在正文里以汉字出现(十四棵横切树/五个幽灵根/七条路径…) */
const CN = '零一二三四五六七八九十';
const cnNum = n => n <= 10 ? CN[n] : n < 20 ? '十' + (n === 10 ? '' : CN[n - 10]) : String(n);
const cnQ = n => n === 2 ? '两' : cnNum(n); // 量词语境:二 → 两

/* ===== 数据推导值 ===== */
let nodeTotal = 0, leafCount = 0;
const gids = new Set();
for (const t of TREE_DEFS) {
  nodeTotal++; gids.add(t.id + '.root'); // 根节点 gid 与 scene/trees.js 的构建规则一致
  (function walk(list) {
    for (const n of list) {
      nodeTotal++; gids.add(t.id + '.' + n.id);
      if (n.c && n.c.length) walk(n.c); else leafCount++;
    }
  })(t.l1);
}
const treeCount = TREE_DEFS.length;
const bizCount = TREE_DEFS.filter(t => t.kind === 'biz').length;
const crossCount = treeCount - bizCount;
const shortOf = Object.fromEntries(TREE_DEFS.map(t => [t.id, t.short]));
const focusPartners = TANGLES.filter(t => t.a === FOCUS_ID || t.b === FOCUS_ID)
  .map(t => t.a === FOCUS_ID ? t.b : t.a);
const focusMeanings = 1 + focusPartners.length; // 原义 + 每条交织多背一个含义
const termSrc = readFileSync(new URL('../src/story/terms.js', import.meta.url), 'utf8');
const termCount = (termSrc.match(/^defTerm\(/gm) || []).length;
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

/* ===== 1. 引用完整性(与浏览器启动校验同源,提前到静态阶段) ===== */
for (const t of TANGLES) for (const g of [t.a, t.b]) ok(gids.has(g), `TANGLES 引用不存在的节点:${g}`);
for (const g of GRAVITY) for (const e of [g.a, g.b]) ok(gids.has(e), `GRAVITY 引用不存在的节点:${e}`);
for (const g of GHOSTS) for (const e of g.t) ok(gids.has(e), `GHOSTS(${g.id}) 引用不存在的节点:${e}`);
{ // 一个节点最多属于一对引力(gravity.js 登记时 node.gravity 会被覆盖)
  const seen = new Set();
  for (const g of GRAVITY) for (const e of [g.a, g.b]) {
    ok(!seen.has(e), `引力节点复用:${e} 出现在多对里,登记会互相覆盖`);
    seen.add(e);
  }
}

/* ===== 2. 崩塌焦点(STEP 6):config.FOCUS_SET 必须 = 焦点 + 其树根 + 全部交织伙伴 ===== */
{
  const expect = new Set([FOCUS_ID, FOCUS_ID.split('.')[0] + '.root', ...focusPartners]);
  ok(FOCUS_SET.size === expect.size && [...expect].every(g => FOCUS_SET.has(g)),
    `config.FOCUS_SET 与 ${FOCUS_ID} 的交织数据不一致,期望:{${[...expect].join(', ')}}`);
}

/* ===== 3. 演化路径(STEP 9):拓扑序、唯一元根、缺角树必须如实写进文案 ===== */
for (const p of META_PATHS) {
  const ids = p.seq.map(s => s.t);
  ok(new Set(ids).size === ids.length, `路径 ${p.k}:seq 里有重复的树`);
  ok(p.seq[0]?.p === null && p.seq.filter(s => !s.p).length === 1, `路径 ${p.k}:必须恰好一个元根且位于 seq[0]`);
  const grown = new Set();
  for (const s of p.seq) {
    ok(s.t in shortOf, `路径 ${p.k}:未知树 ${s.t}`);
    if (s.p) ok(grown.has(s.p), `路径 ${p.k}:「${s.t}」的父「${s.p}」尚未生长,拓扑序被破坏`);
    grown.add(s.t);
  }
  const missing = TREE_DEFS.map(t => t.id).filter(id => !grown.has(id));
  if (missing.length) { // 缺角树(如 Playwright):缺几棵、缺哪几棵,desc/weak 必须与数据一致
    const copy = p.desc + p.weak;
    for (const id of missing) ok(copy.includes(shortOf[id]), `路径 ${p.k}:缺「${shortOf[id]}」树,但 desc/weak 未提及`);
    ok(p.weak.includes(`${cnQ(missing.length)}棵树根本不长`),
      `路径 ${p.k}:实缺 ${missing.length} 棵,weak 应含规范短语「${cnQ(missing.length)}棵树根本不长」`);
  }
}

/* ===== 4. 十步文案(stages.js)里的计数 ===== */
ok(STAGES[0].body.includes(`${cnQ(bizCount)}棵`), `STEP 0:业务树应为「${cnQ(bizCount)}棵」`);
ok(STAGES[0].body.includes(`${cnQ(crossCount)}棵横切树`), `STEP 0:应为「${cnQ(crossCount)}棵横切树」`);
ok(STAGES[2].body.includes(`${cnQ(treeCount)}棵树`), `STEP 2:总数应为「${cnQ(treeCount)}棵树」`);
ok(STAGES[4].body.includes(`${GRAVITY.length} 对`), `STEP 4:引力对数应为「${GRAVITY.length} 对」`);
ok(STAGES[5].body.includes(`${cnQ(GHOSTS.length)}个<span class="gh">幽灵根`), `STEP 5:幽灵根计数应为「${cnQ(GHOSTS.length)}个」`);
ok((STAGES[5].body.match(/👻/g) || []).length === GHOSTS.length, `STEP 5:👻 列表应恰好 ${GHOSTS.length} 项`);
for (const g of GHOSTS) ok(STAGES[5].body.includes(g.n.split(' · ')[0]), `STEP 5:幽灵根「${g.n.split(' · ')[0]}」未列出`);
ok(STAGES[6].body.includes(`${focusMeanings} 个含义`), `STEP 6:焦点含义数应为「${focusMeanings} 个含义」(1 原义 + ${focusPartners.length} 交织)`);
ok((STAGES[6].body.match(/<li>/g) || []).length === focusMeanings, `STEP 6:含义列表应恰好 ${focusMeanings} 项`);
ok(STAGES[9].body.includes(`${cnQ(META_PATHS.length)}条路径`), `STEP 9:路径数应为「${cnQ(META_PATHS.length)}条路径」`);
{ // 「N 组顺序对照」的标称数与列表项自洽
  const m = STAGES[9].body.match(/(\S)组顺序对照/);
  const pairs = (STAGES[9].body.match(/<li><b>先/g) || []).length;
  ok(m && CN.indexOf(m[1]) === pairs, `STEP 9:「${m?.[1] ?? '?'}组顺序对照」与实际列表 ${pairs} 项不符`);
}

/* ===== 5. 法则卡片(laws.js)现场解说里的计数 ===== */
const law = k => LAWS.find(l => l.k === k) ?? { scene: '' };
ok(law('roots').scene.includes(`${treeCount} 个根`), `法则「人守根」:应为「${treeCount} 个根」`);
ok(law('leaves').scene.includes(`${leafCount} 片叶子`), `法则「AI 写叶」:叶子数应为「${leafCount} 片叶子」`);
ok(law('coupling').scene.includes(`${GRAVITY.length} 对`), `法则「分清两种耦合」:应为「${GRAVITY.length} 对」`);
ok(law('explicit').scene.includes(`${cnQ(GHOSTS.length)}个幽灵根`), `法则「让真相住在图内」:应为「${cnQ(GHOSTS.length)}个幽灵根」`);

/* ===== 6. README 与 terms.js 头注释 ===== */
ok(readme.includes(`（${TANGLES.length} 个真实纠缠案例）`), `README:交织数应为「（${TANGLES.length} 个真实纠缠案例）」`);
ok(readme.includes(`（${GRAVITY.length} 对，`), `README:引力应为「（${GRAVITY.length} 对，…」`);
for (const g of GHOSTS) ok(readme.includes(g.n.split(' · ')[0]), `README:幽灵根「${g.n.split(' · ')[0]}」未提及`);
ok(readme.includes(`${cnQ(META_PATHS.length)}条演化路径`), `README:应为「${cnQ(META_PATHS.length)}条演化路径」`);
ok(readme.includes(`${nodeTotal} 个节点球`), `README:节点总数应为「${nodeTotal} 个节点球」`);
ok(readme.includes(`${termCount} 条名词解释`) && readme.includes(`共 ${termCount} 条`),
  `README:名词解释条数应为 ${termCount}(两处:代码结构树 / 名词解释段)`);
ok(termSrc.startsWith(`// 名词解释(纯数据):${termCount} 个概念词条`), `terms.js 头注释:词条数应为 ${termCount}`);

/* ===== 结果 ===== */
if (errs.length) {
  console.error(`✗ 叙事一致性校验失败(${errs.length} 处):`);
  for (const e of errs) console.error('  · ' + e);
  process.exit(1);
}
console.log(`✓ 叙事一致性通过(${treeCount} 树 · ${nodeTotal} 节点 · ${leafCount} 叶 · 交织 ${TANGLES.length} · 引力 ${GRAVITY.length} · 幽灵根 ${GHOSTS.length} · 路径 ${META_PATHS.length} · 词条 ${termCount} · 焦点含义 ${focusMeanings})`);
