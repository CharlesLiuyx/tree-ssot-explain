// i18n 核心:当前语言解析 + 当前语言包出口。
// 语言解析的唯一现场在 index.html 的内联脚本(boot 提示必须在任何模块加载前就用对语言),
// 结果挂在 window.__lang;本模块只消费该结果,Node 环境(静态校验/冒烟测试)下回退 zh。
// 语言包 schema 以 locales/zh/ 为准(逐文件对照 src/data|story 的结构),
// 新增语言 = 复制 locales/zh/ 为 locales/<code>/ 翻译后在 LOCALES 登记一行;
// 两包的键集合一致性由 scripts/check-narrative.mjs 静态门禁强制,运行时 req() 兜底 fail-fast。

import { zh } from './locales/zh/index.js';
import { en } from './locales/en/index.js';

export const LOCALES = { zh, en };
export const LOCALE = (typeof window !== 'undefined' && window.__lang in LOCALES) ? window.__lang : 'zh';
export const L = LOCALES[LOCALE];

/* localStorage / sessionStorage 键(STORE_KEY 与 index.html 内联脚本中的同名字面量必须一致) */
const STORE_KEY = 'tree-ssot-lang';
const RESUME_KEY = 'tree-ssot-resume-stage';

/* 切换语言:记住选择与当前步骤后整页重载——叙事状态是步骤的纯函数,重载后可精确复位;
   相比就地重渲染(每个组件与 3D 标签都要支持重建),重载是零状态残留的干净路径。 */
export function switchLocale(code, stage) {
  if (!(code in LOCALES) || code === LOCALE) return;
  try { localStorage.setItem(STORE_KEY, code); } catch { /* file:// 或隐私模式下拿不到存储:仅本次生效 */ }
  try { sessionStorage.setItem(RESUME_KEY, String(stage)); } catch { /* 同上 */ }
  const url = new URL(location.href);
  url.searchParams.set('lang', code);
  location.assign(url);
}

/* 读取并清除「重载前所在步骤」(仅 switchLocale 写入;非法值回退 0) */
export function consumeResumeStage(stageCount) {
  try {
    const v = sessionStorage.getItem(RESUME_KEY);
    if (v === null) return 0;
    sessionStorage.removeItem(RESUME_KEY);
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 && n < stageCount ? n : 0;
  } catch { return 0; }
}

/* 语言包字段读取(fail-fast):缺文案 = 启动即报错并指名道姓,与节点 gid 校验同一哲学 */
export function req(dict, key, where) {
  const v = dict[key];
  if (v === undefined) throw new Error(`[i18n:${LOCALE}] 缺少文案 ${where}「${key}」`);
  return v;
}
