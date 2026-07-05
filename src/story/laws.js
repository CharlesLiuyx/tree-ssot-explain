// 法则卡片(STEP 8,纯文案+机位):每条法则 = 一张带图示的卡片 + 场景里的一处「活现场」。
// 字段:k 法则键(scene/law-fx.js 的聚光集合按它取元素)、name 法则名、svg 内联图示、
//       gist 一句话正文、scene 点击后镜头所指现场的解说、cam [[相机位置],[目标点]]。
// 机位按终态场景取景(STEP 8 全策略开启:树已分层排布、平台树在 (0,0,-52)、幽灵根已收编)。

const C = { gold: '#ffd166', red: '#ff4d6d', green: '#5dd39e', mg: '#ff2fd0', ghost: '#7de8ff', sub: '#93a0b8', biz: '#d9e650', teal: '#3ad6c5', txt: '#dfe6f3' };

export const LAWS = [
  {k: 'roots', name: '人守根',
   gist: '每棵树的 SSOT、spec、平台接口，必须有人守着——这是不能让 AI 随便写的部分。',
   scene: '金色的根裹着自旋描边、由人把守；金色 spec 脉冲正自根流向全树（SDD）——每个节点的含义都能顺着根推导出来。全部 16 个根正在同时亮起。',
   cam: [[-71, 36, 64], [-72, 12, 8]],
   svg: `<svg viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path d="M44 25 L20 50 M44 25 L44 55 M44 25 L68 50" stroke="${C.biz}" stroke-width="1.6" opacity=".5"/>
     <circle cx="44" cy="17" r="7.5" fill="${C.gold}" opacity=".95"/>
     <circle cx="44" cy="17" r="12.5" stroke="${C.gold}" stroke-width="1.4" stroke-dasharray="3.5 3" opacity=".8"/>
     <text x="64" y="14" font-size="11" fill="${C.gold}" font-weight="700">人</text>
     <path d="M63 17 L57 19" stroke="${C.gold}" stroke-width="1.2" opacity=".6"/>
     <circle cx="20" cy="52" r="4.5" fill="${C.biz}" opacity=".75"/>
     <circle cx="44" cy="57" r="4.5" fill="${C.biz}" opacity=".75"/>
     <circle cx="68" cy="52" r="4.5" fill="${C.biz}" opacity=".75"/>
     <circle cx="35" cy="35" r="2.4" fill="${C.gold}"/>
     <circle cx="53" cy="42" r="2" fill="${C.gold}" opacity=".7"/>
   </svg>`},
  {k: 'leaves', name: 'AI 写叶',
   gist: '叶子只要保持单义——有测试锚定、不越层、含义能从根推导——就是可以放心交给 AI 的自由区。',
   scene: '绿描边的叶子裹着旋转的测试护壳（TDD）——AI 在这里放手写，写错也伤不到根。134 片叶子正在同时亮起：这就是自由区的面积。',
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
  {k: 'coupling', name: '分清两种耦合',
   gist: '<span class="r">偶然交织</span>，动手消解（平台化、分层、限速）；<span class="mg">本征引力</span>，坦然<span class="g">共域</span>——同一个模块、一起设计、同一个 owner。',
   scene: '琥珀色契约线穿墙走接口环——偶然的已被消解；金色气泡裹着 12 对引力节点——本征的合法同居。正在亮起的洋红节点，就是那些「距离本来就不存在」的对。',
   cam: [[-64, 30, 78], [-74, 8, 6]],
   svg: `<svg viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="13" cy="17" r="5" stroke="${C.red}" stroke-width="1.4" fill="${C.red}" fill-opacity=".18"/>
     <circle cx="35" cy="51" r="5" stroke="${C.red}" stroke-width="1.4" fill="${C.red}" fill-opacity=".18"/>
     <path d="M16 21 L22 28 L18 34 L26 41 L31 47" stroke="${C.red}" stroke-width="1.4" opacity=".85"/>
     <path d="M14 38 L26 33 M14 30 L26 35" stroke="${C.txt}" stroke-width="1.6" opacity=".8"/>
     <text x="27" y="66" font-size="9" fill="${C.sub}">消解</text>
     <path d="M48 6 V66" stroke="${C.sub}" stroke-width="1" stroke-dasharray="3 4" opacity=".45"/>
     <ellipse cx="73" cy="33" rx="18" ry="13" stroke="${C.gold}" stroke-width="1.5" stroke-dasharray="4 3" opacity=".95"/>
     <circle cx="66" cy="33" r="5" fill="${C.mg}" opacity=".9"/>
     <circle cx="80" cy="33" r="5" fill="${C.mg}" opacity=".9"/>
     <path d="M66 33 L80 33" stroke="${C.mg}" stroke-width="3" opacity=".85"/>
     <text x="64" y="66" font-size="9" fill="${C.gold}">共域</text>
   </svg>`},
  {k: 'explicit', name: '让真相住在图内',
   gist: '凡是 AI 读遍代码也答不出的问题（运行时装配、订阅关系、旧文件、环境配置），都要<span class="gh">显式化</span>收编回仓库——否则 AI 会把文本改「对」，把世界改坏。',
   scene: '四个幽灵根已被收编进仓库边界——虚线变金色实线、青转金，被牵住的节点不再闪烁。正在亮起的，就是那些真相曾经漂在图外的节点。',
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
  {k: 'govern', name: '持续治理交织',
   gist: '显式化、限速、分区、定期清理——但别把力气浪费在拆那些本来就拆不开的东西上。',
   scene: '青色雷达持续扫过森林、轮末清理；全部纠缠已改道金色平台路由，平台树的服务节点正在亮起——新交织的增速被压在 attention 预算之内。',
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
