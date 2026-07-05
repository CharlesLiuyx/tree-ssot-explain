// 本征耦合 · 引力对(纯数据):问题本身要求这些节点在一起——势必靠近,无法远离。
// 字段:a/b 两端节点 gid、why 为什么拆不开。唯一的出路是「共域」策略。

export const GRAVITY = [
  {a:'edit.undo', b:'ui.command', why:'每个命令都必须可撤销：命令定义与 Undo 栈互为镜像，改一边必改另一边——这不是设计失误，是问题本身的形状'},
  {a:'edit.selset', b:'ui.gizmo', why:'Gizmo 操纵器就是选择集的可视化手柄：两者共享同一份状态，物理上无法分居'},
  {a:'edit.depsgraph', b:'ui.realtime', why:'视口是数据模型的实时投影：依赖图每次增量求值，视口就要重绘对应脏区——帧帧同频（Blender 的 depsgraph ↔ viewport）'},
  {a:'ui.pluginapi', b:'arch.ext', why:'同一个扩展机制的两半：业务侧的 API 表面与架构侧的注册机制，天生一体（VS Code 的 extension host）'},
  {a:'collab.oplog', b:'edit.snapshot', why:'协同的正史是操作日志，本地撤销的正史是快照与差量——多人撤销必须在两种历史之间实时换算：「撤销我的操作」得先理解别人叠在上面的操作。合并语义与撤销语义互相定义，这是 Figma 类产品最深的一口井'},
  {a:'conc.mainthread', b:'ui.dirtyrect', why:'渲染循环长在主线程契约上：哪段代码允许碰 UI、哪帧必须让出主线程——线程模型与重绘节拍互为镜像，物理上无法分居'},
];
