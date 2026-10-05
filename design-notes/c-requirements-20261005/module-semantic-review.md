# C端37页模块语义核对

> 历史核对快照：下表中的“待定”及当时状态不代表当前决定。最新规则与改动见 [一致性收尾](consistency-final-review.md) 和 decisions.md；保留本表仅用于追溯早期核对范围。

日期：2026-10-05。范围：研究室本地稿 `app/community-options/c-prototype/`，及其当前首页、导航与阅读台承载；依据为 `design-notes/page-requirements-c.json`、`c-requirements-20261005/common-rules.md`、`decisions.md`、`alignment-review.md`。本轮核对源码字段、动作分支、必要反馈和对象跳转，不把源码存在等同双端全部交互验收。旧深色规范不用于覆盖当前黑白灰视觉。真实身份服务、计费、后端状态机和待决策枚举不作为原型缺陷。

> 最新整合结果见 [收口结果](closure-review.md)。S06字段定位及S07签到文案已由主任务修正；本表保留原核对证据，运行范围以closure证据为准。

## 确定不一致

| 编号 | 触发与问题 | 直接证据 | 处理与验收 |
|---|---|---|---|
| S01 | PC创作页游客或积分不足点击生成，仍建立模拟任务；手机已有前置检查 | 修改前 `pc-generation.tsx` 的 submit直接writeTask；`light-workbench.tsx` generate包含authenticate和pointBalance | 已修改PC专用组件，复用相同登录与余额来源；guest/insufficient不得新增任务，登录返回保留草稿且不自动生成。待主任务浏览器复核 |
| S02 | PC旧任务只记录参考素材名称、实际素材丢失时，rowRefs用sea.png冒充原参考图，继续调整带入错误素材 | 修改前 `pc-generation.tsx` rowRefs以任何referenceName回退海岸图；手机renderTaskInfo在缺文件时要求重选 | 已限于两种显式样本ID使用海岸参考图，其他旧任务显示缺素材提示；继续调整保留文本与参数、要求重选。待主任务浏览器复核 |
| S03 | PC首页默认作品集合含应用对象，卡片进入应用详情；手机同源区域为作品流 | `home-prototype/page.tsx` works中的leaves/restore有type:'应用'；openWork按type进入app；`featured.ts`评审embed及未配置时返回null，使用该默认集合 | 已修复：移除无作品身份的leaves应用样本；restore使用真实作品标题/作者并进入作品详情 |
| S04 | PC首页切换非全部分类会隐藏专题区，与只筛作品区规则冲突 | `home-prototype/page.tsx` showTopics=category==='全部'&&!search，条件直接控制瀑布流内专题 | 已修复：各分类（包括零匹配）保留专题区，并持久化PC分类；详情返回仍需运行时核验 |
| S05 | 显式未知应用item被展示成默认文案改写；无后台专题列表配置时未知theme被展示成默认香水专题 | `applications.tsx` baseApp=apps.find(...)||apps[0]，不可访问仅判断explicitId；`topics.tsx` theme未命中回themes[0]，不可访问判断依赖rows | 已修复：无参数使用默认样本，显式无效身份显示不可访问，合法后台专题配置仍可用 |
| S06 | 发布必填校验只在页内公共位置setMessage，未定位对应输入；长页可看不出应修改何处 | `personal.tsx` validate返回文案，submit收到error只setMessage；标题/提示词字段未绑定错误焦点和滚动 | 已报主任务；提示词/标题/正文/素材校验按字段呈现并定位，保留输入；不需重做所有表单 |
| S07 | 签到主按钮及介绍仍以领取积分表达，与完成后自动发规则易产生二次领取理解 | `personal.tsx` Checkin按钮“签到领取X积分”、intro“每天回来领取积分” | 已报主任务；保留签到动作，建议“签到 +X积分”“每天签到获得积分”；不添加领奖按钮 |

S01/S02修改 `c-prototype/pc-generation.tsx`；追加授权后S03/S04修改 `home-prototype/page.tsx`，S05修改 `c-prototype/applications.tsx`、`topics.tsx`。积分不足、复制失败、素材缺失改为常驻反馈；复制成功仍短提示。保留本地模拟任务，不新增真实结算实现。

## 19组逐模块覆盖

“未发现新增确定不一致”只说明下列源码范围，不能推断所有状态与交互通过。D项仍按decisions.md，不改为已定规则。

