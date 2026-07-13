// 树与节点文案(zh):trees 树级文案(键 = 树 id),nodes 节点名(键 = gid = 树id.节点id)。
// 结构(站位/颜色/层级)在 src/data/trees.js;两边键集合由 check-narrative 门禁对齐。

export const trees = {
  edit:   { name:'编辑核心树（业务）', short:'编辑核心', constraint:'视角：数据模型与一致性', tradeoff:'域复杂度：Blender 的场景图/依赖图，VS Code 的文本模型——消不掉，也不该消', rootName:'编辑核心 SSOT' },
  ui:     { name:'交互界面树（业务）', short:'交互界面', constraint:'视角：交互范式与状态', tradeoff:'域复杂度：视口 / Gizmo / 命令面板 / 扩展宿主——工具的「手感」全在这里', rootName:'交互 SSOT' },
  arch:   { name:'架构树', short:'架构', constraint:'约束：可扩展性', tradeoff:'代价：抽象加层 → 短期性能受损', rootName:'架构 SSOT' },
  perf:   { name:'性能树', short:'性能', constraint:'约束：吞吐与延迟', tradeoff:'代价：特化 / 扁平 / 缓存耦合 → 可扩展性受损', rootName:'性能 SSOT' },
  authz:  { name:'权限树', short:'权限', constraint:'约束：安全与合规', tradeoff:'风险：不建通用模型 → ad-hoc 补丁堆积，复杂度无法消解', rootName:'权限 SSOT' },
  gate:   { name:'门控树', short:'门控', constraint:'约束：发布安全与实验', tradeoff:'代价：每个 Flag 都是一个分叉宇宙', rootName:'门控 SSOT' },
  obs:    { name:'可观测树', short:'可观测', constraint:'约束：可诊断性', tradeoff:'代价：埋点与追踪自己就吃性能；日志越全，隐私越险', rootName:'可观测 SSOT' },
  conc:   { name:'并发树', short:'并发', constraint:'约束：时序与一致性', tradeoff:'代价：并行要快、一致要慢——每个功能都要回答「哪段跑在哪个线程」', rootName:'并发 SSOT' },
  fault:  { name:'容错树', short:'容错', constraint:'约束：失败语义', tradeoff:'代价：每条路径都要回答「失败了怎么办」——重试与幂等互相绑架', rootName:'容错 SSOT' },
  compat: { name:'兼容树', short:'兼容', constraint:'约束：不许破坏承诺', tradeoff:'代价：任何数据与 API 的改动都要过它——否决权比性能树还大', rootName:'兼容 SSOT' },
  sec:    { name:'安全树', short:'安全', constraint:'约束：攻击面最小化', tradeoff:'代价：权限管「谁能做什么」，安全管「所有人都不许的事」——每层校验都是新摩擦', rootName:'安全 SSOT' },
  priv:   { name:'隐私树', short:'隐私', constraint:'约束：数据的存在本身要合规', tradeoff:'代价：权限管「谁能看」，隐私管「能不能存、存多久」——删除要追进每层缓存与备份', rootName:'隐私 SSOT' },
  i18n:   { name:'i18n / 无障碍树', short:'i18n·a11y', constraint:'约束：每个人都能用', tradeoff:'代价：每个字符串、每个控件、每条键位都被横穿——最浅、也最宽的一棵', rootName:'i18n SSOT' },
  collab: { name:'协同树', short:'协同', constraint:'约束：一切可合并', tradeoff:'代价：数据模型、Undo、权限全部被改写语义——最贵的一棵树', rootName:'协同 SSOT' },
  bill:   { name:'计费树', short:'计费', constraint:'约束：用量即收入', tradeoff:'代价：权益与 Flag 形影不离、配额反定 API 形状——监控可采样，计费一条不能丢', rootName:'计费 SSOT' },
  tenant: { name:'多租户树', short:'多租户', constraint:'约束：租户互不可见', tradeoff:'代价：每个缓存键、每张表、每个队列都要多背一个租户维度', rootName:'多租户 SSOT' },
};

