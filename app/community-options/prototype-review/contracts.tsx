import {DocumentBlocks} from './document-blocks';
import {allPages} from '../c-prototype/page';
import {bPages} from '../b-prototype/page';
import {crossPages} from '../cross-prototype/data';
import cText from '../../../design-notes/requirements-c-flows.md?raw';
import bText from '../../../design-notes/requirements-b-content.md?raw';
import xText from '../../../design-notes/requirements-cross-product.md?raw';
type Edge=[string,string,string];
export const routes:Record<string,Edge[]>={
 home:[['精选专题','topic','专题仍公开'],['作品卡','work','同一作品身份'],['金刚入口','apps','浏览目录'],['每日签到','checkin','登录后主动签到']],
 topics:[['专题卡','topic','按后台发布顺序']],topic:[['作品','work','关联公开对象'],['教程','tutorial','关联公开对象'],['应用','app','进入详情，不直接扣费']],
 community:[['作品','work','公开作品；独立于首页后台选用及活动关联'],['帖子','post','带帖子标识'],['圈子','circles','保留帖子流状态'],['官方教程','tutorials','官方维护'],['发布','post-edit','登录后保留来源']],
 post:[['作者','author','同一作者'],['所属圈子','circle','圈子可访问'],['引用作品','work','目标失效不删除帖子讨论']],
 circles:[['圈子卡','circle','查看规则与内容']],circle:[['帖子','post','同一帖子与讨论'],['发帖','post-edit','公开圈子开放且本人有发布权限']],
 tutorials:[['教程卡','tutorial','按用途与排序浏览']],tutorial:[['关联资源','resource','教程和资源分开维护'],['作者','author','保留来源']],
 work:[['关联资源','resource','有公开引用才展示'],['作者','author','同一作者'],['再次创作','create','只在支持时出现']],
 search:[['作品结果','work','按内容类型分组'],['帖子结果','post','隐藏不可见对象'],['教程结果','tutorial','保留搜索词'],['应用结果','app','进入详情'],['作者结果','author','固定栏目']],
 author:[['作品栏目','work','只展示公开内容'],['帖子栏目','post','固定栏目无结果显示空态']],
 resource:[['查看项目','cross:project','电脑端检查公开权限']],
 create:[['生成','create','工作台内排队、生成和展示结果；报价取模型配置，演示积分不作为正式定价'],['发布作品','post-edit','主动选择结果后进入编辑，恢复该任务的活动关联'],['生成记录','create','工作台内打开历史记录，私有结果不自动发布']],
 'post-edit':[['提交','publish-status','页内预览确认后主动提交'],['保存草稿','drafts','保留活动与来源']],
 'publish-status':[['查看我的内容','my-content','按审核结果展示'],['返回编辑','post-edit','失败或退回时继续处理']],
 publish:[['编辑内容','post-edit','选择作品或帖子，保留活动身份'],['生成后发布','create','结果不自动公开']],
 mine:[['我的发布','my-content','区分公开状态'],['草稿','drafts','继续原对象'],['收藏','favorites','个人可见'],['关系','my-relations','关注与已加入圈子'],['资料','profile-edit','本人修改']],
 drafts:[['继续编辑','post-edit','恢复文本、媒体、活动身份']],
 'my-content':[['查看作品','work','按当前公开状态'],['继续编辑','post-edit','不覆盖仍公开版本']],
 favorites:[['打开收藏','work','按收藏对象类型跳转；失效说明状态']],
 'my-relations':[['已加入圈子','circle','退出不删除旧帖'],['已关注作者','author','恢复关系']],
 'profile-edit':[['保存','profile-edit','校验后在当前页显示结果'],['返回','mine','返回个人中心']],
 records:[['查看任务','app-task','受理未知查询原任务'],['查看结果','app-result','私有结果不自动发布']],
 login:[['登录完成','mine','弹层关闭后返回实际来源；不自动提交原动作'],['关闭登录','home','返回实际背景页，保留未提交输入']],notifications:[['查看审核','my-content','保留目标身份；失效不跳无关内容'],['查看投稿','submissions','以投稿记录为准']],
 activities:[['活动卡','activity','活动资格沿用现有业务']],activity:[['参与活动','activity','参与状态留在详情'],['发布投稿','publish','传递活动身份；结束或未解锁禁用']],
 submissions:[['查看活动','activity','保持投稿关联活动'],['查看稿件','my-content','保留审核状态']],
 points:[['签到','checkin','仅积分，无充值'],['兑换','shop','重新校验余额']],checkin:[['查看积分','points','成功才记账']],invite:[['查看积分','points','奖励取决于有效邀请条件']],
 shop:[['兑换记录','shop-records','成功、处理中、失败分别展示']],
 'shop-records':[['返回商城','shop','失败不扣费；未知不重复兑换']],
 'pc-handoff':[['返回内容','app','保留对象上下文'],['电脑继续','cross:project','PC打开后再校验权限']],
 'account-link':[['返回结果','return-result','授权失败可重试，不丢来源']],
 'return-result':[['发布作品','post-edit','结果先私有，主动发布']],
};
const bRoutes:Record<string,Edge[]>={
 works:[['编辑作品','b:work-edit','同 ID 草稿'],['预览','b:preview','同 ID 版本'],['查看引用','b:references','同 ID 对象']],
 posts:[['编辑帖子','b:post-edit','同 ID 草稿'],['预览','b:preview','同 ID 版本'],['查看引用','b:references','同 ID 对象']],
 tutorials:[['编辑教程','b:tutorial-edit','同 ID 草稿'],['预览','b:preview','同 ID 版本'],['查看引用','b:references','同 ID 对象']],
 apps:[['编辑应用','b:app-edit','同 ID 草稿'],['预览','b:preview','同 ID 版本'],['查看引用','b:references','同 ID 对象']],
 resources:[['编辑资源','b:resource-edit','同 ID 草稿'],['预览','b:preview','同 ID 版本'],['查看引用','b:references','同 ID 对象']],
 'work-edit':[['预览草稿','b:preview','保存后查看'],['提交审核','b:review','资料齐全'],['交接维护','b:transfer','确认授权'],['查看记录','b:history','同 ID 对象']],
  'post-edit':[['预览草稿','b:preview','保存后查看'],['提交审核','b:review','资料齐全'],['交接维护','b:transfer','确认授权'],['查看记录','b:history','同 ID 对象']],
  'tutorial-edit':[['预览草稿','b:preview','保存后查看'],['提交审核','b:review','资料齐全'],['交接维护','b:transfer','确认授权'],['查看记录','b:history','同 ID 对象']],
  'app-edit':[['预览草稿','b:preview','保存后查看'],['提交审核','b:review','资料齐全'],['交接维护','b:transfer','确认授权'],['查看记录','b:history','同 ID 对象']],
  'resource-edit':[['预览草稿','b:preview','保存后查看'],['提交审核','b:review','资料齐全'],['交接维护','b:transfer','确认授权'],['查看记录','b:history','同 ID 对象']],
 preview:[['继续编辑','b:work-edit','按原内容类型进入编辑'],['前往发布','b:release','公开版和编辑版分开校验']],
 reviews:[['处理任务','b:review','同 ID 审核']],review:[['查看待审内容','b:preview','保留版本'],['发布管理','b:release','通过后按内容类型生效'],['查询记录','b:history','结果未知时']],
 release:[['核验能力','b:verify','应用或资源能力'],['查看影响','b:references','下架前检查引用']],
 verify:[['发布管理','b:release','核验绑定执行版本']],references:[['查看引用对象','b:preview','按引用 ID 查看']],
  'op-topics':[['编辑专题','b:op-topic-edit','同 ID 编排']],
  'op-circles':[['编辑圈子','b:op-circle-edit','同 ID 规则']],
 'op-events':[['编辑活动','b:op-event-edit','同 ID 活动'],['查看投稿','b:op-submissions','规则、评审、奖励分开']],
};
const crossRoutes:Record<string,Edge[]>={
 project:[['复制项目','cross:copy','公开且许可复制'],['查看分享设置','cross:share','项目所有者'],['查看公开版本','cross:version','同一项目']],
 share:[['查看项目','cross:project','按当前分享范围'],['管理版本','cross:version','所有者维护']],
 version:[['查看项目','cross:project','发布或撤回后重新校验']],
 copy:[['查看个人副本','cross:library','复制成功后'],['返回公开项目','cross:project','权限不足或取消']],
 library:[['编辑副本','cross:editor','同一个人项目'],['查看公开项目','cross:project','另行校验']],
 editor:[['查看成果','cross:results','生成结果仍私有'],['衍生分享','cross:derivative','按取得时授权']],
 derivative:[['返回编辑','cross:editor','衍生授权受原版本约束'],['查看成果','cross:results','个人结果']],
 results:[['核对账号','cross:link','回流前'],['确认回流','cross:return','双端账号已关联']],
 link:[['继续回流','cross:return','账号匹配'],['返回成果','cross:results','绑定失败保留来源']],
 return:[['查看回流状态','cross:return-status','未知结果查询原尝试'],['返回成果','cross:results','未提交或取消']],
 'return-status':[['社区编辑','post-edit','确认成功后私人草稿'],['返回成果','cross:results','待确认时不重复提交']],
 workflow:[['检查导入','cross:workflow-import','文件和依赖满足条件']], 'workflow-import':[['返回资源','cross:workflow','失败可重试']],
 maintain:[['编辑教程','cross:maintain-tutorial','本人有维护权'],['编辑资源','cross:maintain-resource','本人有维护权'],['查看进度','cross:maintain-status','同一对象']],
 'maintain-tutorial':[['查看进度','cross:maintain-status','保存或提交后']], 'maintain-resource':[['查看进度','cross:maintain-status','保存或提交后']],
 'maintain-status':[['返回维护列表','cross:maintain','审核与正式发布分开']], review:[['查看公开项目','cross:project','示例路径入口']],
};
const cSections:Record<string,number[]>={'首页':[1],'专题':[3],'AI应用':[4],'资源与跨端':[4,7],'社区与帖子':[2,5],'圈子':[2,5],'教程':[2,4,5],'作品详情':[4,5],'搜索与作者':[3],'创作与发布':[6,7],'个人管理':[6],'账号与通知':[7],'活动':[6],'积分与任务':[6],'AI 商城':[6]};
const bSections:Record<string,number[]>={'内容管理':[2,3,4,5],'审核与发布':[4,5,7],'维护与记录':[5,7],'内容运营':[6],'社区运营':[6,7],'活动运营':[6,7],'账户服务':[6],'审核治理':[7],'系统管理':[2,7]};
const crossSections:Record<string,number[]>={'MakeNow 分享':[3,4],'MakeNow 复用':[3],'成果回流':[2,4],'资源取用':[5,6],'作者维护':[3,4],'走查':[1,7]};
function extract(text:string,indices:number[]){return text.split(/(?=^## \d+\.)/m).filter(s=>indices.some(n=>s.startsWith('## '+n+'.'))).join('\n');}
const cPageSections:Record<string,string[]>={
 home:['1'],community:['2.1'],post:['4.2','5'],circles:['2.2'],circle:['2.2'],tutorials:['2.3'],tutorial:['4.3','5'],
 work:['4.1','5'],resource:['4.5','5'],create:['0.1','8'],publish:['0.1','6.2','6.3'],
 topics:['3.1'],topic:['3.1'],search:['0.2','3.2'],author:['3.3'],
 mine:['6.1'],drafts:['6.1'],records:['6.1'],'my-content':['6.1','6.2'],favorites:['5','6.1'],
 'post-edit':['6.2'],'publish-status':['6.2'],activities:['6.3'],activity:['6.3'],submissions:['6.3'],shop:['6.4'],'shop-records':['6.4'],
};
const bPageSections:Record<string,string[]>={
 works:['2'],posts:['2'],tutorials:['2'],apps:['2'],resources:['2'],
 'work-edit':['3','4.1','4.3'],'post-edit':['3','4.1','4.3'],'tutorial-edit':['3','4.1','4.3'],'app-edit':['3','4.1','4.3'],'resource-edit':['3','4.1','4.3'],
 preview:['4.1'],reviews:['4.2','7'],review:['4.2','7'],release:['4.1','4.2'],references:['5.2'],transfer:['5.1'],history:['7'],
 'op-events':['6.1'],'op-event-edit':['6.1'],'op-submissions':['6.1'],'op-shop':['6.2'],
};
const xPageSections:Record<string,string[]>={project:['3.1'],share:['3.1'],version:['3.1'],copy:['3.1'],library:['3.1'],editor:['3.1'],derivative:['3.2'],results:['2.3','4'],link:['4'],return:['2.3','4'],'return-status':['2.3','4'],workflow:['5'],'workflow-import':['5']};
function extractPage(text:string,keys:string[]){return text.split(/(?=^#{2,3} )/m).filter(block=>{const key=block.match(/^#{2,3} ([\d.]+)\s/)?.[1].replace(/\.$/,'');return key&&keys.some(wanted=>key===wanted||key.startsWith(wanted+'.'));}).join('\n');}
export function PageRequirements({section,page}:{section:string;page:{id:string;title:string;module:string;states:string[]}}){
 const text=section==='c'?(cPageSections[page.id]?extractPage(cText,cPageSections[page.id]):extract(cText,cSections[page.module]||[1])):section==='b'?(bPageSections[page.id]?extractPage(bText,bPageSections[page.id]):extract(bText,bSections[page.module]||[1])):(xPageSections[page.id]?extractPage(xText,xPageSections[page.id]):extract(xText,crossSections[page.module]||[1]));
 return <section className="rv-requirements"><h3>{page.title} · 需求</h3><DocumentBlocks text={text}/></section>;
}
function targetTitle(target:string){const [prefix,id]=target.includes(':')?target.split(':'):['c',target];const key=id.split('?')[0];return (prefix==='b'?bPages:prefix==='cross'?crossPages:allPages).find(p=>p.id===key)?.title||target;}
export function ModuleFlow({section,pages,open}:{section:string;pages:{id:string;title:string}[];open:(target:string,source?:string)=>void}){
 const map=section==='b'?bRoutes:section==='cross'?crossRoutes:routes;
 const known=pages.flatMap(p=>(map[p.id]||[]).map(e=>({from:p,action:e[0],target:e[1],condition:e[2]})));
 return <section className="rv-requirements"><h3>模块页面与流转</h3><div className="rv-flow">{pages.map(p=><button key={p.id} onClick={()=>open((section==='c'?'':section+':')+p.id)}>{p.title}</button>)}</div>{known.length>0?<table><thead><tr><th>页面</th><th>动作</th><th>条件</th><th>去向</th></tr></thead><tbody>{known.map((e,i)=><tr key={i}><td>{e.from.title}</td><td>{e.action}</td><td>{e.condition}</td><td><button onClick={()=>open(e.target,e.from.id)}>{targetTitle(e.target)}</button></td></tr>)}</tbody></table>:<p>本组操作在各页面内完成。选择页面可查看状态、字段和对应需求。</p>}</section>;
}
