# 真实 C 端反馈机制源码盘点

核查时间：2026-10-02。源码根目录：`F:/客户资料/AIGC-社区/ai666-user/`。以下路径均相对于该根目录。只读源码核查，不读取环境凭据，不代表线上流程已实测通过。模态框、抽屉和媒体菜单另行盘点；本文件保留与轻反馈衔接的必要说明。

## 结论与统计口径

当前反馈系统由通用 `ModMessage`、表单内反馈、业务区域状态、积分专用反馈和通知中心共同构成。不能用全局 toast 的调用次数代表反馈设计数量。

- `message.success/error/warning/info/open(...)` 实际调用点 **167 个，59 个文件**，排除 `ModMessage` 实现和注释中的示例。success 37、warning 113、error 14、open 3、info 0。
- 167 是源码静态调用点，包含 PC/mobile 两套相同逻辑；动态分支、模板插值或接口返回文案可能生成多个实际消息。相同“缺少作品编号”等文案分布于不同模块，不能直接等同于同一用户路径。
- 辅助机械去重：去除路径行号并Trim后的调用所在行有 **111 种**；把路径中的pc/mobile段合并后有 **50个文件键**。前者会把多行 `message.success(` 的不同业务错误合并，后者不会合并独立页面，因此两者都不是语义条目数或模板数，仅供核对双端副本与同文案重复。
- 去重设计语义：本盘点归并为 **8 类反馈机制**，见下一节；其中通用轻提示只有一个公开 API / 一套状态控制器 / 两端 UI。表单内反馈有三个独立状态控制器，不是三套全局 toast。
- 搜索 `notification.*`、浏览器 `alert()/window.alert()`、`window.confirm()` 以及独立 `confirm()` 未发现实际调用；`Modal.confirm` 属于另一份模态框盘点。站内通知 store 与 notification toast 是不同对象。
- 源码扫描覆盖 `src/` 的 JS/Vue；调用点附录是可复核的完整索引。文字表达去重、模块路径去重、运行次数三者不等价。

## 8 类反馈机制与复用边界

| 类型 | 通用模板/业务专有 | 触发与显示 | 关键源码 |
|---|---|---|---|
| 1 全局短消息 | 通用反馈模板 | success/error/warning/info；可主标题+副标题、关闭按钮、叠放、自动关闭 | `components/mod/ModMessage/data/useMessage.js:3,52,135,208`；`data/createMessage.js:44`；`pc/MessagePc.vue:2,77`；`mobile/MessageMobile.vue:2,77` |
| 2 请求层统一失败 | 通用数据反馈，使用类型1 | 业务非成功 code、非 JSON 体、下载失败、兜底看门狗超时；silent 可抑制 | `api/request.js:13,108,139,152,158,161,176`；`api/requestWatchdog.js:91,104,141`；`api/requestWatchdogPolicy.js:14` |
| 3 表单内状态行 | 可统一设计，但当前三处独立实现 | 登录、手机换绑、移动端手机绑定；校验、发送中、验证码已发、安全验证失败 | `components/ui/loginPanel/loginPanel.vue:128,419,606,655`；`view/personalCenter/personalProfile/personalProfileComponents/EditPhoneBind.vue:83,137,171,209,247`；`view/personalCenter/profileEdit/data/useProfilePhoneBind.js:32,44,83,128` + `mobile/ProfilePhoneBindSheet.vue:72` |
| 4 字段/上传区域校验 | 通用表单反馈表现，规则业务专有 | 字段红框 + toast；必传媒体红框；分类/话题/模型加载失败与重试 | `ModWorkEdit/pc/ui/WorkEditPrimary/WorkEditPrompt.vue:79,93`；`mobile/.../WorkEditPrompt.vue:103,121`；两端 `WorkEditMediaPanel.vue:6`；两端 `useWorkEditMedia.js:198/195`；两端 `WorkEditAside/WorkEditMetaSelect.vue:16/17`（均在 `components/mod/`） |
| 5 区域状态/结果反馈 | 表现可复用，内容业务专有 | 创作排队/失败/成功、发布阻断、闪念上传/发布、活动参与状态、兑换结果、登录交接错误、作品不可查看 | 创作队列 `components/mod/ModAigcGenerate/data/shared/useAigcGenerateQueue.js:109,116,193,220`；其他细分见覆盖矩阵 |
| 6 积分与任务反馈 | 业务专有 | 顶部到账/退回提示、签到落点数字动效、任务完成主副标题、扣减/多笔汇总轻提示 | `store/modules/pointsReward.js:25,174,302,355`；`store/modules/pointsSync.js:119,124,133,178`；`store/modules/activityTask.js:139`；`components/ui/checkInAndTasks/checkInAndTasks.vue:471` |
| 7 通知中心与未读徽标 | 业务专有持续状态 | 签到/关注/回复/点赞/系统/评论；PC 分类型，移动端聚合互动/通知；已读与全部已读 | `utils/constants/notificationType.js:2,47,66`；`store/modules/notification.js:10,17,38,54,73`；`view/message/detail/pc/MessageDetailPc.vue:215,262,305,438`；`data/useMessageMobile.js:20,30,120,202`；`layouts/pc/layoutNav.vue:106,755,800` |
| 8 非阻断辅助气泡/媒体状态 | 通用表现+内容专有 | 原生 title、解绑说明 tooltip、视频进度时间 tooltip、播放失败/缓冲/全屏提示 | `view/personalCenter/personalProfile/personalProfileComponents/BindStatusItem.vue:12`；`components/ui/MediaPreview/MediaPreviewVideoPlayer.vue:15,19,34,130,197,228,309,487,515`；`FeedVideoPreview.vue:21,66` |

表格中缩写 `ModWorkEdit/...` 的完整前缀是 `components/mod/ModWorkEdit/`。全部 message 调用点列于附录，避免重复几十行源码路径。

## 通用短消息的真实行为

`ModMessage` 是懒创建单例，优先挂载 `#mod_page`，否则挂载 body。默认为 3000ms；鼠标悬停暂停，离开后 2000ms 关闭；duration=0 持续显示；小于等于30的时长按秒转换。内容全为空时不渲染。每次调用生成独立 id 并追加，没有内容去重、最大叠放数量或队列限流。PC/mobile 经 `shared/responsive` 分别选择组件，结构、顶部2.4rem定位、颜色类型、关闭与 aria-live 均相同（不是分别存在一套反馈政策）。

