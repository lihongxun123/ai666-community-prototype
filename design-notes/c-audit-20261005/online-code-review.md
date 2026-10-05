# 真实 C 端源码与原型业务边界审查

日期：2026-10-05。结论：未发现需要把当前原型退回旧站设计的依据。主要需要统一两处低优先展示口径，确认积分到期与账号互通的产品承接；真实开发另需核对兑换、生成超时和绑定验证。原型演示完成即自动发奖、固定金额、虚构内容及本地模拟流程本身不算缺陷。

本次仅检查本地源码，没有访问生产页面、请求接口或触发账号操作。真实仓库 `F:/客户资料/AIGC-社区/ai666-user` 的 HEAD 为 `3b67c50`；原型 Site HEAD 为 `78740c9`，证据以本次读取的工作树文件为准，不能据此声称这些代码已部署。运行时没有提供可独立核验的代理实际模型标识，本次沿用复用代理。未读取环境配置、凭据或真实私人数据。

下文真实仓库路径以 `ai666-user/` 开头；原型路径以 `site/` 开头，分别相对上述仓库及本报告所在 Site 根目录。行号是本次读取位置。

## 需修正：低优先展示口径

### 1. PC 积分把未知待到账展示为零，两端口径不同

- 证据：`site/app/community-options/c-prototype/personal.tsx:1233` 的 PC 概览固定展示“待到账 0”；同文件 `:1238` 手机显示“—”。`site/design-notes/page-requirements-c.json:30` 的积分需求明确“待到账未返回时显示未知，不推算承诺”。
- 影响：固定“0”既可能是演示中明确没有待到账的合法样本，也可能被理解成未知默认值，两端缺少解释。
- 建议：保留纯演示范围，明确 PC 的零是样本事实，或者统一为“—”；不要求接入真实账务。今日与近七日统计当前仅计算模拟签到记录，而 PC 最近流水另包含活动、邀请等固定示例，正式研发需按需求统计完整已到账流水，不照搬演示算法。

### 2. 通用任务模板的“已完成”和“积分已发放”需避免成为默认等价口径

- 证据：`site/app/community-options/c-prototype/activity-detail.tsx:29` 对已完成任务同时显示“积分已发放”。国庆任务 `site/app/community-options/c-prototype/retained-activities.tsx:283`、`:284` 是固定完成样本；作为完成且发奖成功的演示，这样展示成立。
- 边界：`site/design-notes/page-requirements-c.json:29` 明确完成、资格和发奖以服务端为准，不能仅凭进度满值推断到账；B 端 `site/app/community-options/b-prototype/retained-event-config.tsx:12` 同时允许 realtime、deferred、manual 发奖方式。
- 建议：低优先统一走查说明——当前已完成卡片演示的是“完成并已确认自动发放”，通用研发规则不能从“已完成”推导“已到账”。不要求原型增加结算字段、生产状态机或新中间页面。

## 待决策：保留什么业务，不是复刻旧 UI

### 3. 当前积分是否仍有有效期，用户在哪里获知

- 真实代码证据：`ai666-user/src/api/services/user.js:119`、`:129` 分别定义限时积分流水与即将到期查询。`ai666-user/src/components/ui/pointsExpiringTip/usePointsExpiringTip.js:72` 根据 `has_expiring` 读取积分与天数；`ai666-user/src/components/ui/pointsExpiringTip/PointsExpiringTip.vue:39` 展示到期提示，PC 顶栏 `ai666-user/src/layouts/pc/layoutNav.vue:92` 承载该提醒。
- 原型证据：`site/design-notes/page-requirements-c.json:30` 的积分页包含余额、已到账与占用说明，但未定义积分到期信息；`site/app/community-options/c-prototype/personal.tsx:1224` 起的积分视图也没有对应展示。
- 待决定：新版本是否继续保留限时积分。若保留，补充一个可感知的到期说明及查明细入口即可，承载位置可重新设计，不要求复制原 PC 悬浮提示。仅凭本地源码不能确认当前线上金额、期限或到期计划。

### 4. 社区到 MakeNow 使用入口是否继承现有账号互通

- 真实代码证据：`ai666-user/src/api/services/auth.js:50` 定义账户互通跳转查询，`:58` 定义票据登录；`ai666-user/src/utils/platformHandoff.js:59` 请求目标平台跳转链接。`ai666-user/src/router/index.js:15` 注册 `/landing/platform-handoff`，其页面显示账号连接结果。
- 原型证据：`site/app/community-options/c-prototype/app-desktop.tsx:10` 对应用样本直接跳往 MakeNow 公开入口；`site/design-notes/page-requirements-c.json:6` 没有承诺自动选中能力、素材传递或回传。这一边界正确。
- 待决定：应用 CTA 是普通外链，还是需要继承现有账号互通。先明确是否承诺同账号继续，再选择入口合同；账号互通不等于素材传递、结果回传或积分互通。无需在原型中实现真实票据或授权。

## 仅研发落实：现有源码不能充当新需求的实现证明

### 5. 兑换的未知结果处理与报价校验

原型需求 `site/design-notes/page-requirements-c.json:33`、`:34` 已明确最新报价、库存、资格和未知结果先查记录，不需新增原型页面。真实移动端 `ai666-user/src/view/official/list/data/useOfficialMallMobile.js:36` 将不可解析价格归零；`:172` 起兑换直接提交商品标识，异常仅清除 submitting，未单独呈现待确认结果。接口封装 `ai666-user/src/api/services/official.js:11` 只声明兑换请求，不能证明后端是否已有幂等、库存或结算保护。

正式开发应保留新需求中的正确规则，核对报价缺失和超时后的恢复；不把现有实现当成产品要求，不声称生产实际会重复扣费，也不将原型没有真实幂等视为缺陷。

