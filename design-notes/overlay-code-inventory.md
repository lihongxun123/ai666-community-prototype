# 真实 C端 PC / H5 浮层代码盘点

核查日期：2026-10-02。源仓库：`F:/客户资料/AIGC-社区/ai666-user`，HEAD `3b67c503452c471466e5917240fa8313dead7e6d`。本清单来自当前源码，只读扫描了 `src` 全部 536 个 Vue / JS 文件，并对浮层入口、公开 Mod 组件、路由、宿主、触发处理及请求调用作追踪。未执行真实交互，未读取 env / 凭据。因此“有调用链”表示静态可达，不表示线上可成功打开或配置必然有数据。

本次识别并追踪了64项浮层/浮动控件：61项业务浮层（01—45、49—64）及3组通用/原生提示（46—48）；另外保留3类疑似闲置或需依赖确认的实现，及页面内状态。这里是当前静态扫描结果，不宣称已发现所有线上浮层。PC / mobile 对称文件合并成一个业务项。兑换确认与成功、表单正常与校验失败均视为同一浮层的状态，不重复计数。message / toast 内容另册盘点；这里保留积分专属数字浮层这一非 toast 形态。

证据写法为源仓库内 `路径:行号`。PC 与 H5 表达不同处明确列出；没有两端差异证据的项不假设已适配。下表“副作用”区分仅打开、动作确认与本地记录。

