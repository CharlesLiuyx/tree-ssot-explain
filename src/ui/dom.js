// DOM 助手:id 查找 + 组件模板挂载。

export const $ = id => document.getElementById(id);

/* 把 HTML 模板挂到 body,返回根元素(每个 UI 组件用它自建 DOM) */
export function mount(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  const el = tpl.content.firstElementChild;
  document.body.appendChild(el);
  return el;
}
