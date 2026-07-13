// 平台树(纯结构):「平台化」策略把横切能力抽成的独立服务。
// key 与 tangles.js 里每条交织的 platform 字段对应——平台化后交织改挂到对应服务上。
// 服务名称在 src/i18n/locales/<语言>/strategies.js 的 platform 表里。

import { L, req } from '../i18n/index.js';

export const PLATFORM_NODES = {};
for (const k of ['authz', 'gate', 'audit', 'infra']) PLATFORM_NODES[k] = req(L.platform, k, 'platform');
