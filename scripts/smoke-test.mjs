#!/usr/bin/env node
// 冒烟测试:无头 Chrome 真实加载页面 → 等待 3D 引擎启动 → 用 ←/→ 走完全部叙事步骤,
// 全程收集 console 错误 / 页面异常 / 资源加载失败,并逐步截图;通过后清理截图,失败时保留。
// 把「人肉开浏览器点一遍」压缩成一条 30 秒内的命令,任何一步报错即退出码非零。
//
// 用法:pnpm run smoke              测源码版(内置静态服务器 + http)
//       pnpm run smoke:embedded    测单文件版(file:// 直开,与「双击打开」同路径;需先 pnpm run build)
// 依赖:系统已装 Chrome / Chromium(不额外下载浏览器);特殊路径用环境变量 CHROME_PATH 指定。

import { createServer } from 'node:http';
import { readFile, mkdir, rm, rmdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { DOT_NAMES } from '../src/story/stages.js';

const EMBEDDED = process.argv.includes('--embedded');
const MODE = EMBEDDED ? 'embedded' : 'source';
const ARTIFACT_ROOT = 'test-artifacts';
const SHOT_DIR = join(ARTIFACT_ROOT, MODE);
const BOOT_TIMEOUT = 30_000;   // 引擎启动上限(本地加载,通常 <2s)
const STAGE_TIMEOUT = 10_000;  // 单步切换上限(相机飞行 150ms,余量给慢机器)
const SETTLE_MS = 450;         // 切步后的动效沉降时间,再截图

/* ---------- 定位系统 Chrome(不下载浏览器,puppeteer-core 只当遥控器) ---------- */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/local/bin/google-chrome',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  const hit = candidates.find(existsSync);
  if (!hit) throw new Error('未找到 Chrome/Chromium —— 请安装,或用环境变量 CHROME_PATH 指定可执行文件路径');
  return hit;
}

/* ---------- 内置静态服务器(源码版专用;零依赖,只认本仓库会出现的文件类型) ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};
function serveStatic(rootDir) {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path === '/favicon.ico') { res.writeHead(204).end(); return; } // 仓库无 favicon,204 免得刷 404 噪音
      const file = join(rootDir, path === '/' ? 'index.html' : path);
      if (!resolve(file).startsWith(resolve(rootDir))) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server)));
}

/* ---------- 主流程 ---------- */
const t0 = performance.now();
const errors = [];     // 所有异常渠道汇总:console.error / 未捕获异常 / 请求失败 / 页内收集器
const note = msg => console.log(`  ${msg}`);
const elapsed = () => `${((performance.now() - t0) / 1000).toFixed(1)}s`;

if (EMBEDDED && !existsSync('index-embedded.html')) {
  console.error('✗ 未找到 index-embedded.html —— 请先 pnpm run build');
  process.exit(1);
}

let server = null, url;
if (EMBEDDED) {
  url = 'file://' + resolve('index-embedded.html'); // 与用户「双击打开」走同一条路径
} else {
  server = await serveStatic(process.cwd());
  url = `http://127.0.0.1:${server.address().port}/`;
}
console.log(`冒烟测试[${MODE}] → ${url}`);

await mkdir(SHOT_DIR, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: [
    '--no-sandbox',                 // 容器 / root 环境下无沙箱可用;只加载本地可信页面
    '--disable-dev-shm-usage',      // CI 的 /dev/shm 常太小,避免渲染进程崩溃
    '--enable-unsafe-swiftshader',  // 无 GPU 时允许软件 WebGL(Chrome 128+ 需显式开启)
    '--hide-scrollbars',
  ],
  defaultViewport: { width: 1440, height: 900 },
});

try {
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`未捕获异常: ${e.message}`));
  page.on('requestfailed', r => {
    if (!r.url().endsWith('/favicon.ico')) errors.push(`请求失败: ${r.url()} (${r.failure()?.errorText})`);
  });

  // 1. 启动:等 main.js 跑完最后一行(window.__booted = true)
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction('window.__booted === true', { timeout: BOOT_TIMEOUT });
  } catch {
    const boot = await page.evaluate(() => document.getElementById('boot')?.textContent ?? '(boot 提示已移除)');
    errors.push(`引擎 ${BOOT_TIMEOUT / 1000}s 内未启动;页面提示:${boot}`);
    throw new Error('boot 超时');
  }
  note(`✓ 引擎启动(${elapsed()})`);

  // 2. 叙事回归:→ 走完全部步骤,每步等导航点亮起 + 校验步骤名,沉降后截图
  const dotName = i => page.$eval(`#dots .dot:nth-child(${i + 1})`, el => el.textContent);
  for (let i = 0; i < DOT_NAMES.length; i++) {
    if (i > 0) await page.keyboard.press('ArrowRight');
    await page.waitForFunction(
      j => document.querySelectorAll('#dots .dot')[j]?.classList.contains('cur'),
      { timeout: STAGE_TIMEOUT }, i,
    ).catch(() => { throw new Error(`STEP ${i} 未在 ${STAGE_TIMEOUT / 1000}s 内激活`); });
    if (await dotName(i) !== DOT_NAMES[i]) throw new Error(`STEP ${i} 导航名不符:期望「${DOT_NAMES[i]}」`);
    await new Promise(ok => setTimeout(ok, SETTLE_MS));
    await page.screenshot({ path: join(SHOT_DIR, `stage-${i}.png`) });
    note(`✓ STEP ${i} ${DOT_NAMES[i]}`);
  }

  // 3. 反向切步也走一次(← 与 → 共用调度但方向分支不同)
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(
    j => document.querySelectorAll('#dots .dot')[j]?.classList.contains('cur'),
    { timeout: STAGE_TIMEOUT }, DOT_NAMES.length - 2,
  );
  note('✓ ← 反向切步');

  // 4. 终判:页内错误收集器(index.html 里的 window.__errs)+ 本脚本收集的所有渠道
  const pageErrs = await page.evaluate(() => window.__errs ?? []);
  errors.push(...pageErrs.map(e => `页内收集器: ${e}`));
  if (errors.length) throw new Error('捕获到运行错误');

  await rm(SHOT_DIR, { recursive: true, force: true });
  await rmdir(ARTIFACT_ROOT).catch(() => {});
  console.log(`✓ 冒烟通过[${MODE}]:启动 + ${DOT_NAMES.length} 步叙事 + 反向切步,零错误(${elapsed()});截图已清理`);
} catch (e) {
  console.error(`✗ 冒烟失败[${MODE}]:${e.message}(${elapsed()})`);
  for (const err of errors) console.error('  · ' + err);
  console.error(`  · 失败截图保留在:${SHOT_DIR}/`);
  process.exitCode = 1;
} finally {
  await browser.close();
  server?.close();
}