| ID | 名称 / 所属页面与入口 | 触发与形态 / 两端差异 | 源码证据 | 副作用及可达性 |
|---|---|---|---|---|
| 01 | 登录 / 全局权限门槛、导航登录 | 用户登录按钮、需要登录的业务动作打开；PC 居中卡片含验证码/微信切换，H5 手机验证码主卡片 | `components/ui/loginPanel/loginPanel.vue:2`、`:44`、`:683`；`layouts/pc/LayoutPc.vue:22`、`layouts/mobile/LayoutMobile.vue:19`；`store/modules/user.js:200` | 全局挂载；发送验证码、登录提交、获取微信码/轮询有请求，勿提交；仅打开也可能获取微信二维码 |
| 02 | 更多登录方式 / H5登录面板 | H5“更多登录方式”按钮再开第二层二维码面板 | `components/ui/loginPanel/loginPanel.vue:114`、`:222`、`:441` | H5专属；微信二维码请求与轮询；不能用PC切tab代替H5二层 |
| 03 | 首屏推荐广告 / 全局 Layout | 挂载后有配置且未dismiss自动弹；侧栏切推广位、关闭、今日不再提示；PC/H5各壳 | `components/mod/ModFlashHome/pc/FlashHomePc.vue:3`；`mobile/FlashHomeMobile.vue:3`；`data/useFlashHome.js:74`、`:138`；`layouts/pc/LayoutPc.vue:20` | 数据GET；关闭/今日不提醒写本地dismiss；推广CTA可能站内或外站跳转 |
| 04 | 登录运营推广 / 首页 | 首页路由、受众与频控匹配且配置存在时自动显示，等待首屏广告/登录层退出 | `components/mod/ModLoginPromotion/pc/LoginPromotionPc.vue:2`；`mobile/LoginPromotionMobile.vue:2`；`data/useLoginPromotion.js:106`、`:119`、`:165` | 展示即写sessionStorage seen；CTA走配置跳转；属于运营数据驱动，不能认定线上必弹 |
| 05 | 作品入选精选奖励提醒 / 全局 | 登录/重连/可见/积分同步与实时事件查待提醒，无阻挡层时弹；单件/多件合并状态，PC/H5分别实现 | `layouts/baseLayout.vue:10`；`components/mod/ModWorkFeatured/pc/WorkFeaturedPc.vue:7`；`mobile/WorkFeaturedMobile.vue:6`；`data/useWorkFeaturedNotice.js:173`、`:185`、`:241` | 自动显示本身只GET；关闭、知道了、查看作品、查看消息均写 `confirmFeaturedRewardsApi` 已处理记录，线上只读不宜关闭这类层 |
| 06 | 签到与任务 / PC导航、个人资料；H5首页、我的 | 签到入口打开；同组件含签到进度与任务，H5响应式变形 | `components/ui/checkInAndTasks/checkInAndTasks.vue:2`、`:458`、`:478`；`layouts/pc/layoutNav.vue:167`、`:742`；`view/home/mobile/HomeMobile.vue:34`；`view/personalCenter/mine/mobile/MineMobile.vue:247` | 打开GET签到状态；领取/签到 `todaySignInApi` 写入，任务CTA继续导航或登录 |
| 07 | 活动任务引导气泡 / PC导航活动入口 | 首页每日/受众频控自动提示；关闭、任务CTA、游客登录 | `components/ui/activityTaskGuide/ActivityTaskGuideTip.vue:9`；`layouts/pc/layoutNav.vue:52`、`:450` | 当前宿主仅PC；展示写本地当天记录，CTA跳转/登录；H5任务直接以页面卡片承接 |
| 08 | 积分临期气泡 / PC通知、H5我的 | 依据临期余额自动展示，关闭、前往使用；PC锚导航，H5锚我的 | `components/ui/pointsExpiringTip/PointsExpiringTip.vue:20`；`layouts/pc/layoutNav.vue:92`；`view/personalCenter/mine/mobile/MineMobile.vue:19` | 临期获取与频控见同目录 `usePointsExpiringTip.js`；本地展示频控，前往使用导航 |
| 09 | 积分到账奖励数字 / 全局body | 有积分到账事件且业务登记按钮锚点时数字浮层；无锚点切专属到账轻提示 | `components/ui/pointsArrivalReward/PointsArrivalReward.vue:9`、`:53`；`layouts/baseLayout.vue:6` | 纯反馈；不自行发积分。普通到账轻提示 `PointsArrivalNotice` 由另一提示清单承接 |
| 10 | 系统公告 / PC导航、消息中心 | PC最新公告自动检查及消息公告点击；含不再提醒/今日不再提醒；组件有H5壳，但H5消息页当前无同一公告入口 | `components/mod/ModNotic/pc/NoticPc.vue:3`；`mobile/NoticMobile.vue:3`；`layouts/pc/layoutNav.vue:174`、`:764`；`view/message/detail/pc/MessageDetailPc.vue:174` | 获取公告GET；dismiss写本地 `announcementDismiss.js:66`；不能由mobile组件存在推断H5入口可见 |
| 11 | 用户头像快捷菜单 / PC导航 | 点击头像弹浮动菜单：我的主页、邀请、签到、积分、退出 | `components/ui/userInfoCard/userInfoCard.vue:8`、`:23`、`:113`；`layouts/pc/layoutNav.vue:193` | 菜单展开无请求；退出清登录状态，签到再开06；H5我的页为页面入口 |
| 12 | 创作入口菜单 / H5底部导航 | 中央创作按钮展开遮罩+创作选项，选项跳生成、闪念、上传等业务入口 | `layouts/mobile/LayoutMobileTabBar.vue:67`、`:73`、`:240`、`:256` | H5专属；选择可能登录或导航，无直接生成/发布 |
| 13 | 搜索历史与热门推荐面板 / 闪念PC侧栏 | 输入框focus/input打开扩展面板与body遮罩，历史、热门推荐、删除/清空历史 | `view/idea/post/ui/InputSearch.vue:11`、`:42`、`:110`；`view/idea/post/pc/PostIndexSidebar.vue` | 热门推荐GET、本地历史读写、搜索改变结果；不是全站固定搜索弹层 |
| 14 | 离站确认 / 首页快捷入口、PC生成/创作页 | 外站入口先开离站说明，确认后平台互通/外跳；PC/H5各组件，但现有直接宿主集中PC | `components/mod/ModExternalLeave/pc/ExternalLeavePc.vue:5`；`mobile/ExternalLeaveMobile.vue:5`；`view/home/pc/HomeQuickEntry.vue:32`；`view/aigc/create/pc/AigcCreatePc.vue:35`；`components/mod/ModAigcGenerate/pc/AigcGeneratePc.vue:161` | 打开无外跳，确认可能发平台互通请求/开新窗；mobile组件存在不等于每个H5入口沿用此层 |
| 15 | AIGC生成工作台 / PC首页、创作、活动详情 | PC创作入口打开大弹层；H5创作页 `inline`为页面，保留非inline弹层壳 | `components/mod/ModAigcGenerate/pc/AigcGeneratePc.vue:7`；`mobile/AigcGenerateMobile.vue:7`；`view/home/pc/HomePc.vue:18`；`view/aigc/create/pc/AigcCreatePc.vue:26`；`view/activity/detail/pc/ActivityDetailPc.vue:196` | 打开拉取模型/历史等GET；生成提交消耗积分，上传有写入；H5页面与PC大模态不能同截图替代 |
| 16 | 输出类型下拉 / PC工作台 | 图片、文本、视频类型按钮下拉菜单；H5为平铺分段tab，无此下拉 | `components/mod/ModAigcGenerate/pc/ui/shared/AigcTypeSelect.vue:4`；`mobile/ui/shared/AigcTypeSelect.vue:3` | 切本地表单类型，可能刷新对应列表，不提交任务 |
| 17 | 生成模型选择浮动菜单 / 工作台 | 文本/图片/视频工具栏点击模型，按分组展示；PC/H5都 dropdown，三种模型数据分别存在 | `components/mod/ModAigcGenerate/pc/ui/AigcComposer/txt/AigcTxtGenerate.vue:29`；`image/AigcImageGenerate.vue:77`；`video/AigcVideoGenerate.vue:132`；`mobile/ui/AigcComposer/txt/AigcTxtGenerate.vue:28`、`image/AigcImageGenerate.vue:82`、`video/AigcVideoGenerate.vue:128` | 选择只变参数/估算积分；三个输出类型必须分别有原型数据状态 |
| 18 | 图片比例选择 / 工作台 | PC比例按钮浮动选项卡；H5使用通用 `AigcParameterSelect` 下拉 | `components/mod/ModAigcGenerate/pc/ui/AigcComposer/image/AigcImageGenerate.vue:116`；`mobile/ui/shared/AigcParameterSelect.vue:3` | 变本地比例；不生成 |
| 19 | 视频画质/比例/时长选择 / 工作台 | PC综合参数浮动面板，H5拆成参数选择dropdown | `components/mod/ModAigcGenerate/pc/ui/AigcComposer/video/AigcVideoGenerate.vue:171`；`mobile/ui/shared/AigcParameterSelect.vue:3` | 变本地参数；不生成；原型须分别演示画质、比例、时长 |
| 20 | 生成活动选择 / 工作台 | 选择参与活动或暂不参加；PC/H5各dropdown组件 | `components/mod/ModAigcGenerate/pc/ui/shared/AigcActivitySelect.vue:3`；`mobile/ui/shared/AigcActivitySelect.vue:3` | 选择阶段不报名，后续生成/投稿动作另算 |
| 21 | 积分不足 / 生成请求失败或本地检查 | 两端共用body弹层，确认前往活动中心 | `components/mod/ModPointsInsufficient/ModPointsInsufficient.vue:6`、`:78`；`pointsInsufficientState.js:31`；`components/mod/ModAigcGenerate/pc/AigcGeneratePc.vue:173`；`mobile/AigcGenerateMobile.vue:261` | 仅生成宿主注册期间可弹；确认导航，不自动发积分 |
| 22 | 生成结果全屏预览 / PC | 当前任务/生成历史图片或视频打开全屏结果预览，参数、prompt、复制、再生成、发布 | `components/mod/ModAigcGenerate/pc/ui/AigcResultPreview/AigcResultPreview.vue:4`；`pc/AigcGeneratePc.vue:125` | 预览无生成；再生成可消耗，发布打开后续表单；文本结果不归此图片/视频层 |
| 23 | 生成历史面板 / H5创作页 | inline工作台历史按钮开body sheet，全部/图片/剧本/视频tabs；PC历史是工作台内部栏 | `components/mod/ModAigcGenerate/mobile/AigcGenerateMobile.vue:86`、`:103`；`view/aigc/create/mobile/AigcCreateMobile.vue:84` | H5专属浮层；拉记录GET，不生成 |
| 24 | 生成记录/结果全屏预览 / H5 | 历史选择或当前任务打开，图片/视频/剧本，参数、prompt、多结果切换与再创作/发布 | `components/mod/ModAigcGenerate/mobile/ui/AigcHistory/AigcHistoryPreview.vue:3`；`mobile/AigcGenerateMobile.vue:180` | 预览只读，再生成/发布动作有后续副作用；H5三种类型不可用PC22概括 |
| 25 | 参考视频缩略图预览 / 生成与H5闪念编辑 | 点击参考视频缩略图开Ant Modal播放 | `components/ui/MediaPreview/VideoPreviewThumbnail.vue:11`；`components/mod/ModAigcGenerate/pc/ui/AigcComposer/video/AigcVideoGenerate.vue:48`；`mobile/ui/AigcComposer/video/AigcVideoGenerate.vue:43`；`view/idea/post/mobile/FlashComposeMobile.vue:53` | 播放只读；与生成结果预览分开 |
| 26 | 作品发布/编辑表单 / PC生成结果、活动上传 | PC居中大模态；H5 `isPage`作品发布为页面，也保留非page模态（投稿编辑等） | `components/mod/ModWorkEdit/pc/WorkEditPc.vue:5`；`mobile/WorkEditMobile.vue:5`；`view/works/publish/mobile/WorkPublishMobile.vue:65`；`view/activity/submissions/detail/mobile/SubmissionDetailMobile.vue:78` | 打开GET选项；上传素材/发布/保存有写请求；H5原型必须明确页面模式与弹层模式 |
| 27 | 作品关联话题下拉 / 作品表单 | 自定义multi select浮动菜单，PC/H5分别组件；可多选，H5上弹 | `components/mod/ModWorkEdit/pc/ui/WorkEditAside/WorkEditMultiSelect.vue:38`；`pc/ui/WorkEditAside/WorkEditMetaSelect.vue:22`；`mobile/ui/WorkEditAside/WorkEditMetaSelect.vue:45` | 本地选择；无独立发布 |
| 28 | 作品模型/Prompt关联模型下拉 / 作品表单 | 同组件单选模型；H5 Prompt活动有专用“关联模型”分支 | `components/mod/ModWorkEdit/pc/ui/WorkEditAside/WorkEditMetaSelect.vue:38`；`mobile/ui/WorkEditAside/WorkEditMetaSelect.vue:4`、`:62` | 本地选择；内容分类虽然使用同组件，但disabled=true，不能计为当前可打开浮层 |
| 29 | 作品投稿活动下拉 / 作品表单 | 点击参与活动选项，自定义浮动菜单；PC/H5分别实现 | `components/mod/ModWorkEdit/pc/ui/WorkEditActivitySelect/WorkEditActivitySelect.vue:18`、`:34`；`mobile/ui/WorkEditActivitySelect/WorkEditActivitySelect.vue:20`、`:35` | 选择只变本地；提交时才报名/发布 |
| 30 | 作品上传视频预览 / 作品表单 | 上传媒体视频缩略图开body对话层，PC/H5对称 | `components/mod/ModWorkEdit/pc/ui/WorkEditPrimary/WorkEditMediaPanel.vue:121`；`mobile/ui/WorkEditPrimary/WorkEditMediaPanel.vue:125` | 播放只读；注意选文件/封面后上传不属于预览无副作用 |
| 31 | 闪念发布/修改 / PC闪念、我的闪念、生成文本发布 | PC发布/我的闪念编辑共用模态；H5主入口新建走全屏compose页面，但旧“我的闪念”可用共用模态 | `components/ui/EditPostPublishModal/EditPostPublishModal.vue:2`；`view/idea/post/pc/PostIndexSidebar.vue:99`；`view/personalCenter/myPost/myPostIndex.vue:69`；`components/mod/ModAigcGenerate/pc/AigcGeneratePc.vue:154` | 表单打开无发布；上传/发布/编辑提交写入；H5需区分新建页面与旧编辑模态 |
| 32 | 闪念上传视频预览 / 闪念模态编辑 | 点击已上传视频开body预览对话框 | `components/ui/EditPostPublishModal/EditPostMediaFiles.vue:85`、`:267` | 预览只读；上传另有写请求 |
| 33 | 闪念详情预览 / 闪念列表、社区H5、我的、分享 | PC媒体+侧栏详情模态；H5独立全屏预览模态；URL/query可自动打开 | `components/mod/ModPostPreview/pc/PostPreviewPc.vue:5`；`mobile/PostPreviewMobile.vue:5`；`view/idea/post/pc/PostPc.vue:41`、`mobile/PostMobile.vue:47`；`view/community/mobile/CommunityMobile.vue:209`；`view/personalCenter/mine/mobile/MineMobile.vue:254`；`view/share/shareIndex.vue:17` | 打开GET详情/评论；点赞、评论、回复写入；分享复制有剪贴板动作 |
| 34 | 闪念图片预览组 / 列表媒体 | 点击图片开Ant全屏图片组；PC/H5闪念列表共用组件，H5社区另有媒体实现 | `view/idea/post/ui/PostListItemMedia.vue:52`、`:184`；`view/community/mobile/ui/CommunityPostMedia.vue:35`、`:153` | 预览只读；首图位置/多图切换独立于33详情 |
| 35 | 闪念视频全屏播放 / 列表媒体 | 点击缩略图直接播放；PC/非iOS自定义全屏body层，iOS直接系统播放器 | `components/ui/MediaPreview/FeedVideoPreview.vue:11`、`:37`、`:69`；`view/idea/post/ui/PostListItemMedia.vue:40`；`view/community/mobile/ui/CommunityPostMedia.vue:22` | 播放只读；iOS原生全屏不能用HTML截图验证完全等价 |
| 36 | 评论图/评论编辑图片预览 / 闪念及作品详情 | Ant Image默认预览，含父评论、回复图片、评论编辑缩略图 | `components/ui/MediaPreview/CommentList.vue:19`、`:83`；`MediaPreviewCommentComposer.vue:14` | 图片点击只读；评论上传/提交另有写入；两端跟随33详情宿主 |
| 37 | 作品详情 / 首页、灵感库、活动投稿、收藏、我的作品、分享 | PC作品详情模态；H5仍保留Mod模态用于分享等，但主作品列表多导航独立详情页 | `components/mod/ModWorksDetail/pc/WorksDetailPc.vue:5`；`mobile/WorksDetailMobile.vue:5`；`view/home/pc/PopularWorks/index.vue:64`；`view/aigc/create/ui/InspirationLibrary.vue:76`；`view/activity/detail/ui/ActivitySubmissionsPanel.vue:32`；`view/personalCenter/myFavorite/myFavoriteIndex.vue:57`；`view/personalCenter/myWork/pc/MyWorkPc.vue:74`；`view/share/shareIndex.vue:12` | GET详情/评论；点赞收藏评论与删除有写入，PC作品评论删除不能假定自带确认框 |
| 38 | 作品详情图片预览组 / H5独立作品详情 | 当前媒体图片打开Ant全屏图片组 | `view/works/detail/mobile/WorksDetailMobile.vue:128`、`:363` | H5专属；PC作品媒体主舞台不是此Ant图片层 |
| 39 | 全部作品评论 / H5独立作品详情 | 评论查看全部/评论入口开底部sheet，列表、回复与编辑器 | `view/works/detail/mobile/WorksDetailMobile.vue:106`、`:171`；`view/works/detail/data/useWorksDetailMobilePage.js:318` | 打开GET评论；发评论/回复/点赞写入 |
| 40 | 删除作品评论/回复确认气泡 / H5评论sheet | 自己评论/回复删除按钮弹Ant Popconfirm，两类对象使用不同提示 | `view/works/detail/mobile/WorksDetailMobile.vue:198`、`:233` | 打开无删除；确认调用删除API。合并为一个业务确认类型但原型须两对象状态 |
| 41 | 活动创作方式选择 / 活动详情 | 点击活动创作入口选择AI生成或上传作品；PC dialog，H5底部sheet | `view/activity/detail/ui/ActivityCreateChoice.vue:2`、`:9`、`:253`；`pc/ActivityDetailPc.vue:191`；`mobile/ActivityDetailMobile.vue:142` | 选择阶段导航/打开26或15；实际报名与提交依赖后续行为 |
| 42 | 已有作品投稿活动 / PC我的作品、H5我的内容 | 作品投稿按钮开活动列表modal，选择活动/确认投稿 | `view/personalCenter/myWork/ui/MyWorkActivitySubmitModal.vue:2`；`pc/MyWorkPc.vue:82`；`mobile/MyContentMobile.vue:126`；`data/useWorkActivitySubmit.js:80`、`:109` | 开层仅GET可投稿活动；确认调用joinActivityApi再publishDraftWorkApi，不能在真实账号点确认 |
| 43 | 商品兑换确认/成功 / AI商城 | PC商品卡/兑换链接开dialog，H5兑换开sheet；成功原层显示卡密、复制、去产品使用 | `view/official/list/ui/OfficialProductGrid.vue:21`、`:31`、`:46`、`:235`、`:286`；`mobile/OfficialListMobile.vue:79`；`data/useOfficialMallMobile.js:133`、`:173` | 首次点击仅打开确认。确认兑换才getRedeemPoints消耗积分；成功卡密属于敏感资料，不截图真实内容 |
| 44 | 兑换记录 / PC商城 | 商城查看记录开modal；H5打开独立 `/official/records/recordsIndex` 页面 | `view/official/list/pc/OfficialListPc.vue:17`；`ui/OfficialOrderRecordsModal.vue:3`；`view/official/records/mobile/OfficialRecordsMobile.vue` | 拉记录GET，复制卡密写剪贴板；可能显示真实卡密，需脱敏 |
| 45 | 积分日志 / PC积分中心 | 查看全部/积分日志按钮开Ant Modal；H5为 `/points/records/recordsIndex`页面 | `view/points/detail/pc/PointsDetailPc.vue:22`、`:42`、`:187`、`:196`、`:329`；`ui/PointsRecordsModal.vue:2` | GET日志，无发积分；原型须保留PC modal / H5 page差异 |
| 46 | 原生title文字提示 / 内容标题与参数 | 鼠标悬停时浏览器原生tooltip，包括闪念标题、作品标题、AIGC参数、积分原因 | `view/idea/post/ui/PostListItem.vue:25`；`view/community/mobile/ui/CommunityPostCard.vue:32`；`components/mod/ModWorkFeatured/pc/WorkFeaturedPc.vue:56`；`components/mod/ModAigcGenerate/pc/ui/AigcResultPreview/AigcResultPreview.vue:57`；`view/points/detail/pc/PointsDetailPc.vue:167` | 只读；触屏未必可达同样hover，不计作自定义业务弹窗 |
| 47 | 原生title动作提示 / 复制与移除 | 悬停邀请链接复制、卡密复制、prompt复制、删除上传素材、视频全屏未就绪 | `view/invite/detail/ui/InviteTopPanel.vue:70`；`view/official/list/ui/OfficialOrderRecordsModal.vue:56`；`view/official/records/mobile/OfficialRecordsMobile.vue:55`；`components/mod/ModAigcGenerate/pc/ui/AigcResultPreview/AigcResultPreview.vue:86`；`components/mod/ModWorkEdit/pc/ui/WorkEditPrimary/WorkEditMediaPanel.vue:108`；`components/ui/MediaPreview/MediaPreviewVideoPlayer.vue:56` | 显示提示无副作用；实际点击复制/移除/全屏各自执行动作 |
| 48 | 播放进度时间气泡 / 自定义视频播放器 | 鼠标移动进度条显示时间浮动提示，按业务媒体预览复用 | `components/ui/MediaPreview/MediaPreviewVideoPlayer.vue:34` | 纯播放器UI；H5无hover，不能机械照搬 |

