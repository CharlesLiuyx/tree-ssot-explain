// 树之树 · STEP 9(纯结构):七条演化路径——同一组树,不同生长顺序,长成不同的元树。
// seq 是拓扑序:每一项 = {t:树id, p:父树id|null};grp:true = 家族分组行的起点(积木族首条)。
// 全部文案(路径名/原型/骨骼/假肢/每步 why/分组标)在 src/i18n/locales/<语言>/meta-paths.js。
// 元根判据只有一条:单向门决策够密——文件格式/第一张表主键/事件流口径/留痕承诺,迈过去就几乎改不回。
// 门控是天生的双向门(Flag 生来就是要被回滚的),约束不了任何人:它可以来得很早,永远当不了元根。
// 四个内焊元根:手感(A 深度编辑)/协同(B 同时在线)/合规(C 可追责)/数据(D 数据说了算);
// A/B 互为镜像(深↔可合并),C/D 互为镜像(留痕↔快跑)——同一批单向门只能为一个主人焊死,类似不可能三角。
// 第五族(E/F/G 开发者积木)的元根是对外契约的三副面孔:声明(E Terraform)/承诺(F Playwright)/口径(G Sentry)。
// 前四条的单向门焊在自己仓库里,积木族的由 Hyrum 定律替它焊在环外——动根者失其树(E),或根本没有商业尾巴(F)。
// F 是缺角树:协同/权限/多租户/计费/隐私五棵不长,seq 仅 11 项(场景按 seq 泛型生长,短 seq 天然支持);
// G 是意外成砖:元根是 edit(分组口径),契约第二天才醒来——与 E/F 的「契约先于产品」互为对照。

import { L, req } from '../i18n/index.js';

export const META_PATHS = [
 {k:'tool',
  seq:[
    {t:'edit',  p:null},
    {t:'ui',    p:'edit'},
    {t:'conc',  p:'ui'},
    {t:'perf',  p:'conc'},
    {t:'compat',p:'edit'},
    {t:'arch',  p:'ui'},
    {t:'sec',   p:'arch'},
    {t:'i18n',  p:'ui'},
    {t:'fault', p:'conc'},
    {t:'obs',   p:'fault'},
    {t:'gate',  p:'obs'},
    {t:'collab',p:'arch'},
    {t:'authz', p:'collab'},
    {t:'tenant',p:'authz'},
    {t:'bill',  p:'tenant'},
    {t:'priv',  p:'bill'},
  ]},
 {k:'saas',
  seq:[
    {t:'collab',p:null},
    {t:'tenant',p:'collab'},
    {t:'authz', p:'tenant'},
    {t:'edit',  p:'collab'},
    {t:'ui',    p:'edit'},
    {t:'gate',  p:'ui'},
    {t:'obs',   p:'gate'},
    {t:'bill',  p:'tenant'},
    {t:'fault', p:'obs'},
    {t:'perf',  p:'obs'},
    {t:'arch',  p:'perf'},
    {t:'conc',  p:'arch'},
    {t:'compat',p:'arch'},
    {t:'priv',  p:'bill'},
    {t:'sec',   p:'priv'},
    {t:'i18n',  p:'bill'},
  ]},
 {k:'ent',
  seq:[
    {t:'authz', p:null},
    {t:'sec',   p:'authz'},
    {t:'priv',  p:'sec'},
    {t:'edit',  p:'authz'},
    {t:'compat',p:'edit'},
    {t:'fault', p:'edit'},
    {t:'obs',   p:'fault'},
    {t:'ui',    p:'edit'},
    {t:'conc',  p:'fault'},
    {t:'perf',  p:'conc'},
    {t:'arch',  p:'compat'},
    {t:'gate',  p:'arch'},
    {t:'tenant',p:'authz'},
    {t:'bill',  p:'tenant'},
    {t:'i18n',  p:'compat'},
    {t:'collab',p:'ui'},
  ]},
 {k:'growth',
  seq:[
    {t:'obs',   p:null},
    {t:'gate',  p:'obs'},
    {t:'ui',    p:'gate'},
    {t:'edit',  p:'ui'},
    {t:'perf',  p:'obs'},
    {t:'i18n',  p:'ui'},
    {t:'bill',  p:'obs'},
    {t:'collab',p:'ui'},
    {t:'conc',  p:'perf'},
    {t:'fault', p:'perf'},
    {t:'arch',  p:'fault'},
    {t:'sec',   p:'bill'},
    {t:'authz', p:'collab'},
    {t:'priv',  p:'authz'},
    {t:'compat',p:'arch'},
    {t:'tenant',p:'bill'},
  ]},
 {k:'tf', grp:true,
  seq:[
    {t:'compat',p:null},
    {t:'edit',  p:'compat'},
    {t:'conc',  p:'edit'},
    {t:'ui',    p:'edit'},
    {t:'fault', p:'edit'},
    {t:'obs',   p:'fault'},
    {t:'collab',p:'fault'},
    {t:'arch',  p:'fault'},
    {t:'gate',  p:'collab'},
    {t:'tenant',p:'collab'},
    {t:'perf',  p:'edit'},
    {t:'authz', p:'tenant'},
    {t:'sec',   p:'tenant'},
    {t:'bill',  p:'tenant'},
    {t:'priv',  p:'sec'},
    {t:'i18n',  p:'ui'},
  ]},
 {k:'pw',
  seq:[
    {t:'compat',p:null},
    {t:'fault', p:'compat'},
    {t:'edit',  p:'fault'},
    {t:'conc',  p:'edit'},
    {t:'obs',   p:'fault'},
    {t:'arch',  p:'compat'},
    {t:'ui',    p:'obs'},
    {t:'gate',  p:'compat'},
    {t:'perf',  p:'conc'},
    {t:'sec',   p:'arch'},
    {t:'i18n',  p:'ui'},
  ]},
 {k:'sen',
  seq:[
    {t:'edit',  p:null},
    {t:'compat',p:'edit'},
    {t:'ui',    p:'edit'},
    {t:'tenant',p:'compat'},
    {t:'bill',  p:'tenant'},
    {t:'priv',  p:'tenant'},
    {t:'collab',p:'ui'},
    {t:'fault', p:'tenant'},
    {t:'perf',  p:'fault'},
    {t:'arch',  p:'perf'},
    {t:'obs',   p:'fault'},
    {t:'conc',  p:'arch'},
    {t:'gate',  p:'obs'},
    {t:'authz', p:'tenant'},
    {t:'sec',   p:'authz'},
    {t:'i18n',  p:'ui'},
  ]},
];

/* 文案水合:路径级文案 + 每步 why 来自当前语言包(路径键 = k,seq 键 = 树 id);
   grp:true 的分组标替换为语言包里的整行文字。 */
for (const p of META_PATHS) {
  const t = req(L.metaPaths, p.k, 'metaPaths');
  p.name = t.name; p.proto = t.proto; p.pct = t.pct; p.desc = t.desc;
  p.strong = t.strong; p.weak = t.weak;
  if (p.grp) p.grp = req(t, 'grp', `metaPaths.${p.k}`);
  for (const s of p.seq) s.why = req(t.seq, s.t, `metaPaths.${p.k}.seq`);
}
