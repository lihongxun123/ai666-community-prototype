export const topViews = [
 ['overview','研究总览'],['report','竞品调研报告'],
 ['matrix','平台对照'],['audience','平台用户与需求'],['china-users','中国AI用户规模与分层'],
 ['content','内容形态与页面'],['content-demand','内容供需与主题'],['supply','内容供给与合作'],['operations','平台运营'],['business','商业模式与规模'],
 ['data','访问与渠道数据'],['tasks','内容与互动样本'],['discussion','内容与工具关系'],
 ['progress','目标与验证计划'],['makenow','MakeNow能力核查'],['strategy','借鉴与方案比较'],
 ['supplement','经营与使用证据'],['evidence','来源与研究方法'],['validation','用户研究准备'],
] as const;
export type ResearchView = typeof topViews[number][0];
export const viewTitle = (id:string) => topViews.find(([key])=>key===id)?.[1]||id;
export const navigationGroups: {id:string;title:string;views:ResearchView[]}[] = [
 {id:'reading',title:'报告',views:['overview','report']},
 {id:'market',title:'用户与市场',views:['china-users','audience','business','data']},
 {id:'content-operations',title:'内容与运营',views:['content','content-demand','operations','discussion']},
 {id:'planning',title:'方案与验证',views:['strategy','supply','makenow','progress','validation']},
 {id:'evidence',title:'证据与资料',views:['tasks','supplement','evidence']},
];
export const topicDescriptions:Record<string,string> = {
 'china-users':'中国有多少人使用AI，怎样使用，有多少人付过费。',
 audience:'各平台服务哪些人，他们的任务、困难和内容需求是什么。',
 business:'谁付费、为什么付费，以及平台披露的经营规模。',
 data:'各平台的访问趋势、地区、设备与流量来源。',
 content:'分类怎样分发内容，卡片、详情和按钮如何承接使用；逐平台路径与截图。',
 'content-demand':'抖音消费主题、评论诉求、关键词指数与竞品供给。',
 supply:'自制、约稿和作者合作的分工、投入与交付要求。',
 operations:'各平台怎样组织供给、分发内容、激励参与和维护社区。',
 discussion:'内容展示、文件交付和在线工具如何配合。',
 strategy:'集中比较竞品做法、采用条件、候选方案和验证办法。',
 makenow:'画布复制、素材交接、保存与生成能力的检查记录。',
 progress:'持续活跃的指标口径、证据进展与待人工确认事项。',
 validation:'访谈、招募和行为观察的提纲与记录表。',
 tasks:'具体作品、作者、评论和问题处理记录。',
 supplement:'收费规则、规模披露和使用经历的逐家依据。',
 evidence:'来源类型、观察日期与各类证据的适用范围。',
};