## 账号、内容管理与邀请规则：16个业务项

这些入口在上表对应模块之外仍是独立浮层；单列防止淹没在通用组件中。本次静态识别总数为 **64项（48 + 16）**，其中46—48是通用/原生提示集合，01—45与49—64是61项业务浮层。计数不是组件文件数。

| ID | 名称 / 页面入口 | 两端与形态 | 源码证据 | 副作用 |
|---|---|---|---|---|
| 49 | 编辑个人资料 / PC个人中心壳、资料页、活动完善资料任务 | 共用个人信息dialog；H5主入口为独立编辑页 | `view/personalCenter/personalProfile/personalProfileComponents/editUserInfo.vue:2`；`view/personalCenter/pc/PersonalCenterPc.vue:122`；`view/personalCenter/personalProfile/personalProfileIndex.vue:155`；`view/activity/detail/pc/ActivityDetailPc.vue:218` | 保存昵称/头像/简介写入；上传头像先写文件；打开只读资料 |
| 50 | 绑定手机 / 个人资料 | PC `EditPhoneBind`居中dialog；H5编辑资料 `ProfilePhoneBindSheet`底部sheet | `view/personalCenter/personalProfile/personalProfileComponents/EditPhoneBind.vue:2`；`personalProfileIndex.vue:121`；`view/personalCenter/profileEdit/mobile/ProfilePhoneBindSheet.vue:2`；`ProfileEditMobile.vue:156` | 发送验证码/确认绑定有写请求；打开无绑定 |
| 51 | 绑定微信 / 个人资料 | PC `EditWXBind`二维码dialog；H5 `ProfileWechatBindSheet`二维码sheet | `view/personalCenter/personalProfile/personalProfileComponents/EditWXBind.vue:2`；`personalProfileIndex.vue:122`；`view/personalCenter/profileEdit/mobile/ProfileWechatBindSheet.vue:2`；`ProfileEditMobile.vue:162` | 获取绑定二维码/轮询；扫码确认可绑定，不应使用真实账号扫码 |
| 52 | 手机解绑 / 旧个人资料路由 | Teleport自定义验证码弹层，旧页面挂载（含响应式但新H5编辑页未挂载） | `view/personalCenter/personalProfile/personalProfileComponents/PhoneUnBind.vue:2`；`personalProfileIndex.vue:123` | 验证码与解绑提交写入，可能涉及最后登录方式 |
| 53 | 微信解绑 / 旧个人资料路由 | Teleport自定义二维码弹层，同旧资料页面 | `view/personalCenter/personalProfile/personalProfileComponents/WXUnBind.vue:2`；`personalProfileIndex.vue:124` | 二维码轮询/确认解绑；非新H5编辑页入口 |
| 54 | 最后登录方式解绑提醒 / 旧个人资料 | 只绑定手机或微信时先Ant confirm，再打开52/53 | `view/personalCenter/personalProfile/personalProfileIndex.vue:186`、`:204` | 此层确认本身只开二层，真正解绑在二层；不能删除这个账号注销风险前置状态 |
| 55 | 账号绑定解释tooltip / 旧个人资料 | 已绑定项目hover显示解绑规则，Ant Tooltip；旧H5路由触屏hover未验证 | `view/personalCenter/personalProfile/personalProfileComponents/BindStatusItem.vue:12`、`:18`；`personalProfileIndex.vue:65` | 提示只读；点入口可能开54/52/53 |
| 56 | 删除我的闪念确认 / 我的闪念 | Ant confirm；共用旧页面，H5主我的内容页未见该删除入口 | `view/personalCenter/myPost/myPostIndex.vue:213` | 确认deleteMyPostApi，不可恢复 |
| 57 | 下架我的闪念确认 / 我的闪念 | Ant confirm；共用旧页面 | `view/personalCenter/myPost/myPostIndex.vue:234` | 确认unpublishPostApi |
| 58 | 闪念审核未通过原因 / 我的闪念 | Ant info展示具体原因 | `view/personalCenter/myPost/myPostIndex.vue:255` | 只读，知道了关闭 |
| 59 | 作品封禁原因 / PC我的作品 | Ant info展示ban_reason / audit_fail_reason | `view/personalCenter/myWork/pc/MyWorkPc.vue:222` | 只读；H5我的内容当前不是同一管理操作集合 |
| 60 | 删除我的作品确认 / PC我的作品 | Ant confirm，danger按钮 | `view/personalCenter/myWork/pc/MyWorkPc.vue:235` | 确认deleteWorkApi，不可恢复 |
| 61 | 下架我的作品确认 / PC我的作品 | Ant confirm | `view/personalCenter/myWork/pc/MyWorkPc.vue:256` | 确认unpublishWorkApi |
| 62 | 重新发布作品确认 / PC我的作品 | 已下架作品Ant confirm，再送审核 | `view/personalCenter/myWork/pc/MyWorkPc.vue:289` | 确认publishDraftWorkApi |
| 63 | 取消收藏确认 / 我的收藏 | Ant confirm；共用旧收藏页面 | `view/personalCenter/myFavorite/myFavoriteIndex.vue:156` | 确认unfavoriteWorksApi；开启确认只读 |
| 64 | 邀请规则 / 邀请有礼 | 点击查看完整规则；PC居中规则dialog，H5底部sheet | `view/invite/detail/pc/InviteDetailPc.vue:27`、`:40`；`view/invite/detail/ui/InviteRulesModal.vue:2`；`view/invite/detail/mobile/InviteDetailMobile.vue:165` | 开启/关闭只读；规则由当前邀请数据整理，与绑定邀请码动作分开 |

