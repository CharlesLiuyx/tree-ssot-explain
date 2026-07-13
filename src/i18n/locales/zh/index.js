// zh 语言包装配:schema 的基准实现(en 等其他语言逐文件对照本目录翻译)。
// meta:code 语言码 / htmlLang <html lang> 值 / name 语言自称(切换按钮用) / title 文档标题。

import { stages, dotNames } from './stages.js';
import { laws, lawsSvg } from './laws.js';
import { TERMS } from './terms.js';
import { trees, nodes } from './trees.js';
import { tangles } from './tangles.js';
import { gravityKinds, gravityPairs } from './gravity.js';
import { ghosts } from './ghosts.js';
import { metaPaths } from './meta-paths.js';
import { strategies, platform } from './strategies.js';
import { ui } from './ui.js';

export const zh = {
  meta: { code: 'zh', htmlLang: 'zh-CN', name: '中文', title: '多树形结构 · 节点交织模型' },
  stages, dotNames,
  laws, lawsSvg,
  terms: TERMS,
  trees, nodes,
  tangles,
  gravityKinds, gravityPairs,
  ghosts,
  metaPaths,
  strategies, platform,
  ui,
};
