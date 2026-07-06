#!/usr/bin/env node
// Commit message 校验(零依赖),规则见 docs/COMMIT_CONVENTION.md。
// 用法:
//   node scripts/check-commit-msg.mjs <commit-msg-file>      # commit-msg 钩子调用
//   node scripts/check-commit-msg.mjs --message "feat: xxx"  # 提交前手动自查
import { readFileSync } from 'node:fs';

const TYPES = ['feat', 'fix', 'perf', 'refactor', 'docs', 'style', 'test', 'build', 'ci', 'chore', 'revert'];
const HEADER_MAX = 100;
const HEADER_RE = new RegExp(`^(${TYPES.join('|')})(\\([^()\\s]+\\))?!?: \\S`);
// 合并/回滚/rebase 临时提交由 git 生成,不做校验
const EXEMPT_RE = /^(Merge |Revert |fixup! |squash! )/;
const SCISSORS = '# ------------------------ >8 ------------------------';

const [, , arg, literal] = process.argv;
let raw;
if (arg === '--message' || arg === '-m') {
  raw = literal ?? '';
} else if (arg) {
  raw = readFileSync(arg, 'utf8');
} else {
  console.error('用法: node scripts/check-commit-msg.mjs <commit-msg-file> | --message "feat: xxx"');
  process.exit(2);
}

// 去掉 `git commit -v` 的 diff 部分与注释行
const scissorsAt = raw.indexOf(SCISSORS);
if (scissorsAt !== -1) raw = raw.slice(0, scissorsAt);
const lines = raw.replace(/\r\n/g, '\n').split('\n').filter((l) => !l.startsWith('#'));
while (lines.length && lines[0].trim() === '') lines.shift();
const header = (lines[0] ?? '').trimEnd();

if (EXEMPT_RE.test(header)) process.exit(0);

const problems = [];
if (!header) {
  problems.push('提交信息为空');
} else {
  if (!HEADER_RE.test(header)) {
    problems.push(
      `header 需形如 "type(scope): subject"(type 小写,冒号后接一个空格)\n` +
      `    可用 type: ${TYPES.join(' | ')}`
    );
  }
  if (/[.。]$/.test(header)) problems.push('subject 不以句号(。/.)结尾');
  if (header.length > HEADER_MAX) {
    problems.push(`header 过长(${header.length} > ${HEADER_MAX} 字符),多余内容放正文`);
  }
  if (lines.length > 1 && lines[1].trim() !== '') {
    problems.push('header 与正文之间需要空一行');
  }
}

if (problems.length === 0) process.exit(0);

console.error('✖ Commit message 不符合规范(docs/COMMIT_CONVENTION.md):\n');
console.error(`  > ${header || '(空)'}\n`);
for (const p of problems) console.error(`  - ${p}`);
console.error('\n  正确示例:');
console.error('    feat: 引力阶段扩充至 12 对并逐对点名轮播');
console.error('    perf(scene): 纠缠管道池就地重写顶点,迁移动画零 GC');
console.error('    docs: 补充部署门禁说明');
process.exit(1);