| 组 | 页面标识 | 实际核对字段、操作、状态与落点 | 结果及未覆盖边界 |
|---|---|---|---|
| 1 首页 | home | 双端Banner/金刚入口/专题推荐/分类/卡片；手机局部error、empty、more-error；PC应用类型与专题条件 | S03/S04已修；PC详情返回分类/位置待运行时核验，未声称PC全部状态通过 |
| 2 专题 | topics、topic | 运营关系、六项预览与精选计数、详情引用集合、三类原详情目标；已发布/引用失效分支 | S05未知theme已修；正常引用identity与配置状态有源码承接；选中大图与返回位置待运行时 |
| 3 作品流 | aigc、community | communityTab/switchCommunityTab、作品/交流/教程归属、分类同源、workTarget、公开过滤、滚动键 | 未发现新增确定不一致；公开排序D-C02仍待定，快速切换和续载需浏览器，不按本地数组推断服务排序 |
| 4 作品详情 | work | 图片/视频/文字分支、作者、提示词/参考素材、复制/同款、评论、发布内容边界与ActionBar目标 | 未发现新增确定不一致；实际多图/媒体错误和长提示词手动复制待运行时，不将MakeNow无深传报缺陷 |
| 5 应用 | apps、app | 分类、最新公开五项、暂停退出推荐、目录回原对象；工具/Agent/技能配置目标、缺入口/暂停/PC专属 | S05未知item已修；官方提供方署名与MakeNow同账号文案成立，无假承接生成页；目录型不宣称已选定Agent |
| 6 圈子 | circles、circle、discover-circles、discussion | navigation-model端归属、选中圈子、加入/退出、发帖登录与加入前置、关闭圈子、新帖子来源 | 未发现新增确定不一致；置顶并列排序D-C02待定；退出后帖子保留、旧兼容入口定位需运行时 |
| 7 帖子 | post | 正文/媒体/引用失效局部承接、PC内联评论/手机评论层、作者和圈子、公开边界 | 未发现新增确定不一致；评论编辑删除治理D-C04仍待定，不从样本按钮推导权限 |
| 8 教程 | tutorials、tutorial | PC独立目录与手机社区教程承载、官方署名、章节按钮/正文ID、关联原对象入口 | 未发现新增确定不一致；章节定位和失效引用需运行时，不开放用户教程发布 |
| 9 搜索 | search | 七类类型、默认/输入/已提交词分开、scope与持久化、无结果/失败/重试、各对象目标 | 未发现新增确定不一致；长度/热词运营来源D-C06待定，未将默认样本认作正式推荐配置 |
| 10 作者 | author | 作者名与公开内容过滤、作品/帖子两栏、关注与公开统计、参与圈子通过公开帖子推导 | 未发现新增确定不一致；无官方应用/教程栏目，无私人草稿/绑定/账务展示；同名作者独立ID需研发数据事实验证 |
| 11 创作 | creation-entry、create、create-result | 三路创作入口；PC参数菜单/素材数量/生成与结果；手机结果完整覆盖层、模型/比例/活动、下载/复制/继续调整/发布 | S01/S02已修；手机create-result隐藏是目录归属，有previewResult承接，不能报缺页；费用映射D-A01不靠模拟报价定稿 |
| 12 发布 | post-edit、post-publish | 作品提示词必填与纯空白校验、帖子标题选填/默认展开、素材增删及数量大小类型、活动/圈子/引用select、草稿/失败保留 | S06错误定位；系统select为当前真实字段控件，菜单样本另由主任务补，不把必须自绘菜单作为业务规则；计数口径仍待定 |
| 13 我的 | mine | 五个管理tab→各组件，PC附加关系panel，管理打开与编辑区分、草稿/内容删除确认、生成记录任务目标 | 未发现新增确定不一致；生成记录查看进入create?task保持任务身份；未知结果映射与结果保存D-A02/A04仍待定 |
| 14 关系 | my-relations、my-fans、my-circles | PC mine面板/手机独立页、关注/粉丝/加入圈子分别储存，回关仅改本人关注、退出圈子不删帖子 | 未发现新增确定不一致；列表总数与服务数据同源需要真实数据核对，不把演示计数当服务事实 |
| 15 账号 | login、profile-edit | 登录来源恢复；昵称/简介/性别/头像格式大小、账号绑定单独提交；换绑/唯一方式解绑防护、取消不提交基础资料 | 未发现新增确定不一致；AccountBindings清楚采用演示二维码/SMS分支，真实身份校验与资料审核D-A03不算原型缺陷 |
| 16 消息 | notifications | 全部/互动/通知、已读存储、全部已读、作品/帖子/投稿目标、不可访问消息保留 | 未发现新增确定不一致；积分消息空target和审核结果管理列表尚须D-A04细化，未擅定为所有事件映射完成 |
| 17 活动 | activities、activity | 公共有效配置、目录无参与写入、任务动作到作品/帖子/生成、暂停/结束与投稿资格边界 | 未发现新增确定不一致；自动奖励与前端点击不代表完成；规则变更版本及真实计数D-A05仍待定 |
| 18 积分 | points、checkin、invite | 限时积分概览/明细、签到原背景与重复阻断/自然周、邀请规则弹层与明细/复制入口 | S07文案已报；枚举/业务时区/签到接口旧字段D-A07不定稿，示例签到计算不作为线上到账证明 |
| 19 商城 | shop、shop-exchange、shop-records | 商品按站点分组、确认/成功/不足/失败及未知、扣分记录本地样本、PC记录弹层/手机独立页、关闭回商城 | 未发现新增确定不一致；未知结果不建立成功记录且有查询路径；交付事实与到期返还D-A06仍待定 |

