type Go=(target:string)=>void;
const personal=['mine','drafts','my-content','favorites','submissions','points','checkin','invite','following','joined-circles','profile','my-relations','profile-edit'];
const forms=['login','publish','generate','app-input','account-link','return-result','pc-handoff'];
const details=['post','tutorial','work','resource','app','app-task','app-result'];
export function desktopLayout(page:string){return forms.includes(page)?'form':details.includes(page)?'detail':personal.includes(page)?'account':'browse';}
export function DesktopContext({page,go}:{page:string;go:Go}){
 const layout=desktopLayout(page);
 if(layout==='browse'||layout==='form')return null;
 const links=layout==='account'?[['mine','个人中心'],['my-content','我的发布'],['drafts','草稿箱'],['favorites','我的收藏'],['submissions','活动投稿'],['points','积分明细'],['checkin','每日签到'],['invite','邀请有礼']]:page.startsWith('app')?[['apps','浏览 AI 应用'],['topics','精选专题'],['mine','个人中心']]:page==='work'?[['aigc','浏览作品'],['topics','精选专题']]:[['discussion','交流'],['circles','发现圈子'],['tutorials','官方教程']];
 return <aside className="cp-desktop-context"><nav aria-label={layout==='account'?'个人管理':'继续浏览'}>{links.map(([id,label])=><button key={id} aria-current={page===id?'page':undefined} onClick={()=>go(id)}>{label}</button>)}</nav></aside>;
}
