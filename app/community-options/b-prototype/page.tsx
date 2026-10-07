'use client';
/* oxlint-disable next/no-html-link-for-pages -- Standalone prototype entry. */
import {useEffect,useState,useSyncExternalStore} from 'react';
import {App,Button,ConfigProvider,Result,theme} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import {WorkManagement,worksPages} from './work-management';
import {ContentManagement,contentManagementPages} from './content-management';
import {TutorialManagement} from './tutorial-management';
import {TopicManagement} from './topic-management';
import {OperationsManagement,operationsManagementPages} from './operations-management';
import {PlatformManagement,platformPages} from './platform-management';
import {ModelSeriesManagement,modelSeriesPages} from './model-series-management';
import {DisplaySlotManagement} from './display-slot-management';
import {SignInManagement} from './sign-in-management';
import {ActivityManagement} from './activity-management';
import {UserManagement} from './user-management';
import {UserSupportManagement} from './user-support-management';
import {AigcManagement,aigcPages} from './aigc-management';
import {RetainedOperationsManagement,retainedOperationsPages} from './retained-operations-management';
import {AnnouncementManagement} from './announcement-management';
import {SystemManagement} from './system-management';
import {ShopManagement} from './shop-management';
import './prototype.css';
import './admin-shell.css';
import './modern-shell.css';
const permissionSamples=['no-permission','permission-denied','read-only','readonly','permission-revoked','unauthorized'];
export const bPages=[...worksPages,...contentManagementPages,...operationsManagementPages,...modelSeriesPages,...platformPages.filter(p=>!aigcPages.some(a=>a.id===p.id)),...aigcPages,...retainedOperationsPages,{id:'system-permissions',title:'权限管理',module:'系统管理',states:['normal','empty','load-failed','permission-denied','save-failed']},
{id:'user-register-sources',title:'注册来源',module:'用户管理',states:['normal','empty','load-failed','permission-denied','save-failed']},
{id:'user-member-levels',title:'会员等级',module:'用户管理',states:['normal','empty','load-failed','permission-denied','save-failed']},
{id:'permission-example',title:'无权限示例',module:'通用页面',states:['normal']}
].map(p=>['users','op-points','op-invite'].includes(p.id)?{...p,title:({users:'用户列表','op-points':'积分记录','op-invite':'邀请记录'} as Record<string,string>)[p.id],module:'用户管理'}:p.id==='system-roles'?{...p,title:'角色管理'}:p.id==='system-admins'?{...p,title:'后台用户管理'}:p).map(p=>({...p,states:p.states.filter(s=>!permissionSamples.includes(s))}));
export const backendNavigation=[
 {title:'内容管理',items:['works','posts','tutorials','apps','comments','reviews']},
 {title:'AIGC管理',items:['aigc-series','aigc-models','aigc-generations']},
 {title:'运营管理',items:['op-circles','op-topics','op-taxonomy','op-login-popup','op-slots','op-events','op-shop','op-checkin','announcements','notifications-admin']},
 {title:'用户管理',items:['users','user-register-sources','op-invite','op-points','user-member-levels']},
 {title:'数据分析',items:['analytics-overview','analytics-growth','analytics-users','analytics-creation','analytics-content','analytics-activity','analytics-quality','analytics-metrics']},
 {title:'系统管理',items:['system-logs','system-roles','system-permissions','system-admins']},
];
const aliases:Record<string,string>={'analytics-channels':'analytics-growth','analytics-incentives':'analytics-activity','op-redemptions':'op-shop','op-submissions':'op-events','op-features':'op-slots',resources:'apps','resource-edit':'app-edit','op-permissions':'system-roles',review:'reviews'};
const auxiliary=['preview','release','verify','transfer','history','references'];
export const backendParents:Record<string,string>={'aigc-model-detail':'aigc-models','aigc-runtime-detail':'aigc-models','work-detail':'works','work-edit':'works','post-detail':'posts','post-edit':'posts','tutorial-detail':'tutorials','tutorial-edit':'tutorials','app-detail':'apps','app-edit':'apps','op-circle-edit':'op-circles','op-topic-edit':'op-topics','op-event-edit':'op-events'};
function subscribe(cb:()=>void){window.addEventListener('popstate',cb);return()=>window.removeEventListener('popstate',cb);}
export default function Backend(){
 const search=useSyncExternalStore(subscribe,()=>location.search,()=>''),hydrated=useSyncExternalStore(()=>()=>{},()=>true,()=>false),q=new URLSearchParams(search),requested=q.get('page')||'works',kind=q.get('id')?.split('-')[0],page=aliases[requested]||(auxiliary.includes(requested)?`${['work','post','tutorial','app'].includes(kind||'')?kind:'app'}-detail`:requested),state=['unknown','review-unknown','result-unknown',...permissionSamples].includes(q.get('state')||'')?'normal':q.get('state')||'normal';
 const [collapsed,setCollapsed]=useState<string[]>([]);
 useEffect(()=>{if(requested!==page){const next=new URLSearchParams(location.search);next.set('page',page);next.delete('state');history.replaceState(null,'','?'+next);window.dispatchEvent(new Event('popstate'));}},[requested,page]);
 const meta=bPages.find(p=>p.id===page),parent=backendParents[page]||page,group=backendNavigation.find(g=>g.items.includes(parent));
 const go=(target:string,confirmed=false)=>{if(!confirmed&&!window.dispatchEvent(new CustomEvent('prototype-before-navigate',{cancelable:true,detail:{proceed:()=>go(target,true)}})))return;const [id,rest]=target.split('?'),params=new URLSearchParams(rest);params.set('page',id);if(q.has('embed'))params.set('embed','1');if(q.has('detailOnly'))params.set('detailOnly','1');history.pushState(null,'','?'+params);window.dispatchEvent(new Event('popstate'));window.scrollTo(0,0);};
 if(!hydrated)return <main aria-busy="true"/>;
 const isWork=worksPages.some(p=>p.id===page);
 return <ConfigProvider locale={zhCN} theme={{algorithm:theme.defaultAlgorithm,token:{borderRadius:4,colorPrimary:'#1677ff',fontFamily:'Arial,"Microsoft Yahei",sans-serif'}}}><App><div className={'bp-shell bp-nav-layout '+(q.has('detailOnly')?'bp-detail-only ':'')+(isWork?'bp-admin':'bp-modern')} data-page={page} data-state={state}><aside className="bp-nav"><a className="bp-brand" href="/community-options/b-prototype?page=works">多元拾光<span>运营管理后台</span></a><nav aria-label="后台导航">{backendNavigation.map(g=><section key={g.title}><button className="bp-nav-group" aria-expanded={!collapsed.includes(g.title)} onClick={()=>setCollapsed(v=>v.includes(g.title)?v.filter(x=>x!==g.title):[...v,g.title])}><span>{g.title}</span><span aria-hidden="true">{collapsed.includes(g.title)?'›':'⌄'}</span></button>{!collapsed.includes(g.title)&&g.items.map(id=><button key={id} aria-current={parent===id?'page':undefined} className={parent===id?'active':''} onClick={()=>go(id)}>{bPages.find(p=>p.id===id)?.title||id}</button>)}</section>)}</nav></aside><div className="bp-main"><header className="bp-header"><span>{group?.title||'管理后台'}<span className="bp-crumb"> / </span>{meta?.title||'页面不存在'}</span><span className="bp-identity"><i aria-hidden="true">运</i> 内容运营</span></header><div className="bp-location"><button onClick={()=>go(parent)} aria-current={parent===page?'page':undefined}>{bPages.find(p=>p.id===parent)?.title}</button>{parent!==page&&<span>{meta?.title}</span>}</div><main>{page==='permission-example'?<Result status="403" title="暂无访问权限" subTitle="请联系管理员开通权限。" extra={<Button type="primary" onClick={()=>go('works')}>返回作品管理</Button>}/>:isWork?<WorkManagement key={search} page={page} state={state} go={go}/>:['tutorials','tutorial-detail','tutorial-edit'].includes(page)?<TutorialManagement key={search} page={page} state={state} go={go}/>:contentManagementPages.some(p=>p.id===page)?<ContentManagement key={search} page={page} state={state} go={go}/>:page==='op-checkin'?<SignInManagement state={state}/>:page==='op-slots'?<DisplaySlotManagement key={search} state={state}/>:['op-events','op-event-edit'].includes(page)?<ActivityManagement key={search} page={page} state={state} go={go}/>:page==='op-shop'?<ShopManagement key={search} state={state} initialTab={requested==='op-redemptions'?'records':'catalog'}/>:page==='users'?<UserManagement key={search} state={state} go={go}/>:['user-register-sources','user-member-levels','op-points','op-invite'].includes(page)?<UserSupportManagement key={search} page={page} state={state} go={go}/>:retainedOperationsPages.some(p=>p.id===page)?<RetainedOperationsManagement key={search} page={page} state={state} go={go}/>:aigcPages.some(p=>p.id===page)?<AigcManagement key={search} page={page} state={state} go={go}/>:page==='announcements'?<AnnouncementManagement key={search} state={state}/>:['op-topics','op-topic-edit'].includes(page)?<TopicManagement key={search} page={page} state={state} go={go}/>:operationsManagementPages.some(p=>p.id===page)?<OperationsManagement key={search} page={page} state={state} go={go}/>:page==='aigc-series'?<ModelSeriesManagement key={search} state={state}/>:['system-roles','system-permissions','system-admins','system-logs'].includes(page)?<SystemManagement key={search} page={page} state={state} go={go}/>:platformPages.some(p=>p.id===page)?<PlatformManagement key={search} page={page} state={state} go={go}/>:<Result status="404" title="页面不存在"/>}</main></div></div></App></ConfigProvider>;
}