## 疑似闲置与第三方内部能力

- **旧 MediaPreview 大层**：`components/ui/MediaPreview/MediaPreview.vue:6` 仍有body详情层，但在src引用扫描未找到它的直接import/标签；当前入口统一 `ModPostPreview`。其子块（评论、播放器、头部）被现有Mod复用，不能整目录判未用。旧大层不应据此复刻为另一个在用弹层。
- **旧 data/shared/AigcTypeSelect 下拉**：`components/mod/ModAigcGenerate/data/shared/AigcTypeSelect.vue:3`，未找到该路径引用；当前PC和mobile分别引自身 `ui/shared` 类型组件，mobile为tab。归为疑似闲置。
- **H5非inline生成历史图片Image默认预览**：`components/mod/ModAigcGenerate/mobile/ui/AigcHistory/image/AigcImageHistoryItem.vue:48` 是Ant Image，须验证是否在当前可达非inline业务中会实际由默认preview打开；当前H5创作主路径inline使用compact列表+24。Markdown `ModMarkdownPreview` 内 `MdPreview` 可能有依赖自带图片预览，源码未显式配置，不作为已确认业务浮层；浏览器/依赖验证应补查公告、教程、闪念富文本图片。

## 与浮层容易混淆的页面状态

1. H5闪念新建：`view/idea/post/mobile/PostMobile.vue:4` 的 `FlashComposeMobile`，由 `compose=1`切整页；不属于模态dialog。PC31对应它，但原型台要能演示H5页面。
2. H5作品上传/生成结果发布：`/works/publish`、`/works/publish/:generationNo`使用 `ModWorkEdit isPage`；不能一律以居中弹层表现。
3. H5独立作品详情：`/works/detail/:workNo`；PC同路由独立页是占位（`view/works/detail/pc/WorksDetailPc.vue:1`），PC需要跟实际mod入口查看；H5详情中的39/40/38才是真浮层。
4. H5积分记录、商城兑换记录、编辑个人资料均是独立路由页面；PC45/44/49多为modal。
5. PC邀请页绑定邀请码是 `view/invite/detail/ui/InviteTopPanel.vue` 内联输入与绑定按钮，`:302`调用 `bindInviteCodeApi`；当前代码未见对应绑定邀请码dialog。H5基础资料编辑在 `view/personalCenter/profileEdit/mobile/ProfileEditMobile.vue:69` 使用 `main v-else`替换总览，`:232`仅切 `editingProfile=true`，并非当前代码中的sheet；线上版本若表现为sheet，应登记线上/源码差异。
6. `PostListItem.vue:71`的闪念评论展开与 `MediaPreviewCommentComposer.vue:2`的评论编辑器为详情内/卡片内内联区块；不额外计模态，但须表达回复/图片附件状态。作品内容分类multi-select禁用，不可作为已可交互浮层。