export const nodes = {
  // —— 编辑核心树 ——
  'edit.docmodel':'场景 / 文档模型', 'edit.scenegraph':'节点与层级', 'edit.instancing':'实例与引用',
  'edit.linkdup':'链接复制', 'edit.overridelib':'引用覆盖', 'edit.xform':'父子变换', 'edit.xformcache':'世界矩阵缓存',
  'edit.collections':'集合与分组', 'edit.depsgraph':'依赖图', 'edit.increval':'增量求值',
  'edit.dirtyprop':'脏标记传播', 'edit.evalsched':'并行求值调度', 'edit.cycles':'环检测',
  'edit.datablock':'数据块与 ID', 'edit.uniquename':'唯一命名', 'edit.refcount':'引用计数与孤儿',
  'edit.selection':'选择系统', 'edit.selset':'选择集', 'edit.multisel':'多对象选择', 'edit.modes':'模式切换',
  'edit.active':'活动项与焦点', 'edit.softsel':'软选择', 'edit.falloff':'权重衰减',
  'edit.history':'历史与持久化', 'edit.undo':'Undo / Redo 栈', 'edit.snapshot':'快照与差量',
  'edit.snapgran':'快照粒度', 'edit.coalesce':'合并策略', 'edit.fileio':'文件格式',
  'edit.fwdcompat':'向前兼容', 'edit.migrate':'版本迁移', 'edit.autosave':'自动保存', 'edit.crashrec':'崩溃恢复',
  'edit.ops':'编辑操作', 'edit.cmdops':'命令化操作', 'edit.replay':'参数化重放', 'edit.ctxresolve':'上下文重解析',
  'edit.macro':'宏录制', 'edit.modstack':'修改器栈', 'edit.nondestruct':'非破坏编辑',
  'edit.stackorder':'栈求值顺序', 'edit.stackcache':'中间结果缓存', 'edit.transform':'变换操作',
  'edit.numeric':'数值精确输入', 'edit.propedit':'比例衰减编辑',
  'edit.driversys':'约束与驱动', 'edit.drivers':'驱动器', 'edit.exprdrv':'表达式求值',
  'edit.drvtarget':'目标重绑定', 'edit.constraints':'约束求解', 'edit.solveorder':'求解顺序',
  // —— 交互界面树 ——
  'ui.feedback':'反馈与通知', 'ui.statusbar':'状态栏', 'ui.progress':'长任务进度',
  'ui.toast':'通知与确认', 'ui.undotoast':'可撤销提示',
  'ui.panels':'面板与布局', 'ui.docking':'可停靠布局', 'ui.layoutpersist':'布局持久化', 'ui.workspaces':'工作区预设',
  'ui.props':'属性面板', 'ui.twoway':'双向绑定', 'ui.multiedit':'多选批量编辑', 'ui.proppath':'属性路径寻址',
  'ui.outliner':'大纲视图', 'ui.treesync':'与场景同步', 'ui.dragdrop':'拖放重排',
  'ui.exthost':'扩展宿主', 'ui.pluginapi':'插件 API', 'ui.sandbox':'沙箱隔离', 'ui.capgrant':'能力授权清单',
  'ui.apicompat':'版本兼容', 'ui.deprecate':'弃用周期', 'ui.uicontrib':'UI 注入点',
  'ui.custompanel':'自定义面板', 'ui.theming':'主题与样式',
  'ui.viewport':'视口', 'ui.realtime':'实时渲染', 'ui.dirtyrect':'脏区重绘', 'ui.overlaycomp':'覆盖层合成',
  'ui.lod':'LOD / 降级', 'ui.proxydisp':'交互中代理显示', 'ui.gizmo':'Gizmo 操纵器',
  'ui.dragconstraint':'拖拽约束', 'ui.snap':'捕捉吸附', 'ui.snapprio':'吸附目标优先级',
  'ui.nav3d':'视图导航', 'ui.camctl':'轨道 / 漫游', 'ui.multiview':'多视图联动',
  'ui.command':'命令系统', 'ui.palette':'命令面板', 'ui.fuzzy':'模糊搜索', 'ui.recent':'最近与推荐',
  'ui.keymap':'快捷键', 'ui.keyconflict':'冲突解决', 'ui.ctxscope':'按上下文分域', 'ui.chords':'组合键序列',
  'ui.menus':'菜单与工具条', 'ui.ctxmenu':'上下文菜单',
  // —— 架构树 ——
  'arch.layers':'领域分层', 'arch.di':'依赖注入', 'arch.bus':'事件总线',
  'arch.split':'服务拆分', 'arch.gw':'API 网关', 'arch.cfg':'配置中心',
  'arch.plugin':'插件机制', 'arch.ext':'扩展点注册', 'arch.lc':'生命周期',
  // —— 性能树 ——
  'perf.cachesys':'缓存体系', 'perf.cache':'缓存策略', 'perf.invalidate':'失效联动',
  'perf.datapath':'数据通路', 'perf.batch':'批量写入', 'perf.pool':'连接池',
  'perf.compute':'计算策略', 'perf.precompute':'预计算', 'perf.lazy':'懒加载',
  // —— 权限树 ——
  'authz.rbac':'RBAC 模型', 'authz.roleinherit':'角色继承', 'authz.apiauth':'API 鉴权',
  'authz.acl':'资源 ACL', 'authz.rowacl':'行级权限', 'authz.mask':'字段脱敏',
  'authz.audit':'审计', 'authz.auditlog':'审计日志', 'authz.replay2':'操作回放',
  // —— 门控树 ——
  'gate.flag':'Feature Flag', 'gate.flagcfg':'开关配置', 'gate.vergate':'版本门槛',
  'gate.release':'发布策略', 'gate.canary':'灰度发布', 'gate.envisol':'环境隔离',
  'gate.exp':'实验', 'gate.abtest':'A/B 实验', 'gate.metrics':'指标埋点',
  // —— 可观测树 ——
  'obs.logs':'日志体系', 'obs.structlog':'结构化日志', 'obs.logsample':'日志采样',
  'obs.trace':'链路追踪', 'obs.traceprop':'上下文透传', 'obs.spanmap':'调用图还原',
  'obs.slo':'指标与告警', 'obs.metricstd':'指标口径', 'obs.alertrule':'告警规则',
  // —— 并发树 ——
  'conc.threading':'线程模型', 'conc.mainthread':'主线程契约', 'conc.workerpool':'工作线程池',
  'conc.syncprim':'同步原语', 'conc.lockorder':'锁序约定', 'conc.atomics':'无锁结构',
  'conc.asynctask':'异步任务', 'conc.cancel':'取消传播', 'conc.backpressure':'背压控制',
  // —— 容错树 ——
  'fault.errmodel':'错误语义', 'fault.errclass':'可恢复性分类', 'fault.partialfail':'部分失败',
  'fault.retry':'重试与退避', 'fault.idempotent':'幂等键', 'fault.backoff':'退避预算',
  'fault.degrade':'降级与熔断', 'fault.circuit':'断路器', 'fault.fallback':'兜底路径',
  // —— 兼容树 ——
  'compat.apicontract':'API 契约', 'compat.semver':'语义化版本', 'compat.depwindow':'弃用窗口',
  'compat.dataevo':'数据演进', 'compat.schemamig':'Schema 迁移', 'compat.dualread':'双读双写',
  'compat.protocol':'协议协商', 'compat.verneg':'版本协商', 'compat.capdetect':'能力探测',
  // —— 安全树 ——
  'sec.inputline':'输入防线', 'sec.validate':'校验与净化', 'sec.parsefuzz':'解析器加固',
  'sec.secretmgmt':'密钥与信任', 'sec.keymgmt':'密钥轮换', 'sec.signing':'签名校验',
  'sec.supply':'供应链', 'sec.depaudit':'依赖审计', 'sec.sandboxpol':'沙箱策略',
  // —— 隐私树 ——
  'priv.pii':'PII 治理', 'priv.piitag':'字段级标注', 'priv.minimize':'最小化采集',
  'priv.datalife':'数据生命周期', 'priv.retention':'保留期策略', 'priv.forget':'被遗忘权',
  'priv.residency':'数据主权', 'priv.region':'地域驻留', 'priv.xborder':'跨境传输',
  // —— i18n / 无障碍树 ——
  'i18n.textsys':'文案体系', 'i18n.icu':'复数与语序', 'i18n.glossary':'术语表',
  'i18n.layoutfit':'布局适配', 'i18n.rtl':'RTL 镜像', 'i18n.textexpand':'文本膨胀',
  'i18n.a11y':'无障碍', 'i18n.aria':'语义标注', 'i18n.keynav':'键盘可达',
  // —— 协同树 ——
  'collab.syncengine':'同步引擎', 'collab.crdt':'CRDT 合并', 'collab.oplog':'操作日志',
  'collab.presence':'在场系统', 'collab.cursors':'多人光标', 'collab.awareness':'状态广播',
  'collab.conflict':'冲突治理', 'collab.merge':'语义合并', 'collab.offline':'离线重放',
  // —— 计费树 ——
  'bill.entitle':'权益体系', 'bill.plans':'套餐矩阵', 'bill.entitlecheck':'权益检查',
  'bill.quota':'配额与限流', 'bill.ratelimit':'速率限制', 'bill.quotacount':'用量计数',
  'bill.meter':'计量计费', 'bill.usagemeter':'用量上报', 'bill.billevent':'计费事件',
  // —— 多租户树 ——
  'tenant.isolation':'隔离模型', 'tenant.dataisol':'数据隔离', 'tenant.noisy':'邻居噪音',
  'tenant.tcfg':'租户配置', 'tenant.percfg':'每租户覆盖', 'tenant.tenantflag':'租户级开关',
  'tenant.sharding':'分片路由', 'tenant.shardkey':'分片键', 'tenant.rebalance':'再平衡',
};