请求层不能被描述为“所有接口错误都已统一弹出”：业务响应失败会调用 ModMessage，但原生网络异常/HTTP拒绝等 error 拦截分支主要 reject 和恢复 loading，没有通用 message；看门狗另行提示，默认预算30秒+10秒宽限，并在页面恢复可见时补判。`code=-1` 清用户信息、打开登录面板并路由回首页；积分不足专用业务码只 reject，交给生成业务打开积分引导，宿主缺失时退回 `message.error`。silent 请求不显示统一业务失败或看门狗提示（`auth.js:45`、`user.js:133`、`works.js:80`）。这些机制在两端共用。

## 全模块覆盖矩阵

| 模块/入口 | 全局短消息或局部反馈 | PC/mobile 与复用判断 | 关键证据 |
|---|---|---|---|
| 全站请求、路由、复制 | 业务失败/超时；菜单获取失败；复制成功 | 请求通用；复制指令通用 | `api/request.js:112`；`requestWatchdog.js:142`；`router/routeUtils.js:233`；`utils/directive/copy.js:10` |
| 登录 | 正确手机号/验证码校验、安全验证失败/取消、验证码发送结果 | 同一登录组件适配两端，内联消息不是 toast | `components/ui/loginPanel/loginPanel.vue:606,616,623,636,640,655,659` |
| MakeNow 交接落地页 | 连接中/成功/失败页内状态 | 业务专有状态页 | `view/landing/platformHandoff/platformHandoffLanding.vue:24,30,87` |
| 首页/社区消费、闪念列表 | 分享链接已复制；媒体播放错误 | 社区移动端有分享消息；列表视频用 FeedVideoPreview | `view/community/mobile/CommunityMobile.vue:405`；`view/idea/post/ui/PostListItem.vue:151`；`FeedVideoPreview.vue:21` |
| 闪念发表/编辑 | 正文或媒体必填、媒体数/格式/大小、话题数量、发布审核提示 | 桌面弹层与移动页面不同；移动有 statusText 行 | `components/ui/EditPostPublishModal/EditPostPublishModal.vue:249,336,343`；`EditPostMediaFiles.vue:154`；`view/idea/post/data/useFlashCompose.js:55,64,184`；`ui/EditPostPublishComponents/EditPostTopicSelect.vue:52` |
| 闪念/作品/教程评论 | 缺对象编号；上传仍进行、内容或图片必填；图片数量、5MB、上传失败 | 多模块业务入口，媒体预览 composer 额外9个 toast点；作品详情PC/mobile常有同文案副本 | `view/idea/post/ui/comment/PostCommentComposer.vue:144`；`view/tutorial/detail/ui/TutorialCommentComposer.vue:114`；`components/ui/MediaPreview/MediaPreviewCommentComposer.vue:151-225`；ModWorksDetail两端 composer:143 |
| 作品详情/提示词/分享 | 复制成功/失败、评论删除/发布/不可评论、作品不可见 | 模态作品详情两端独立文件；移动独立详情页又有5处调用与错误页 | `ModWorksDetail`两端 `WorksDetailPrompt.vue:46,53`、`useWorksDetailAside.js:236/234`；`view/works/detail/data/useWorksDetailMobilePage.js:138,156,280,300,305,315,357` |
| 作品发表/编辑/活动投稿 | 标题/提示词/正文、媒体校验、视频封面、活动失效、投稿状态、成功 | PC标题+提示词3个点，mobile额外正文校验4个点；媒体逻辑两端各11个点 | `ModWorkEdit`两端 `WorkEditPrompt.vue:93/121`、`useWorkEditMedia.js:198/195`；`data/useWorkEdit.js:76,211,274`；`view/works/publish/data/useWorkPublishPage.js:257,271,298,305` |
| 图像/视频/剧本AI生成 | 缺提示词、参考素材模型能力/数量/大小、原模型不可用、活动报名、下载、积分不足 | PC三种创作恢复旧记录时警告原模型不可用；mobile三种创作缺提示词警告；共享参考图/视频各6个点 | `ModAigcGenerate`共享 `useAigcReferenceImages.js:151-182`、`useAigcReferenceVideo.js:152-181`；PC composer 图335/视频484/剧本141,156；mobile图286/视频365/剧本162；queue:218 |
| AI任务记录/结果 | 排队/生成/成功/失败/超时、可重试；复制提示词按钮变成已复制 | PC history卡片 aria-live/alert；mobile当前任务和历史独立呈现；状态不依赖toast | `ModAigcGenerate/pc/ui/AigcHistory/*/*HistoryItem.vue`；`mobile/ui/AigcTask/AigcCurrentTask.vue:90,131,229`；`pc/ui/AigcResultPreview/AigcResultPreview.vue:88,260` |
| 签到与活动任务 | 签到成功实返积分、任务完成与奖励结果；活动状态页内 notice | 两端共享任务/积分状态；有落点走签到按钮数字动效 | `checkInAndTasks.vue:471`；`activityTask.js:139`；`view/activity/detail/data/useActivityDetail.js:144`；PC:40、mobile:65 |
| 积分实时同步 | 奖励到账/退回、扣减原因、多笔汇总；本端扣费避免重复 | PC顶栏积分入口气泡，遮罩盖住则Teleport body；mobile固定安全区浮动 | `layouts/pc/layoutNav.vue:141`；`layouts/mobile/LayoutMobile.vue:14`；`store/modules/pointsSync.js:74,106,119,124,157,178` |
| 兑换商城/订单 | 卡密复制、商品编号缺失；兑换成功结果区域、复制按钮已复制 | PC grid / records modal；mobile独立结果卡，订单数据共享 | `view/official/list/ui/OfficialProductGrid.vue:283,291`；`OfficialOrderRecordsModal.vue:152`；`view/official/records/data/useOfficialRecords.js:75`；mobile列表:95,104、records:55 |
| 邀请 | 链接/邀请码复制失败成功、已绑定不可重复、不能绑定自己、绑定成功 | PC InviteTopPanel 5点；mobile useInviteMobile 4点，失败指导有所不同 | `view/invite/detail/ui/InviteTopPanel.vue:278-303`；`data/useInviteMobile.js:140-155` |
| 通知中心 | 6类型、未知类型fallback、未读徽标99+、单条/全部已读 | PC类型筛选；mobile互动/通知聚合，未读样式 | `utils/constants/notificationType.js:2,66`；`store/modules/notification.js:17,54,73`；PC/移动detail见机制7 |
| 个人主页/资料修改 | 昵称/头像/性别/图片格式大小、保存、绑定状态更新、ID复制 | 旧PC editUserInfo 5点；mobile useProfileEditMobile 9点；mine 2点 | `view/personalCenter/personalProfile/personalProfileComponents/editUserInfo.vue:296-334`；`profileEdit/data/useProfileEditMobile.js:66-162`；`mine/data/useMineMobile.js:278,281` |
| 绑定/解绑 | 电话格式/长度/验证码、智能验证、二维码失败/解绑成功；解绑tooltip | 电话解绑toast10点、微信3点；PC手机换绑内联 vs mobile手机号绑定内联，不可合并成同一业务 | `PhoneUnBind.vue:136-221`；`WXUnBind.vue:138,159,179`；`EditPhoneBind.vue:171`；`useProfilePhoneBind.js:44`；`BindStatusItem.vue:12` |
| 我的作品/闪念/收藏、活动投稿 | 审核中不可查看、缺编号、重新提交成功、活动选择/投稿失败成功 | 老列表确认框另记；PC作品有6点，闪念5、收藏2，shared活动投稿4 | `myWork/pc/MyWorkPc.vue:208-298`；`myPost/myPostIndex.vue:184-229`；`myFavorite/myFavoriteIndex.vue:141,151`；`myWork/data/useWorkActivitySubmit.js:82-149` |
| 模型广场/信息展示类页面 | 本轮未发现模块专用message调用；仍继承请求失败，常见禁用/空态为页面内容 | 不能从零toast推导零反馈；native title/aria-label仍应按控件检查 | 完整附录无modelPlaza调用；公共请求层覆盖 |

