// UI 与场景标签文案(zh):按组件分组;带参数的条目是模板函数(各语言自理语序)。
// 键集合与 en/ui.js 由 check-narrative 门禁对齐(递归比较,函数只比存在性)。

export const ui = {
  topbar: {
    title: '多树形结构 · <em>节点交织</em>模型',
    subtitle: 'Multi-Tree / Node-Entanglement Model —— 为什么项目复杂到某一刻，AI 突然就「糊」了',
    keys: '拖动旋转 · 滚轮缩放 · <b>点击节点</b> Zoom in · <b>Esc</b> 返回 · <b>V</b> 视口全景 · <b>←/→</b> 切换步骤 · 悬停看详情',
    langBtn: 'EN',                       // 按钮显示「切过去的语言」
    langBtnTitle: 'Switch to English',   // 提示写给目标语言的读者
  },
  meter: {
    title: '语义熵 · AI 混淆度',
    scaleOk: '可驾驭', scaleMid: '吃力·需人在环', scaleBad: '崩塌区',
    zoneOk: 'AI 可驾驭', zoneMid: '吃力 · 需人在环', zoneBad: '混淆崩塌区',
  },
  legend: (biz, cross) => `
  <span class="sw" style="background:#ffd166"></span>根 / SSOT —— 由人守护<br>
  <span class="sw" style="background:#d9e650"></span><span class="sw" style="background:#ff7fb2;margin-left:-3px"></span>业务树 ×${biz}（深）　<span class="sw" style="background:#5b8cff"></span><span class="sw" style="background:#7ee08a;margin-left:-3px"></span><span class="sw" style="background:#dcc98a;margin-left:-3px"></span>横切树 ×${cross}（拉通）<br>
  <span class="sw" style="background:#ff4d6d"></span>偶然交织（可消解）　<span class="sw" style="background:#ff2fd0"></span>本征引力（只能共域）<br>
  <span class="sw" style="background:#7de8ff"></span>幽灵根 —— 真相在图外（只能显式化收编）<br>
  <span class="sw" style="background:transparent;border:1.5px dashed #7de8ff"></span>仓库边界（可嵌套）—— 每棵树可自成仓库 / 子仓库<br>
  <span class="sw" style="background:transparent;border:1.5px solid #5dd39e"></span>叶子 · AI 自由区　<span class="sw" style="background:#ffb84d"></span>已契约化　<span class="sw" style="background:#f3e9c8"></span>平台树`,
  rotate: {
    title: '暂停 / 恢复总览的自动旋转（快捷键 Space，也可直接拖动画面）',
    stop: '停止旋转', start: '自动旋转',
  },
  nav: { prev: '← 上一步', next: '下一步 →', restart: '↺ 回到总览' },
  caseCtrl: {
    rangeTitle: '拖动:播放到第几条',
    allBtn: '⚡ 全展示', allTitle: '一次点亮全部交织,不再轮播',
    pause: '⏸ 暂停', replay: '▶ 重播', resume: '▶ 继续', play: '▶ 播放',
    playTitle: '逐条揭示纠缠案例(点击才开始播放)',
    cycleStop: '⏸ 停止轮播', cycleStart: '▶ 轮播点名',
    cycleTitle: '每 5 秒点名一对引力(点击才开始轮播)',
  },
  director: {
    caseIdle: n => `<span class="dim">${n} 条真实纠缠待揭示——点 ▶ 逐条播放，拖动进度条定格任意一条，或「⚡ 全展示」一键点亮</span>`,
    caseItem: (i, n, a, b, why) => `<b>案例 ${i}/${n}</b>　${a} ↔ ${b}<br>${why}`,
    caseDone: n => `<br><span class="dim">✓ ${n} 条已全部展示——不再轮播,拖动进度条可回看任意一条</span>`,
    gravIdle: n => `<span class="dim">${n} 对本征耦合待点名——点 ▶ 开始轮播，或直接点击下方列表任意一对</span>`,
    gravItem: (i, n, a, b, kindName, why) => `<b>引力对 ${i}/${n}</b>　${a} ⚡ ${b}<span class="gkind">${kindName}</span><br>${why}`,
  },
  panel: {
    gravGroup: (kindName, kindDesc, count) => `<b>${kindName}</b><span>${kindDesc} · ${count} 对</span>`,
    lawBack: '回全景 ↩', lawGo: '看现场 ↗',
    lawScenePrefix: '📍 ',
    stratPct: pct => `${pct} 熵`,
    statsTangles: ({ red, amber, grey, plat }) =>
      `偶然交织：<span class="r">${red} 条仍在纠缠</span> · <span class="am">${amber} 条已契约化</span> · <span class="dim">${grey} 条循环中消解</span> · <span class="g">${plat} 条已平台化</span>`,
    statsGravity: (n, fused) =>
      `本征引力：${fused ? `<span class="g">${n} 对已共域（金色气泡）</span>` : `<span class="mg">${n} 对仍在拉扯</span>`}`,
    statsGhosts: (n, explicit) =>
      `图外真相：${explicit ? `<span class="g">${n} 个幽灵根已收编入库</span>` : `<span class="gh">${n} 个幽灵根游离在外</span>`}`,
    metaPathTitle: (proto, desc) => `${proto} —— ${desc}`,
    metaPlay: '▶ 生长', metaPause: '⏸ 暂停',
    metaPlayTitle: '开始 / 暂停生长（长完后再点 = 从头重播）',
    metaSpeed: '生长速度', metaSpeedTitle: '拖动:调整树之树的生长速度',
    metaReplay: '↻ 重播', metaReplayTitle: '以当前速度重新生长',
    metaTraits: (proto, desc, strong, weak) =>
      `<div class="quote"><b style="color:#dfe6f3">${proto}</b> —— ${desc}<br><b class="g">骨骼</b>：${strong}<br><b class="r">假肢</b>：${weak}</div>`,
  },
  nodeInfo: {
    platformKind: '平台树 · 横切关注点的显式归属',
    kindRoot: 'SSOT · 由人守护',
    kindSkeleton: '骨架 · 谨慎交给 AI',
    kindLeaf: '叶子 · AI 自由区（需测试锚定）',
    platformTreeName: '平台树',
    meanings: (n, multi) => `含义数：${n}${multi ? '（多义！）' : '（单义 ✓）'}`,
    tangleItem: (other, why) => `<li><b>与「${other}」交织</b>：${why}</li>`,
    gravNote: (kindName, other) => `⚡ 本征耦合（${kindName}）：与「${other}」势必靠近`,
    ghostNote: name => `👻 真相在图外：由「${name}」决定——AI 从文本读不到`,
    tangleActive: '● 纠缠中',
    tanglePlatformed: '● 已平台化：双方只依赖平台服务',
    tangleContracted: '● 已契约化：必须穿过层间接口',
    tangleLooped: '● 本轮循环中已消解',
    gravKindLabel: kindName => `本征耦合 · ${kindName}`,
    gravFused: '● 已共域：同一模块、一起设计、一个 owner',
    gravActive: '● 本征耦合 —— 拆不开，只能共域',
    ghostCollected: '● 已收编：真相已显式化入库（装配文件 / 订阅表 / golden-file / schema）',
    ghostFree: '● 游离在图外 —— AI 从文本静态读不到它',
    ghostFix: fix => `<b style="color:#dfe6f3">出路</b>：${fix}`,
    metaKind: (idx, parentShort) =>
      `树之树 · 第 ${idx} 个长出${parentShort ? ` · 从「${parentShort}」的痛点里长出` : ' · 元根'}`,
  },
  tooltip: { termFallback: '名词解释' },
  scene: {
    rootSsot: 'root = SSOT',
    boundaryLabel: '<b>仓库边界</b><span>环内 = AI 能读到的全部文本</span><span>虚线小环 = 每棵树都可以自成仓库 / 子仓库</span>',
    treeRingLabel: '<b>每棵树可自成一仓</b><span>虚线环 = 这棵树自己的仓库边界 · 独立仓库或子仓库</span>',
    ghostLabel: name => `<b>👻 ${name}</b><span>幽灵根 · 真正的 SSOT 在图外</span>`,
    platformLabel: '<b>平台树 · 显式共享</b><span class="ssot">横切关注点的新 SSOT</span>',
    metaRootBadge: '元根 · 第一性假设',
    aiLabel: 'AI<span>attention 预算有限</span>',
    gravNameplate: (a, b, kindName) => `<b>${a} ⚡ ${b}</b><span>本征耦合 · ${kindName}</span>`,
  },
  vp: {
    back: '← 返回上一步', backTitle: '返回上一个视口（快捷键 Esc）',
    pill: '视口历史', pillTitle: '展开「视口历史」面板（导航树 + 节点详情）',
    title: '视口历史',
    collapse: '— 收起', collapseTitle: '收起为胶囊（历史保留）',
    mapBtn: '⛶ 全景', mapBtnTitle: '查看视口历史全景（快捷键 V）',
    home: '⌂ 起始视角', homeTitle: '回到本步的起始视角',
    clear: '⌫ 清空', clearTitle: '清空本步视口历史（只保留起始视角并飞回）',
    detailEmpty: '点击任意节点 <b>Zoom in</b> 查看详情',
    navTree: '导航树（点击任意节点跳转）',
    gcSuffix: n => ` · 已回收 ${n}`,
    startLabel: '起始视角',
    mapTitle: '视口历史 · 全景',
    mapClose: '✕ 关闭 <span class="kbd">Esc</span>',
    mapStats: (depth, count, max) => `当前深度 ${depth} · 视口 ${count} / ${max}`,
    mapFoot: max => `点击任意视口立即跳转（120ms）· <b>V</b> 键随时开关全景 · 每一步一棵历史树，切换步骤后重新生长 · 超过 ${max} 个视口自动回收最久未访问的旁支叶子——根与当前路径永不回收`,
    chipTitle: label => `跳转到「${label}」`,
    chipRootTitle: '回到本步起始视角',
    current: '当前',
    mapEmpty: '还没有 Zoom in 记录——点击 3D 图中任意节点，这里会长出历史树。',
  },
};
