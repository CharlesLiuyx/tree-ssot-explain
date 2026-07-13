// 图例组件:配色语义速查(静态;术语标注由 main.js 启动时统一执行)。
// 业务/横切树的数量从数据推导,文案模板在语言包里。

import { mount } from './dom.js';
import { L } from '../i18n/index.js';
import { TREE_DEFS } from '../data/trees.js';

const biz = TREE_DEFS.filter(t => t.kind === 'biz').length;

export const legendEl = mount(`<div id="legend">${L.ui.legend(biz, TREE_DEFS.length - biz)}</div>`);
