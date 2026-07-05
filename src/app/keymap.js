// 快捷键(按作用域分发)。作用域 = 「此刻键盘属于谁」:overlay 打开时独占键盘,
// 场景域快捷键自动失效,互不串扰(例如全景开着时 Esc/V 只负责关全景,←/→ 不会在模态背后偷偷切步骤)。
// 分发规则:KEY_SCOPES 自上而下取第一个 when() 为真的域作为激活域;
//           KEYMAP 只在激活域内匹配,命中即消费该按键(preventDefault),不跨域跌落。
// 扩展方式:新增 overlay → 在 KEY_SCOPES 顶部加一个域;新增按键 → 在 KEYMAP 加一行。
//           key 取 e.key 的值(字母一律写小写,空格写 'Space');
//           when = 该键此刻是否可用的守卫(省略 = 恒可用);
//           repeat:true = 允许按住连发(默认忽略,避免开关类操作抖动)。

import { state } from '../core/state.js';
import { toggleAutoRotate, nextStage, prevStage } from './director.js';
import { vpBack, openMap, closeMap, isMapOpen } from './viewport-history.js';

const KEY_SCOPES = [
  { id: 'map',   when: () => isMapOpen() },  // 视口全景 overlay:模态,独占键盘
  { id: 'scene', when: () => true },         // 3D 场景(默认域,兜底)
];
const KEYMAP = [
  { scope: 'map',   key: 'Escape',     desc: '关闭全景',                run: closeMap },
  { scope: 'map',   key: 'v',          desc: '关闭全景',                run: closeMap },
  { scope: 'scene', key: 'Escape',     desc: '返回上一视口',            run: vpBack },
  { scope: 'scene', key: 'v',          desc: '打开视口全景',            run: openMap },
  { scope: 'scene', key: 'Space',      desc: '总览:暂停/恢复自动旋转', when: () => state.stage === 0, run: toggleAutoRotate },
  { scope: 'scene', key: 'ArrowRight', desc: '下一步',                  repeat: true, run: nextStage },
  { scope: 'scene', key: 'ArrowLeft',  desc: '上一步',                  repeat: true, run: prevStage },
];

export function initKeymap() {
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;      // 带修饰键的组合留给浏览器 / 系统
    const t = e.target instanceof Element ? e.target : null;
    if (t && (t.isContentEditable || t.closest('input,textarea,select'))) return;             // 正在输入:键盘完全让路
    const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((key === 'Space' || key === 'Enter') && t && t.closest('button,a,[role=button]')) return; // 焦点在按钮上:交还原生激活语义
    const scope = KEY_SCOPES.find(s => s.when()).id;
    const bind = KEYMAP.find(b => b.scope === scope && b.key === key && (!b.when || b.when()));
    if (!bind) return;
    e.preventDefault();                                  // 命中即消费(含被忽略的连发)
    if (e.repeat && !bind.repeat) return;
    bind.run();
  });
}
