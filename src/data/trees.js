// 树定义(纯数据):两棵业务树 + 十四棵横切树。
// 以 Blender / VS Code 这类复杂交互工具为原型,业务树更深、更茂密。
// 字段:id 树 id(节点 gid 前缀)、pos 森林站位、layerX/layerZ「分层」策略下的排布、
//       kind 体型(biz|cross)、constraint 视角、tradeoff 代价、l1 一级子树(递归 {id,n,c})。
// 新增一棵树:在此追加定义即可,场景与 UI 自动生长;若参与交织/引力/幽灵根/树之树,
// 再到同目录相应数据文件里登记(节点 gid = 树id.节点id,启动时会校验存在性)。

export const TREE_DEFS = [
  {id:'edit', name:'编辑核心树（业务）', short:'编辑核心', color:0xd9e650, pos:[-15,0,9], layerX:-62.5, layerZ:14, kind:'biz',
   constraint:'视角：数据模型与一致性', tradeoff:'域复杂度：Blender 的场景图/依赖图，VS Code 的文本模型——消不掉，也不该消', rootName:'编辑核心 SSOT',
   l1:[
     {id:'docmodel', n:'场景 / 文档模型', c:[
       {id:'scenegraph', n:'节点与层级', c:[
         {id:'instancing', n:'实例与引用', c:[{id:'linkdup',n:'链接复制'},{id:'overridelib',n:'引用覆盖'}]},
         {id:'xform', n:'父子变换', c:[{id:'xformcache',n:'世界矩阵缓存'}]},
         {id:'collections', n:'集合与分组'},
       ]},
       {id:'depsgraph', n:'依赖图', c:[
         {id:'increval', n:'增量求值', c:[{id:'dirtyprop',n:'脏标记传播'},{id:'evalsched',n:'并行求值调度'}]},
         {id:'cycles', n:'环检测'},
       ]},
       {id:'datablock', n:'数据块与 ID', c:[
         {id:'uniquename', n:'唯一命名'},
         {id:'refcount', n:'引用计数与孤儿'},
       ]},
     ]},
     {id:'selection', n:'选择系统', c:[
       {id:'selset', n:'选择集', c:[
         {id:'multisel', n:'多对象选择'},
         {id:'modes', n:'模式切换'},
         {id:'active', n:'活动项与焦点'},
       ]},
       {id:'softsel', n:'软选择', c:[{id:'falloff',n:'权重衰减'}]},
     ]},
     {id:'history', n:'历史与持久化', c:[
       {id:'undo', n:'Undo / Redo 栈', c:[
         {id:'snapshot', n:'快照与差量', c:[{id:'snapgran',n:'快照粒度'}]},
         {id:'coalesce', n:'合并策略'},
       ]},
       {id:'fileio', n:'文件格式', c:[
         {id:'fwdcompat', n:'向前兼容'},
         {id:'migrate', n:'版本迁移'},
       ]},
       {id:'autosave', n:'自动保存', c:[{id:'crashrec',n:'崩溃恢复'}]},
     ]},
     {id:'ops', n:'编辑操作', c:[
       {id:'cmdops', n:'命令化操作', c:[
         {id:'replay', n:'参数化重放', c:[{id:'ctxresolve',n:'上下文重解析'}]},
         {id:'macro', n:'宏录制'},
       ]},
       {id:'modstack', n:'修改器栈', c:[
         {id:'nondestruct', n:'非破坏编辑'},
         {id:'stackorder', n:'栈求值顺序', c:[{id:'stackcache',n:'中间结果缓存'}]},
       ]},
       {id:'transform', n:'变换操作', c:[
         {id:'numeric', n:'数值精确输入'},
         {id:'propedit', n:'比例衰减编辑'},
       ]},
     ]},
     {id:'driversys', n:'约束与驱动', c:[
       {id:'drivers', n:'驱动器', c:[
         {id:'exprdrv', n:'表达式求值'},
         {id:'drvtarget', n:'目标重绑定'},
       ]},
       {id:'constraints', n:'约束求解', c:[{id:'solveorder',n:'求解顺序'}]},
     ]},
   ]},
  {id:'ui', name:'交互界面树（业务）', short:'交互界面', color:0xff7fb2, pos:[15,0,9], layerX:-87.5, layerZ:14, kind:'biz',
   constraint:'视角：交互范式与状态', tradeoff:'域复杂度：视口 / Gizmo / 命令面板 / 扩展宿主——工具的「手感」全在这里', rootName:'交互 SSOT',
   l1:[
     {id:'feedback', n:'反馈与通知', c:[
       {id:'statusbar', n:'状态栏', c:[{id:'progress',n:'长任务进度'}]},
       {id:'toast', n:'通知与确认', c:[{id:'undotoast',n:'可撤销提示'}]},
     ]},
     {id:'panels', n:'面板与布局', c:[
       {id:'docking', n:'可停靠布局', c:[
         {id:'layoutpersist', n:'布局持久化'},
         {id:'workspaces', n:'工作区预设'},
       ]},
       {id:'props', n:'属性面板', c:[
         {id:'twoway', n:'双向绑定', c:[{id:'multiedit',n:'多选批量编辑'}]},
         {id:'proppath', n:'属性路径寻址'},
       ]},
       {id:'outliner', n:'大纲视图', c:[
         {id:'treesync', n:'与场景同步'},
         {id:'dragdrop', n:'拖放重排'},
       ]},
     ]},
     {id:'exthost', n:'扩展宿主', c:[
       {id:'pluginapi', n:'插件 API', c:[
         {id:'sandbox', n:'沙箱隔离', c:[{id:'capgrant',n:'能力授权清单'}]},
         {id:'apicompat', n:'版本兼容', c:[{id:'deprecate',n:'弃用周期'}]},
       ]},
       {id:'uicontrib', n:'UI 注入点', c:[
         {id:'custompanel', n:'自定义面板'},
         {id:'theming', n:'主题与样式'},
       ]},
     ]},
     {id:'viewport', n:'视口', c:[
       {id:'realtime', n:'实时渲染', c:[
         {id:'dirtyrect', n:'脏区重绘', c:[{id:'overlaycomp',n:'覆盖层合成'}]},
         {id:'lod', n:'LOD / 降级', c:[{id:'proxydisp',n:'交互中代理显示'}]},
       ]},
       {id:'gizmo', n:'Gizmo 操纵器', c:[
         {id:'dragconstraint', n:'拖拽约束'},
         {id:'snap', n:'捕捉吸附', c:[{id:'snapprio',n:'吸附目标优先级'}]},
       ]},
       {id:'nav3d', n:'视图导航', c:[
         {id:'camctl', n:'轨道 / 漫游'},
         {id:'multiview', n:'多视图联动'},
       ]},
     ]},
     {id:'command', n:'命令系统', c:[
       {id:'palette', n:'命令面板', c:[
         {id:'fuzzy', n:'模糊搜索'},
         {id:'recent', n:'最近与推荐'},
       ]},
       {id:'keymap', n:'快捷键', c:[
         {id:'keyconflict', n:'冲突解决', c:[{id:'ctxscope',n:'按上下文分域'}]},
         {id:'chords', n:'组合键序列'},
       ]},
       {id:'menus', n:'菜单与工具条', c:[{id:'ctxmenu',n:'上下文菜单'}]},
     ]},
   ]},
  // —— 经典四棵（内环）——
  {id:'arch', name:'架构树', short:'架构', color:0x5b8cff, pos:[48,0,-2], layerX:12.5, layerZ:14, kind:'cross',
   constraint:'约束：可扩展性', tradeoff:'代价：抽象加层 → 短期性能受损', rootName:'架构 SSOT',
   l1:[
     {id:'layers', n:'领域分层', c:[{id:'di',n:'依赖注入'},{id:'bus',n:'事件总线'}]},
     {id:'split',  n:'服务拆分', c:[{id:'gw',n:'API 网关'},{id:'cfg',n:'配置中心'}]},
     {id:'plugin', n:'插件机制', c:[{id:'ext',n:'扩展点注册'},{id:'lc',n:'生命周期'}]},
   ]},
  {id:'perf', name:'性能树', short:'性能', color:0xff9e4d, pos:[-48,0,-2], layerX:-37.5, layerZ:-14, kind:'cross',
   constraint:'约束：吞吐与延迟', tradeoff:'代价：特化 / 扁平 / 缓存耦合 → 可扩展性受损', rootName:'性能 SSOT',
   l1:[
     {id:'cachesys', n:'缓存体系', c:[{id:'cache',n:'缓存策略'},{id:'invalidate',n:'失效联动'}]},
     {id:'datapath', n:'数据通路', c:[{id:'batch',n:'批量写入'},{id:'pool',n:'连接池'}]},
     {id:'compute',  n:'计算策略', c:[{id:'precompute',n:'预计算'},{id:'lazy',n:'懒加载'}]},
   ]},
  {id:'authz', name:'权限树', short:'权限', color:0xb28dff, pos:[42,0,-29], layerX:37.5, layerZ:-14, kind:'cross',
   constraint:'约束：安全与合规', tradeoff:'风险：不建通用模型 → ad-hoc 补丁堆积，复杂度无法消解', rootName:'权限 SSOT',
   l1:[
     {id:'rbac',  n:'RBAC 模型', c:[{id:'roleinherit',n:'角色继承'},{id:'apiauth',n:'API 鉴权'}]},
     {id:'acl',   n:'资源 ACL', c:[{id:'rowacl',n:'行级权限'},{id:'mask',n:'字段脱敏'}]},
     {id:'audit', n:'审计',     c:[{id:'auditlog',n:'审计日志'},{id:'replay2',n:'操作回放'}]},
   ]},
  {id:'gate', name:'门控树', short:'门控', color:0x3ad6c5, pos:[-42,0,-29], layerX:62.5, layerZ:14, kind:'cross',
   constraint:'约束：发布安全与实验', tradeoff:'代价：每个 Flag 都是一个分叉宇宙', rootName:'门控 SSOT',
   l1:[
     {id:'flag',    n:'Feature Flag', c:[{id:'flagcfg',n:'开关配置'},{id:'vergate',n:'版本门槛'}]},
     {id:'release', n:'发布策略',     c:[{id:'canary',n:'灰度发布'},{id:'envisol',n:'环境隔离'}]},
     {id:'exp',     n:'实验',         c:[{id:'abtest',n:'A/B 实验'},{id:'metrics',n:'指标埋点'}]},
   ]},
  // —— 运行时三棵：可观测 / 并发 / 容错 ——
  {id:'obs', name:'可观测树', short:'可观测', color:0x7ee08a, pos:[-16,0,-42], layerX:-12.5, layerZ:-14, kind:'cross',
   constraint:'约束：可诊断性', tradeoff:'代价：埋点与追踪自己就吃性能；日志越全，隐私越险', rootName:'可观测 SSOT',
   l1:[
     {id:'logs',  n:'日志体系',  c:[{id:'structlog',n:'结构化日志'},{id:'logsample',n:'日志采样'}]},
     {id:'trace', n:'链路追踪',  c:[{id:'traceprop',n:'上下文透传'},{id:'spanmap',n:'调用图还原'}]},
     {id:'slo',   n:'指标与告警', c:[{id:'metricstd',n:'指标口径'},{id:'alertrule',n:'告警规则'}]},
   ]},
  {id:'conc', name:'并发树', short:'并发', color:0xd9a05f, pos:[16,0,-42], layerX:-37.5, layerZ:14, kind:'cross',
   constraint:'约束：时序与一致性', tradeoff:'代价：并行要快、一致要慢——每个功能都要回答「哪段跑在哪个线程」', rootName:'并发 SSOT',
   l1:[
     {id:'threading', n:'线程模型', c:[{id:'mainthread',n:'主线程契约'},{id:'workerpool',n:'工作线程池'}]},
     {id:'syncprim',  n:'同步原语', c:[{id:'lockorder',n:'锁序约定'},{id:'atomics',n:'无锁结构'}]},
     {id:'asynctask', n:'异步任务', c:[{id:'cancel',n:'取消传播'},{id:'backpressure',n:'背压控制'}]},
   ]},
  {id:'fault', name:'容错树', short:'容错', color:0xff795c, pos:[-76,0,-25], layerX:-12.5, layerZ:14, kind:'cross',
   constraint:'约束：失败语义', tradeoff:'代价：每条路径都要回答「失败了怎么办」——重试与幂等互相绑架', rootName:'容错 SSOT',
   l1:[
     {id:'errmodel', n:'错误语义',   c:[{id:'errclass',n:'可恢复性分类'},{id:'partialfail',n:'部分失败'}]},
     {id:'retry',    n:'重试与退避', c:[{id:'idempotent',n:'幂等键'},{id:'backoff',n:'退避预算'}]},
     {id:'degrade',  n:'降级与熔断', c:[{id:'circuit',n:'断路器'},{id:'fallback',n:'兜底路径'}]},
   ]},
  // —— 承诺三棵：兼容 / 安全 / 隐私 ——
  {id:'compat', name:'兼容树', short:'兼容', color:0x6f6fe8, pos:[-56,0,-52], layerX:12.5, layerZ:-14, kind:'cross',
   constraint:'约束：不许破坏承诺', tradeoff:'代价：任何数据与 API 的改动都要过它——否决权比性能树还大', rootName:'兼容 SSOT',
   l1:[
     {id:'apicontract', n:'API 契约', c:[{id:'semver',n:'语义化版本'},{id:'depwindow',n:'弃用窗口'}]},
     {id:'dataevo',     n:'数据演进', c:[{id:'schemamig',n:'Schema 迁移'},{id:'dualread',n:'双读双写'}]},
     {id:'protocol',    n:'协议协商', c:[{id:'verneg',n:'版本协商'},{id:'capdetect',n:'能力探测'}]},
   ]},
  {id:'sec', name:'安全树', short:'安全', color:0x54a8d9, pos:[76,0,-25], layerX:37.5, layerZ:14, kind:'cross',
   constraint:'约束：攻击面最小化', tradeoff:'代价：权限管「谁能做什么」，安全管「所有人都不许的事」——每层校验都是新摩擦', rootName:'安全 SSOT',
   l1:[
     {id:'inputline',  n:'输入防线',   c:[{id:'validate',n:'校验与净化'},{id:'parsefuzz',n:'解析器加固'}]},
     {id:'secretmgmt', n:'密钥与信任', c:[{id:'keymgmt',n:'密钥轮换'},{id:'signing',n:'签名校验'}]},
     {id:'supply',     n:'供应链',     c:[{id:'depaudit',n:'依赖审计'},{id:'sandboxpol',n:'沙箱策略'}]},
   ]},
  {id:'priv', name:'隐私树', short:'隐私', color:0xdcc98a, pos:[-20,0,-68], layerX:87.5, layerZ:-14, kind:'cross',
   constraint:'约束：数据的存在本身要合规', tradeoff:'代价：权限管「谁能看」，隐私管「能不能存、存多久」——删除要追进每层缓存与备份', rootName:'隐私 SSOT',
   l1:[
     {id:'pii',       n:'PII 治理',     c:[{id:'piitag',n:'字段级标注'},{id:'minimize',n:'最小化采集'}]},
     {id:'datalife',  n:'数据生命周期', c:[{id:'retention',n:'保留期策略'},{id:'forget',n:'被遗忘权'}]},
     {id:'residency', n:'数据主权',     c:[{id:'region',n:'地域驻留'},{id:'xborder',n:'跨境传输'}]},
   ]},
  // —— 产品与商业四棵：i18n / 协同 / 计费 / 多租户 ——
  {id:'i18n', name:'i18n / 无障碍树', short:'i18n·a11y', color:0xd97bff, pos:[75,0,7], layerX:-87.5, layerZ:-14, kind:'cross',
   constraint:'约束：每个人都能用', tradeoff:'代价：每个字符串、每个控件、每条键位都被横穿——最浅、也最宽的一棵', rootName:'i18n SSOT',
   l1:[
     {id:'textsys',   n:'文案体系', c:[{id:'icu',n:'复数与语序'},{id:'glossary',n:'术语表'}]},
     {id:'layoutfit', n:'布局适配', c:[{id:'rtl',n:'RTL 镜像'},{id:'textexpand',n:'文本膨胀'}]},
     {id:'a11y',      n:'无障碍',   c:[{id:'aria',n:'语义标注'},{id:'keynav',n:'键盘可达'}]},
   ]},
  {id:'collab', name:'协同树', short:'协同', color:0x9fdf5f, pos:[-75,0,7], layerX:-62.5, layerZ:-14, kind:'cross',
   constraint:'约束：一切可合并', tradeoff:'代价：数据模型、Undo、权限全部被改写语义——最贵的一棵树', rootName:'协同 SSOT',
   l1:[
     {id:'syncengine', n:'同步引擎', c:[{id:'crdt',n:'CRDT 合并'},{id:'oplog',n:'操作日志'}]},
     {id:'presence',   n:'在场系统', c:[{id:'cursors',n:'多人光标'},{id:'awareness',n:'状态广播'}]},
     {id:'conflict',   n:'冲突治理', c:[{id:'merge',n:'语义合并'},{id:'offline',n:'离线重放'}]},
   ]},
  {id:'bill', name:'计费树', short:'计费', color:0xb0e04d, pos:[20,0,-68], layerX:62.5, layerZ:-14, kind:'cross',
   constraint:'约束：用量即收入', tradeoff:'代价：权益与 Flag 形影不离、配额反定 API 形状——监控可采样，计费一条不能丢', rootName:'计费 SSOT',
   l1:[
     {id:'entitle', n:'权益体系',   c:[{id:'plans',n:'套餐矩阵'},{id:'entitlecheck',n:'权益检查'}]},
     {id:'quota',   n:'配额与限流', c:[{id:'ratelimit',n:'速率限制'},{id:'quotacount',n:'用量计数'}]},
     {id:'meter',   n:'计量计费',   c:[{id:'usagemeter',n:'用量上报'},{id:'billevent',n:'计费事件'}]},
   ]},
  {id:'tenant', name:'多租户树', short:'多租户', color:0x9a5fd0, pos:[56,0,-52], layerX:87.5, layerZ:14, kind:'cross',
   constraint:'约束：租户互不可见', tradeoff:'代价：每个缓存键、每张表、每个队列都要多背一个租户维度', rootName:'多租户 SSOT',
   l1:[
     {id:'isolation', n:'隔离模型', c:[{id:'dataisol',n:'数据隔离'},{id:'noisy',n:'邻居噪音'}]},
     {id:'tcfg',      n:'租户配置', c:[{id:'percfg',n:'每租户覆盖'},{id:'tenantflag',n:'租户级开关'}]},
     {id:'sharding',  n:'分片路由', c:[{id:'shardkey',n:'分片键'},{id:'rebalance',n:'再平衡'}]},
   ]},
];
