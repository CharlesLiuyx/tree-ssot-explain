// 本征耦合文案(zh):kinds 三种长法的名称与副题,pairs 每对「为什么拆不开」(键 = 'a|b')。

export const gravityKinds = {
  mirror: { name:'互为镜像', desc:'改一边必改另一边' },
  faces:  { name:'一体两面', desc:'同一份状态的两个投影' },
  halves: { name:'同一机制的两半', desc:'合起来才是一个完整机制' },
};

export const gravityPairs = {
  'edit.undo|ui.command':'每个命令都必须可撤销:命令定义与 Undo 栈互为镜像,改一边必改另一边——这不是设计失误,是问题本身的形状',
  'edit.dirtyprop|perf.invalidate':'「什么变了、该作废什么」是同一张失效图:依赖图的脏标记怎么传播,缓存就怎么失效——传播规则改一条,失效联动必须跟着改一条,否则不是漏失效就是全击穿',
  'edit.modes|ui.ctxscope':'同一个按键在不同模式里是不同命令(Blender 的 Tab/G/R/S):快捷键按上下文分域,那个「域」就是编辑器的模式表——模式加一种,键位域同步加一层,永远同步演化',
  'conc.mainthread|ui.dirtyrect':'渲染循环长在主线程契约上:哪段代码允许碰 UI、哪帧必须让出主线程——线程模型与重绘节拍互为镜像,物理上无法分居',
  'edit.selset|ui.gizmo':'Gizmo 操纵器就是选择集的可视化手柄:两者共享同一份状态,物理上无法分居',
  'edit.depsgraph|ui.realtime':'视口是数据模型的实时投影:依赖图每次增量求值,视口就要重绘对应脏区——帧帧同频(Blender 的 depsgraph ↔ viewport)',
  'edit.multisel|ui.multiedit':'批量编辑的定义就是「把同一笔改动写进多选集合的每个成员」:多选的语义(谁在集合里、活动项是谁)就是批量编辑的语义——一边是名词,一边是动词,说的是同一件事',
  'collab.cursors|edit.active':'你屏幕上别人的光标,就是他的「活动项与焦点」被广播过来的投影:在场系统传输的内容,天生就是焦点状态本身——同一份 schema,谁也不能单方面改',
  'ui.pluginapi|arch.ext':'同一个扩展机制的两半:业务侧的 API 表面与架构侧的注册机制,天生一体(VS Code 的 extension host)',
  'collab.oplog|edit.snapshot':'协同的正史是操作日志,本地撤销的正史是快照与差量——多人撤销必须在两种历史之间实时换算:「撤销我的操作」得先理解别人叠在上面的操作。合并语义与撤销语义互相定义,这是 Figma 类产品最深的一口井',
  'collab.crdt|edit.datablock':'「可合并」首先是身份问题:两个副本里的「同一个对象」必须有同一个 ID,合并规则长在数据块的户口系统上——CRDT 与 ID 体系互为前提(Figma 的 objectID ↔ 合并语义)',
  'fault.idempotent|bill.billevent':'计费事件一条不能丢、也一条不能重:「恰好一次」的语义 = 重试 × 幂等键——计费的正确性直接长在幂等上,两边必须一起设计、一起对账',
};
