#!/usr/bin/env node
// 把模块化源码打包为单文件版本 index-embedded.html:
// 内联全部 CSS(styles/)与 JS(src/ + vendor/ 的 three.js),零外部请求,可直接双击打开。
// 用法:pnpm install 一次,之后 pnpm run build(或 node scripts/build-embedded.mjs)
// 校验:pnpm run check(即 --check)只走打包解析不写产物 —— 0.2 秒内抓出
//       语法错误 / import 路径写错 / 样式链接失效,适合改完代码立刻跑。
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CHECK = process.argv.includes('--check');
const OUT = 'index-embedded.html';

let esbuild;
try {
  esbuild = await import('esbuild');
} catch {
  console.error('未找到 esbuild —— 请先运行 pnpm install(esbuild 已锁定在 package.json 的 devDependencies)');
  process.exit(1);
}

// three.js 裸导入解析到本地 vendor/(与 index.html 的 importmap 一一对应)
const vendorPlugin = {
  name: 'vendor-three',
  setup(build) {
    build.onResolve({ filter: /^three$/ }, () => ({ path: resolve('vendor/three.module.js') }));
    build.onResolve({ filter: /^three\/addons\// }, args => ({
      path: resolve('vendor', args.path.slice('three/addons/'.length)),
    }));
  },
};

// 1. 打包 src/main.js(含 vendor 依赖)为 IIFE;--check 时跳过 minify(校验用不上,省一半时间)
let result;
try {
  result = await esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    minify: !CHECK,
    format: 'iife',
    write: false,
    plugins: [vendorPlugin],
  });
} catch {
  // esbuild 已按 logLevel 打印出带源码位置的错误,这里不再重复堆栈
  console.error(`✗ ${CHECK ? '静态校验失败' : '构建失败'}(见上方 esbuild 错误)`);
  process.exit(1);
}
let bundle = result.outputFiles[0].text;
// 内联进 <script> 的防呆:转义可能提前终止脚本块的序列
bundle = bundle.replaceAll('</script', '<\\/script').replaceAll('<!--', '<\\!--');

// 2. 收集并内联全部组件样式(按 index.html 里 <link> 的出现顺序)
const html = readFileSync('index.html', 'utf8');
const cssLinks = [...html.matchAll(/<link rel="stylesheet" href="\.\/(styles\/[^"]+)">\s*/g)];
if (!cssLinks.length) throw new Error('index.html 中找不到 styles/ 样式链接');
const css = cssLinks.map(m => `/* === ${m[1]} === */\n` + readFileSync(m[1], 'utf8')).join('\n');

// --check 到此为止:import 图、语法、样式链接都已验证,不写产物
if (CHECK) {
  console.log(`✓ 静态校验通过(${cssLinks.length} 个样式 + src/ 打包解析,无语法/导入错误)`);
  process.exit(0);
}

// 3. 组装:样式内联、去掉 importmap、模块入口替换为内联 bundle、调整加载提示文案
let out = html;
for (const m of cssLinks) out = out.replace(m[0], '');
out = out
  .replace('</head>', `<style>\n${css}</style>\n</head>`)
  .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/, '')
  .replace(/<script type="module" src="\.\/src\/main\.js"><\/script>/, () => `<script>\n${bundle}</script>`)
  .replace('正在加载 3D 引擎…', '正在启动 3D 引擎…')
  .replace(/three\.js 加载失败[^']*/, '3D 引擎启动失败 —— 请换用现代浏览器（Chrome / Edge / Safari 最新版）');

writeFileSync(OUT, out);
console.log(`✓ ${OUT} 已生成（${(out.length / 1024).toFixed(0)} KB）`);
