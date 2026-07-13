// 偶然交织案例文案(zh):键 = 'a|b'(两端节点 gid,与 src/data/tangles.js 逐条对应)。

export const tangles = {
  'perf.cache|authz.rowacl':'缓存键里不带权限信息，会把数据错发给无权的人；带上，命中率又会暴跌——两棵树在同一个节点上互相改写语义',
  'perf.cache|gate.canary':'灰度期间新旧两版数据结构共存，同一个缓存键可能存着两种形状的值',
  'perf.cache|arch.cfg':'缓存 TTL 散落在配置中心里，改配置的人并不知道自己会击穿哪个缓存',
  'gate.flagcfg|authz.apiauth':'新功能开关必须叠加权限判断：if (flag && can(user))，两套条件从此形影不离',
  'gate.canary|arch.bus':'灰度用户的事件要同时路由到新旧两套消费者，事件总线被迫理解发布状态',
  'perf.precompute|authz.roleinherit':'角色一变，预计算结果全部失效——失效联动跨越两棵树',
  'arch.ext|gate.abtest':'实验参数要穿透插件边界注入，插件的隔离性被打洞',
  'perf.batch|authz.auditlog':'批量操作必须拆出逐条审计，批处理的性能优势被审计要求抵消',
  'arch.split|perf.pool':'服务越拆越多，每个服务各建连接池，数据库总连接数爆炸',
  'gate.envisol|arch.cfg':'环境配置与开关配置是两套事实源——SSOT 开始打架',
  'authz.mask|perf.lazy':'脱敏必须在序列化前完成，懒加载让「序列化前」变得不可预测',
  'gate.metrics|perf.pool':'埋点流量与业务共用一条数据通路，实验一开吞吐就抖动',
  // 业务树被卷入的交织
  'ui.lod|perf.lazy':'视口降级想「少算」，懒加载想「晚算」——两个偷懒策略互相踩踏，时序没有 SSOT',
  'edit.snapshot|perf.batch':'Undo 快照走批量写入通道，历史的时序被批处理重排',
  'ui.sandbox|authz.apiauth':'插件沙箱复用 API 鉴权的模型，但插件的「主体」不是用户——权限模型被迫长出第二套主语',
  'edit.macro|gate.abtest':'宏录制录到了实验分支的行为，回放时实验已下线——录制品带着门控的时间戳',
  'ui.keymap|gate.flagcfg':'快捷键绑定的命令在 Flag 关闭时不存在——键位表被迫感知开关状态',
  'edit.nondestruct|authz.rowacl':'非破坏编辑保留原数据引用：行级过滤后的对象，仍能顺着修改器栈摸回原始数据',
  'edit.migrate|gate.flagcfg':'新数据结构躲在 Feature Flag 后面，版本迁移器被迫先读开关再决定怎么迁——同一个文件在开关两侧迁出两种结果，回滚开关等于批量制造「来自未来」的文件',
  'ui.layoutpersist|edit.fileio':'布局持久化搭了工程文件的便车：UI 状态被写进文档格式（Blender 的 .blend 正是如此）——从此改一个面板字段都算改文件格式，两棵业务树在磁盘上焊死',
  'ui.progress|perf.batch':'批量写入为吞吐把任务合并，进度条却需要逐条粒度的完成事件——要么进度撒谎，要么拆批毁吞吐，一根进度条背后是两棵树的拉锯',
  // —— 可观测树 ——
  'obs.logsample|fault.retry':'重试风暴恰好发生在流量最凶的时刻，而采样器此刻丢日志最狠——最需要证据的时候，证据最少',
  'obs.traceprop|arch.bus':'追踪上下文要穿过事件总线的异步边界——总线被迫在每个事件里捎带 trace 头，「解耦」的总线耦合上了观测',
  'obs.structlog|authz.mask':'日志想看全，脱敏想遮住——同一行日志在两棵树里有两种合法形态，排障与合规各执一份真相',
  'obs.metricstd|gate.abtest':'实验指标与告警指标同一个埋点、两种口径——实验说涨了，告警说崩了，没人知道该信谁',
  // —— 并发树 ——
  'conc.cancel|edit.cmdops':'取消到一半的命令要不要进 Undo 栈？取消传播撞上命令化操作，「半个操作」在两棵树里都没有定义',
  'conc.lockorder|perf.pool':'连接池有自己的锁，业务有自己的锁——两套锁序约定在高峰期互相等待，死锁只在生产复现',
  'conc.workerpool|edit.evalsched':'依赖图的并行求值调度与全局线程池抢核——两棵树都以为自己独占 CPU，卡顿归谁没有答案',
  // —— 容错树 ——
  'fault.idempotent|perf.batch':'批里一条失败：整批重试要求幂等，拆开重试毁掉吞吐——批的边界与幂等键互相绑架',
  'fault.circuit|gate.flagcfg':'熔断是开关、灰度也是开关——「功能为什么关了」从此有两个互不知情的事实源',
  'fault.errclass|edit.crashrec':'崩溃恢复必须知道哪些错误可恢复——而错误语义的分类表长在另一棵树上，恢复逻辑隔树读表',
  'fault.fallback|authz.apiauth':'兜底路径往往是老代码——老代码没接新的鉴权模型，降级的瞬间权限被静默绕过',
  // —— 兼容树 ——
  'compat.dualread|perf.cache':'双读双写期间同一个键存着两种形状的值——缓存必须理解 schema 版本，否则读出「来自过去」的数据',
  'compat.semver|ui.apicompat':'插件市场的兼容承诺有两个口径：业务树的弃用周期与兼容树的语义化版本——谁说了算，没有 SSOT',
  'compat.schemamig|edit.migrate':'文件版本迁移与 Schema 迁移是两套机制迁同一份数据——执行顺序错一步，迁出损坏文件',
  'compat.verneg|collab.syncengine':'协同房间里新旧客户端并存，协议要实时向下协商——兼容从「发布期问题」变成「每一秒的问题」',
  // —— i18n / 无障碍树 ——
  'i18n.textexpand|ui.docking':'德语文案平均比英语长三成——可停靠面板的最小宽度全部重算，每种语言里布局是另一个布局',
  'i18n.keynav|ui.keymap':'无障碍要求一切功能键盘可达——快捷键冲突解决从此多背一套「不可占用」清单',
  'i18n.icu|gate.abtest':'实验组改了文案，翻译流水线没跟上——灰度用户看到的是回退的源语言，实验数据被语言污染',
  'i18n.aria|ui.custompanel':'插件的自定义面板不带语义标注——产品整体的无障碍达标，被第三方生态拉爆',
  // —— 安全树 ——
  'sec.sandboxpol|ui.sandbox':'安全策略与沙箱实现分居两棵树——策略收紧了，实现没跟上，中间的空窗期就是漏洞',
  'sec.parsefuzz|edit.fileio':'打开一个文件就是暴露一次解析攻击面——格式兼容越宽容，解析器越难加固',
  'sec.keymgmt|arch.cfg':'密钥住在配置中心还是密钥服务？两个 SSOT 抢同一个秘密，轮换时总有一边在用旧钥匙',
  'sec.depaudit|compat.semver':'供应链要你为 CVE 升级依赖，兼容承诺不许 break——两棵树在同一次升级上向相反方向拔河',
  // —— 协同树 ——
  'collab.offline|edit.autosave':'离线重放与自动保存都想恢复现场——两套恢复点互相覆盖，「最新状态」有两个答案',
  'collab.awareness|perf.pool':'万人房间的在场广播把连接打满——存在感是流量放大器，协同一热闹，性能就跪',
  'collab.merge|authz.rowacl':'离线用户合并回来时，他无权看的行也参与了冲突解决——权限过滤与语义合并互相拆台',
  // —— 隐私树 ——
  'priv.forget|perf.cache':'被遗忘权要求删除追进每一层缓存与备份——「删干净」这一个动作，横穿所有存储',
  'priv.retention|obs.trace':'追踪里存着用户轨迹：观测想留 90 天排障，合规红线只许 30 天——同一份数据两个倒计时',
  'priv.region|tenant.shardkey':'分片按负载算，数据主权按国界算——两套分片逻辑抢同一张路由表',
  'priv.piitag|gate.metrics':'每加一个埋点都要过 PII 评审——「多埋点好做实验」与最小化采集天然对着干',
  // —— 计费树 ——
  'bill.entitlecheck|gate.flagcfg':'if (flag && paid && can(user))——门控、计费、权限三棵树焊在同一行代码里',
  'bill.ratelimit|perf.batch':'批量操作算一次调用还是 N 次？限流口径反过来决定 API 的形状',
  'bill.usagemeter|obs.metricstd':'计费用量与监控指标走同一条埋点管道——监控可以采样，计费一条都不能丢',
  'bill.plans|authz.rbac':'套餐说你「买没买」，角色说你「能不能」——两套「你能用什么」的模型在每个入口叠加',
  // —— 多租户树 ——
  'tenant.dataisol|perf.cache':'缓存键忘带租户前缀，就是把 A 公司的数据发给 B 公司——隔离要求写进每一个键的拼法里',
  'tenant.tenantflag|gate.flagcfg':'租户级开关叠在全局 Flag 之上——「这个功能对谁开」的答案要查两棵树',
  'tenant.noisy|conc.workerpool':'一个租户的重任务占满线程池，其他租户全部饿死——隔离必须打进调度器深处',
  'tenant.percfg|arch.cfg':'配置中心长出租户维度——每个配置项从一个值变成一张表，默认值与覆盖链没人说得清',
};
