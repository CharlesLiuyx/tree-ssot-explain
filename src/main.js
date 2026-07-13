// 装配入口(唯一的启动文件):谁依赖谁、先建什么后建什么,全部显式写在这里。
//
// 依赖方向(只许向下):main → app → ui / scene → core / story / data / config
//
// UI 组件按下列 import 顺序挂载 DOM(与原版 body 顺序一致);
// 场景系统在下方按原初始化顺序显式构建——树形由确定性 rng 生成,顺序即形状,勿调换。

import './ui/topbar.js';
import './ui/panel.js';
import './ui/entropy-meter.js';
import './ui/legend.js';
import './ui/dots.js';
import './ui/rotate-toggle.js';
import './ui/viewport-panel.js';
import './ui/viewport-map.js';
import './ui/tooltip.js';

import { renderer, scene, camera } from './scene/context.js';
import { buildTrees, buildBranches } from './scene/trees.js';
import { registerTangles, buildTanglePool } from './scene/tangles.js';
import { registerGravity } from './scene/gravity.js';
import { buildGhosts } from './scene/ghosts.js';
import { buildPlatform } from './scene/platform.js';
import { buildPools } from './scene/pools.js';
import { initDirector, setStage, syncRotate } from './app/director.js';
import { initViewportHistory } from './app/viewport-history.js';
import { initHover } from './app/hover.js';
import { initKeymap } from './app/keymap.js';
import { startLoop } from './app/loop.js';
import { annotateTerms } from './ui/terms.js';
import { legendEl } from './ui/legend.js';
import { meterEl } from './ui/entropy-meter.js';
import { STAGES } from './story/stages.js';
import { consumeResumeStage } from './i18n/index.js';

/* 1. 场景:建树 → 登记交织(长光环) → 登记引力 → 枝干烘焙(依赖引力标记) → 幽灵根 → 平台树
      → 实例化池构建(节点/描边/护壳/光环/发光点)与纠缠管道池预分配 */
buildTrees();
registerTangles();
registerGravity();
buildBranches();
buildGhosts();
buildPlatform();
buildPools();
buildTanglePool();

/* 2. 行为装配:导演接管 UI 回调,视口历史接管点击导航,悬停与快捷键上线 */
initDirector();
initViewportHistory({ afterRender: syncRotate }); // 聚焦节点时暂停总览自转,回到根再恢复
initHover();
initKeymap();

/* 3. 启动:预编译全部着色器(把编译毛刺挡在首帧之前),再进主循环。
      起始步骤默认 0;仅语言切换重载时恢复到切换前所在步骤(步骤状态是索引的纯函数,可精确复位) */
setStage(consumeResumeStage(STAGES.length));
renderer.compile(scene, camera);
annotateTerms(legendEl);
annotateTerms(meterEl);
startLoop();
window.__booted = true;
clearTimeout(window.__bootTimer);
document.getElementById('boot').remove();
