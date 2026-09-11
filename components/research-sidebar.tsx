'use client';
import {useEffect,useState} from 'react';
import {navigationGroups,viewTitle} from '@/lib/research-navigation';
import {groups} from '@/lib/research-types';
import type {Profile} from '@/lib/research-types';
import './research-structure.css';

export function ResearchSidebar({view,navigate,mobile,profiles}:{view:string;navigate:(id:string)=>void;mobile:boolean;profiles:Profile[]}){
 const currentGroup=navigationGroups.find(g=>g.views.some(id=>id===view))?.id;
 const [expanded,setExpanded]=useState<string[]>([]);
 const [platformsOpen,setPlatformsOpen]=useState(false);
 useEffect(()=>{if(currentGroup&&currentGroup!=='reading')setExpanded([currentGroup]);if(view==='matrix'||profiles.some(p=>p.id===view))setPlatformsOpen(true);},[currentGroup,view,profiles]);
 const toggle=(id:string)=>setExpanded(items=>items.includes(id)?items.filter(x=>x!==id):[...items,id]);
 const entry=(id:string)=><button key={id} onClick={()=>navigate(id)} aria-current={view===id?'page':undefined} className={view===id?'active':''}><span>{viewTitle(id)}</span>{view===id&&<span className="active-dot"/>}</button>;
 return <aside className={`sidebar research-sidebar ${mobile?'is-open':''}`} aria-label="研究目录">
  <div className="research-sidebar-scroll"><nav className="top-nav" aria-label="报告与专题">
   <div className="nav-primary">{navigationGroups[0].views.map(entry)}</div>
   <div className="nav-group"><button className="nav-group-toggle" onClick={()=>setPlatformsOpen(!platformsOpen)} aria-expanded={platformsOpen} aria-controls="platform-directory"><span>竞品档案</span><span aria-hidden="true">{platformsOpen?'−':'+'}</span></button>
    {platformsOpen&&<div id="platform-directory">{entry('matrix')}
    <nav className="profile-nav" aria-label="平台档案">{groups.map((category,index)=><section className="profile-category" key={category} aria-labelledby={`profile-category-${index}`}><h3 id={`profile-category-${index}`}>{category}</h3>{profiles.filter(item=>item.group===category).map(item=><button key={item.id} onClick={()=>navigate(item.id)} aria-current={view===item.id?'page':undefined} className={view===item.id?'active':''}><span className="nav-number">{String(profiles.indexOf(item)+1).padStart(2,'0')}</span><span>{item.name}</span>{view===item.id&&<span className="active-dot"/>}</button>)}</section>)}</nav></div>}
   </div>
   {navigationGroups.slice(1).map(g=><div className="nav-group" key={g.id}><button className="nav-group-toggle" onClick={()=>toggle(g.id)} aria-expanded={expanded.includes(g.id)} aria-controls={`nav-${g.id}`}><span>{g.title}</span><span aria-hidden="true">{expanded.includes(g.id)?'−':'+'}</span></button>{expanded.includes(g.id)&&<div id={`nav-${g.id}`} className="nav-group-links">{g.views.map(entry)}</div>}</div>)}
  </nav></div>
 </aside>;
}
