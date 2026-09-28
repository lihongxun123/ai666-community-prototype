# 多元拾光 C 端原型交付与集中确认

日期：2026-09-27｜状态：本轮全 C 端精调完成，待集中评审；最新验证范围见 [原型核验范围](prototype-completion-audit.md#当前质量阶段)。

## 入口与范围

- 首页：http://127.0.0.1:3000/community-options/mobile-home
- 从专题开始：http://127.0.0.1:3000/community-options/c-prototype?page=topics
- 平铺状态：http://127.0.0.1:3000/community-options/c-prototype/states
- PC 首页：http://127.0.0.1:3000/community-options/home-prototype

沿用研究站白底、黑白灰导航和品牌。移动端五栏、首页结构、两列大图应用、PC 首页 1800px 保留。状态编号和评审说明仅在独立状态总览，不放入消费页面。本轮仅修改本地研究站，未提交、发布或修改真实 C/B 代码。

本轮完成手机优先的全站页面模板及交互样本；PC 首页主要业务入口接入相同内容详情，子页提供宽屏布局。**不代表 PC 全站独立视觉稿、真实业务能力或接口联调已经完成。**模型广场、模型直通车等原有 PC 专属概念入口未在本轮重定义；移动端无对应入口。

## 页面清单

当前为 **42 个页面标识**，完整页面与状态以阅读台从代码元数据生成的清单为准。下表保留初版页面职责与状态索引；后增的“我的关注”“编辑资料”“兑换记录”和通用状态拆分均以当前阅读台为准，不沿用旧版 40 页／242 状态统计。资源与跨端是跨模块承接分组，不新增固定导航。弹层和内页分支计入所属页面，不伪计为独立页面。

| 分组 | 页面 | 状态数 | 状态标识 |
|---|---|---:|---|
| 首页 | [首页](http://127.0.0.1:3000/community-options/c-prototype?page=home) | 9 | normal, loading, empty, error, more-error, banner-ended, banner-removed, banner-hidden, image-error |
| 专题 | [专题](http://127.0.0.1:3000/community-options/c-prototype?page=topics) | 5 | normal, loading, empty, error, more-error |
| 专题 | [专题详情](http://127.0.0.1:3000/community-options/c-prototype?page=topic) | 7 | normal, loading, error, partial, empty, removed, single |
| AI应用 | [AI应用](http://127.0.0.1:3000/community-options/c-prototype?page=apps) | 4 | normal, loading, empty, error |
| AI应用 | [应用详情](http://127.0.0.1:3000/community-options/c-prototype?page=app) | 5 | normal, pc, paused, removed, error |
| AI应用 | [应用输入](http://127.0.0.1:3000/community-options/c-prototype?page=app-input) | 7 | normal, invalid, insufficient, quote-error, price-changed, login-expired, paused |
| AI应用 | [生成任务](http://127.0.0.1:3000/community-options/c-prototype?page=app-task) | 10 | queued, running, submitting, unknown, unaccepted, cancelling, cancel-failed, cancelled, failed, completed |
| AI应用 | [生成结果](http://127.0.0.1:3000/community-options/c-prototype?page=app-result) | 6 | normal, partial, settling, released, expired, error |
| 资源与跨端 | [电脑端继续](http://127.0.0.1:3000/community-options/c-prototype?page=pc-handoff) | 3 | normal, unavailable, copy-failed |
| 资源与跨端 | [关联账号](http://127.0.0.1:3000/community-options/c-prototype?page=account-link) | 4 | normal, mismatch, expired, error |
| 资源与跨端 | [选择成果](http://127.0.0.1:3000/community-options/c-prototype?page=return-result) | 5 | normal, error, activity-ended, duplicate, forbidden |
| 社区与帖子 | [社区](http://127.0.0.1:3000/community-options/c-prototype?page=community) | 5 | normal, loading, empty, error, more-error |
| 社区与帖子 | [帖子详情](http://127.0.0.1:3000/community-options/c-prototype?page=post) | 7 | normal, loading, removed, partial, forbidden, action-error, guest |
| 圈子 | [圈子](http://127.0.0.1:3000/community-options/c-prototype?page=circles) | 4 | normal, loading, empty, error |
| 圈子 | [圈子详情](http://127.0.0.1:3000/community-options/c-prototype?page=circle) | 6 | normal, empty, closed, removed, forbidden, guest |
| 教程 | [官方教程](http://127.0.0.1:3000/community-options/c-prototype?page=tutorials) | 5 | normal, loading, empty, error, more-error |
| 教程 | [教程详情](http://127.0.0.1:3000/community-options/c-prototype?page=tutorial) | 7 | normal, loading, removed, partial, forbidden, action-error, guest |
| 作品详情 | [作品详情](http://127.0.0.1:3000/community-options/c-prototype?page=work) | 10 | normal, text, video, media-error, loading, removed, partial, forbidden, action-error, guest |
| 搜索与作者 | [公开搜索](http://127.0.0.1:3000/community-options/c-prototype?page=search) | 5 | normal, idle, empty, error, partial |
| 搜索与作者 | [作者主页](http://127.0.0.1:3000/community-options/c-prototype?page=author) | 5 | normal, empty, removed, forbidden, guest |
| 资源与跨端 | [资源详情](http://127.0.0.1:3000/community-options/c-prototype?page=resource) | 9 | normal, loading, removed, paused, view-only, revoked, forbidden, action-error, guest |
| 创作与发布 | [AI 创作](http://127.0.0.1:3000/community-options/c-prototype?page=create) | 4 | normal, activity, expired, failure |
| 创作与发布 | [选择发布方式](http://127.0.0.1:3000/community-options/c-prototype?page=publish) | 4 | normal, activity, expired, login-expired |
| 创作与发布 | [编辑内容](http://127.0.0.1:3000/community-options/c-prototype?page=post-edit) | 14 | normal, post, activity, validation, uploading, upload-failed, save-failed, submit-failed, conflict, review, rejected, activity-ended, permission, login-expired |
| 创作与发布 | [发布状态](http://127.0.0.1:3000/community-options/c-prototype?page=publish-status) | 7 | review, public, rejected, unknown, failure, activity, activity-ended |
| 个人管理 | [我的](http://127.0.0.1:3000/community-options/c-prototype?page=mine) | 4 | normal, empty, login-expired, restricted |
| 个人管理 | [我的内容](http://127.0.0.1:3000/community-options/c-prototype?page=my-content) | 6 | normal, empty, review, rejected, removed, failure |
| 个人管理 | [草稿箱](http://127.0.0.1:3000/community-options/c-prototype?page=drafts) | 6 | normal, empty, expiring, expired, failure, account-switched |
| 个人管理 | [生成记录](http://127.0.0.1:3000/community-options/c-prototype?page=records) | 6 | normal, empty, running, failed, failure, account-switched |
| 个人管理 | [我的收藏](http://127.0.0.1:3000/community-options/c-prototype?page=favorites) | 5 | normal, empty, removed, failure, account-switched |
| 账号与通知 | [登录](http://127.0.0.1:3000/community-options/c-prototype?page=login) | 7 | normal, return, expired, cancelled, object-gone, activity-ended, account-switched |
| 账号与通知 | [通知](http://127.0.0.1:3000/community-options/c-prototype?page=notifications) | 5 | normal, empty, removed, failure, login-expired |
| 活动 | [活动中心](http://127.0.0.1:3000/community-options/c-prototype?page=activities) | 3 | normal, empty, failure |
| 活动 | [活动详情](http://127.0.0.1:3000/community-options/c-prototype?page=activity) | 7 | normal, ended, removed, ineligible, submitted, review, failure |
| 活动 | [我的投稿](http://127.0.0.1:3000/community-options/c-prototype?page=submissions) | 6 | normal, empty, review, ineligible, awarded, failure |
| 积分与任务 | [积分中心](http://127.0.0.1:3000/community-options/c-prototype?page=points) | 5 | normal, empty, pending, failure, login-expired |
| 积分与任务 | [每日签到](http://127.0.0.1:3000/community-options/c-prototype?page=checkin) | 5 | normal, done, unavailable, failure, login-expired |
| 积分与任务 | [邀请有礼](http://127.0.0.1:3000/community-options/c-prototype?page=invite) | 5 | normal, empty, pending, failure, login-expired |
| AI 商城 | [AI 商城](http://127.0.0.1:3000/community-options/c-prototype?page=shop) | 10 | normal, empty, confirm, done, records, insufficient, unknown, unavailable, failure, login-expired |

## 已实现的主路径

- 首页/专题 → 对应作品、教程、应用；搜索分类分组、详情返回与查询保留。
- 社区 → 圈子/帖子/官方教程；点赞、收藏、评论、回复；登录返回保留未发评论，不自动代发。
- 应用 → 详情底部固定“开始使用”（PC/手机同一操作区规则；手机详情用主操作替代五栏，暂停/下架/未接执行入口不显示）→ 输入与费用确认 → 本地任务 → 结果 → 私有作品编辑 → 预览 → 本人提交 → 审核状态 → 我的内容。
- 活动 → 直接发布或先生成 → 带活动进入编辑；活动结束/资格受限/已投稿时限制新投稿，历史记录仍可读。
- 我的 → 内容、草稿、生成记录、收藏、投稿、通知、积分、签到、邀请、商城。
- 教程与资源分别管理；资源独立详情表达查看/复用权限、暂停、撤回及电脑要求。社区关联账号与成果回流页面覆盖对应异常。

## 演示数据与交接边界

所有人物、内容、任务、奖励与兑换结果都是本地样本。100 初始积分、20 签到积分、50 商品价格、应用每份 10 积分只是覆盖状态的参数，仍需与当前配置核对。邀请、签到、商城参照真实 C 端现有页面结构；没有读取真实用户账户、奖励或商品库存。活动时间及每人一件也只是样例。

本地创建的应用任务保存创建时间，5 秒后刷新呈现处理中、12 秒后刷新呈现完成；结果是固定样本文字/图片，不调用模型。未知结果状态不会自动当作成功或新建任务。演示余额按同标签页签到、兑换、任务预占变化，不是实际账本。

正常页和评审 iframe 数据隔离。草稿文字与演示身份保存在当前标签页；本机媒体只做本地预览，刷新后不恢复文件。不等于服务端持久草稿。兑换卡密明确使用无效样本。账号关联、发布审核等成功态均仅表现页面状态，不证明已兑现。

视频样本由现有海岸图片制作成 3 秒无声播放样本，用于检验播放器与视频内容版式，不声称真实 AI 视频效果。站内应用和专题效果图沿用现有演示素材。

MakeNow 真实接口尚未接通。本轮已接入本地跨产品原型：资源进入对应项目，产品短片进入独立应用承接页，手机显示 PC 引导。复制、版本与回流仅为本地演示；社区内没有充值。

## 集中确认清单

C/B 与跨产品的确认项已合并到 `full-prototype-delivery.md`，以该文件为当前统一入口。

## 验证与限制

- 新增共享原型和移动首页通过定向 lint、TypeScript；全站构建通过。PC 旧首页未纳入 lint 通过声明：原文件仍有未使用变量、旧图片标签及既有交互写法告警，类型检查和构建通过。
- 242 张画面在 390px 下逐页检查状态标识、渲染、横向溢出和已加载图片破损，结果均为 0；详细记录见 `c-prototype-state-check.json`。这不是全部交互组合测试。
- 实际点测重点为专题内容身份、登录与评论、生成取消/完成/发布、个人记录、签到兑换、收藏、搜索返回；360px 检查 10 个代表页面，均无横向溢出；1440px 核对 PC 入口及专题布局，未作全量 PC 视觉验收。
- 独立复核指出输入直达绕过登录、任务取消不同步、演示规则和成功态可能误读。前两项已修正。补充复核还修正了 PC 修复应用的去向、PC 独立假积分/签到显示，并补检任务完成态；演示边界集中在本文件及独立评审页，避免给正常消费页塞内部说明。
- 浏览器外框不是真机验证；未验证真实 SMS、生成、积分、审核、跨端身份、MakeNow 或库存。真实研发验收仍以需求文档及接口联调为准。


