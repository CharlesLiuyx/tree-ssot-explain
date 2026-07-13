// 法则卡片(STEP 8,结构):每条法则 = 一张带图示的卡片 + 场景里的一处「活现场」。
// 字段:k 法则键(scene/law-fx.js 的聚光集合按它取元素)、svg 内联图示、cam [[相机位置],[目标点]]。
// name/gist/scene 文案与 svg 里的文字标签在 src/i18n/locales/<语言>/laws.js,按当前语言合并。
// 机位按终态场景取景(STEP 8 全策略开启:树已分层排布、平台树在 (0,0,-52)、幽灵根已收编)。

import { L, req } from '../i18n/index.js';

const C = { gold: '#ffd166', red: '#ff4d6d', green: '#5dd39e', mg: '#ff2fd0', ghost: '#7de8ff', sub: '#93a0b8', biz: '#d9e650', teal: '#3ad6c5', txt: '#dfe6f3' };
const T = L.lawsSvg; // 图示文字标签(text-anchor=middle,各语言给短词即可)

export const LAWS = [
  {k: 'roots',
   cam: [[-71, 36, 64], [-72, 12, 8]],
   svg: `<svg viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path d="M44 25 L20 50 M44 25 L44 55 M44 25 L68 50" stroke="${C.biz}" stroke-width="1.6" opacity=".5"/>
     <circle cx="44" cy="17" r="7.5" fill="${C.gold}" opacity=".95"/>
     <circle cx="44" cy="17" r="12.5" stroke="${C.gold}" stroke-width="1.4" stroke-dasharray="3.5 3" opacity=".8"/>
     <text x="70" y="14" font-size="10" fill="${C.gold}" font-weight="700" text-anchor="middle">${T.human}</text>
     <path d="M63 17 L57 19" stroke="${C.gold}" stroke-width="1.2" opacity=".6"/>
     <circle cx="20" cy="52" r="4.5" fill="${C.biz}" opacity=".75"/>
     <circle cx="44" cy="57" r="4.5" fill="${C.biz}" opacity=".75"/>
     <circle cx="68" cy="52" r="4.5" fill="${C.biz}" opacity=".75"/>
     <circle cx="35" cy="35" r="2.4" fill="${C.gold}"/>
     <circle cx="53" cy="42" r="2" fill="${C.gold}" opacity=".7"/>
   </svg>`},
  {k: 'leaves',
   cam: [[-46, 16, 46], [-64, 4, 12]],
   svg: `<svg viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="48" cy="10" r="4" fill="${C.gold}" opacity=".85"/>
     <path d="M48 14 L20 44 M48 14 L48 48 M48 14 L76 44" stroke="${C.biz}" stroke-width="1.4" opacity=".35"/>
     <text x="41" y="36" font-size="10.5" fill="${C.green}" font-weight="700">AI</text>
     <circle cx="20" cy="50" r="5.5" fill="${C.green}" fill-opacity=".25" stroke="${C.green}" stroke-width="1.4"/>
     <circle cx="48" cy="55" r="5.5" fill="${C.green}" fill-opacity=".25" stroke="${C.green}" stroke-width="1.4"/>
     <circle cx="76" cy="50" r="5.5" fill="${C.green}" fill-opacity=".25" stroke="${C.green}" stroke-width="1.4"/>
     <circle cx="20" cy="50" r="9.5" stroke="${C.green}" stroke-width="1.1" stroke-dasharray="2.5 3" opacity=".6"/>
     <circle cx="48" cy="55" r="9.5" stroke="${C.green}" stroke-width="1.1" stroke-dasharray="2.5 3" opacity=".6"/>
     <circle cx="76" cy="50" r="9.5" stroke="${C.green}" stroke-width="1.1" stroke-dasharray="2.5 3" opacity=".6"/>
   </svg>`},
  {k: 'coupling',
   cam: [[-64, 30, 78], [-74, 8, 6]],
   svg: `<svg viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="13" cy="17" r="5" stroke="${C.red}" stroke-width="1.4" fill="${C.red}" fill-opacity=".18"/>
     <circle cx="35" cy="51" r="5" stroke="${C.red}" stroke-width="1.4" fill="${C.red}" fill-opacity=".18"/>
     <path d="M16 21 L22 28 L18 34 L26 41 L31 47" stroke="${C.red}" stroke-width="1.4" opacity=".85"/>
     <path d="M14 38 L26 33 M14 30 L26 35" stroke="${C.txt}" stroke-width="1.6" opacity=".8"/>
     <text x="31" y="66" font-size="9" fill="${C.sub}" text-anchor="middle">${T.resolve}</text>
     <path d="M48 6 V66" stroke="${C.sub}" stroke-width="1" stroke-dasharray="3 4" opacity=".45"/>
     <ellipse cx="73" cy="33" rx="18" ry="13" stroke="${C.gold}" stroke-width="1.5" stroke-dasharray="4 3" opacity=".95"/>
     <circle cx="66" cy="33" r="5" fill="${C.mg}" opacity=".9"/>
     <circle cx="80" cy="33" r="5" fill="${C.mg}" opacity=".9"/>
     <path d="M66 33 L80 33" stroke="${C.mg}" stroke-width="3" opacity=".85"/>
     <text x="73" y="66" font-size="9" fill="${C.gold}" text-anchor="middle">${T.fusion}</text>
   </svg>`},
  {k: 'explicit',
   cam: [[-52, 52, 96], [-30, 10, -14]],
   svg: `<svg viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="36" cy="40" r="25" stroke="${C.ghost}" stroke-width="1.4" stroke-dasharray="5 4" opacity=".8"/>
     <circle cx="30" cy="46" r="4.5" fill="#5b8cff" opacity=".9"/>
     <text x="70" y="17" font-size="12">👻</text>
     <path d="M72 21 L38 42" stroke="${C.ghost}" stroke-width="1.2" stroke-dasharray="2.5 3" opacity=".65"/>
     <path d="M78 26 Q70 42 56 50" stroke="${C.gold}" stroke-width="1.5" opacity=".9"/>
     <path d="M60 45 L56 50 L62 52" stroke="${C.gold}" stroke-width="1.5" opacity=".9"/>
     <circle cx="48" cy="52" r="4.5" fill="${C.gold}" opacity=".95"/>
     <path d="M48 52 L34 46" stroke="${C.gold}" stroke-width="1.6" opacity=".9"/>
   </svg>`},
  {k: 'govern',
   cam: [[0, 148, 92], [0, 0, -20]],
   svg: `<svg viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="48" cy="38" r="26" stroke="${C.teal}" stroke-width="1.4" opacity=".55"/>
     <path d="M48 38 L48 12 A26 26 0 0 1 70 24 Z" fill="${C.teal}" opacity=".25"/>
     <path d="M48 38 L48 12" stroke="${C.teal}" stroke-width="1.4" opacity=".85"/>
     <circle cx="33" cy="27" r="3" fill="${C.red}" opacity=".9"/>
     <circle cx="28" cy="45" r="3" fill="${C.red}" opacity=".9"/>
     <circle cx="41" cy="55" r="3" fill="${C.red}" opacity=".9"/>
     <circle cx="62" cy="49" r="3" fill="${C.sub}" opacity=".6"/>
     <circle cx="66" cy="32" r="3" fill="${C.sub}" opacity=".6"/>
     <path d="M80 12 A34 34 0 0 1 90 40" stroke="${C.gold}" stroke-width="1.4" opacity=".75"/>
     <path d="M86 35 L90 40 L92 33" stroke="${C.gold}" stroke-width="1.4" opacity=".85"/>
   </svg>`},
];

/* 文案水合:name/gist/scene 来自当前语言包(键 = k) */
for (const l of LAWS) Object.assign(l, req(L.laws, l.k, 'laws'));
