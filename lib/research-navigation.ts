export const topViews = [
 ['overview','研究总览'],['report','竞品报告'],
 ['audience','用户与需求'],['china-users','行业与角色'],
 ['content','内容与页面'],['content-demand','社媒与内容'],['supply','供给与合作'],['operations','平台运营'],['business','商业模式'],
 ['data','流量与渠道'],['tasks','内容样本'],['discussion','内容与工具'],
 ['progress','验证计划'],['makenow','MakeNow能力核查'],['strategy','方案与承接'],
 ['supplement','经营与使用'],['evidence','来源与方法'],['validation','用户研究准备'],
] as const;
export type ResearchView = typeof topViews[number][0];
export const viewTitle = (id:string) => topViews.find(([key])=>key===id)?.[1]||id;
export const navigationGroups: {id:string;title:string;views:ResearchView[]}[] = [
 {id:'reading',title:'研究总览',views:['overview']},
 {id:'market',title:'行业与用户',views:['china-users']},
 {id:'social',title:'社媒与需求',views:['content-demand']},
 {id:'competitors',title:'竞品研究',views:['report','audience','content','operations','business','data','tasks','discussion','supplement']},
 {id:'planning',title:'社区方案',views:[]},
 {id:'evidence',title:'研究方法',views:['evidence']},
];
export const topicDescriptions:Record<string,string> = {
 'china-users':'AI能力、创作资源与内容消费如何衔接；用户角色与全国使用数据。',
 audience:'各平台服务哪些人，他们的任务、困难和内容需求是什么。',
 business:'谁付费、为什么付费，以及平台披露的经营规模。',
 data:'各平台的访问趋势、地区、设备与流量来源。',
 content:'分类怎样分发内容，卡片、详情和按钮如何承接使用；逐平台路径与截图。',
 'content-demand':'六类消费任务、连载追看与反馈、社媒承载及AIGC供给。',
 supply:'自制、约稿和作者合作的分工、投入与交付要求。',
 operations:'各平台怎样组织供给、分发内容、激励参与和维护社区。',
 discussion:'内容展示、文件交付和在线工具如何配合。',
 strategy:'比较任务创作、项目共学、创作者研讨、方法共建与问题互助的用户价值和供给条件。',
 makenow:'画布复制、素材交接、保存与生成能力的检查记录。',
 progress:'周活统计口径、现有能力与验证所需条件。',
 validation:'访谈、招募和行为观察的提纲与记录表。',
 tasks:'具体作品、作者、评论和问题处理记录。',
 supplement:'收费规则、规模披露和使用经历的逐家依据。',
 evidence:'来源类型、观察日期与各类证据的适用范围。',
};

export const researchReadingLinks = [
 {group:'competitors',href:'/hf-modelscope',title:'HF 与魔搭调研'},
 {group:'planning',href:'/community-options',title:'五套方案'},
 {group:'reading',href:'/research-brief',title:'简版研究报告'},
 {group:'reading',href:'/community-options/fusion',title:'融合方案'},
 {group:'reading',href:'/community-options/current-product',title:'当前产品方案'},
 {group:'reading',href:'/community-options/prototype-review?section=c&view=home&device=pc&reading=prototype',title:'产品原型'},
 {group:'reading',href:'/community-options/fusion/gallery',title:'社区概念图集'},
 {group:'planning',href:'/community-options/library',title:'研究依据'},
 {group:'market',href:'/community-options/background',title:'近期应用'},
 {group:'market',href:'/?section=cn-answer#china-users',title:'使用与付费'},
 {group:'social',href:'/domain-research',title:'领域比较'},
 {group:'social',href:'/task-research',title:'任务与结果'},
 {group:'social',href:'/media-reports',title:'报告与案例'},
 {group:'evidence',href:'/research-status',title:'证据状态'},
] as const;
