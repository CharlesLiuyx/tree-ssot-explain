// 术语标注:扫描容器内文本节点,把 story/terms.js 里登记的词包成 .term(悬停出解释,见 tooltip.js)。

import { TERMS } from '../story/terms.js';

const TERM_RE = (() => {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keys = Object.keys(TERMS).sort((a, b) => b.length - a.length);
  return new RegExp(keys.map(k => (/^[A-Za-z]/.test(k) ? '\\b' : '') + esc(k) + (/[A-Za-z]$/.test(k) ? '\\b' : '')).join('|'), 'g');
})();

export function annotateTerms(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const texts = [];
  while (walker.nextNode()) {
    const nd = walker.currentNode;
    if (nd.parentNode && nd.parentNode.closest && nd.parentNode.closest('.term')) continue;
    texts.push(nd);
  }
  for (const nd of texts) {
    const s = nd.nodeValue; TERM_RE.lastIndex = 0;
    let m, last = 0, frag = null;
    while ((m = TERM_RE.exec(s))) {
      frag = frag || document.createDocumentFragment();
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      const sp = document.createElement('span');
      sp.className = 'term'; sp.textContent = m[0];
      frag.appendChild(sp);
      last = m.index + m[0].length;
    }
    if (frag) {
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      nd.parentNode.replaceChild(frag, nd);
    }
  }
}
