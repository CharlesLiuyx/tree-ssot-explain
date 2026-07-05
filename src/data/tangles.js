// 偶然交织(纯数据):需求把不同树的节点焊在一起——可以被策略消解。
// 字段:a/b 两端节点 gid(树id.节点id)、platform 平台化后的归属服务(见 platform.js)、why 案例文案。
// 新增案例:追加一行即可;启动时会校验 a/b 节点存在。

export const TANGLES = [
  {a:'perf.cache', b:'authz.rowacl', platform:'authz', why:'缓存键里不带权限信息，会把数据错发给无权的人；带上，命中率又会暴跌——两棵树在同一个节点上互相改写语义'},
  {a:'perf.cache', b:'gate.canary', platform:'gate', why:'灰度期间新旧两版数据结构共存，同一个缓存键可能存着两种形状的值'},
  {a:'perf.cache', b:'arch.cfg', platform:'infra', why:'缓存 TTL 散落在配置中心里，改配置的人并不知道自己会击穿哪个缓存'},
  {a:'gate.flagcfg', b:'authz.apiauth', platform:'authz', why:'新功能开关必须叠加权限判断：if (flag && can(user))，两套条件从此形影不离'},
  {a:'gate.canary', b:'arch.bus', platform:'gate', why:'灰度用户的事件要同时路由到新旧两套消费者，事件总线被迫理解发布状态'},
  {a:'perf.precompute', b:'authz.roleinherit', platform:'authz', why:'角色一变，预计算结果全部失效——失效联动跨越两棵树'},
  {a:'arch.ext', b:'gate.abtest', platform:'gate', why:'实验参数要穿透插件边界注入，插件的隔离性被打洞'},
  {a:'perf.batch', b:'authz.auditlog', platform:'audit', why:'批量操作必须拆出逐条审计，批处理的性能优势被审计要求抵消'},
  {a:'arch.split', b:'perf.pool', platform:'infra', why:'服务越拆越多，每个服务各建连接池，数据库总连接数爆炸'},
  {a:'gate.envisol', b:'arch.cfg', platform:'infra', why:'环境配置与开关配置是两套事实源——SSOT 开始打架'},
  {a:'authz.mask', b:'perf.lazy', platform:'authz', why:'脱敏必须在序列化前完成，懒加载让「序列化前」变得不可预测'},
  {a:'gate.metrics', b:'perf.pool', platform:'infra', why:'埋点流量与业务共用一条数据通路，实验一开吞吐就抖动'},
  // 业务树被卷入的交织
  {a:'ui.lod', b:'perf.lazy', platform:'infra', why:'视口降级想「少算」，懒加载想「晚算」——两个偷懒策略互相踩踏，时序没有 SSOT'},
  {a:'edit.snapshot', b:'perf.batch', platform:'infra', why:'Undo 快照走批量写入通道，历史的时序被批处理重排'},
  {a:'ui.sandbox', b:'authz.apiauth', platform:'authz', why:'插件沙箱复用 API 鉴权的模型，但插件的「主体」不是用户——权限模型被迫长出第二套主语'},
  {a:'edit.macro', b:'gate.abtest', platform:'gate', why:'宏录制录到了实验分支的行为，回放时实验已下线——录制品带着门控的时间戳'},
  {a:'ui.keymap', b:'gate.flagcfg', platform:'gate', why:'快捷键绑定的命令在 Flag 关闭时不存在——键位表被迫感知开关状态'},
  {a:'edit.nondestruct', b:'authz.rowacl', platform:'authz', why:'非破坏编辑保留原数据引用：行级过滤后的对象，仍能顺着修改器栈摸回原始数据'},
  {a:'edit.migrate', b:'gate.flagcfg', platform:'gate', why:'新数据结构躲在 Feature Flag 后面，版本迁移器被迫先读开关再决定怎么迁——同一个文件在开关两侧迁出两种结果，回滚开关等于批量制造「来自未来」的文件'},
  {a:'ui.layoutpersist', b:'edit.fileio', platform:'infra', why:'布局持久化搭了工程文件的便车：UI 状态被写进文档格式（Blender 的 .blend 正是如此）——从此改一个面板字段都算改文件格式，两棵业务树在磁盘上焊死'},
  {a:'ui.progress', b:'perf.batch', platform:'infra', why:'批量写入为吞吐把任务合并，进度条却需要逐条粒度的完成事件——要么进度撒谎，要么拆批毁吞吐，一根进度条背后是两棵树的拉锯'},
  // —— 可观测树 ——
  {a:'obs.logsample', b:'fault.retry', platform:'infra', why:'重试风暴恰好发生在流量最凶的时刻，而采样器此刻丢日志最狠——最需要证据的时候，证据最少'},
  {a:'obs.traceprop', b:'arch.bus', platform:'infra', why:'追踪上下文要穿过事件总线的异步边界——总线被迫在每个事件里捎带 trace 头，「解耦」的总线耦合上了观测'},
  {a:'obs.structlog', b:'authz.mask', platform:'audit', why:'日志想看全，脱敏想遮住——同一行日志在两棵树里有两种合法形态，排障与合规各执一份真相'},
  {a:'obs.metricstd', b:'gate.abtest', platform:'audit', why:'实验指标与告警指标同一个埋点、两种口径——实验说涨了，告警说崩了，没人知道该信谁'},
  // —— 并发树 ——
  {a:'conc.cancel', b:'edit.cmdops', platform:'infra', why:'取消到一半的命令要不要进 Undo 栈？取消传播撞上命令化操作，「半个操作」在两棵树里都没有定义'},
  {a:'conc.lockorder', b:'perf.pool', platform:'infra', why:'连接池有自己的锁，业务有自己的锁——两套锁序约定在高峰期互相等待，死锁只在生产复现'},
  {a:'conc.workerpool', b:'edit.evalsched', platform:'infra', why:'依赖图的并行求值调度与全局线程池抢核——两棵树都以为自己独占 CPU，卡顿归谁没有答案'},
  // —— 容错树 ——
  {a:'fault.idempotent', b:'perf.batch', platform:'infra', why:'批里一条失败：整批重试要求幂等，拆开重试毁掉吞吐——批的边界与幂等键互相绑架'},
  {a:'fault.circuit', b:'gate.flagcfg', platform:'gate', why:'熔断是开关、灰度也是开关——「功能为什么关了」从此有两个互不知情的事实源'},
  {a:'fault.errclass', b:'edit.crashrec', platform:'infra', why:'崩溃恢复必须知道哪些错误可恢复——而错误语义的分类表长在另一棵树上，恢复逻辑隔树读表'},
  {a:'fault.fallback', b:'authz.apiauth', platform:'authz', why:'兜底路径往往是老代码——老代码没接新的鉴权模型，降级的瞬间权限被静默绕过'},
  // —— 兼容树 ——
  {a:'compat.dualread', b:'perf.cache', platform:'infra', why:'双读双写期间同一个键存着两种形状的值——缓存必须理解 schema 版本，否则读出「来自过去」的数据'},
  {a:'compat.semver', b:'ui.apicompat', platform:'infra', why:'插件市场的兼容承诺有两个口径：业务树的弃用周期与兼容树的语义化版本——谁说了算，没有 SSOT'},
  {a:'compat.schemamig', b:'edit.migrate', platform:'infra', why:'文件版本迁移与 Schema 迁移是两套机制迁同一份数据——执行顺序错一步，迁出损坏文件'},
  {a:'compat.verneg', b:'collab.syncengine', platform:'infra', why:'协同房间里新旧客户端并存，协议要实时向下协商——兼容从「发布期问题」变成「每一秒的问题」'},
  // —— i18n / 无障碍树 ——
  {a:'i18n.textexpand', b:'ui.docking', platform:'infra', why:'德语文案平均比英语长三成——可停靠面板的最小宽度全部重算，每种语言里布局是另一个布局'},
  {a:'i18n.keynav', b:'ui.keymap', platform:'infra', why:'无障碍要求一切功能键盘可达——快捷键冲突解决从此多背一套「不可占用」清单'},
  {a:'i18n.icu', b:'gate.abtest', platform:'gate', why:'实验组改了文案，翻译流水线没跟上——灰度用户看到的是回退的源语言，实验数据被语言污染'},
  {a:'i18n.aria', b:'ui.custompanel', platform:'infra', why:'插件的自定义面板不带语义标注——产品整体的无障碍达标，被第三方生态拉爆'},
  // —— 安全树 ——
  {a:'sec.sandboxpol', b:'ui.sandbox', platform:'authz', why:'安全策略与沙箱实现分居两棵树——策略收紧了，实现没跟上，中间的空窗期就是漏洞'},
  {a:'sec.parsefuzz', b:'edit.fileio', platform:'infra', why:'打开一个文件就是暴露一次解析攻击面——格式兼容越宽容，解析器越难加固'},
  {a:'sec.keymgmt', b:'arch.cfg', platform:'infra', why:'密钥住在配置中心还是密钥服务？两个 SSOT 抢同一个秘密，轮换时总有一边在用旧钥匙'},
  {a:'sec.depaudit', b:'compat.semver', platform:'infra', why:'供应链要你为 CVE 升级依赖，兼容承诺不许 break——两棵树在同一次升级上向相反方向拔河'},
  // —— 协同树 ——
  {a:'collab.offline', b:'edit.autosave', platform:'infra', why:'离线重放与自动保存都想恢复现场——两套恢复点互相覆盖，「最新状态」有两个答案'},
  {a:'collab.awareness', b:'perf.pool', platform:'infra', why:'万人房间的在场广播把连接打满——存在感是流量放大器，协同一热闹，性能就跪'},
  {a:'collab.merge', b:'authz.rowacl', platform:'authz', why:'离线用户合并回来时，他无权看的行也参与了冲突解决——权限过滤与语义合并互相拆台'},
  // —— 隐私树 ——
  {a:'priv.forget', b:'perf.cache', platform:'audit', why:'被遗忘权要求删除追进每一层缓存与备份——「删干净」这一个动作，横穿所有存储'},
  {a:'priv.retention', b:'obs.trace', platform:'audit', why:'追踪里存着用户轨迹：观测想留 90 天排障，合规红线只许 30 天——同一份数据两个倒计时'},
  {a:'priv.region', b:'tenant.shardkey', platform:'infra', why:'分片按负载算，数据主权按国界算——两套分片逻辑抢同一张路由表'},
  {a:'priv.piitag', b:'gate.metrics', platform:'audit', why:'每加一个埋点都要过 PII 评审——「多埋点好做实验」与最小化采集天然对着干'},
  // —— 计费树 ——
  {a:'bill.entitlecheck', b:'gate.flagcfg', platform:'gate', why:'if (flag && paid && can(user))——门控、计费、权限三棵树焊在同一行代码里'},
  {a:'bill.ratelimit', b:'perf.batch', platform:'infra', why:'批量操作算一次调用还是 N 次？限流口径反过来决定 API 的形状'},
  {a:'bill.usagemeter', b:'obs.metricstd', platform:'audit', why:'计费用量与监控指标走同一条埋点管道——监控可以采样，计费一条都不能丢'},
  {a:'bill.plans', b:'authz.rbac', platform:'authz', why:'套餐说你「买没买」，角色说你「能不能」——两套「你能用什么」的模型在每个入口叠加'},
  // —— 多租户树 ——
  {a:'tenant.dataisol', b:'perf.cache', platform:'infra', why:'缓存键忘带租户前缀，就是把 A 公司的数据发给 B 公司——隔离要求写进每一个键的拼法里'},
  {a:'tenant.tenantflag', b:'gate.flagcfg', platform:'gate', why:'租户级开关叠在全局 Flag 之上——「这个功能对谁开」的答案要查两棵树'},
  {a:'tenant.noisy', b:'conc.workerpool', platform:'infra', why:'一个租户的重任务占满线程池，其他租户全部饿死——隔离必须打进调度器深处'},
  {a:'tenant.percfg', b:'arch.cfg', platform:'infra', why:'配置中心长出租户维度——每个配置项从一个值变成一张表，默认值与覆盖链没人说得清'},
];