### 6. 生成超时不等于服务端确认失败或退费

真实队列 `ai666-user/src/components/mod/ModAigcGenerate/data/shared/useAigcGenerateQueue.js:113` 将轮询次数用尽的本地结果标为 FAILED，但文案让用户稍后查历史。该代码不能证明生成已结束，更不能证明已退积分。原型 `site/design-notes/page-requirements-c.json:19` 要求按模型能力与真实接入确定任务结果，积分为演示报价；当前模拟失败退款可作为明确失败样本保留。

正式开发核对服务端终态、超时未知和结算语义即可，不要求原型复制真实队列或补完生产故障恢复。

### 7. 登录、邀请绑定和账号解绑保留新安全规则

- 已存在的真实入口：手机号与微信登录均支持 invite_code（`ai666-user/src/api/services/auth.js:10`、`:28`）；独立邀请绑定接口在 `ai666-user/src/api/services/activity.js:65`。
- 真实本地手机号解绑：`ai666-user/src/view/personalCenter/personalProfile/personalProfileComponents/PhoneUnBind.vue:217` 提交 phone，下一行的验证码提交被注释。仅能确认前端 payload 缺验证码，不能推断服务端没有其他校验或当前线上可越权解绑。
- 新原型需求 `site/design-notes/page-requirements-c.json:25` 要求更换验证、占用不覆盖、唯一登录方式保护及另一种已绑定方式核验；这些应保留，不能因为旧源码不同而退回旧行为。`:26` 的登录需求已将邀请绑定服务规则列为待明确。
- 正式开发核对邀请绑定资格、已绑定不可改绑及账户服务验证合同。本地演示短信、二维码和绑定成功反馈不作为实现缺陷；不需要它执行真实身份验证。

## 已确认保持的业务边界

- 社区内 AIGC 生成与应用跳到 MakeNow 是两条路径。真实代码有 `/api/aigc/generate`（`ai666-user/src/api/services/aigc.js:43`），所以“MakeNow 承载应用执行”不应被扩大解释为社区自己的图片、剧本、视频生成全部取消。
- 生成成功不自动公开。真实发布单独调用 publishWorkApi，保留 generation_no 与活动字段（`ai666-user/src/components/mod/ModWorkEdit/data/useWorkEdit.js:236`、`:271`）；原型创建、结果预览、作品编辑也分开，方向一致。
- 直接发布和生成结果发布为独立入口（`ai666-user/src/router/localRoute.js:184`、`:200`），原型创作入口保留两种选择；不必照搬旧字段或 UI。
- 连续创作挑战的今日进度读取 participation.today_generation_done / today_publish_done，而不是通用任务总进度（`ai666-user/src/view/activity/detail/data/activityParticipationState.js:113`）。国庆任务按固定日期开放、七日成长按参与阶段解锁，是不同机制，不能互相套用。
- 官方应用与教程维护、作者仅作品帖子、资源合并应用是当前已确认新版决定；旧路由与旧作者栏目不构成恢复旧能力的依据。

## 供主代理浏览核查的公开路由

域名来自 `ai666-user/src/utils/seo.js:4`，路径来自 `ai666-user/src/router/localRoute.js`。以下仅为源码定义的 URL，未确认生产已部署、接口可用或访客可访问；个人、兑换、任务页面可能要求登录，浏览时不执行真实动作。

| 页面 | 源码 URL | 证据 |
|---|---|---|
| 首页 | https://www.ai666.net/home/homeIndex | localRoute.js:60 |
| 移动社区 | https://www.ai666.net/community/communityIndex | :76；源码注释 tab 为 recommend / aigc / flash / tutorial |
| 闪念发现 | https://www.ai666.net/idea/post/postIndex | :147 |
| AIGC 创作 | https://www.ai666.net/aigc/create/createIndex | :169 |
| 直接发布 | https://www.ai666.net/works/publish | :184 |
| AI 商城 | https://www.ai666.net/official/list/listIndex | :227 |
| 兑换记录 | https://www.ai666.net/official/records/recordsIndex | :236 |
| 官方教程 | https://www.ai666.net/tutorial/discover/discoverIndex | :263 |
| 活动中心 | https://www.ai666.net/activity/list/listIndex | :295 |
| 我的投稿 | https://www.ai666.net/activity/submissions/mine | :327 |
| 邀请有礼 | https://www.ai666.net/invite/detail/detailIndex | :365 |
| 积分中心 | https://www.ai666.net/points/detail/detailIndex | :386 |
| 积分记录 | https://www.ai666.net/points/records/recordsIndex | :394 |
| 消息中心 | https://www.ai666.net/message/detail/detailIndex | :420 |
| 移动我的 | https://www.ai666.net/mine | :430 |
| 移动资料编辑 | https://www.ai666.net/mine/profile/edit | :441 |
| 移动我的内容 | https://www.ai666.net/mine/content | :453 |
| PC 个人资料 | https://www.ai666.net/personalCenter/personalProfile/personalProfileIndex | :480 |

详情模板为 `/works/detail/:workNo`、`/tutorial/detail/:tutorialId`、`/activity/detail/:activityId`、`/activity/tasks/:activityId`、`/works/publish/:generationNo`、`/activity/submissions/:workNo`（localRoute.js:104、:269、:303、:315、:200、:340）。需从公开列表取得真实对象值，不编造可执行详情链接。活动参数在 `ai666-user/src/view/activity/detail/data/useActivityDetail.js:91` 作为活动 code 使用。

真实仓库没有独立登录页或签到页路由，两者由弹层承载。`/landing/platform-handoff` 为账号连接入口，不建议无票据单独打开进行验证。
