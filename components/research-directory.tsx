'use client';
import {ArrowRight} from 'lucide-react';
import {navigationGroups,topicDescriptions,viewTitle} from '@/lib/research-navigation';
import {groups} from '@/lib/research-types';
import {profiles} from '@/lib/profiles';
import './research-structure.css';
const chapters=[['quality','比较结论与证据覆盖'],['scope','有哪些平台，分别服务谁'],['needs','用户为什么消费和参与'],['content','内容如何展示与组织'],['supply','谁供给，怎样持续运营'],['business','工具、收费与投入怎样配合']];
export function ResearchDirectory({navigate}:{navigate:(id:string,anchor?:string)=>void}){
 const link=(id:string,title:string)=><a href={'#'+id} onClick={e=>{e.preventDefault();navigate(id);}}>{title}<ArrowRight size={14}/></a>;
 return <article className="research-directory">
  <header className="page-heading"><h1>研究总览</h1></header>
  <section className="directory-report"><div className="section-heading"><h2>竞品调研报告</h2>{link('report','阅读全文')}</div>
   <ol>{chapters.map(([id,title],i)=><li key={id}><a href="#report" onClick={e=>{e.preventDefault();navigate('report','report-'+id);}}><span>{String(i+1).padStart(2,'0')}</span>{title}<ArrowRight size={14}/></a></li>)}</ol>

  </section>
  <section className="directory-platforms"><div className="section-heading"><h2>竞品档案</h2>{link('matrix','平台对照')}</div><div className="directory-categories">{groups.map(group=><section key={group}><h3>{group}</h3><ul>{profiles.filter(p=>p.group===group).map(p=><li key={p.id}>{link(p.id,p.name)}</li>)}</ul></section>)}</div></section>
  {navigationGroups.filter(g=>g.id!=='reading').map(g=><section key={g.id} className="directory-section"><h2>{g.title}</h2><ul>{g.views.map(id=><li key={id}>{link(id,viewTitle(id))}<p>{topicDescriptions[id]}</p></li>)}</ul></section>)}
 </article>;
}
