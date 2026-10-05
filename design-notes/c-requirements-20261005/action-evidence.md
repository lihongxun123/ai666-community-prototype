# 动作页需求证据与待明确项

19 页需求见 action-pages.json。本文区分当前规范、研究室表达、本地真实仓库代码和本次主代理线上只读观察。真实仓库只用于核对已有业务与异常边界，不将旧实现自动定为新版决定。研究室允许模拟任务、奖励与兑换结果；本文不要求接生产 API、真实幂等或实现结算后台。未读取凭据或真实隐私，未执行生产操作。

## 本版规则来源与纠正

- 当前规范：审计包 `docs/product/AI666_C端B端页面联动规则精简版.md:127` 明确全产品只有限时积分、发放带有效期、最早到期先扣、退款沿原批次到期时间。积分制度不是待定。上轮 `design-notes/c-audit-20261005/online-code-review.md` 将“是否保留到期”登记为待明确的口径已被本版纠正；本轮只写分工文件，未回写旧报告。
- 同规范 :130–139 区分任务完成/奖励到账、审核通过/已公开、已公开/有效投稿、邀请有效/实际发奖、积分扣除/权益交付；:143–144 要求业务结果与精确目标身份，不以通知展示证明业务成功；:149–151 限制解除不自动恢复内容或奖励。旧文件中的页面名仅作业务语义参考，新壳层入口按当前需求定义。
- 本轮已确认：官方维护教程、应用；作者仅作品与帖子；资源独立详情已并入应用；应用发现后到 MakeNow 执行，不默认导入创作工作台。PC 我的承载关系面板，移动端关系独立页。
- 本次主代理线上只读证据见 b-c-linkage.md“本次线上只读核对”：B 签到页面周一至周日循环、3/5/7 连签、漏签清零、再次达到档位可再次获奖；C 邀请页面三阶段、日/月限额、唯一绑定与异常处理，累计到账与处理中分开。具体金额不硬编码。线上未确认签到时区；研究室已有 requirements-c-flows.md:266 明确连签按自然周、断签或跨周重计，本版保留，不因线上未展示细节而撤销。

## 页面证据索引

下表“研究室”路径相对本 site；“真实 C/B”分别相对 `F:/客户资料/AIGC-社区/ai666-user`、`F:/客户资料/AIGC-社区/ai666-admin`。行号为本次读取的定位入口，不声称对应源码已经线上部署。

| 页面键 | 研究室与原需求 | 真实代码或规范证据 | 转入本版的业务边界 |
|---|---|---|---|
| creation-entry | app/community-options/c-prototype/creation-entry.tsx:20、50、64；原 page-requirements-c.json:18 | 真实 C src/router/localRoute.js:169、184、200 | 三入口、登录返回、普通入口清理过期活动上下文；关闭不创建内容 |
| create | app/community-options/c-prototype/light-workbench.tsx:77、83、90、107、143、146；原需求:19 | 真实 C src/api/services/aigc.js:43；src/components/mod/ModAigcGenerate/data/shared/useAigcGenerateQueue.js:113 | 模型能力决定参数/限制，未知报价不可当零；超时不等于失败，结果主动发布 |
| post-edit | app/community-options/c-prototype/personal.tsx:479、483、500、516、520、543、561；原需求:20 | 真实 C src/components/mod/ModWorkEdit/data/useWorkEdit.js:236、271；规范:130–139 | 已有标题60/正文20000/媒体限额及提示词保留，内容审核与活动资格、到账分开 |
| post-publish | 同 personal.tsx:479–561；原需求:21 | 真实 C src/api/services/activity.js:24；规范:130–139 | 标题可选且入口始终可见；正文必填，纯文字投稿不强迫上传；圈子和活动前置校验 |
| mine | 同 personal.tsx:868、883、994、1041、1043、1058、1192；原需求:22 | 真实 C src/router/localRoute.js:430、453 | 管理范围隔离、草稿30天、生成记录与公开作品分离；官方应用教程不归作者 |
| my-relations | 同 personal.tsx:941；原需求:23 | 规范账号/内容恢复边界:149–151 | PC 内嵌与手机独立一致，关注关系变化不自动改变内容可见性 |
| my-circles | 同 personal.tsx 我的关系面板；原需求:24 | 规范 C/B 圈子归属与状态定义；本轮公共规则 G07 | 退出不删历史帖，圈子关闭与治理封禁分开，加入资格变化重新校验 |
| my-fans | 同 personal.tsx:935；原需求:37 | 规范账号与内容归属 | 取消关注不等于移除粉丝，关系失败恢复原状态，不展示私人绑定数据 |
| profile-edit | 同 personal.tsx:951；app/community-options/c-prototype/account-bindings.tsx:22、33；原需求:25 | 真实 C src/view/personalCenter/profileEdit/data/useProfilePhoneBind.js:91、132 | 头像 JPG/PNG 5MB、昵称20/简介80保留；资料保存与绑定独立、占用不覆盖、保护唯一登录方式 |
| login | app/community-options/c-prototype/login-overlay.tsx:59–61、82–83、66；原需求:26 | 真实 C src/api/services/auth.js:10、28、50、58 | 手机11/验证码6保留，来源恢复但不自动提交付费/发布；邀请码不自动建立奖励事实 |
| notifications | app/community-options/c-prototype/messages.tsx:17–25；原需求:27 | 真实 C src/view/message/detail/data/useMessageMobile.js:180；规范:143–144 | 已读和业务处理独立，按事件/对象定位，无目标不能跳无关页面 |
| activities | app/community-options/c-prototype/retained-activities.tsx:91、111、177；原需求:28 | 真实 C src/api/services/activity.js:14、95；真实 B src/view/operationManagement/activityDetail/utils/taskConfigSchema.js:105 | 时间、暂停、任务入口分别判断；结构化配置不从文案反推，达到额度不重复奖励 |
| activity | 同 retained-activities.tsx:196、203、219、276、283；activity-detail.tsx:20、24、29；原需求:29 | app/community-options/b-prototype/retained-event-config.tsx:8–29；retained-event-defaults.ts:77–131；规范:130–139 | 国庆固定七天配置与参与后七天分开；每日2图100、七天1400+350仅对该明确活动；自动奖励无领取按钮 |
| points | 同 personal.tsx:1224、1247；原需求:30 | 真实 C src/api/services/user.js:119、129；src/components/ui/pointsExpiringTip/usePointsExpiringTip.js:72；真实 B src/view/userManagement/userList/ui/LimitPointsAdjustModal.vue:13、33、74；src/view/userManagement/pointsRecords/ui/LimitPointsExpireConfigModal.vue:16、26、159；规范:127 | 未知和零分开、到账与待发分开，到期提示和原批次退款明确；后台缺有效期不可合法发放 |
| checkin | 同 personal.tsx:1289；原需求:31 | 真实 C src/components/ui/checkInAndTasks/checkInAndTasks.vue:262、289、320、458、478；真实 B src/api/services/signInConfig.js:4、7、26、63、71；src/view/operationManagement/operationConfig/SignInConfigPanel.vue:8、146、278 | 周计划、3/5/7 和漏签再达档来自线上与代码；连签字段兼容不等于可以造金额；自然周跨周重计沿用 requirements-c-flows.md:266，时区待定 |
| invite | 同 personal.tsx:1312；原需求:32 | 真实 C src/view/invite/detail/ui/inviteHelpers.js:11、37、73；src/view/invite/detail/data/useInviteMobile.js:68；真实 B src/view/userManagement/inviteRecords/ui/InviteDetailDrawer.vue:152、157 | 阶段达成不算已发，唯一绑定与限额保留；代码金额回退值不作为正式奖励规则 |
| shop | app/community-options/c-prototype/retained-shop.tsx:32、65、114；原需求:33 | app/community-options/b-prototype/operations-data.ts:5、7、15；真实 B src/view/operationManagement/store/ui/ProductEditorModal.vue:42、64、144、256 | 按站点/商品身份处理；库存、价格、时间和资格分别判断，停用不删除旧订单 |
| shop-exchange | 同 retained-shop.tsx:122、140、158；原需求:34 | 真实 C src/view/official/list/data/useOfficialMallMobile.js:36、172；规范:127、130–139 | 旧代码默认零价格和失败清空不沿用；最新价格需再确认，扣分未交付且无终局结论时处理中，明确失败区分结算结果，退款不续期 |
| shop-records | 同 retained-shop.tsx 与 personal.tsx 兑换记录；原需求:35 | 真实 B src/view/operationManagement/store/ui/StoreRecordsPanel.vue:113；规范:130–139 | 每次兑换订单及价格快照独立，权益仅在实际交付后可用，未知回查原订单，卡密仅本人可见 |

