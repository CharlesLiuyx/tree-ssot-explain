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

import { buildTrees, mergeStaticBranches } from './scene/trees.js';
import { registerTangles } from './scene/tangles.js';
import { registerGravity } from './scene/gravity.js';
import { buildGhosts } from './scene/ghosts.js';
import { buildPlatform } from './scene/platform.js';
import { initDirector, setStage, syncRotate } from './app/director.js';
import { initViewportHistory } from './app/viewport-history.js';
import { initHover } from './app/hover.js';
import { initKeymap } from './app/keymap.js';
import { startLoop } from './app/loop.js';
import { annotateTerms } from './ui/terms.js';
import { legendEl } from './ui/legend.js';
import { meterEl } from './ui/entropy-meter.js';

/* 1. 场景:建树 → 登记交织(长光环) → 登记引力 → 合并静态枝干(依赖引力标记) → 幽灵根 → 平台树 */
buildTrees();
registerTangles();
registerGravity();
mergeStaticBranches();
buildGhosts();
buildPlatform();

/* 2. 行为装配:导演接管 UI 回调,视口历史接管点击导航,悬停与快捷键上线 */
initDirector();
initViewportHistory({ afterRender: syncRotate }); // 聚焦节点时暂停总览自转,回到根再恢复
initHover();
initKeymap();

/* 3. 启动 */
setStage(0);
annotateTerms(legendEl);
annotateTerms(meterEl);
startLoop();
window.__booted = true;
clearTimeout(window.__bootTimer);
document.getElementById('boot').remove();