## 容易漏掉的细节

1. 积分有两条真实反馈车道：用户登记落点的奖励数字浮层与任意页顶部轻提示；另有退回变体、扣减通用message、多笔汇总message。仅看 `PointsArrivalNotice` 会漏签到数字动效。
2. 积分余额以服务端查询确认，事件id去重、本端扣费时间窗抑制重复、多笔合并；这些不是UI自身的自动去重。普通ModMessage则没有内容去重。
3. 积分可视节点 aria-hidden，由全局 `PointsArrivalReward.vue:28` 的 aria-live负责一次到账播报。顶部提示2830ms动效、230ms进入/2600ms开始淡出，reduced-motion另有处理（notice:157）。退回文案与播报一致性仍需运行/无障碍专项验证，源码announceArrival使用到账文字。
4. 上传格式/尺寸/数量不是表单rules声明，而是业务函数提前退出；很多输入使用 novalidate，不能只搜Antd rules/validateFields。
5. 评论提交、分享与复制常无弹框却有toast；任务失败、发布阻断、详情错误也常没有toast而有区域文本/重试入口。媒体播放的全屏说明与缓冲状态不应被当成接口报错。
6. `title` 属性是原生悬停提示，`aria-label` 只是无障碍名称，不能把它们都算成气泡组件；tooltip明确为1处解绑说明 + 1处视频进度时间气泡。动态 title（参考素材上限/已复制/下载结果）附录独立索引。
7. 每个复制成功toast不保证使用同一复制实现；例如有的失败catch只console，某些记录卡通过按钮文案变化回馈。审设计时应区分toast和按钮局部状态。
8. 167调用点不包含其他代理盘点的精选作品通知/积分不足引导模态框，但本文件保留它们与请求/积分事件的接口关系。

### 已确认源码风险：生成失败原因直接透传

PC和mobile的 `components/mod/ModAigcGenerate/{pc,mobile}/ui/AigcHistory/useAigcHistoryItemStatus.js:15,17` 直接读取 `current.fail_reason`，只替换“限时积分”一词。PC图像/视频/剧本的 `Aigc*HistoryItem.vue:52/52/46` 直接在 `role="alert"` 内渲染 `failText`。共享 `data/shared/aigcGenerationDetail.js:337` 同样把 `item.fail_reason` 转成字符串，仅trim与词替换；移动端 `mobile/ui/AigcTask/AigcCurrentTask.vue:120` 直接显示 `failureText`。

因此第三方服务原始error JSON如果被后端装进fail_reason，就会进入用户页面。主审代理在当前线上PC生成工作台已观察到该现象；此处只保留源码原因，不复制真实请求标识、私人提示词或完整错误载荷。建议用户界面按失败分类展示可行动的短提示，并保留“重试/调整参数/查看积分退回”的业务结果；原始模型分组、请求ID等诊断内容留在经权限控制的技术诊断渠道。当前未修改代码。

## 附录：全量调用点与补充状态索引

以下索引由当前工作树 `rg -n` 提取，不包含环境配置、接口请求凭据或真实用户资料；用于定位源码，不作为运行验收。

补充索引中 `title=` 是宽搜索候选，包含组件标题prop、v-model:title和确认框标题；它们不计入tooltip数量。气泡的语义判别以上文机制8为准。

### message 实际调用点

