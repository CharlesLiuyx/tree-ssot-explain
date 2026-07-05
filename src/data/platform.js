// 平台树(纯数据):「平台化」策略把横切能力抽成的独立服务。
// key 与 tangles.js 里每条交织的 platform 字段对应——平台化后交织改挂到对应服务上。

export const PLATFORM_NODES = { authz: '权限服务', gate: '门控服务', audit: '审计服务', infra: '基础设施' };
