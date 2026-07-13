#!/usr/bin/env node
// 叙事一致性校验:文案(语言包、README)里的硬编码计数与结构声明,必须与数据源(src/data/*)的推导值一致;
// 且 zh / en 两个语言包的键集合必须与数据结构完全对齐(双向:缺文案、孤儿文案都报)。
// 动机:计数散落多处、靠人手同步,出现过「新增幽灵根漏改 README」「缺角树数错」类回归——
// 这里把「叙事严谨」变成门禁:随 pnpm run check 执行,失败信息直接给出期望值与所在位置。
// 只 import 纯数据层(data / story / i18n / config,均零 three 依赖);scene / ui 不触碰。

import { readFileSync } from 'node:fs';
import { TREE_DEFS } from '../src/data/trees.js';
import { TANGLES } from '../src/data/tangles.js';
import { GRAVITY, GRAVITY_KINDS } from '../src/data/gravity.js';
import { GHOSTS } from '../src/data/ghosts.js';
import { META_PATHS } from '../src/data/meta-paths.js';
import { STRAT_FACTORS } from '../src/data/strategies.js';
import { PLATFORM_NODES } from '../src/data/platform.js';
import { LAWS } from '../src/story/laws.js';
import { STAGES } from '../src/story/stages.js';
import { FOCUS_ID, FOCUS_SET } from '../src/config.js';
import { zh } from '../src/i18n/locales/zh/index.js';
import { en } from '../src/i18n/locales/en/index.js';

const errs = [];
const ok = (cond, msg) => { if (!cond) errs.push(msg); };
const setEq = (actual, expect, msg) => {
  const a = new Set(actual), e = new Set(expect);
  for (const k of e) if (!a.has(k)) errs.push(`${msg}:缺「${k}」`);
  for (const k of a) if (!e.has(k)) errs.push(`${msg}:多出孤儿「${k}」`);
};

/* 汉字数词:zh 计数在正文里以汉字出现(十四棵横切树/五个幽灵根/七条路径…) */
const CN = '零一二三四五六七八九十';
const cnNum = n => n <= 10 ? CN[n] : n < 20 ? '十' + (n === 10 ? '' : CN[n - 10]) : String(n);
const cnQ = n => n === 2 ? '两' : cnNum(n); // 量词语境:二 → 两
/* 英文数词:en 计数在正文里以单词出现(fourteen cross-cutting trees / five ghost roots…) */
const EN_NUM = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const enNum = n => n < EN_NUM.length ? EN_NUM[n] : String(n);
const hasI = (text, phrase) => text.toLowerCase().includes(phrase.toLowerCase());

/* ===== 数据推导值 ===== */
let nodeTotal = 0, leafCount = 0;
const gids = new Set();       // 全部节点 gid(含根)
const childGids = new Set();  // 非根节点 gid(语言包 nodes 表的键集合)
for (const t of TREE_DEFS) {
  nodeTotal++; gids.add(t.id + '.root'); // 根节点 gid 与 scene/trees.js 的构建规则一致
  (function walk(list) {
    for (const n of list) {
      nodeTotal++; gids.add(t.id + '.' + n.id); childGids.add(t.id + '.' + n.id);
      if (n.c && n.c.length) walk(n.c); else leafCount++;
    }
  })(t.l1);
}
const treeCount = TREE_DEFS.length;
const bizCount = TREE_DEFS.filter(t => t.kind === 'biz').length;
const crossCount = treeCount - bizCount;
const focusPartners = TANGLES.filter(t => t.a === FOCUS_ID || t.b === FOCUS_ID)
  .map(t => t.a === FOCUS_ID ? t.b : t.a);