## 验证范围

- 37个需求key已按上表全覆盖，包含PC/手机兼容入口，不用30/32独立入口数冒充37个独立页面。
- 本轮四个修改TSX经TypeScript transpileModule语法诊断，均无诊断。
- `npx tsc --noEmit --pretty false`无输出，通过类型检查。`npx oxlint pc-generation.tsx`未通过，原因见下一条。
- 专用oxlint存在该文件既有react-compiler、依赖数组和a11y规则报错；本轮未将其报告为lint通过。新增素材提示跨页传递采用初始化读取，清理effect不再新增同步setState检查失败。
- 浏览器验证与必要弹层由主任务统筹；本文不声明鼠标/触屏、Esc、焦点陷阱、返回滚动、全部错误状态或真实接口通过。S01–S05的运行时结果待主任务补证据。

## 追加：PC视频生成参数与参考视频

2026-10-05追加授权，只编辑PC专用组件及CSS。只读参考真实C仓：`ai666-user/AGENTS.md`；`src/components/mod/ModAigcGenerate/pc/ui/AigcComposer/video/AigcVideoGenerate.vue`的视频参数菜单；`data/shared/useAigcModelParams.js`；`data/shared/useAigcReferenceVideo.js`。

真实源码已确认：分辨率、时长及比例由选中模型配置驱动；参考视频能力由模型配置声明，单条参考视频，产品上限10MB并可受配置进一步收紧，默认MP4/WebM/MOV。源码证明字段与配置处理存在，不证明当前每个模型支持同一组值。

本原型只取字段与交互承载：视频模式新增画质（720p/1080p）及时长（5秒/10秒）演示菜单，沿用ParameterMenu；不据此规定vo_3_1正式能力/报价。选择写入本地演示任务与草稿，结果预览显示该任务记录的值。参考视频选择文件后仅建立本机blob地址，可预览/移除；单条、10MB及格式校验失败保留原文件并显示持续错误。取消选择无变化，不请求真实上传服务。跨页面或刷新丢失本机文件时不能冒用其他视频，继续调整提示重选。新增控件沿用当前黑白灰输入区，按钮组在必要时折行，未变更工作台布局体系。

固定样本入口（统一前缀 `/community-options/c-prototype?page=create&device=pc&reviewOverlay=`）：

| query值 | 打开时可查看的样本 |
|---|---|
| aigc-type | 图片模式、创作类型菜单默认打开 |
| aigc-video-quality | 视频模式、720p默认值、画质菜单打开 |
| aigc-video-duration | 视频模式、5秒默认值、时长菜单打开 |
| aigc-insufficient | 图片模式、预置描述、积分不足原生dialog默认打开；点击生成不创建任务 |
| aigc-reference-video | 视频模式、参考视频预览原生dialog默认打开；关闭后可移除或换本地视频 |

参考视频样本使用已有海岸演示视频，作为明确的评审样本；正式用户本地文件不保存到仓库、不传外站。两个菜单固定示例值不证明真实能力范围，20积分仍是原演示价格，未实现真实计费。MakeNow互通仍只承诺同账号继续。

追加初次`npx tsc --noEmit --pretty false`通过；后续重跑被主任务同时修改的personal.tsx:251中message声明顺序（TS2448/TS2454）阻塞，已通知主任务，PC专用组件未出现类型诊断。浏览器截图、菜单定位、视频播放及错误样本由主任务统一核验，本文不提前声明其通过。

最后调整：PC积分不足改为原生dialog，样本默认打开，真实原型submit的不足条件同样打开；“暂不生成”、关闭钮和Esc保留输入，“前往积分中心”进入points。无重复短提示，无充值或真实账务操作。此次npx tsc --noEmit --pretty false通过，浏览器由主任务核验。
