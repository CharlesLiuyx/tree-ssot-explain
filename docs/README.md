# docs/ —— 规范与细则

渐进式披露的第二层：根目录的 [README.md](../README.md)（人）与
[AGENTS.md](../AGENTS.md)（AI agent）只保留工作所需的最小摘要，
完整规范收束在本目录，按需下钻。

| 文档 | 内容 | 什么时候读 |
|---|---|---|
| [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) | Commit message 完整规范：type 表、scope 约定、subject/body 规则、豁免与钩子原理 | 提交被 `commit-msg` 钩子拦下时；写不常见类型的提交（`revert` / `feat!` 破坏性变更）时 |

新增规范文档时：放本目录 + 在上表登记 + 在 README / AGENTS.md 的对应小节留一句摘要与链接。
