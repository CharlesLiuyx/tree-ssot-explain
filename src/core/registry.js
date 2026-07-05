// 场景登记表:跨系统共享的节点/树/动效集合。
// scene 各系统在初始化时写入;ui(节点详情、视口配色)与主循环只读。
// 这是「树的模型」本身——mesh 引用挂在节点对象上,但语义字段(gid/name/level/tangles/gravity/ghost)是各系统共同的读面。

export const nodesById = new Map(); // gid → node
export const trees = [];            // {def,idx,group,nodes,edges,edgeMat}
export const allNodes = [];         // 全部节点(平台树节点除外)
export const treeById = {};         // 树id → tree(树之树用)

export const spinners = [];         // 自旋装饰 {obj,axis,speed}(主循环驱动)
export const pulses = [];           // SDD 脉冲 {dot,e,phase}
export const rootRings = [];        // SDD 根环
export const labelEls = [];         // 树标签 DOM(按树序)
