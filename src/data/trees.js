// 树定义(纯结构):两棵业务树 + 十四棵横切树。
// 以 Blender / VS Code 这类复杂交互工具为原型,业务树更深、更茂密。
// 字段:id 树 id(节点 gid 前缀)、pos 森林站位、layerX/layerZ「分层」策略下的排布、
//       kind 体型(biz|cross)、l1 一级子树(递归 {id,c})。
// 全部文案(树名/视角/代价/根名/节点名)在 src/i18n/locales/<语言>/trees.js,按当前语言水合;
// 新增一棵树:在此追加结构,并在每个语言包登记文案(缺文案启动即报错,键集合受 check 门禁)。
// 若参与交织/引力/幽灵根/树之树,再到同目录相应数据文件里登记(节点 gid = 树id.节点id)。

import { L, req } from '../i18n/index.js';

export const TREE_DEFS = [
  {id:'edit', color:0xd9e650, pos:[-15,0,9], layerX:-62.5, layerZ:14, kind:'biz',
   l1:[
     {id:'docmodel', c:[
       {id:'scenegraph', c:[
         {id:'instancing', c:[{id:'linkdup'},{id:'overridelib'}]},
         {id:'xform', c:[{id:'xformcache'}]},
         {id:'collections'},
       ]},
       {id:'depsgraph', c:[
         {id:'increval', c:[{id:'dirtyprop'},{id:'evalsched'}]},
         {id:'cycles'},
       ]},
       {id:'datablock', c:[
         {id:'uniquename'},
         {id:'refcount'},
       ]},
     ]},
     {id:'selection', c:[
       {id:'selset', c:[
         {id:'multisel'},
         {id:'modes'},
         {id:'active'},
       ]},
       {id:'softsel', c:[{id:'falloff'}]},
     ]},
     {id:'history', c:[
       {id:'undo', c:[
         {id:'snapshot', c:[{id:'snapgran'}]},
         {id:'coalesce'},
       ]},
       {id:'fileio', c:[
         {id:'fwdcompat'},
         {id:'migrate'},
       ]},
       {id:'autosave', c:[{id:'crashrec'}]},
     ]},
     {id:'ops', c:[
       {id:'cmdops', c:[
         {id:'replay', c:[{id:'ctxresolve'}]},
         {id:'macro'},
       ]},
       {id:'modstack', c:[
         {id:'nondestruct'},
         {id:'stackorder', c:[{id:'stackcache'}]},
       ]},
       {id:'transform', c:[
         {id:'numeric'},
         {id:'propedit'},
       ]},
     ]},
     {id:'driversys', c:[
       {id:'drivers', c:[
         {id:'exprdrv'},
         {id:'drvtarget'},
       ]},
       {id:'constraints', c:[{id:'solveorder'}]},
     ]},
   ]},
  {id:'ui', color:0xff7fb2, pos:[15,0,9], layerX:-87.5, layerZ:14, kind:'biz',
   l1:[
     {id:'feedback', c:[
       {id:'statusbar', c:[{id:'progress'}]},
       {id:'toast', c:[{id:'undotoast'}]},
     ]},
     {id:'panels', c:[
       {id:'docking', c:[
         {id:'layoutpersist'},
         {id:'workspaces'},
       ]},
       {id:'props', c:[
         {id:'twoway', c:[{id:'multiedit'}]},
         {id:'proppath'},
       ]},
       {id:'outliner', c:[
         {id:'treesync'},
         {id:'dragdrop'},
       ]},
     ]},
     {id:'exthost', c:[
       {id:'pluginapi', c:[
         {id:'sandbox', c:[{id:'capgrant'}]},
         {id:'apicompat', c:[{id:'deprecate'}]},
       ]},
       {id:'uicontrib', c:[
         {id:'custompanel'},
         {id:'theming'},
       ]},
     ]},
     {id:'viewport', c:[
       {id:'realtime', c:[
         {id:'dirtyrect', c:[{id:'overlaycomp'}]},
         {id:'lod', c:[{id:'proxydisp'}]},
       ]},
       {id:'gizmo', c:[
         {id:'dragconstraint'},
         {id:'snap', c:[{id:'snapprio'}]},
       ]},
       {id:'nav3d', c:[
         {id:'camctl'},
         {id:'multiview'},
       ]},
     ]},
     {id:'command', c:[
       {id:'palette', c:[
         {id:'fuzzy'},
         {id:'recent'},
       ]},
       {id:'keymap', c:[
         {id:'keyconflict', c:[{id:'ctxscope'}]},
         {id:'chords'},
       ]},
       {id:'menus', c:[{id:'ctxmenu'}]},
     ]},
   ]},
  // —— 经典四棵（内环）——
  {id:'arch', color:0x5b8cff, pos:[48,0,-2], layerX:12.5, layerZ:14, kind:'cross',
   l1:[
     {id:'layers', c:[{id:'di'},{id:'bus'}]},
     {id:'split',  c:[{id:'gw'},{id:'cfg'}]},
     {id:'plugin', c:[{id:'ext'},{id:'lc'}]},
   ]},
  {id:'perf', color:0xff9e4d, pos:[-48,0,-2], layerX:-37.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'cachesys', c:[{id:'cache'},{id:'invalidate'}]},
     {id:'datapath', c:[{id:'batch'},{id:'pool'}]},
     {id:'compute',  c:[{id:'precompute'},{id:'lazy'}]},
   ]},
  {id:'authz', color:0xb28dff, pos:[42,0,-29], layerX:37.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'rbac',  c:[{id:'roleinherit'},{id:'apiauth'}]},
     {id:'acl',   c:[{id:'rowacl'},{id:'mask'}]},
     {id:'audit', c:[{id:'auditlog'},{id:'replay2'}]},
   ]},
  {id:'gate', color:0x3ad6c5, pos:[-42,0,-29], layerX:62.5, layerZ:14, kind:'cross',
   l1:[
     {id:'flag',    c:[{id:'flagcfg'},{id:'vergate'}]},
     {id:'release', c:[{id:'canary'},{id:'envisol'}]},
     {id:'exp',     c:[{id:'abtest'},{id:'metrics'}]},
   ]},
  // —— 运行时三棵：可观测 / 并发 / 容错 ——
  {id:'obs', color:0x7ee08a, pos:[-16,0,-42], layerX:-12.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'logs',  c:[{id:'structlog'},{id:'logsample'}]},
     {id:'trace', c:[{id:'traceprop'},{id:'spanmap'}]},
     {id:'slo',   c:[{id:'metricstd'},{id:'alertrule'}]},
   ]},
  {id:'conc', color:0xd9a05f, pos:[16,0,-42], layerX:-37.5, layerZ:14, kind:'cross',
   l1:[
     {id:'threading', c:[{id:'mainthread'},{id:'workerpool'}]},
     {id:'syncprim',  c:[{id:'lockorder'},{id:'atomics'}]},
     {id:'asynctask', c:[{id:'cancel'},{id:'backpressure'}]},
   ]},
  {id:'fault', color:0xff795c, pos:[-76,0,-25], layerX:-12.5, layerZ:14, kind:'cross',
   l1:[
     {id:'errmodel', c:[{id:'errclass'},{id:'partialfail'}]},
     {id:'retry',    c:[{id:'idempotent'},{id:'backoff'}]},
     {id:'degrade',  c:[{id:'circuit'},{id:'fallback'}]},
   ]},
  // —— 承诺三棵：兼容 / 安全 / 隐私 ——
  {id:'compat', color:0x6f6fe8, pos:[-56,0,-52], layerX:12.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'apicontract', c:[{id:'semver'},{id:'depwindow'}]},
     {id:'dataevo',     c:[{id:'schemamig'},{id:'dualread'}]},
     {id:'protocol',    c:[{id:'verneg'},{id:'capdetect'}]},
   ]},
  {id:'sec', color:0x54a8d9, pos:[76,0,-25], layerX:37.5, layerZ:14, kind:'cross',
   l1:[
     {id:'inputline',  c:[{id:'validate'},{id:'parsefuzz'}]},
     {id:'secretmgmt', c:[{id:'keymgmt'},{id:'signing'}]},
     {id:'supply',     c:[{id:'depaudit'},{id:'sandboxpol'}]},
   ]},
  {id:'priv', color:0xdcc98a, pos:[-20,0,-68], layerX:87.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'pii',       c:[{id:'piitag'},{id:'minimize'}]},
     {id:'datalife',  c:[{id:'retention'},{id:'forget'}]},
     {id:'residency', c:[{id:'region'},{id:'xborder'}]},
   ]},
  // —— 产品与商业四棵：i18n / 协同 / 计费 / 多租户 ——
  {id:'i18n', color:0xd97bff, pos:[75,0,7], layerX:-87.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'textsys',   c:[{id:'icu'},{id:'glossary'}]},
     {id:'layoutfit', c:[{id:'rtl'},{id:'textexpand'}]},
     {id:'a11y',      c:[{id:'aria'},{id:'keynav'}]},
   ]},
  {id:'collab', color:0x9fdf5f, pos:[-75,0,7], layerX:-62.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'syncengine', c:[{id:'crdt'},{id:'oplog'}]},
     {id:'presence',   c:[{id:'cursors'},{id:'awareness'}]},
     {id:'conflict',   c:[{id:'merge'},{id:'offline'}]},
   ]},
  {id:'bill', color:0xb0e04d, pos:[20,0,-68], layerX:62.5, layerZ:-14, kind:'cross',
   l1:[
     {id:'entitle', c:[{id:'plans'},{id:'entitlecheck'}]},
     {id:'quota',   c:[{id:'ratelimit'},{id:'quotacount'}]},
     {id:'meter',   c:[{id:'usagemeter'},{id:'billevent'}]},
   ]},
  {id:'tenant', color:0x9a5fd0, pos:[56,0,-52], layerX:87.5, layerZ:14, kind:'cross',
   l1:[
     {id:'isolation', c:[{id:'dataisol'},{id:'noisy'}]},
     {id:'tcfg',      c:[{id:'percfg'},{id:'tenantflag'}]},
     {id:'sharding',  c:[{id:'shardkey'},{id:'rebalance'}]},
   ]},
];

/* 文案水合:树级文案(name/short/constraint/tradeoff/rootName)与节点名 n 来自当前语言包。
   缺任何一条即启动报错并指名道姓——与节点 gid 校验同一哲学。 */
for (const t of TREE_DEFS) {
  Object.assign(t, req(L.trees, t.id, 'trees'));
  (function walk(list) {
    for (const n of list) {
      n.n = req(L.nodes, `${t.id}.${n.id}`, 'nodes');
      if (n.c && n.c.length) walk(n.c);
    }
  })(t.l1);
}
