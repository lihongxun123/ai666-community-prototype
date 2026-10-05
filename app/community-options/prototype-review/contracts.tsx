import {deviceDestination} from '../navigation-model';
import {DocumentBlocks} from './document-blocks';
import {allPages} from '../c-prototype/page';
import {bPages} from '../b-prototype/page';
import {crossPages} from '../cross-prototype/data';
import {appEdges} from './app-review';
import './flow.css';
import cRequirements from '../../../design-notes/page-requirements-c.json';
import cCommonRequirements from '../../../design-notes/c-requirements-20261005/common-rules.json';
import cPendingRequirements from '../../../design-notes/c-requirements-20261005/decisions.json';
import bRequirements from '../../../design-notes/page-requirements-b.json';
import crossRequirements from '../../../design-notes/page-requirements-cross.json';
type Edge=[string,string,string,string?];
export const routes:Record<string,Edge[]>={
 aigc:[['作品卡','work','进入同一公开作品详情'],['作者署名','author','进入公开作者主页']],
 discussion:[['帖子','post','进入原帖'],['圈子','circles','发现圈子'],['教程','tutorials','浏览教程目录']],
 home:[['精选专题','topic','专题仍公开'],['专题入口','topics','浏览公开专题'],['作品卡','work','同一作品身份'],['AI应用入口','apps','浏览目录'],['活动入口','activities','浏览公开活动'],['每日签到','checkin','登录后主动签到']],
 topics:[['专题卡','topic','按后台发布顺序']],topic:[['作品','work','关联公开对象'],['教程','tutorial','关联公开对象'],['应用','app','进入详情，不直接扣费']],
 community:[['作品','work','公开作品；独立于首页后台选用及活动关联'],['帖子','post','带帖子标识'],['圈子','circles','保留帖子流状态'],['教程','tutorials','浏览公开教程']],
 post:[['作者','author','同一作者'],['所属圈子','circle','圈子可访问'],['引用作品','work','目标失效不删除帖子讨论']],
 circles:[['圈子卡','circle','手机进详情；PC 筛选帖子并更新圈子信息'],['查看全部','discover-circles','PC 发现列表；手机由圈子列表承接']],circle:[['帖子','post','同一帖子与讨论'],['发帖','post-publish','圈子开放、已加入且有发布权限']],
 'discover-circles':[['圈子','circles','PC 选中对应圈子，显示帖子与右侧资料']],
 tutorials:[['教程卡','tutorial','按用途与排序浏览']],tutorial:[['关联应用','app?item=restore','查看可复用能力'],['作者','author','保留来源']],
 work:[['关联应用','app?item=restore','有公开引用才展示'],['作者','author','同一作者'],['再次创作','create','只在支持时出现']],
 search:[['作品结果','work','按内容类型分组'],['帖子结果','post','隐藏不可见对象'],['教程结果','tutorial','保留搜索词'],['应用结果','app','进入详情'],['作者结果','author','查看作者公开内容'],['专题结果','topic','同一专题'],['圈子结果','circle','按设备进入圈子']],
 author:[['作品栏目','work','只展示公开内容'],['帖子栏目','post','固定栏目无结果显示空态']],
 'creation-entry':[['AIGC 生成','create','进入生成工作台'],['直接发布','post-edit','进入作品编辑'],['发布帖子','post-publish','进入帖子编辑；未登录先登录再继续']],
 create:[['查看结果','create-result','打开所选任务结果'],['发布作品','post-edit','选择结果后带入素材、提示词和活动关联'],['生成记录','records','查看本人任务与结果']],
 'create-result':[['继续调整','create','保留原任务输入'],['发布作品','post-edit','主动选择结果，保留活动关联'],['前往MakeNow','cross:app','同一账号继续；不自动传递素材或结果','MakeNow']],
 'post-publish':[['提交','my-content','主动提交帖子'],['保存草稿','drafts','保留圈子与活动']],
 'post-edit':[['提交','my-content','主动提交作品'],['保存草稿','drafts','保留活动与来源']],
 mine:[['内容管理','my-content','本人空间内切换内容面板'],['我的投稿','submissions','本人空间内查看投稿'],['草稿箱','drafts','继续原对象'],['生成记录','records','本人任务与结果'],['管理收藏','favorites','个人可见'],['我的圈子','my-circles','已加入圈子'],['关注作者','my-relations','已关注作者'],['我的粉丝','my-fans','回关与粉丝关系分开'],['编辑资料','profile-edit','本人修改']],
 'my-circles':[['已加入圈子','circle','退出不删除旧帖']],'my-relations':[['已关注作者','author','打开所选作者']],'my-fans':[['粉丝','author','打开对应公开作者主页']],
 'profile-edit':[['保存','profile-edit','校验后在当前页显示结果'],['返回','mine','返回个人中心']],
 login:[['登录完成','mine','恢复来源和输入；后续动作由用户再次提交','来源页面'],['取消登录','home','关闭弹层，保留输入','来源页面']],notifications:[['查看审核','my-content','保留目标身份；失效不跳无关内容'],['查看投稿','submissions','以投稿记录为准']],
 activities:[['活动卡','activity','查看期限、资格与任务']],activity:[['参与活动','activity','参与状态留在详情'],['发布作品','post-edit','活动可参与；选择直接发布，带入活动及任务'],['发布帖子','post-publish','任务要求发布帖子；带入活动及任务'],['生成后投稿','create','活动页内选择生成后进入创作，结果不自动公开']],
 points:[['签到','checkin','主动签到，奖励自动发放'],['兑换','shop','重新校验余额']],checkin:[['查看积分','points','成功才记账']],invite:[['查看积分','points','奖励取决于有效邀请条件']],
 shop:[['选择商品','shop-exchange','打开确认兑换弹层'],['兑换记录','shop-records','查看本人兑换历史']],
 'shop-exchange':[['查看兑换记录','shop-records','确认、提交、结果与不可兑换原因在弹层表达']],
 'shop-records':[['返回商城','shop','关闭记录或返回来源']],
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
 app:[['返回应用介绍','app','保留同一应用身份；真实MakeNow链接待配置，演示不生成或扣费']],
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
const localFlows:Record<string,string[]>={
 work:['喜欢、收藏、关注：更新本人关系；失败保留原状态。','评论：校验文字或单图 → 提交 → 展示确认结果；失败保留输入。','本人删除评论：确认 → 移除条目，不展示删除占位；合法回复保留。'],
 post:['图片：打开预览 → 切换图片 → 关闭返回原位置。','回复：选定对象 → 输入文字或单图 → 提交；可取消回复。','删除评论不显示占位；引用对象删除后隐藏引用，保留帖子正文。'],
 circle:['未加入 → 主动加入 → 已加入；退出后保留历史帖子。','圈子关闭 → 停止新加入和发帖；公开帖子按自身权限访问。'],
 circles:['选择推荐或圈子 → 更新帖子流与右侧资料。','加入或退出成功后更新本人关系与人数。'],
 'discover-circles':['未加入 → 加入成功 → 可进入；失败保留未加入状态。'],
 create:['输入与参数校验 → 提交 → 排队/生成 → 完成或失败。','积分不足：生成按钮禁用；结果未知：查询原任务，不重复提交。','生成结果为私人资产；发布需用户主动提交。'],
 'create-result':['打开指定任务 → 查看结果及参考素材 → 下载、继续调整或发布。','素材、提示词与活动关联保持原任务身份；结果不自动公开。'],
 'post-edit':['编辑 → 校验 → 提交；按实际审核结果展示状态。','保存草稿不公开、不算投稿；提交失败保留输入。'],
 'post-publish':['编辑 → 校验正文、媒体、引用和圈子 → 提交。','保存草稿不公开；失败保留输入与来源。'],
 mine:['主动下架 → 退出公开列表；恢复前重新校验公开资格。','删除需确认；删除内容不删除生成资产和必要投稿、奖励记录。'],
 'profile-edit':['编辑资料 → 校验 → 保存 → 显示结果；失败后重新核对实际资料。','手机号和微信绑定独立提交；唯一登录方式不可直接解绑。'],
 login:['完成身份验证 → 恢复来源；原操作由用户再次提交。','邀请绑定失败不阻断登录。'],
 notifications:['点击消息 → 标记已读 → 有效目标；无目标只标记已读。','全部已读只改变提醒状态，不改变业务处理结果。'],
 activity:['查看规则 → 主动参与 → 执行任务或投稿 → 核验有效结果 → 自动发奖。','活动结束或任务未解锁时，不能新参与对应任务。'],
 checkin:['未签到 → 主动签到 → 已签到；奖励自动发放。','日期按北京时间，同一天不能重复签到。'],
 invite:['邀请链接 → 登录或注册 → 校验邀请关系 → 首次成功绑定。','奖励按有效注册、互动等条件发放，分享本身不计奖励。'],
 shop:['选择有效商品 → 核对站点、价格和余额 → 确认兑换。'],
 'shop-exchange':['确认 → 提交 → 成功、明确失败或结果确认中。','未知结果查询原记录；返还处理中不显示已到账，不引导重复兑换。'],
 'shop-records':['成功且卡密有效 → 复制或前往产品；处理中 → 查询原记录。','返还按原积分批次判断有效期，已返还不等于全部恢复可用。'],
};
const requirements:Record<string,Record<string,string>>={c:cRequirements,b:bRequirements,cross:crossRequirements};
export function PageRequirements({section,page}:{section:string;page:{id:string;title:string;module:string;states:string[]}}){
 const text=requirements[section]?.[page.id];
 const handoff=cPendingRequirements.text.slice(cPendingRequirements.text.indexOf('| 编号 |')).split('\n## ')[0].trim();
 return <section className="rv-requirements rv-page-requirements" aria-label={page.title+'页面需求'}><h3>{page.title}</h3>{text?<DocumentBlocks text={section==='c'?text.replace(/^### [^\n]+\n\n/,''):text}/>:<p role="alert">该页面需求尚未配置。</p>}{section==='c'&&<><details className="rv-common-requirements"><summary>公共规则</summary><DocumentBlocks text={cCommonRequirements.text}/></details><details className="rv-common-requirements"><summary>研发对接项</summary><DocumentBlocks text={handoff}/></details></>}</section>;
}
function targetTitle(target:string,device:string){const panelLabels:Record<string,string>={'my-content':'我的内容',drafts:'草稿箱',records:'生成记录',favorites:'我的收藏',submissions:'我的投稿','my-relations':'我的关注','my-circles':'我的圈子','my-fans':'我的粉丝'};if(panelLabels[target])return panelLabels[target];const [prefix,id]=target.includes(':')?target.split(':'):['c',target];const key=prefix==='c'?deviceDestination(id.split('?')[0],id.split('?')[1]||'',device).id:id.split('?')[0];return (prefix==='b'?bPages:prefix==='cross'?crossPages:allPages).find(p=>p.id===key)?.title||target;}
function flowEdges(section:string,id:string,device:string):Edge[]{
 if(section==='c'&&id==='create'&&device!=='pc')return routes.create.map(edge=>edge[1]==='create-result'?[edge[0],'create','打开当前任务完整结果，不新增独立页面','工作台内结果视图']:edge);
 if(section==='c' && appEdges[id])return appEdges[id].filter(edge=>device!=='pc'||edge.action!=='获取电脑端链接').map(edge=>[edge.action,edge.target,edge.condition,edge.action==='获取电脑端链接'?'当前应用内电脑引导':edge.action==='在 MakeNow 中使用'?'MakeNow':undefined]);
 return (section==='b'?bRoutes:section==='cross'?crossRoutes:routes)[id]||[];
}
function sectionTarget(section:string,id:string){return (section==='c'?'':section+':')+id;}
export function ModuleFlow({section,pages,currentId,open,device='mobile'}:{section:string;pages:{id:string;title:string}[];currentId?:string;open:(target:string,source?:string)=>void;device?:string}){
 return <section className="rv-requirements rv-module-flow"><h3>模块流程</h3>{section==='c'&&currentId&&localFlows[currentId]&&<div className="rv-flow-states"><h4>状态变化</h4><ul>{localFlows[currentId].map(line=><li key={line}>{line}</li>)}</ul></div>}<div className="rv-flow-map" aria-label="页面流转图">{pages.map(page=>{
  const edges=flowEdges(section,page.id,device);
  return <div className={'rv-flow-group'+(edges.length?' has-edges':'')} key={page.id}>
   <button type="button" className="rv-flow-node rv-flow-origin" aria-current={currentId===page.id?'page':undefined} onClick={()=>open(sectionTarget(section,page.id))}>{page.title}</button>
   {edges.length>0&&<div className="rv-flow-branches">{edges.map(([action,target,condition,label],index)=><div className="rv-flow-branch" key={`${page.id}-${target}-${action}-${index}`}>
    <div className="rv-flow-action"><strong>{action}</strong>{condition&&<small>{condition}</small>}</div>
    <span className="rv-flow-arrow" aria-hidden="true">→</span>
    {label&&['来源页面','当前应用内电脑引导','工作台内结果视图'].includes(label)?<span className="rv-flow-node rv-flow-destination">{label}</span>:<button type="button" className="rv-flow-node rv-flow-destination" onClick={()=>open(target,page.id)}>{label||targetTitle(target,device)}</button>}
   </div>)}</div>}
  </div>;
 })}</div></section>;
}
