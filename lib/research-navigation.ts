export const topViews = [
 ['overview','研究目录'],['report','主报告'],
 ['matrix','平台对照'],['audience','用户画像与产品价值'],['china-users','中国AI用户规模与分层'],
 ['content','内容形态'],['content-demand','内容供需与主题'],['operations','运营思路'],['business','商业化与规模'],
 ['data','公开访问数据'],['tasks','任务、内容与作者'],['discussion','内容与工具关系'],
 ['progress','持续活跃与执行计划'],['makenow','MakeNow与素材交接'],['strategy','方向与内容组织'],
 ['supplement','经营与使用证据'],['evidence','来源与研究方法'],['validation','用户验证准备'],
] as const;
export type ResearchView = typeof topViews[number][0];
export const viewTitle = (id:string) => topViews.find(([key])=>key===id)?.[1]||id;
export const navigationGroups: {id:string;title:string;views:ResearchView[]}[] = [
 {id:'reading',title:'报告',views:['overview','report']},
 {id:'topics',title:'专题研究',views:['china-users','audience','content','content-demand','operations','business','data','tasks','discussion']},
 {id:'own',title:'自身与方案',views:['progress','makenow','strategy']},
 {id:'evidence',title:'证据与附录',views:['supplement','evidence','validation']},
];
export const topicDescriptions:Record<string,string> = {
 'china-users':'全国规模、人口与用途结构、使用频率和付费调查。',
 audience:'任务、困难、内容需求、产品作用与使用者仍承担的工作。',
 content:'内容对象、首页编排、卡片和详情，以及竞品页面截图。',
 'content-demand':'竞品的供给行业、消费主题、可能缺口与抖音指数研究。',
 operations:'供给、分发、参与、激励、作者合作和持续维护。',
 business:'付款方、收费项目、工具与服务收入、公开经营规模。',
 data:'访问趋势、地区、设备和渠道；按来源与月份比较。',
 tasks:'普通内容、评论、作者及问题处理的具体样本。',
 discussion:'展示、解释、文件交付、在线执行与工具收费的关系。',
 progress:'北极星口径、四周MVP、供给成本及待补材料；历史研究验收另存。',
 makenow:'登录路径、公开案例、源画布、素材和使用范围。',
 strategy:'三类候选方向与四种可组合内容组织方式，按持续消费和参与比较。',
 supplement:'收费规则、规模披露、普通用户经历和相反证据。',
 evidence:'来源类型、观察日期、可支持的判断与研究限制。',
 validation:'围绕浏览、观看、回访与参与的招募、访谈和记录材料。',
};
