export const loadingLayouts:Record<string,string>={apps:'grid',community:'posts',circles:'rows',tutorials:'rows',search:'rows','my-content':'rows',drafts:'rows',records:'rows',favorites:'rows',notifications:'rows',activities:'banners',submissions:'rows',points:'rows',invite:'rows',shop:'grid',circle:'circle',author:'author',activity:'activity',mine:'mine'};
export type CommonSample={id:string;title:string;applies:string;url:string;page?:string;state?:string};
const c=(page:string,state:string,title:string,applies:string):CommonSample=>({id:page+'-'+state,title,applies,page,state,url:`/community-options/c-prototype?page=${page}&state=${state}&embed=1&contentOnly=1${page==='search'?'&q='+encodeURIComponent('不存在的示例关键词'):''}`});
const demo=(id:string,title:string,applies:string):CommonSample=>({id,title,applies,url:'/community-options/common-states?sample='+id});
export const commonGroups=[
 {id:'loading',title:'加载骨架',samples:[c('home','loading','首页','首页首次加载'),c('topics','loading','大图列表','专题列表'),c('apps','loading','双列卡片','AI应用、商城'),c('community','loading','帖子列表','社区内容流'),c('records','loading','记录列表','内容、草稿、生成记录、收藏、通知、投稿、积分记录'),c('tutorials','loading','图文列表','教程、圈子列表、搜索结果'),c('activities','loading','活动列表','活动中心'),...['topic','work','post','tutorial','app','resource','circle','author','activity','mine'].map((p,i)=>c(p,'loading',['专题详情','作品详情','帖子详情','教程详情','AI应用详情','资源详情','圈子详情','作者主页','活动详情','我的'][i],'对应页面首次加载'))]},
 {id:'empty',title:'空内容',samples:[c('topics','empty','内容列表为空','无可浏览内容'),c('topic','empty','详情中的内容为空','容器存在，尚无关联内容；不代表内容下架'),c('drafts','empty','首次没有内容','草稿、收藏、个人内容等，各自保留下一步动作'),c('search','empty','搜索无结果','保留关键词，允许修改后重试'),c('tutorials','empty','筛选无结果','保留条件，可清除筛选')]},
 {id:'partial',title:'加载与媒体异常',samples:[c('topics','error','整页加载失败','首次加载失败，可重试'),c('topic','error','详情加载失败','与下架、无权限分开'),demo('more-loading','加载更多','已有内容保持可见'),c('home','more-error','加载更多失败','只重试列表尾部'),demo('end','已到末尾','结束继续加载'),c('home','image-error','图片加载失败','保留卡片与入口'),c('work','media-error','媒体加载失败','媒体失败不隐藏标题和互动'),c('tutorial','partial','局部关联失效','正文可读，关联资源单独处理')]},
 {id:'actions',title:'输入与操作反馈',samples:[demo('validation','字段校验','就近提示，保留已填内容'),demo('upload','上传中与失败重试','局部反馈，可取消；文件演示不实际上传'),demo('submit','提交中与防重复点击','提交期间锁定按钮，成功后不再次提交'),demo('action-error','操作失败与重试','保留输入，不自动重发'),demo('success','操作成功','轻提示，不强制跳页')]},
 {id:'identity',title:'登录与身份',samples:[demo('guest','未登录','需要身份的动作；登录后返回，不代用户提交'),demo('session-expired','登录过期','保留当前输入，重新登录后恢复'),demo('account-changed','账号切换','未完成内容按账号隔离，不带给新账号')]},
 {id:'permissions',title:'权限与访问',samples:[demo('view-denied','无查看权限','不展示受限正文与内部原因'),demo('action-denied','无操作权限','阅读与提交权限分开，保留输入'),demo('readonly','仅可查看','不提供复制、编辑或运行入口')]},
 {id:'availability',title:'内容与能力',samples:[demo('removed','内容不可访问','内容已下架或不存在；返回可浏览位置'),demo('revoked','资源授权撤回','停用取用入口，不连带删除教程正文'),demo('paused','应用暂停','停止新任务，保留说明与已有记录')]},
 {id:'editing',title:'编辑保护',samples:[demo('unsaved','未保存离开','保留、保存或主动放弃；保存失败不能离开'),demo('save-error','保存失败','保留编辑内容，允许重试'),demo('conflict','版本冲突','不覆盖最新版本，可对照并保留本次修改')]},
 {id:'uncertain',title:'结果待确认',samples:[demo('unknown','结果不确定','只查询原请求，不自动重新提交或宣布退款')]},
 {id:'device',title:'设备与跨端',samples:[demo('mobile-only','手机不支持编辑','详情中引导电脑端，仍可浏览与交流'),demo('copy-error','复制失败','提供可选中的链接供手动复制')]},
 {id:'network',title:'网络与服务',samples:[demo('offline','断网','保留已加载内容，不自动重发写入'),demo('read-timeout','读取超时','仅限读取请求，可手动重试'),demo('service-unavailable','服务暂不可用','不承诺恢复时间，不连续自动重试')]}

];
// Shared feedback is reviewed once in the common-state board. Business lifecycle
// states (including settlement, moderation and upstream authorization) stay on their pages.
const sharedFeedback = new Set([
 'loading','empty','error','more-error','image-error','media-error',
 'action-error','failure','load-failed','guest','login-expired','account-switched',
 'validation','invalid','uploading','upload-failed','save-failed','save-error',
 'submit-failed','submit-error','conflict','no-permission','permission-denied',
]);
const commonPairs = new Set(commonGroups.flatMap(g=>g.samples)
 .filter(s=>s.page&&s.state).map(s=>s.page+':'+s.state));
export function isCoveredCommonState(page:string,state:string,section='c'){
 if(section==='c'&&['create','shop','publish-status'].includes(page)&&state==='failure')return false;
 // Error here is a cross-product account-link result, not a generic read failure.
 if(state==='error'&&((section==='c'&&['account-link','return-result'].includes(page))||(section==='cross'&&page==='link')))return false;
 if(sharedFeedback.has(state))return true;
 if(section==='c'){
  if(commonPairs.has(page+':'+state))return true;
  if(state==='forbidden'||state==='guest')return true;
  if(page==='pc-handoff'&&state==='copy-failed')return true;
  // Removed content in personal records still needs its own recovery actions.
  if(state==='removed'&&['post','tutorial','work','circle','author','app','resource','topic'].includes(page))return true;
 }
 return false;
}
