# 多树形结构 · 节点交织模型（3D 可视化）

[![Deploy GitHub Pages](https://github.com/CharlesLiuyx/tree-ssot-explain/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/CharlesLiuyx/tree-ssot-explain/actions/workflows/deploy-pages.yml)

**在线体验**：<https://charlesliuyx.github.io/tree-ssot-explain/>（推送 `main` 自动部署）

一个 3D 交互解释器，用来阐述「多树形结构-节点交织」模型。
以 **Blender / VS Code** 这类复杂交互工具为想象原型：

- 复杂项目 = 多棵视角树的共同演化：**业务树 ×2**（编辑核心、交互界面——5 层深、各约 50 节点，
  更深、更茂密，这是域复杂度，是产品价值本身）+ **横切树 ×14**（浅但拉通，约束互为代价）：
  - 经典四棵：**架构 / 性能 / 权限 / 门控**；
  - 运行时三棵：**可观测 / 并发 / 容错**；
  - 承诺三棵：**兼容 / 安全 / 隐私**；
  - 产品与商业四棵：**i18n·无障碍 / 协同 / 计费 / 多租户**。
- 横切需求把不同树的节点焊成**红色偶然交织**（59 个真实纠缠案例）；交织密度一旦超过
  AI 的 attention 预算，消歧失败，理解发生断崖式崩塌。
- **洋红本征引力**（12 对，按「为什么拆不开」分三种长法）：有些节点因为问题本身的形状
  **势必靠近、无法远离**——分层拉不开它们，只会把枝干拉长；对它们唯一的出路是「共域」：
  - 互为镜像 ×4：命令 ⚡ Undo 栈、脏标记传播 ⚡ 缓存失效、模式切换 ⚡ 键位分域、主线程契约 ⚡ 脏区重绘；
  - 一体两面 ×4：Gizmo ⚡ 选择集、视口 ⚡ 依赖图、多选 ⚡ 批量编辑、多人光标 ⚡ 活动焦点；
  - 同一机制的两半 ×4：插件 API ⚡ 扩展点注册、操作日志 ⚡ Undo 快照、CRDT ⚡ 数据块 ID、幂等键 ⚡ 计费事件。
- **青色圆环（仓库边界，可嵌套）**：环内 = AI 能读到的全部文本。大环圈住整个工作区，
  每棵树脚下还有一圈虚线小环——**每棵树都可以是一个独立仓库或子仓库**。
  边界划在哪一级是工程选择；但跨环依赖必须显式契约化，幽灵根则漂在所有环之外。
- **青色幽灵根（图外真相）**：有些节点的真正 SSOT 根本不在仓库里——DI 容器的运行时装配、
  事件总线的订阅表、用户磁盘上的旧文件、部署系统的环境配置。图内多义让 AI 改错；
  图外真相让 AI **自信地把文本改对、坏掉的是世界**。唯一出路是「显式化」收编。
- **树之树（元树）**：十六棵树本身也组成一棵更大的树——每棵横切树都是从另一棵树的
  痛点里长出来的。**同一组树，四种生长顺序，长成四棵完全不同的元树、四种系统气质**：
  「单机工具长成平台」（Blender / VS Code：手感为根，协同是晚年移植的器官）、
  「云原生 SaaS 第一天」（Figma / Slack：协同为根，单机深度是后补的课）、
  「监管地基上的企业核心」（SAP / 银行核心：合规为根，速度是排队等审批的晚课）、
  「增长飞轮上的消费应用」（抖音 / Instagram：数据为根，合规是被罚单追加的补丁）。
  当元根的资格只有一条：单向门决策够密——做了就改不回的决策越多，越有资格定义地形
  （门控是标准的双向门，所以它长得再早也当不了根）。先长的树定义地形，后长的树只能绕着走——生长顺序即系统命运。

## 运行

两个版本，依赖均已本地化（离线可用，不访问 CDN）：

| 文件 | 打开方式 | 说明 |
|---|---|---|
| `index.html` | 本地服务器 | 源码版，依赖走 `vendor/`（浏览器会拦截 file:// 下的 ES Module，需 http） |
| `index-embedded.html` | **直接双击** | 单文件，three.js 全部内联，零外部请求，适合分发/归档。**构建产物，不入库**：本地 `pnpm run build` 生成，或直接从[线上站点](https://charlesliuyx.github.io/tree-ssot-explain/index-embedded.html)下载 |

```bash
# 源码版（零构建，原生 ES Module + importmap）：
python3 -m http.server 4173   # 或 pnpm run serve
# 打开 http://127.0.0.1:4173/
```

修改源码后重新生成内联版：

```bash
pnpm install    # 仅首次：安装构建期依赖 esbuild + puppeteer-core（版本已锁定，无任何运行时依赖）
pnpm run build  # 即 node scripts/build-embedded.mjs，产出 index-embedded.html
```

依赖清单（`vendor/`，three.js r160，来源 cdn.jsdelivr.net）：
`three.module.js`、`controls/OrbitControls.js`。

## 验证（改完代码跑什么）

| 命令 | 耗时 | 覆盖范围 |
|---|---|---|
| `pnpm run check` | ~0.2s | 静态校验：语法错误、import 路径写错、样式链接失效（esbuild 解析全图，不写产物） |
| `pnpm run smoke` | ~30s | 冒烟测试：无头 Chrome 真实加载源码版 → 等引擎启动 → ←/→ 走完 10 步叙事，收集一切 console 错误/未捕获异常/加载失败；逐步截图只在失败时保留到 `test-artifacts/`，通过后自动清理 |
| `pnpm run smoke:embedded` | ~30s | 同上，但测单文件版且走 `file://`（与用户「双击打开」同路径；需先 build） |
| `pnpm run verify` | ~1min | 全量：check → smoke → build → smoke:embedded，等价于 CI 的部署门禁 |

冒烟测试不下载浏览器，直接复用系统 Chrome/Chromium；特殊安装路径用环境变量
`CHROME_PATH` 指定。日常节奏：改一行跑 `check`，提交前跑 `verify`。

## 提交规范

Commit message 遵循 Conventional Commits：`type(scope): subject`，subject 中文为主、
不以句号结尾。`pnpm install` 自动启用 `commit-msg` 钩子，不合规的提交会被拦下并提示原因。
完整 type 表、scope 约定与示例见 [docs/COMMIT_CONVENTION.md](docs/COMMIT_CONVENTION.md)。

## 部署

GitHub Pages 公开访问地址：
`https://charlesliuyx.github.io/tree-ssot-explain`

每次推送到 `main` 都会触发 `.github/workflows/deploy-pages.yml`：先过验证门禁
（静态校验 → 源码版冒烟 → 现场构建 `index-embedded.html` → 产物冒烟，任一失败即不部署；
冒烟截图通过后清理、失败时上传为 artifact 供排查），再把静态站点发布到 GitHub Pages。部署 artifact
只包含浏览器运行所需的文件：`index.html`、`index-embedded.html`（CI 现场构建）、
`src/`、`styles/`、`vendor/`。

## 代码结构

数据、故事、场景、UI、编排五层分治，依赖只许向下（`main → app → ui / scene → core / story / data / config`），
零循环依赖——改哪类东西，只动哪一层：

```
index.html            轻壳：boot 兜底 + importmap + <link> 样式 + <script src=src/main.js>
docs/                 规范与细则（渐进式披露：本 README 只留摘要，细节在 docs/ 按需下钻）
scripts/
  build-embedded.mjs   esbuild 打包 src/main.js 并内联全部 CSS/JS 为单文件版；--check 只校验不产出
  smoke-test.mjs       冒烟测试：无头 Chrome 加载页面走完 10 步叙事，零错误才放行
  check-commit-msg.mjs Commit message 校验（.githooks/commit-msg 调用，规则见 docs/COMMIT_CONVENTION.md）
styles/               CSS 按组件拆分（base / topbar / panel / hud / tooltip / labels / viewport）
src/
  config.js           调色板、树形体型、布局锚点、叙事焦点等常量
  data/               【纯数据】树定义 / 交织 / 引力对 / 幽灵根 / 平台服务 / 策略 / 演化路径
  story/              【纯文案】十步叙事（含机位）/ ~110 条名词解释
  core/               【基础设施】state+runtime（跨系统状态 SSOT）/ 补间 / three 工具 / 场景登记表
  scene/              【3D 系统】context（渲染器/相机/帧率调度）/ pools（节点与装饰的实例化池）/
                      labels（轻量 2D 标签）/ trees / tangles / gravity / ghosts / platform /
                      strategies-fx / collapse / meta-tree / appearance
  ui/                 【UI 组件】每个组件自带 DOM 模板与渲染：panel / dots / entropy-meter /
                      legend / topbar / rotate-toggle / tooltip / node-info / terms / viewport-*
  app/                【编排】director（setStage 总调度）/ viewport-history / hover / keymap / loop
  main.js             唯一装配点：按依赖顺序显式建场景、注入 UI 回调、启动主循环
```

常见改动的落点：加一棵树 / 一条交织 → 只改 `src/data/`；改文案或名词解释 → 只改 `src/story/`；
调 UI 样式 → 只改 `styles/`；加一个策略 → `data/strategies.js` 登记 + `scene/` 加视觉效果。
数据引用（节点 gid）在启动时校验，写错会直接报错指出缺失节点。

## 叙事结构（10 步，← / → 或底部导航切换）

一切自动播放（总览自转 / 交织揭示 / 引力轮播 / 树之树生长）都**必须点击才开始**——
进场只呈现静止态与「▶」按钮，静止即停渲染。

| 步骤 | 内容 | 可视化 |
|---|---|---|
| 0 总览 | 项目的真实形状 | 十六棵树 + 红色交织 + 洋红引力 + 幽灵根（预告）；左下角「⟳ 自动旋转」/ Space 开启环绕（默认静止） |
| 1 一棵树 | 根 = SSOT；视角决定生长；金色守护区 vs 绿色 AI 自由区 | 聚焦编辑核心树（业务树，5 层深、50+ 节点） |
| 2 多棵树 | 业务树（域复杂度）× 横切树 ×14（冲突约束）的力场 | 十六树亮起，标签展示视角与代价 |
| 3 交织 | 横切需求焊接节点；59 个真实纠缠案例逐条揭示（业务树也被卷入） | 红色纠缠线生成，节点长出多义性光环；点「▶ 播放」逐条揭示（不点不播），进度条可拖动定格任意一条，「⚡ 全展示」一键点亮全部——展示完毕停格，不再轮播 |
| 4 引力 | **本征耦合：有些节点势必靠近、无法远离**（12 对 × 三种长法） | 节点挣脱树形互相吸引，洋红引力束 + 被拉弯的枝干；点「▶ 轮播点名」逐对点名（不点不播）——被点名的光束增粗增亮、两端节点呼吸、中点浮出名牌，面板分组列表可点选任意一对定格查看 |
| 5 图外真相 | **幽灵根：语义的真相离开了仓库**——AI 从文本静态读不到 | 青色仓库边界（工作区大环 + 每树虚线小环 = 可自成仓库/子仓库）+ 环外幽灵根 + 虚线 + 节点语义闪烁 |
| 6 崩塌 | 同一表征 7 个含义 × 有限 attention → 断崖式崩塌 | AI 球的上下文光束：实线装得下，虚线装不下（7 条光束只够 2 条实线） |
| 7 消解 | 七种手术开关，实时观察语义熵下降；两类特殊病灶各有专刀 | 分层 / SDD / TDD / Loops / 平台化 / **共域** / **显式化** |
| 8 法则 | 复杂度治理公式 + 五条法则卡片（每条带 SVG 图示） | 全策略终态；点击法则卡片，镜头飞到该法则的「活现场」（根/叶/引力气泡/收编的幽灵根/雷达与平台树），现场元素聚光脉冲 |
| 9 树之树 | **树也长成树：生长顺序即系统命运**——先有 A 再有 B ≠ 先有 B 再有 A | 森林坍缩成元节点，点「▶ 生长」按「从谁的痛点里长出来」长成元树（不点不播，长完自动休眠）；四条演化路径（工具 / SaaS / 企业 / 消费）可切换重播，「生长速度」滑杆随时调速（默认即快），虚线垂向森林真身 |

**名词解释**：面板、案例栏、图例中的术语（SSOT、横切、本征耦合、CRDT、幂等、被遗忘权、
邻居噪音、attention 预算……共约 110 条）自动标注虚线下划线，悬停即弹出通俗解释。

## 策略 ↔ 模型 的映射

- **分层 Layering（−35% 熵）**：偶然交织退化为层间契约（8 层 × 前后 2 排）——但**引力对拉不开**，枝干只会被拉长。
- **SDD（−25%）**：强化树根——任何节点语义可从 spec 推导，AI 不必读遍全图消歧。
- **TDD（−20%）**：冻结叶子语义——测试是语义锚，这是「AI 随便写」的前提。
- **Loops（−15%）**：限速——每轮循环允许的新纠缠有限，且轮末消解。
- **平台化（−50%）**：把横切关注点提升为独立平台树——隐式纠缠变成显式依赖。
- **共域 Fusion（−15%）**：对**本征耦合**停止拉扯——引力对放进同一模块 / 同一层，
  一起设计、一起测试、一个 owner（金色气泡 = 合法同居）。
- **显式化 Explicitation（−40%）**：把**图外真相**拉回图内——DI 收敛为单一装配文件、
  事件改类型化订阅表、旧文件采样为 golden-file 测试、配置 schema 化
  （幽灵根被拉进仓库边界，虚线变实线，节点停止闪烁）。

核心公式：**AI 可驾驭的复杂度 ≈ Attention 预算 × 结构显式度 ÷ 节点平均多义性**

三条核心区分：
**偶然交织 → 消解；本征引力 → 共域；图外真相 → 显式化收编。**
判断幽灵根的判据：AI 能否只靠仓库内的文本，静态回答「这个接口运行时到底是谁」。

第四条（树之树）：**横切树没有「正确」的生长顺序，只有与产品命运匹配的顺序**——
每种顺序都把某些能力长成骨骼、把另一些留成假肢。四组顺序对照：
先性能后权限 vs 先权限后性能（缓存键里有没有权限位）；
先 Undo 后协同 vs 先协同后 Undo（撤销是单人史观还是天生多人）；
先埋点后功能 vs 先功能后埋点（没埋的点永远补不回来）；
先合规后增长 vs 先增长后合规（留痕与实验谁先就位）。

## 技术

three.js r160（importmap → 本地 `vendor/`）+ OrbitControls + 自研轻量 2D 标签渲染器，
源码版无构建步骤（原生 ES Module，入口 `src/main.js`）；
`scripts/build-embedded.mjs` 用 esbuild（resolve 插件把 `three` 裸导入指到 `vendor/`）
把全部 CSS/JS 内联为单文件 `index-embedded.html`。

**渲染架构（为全程不卡顿而设计）**：

- **实例化池**（`scene/pools.js`）：241 个节点球 + 描边 / 护壳 / 光环 / 脉冲点 / 根环
  各自合并为一个 InstancedMesh——整帧 draw call 从 ~700-1000 降到 ~60-160；
  节点的颜色 / 自发光 / 透明度走 per-instance 属性（着色器补丁），静态枝干烘焙为每树一个合并网格。
- **纠缠管道池**（`scene/tangles.js`）：59 条纠缠线的管状几何预分配在两个大缓冲里，
  策略切换 / 树迁移时就地重写顶点 + drawRange（不再逐帧 new/dispose TubeGeometry），
  迁移动画期间每帧重建成本从 ~10ms 级降到 ~0.3ms 级,且零 GC 压力。
- **轻量标签**（`scene/labels.js`）：标签登记表直投屏幕坐标,替代 CSS2DRenderer
  的每帧双次全场景递归遍历;transform / display / zIndex 带缓存,不变不写 DOM。
- **解析拾取**：悬停与点击用「射线×球 / 射线×线段」解析求交,不再对数百个网格做三角形遍历。
- **帧率调度**：空闲即停渲染(CPU 归零)、环境 60fps、交互放开到刷新率(封 120)；
  机器跟不上时自适应降档(像素比 1.5→1.25→1.0,最后环境帧率退 30),只降不升。
  一切自动播放(自转/揭示/轮播/生长)必须点击才开始,故**页面默认态即零渲染**;
  树之树长完自动停播休眠,鼠标停在 UI 面板上阅读/滚动也不唤醒 3D 渲染。
- **CSS 合成层**:面板不用 backdrop-filter(WebGL 画布上的毛玻璃每帧都要重新模糊),
  STEP 6 危险光晕用固定 box-shadow × opacity 动画(纯合成器,零重绘)。

引力形变通过每帧更新节点位置与单位圆柱枝干实现（静止时精确归位、零开销）；
幽灵根的虚线 / 收编动画就地写预分配的线段缓冲；
树之树把每棵树坍缩为元节点，按所选演化路径的拓扑序逐个点亮（枝先长、球后冒），
虚线垂向森林中该树的真身，四条路径可随时切换重播，生长速度按倍速播放头累加（中途调速不跳变）；
右上角「语义熵」仪表由交织状态、引力状态、幽灵根状态与策略开关实时计算。
所有转场与移动动效以「清爽、快速」为准：叙事切步相机飞行 150ms（`STAGE_DUR`），
场内位移（分层排布 / 平台弹出 / 法则现场）450ms（`MOVE_DUR`），视口导航 120ms（`FAST_DUR`）。