## 只读线上取样注意

- 商城首次“兑换”只打开确认层（PC `OfficialProductGrid.vue:235`、H5 `useOfficialMallMobile.js:133`）；确认兑换调用实际积分兑换（PC`:286`、H5`:173`）。只看确认层和关闭不会扣积分。
- 自动精选提醒的关闭/知道了/查看按钮全部写服务器已处理确认（`useWorkFeaturedNotice.js:241`）；若严格只读，可读取层但不要关闭它以免更改通知状态。
- 首页推广显示/关闭、任务引导、临期提示、公告dismiss会改本地频控；这和真实发奖励/扣积分不同，取样记录需说明本地频控会影响复现。
- 消息中心点击一条消息或全部已读会写服务器状态：H5 `view/message/detail/data/useMessageMobile.js:179`；PC `MessageDetailPc.vue`的 `handleRead`。页面加载当前仅取列表与未读数，未发现自动已读；禁止把真实消息点击当纯导航。
- 打开签到只GET，按钮签到/领奖写入；活动投稿42确认先报名再发布；生成15按钮消耗积分；上传文件立即有文件写入；51微信二维码真实扫码可触发绑定。
- 仅依据这次覆盖的浮层与宿主逻辑，未发现“页面加载自动领奖/自动兑换”。不据此保证所有依赖或后端GET无业务计数；详情访问可能由后端记录阅读，需接口证据另核。

## 原型台表达建议与覆盖边界

原型台按全局/创作/媒体详情/活动/账户/商城积分组织，01—64每项有入口、正常态与必要异常/危险确认态，端差异逐项呈现。配置驱动层支持手动样本入口，不依赖真实运营数据；所有发送验证码、扫码、签到、生成、兑换、投稿、发布、删除、解绑、已读、精选确认都使用本地模拟。成功兑换用 `[CARD_CODE]`，账号与作者用虚构资料。

扫描覆盖 `src`全部Vue/JS，不只关键词命中：结合全局Layout宿主、Mod全局注册规则、路由定义、直接组件调用、自定义 `v-if/v-show`菜单、Teleport、Ant modal/dropdown/tooltip/popconfirm/Image预览、JS命令式Modal、播放器原生全屏、旧实现引用。未执行浏览器，因此实际路由权限、运营配置、服务端内容、第三方Markdown内部预览、iOS系统播放器与CSS真实位置是待验证项。没有专门 `a-drawer`、`a-popover`源码业务实例；H5 sheet由自定义Teleport实现。原生文件选择器不计网站设计浮层，`Loading`、普通toast/消息提示由其他清单承接。
