type Go=(target:string)=>void;
const personal=['mine','drafts','my-content','favorites','submissions','points','checkin','invite','following','joined-circles','profile','my-relations','my-circles','my-fans','profile-edit'];
const forms=['login','publish','generate','account-link','return-result','pc-handoff'];
const details=['post','tutorial','work','app'];
export function desktopLayout(page:string){return forms.includes(page)?'form':details.includes(page)?'detail':personal.includes(page)?'account':'browse';}
export function DesktopContext({page,go}:{page:string;go:Go}){
 const layout=desktopLayout(page);
 if(layout==='account'||layout==='browse'||layout==='form'||page==='post'||page==='tutorial')return null;
 const links=page.startsWith('app')?[['apps','浏览 AI 应用'],['topics','精选专题'],['mine','个人中心']]:page==='work'?[['aigc','浏览作品'],['topics','精选专题']]:[['circles','交流'],['tutorials','教程']];
 return <aside className="cp-desktop-context"><nav aria-label="继续浏览">{links.map(([id,label])=><button key={id} aria-current={page===id?'page':undefined} onClick={()=>go(id)}>{label}</button>)}</nav></aside>;
}
