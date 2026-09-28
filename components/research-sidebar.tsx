'use client';
import {useEffect,useState,useRef} from 'react';
import {navigationGroups,viewTitle,researchReadingLinks} from '@/lib/research-navigation';
import {proposalNavigation,proposalSections} from '@/lib/proposal-navigation';
import {groups} from '@/lib/research-types';
import type {Profile} from '@/lib/research-types';
import './research-structure.css';
export function ResearchSidebar({view,navigate,profiles,routePath=''}:{view:string;navigate:(id:string)=>void;profiles:Profile[];routePath?:string}){
 const scrollRef=useRef<HTMLDivElement>(null);
 const [restored,setRestored]=useState(false);const restoreScroll=useRef<number|null>(null);
 const [location,setLocation]=useState(routePath);
 const [expanded,setExpanded]=useState<string[]>([]);
 const [platformsOpen,setPlatformsOpen]=useState(false);
 useEffect(()=>{const read=()=>setLocation(window.location.pathname+window.location.search+window.location.hash);read();window.addEventListener('hashchange',read);window.addEventListener('popstate',read);return()=>{window.removeEventListener('hashchange',read);window.removeEventListener('popstate',read);};},[routePath,view]);
 const pathname=location.split(/[?#]/)[0];
 const currentGroup=profiles.some(p=>p.id===view)?'competitors':researchReadingLinks.find(x=>x.href===pathname||(x.href==='/community-options/fusion'&&pathname.startsWith(x.href+'/')))?.group||(pathname.startsWith('/community-options/')?'planning':navigationGroups.find(g=>g.views.some(id=>id===view))?.id);
 useEffect(()=>{if(currentGroup&&currentGroup!=='reading')setExpanded(items=>items.includes(currentGroup)?items:[...items,currentGroup]);if(profiles.some(p=>p.id===view))setPlatformsOpen(true);},[currentGroup,view,profiles]);
 useEffect(()=>{try{const saved=JSON.parse(sessionStorage.getItem('research-open-groups')||'[]');if(Array.isArray(saved))setExpanded(items=>[...new Set([...items,...saved.filter(x=>typeof x==='string')])]);restoreScroll.current=Number(sessionStorage.getItem('research-nav-scroll')||0);}catch{}setRestored(true);},[]);
 useEffect(()=>{if(restored&&scrollRef.current&&restoreScroll.current!==null){scrollRef.current.scrollTop=restoreScroll.current;restoreScroll.current=null;}},[restored,expanded]);
 const toggle=(id:string)=>setExpanded(items=>{const next=items.includes(id)?items.filter(x=>x!==id):[...items,id];try{sessionStorage.setItem('research-open-groups',JSON.stringify(next));}catch{}return next;});
 const active=(href:string)=>{const target=new URL(href,'http://research.local');const current=new URL(location||'/','http://research.local');if(href==='/community-options/fusion'&&current.pathname.startsWith(href+'/')&&!current.pathname.startsWith(href+'/gallery'))return true;if(target.pathname!==current.pathname)return false;if(target.search)return target.search===current.search&&target.hash===current.hash;if(target.hash)return target.hash===current.hash;if(href.startsWith('/community-options/proposals/'))return !current.search&&!current.hash;return true;};
 const route=(href:string,title:string)=><a key={href} className={'research-route-link'+(active(href)?' active':'')} aria-current={active(href)?'page':undefined} href={href}>{title}</a>;
 const entry=(id:string)=><button key={id} onClick={()=>navigate(id)} aria-current={!routePath&&!location.includes('?section=')&&view===id?'page':undefined} className={!routePath&&!location.includes('?section=')&&view===id?'active':''}><span>{viewTitle(id)}</span></button>;
 return <aside className="sidebar research-sidebar" aria-label="研究目录"><div className="research-sidebar-scroll" ref={scrollRef} onScroll={e=>{try{sessionStorage.setItem('research-nav-scroll',String(e.currentTarget.scrollTop));}catch{}}}><nav className="top-nav" aria-label="报告与专题">
 <div className="nav-primary">{navigationGroups[0].views.map(entry)}{researchReadingLinks.filter(x=>x.group==='reading').map(x=>route(x.href,x.title))}</div>
 {navigationGroups.slice(1).filter(g=>g.id!=='evidence').map(g=><div className="nav-group" key={g.id}><button className="nav-group-toggle" onClick={()=>toggle(g.id)} aria-expanded={expanded.includes(g.id)} aria-controls={'nav-'+g.id}><span>{g.title}</span><span aria-hidden="true">{expanded.includes(g.id)?'−':'+'}</span></button>{expanded.includes(g.id)&&<div id={'nav-'+g.id} className="nav-group-links">{g.views.map(entry)}{researchReadingLinks.filter(x=>x.group===g.id).map(x=>route(x.href,x.title))}
 {g.id==='planning'&&proposalNavigation.map(p=><details className="nav-proposal" key={p.id} open={pathname==='/community-options/proposals/'+p.id||undefined}><summary>{p.id.toUpperCase()} · {p.name}</summary>{route('/community-options/proposals/'+p.id,'方案说明')}<details open={pathname==='/community-options/proposals/'+p.id||undefined}><summary>全部概念稿 · {p.images.length}</summary>{p.images.map((title,i)=>route('/community-options/proposals/'+p.id+'?concept='+i+'#concepts',title))}</details>{proposalSections.map(([id,label])=>route('/community-options/proposals/'+p.id+'#'+id,label))}{p.id==='a'&&<>{route('/community-options/product-sample/concepts','九类专题概念')}{route('/community-options/content-system','内容与产品结构')}{route('/community-options/content-plan','内容布局')}{route('/community-options/operation-plan','运营分工')}</>}</details>)}
 {g.id==='competitors'&&<div className="nav-platform-subgroup"><button className="nav-group-toggle" onClick={()=>setPlatformsOpen(!platformsOpen)} aria-expanded={platformsOpen}><span>按平台查阅</span><span>{platformsOpen?'−':'+'}</span></button>{platformsOpen&&<nav className="profile-nav" aria-label="平台档案">{groups.map(category=><section className="profile-category" key={category}><h3>{category}</h3>{profiles.filter(p=>p.group===category).map(p=><button key={p.id} onClick={()=>navigate(p.id)} className={view===p.id?'active':''} aria-current={view===p.id?'page':undefined}>{p.name}</button>)}</section>)}</nav>}</div>}
 </div>}</div>)}
 <div className="nav-support">{entry('evidence')}{researchReadingLinks.filter(x=>x.group==='evidence').map(x=>route(x.href,x.title))}</div>
 </nav></div></aside>;
}
