# C 端需求细化交付

2026-10-05：当前覆盖 37 个 C 端注册页面标识，PC 30 个、移动端 32 个独立评审入口；入口数不含同页标签、弹层样本与通用反馈。8 组公共规则、B/C 联动清单及待明确条件共同作为设计研发输入。未修改真实 B/C 系统或执行生产写入。

- 当前一致性核对与完整改动页清单：[consistency-final-review.md](consistency-final-review.md)。
- 产品交接主表：`alignment-review.md`，按模块列规则、双端承载、待验收项、阻塞范围与验收条件，并补同页标签和弹层。
- 页面注册对照：`device-coverage.md`，仅证明正文存在与默认路由；构建、加载检查及旧资料修正归档在 `alignment-evidence-20261005.md`。
- 决策执行拆分：`decisions.md`，保留父编号并细化问题、推荐、责任与通过条件；业务规则以各组已确认决定为准，余项为研发映射与验收核对。

- 完整交接正文：`AI666_C端产品需求_设计研发版.md`。
- 阅读台维护源：上级 `page-requirements-c.json`；公共源 `common-rules.md`；待明确源 `decisions.md`。
- B 端设计输入：`b-c-linkage.md`。这是配置、状态和用户结果的依赖表，不代表 31 个 B 端页面已完成逐页设计。
- 依据索引：`content-evidence.md`、`action-evidence.md`；独立复核：`independent-review.md`。
- 验证：`verification.json`；PC 和手机所选页面排版分别见 `requirements-pc.png`、`requirements-mobile.png`。

页面正文用字段表、动作或状态表和逐条验收表达。待明确条件保留具体问题与影响，不以旧代码默认值或模拟数据代替产品决定。原型仍可用代表样本演示，未接入生产不是原型缺陷。

## 维护

修改阅读台页面 JSON、公共规则或待明确项后，在 Site 根目录运行：

```text
node design-notes/c-requirements-20261005/sync-delivery.mjs
node scripts/validate-page-requirements.mjs
```

同步脚本默认以当前阅读台 JSON 为源，生成完整交付文档及公共展示 JSON。`--merge` 仅用于本次分工稿首次整合，后续不要使用，否则会覆盖更新后的页面正文。`content-pages.json`、`action-pages.json` 是分工快照，后续不作为日常维护源。`sync-plans.mjs` 是本次已执行的旧方案纠偏脚本，不应例行重跑。

## 验证范围

初次细化时的 36 页、86 个全阅读台注册项和浏览器样本证据保留在 `verification.json`，属于历史快照。新增独立查看结果页后，当前是 37 个 C 端标识、全阅读台 87 个注册项；本轮重新生成的覆盖结果见 `device-coverage.json`，本轮检查范围见 `alignment-review.md`。历史截图不作为当前全量页面验收证明。

生产接口、真实结算和全部业务运行不在原型验收结论中。上线前仍需完成研发映射与真实服务验收，并据本稿另行完成设计和研发验收。
