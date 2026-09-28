export type FusionGalleryImage = {
  src: string;
  title: string;
  role: string;
  destination: string;
};

export type FusionGalleryGroup = {
  id: string;
  label: string;
  title: string;
  description: string;
  images: FusionGalleryImage[];
};

export const fusionGalleryGroups: FusionGalleryGroup[] = [
  {
    id: 'home', label: '01', title: '首页与轻创作',
    description: '从浏览作品、输入想法或选择快捷任务开始；创作后再决定保存、继续编辑或分享。',
    images: [
      { src: '/proposal-fusion/home-v5-light-creation.png', title: '社区首页', role: '轻创作、快捷入口、专题组合与内容卡片。', destination: '进入应用、专题、作品或轻创作。' },
      { src: '/proposal-fusion/audit-light-create-v1.png', title: '轻创作面板', role: '输入想法与参考素材，在同一面板生成和查看结果。', destination: '下载、保存到我的，或主动进入作品发布。' },
    ],
  },
  {
    id: 'applications', label: '02', title: '应用与制作',
    description: '应用列表负责选择任务；六类应用保留各自输入和结果差异，不合并为万能表单。',
    images: [
      { src: '/proposal-fusion/apps-index-v4.png', title: 'AI 应用首页', role: '精选应用与场景分组。', destination: '进入分类或具体应用。' },
      { src: '/proposal-fusion/apps-ecommerce-v1.png', title: '电商营销应用分类', role: '围绕换背景、精修等具体任务选择应用。', destination: '进入相应应用详情。' },
      { src: '/proposal-fusion/app-background-v2.png', title: '单图生成', role: '上传原图、选择场景与比例。', destination: '在同一任务内查看生成结果。' },
      { src: '/proposal-one/app-local-edit-selection-v1.png', title: '局部编辑', role: '圈选需要处理的区域并说明修改要求。', destination: '进入局部修改结果与继续调整。' },
      { src: '/proposal-one/app-writing-input-v1.png', title: '文字处理', role: '输入愿意处理的文字，选择精简、结构或语气目标。', destination: '进入可编辑结果与对照。' },
      { src: '/proposal-fusion/audit-batch-v1.png', title: '批量处理', role: '为多份素材设定统一处理条件。', destination: '逐项查看结果、保存或重试。' },
      { src: '/proposal-one/app-video-input-v1.png', title: '视频生成', role: '输入首帧与运动要求。', destination: '播放、下载或保存视频结果。' },
      { src: '/proposal-one/app-steps-input-v1.png', title: '分步任务', role: '确认需求、参考和关键步骤。', destination: '逐步完成并汇总产物。' },
      { src: '/proposal-fusion/audit-app-background-result-v1.png', title: '商品换背景结果', role: '核对成图，下载、保存或继续编辑。', destination: '保存到我的或进入作品发布。' },
      { src: '/proposal-fusion/my-results-v1.png', title: '我的生成记录', role: '私有保存成品、来源关联和必要设置。', destination: '恢复原应用，或选择一项结果分享。' },
    ],
  },
  {
    id: 'topics', label: '03', title: '专题、方法与教程',
    description: '专题按创作任务编排案例、应用和方法；教程既可从专题精选进入，也可直接查找目录。',
    images: [
      { src: '/proposal-fusion/audit-topics-index-v1.png', title: '专题首页', role: '按创作任务查找内容，也可直达官方教程。', destination: '进入某个场景专题。' },
      { src: '/proposal-fusion/audit-topic-ecommerce-v2.png', title: '电商营销专题', role: '把案例、方法和应用围绕同一任务组织。', destination: '进入应用、作品、教程或相关讨论。' },
      { src: '/proposal-fusion/audit-workflow-detail-v1.png', title: '方法与工作流详情', role: '说明可复用处理过程与条件。', destination: '按需进入对应应用或保存参考。' },
      { src: '/proposal-fusion/tutorials-v1.png', title: '官方教程', role: '专题内精选入口与可直达教程目录。', destination: '阅读方法，或返回对应任务开始制作。' },
    ],
  },
  {
    id: 'community', label: '04', title: '作品、圈子与交流',
    description: '作品保留作者表达；圈子承接讨论、求助与轻表达，相关内容继续指向同一作品或资源。',
    images: [
      { src: '/proposal-one/work-case-detail-v1.png', title: '作品详情', role: '呈现作品、作者与可公开的做法。', destination: '查看作者、相关方法或参与讨论。' },
      { src: '/proposal-one/circles-index-v1.png', title: '圈子首页', role: '按兴趣和创作需要进入交流场景。', destination: '进入具体圈子。' },
      { src: '/proposal-fusion/audit-circle-home-v1.png', title: '电商营销圈', role: '围绕特定创作场景沉淀经验与问题。', destination: '查看帖子、发布作品或提出问题。' },
      { src: '/proposal-one/circle-post-detail-v1.png', title: '帖子详情', role: '承接教程、讨论与求助的上下文。', destination: '在同一主题下回应或补充结果。' },
      { src: '/proposal-fusion/flash-v2.png', title: '闪念表达', role: '记录轻量想法与当下灵感。', destination: '可在圈子中继续交流，不强制选择圈子、标题或教程。' },
      { src: '/proposal-fusion/publish-work-v1.png', title: '作品发布', role: '带入选中的成图和应用关联，预览公开内容。', destination: '提交后显示审核状态；通过后公开，草稿留在我的。' },
    ],
  },
  {
    id: 'discovery', label: '05', title: '搜索、作者与收藏',
    description: '搜索只组织公开内容；作者页展示主动公开的作品与方法，收藏和私人记录留在个人空间。',
    images: [
      { src: '/proposal-fusion/search-panel-v1.png', title: '搜索推荐面板', role: '查看历史、热门词与精选专题、应用。', destination: '词语进入结果；精选内容直接进入详情。' },
      { src: '/proposal-fusion/search-results-v1.png', title: '搜索结果', role: '按作品、应用、方法、专题、圈子和作者组织命中。', destination: '进入相应公开详情。' },
      { src: '/proposal-fusion/author-profile-v1.png', title: '作者主页', role: '展示作者主动公开的作品、应用、方法与讨论。', destination: '进入内容详情或关注作者。' },
      { src: '/proposal-fusion/collections-v1.png', title: '我的收藏', role: '按内容类型留存应用、作品和方法入口。', destination: '回到原内容继续使用或阅读。' },
    ],
  },
  {
    id: 'services', label: '06', title: '活动与个人服务',
    description: '活动、商城、邀请、积分、签到、通知和个人中心保留为独立业务入口，并与创作主路径自然衔接。',
    images: [
      { src: '/proposal-fusion/activities-v1.png', title: '活动中心', role: '汇集可参与的社区活动。', destination: '进入活动详情或对应内容。' },
      { src: '/proposal-fusion/activity-detail-v1.png', title: '活动详情', role: '说明活动内容、参与方式与相关入口。', destination: '按活动规则进入参与页面。' },
      { src: '/proposal-fusion/audit-tasks-v1.png', title: '我的任务', role: '查看新手、成长与创作任务的当前进度。', destination: '去完成对应动作，再返回查看状态与奖励记录。' },
      { src: '/proposal-fusion/shop-v1.png', title: 'AI 商城', role: '承接既有商城服务入口。', destination: '进入商品或服务详情。' },
      { src: '/proposal-fusion/invite-v2.png', title: '邀请有礼', role: '展示邀请关系、好友任务进度与奖励记录。', destination: '复制邀请信息或查看规则；首次发布奖励以通过审核为条件。' },
      { src: '/proposal-fusion/audit-points-v1.png', title: '积分与签到', role: '查看积分、签到和可参与事项。', destination: '进入积分明细或兑换。' },
      { src: '/proposal-fusion/notifications-v1.png', title: '通知中心', role: '汇集与作品、互动和服务相关的提醒。', destination: '回到对应内容或业务页面。' },
      { src: '/proposal-fusion/redemptions-v2.png', title: '兑换记录', role: '查看兑换状态与本人权益，卡密默认隐藏。', destination: '查看使用说明，主动复制卡密或打开产品站点。' },
      { src: '/proposal-fusion/my-center-v2.png', title: '个人中心', role: '集中管理生成记录、已发布、草稿与收藏。', destination: '管理内容或编辑资料；公开主页只展示主动公开的信息。' },
    ],
  },
  {
    id: 'access', label: '07', title: '账户与外部工具承接',
    description: '登录后返回原动作；模型广场与 MakeNow 保持各自服务边界，素材传递只在支持时发生。',
    images: [
      { src: '/proposal-fusion/access-v2.png', title: '登录与工具承接', role: '两种弹层的对照图：登录返回原操作；外部工具独立打开。', destination: '下载选中的结果，再在 MakeNow 中导入；不预设自动传递或账号互通。' },
    ],
  },
  {
    id: 'collaboration', label: '08', title: '共学、研讨与互助',
    description: '这些能力由圈子、作品和方法详情承接，按需进入，不增加四套并列的一级导航。',
    images: [
      {src:'/proposal-fusion/audit-b-project.png',title:'共学项目',role:'围绕一次练习安排检查点。',destination:'圈内项目 → 提交练习 → 查看反馈。'},
      {src:'/proposal-fusion/audit-b-submit.png',title:'提交练习',role:'选择本次结果并说明需要反馈的部分。',destination:'提交到当前项目，不自动公开全部素材。'},
      {src:'/proposal-fusion/audit-b-feedback.png',title:'练习反馈',role:'同伴与主理人的反馈关联到当前检查点。',destination:'回到练习继续修改或进入下一步。'},
      {src:'/proposal-options/c-work-v2.png',title:'作品与创作意图',role:'先说明作品表达，再选择是否开放研讨。',destination:'作品 → 指定问题或片段。'},
      {src:'/proposal-options/c-discussion-v2.png',title:'作品研讨',role:'围绕作者指定的部分提出具体意见。',destination:'原作品 → 回应 → 作者取舍。'},
      {src:'/proposal-fusion/audit-c-versions.png',title:'版本与取舍',role:'对照修订并保留作者的选择。',destination:'返回作品；可以继续修改，也可以保留原作。'},
      {src:'/proposal-fusion/audit-d-method-v2.png',title:'方法与条件',role:'说明输入、依赖和适用范围。',destination:'资源详情 → 使用方法或查看版本。'},
      {src:'/proposal-fusion/audit-d-versions.png',title:'方法版本',role:'比较变化与兼容条件。',destination:'选择适用版本或查看替代方法。'},
      {src:'/proposal-fusion/audit-d-maintain.png',title:'方法维护',role:'维护者更新说明并关联替代方法。',destination:'更新回到同一个资源详情。'},
      {src:'/proposal-fusion/audit-e-ask.png',title:'提出问题',role:'补充目标、材料与已尝试的步骤。',destination:'从资源或圈子发起，预览后发布。'},
      {src:'/proposal-fusion/audit-e-compare.png',title:'比较建议',role:'比较建议的依据与适用条件。',destination:'在原问题下选择尝试，不承诺一定解决。'},
      {src:'/proposal-options/e-result-v4.png',title:'反馈尝试结果',role:'说明采用的方法和实际结果。',destination:'结果补回原问题，供后续读者参考。'},
    ],
  },
  {
    id:'states', label:'09',title:'结果、异常与发布状态',
    description:'状态板展示各页面中的不同情况，不是独立产品页面。',
    images:[{src:'/proposal-fusion/application-results-v1.png',title:'六类结果状态板',role:'图片、局部编辑、文字、批量、视频和分步任务的输出差异。',destination:'各自应用内保存、下载或继续操作；批量只重试失败项。'},
      {src:'/proposal-fusion/audit-task-states-v2.png',title:'任务与发布状态',role:'生成中、失败、积分不足，以及作品审核与公开后的状态。',destination:'保留输入与已有结果；作者可查看原因、修改后重提，审核通过后进入公开详情。'}],
  },
];

export const fusionGalleryDecisions = [
  ['全局导航与搜索', '首页、专题、AI应用、圈子、模型广场；右侧保留活动、商城、邀请及个人服务。搜索覆盖公开内容。'],
  ['活动、商城、邀请、积分、签到、我的', '保留既有业务入口，和创作、内容页自然互通。'],
  ['AIGC 轻创作', '并入首页与应用，按任务进入具体制作。'],
  ['闪念', '作为圈子中的轻表达；不强制圈子、标题或教程。'],
  ['官方教程', '专题内保留精选入口，同时可直达教程目录。'],
  ['模型广场、MakeNow', '保持外部工具边界；接入方式由各服务能力决定。'],
] as const;