const focusMeanings = 1 + focusPartners.length; // 原义 + 每条交织多背一个含义
const tangleKeys = TANGLES.map(t => `${t.a}|${t.b}`);
const gravityKeys = GRAVITY.map(g => `${g.a}|${g.b}`);
const termCount = code =>
  (readFileSync(new URL(`../src/i18n/locales/${code}/terms.js`, import.meta.url), 'utf8').match(/^defTerm\(/gm) || []).length;
const zhTermCount = termCount('zh'), enTermCount = termCount('en');
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

/* ===== 3. 演化路径(STEP 9):拓扑序、唯一元根(结构,与语言无关) ===== */
const missingByPath = {}; // 路径 k → 缺角树 id 列表(缺角文案按语言各查一遍)
for (const p of META_PATHS) {
  const ids = p.seq.map(s => s.t);
  ok(new Set(ids).size === ids.length, `路径 ${p.k}:seq 里有重复的树`);
  ok(p.seq[0]?.p === null && p.seq.filter(s => !s.p).length === 1, `路径 ${p.k}:必须恰好一个元根且位于 seq[0]`);
  const grown = new Set();
  for (const s of p.seq) {
    ok(TREE_DEFS.some(t => t.id === s.t), `路径 ${p.k}:未知树 ${s.t}`);
    if (s.p) ok(grown.has(s.p), `路径 ${p.k}:「${s.t}」的父「${s.p}」尚未生长,拓扑序被破坏`);
    grown.add(s.t);
  }
  missingByPath[p.k] = TREE_DEFS.map(t => t.id).filter(id => !grown.has(id));
}

/* ===== 4. 语言包结构对齐:键集合与数据双向一致(zh / en 各查一遍) ===== */
for (const [code, pack] of [['zh', zh], ['en', en]]) {
  const at = where => `语言包 ${code}.${where}`;
  setEq(Object.keys(pack.trees), TREE_DEFS.map(t => t.id), at('trees'));
  for (const [id, t] of Object.entries(pack.trees))
    for (const f of ['name', 'short', 'constraint', 'tradeoff', 'rootName'])
      ok(typeof t[f] === 'string' && t[f], `${at(`trees.${id}`)} 缺字段 ${f}`);
  setEq(Object.keys(pack.nodes), childGids, at('nodes'));
  setEq(Object.keys(pack.tangles), tangleKeys, at('tangles'));
  setEq(Object.keys(pack.gravityPairs), gravityKeys, at('gravityPairs'));
  setEq(Object.keys(pack.gravityKinds), Object.keys(GRAVITY_KINDS), at('gravityKinds'));
  setEq(Object.keys(pack.ghosts), GHOSTS.map(g => g.id), at('ghosts'));
  for (const [id, g] of Object.entries(pack.ghosts))
    for (const f of ['n', 'why', 'fix']) ok(typeof g[f] === 'string' && g[f], `${at(`ghosts.${id}`)} 缺字段 ${f}`);
  setEq(Object.keys(pack.metaPaths), META_PATHS.map(p => p.k), at('metaPaths'));
  for (const p of META_PATHS) {
    const t = pack.metaPaths[p.k]; if (!t) continue;
    setEq(Object.keys(t.seq || {}), p.seq.map(s => s.t), at(`metaPaths.${p.k}.seq`));
    for (const f of ['name', 'proto', 'pct', 'desc', 'strong', 'weak'])
      ok(typeof t[f] === 'string' && t[f], `${at(`metaPaths.${p.k}`)} 缺字段 ${f}`);
    ok(!!t.grp === !!p.grp, `${at(`metaPaths.${p.k}`)}:grp 分组标与数据不一致(数据${p.grp ? '有' : '无'},文案${t.grp ? '有' : '无'})`);
  }
  setEq(Object.keys(pack.strategies), Object.keys(STRAT_FACTORS), at('strategies'));
  setEq(Object.keys(pack.platform), Object.keys(PLATFORM_NODES), at('platform'));
  setEq(Object.keys(pack.laws), LAWS.map(l => l.k), at('laws'));
  ok(pack.stages.length === STAGES.length, `${at('stages')}:应为 ${STAGES.length} 步,实为 ${pack.stages.length}`);
  ok(pack.dotNames.length === pack.stages.length, `${at('dotNames')}:导航点数应与步数一致`);
  for (const [f, v] of Object.entries(pack.meta))
    ok(typeof v === 'string' && v, `${at(`meta.${f}`)} 缺失`);
}
/* ui 与 lawsSvg:zh/en 递归键对齐(值类型也须一致;函数只比存在性) */
(function keyParity(a, b, path) {
  if (typeof a !== typeof b) { errs.push(`语言包 ui 类型不一致:${path}(zh=${typeof a},en=${typeof b})`); return; }
  if (typeof a !== 'object' || a === null) return;
  setEq(Object.keys(b), Object.keys(a), `语言包 en.${path}`);
  for (const k of Object.keys(a)) if (k in b) keyParity(a[k], b[k], `${path}.${k}`);
})({ ui: zh.ui, lawsSvg: zh.lawsSvg }, { ui: en.ui, lawsSvg: en.lawsSvg }, '');
ok(zhTermCount === enTermCount, `名词解释条数不一致:zh ${zhTermCount} 条,en ${enTermCount} 条(两包须逐概念对齐)`);

/* ===== 5. 文案计数(zh / en 各按本语言的规范短语校验) ===== */
function checkCopy(code, pack, P) {
  const S = pack.stages, at = w => `[${code}] ${w}`;
  ok(P.stage0biz(S[0].body), at(`STEP 0:业务树计数应含规范短语「${P.stage0bizPhrase}」`));
  ok(S[0].body.toLowerCase().includes(P.stage0cross.toLowerCase()), at(`STEP 0:应含「${P.stage0cross}」`));
  ok(hasI(S[2].body, P.stage2total), at(`STEP 2:总数应为「${P.stage2total}」`));
  ok(S[4].body.includes(P.stage4pairs), at(`STEP 4:引力对数应为「${P.stage4pairs}」`));
  ok(hasI(S[5].body, P.stage5ghosts), at(`STEP 5:幽灵根计数应为「${P.stage5ghosts}」`));
  ok((S[5].body.match(/👻/g) || []).length === GHOSTS.length, at(`STEP 5:👻 列表应恰好 ${GHOSTS.length} 项`));
  for (const g of GHOSTS) {
    const name = pack.ghosts[g.id]?.n.split(' · ')[0];
    ok(name && S[5].body.includes(name), at(`STEP 5:幽灵根「${name}」未列出`));
  }
  ok(S[6].body.includes(P.stage6meanings), at(`STEP 6:焦点含义数应为「${P.stage6meanings}」(1 原义 + ${focusPartners.length} 交织)`));
  ok((S[6].body.match(/<li>/g) || []).length === focusMeanings, at(`STEP 6:含义列表应恰好 ${focusMeanings} 项`));
  ok(hasI(S[9].body, P.stage9paths), at(`STEP 9:路径数应为「${P.stage9paths}」`));
  { // 「N 组顺序对照」的标称数与列表项自洽
    const m = S[9].body.match(P.stage9pairsRe);
    const pairs = (S[9].body.match(/<li><b>/g) || []).length;
    ok(m && P.stage9pairsNum(m[1]) === pairs, at(`STEP 9:顺序对照标称「${m?.[1] ?? '?'}」与实际列表 ${pairs} 项不符`));
  }
  const law = k => pack.laws[k] ?? { scene: '' };
  ok(law('roots').scene.includes(P.lawRoots), at(`法则 roots:应为「${P.lawRoots}」`));
  ok(law('leaves').scene.includes(P.lawLeaves), at(`法则 leaves:叶子数应为「${P.lawLeaves}」`));
  ok(law('coupling').scene.includes(P.lawCoupling), at(`法则 coupling:应为「${P.lawCoupling}」`));
  ok(hasI(law('explicit').scene, P.lawExplicit), at(`法则 explicit:应为「${P.lawExplicit}」`));
  for (const p of META_PATHS) { // 缺角树:缺几棵、缺哪几棵,desc/weak 必须与数据一致
    const missing = missingByPath[p.k];
    if (!missing.length) continue;
    const t = pack.metaPaths[p.k];
    const copy = (t.desc + t.weak).toLowerCase();
    for (const id of missing)
      ok(copy.includes(pack.trees[id].short.toLowerCase()), at(`路径 ${p.k}:缺「${pack.trees[id].short}」树,但 desc/weak 未提及`));
    ok(hasI(t.weak, P.missingPhrase(missing.length)), at(`路径 ${p.k}:实缺 ${missing.length} 棵,weak 应含规范短语「${P.missingPhrase(missing.length)}」`));
  }
}
checkCopy('zh', zh, {
  stage0biz: body => body.includes(`${cnQ(bizCount)}棵`), stage0bizPhrase: `${cnQ(bizCount)}棵`,
  stage0cross: `${cnQ(crossCount)}棵横切树`,
  stage2total: `${cnQ(treeCount)}棵树`,
  stage4pairs: `${GRAVITY.length} 对`,
  stage5ghosts: `${cnQ(GHOSTS.length)}个<span class="gh">幽灵根`,
  stage6meanings: `${focusMeanings} 个含义`,
  stage9paths: `${cnQ(META_PATHS.length)}条路径`,
  stage9pairsRe: /(\S)组顺序对照/, stage9pairsNum: w => CN.indexOf(w),
  lawRoots: `${treeCount} 个根`, lawLeaves: `${leafCount} 片叶子`,
  lawCoupling: `${GRAVITY.length} 对`, lawExplicit: `${cnQ(GHOSTS.length)}个幽灵根`,
  missingPhrase: n => `${cnQ(n)}棵树根本不长`,
});
checkCopy('en', en, {
  stage0biz: body => new RegExp(`${enNum(bizCount)}[^.<]{0,24}<b>domain trees</b>`, 'i').test(body),
  stage0bizPhrase: `${enNum(bizCount)} … <b>domain trees</b>`,
  stage0cross: `${enNum(crossCount)} cross-cutting trees`,
  stage2total: `${enNum(treeCount)} trees`,
  stage4pairs: `${GRAVITY.length} pairs`,
  stage5ghosts: `${enNum(GHOSTS.length)} <span class="gh">ghost root`,
  stage6meanings: `${focusMeanings} meanings`,
  stage9paths: `${enNum(META_PATHS.length)} paths`,
  stage9pairsRe: /(\w+) head-to-head orderings/i, stage9pairsNum: w => EN_NUM.indexOf(w.toLowerCase()),
  lawRoots: `${treeCount} roots`, lawLeaves: `${leafCount} leaves`,
  lawCoupling: `${GRAVITY.length} gravity pairs`, lawExplicit: `${enNum(GHOSTS.length)} ghost roots`,
  missingPhrase: n => `${enNum(n)} trees simply never grow`,
});

/* ===== 6. README(zh)与 zh 词条源文件头注释 ===== */
ok(readme.includes(`（${TANGLES.length} 个真实纠缠案例）`), `README:交织数应为「（${TANGLES.length} 个真实纠缠案例）」`);
ok(readme.includes(`（${GRAVITY.length} 对，`), `README:引力应为「（${GRAVITY.length} 对，…」`);
for (const g of GHOSTS) ok(readme.includes(zh.ghosts[g.id].n.split(' · ')[0]), `README:幽灵根「${zh.ghosts[g.id].n.split(' · ')[0]}」未提及`);
ok(readme.includes(`${cnQ(META_PATHS.length)}条演化路径`), `README:应为「${cnQ(META_PATHS.length)}条演化路径」`);
ok(readme.includes(`${nodeTotal} 个节点球`), `README:节点总数应为「${nodeTotal} 个节点球」`);
ok(readme.includes(`${zhTermCount} 条名词解释`) && readme.includes(`共 ${zhTermCount} 条`),
  `README:名词解释条数应为 ${zhTermCount}(两处:代码结构树 / 名词解释段)`);
const zhTermSrc = readFileSync(new URL('../src/i18n/locales/zh/terms.js', import.meta.url), 'utf8');
ok(zhTermSrc.startsWith(`// 名词解释(zh):${zhTermCount} 个概念词条`), `zh/terms.js 头注释:词条数应为 ${zhTermCount}`);

/* ===== 结果 ===== */
if (errs.length) {
  console.error(`✗ 叙事一致性校验失败(${errs.length} 处):`);
  for (const e of errs) console.error('  · ' + e);
  process.exit(1);
}
console.log(`✓ 叙事一致性通过(${treeCount} 树 · ${nodeTotal} 节点 · ${leafCount} 叶 · 交织 ${TANGLES.length} · 引力 ${GRAVITY.length} · 幽灵根 ${GHOSTS.length} · 路径 ${META_PATHS.length} · 词条 ${zhTermCount}×2 语言 · 焦点含义 ${focusMeanings})`);
