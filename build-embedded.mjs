#!/usr/bin/env node
// 把 index.html 打包为单文件版本 index-embedded.html：
// 内联全部 three.js 依赖，零外部请求，可直接双击打开。
// 用法：node build-embedded.mjs （需要 node + npx，首次运行会自动拉取 esbuild）
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';

const SRC = 'index.html', OUT = 'index-embedded.html';
const ENTRY = '.build-entry.mjs', BUNDLE = '.build-bundle.js';

const html = readFileSync(SRC, 'utf8');

// 1. 抽出主模块代码，把 three/addons/ 导入改写为 vendor 相对路径
const modMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!modMatch) throw new Error('index.html 中找不到 <script type="module">');
writeFileSync(ENTRY, modMatch[1].replaceAll("'three/addons/", "'./vendor/"));

// 2. esbuild 打包（'three' 裸导入 alias 到 vendor 文件）
execSync(
  `npx -y esbuild ${ENTRY} --bundle --minify --format=iife` +
  ` --alias:three=./vendor/three.module.js --outfile=${BUNDLE}`,
  { stdio: 'inherit' }
);
let bundle = readFileSync(BUNDLE, 'utf8');
// 内联进 <script> 的防呆：转义可能提前终止脚本块的序列
bundle = bundle.replaceAll('</script', '<\\/script').replaceAll('<!--', '<\\!--');

// 3. 组装：去掉 importmap，用内联 bundle 替换模块脚本，调整加载提示文案
const out = html
  .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/, '')
  .replace(/<script type="module">[\s\S]*?<\/script>/, () => `<script>\n${bundle}</script>`)
  .replace('正在加载 3D 引擎…', '正在启动 3D 引擎…')
  .replace(/three\.js 加载失败[^']*/, '3D 引擎启动失败 —— 请换用现代浏览器（Chrome / Edge / Safari 最新版）');

writeFileSync(OUT, out);
rmSync(ENTRY); rmSync(BUNDLE);
console.log(`✓ ${OUT} 已生成（${(out.length / 1024).toFixed(0)} KB）`);
