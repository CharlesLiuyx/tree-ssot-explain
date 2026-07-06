# Commit Message 规范

本仓库遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)，
并按项目实际情况约定如下。`commit-msg` 钩子会自动校验（见文末「校验与钩子」）。

## 格式

```
type(scope): subject

（空行）
body —— 可选，写「为什么这么改」

（空行）
footer —— 可选，如 BREAKING CHANGE: / Co-Authored-By:
```

- `type` 必填，小写；`scope` 可选；`subject` 必填。
- Header（第一行）不超过 **100 字符**，建议 72 以内；再长的内容放 body。
- 有 body 时，header 与 body 之间必须空一行。

## type（必填）

| type | 用途 | 仓库真实示例 |
|---|---|---|
| `feat` | 新功能：新叙事步骤、新交互、新数据/视觉元素 | `feat: 引力阶段扩充至 12 对并逐对点名轮播` |
| `fix` | 修 bug（含视觉错误、交互失灵） | `fix(scene): 引力形变静止时节点未精确归位` |
| `perf` | 性能优化（不改可见行为） | `perf: 全链路渲染重构——实例化池 + 纠缠管道池` |
| `refactor` | 重构（不改行为、不提性能） | `refactor: 模块化拆分——数据/故事/场景/UI/编排五层分治` |
| `docs` | 文档：README / AGENTS / 注释 | `docs: add Cursor Cloud dev environment instructions` |
| `style` | 纯代码格式（空白、命名等，**不含** CSS 视觉改动） | `style: 统一 scene 层的常量命名` |
| `test` | 测试：冒烟/校验脚本的测试逻辑 | `test: 冒烟测试覆盖点击节点 Zoom in` |
| `build` | 构建：`scripts/build-embedded.mjs`、esbuild、依赖升级 | `build: esbuild 升级到 0.25` |
| `ci` | CI：`.github/workflows/` | `ci: 部署前增加产物冒烟门禁` |
| `chore` | 杂务：不影响源码与构建的维护性改动 | `chore: organize scripts and clean smoke artifacts` |
| `revert` | 回滚某次提交 | `revert: feat: 引力阶段扩充至 12 对` |

注意：改 `styles/*.css` 的**视觉调整**属于 `feat` 或 `fix`（用户可见），
`style` 仅指不影响行为的代码格式整理。

## scope（可选）

建议取代码分层或领域名，小写：
`data` / `story` / `scene` / `ui` / `app` / `core` / `config` / `styles` /
`scripts` / `ci` / `deps` / `pages`。

拿不准或跨多层时直接省略——本仓库历史提交大多不带 scope，这是可接受的默认。

## subject

- **中文为主**（与历史风格一致），英文亦可；一句话说清「做了什么」。
- 动词开头，不以句号（`。` / `.`）结尾。
- 多个并列改动用 `——` 或 `;` 连接（如
  `feat: 动效全面提速——切步 150ms 转场;交织案例进度条拖动+一键全展示`），
  更复杂的展开放 body。

## body 与 footer（可选）

- body 写「**为什么**」：动机、取舍、影响面；「怎么做」代码本身会说。
- 破坏性变更：header 的 type 后加 `!`（如 `feat!:`），并在 footer 写
  `BREAKING CHANGE: 说明`。本项目是纯前端单页，此类情况罕见（如叙事步骤编号变更、
  URL 结构变更）。

## 豁免

以下消息不做校验：

- `Merge ...`（合并提交）
- `Revert "..."`（git 自动生成的回滚）
- `fixup! ...` / `squash! ...`（rebase 用临时提交）

## 校验与钩子

- `pnpm install` 会通过 `package.json` 的 `prepare` 脚本把 `core.hooksPath`
  指到 `.githooks/`，自动启用 `commit-msg` 钩子（零依赖，仅需 Node）。
- 不合规的提交会被拦下，并打印具体问题与正确示例。
- 提交前手动自查：

```bash
node scripts/check-commit-msg.mjs --message "feat: 新增一棵横切树"
```