## 待明确登记

这些项不阻止已确认页面结构、字段与异常表达完成；不得以暂缺接口来改写已确认业务。公共规则 G01–G08 承载通用行为，页面保留对应业务前提。

| 编号 | 具体问题与确认对象 | 本版执行口径 |
|---|---|---|
| D-A01 | 产品/模型服务确认各模型正式能力、报价、部分成功、取消与退款条件 | 读取有效配置；未知价格阻止生成，未知任务结果回查，不承诺失败即退款 |
| D-A02 | 产品/研发确认跨设备草稿/材料恢复、生成结果保留期与删除范围 | 草稿30天沿用已有效约束；不承诺永久云存或删除公开作品时同步删除所有生成结果 |
| D-A03 | 产品/账号服务确认资料审核方式、头像保存、验证/换绑流程、旧账号补绑邀请的资格与时限 | 已确认保存和待审核分别表达；保护最后登录方式，占用不覆盖；未确认不得承诺账号资产自动迁移 |
| D-A04 | 产品/通知服务确认各业务事件与新壳层目标映射，尚无完整页的精确落点 | 已读不改变业务；无合法落点展示可读失效原因，不跳相似对象 |
| D-A05 | 产品/运营确认分类话题稳定身份映射、活动规则版本及任务/资格/异常复核生效边界 | 不硬编码线上样本分类；历史到账不被新配置覆盖，奖励前重新核验生效规则 |
| D-A06 | 产品/商城服务确认权益交付状态、已扣未交付补偿流程、原批次已到期退款文案、站点与账号边界 | 未交付不报成功；未知查原订单；退款不刷新到期；不默认跨站权益互认 |
| D-A07 | 产品/积分与签到服务确认业务时区/日切、今日/本周收入流水枚举及旧字段兼容 | 到期制度已定；缺配置与金额不能显示零；自然周连签及跨周重计保留 |

## 校准与验证范围

先完成 shop-exchange 单页样本，核对价格变化、未知结果、扣分/交付分离、原批次退款及有效配置，再按同一结构扩展19页。页面均以三级标题开头、下属四级标题，包含字段/动作/状态/异常/B端影响与编号验收；范围和措辞检验见本轮主任务验证。

本次没有执行真实登录、绑定、签到、邀请、兑换、生成、发布或奖励写入；源码证据不能证明生产结算已按本版需求实现。独立复核由主任务安排的另一代理检查已保存19页，发现与修复由主任务整合。