~~~text
src\view\works\publish\data\useWorkPublishPage.js:298:                message.warning('原活动暂不可用，可在发布页重新选择活动或普通发布');
src\store\modules\pointsSync.js:120:    message.open({ title: "积分变动", subtitle: GENERIC_UPDATE_TEXT });
src\store\modules\pointsSync.js:126:    message.open({
src\store\modules\activityTask.js:147:  message.open({
src\view\works\detail\data\useWorksDetailMobilePage.js:280:            message.success('评论已删除');
src\view\works\detail\data\useWorksDetailMobilePage.js:300:            message.warning('复制失败，请手动复制');
src\view\works\detail\data\useWorksDetailMobilePage.js:305:        message.success('提示词已复制');
src\view\works\detail\data\useWorksDetailMobilePage.js:315:            message.warning('当前作品暂不支持评论');
src\view\works\detail\data\useWorksDetailMobilePage.js:357:            message.success(context ? '回复已发布' : '评论已发布');
src\view\community\mobile\CommunityMobile.vue:405:    message.success("链接已复制");
src\view\invite\detail\ui\InviteTopPanel.vue:278:    message.success("邀请链接已复制");
src\view\invite\detail\ui\InviteTopPanel.vue:281:    message.warning("复制失败，请手动复制邀请链接");
src\view\invite\detail\ui\InviteTopPanel.vue:287:    message.warning("邀请关系已绑定，不可重复绑定");
src\view\invite\detail\ui\InviteTopPanel.vue:296:    message.warning("不能绑定自己的邀请码");
src\view\invite\detail\ui\InviteTopPanel.vue:303:    message.success("绑定成功");
src\view\invite\detail\data\useInviteMobile.js:140:      message.success("邀请码已复制");
src\view\invite\detail\data\useInviteMobile.js:143:      message.warning("复制失败，请长按邀请码复制");
src\view\invite\detail\data\useInviteMobile.js:152:      message.success("邀请链接已复制");
src\view\invite\detail\data\useInviteMobile.js:155:      message.warning("复制失败，请稍后再试");
src\utils\directive\copy.js:10:        message.success("复制成功 🎉");
src\view\idea\post\ui\PostListItem.vue:151:        message.success('链接已复制');
src\view\tutorial\detail\ui\TutorialCommentComposer.vue:114:        message.warning('缺少教程编号');
src\view\idea\post\ui\EditPostPublishComponents\EditPostTopicSelect.vue:52:        message.warning(`最多可选择 ${TOPIC_MAX_COUNT} 个话题`);
src\view\official\records\data\useOfficialRecords.js:75:        message.success('卡密已复制');
src\view\idea\post\ui\comment\PostCommentComposer.vue:144:        message.warning('缺少帖子编号');
src\router\routeUtils.js:233:    message.error("获取菜单失败");
src\view\idea\post\data\useFlashCompose.js:184:      message.success("已提交，正在审核中，通过后即可查看");
src\view\official\list\ui\OfficialOrderRecordsModal.vue:152:    message.success('卡密已复制');
src\view\personalCenter\mine\data\useMineMobile.js:278:            message.success('用户 ID 已复制');
src\view\personalCenter\mine\data\useMineMobile.js:281:            message.warning('复制失败，请稍后再试');
src\api\requestWatchdog.js:142:        message.error(config[TIMEOUT_FLAG_KEY]);
src\api\request.js:112:        message.error(text);
src\view\official\list\ui\OfficialProductGrid.vue:283:  message.success("卡密已复制");
src\view\official\list\ui\OfficialProductGrid.vue:291:    message.warning("商品ID缺失，无法兑换");
src\components\ui\MediaPreview\MediaPreviewContent.vue:243:        message.warning('缺少帖子编号');
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:151:        message.warning('图片仍在上传，请稍候');
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:155:        message.warning('请输入评论内容或上传图片');
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:161:        message.warning('缺少帖子编号');
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:180:        message.warning(`最多上传 ${MAX_IMAGE_COUNT} 张图片`);
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:193:        message.warning(`最多上传 ${MAX_IMAGE_COUNT} 张图片`);
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:198:        message.warning('请选择图片文件');
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:203:        message.warning('图片大小不能超过 5MB');
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:214:            message.error('上传成功但未返回图片地址');
src\components\ui\MediaPreview\MediaPreviewCommentComposer.vue:225:        message.error('图片上传失败');
src\components\ui\checkInAndTasks\checkInAndTasks.vue:480:    message.success(
src\components\mod\ModWorksDetail\pc\ui\WorksDetailAside\WorksDetailPrompt.vue:46:        message.success('提示词已复制');
src\components\mod\ModWorksDetail\pc\ui\WorksDetailAside\WorksDetailPrompt.vue:53:        message.warning('复制失败，请手动复制');
src\components\mod\ModWorksDetail\pc\ui\WorksDetailAside\useWorksDetailAside.js:236:      message.success("作品链接已复制");
src\components\mod\ModWorksDetail\pc\ui\WorksDetailAside\useWorksDetailAside.js:240:      message.warning("复制失败，请手动复制链接");
src\components\mod\ModWorksDetail\pc\ui\WorksDetailAside\comment\WorksDetailCommentComposer.vue:143:        message.warning('缺少作品编号');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:66:            message.warning('请选择图片文件');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:71:            message.warning('图片大小需小于 5MB');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:84:            message.warning('头像上传失败，请稍后再试');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:97:            message.warning('请填写昵称');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:102:            message.warning('请先上传头像');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:107:            message.warning('请选择性别');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:121:            message.success(successText);
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:128:            message.warning('保存失败，请检查后重试');
src\view\personalCenter\profileEdit\data\useProfileEditMobile.js:162:        message.success('账号绑定状态已更新');
src\components\mod\ModWorksDetail\mobile\ui\WorksDetailAside\WorksDetailPrompt.vue:46:        message.success('提示词已复制');
src\components\mod\ModWorksDetail\mobile\ui\WorksDetailAside\WorksDetailPrompt.vue:53:        message.warning('复制失败，请手动复制');
src\components\mod\ModWorksDetail\mobile\ui\WorksDetailAside\useWorksDetailAside.js:234:      message.success("作品链接已复制");
src\components\mod\ModWorksDetail\mobile\ui\WorksDetailAside\useWorksDetailAside.js:238:      message.warning("复制失败，请手动复制链接");
src\components\mod\ModPostPreview\pc\ui\PostPreviewSide\usePostPreviewSide.js:54:            message.success('帖子链接已复制');
src\components\mod\ModPostPreview\pc\ui\PostPreviewSide\usePostPreviewSide.js:61:            message.warning('复制失败，请手动复制链接');
src\components\mod\ModWorksDetail\mobile\ui\WorksDetailAside\comment\WorksDetailCommentComposer.vue:143:        message.warning('缺少作品编号');
src\view\personalCenter\personalProfile\personalProfileComponents\WXUnBind.vue:138:        message.error(error?.message || '获取微信解绑二维码失败，请稍后重试');
src\view\personalCenter\personalProfile\personalProfileComponents\WXUnBind.vue:159:            message.success('微信解绑成功');
src\view\personalCenter\personalProfile\personalProfileComponents\WXUnBind.vue:179:        message.error(error?.message);
src\components\mod\ModPostPreview\mobile\ui\PostPreviewSide\usePostPreviewSide.js:54:            message.success('帖子链接已复制');
src\components\mod\ModPostPreview\mobile\ui\PostPreviewSide\usePostPreviewSide.js:61:            message.warning('复制失败，请手动复制链接');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:138:        message.error('请输入手机号');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:142:        message.error('手机号只能包含数字');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:146:        message.error('手机号必须为11位数字');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:154:        message.error('请输入验证码');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:158:        message.error('验证码只能包含数字');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:186:            message.warning('智能验证失败，请重试');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:194:        message.success('验证码发送成功');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:198:            message.warning('已取消验证');
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:201:            if (error?.message) message.warning(error.message);
src\view\personalCenter\personalProfile\personalProfileComponents\PhoneUnBind.vue:221:    message.success('解绑成功');
src\view\personalCenter\personalProfile\personalProfileComponents\editUserInfo.vue:296:        message.warning('请选择图片文件');
src\view\personalCenter\personalProfile\personalProfileComponents\editUserInfo.vue:301:        message.warning('图片大小需小于 5MB');
src\view\personalCenter\personalProfile\personalProfileComponents\editUserInfo.vue:326:        message.warning('请填写昵称');
src\view\personalCenter\personalProfile\personalProfileComponents\editUserInfo.vue:330:        message.warning('请选择性别');
src\view\personalCenter\personalProfile\personalProfileComponents\editUserInfo.vue:334:        message.warning('请先上传头像');
src\view\personalCenter\myWork\data\useWorkActivitySubmit.js:82:            message.warning('当前作品状态暂不支持活动投稿');
src\view\personalCenter\myWork\data\useWorkActivitySubmit.js:113:            message.warning('请先选择投稿活动');
src\view\personalCenter\myWork\data\useWorkActivitySubmit.js:140:            message.success(`已投稿至「${activity.name}」`);
src\view\personalCenter\myWork\data\useWorkActivitySubmit.js:149:            message.warning(error?.message || '活动投稿失败，请稍后重试');
src\view\personalCenter\myWork\pc\MyWorkPc.vue:208:        message.warning('审核中的作品暂不可查看');
src\view\personalCenter\myWork\pc\MyWorkPc.vue:213:        message.warning('缺少作品编号');
src\view\personalCenter\myWork\pc\MyWorkPc.vue:232:        message.warning('缺少作品编号');
src\view\personalCenter\myWork\pc\MyWorkPc.vue:251:        message.warning('缺少作品编号');
src\view\personalCenter\myWork\pc\MyWorkPc.vue:284:        message.warning('缺少作品编号');
src\view\personalCenter\myWork\pc\MyWorkPc.vue:298:                message.success('已重新提交审核');
src\view\personalCenter\myFavorite\myFavoriteIndex.vue:141:        message.warning('缺少作品编号');
src\view\personalCenter\myFavorite\myFavoriteIndex.vue:151:        message.warning('缺少作品编号');
src\view\personalCenter\myPost\myPostIndex.vue:184:        message.warning('审核中的闪念暂不可查看');
src\view\personalCenter\myPost\myPostIndex.vue:189:        message.warning('缺少帖子编号');
src\view\personalCenter\myPost\myPostIndex.vue:200:        message.warning('缺少帖子编号');
src\view\personalCenter\myPost\myPostIndex.vue:210:        message.warning('缺少帖子编号');
src\view\personalCenter\myPost\myPostIndex.vue:229:        message.warning('缺少帖子编号');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\WorkEditPrompt.vue:102:        message.warning('请填写标题');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\WorkEditPrompt.vue:108:        message.warning(`标题至少 ${minTitleLength} 个字`);
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\WorkEditPrompt.vue:114:        message.warning('请填写提示词');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:171:        message.success('已恢复默认视频封面');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:209:            message.warning(limit > 1 ? `请至少上传 ${limit} 个媒体文件` : '请上传媒体文件');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:221:                message.warning('当前为视频类型，仅支持 mp4、webm、mov');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:225:                message.warning('视频大小不能超过 200MB');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:232:            message.warning('当前类型仅支持 png、jpg、jpeg、webp 图片');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:236:            message.warning('图片大小不能超过 32MB');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:246:            message.warning(`最多上传 ${mediaMaxCount.value} 个媒体文件`);
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:252:            message.warning(`最多上传 ${mediaMaxCount.value} 个媒体文件，已自动截取前 ${pickedFiles.length} 个`);
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:289:            message.warning('视频封面仅支持 png、jpg、jpeg、webp 图片');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:293:            message.warning('视频封面大小不能超过 32MB');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\useWorkEditMedia.js:330:            message.success('视频封面已更新');
src\components\ui\EditPostPublishModal\EditPostPublishModal.vue:254:    message.warning("请填写正文或上传媒体文件");
src\components\ui\EditPostPublishModal\EditPostPublishModal.vue:336:      if (isPublished) message.success(PUBLISH_SUCCESS_TIP);
src\components\ui\EditPostPublishModal\EditPostPublishModal.vue:343:    if (isPublished) message.success(PUBLISH_SUCCESS_TIP);
src\components\ui\EditPostPublishModal\EditPostMediaFiles.vue:157:        message.warning(`最多上传 ${MEDIA_MAX_COUNT} 个媒体文件`);
src\components\ui\EditPostPublishModal\EditPostMediaFiles.vue:163:        message.warning(`最多上传 ${MEDIA_MAX_COUNT} 个媒体文件，已自动截取前 ${pickedFiles.length} 个`);
src\components\ui\EditPostPublishModal\EditPostMediaFiles.vue:170:                message.warning('图片大小不能超过 32MB');
src\components\ui\EditPostPublishModal\EditPostMediaFiles.vue:179:                message.warning('视频大小不能超过 200MB');
src\components\ui\EditPostPublishModal\EditPostMediaFiles.vue:186:        message.warning('仅支持 png、jpg、jpeg、webp 图片或 mp4、webm、mov 视频');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\WorkEditPrompt.vue:130:        message.warning('请填写标题');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\WorkEditPrompt.vue:136:        message.warning(`标题至少 ${minTitleLength} 个字`);
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\WorkEditPrompt.vue:142:        message.warning('请填写正文');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\WorkEditPrompt.vue:148:        message.warning('请填写提示词');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:168:        message.success('已恢复默认视频封面');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:206:            message.warning(limit > 1 ? `请至少上传 ${limit} 个媒体文件` : '请上传媒体文件');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:218:                message.warning('当前为视频类型，仅支持 mp4、webm、mov');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:222:                message.warning('视频大小不能超过 200MB');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:229:            message.warning('当前类型仅支持 png、jpg、jpeg、webp 图片');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:233:            message.warning('图片大小不能超过 32MB');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:243:            message.warning(`最多上传 ${mediaMaxCount.value} 个媒体文件`);
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:249:            message.warning(`最多上传 ${mediaMaxCount.value} 个媒体文件，已自动截取前 ${pickedFiles.length} 个`);
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:286:            message.warning('视频封面仅支持 png、jpg、jpeg、webp 图片');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:290:            message.warning('视频封面大小不能超过 32MB');
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\useWorkEditMedia.js:327:            message.success('视频封面已更新');
src\components\mod\ModAigcGenerate\pc\ui\AigcResultPreview\AigcResultPreview.vue:260:    message.success('下载已开始');
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\video\AigcVideoGenerate.vue:484:    message.warning("原模型已不可用，请调整提示词或模型后重新生成");
src\components\mod\ModWorkEdit\data\useWorkEditActivityContext.js:128:                message.warning(error?.message || '活动报名失败，请稍后重试');
src\components\mod\ModWorkEdit\data\useWorkEdit.js:215:      message.warning(publishBlockedText.value);
src\components\mod\ModWorkEdit\data\useWorkEdit.js:274:      message.success(
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\image\AigcImageGenerate.vue:286:        message.warning('还需要填写提示词才能生成哦');
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\video\AigcVideoGenerate.vue:365:        message.warning('还需要填写提示词才能生成哦');
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\txt\AigcTxtGenerate.vue:141:    message.warning("原模型已不可用，请调整提示词或模型后重新生成");
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\txt\AigcTxtGenerate.vue:156:  onFiles: () => message.warning("剧本创作暂不支持素材上传"),
src\components\mod\ModAigcGenerate\pc\AigcGeneratePc.vue:403:    message.warning("创作输入区未就绪，请手动点击生成");
src\components\mod\ModAigcGenerate\pc\AigcGeneratePc.vue:422:    message.error(error?.message || "暂时无法前往 MakeNow，请稍后再试");
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\txt\AigcTxtGenerate.vue:162:        message.warning('还需要填写提示词才能生成哦');
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\image\AigcImageGenerate.vue:335:    message.warning("原模型已不可用，请调整提示词或模型后重新生成");
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceVideo.js:152:      message.warning("当前模型不支持该参考视频格式");
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceVideo.js:156:      message.warning(`参考视频不能超过 ${maxVideoSizeMb.value}MB`);
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceVideo.js:165:      if (files.length) message.warning("当前模型不支持上传参考视频");
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceVideo.js:169:      if (files.length) message.warning("参考视频最多 1 个");
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceVideo.js:177:      message.warning("当前模型不支持该参考视频格式");
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceVideo.js:181:      message.warning(`参考视频不能超过 ${maxVideoSizeMb.value}MB`);
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceImages.js:151:      message.warning(`图片大小不能超过 ${MAX_IMAGE_MB}MB`);
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceImages.js:163:      if (files.length) message.warning("当前模型不支持上传参考图");
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceImages.js:168:      message.warning("仅支持拖入图片素材");
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceImages.js:172:      message.warning(`图片大小不能超过 ${MAX_IMAGE_MB}MB`);
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceImages.js:177:      if (sizedFiles.length) message.warning(`参考图最多 ${maxCount.value} 张`);
src\components\mod\ModAigcGenerate\data\shared\useAigcReferenceImages.js:182:      message.warning(
src\components\mod\ModAigcGenerate\data\shared\useAigcGenerateQueue.js:218:        message.error(error?.message || "积分不足");
src\components\mod\ModAigcGenerate\data\shared\useAigcActivityContext.js:164:        message.warning(error?.message || "活动报名失败，请稍后重试");
~~~

### 表单内反馈、区域状态和辅助气泡索引

~~~text
src\view\works\publish\data\useWorkPublishPage.js:230:            errorText.value = '';
src\view\works\publish\data\useWorkPublishPage.js:239:        errorText.value = '';
src\view\works\publish\data\useWorkPublishPage.js:257:            errorText.value = String(error?.message || '活动投稿信息加载失败，请稍后重试');
src\view\works\publish\data\useWorkPublishPage.js:271:            errorText.value = '缺少生成记录编号';
src\view\works\publish\data\useWorkPublishPage.js:276:        errorText.value = '';
src\view\works\publish\data\useWorkPublishPage.js:305:            errorText.value = String(error?.message || '发布信息加载失败，请稍后重试');
src\components\ui\loginPanel\loginPanel.vue:426:  if (formMessage.value) setFormMessage("");
src\components\ui\loginPanel\loginPanel.vue:606:    setFormMessage("请输入正确的手机号", "error");
src\components\ui\loginPanel\loginPanel.vue:612:  setFormMessage("");
src\components\ui\loginPanel\loginPanel.vue:616:      setFormMessage("智能验证失败，请重试", "error");
src\components\ui\loginPanel\loginPanel.vue:623:    setFormMessage("验证码已发送", "success");
src\components\ui\loginPanel\loginPanel.vue:636:      setFormMessage("已取消验证", "error");
src\components\ui\loginPanel\loginPanel.vue:640:        setFormMessage(error.message, "error");
src\components\ui\loginPanel\loginPanel.vue:655:    setFormMessage("请输入正确的手机号", "error");
src\components\ui\loginPanel\loginPanel.vue:659:    setFormMessage("请输入验证码", "error");
src\components\ui\loginPanel\loginPanel.vue:664:  setFormMessage("");
src\components\ui\loginPanel\loginPanel.vue:684:  setFormMessage("");
src\view\invite\detail\ui\InviteTopPanel.vue:70:                title="点击复制"
src\view\works\detail\mobile\WorksDetailMobile.vue:200:                                    title="确认删除这条评论吗？"
src\view\works\detail\mobile\WorksDetailMobile.vue:235:                                                title="确认删除这条回复吗？"
src\view\works\detail\data\useWorksDetailMobilePage.js:138:            errorText.value = '缺少作品编号';
src\view\works\detail\data\useWorksDetailMobilePage.js:143:        errorText.value = '';
src\view\works\detail\data\useWorksDetailMobilePage.js:156:            errorText.value = '作品不存在或暂不可查看';
src\components\ui\MediaPreview\VideoPreviewThumbnail.vue:11:        <Modal :open="visible" :title="label" :footer="null" centered destroy-on-close :z-index="1200"
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:34:                <div v-if="state.hoverVisible" class="media_preview_video_player_progress_tooltip"
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:56:                    :title="!state.isFullscreen && !state.metadataReady ? '视频准备好后可全屏，可先点击播放' : undefined" @click.stop="toggleFullscreen">
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:183:        state.mediaError = '';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:192:    state.mediaError = '';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:197:        state.mediaError = '未获取到视频地址，请重新打开预览';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:217:    state.playbackNotice = '';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:228:    state.mediaError = ({
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:298:    state.playbackNotice = '';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:308:            state.mediaError = '当前浏览器无法播放此视频，请重试或更换兼容的视频文件';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:309:        } else state.playbackNotice = '播放未成功，请再次点击播放';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:379:    if (!state.isFullscreen) state.fullscreenNotice = '';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:475:    state.fullscreenNotice = '';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:487:            if (!confirmed && version === sourceVersion) state.fullscreenNotice = '请使用系统播放器的完成按钮退出全屏';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:491:            if (!confirmed && version === sourceVersion) state.fullscreenNotice = '请使用浏览器的退出全屏操作';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:515:                state.fullscreenNotice = '已切换为页面全屏';
src\components\ui\MediaPreview\MediaPreviewVideoPlayer.vue:799:    .media_preview_video_player_progress_tooltip {
src\view\idea\post\ui\PostListItem.vue:25:                :title="item.title"
src\view\activity\detail\pc\ActivityDetailPc.vue:40:                                v-if="participationNotice"
src\view\activity\detail\pc\ActivityDetailPc.vue:43:                                <strong>{{ participationNotice.title }}</strong>
src\view\activity\detail\pc\ActivityDetailPc.vue:44:                                <span>{{ participationNotice.description }}</span>
src\view\activity\detail\pc\ActivityDetailPc.vue:260:    participationNotice,
src\view\share\shareIndex.vue:50:const statusTitle = computed(() => {
src\view\activity\detail\mobile\ActivityDetailMobile.vue:65:                <aside v-if="participationNotice" class="activity_m_notice">
src\view\activity\detail\mobile\ActivityDetailMobile.vue:66:                    <strong>{{ participationNotice.title }}</strong>
src\view\activity\detail\mobile\ActivityDetailMobile.vue:67:                    <span>{{ participationNotice.description }}</span>
src\view\activity\detail\mobile\ActivityDetailMobile.vue:176:    participationNotice,
src\view\activity\detail\data\useActivityDetail.js:144:  const participationNotice = computed(() => participationState.value.notice);
src\view\activity\detail\data\useActivityDetail.js:623:    participationNotice,
src\view\idea\post\data\useFlashCompose.js:122:      setStatus(`“${file.name}”上传失败，请重试`, "error");
src\view\idea\post\data\useFlashCompose.js:134:        setStatus(`最多可添加 ${MEDIA_MAX_COUNT} 个媒体文件`, "error");
src\view\idea\post\data\useFlashCompose.js:139:        setStatus(`“${file.name}”不是支持的图片或视频格式`, "error");
src\view\idea\post\data\useFlashCompose.js:145:        setStatus(
src\view\idea\post\data\useFlashCompose.js:158:      setStatus("请先写下闪念内容", "error");
src\view\idea\post\data\useFlashCompose.js:188:      setStatus("发布失败，请稍后重试", "error");
src\components\ui\MediaPreview\FeedVideoPreview.vue:66:const handleError = () => { if (active.value) errorText.value = '视频暂时无法播放，请重试'; };
src\components\ui\MediaPreview\FeedVideoPreview.vue:78:    errorText.value = '';
src\view\official\records\mobile\OfficialRecordsMobile.vue:55:                                :title="copiedRecordId === item.record_key ? '已复制' : '复制卡密'"
src\view\community\mobile\ui\CommunityPostCard.vue:32:            :title="item.title || text"
src\view\official\list\ui\OfficialOrderRecordsModal.vue:56:                                :title="isCopyableCode(item.redeem_code) ? '复制完整卡密' : '当前卡密不可复制'"
src\view\official\list\mobile\OfficialListMobile.vue:104:                                :title="resultCardKey ? (redeemCodeCopied ? '已复制' : '复制卡密') : '当前没有可复制的卡密'"
src\components\mod\ModAigcGenerate\pc\ui\AigcResultPreview\AigcResultPreview.vue:68:                            <dd :title="entry.value">{{ entry.value }}</dd>
src\components\mod\ModAigcGenerate\pc\ui\AigcResultPreview\AigcResultPreview.vue:72:                            <dd :title="resultInfo.referenceMedia.label">
src\components\mod\ModAigcGenerate\pc\ui\AigcResultPreview\AigcResultPreview.vue:88:                            :title="promptCopied ? '已复制' : '复制提示词'"
src\components\mod\ModAigcGenerate\pc\ui\AigcResultPreview\AigcResultPreview.vue:138:                            title="下载生成结果"
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\video\AigcVideoHistoryItem.vue:138:            :title="buildDownloadLabel(index)"
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\video\AigcVideoHistoryItem.vue:270:const statusTitle = computed(() => {
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\video\AigcVideoHistoryItem.vue:276:const statusDescription = computed(() => {
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\video\AigcVideoGenerate.vue:76:            :title="`添加参考图（最多${maxCount}张）`"
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\video\AigcVideoGenerate.vue:91:            :title="`添加参考视频（最多1个，不超过${maxVideoSizeMb}MB）`"
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\video\AigcVideoGenerate.vue:161:                :title="group.title"
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\image\AigcImageHistoryItem.vue:133:            :title="buildDownloadLabel(index)"
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\image\AigcImageHistoryItem.vue:311:const statusTitle = computed(() => {
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\image\AigcImageHistoryItem.vue:317:const statusDescription = computed(() => {
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\txt\AigcTxtGenerate.vue:58:                :title="group.title"
src\view\points\detail\ui\PointsRecordsModal.vue:5:        title="积分日志"
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\image\AigcImageGenerate.vue:44:            :title="`上传参考图片（最多${maxCount}张）`"
src\components\mod\ModAigcGenerate\pc\ui\AigcComposer\image\AigcImageGenerate.vue:106:                :title="group.title"
src\view\points\detail\pc\PointsDetailPc.vue:167:              <span role="cell" :title="item.reason">{{
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\txt\AigcTxtHistoryItem.vue:169:const statusTitle = computed(() => {
src\components\mod\ModAigcGenerate\pc\ui\AigcHistory\txt\AigcTxtHistoryItem.vue:175:const statusDescription = computed(() => {
src\components\mod\ModWorkFeatured\pc\WorkFeaturedPc.vue:56:              <p class="mod_work_featured_work_title" :title="leadItem.title">
src\components\mod\ModWorkFeatured\mobile\WorkFeaturedMobile.vue:55:              <p class="mod_work_featured_work_title" :title="leadItem.title">
src\components\mod\ModWorkEdit\pc\WorkEditPc.vue:58:                                v-model:title="title"
src\components\mod\ModPage\ModPage.vue:7:        :title="title"
src\components\mod\ModPage\ModPage.vue:20:        :title="title"
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:40:        if (formMessageType.value === 'error') setMessage('');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:48:            setMessage('请输入正确的手机号', 'error');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:60:            setMessage('请输入六位验证码', 'error');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:85:        setMessage('正在进行安全验证');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:89:                setMessage('安全验证未完成，请重试', 'error');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:97:            setMessage('验证码已发送', 'success');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:101:                setMessage('已取消安全验证', 'error');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:104:                setMessage('验证码发送失败，请稍后重试', 'error');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:117:        setMessage('');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:130:        setMessage('正在绑定手机号');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:137:            setMessage('手机号绑定成功', 'success');
src\view\personalCenter\profileEdit\data\useProfilePhoneBind.js:142:            setMessage('绑定失败，请核对验证码后重试', 'error');
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\WorkEditPrimary.vue:22:            v-model:title="title"
src\components\mod\ModWorkEdit\pc\ui\WorkEditPrimary\WorkEditMediaPanel.vue:108:                            :title="getRemoveActionLabel(element, index)"
src\components\mod\ModAigcGenerate\mobile\ui\AigcHistory\video\AigcVideoHistoryItem.vue:78:                        :title="buildDownloadLabel(index)"
src\components\mod\ModWorkEdit\mobile\WorkEditMobile.vue:105:                                v-model:title="title"
src\view\personalCenter\personalProfile\personalProfileIndex.vue:20:                    title="个人信息"
src\view\personalCenter\personalProfile\personalProfileIndex.vue:65:                title="账号绑定"
src\view\personalCenter\personalProfile\personalProfileIndex.vue:92:                title="第三方账号绑定"
src\components\mod\ModAigcGenerate\mobile\ui\AigcHistory\image\AigcImageHistoryItem.vue:78:                        :title="buildDownloadLabel(index)"
src\view\personalCenter\personalProfile\personalProfileComponents\PointsRecordsPanel.vue:3:        <SplitLine icon-class="ai666 ai666-balance_details" title="积分变动记录" />
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\WorkEditPrimary.vue:22:            v-model:title="title"
src\view\personalCenter\personalProfile\personalProfileComponents\BindStatusItem.vue:12:        <a-tooltip
src\components\mod\ModWorkEdit\mobile\ui\WorkEditPrimary\WorkEditMediaPanel.vue:112:                            :title="getRemoveActionLabel(element, index)"
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:144:    if (formMessageType.value === 'error') setMessage('');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:175:        setMessage('请输入正确的手机号', 'error');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:186:        setMessage('请输入正确的验证码', 'error');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:211:    setMessage('正在发送验证码');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:215:            setMessage('智能验证失败，请重试', 'error');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:223:        setMessage('验证码发送成功', 'success');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:227:            setMessage('已取消验证', 'error');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:230:            setMessage(error?.message || '', error?.message ? 'error' : '');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:242:    setMessage('');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:250:    setMessage('正在换绑');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:256:        setMessage('换绑成功', 'success');
src\view\personalCenter\personalProfile\personalProfileComponents\EditPhoneBind.vue:263:        setMessage('');
src\components\mod\ModAigcGenerate\mobile\ui\AigcTask\AigcCurrentTask.vue:154:                        :title="buildDownloadLabel(index)"
src\components\mod\ModAigcGenerate\mobile\ui\AigcTask\AigcCurrentTask.vue:231:const failureText = computed(() => resultInfo.value.status.failureText);
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\image\AigcImageGenerate.vue:43:                :title="`添加参考图（最多${maxCount}张）`"
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\image\AigcImageGenerate.vue:109:                                :title="group.title"
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\video\AigcVideoGenerate.vue:71:                :title="`添加参考图（最多${maxCount}张）`"
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\video\AigcVideoGenerate.vue:83:                :title="`添加参考视频（不超过${maxVideoSizeMb}MB）`"
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\video\AigcVideoGenerate.vue:155:                                :title="group.title"
src\components\mod\ModAigcGenerate\mobile\ui\AigcComposer\txt\AigcTxtGenerate.vue:55:                                :title="group.title"
~~~
