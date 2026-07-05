// 场景登记表:跨系统共享的节点/树/动效集合。
// scene 各系统在初始化时写入;ui(节点详情、视口配色)与主循环只读。
// 这是「树的模型」本身——语义字段(gid/name/level/tangles/gravity/ghost)是各系统共同的读面;
// 视觉字段(color/opacity/emissive/pos)由实例化池(scene/pools.js)按 idx 写入 GPU。

export const nodesById = new Map(); // gid → node
export const trees = [];            // {def,idx,group,nodes,edges,edgeMat}
export const allNodes = [];         // 全部节点(平台树节点除外)
export const treeById = {};         // 树id → tree(树之树用)

export const spinners = [];         // 自旋装饰 {obj,axis,speed}(仅存少量 Object3D:平台根环/AI 球壳/幽灵根)
export const pulses = [];           // SDD 脉冲 {slot,e,phase}(点位在共享点池里)
export const labelEls = [];         // 树标签 DOM(按树序)

/* 节点世界坐标:所有可交互节点(树节点/平台节点)的 grp 只平移不旋转,world = grp.position + pos。
   这让引力形变、纠缠线端点、拾取全都不需要 updateMatrixWorld。 */
export function nodeWorld(n, out) { return out.copy(n.pos).add(n.grp.position); }
