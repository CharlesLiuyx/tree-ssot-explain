// 本征耦合 · 引力对(纯数据):问题本身要求这些节点在一起——势必靠近,无法远离。
// 字段:a/b 两端节点 gid、kind 长法(mirror 互为镜像 | faces 一体两面 | halves 同一机制的两半)、
//       why 为什么拆不开。唯一的出路是「共域」策略。
// 注意:一个节点最多属于一对引力(登记时 node.gravity 会被覆盖),新增时勿复用已登记节点。

export const GRAVITY_KINDS = {
  mirror: '互为镜像',
  faces:  '一体两面',
  halves: '同一机制的两半',
};
export const GRAVITY_KIND_DESC = {
  mirror: '改一边必改另一边',
  faces:  '同一份状态的两个投影',
  halves: '合起来才是一个完整机制',
};

export const GRAVITY = [
  // —— 互为镜像:改一边必改另一边 ——
  {a:'edit.undo', b:'ui.command', kind:'mirror',
   why:'每个命令都必须可撤销:命令定义与 Undo 栈互为镜像,改一边必改另一边——这不是设计失误,是问题本身的形状'},
  {a:'edit.dirtyprop', b:'perf.invalidate', kind:'mirror',
   why:'「什么变了、该作废什么」是同一张失效图:依赖图的脏标记怎么传播,缓存就怎么失效——传播规则改一条,失效联动必须跟着改一条,否则不是漏失效就是全击穿'},
  {a:'edit.modes', b:'ui.ctxscope', kind:'mirror',
   why:'同一个按键在不同模式里是不同命令(Blender 的 Tab/G/R/S):快捷键按上下文分域,那个「域」就是编辑器的模式表——模式加一种,键位域同步加一层,永远同步演化'},
  {a:'conc.mainthread', b:'ui.dirtyrect', kind:'mirror',
   why:'渲染循环长在主线程契约上:哪段代码允许碰 UI、哪帧必须让出主线程——线程模型与重绘节拍互为镜像,物理上无法分居'},
  // —— 一体两面:同一份状态的两个投影 ——
  {a:'edit.selset', b:'ui.gizmo', kind:'faces',
   why:'Gizmo 操纵器就是选择集的可视化手柄:两者共享同一份状态,物理上无法分居'},
  {a:'edit.depsgraph', b:'ui.realtime', kind:'faces',
   why:'视口是数据模型的实时投影:依赖图每次增量求值,视口就要重绘对应脏区——帧帧同频(Blender 的 depsgraph ↔ viewport)'},
  {a:'edit.multisel', b:'ui.multiedit', kind:'faces',
   why:'批量编辑的定义就是「把同一笔改动写进多选集合的每个成员」:多选的语义(谁在集合里、活动项是谁)就是批量编辑的语义——一边是名词,一边是动词,说的是同一件事'},
  {a:'collab.cursors', b:'edit.active', kind:'faces',
   why:'你屏幕上别人的光标,就是他的「活动项与焦点」被广播过来的投影:在场系统传输的内容,天生就是焦点状态本身——同一份 schema,谁也不能单方面改'},
  // —— 同一机制的两半:合起来才是一个完整的东西 ——
  {a:'ui.pluginapi', b:'arch.ext', kind:'halves',
   why:'同一个扩展机制的两半:业务侧的 API 表面与架构侧的注册机制,天生一体(VS Code 的 extension host)'},
  {a:'collab.oplog', b:'edit.snapshot', kind:'halves',
   why:'协同的正史是操作日志,本地撤销的正史是快照与差量——多人撤销必须在两种历史之间实时换算:「撤销我的操作」得先理解别人叠在上面的操作。合并语义与撤销语义互相定义,这是 Figma 类产品最深的一口井'},
  {a:'collab.crdt', b:'edit.datablock', kind:'halves',
   why:'「可合并」首先是身份问题:两个副本里的「同一个对象」必须有同一个 ID,合并规则长在数据块的户口系统上——CRDT 与 ID 体系互为前提(Figma 的 objectID ↔ 合并语义)'},
  {a:'fault.idempotent', b:'bill.billevent', kind:'halves',
   why:'计费事件一条不能丢、也一条不能重:「恰好一次」的语义 = 重试 × 幂等键——计费的正确性直接长在幂等上,两边必须一起设计、一起对账'},
];
