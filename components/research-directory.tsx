'use client';
import {ArrowRight} from 'lucide-react';
import {navigationGroups,topicDescriptions,viewTitle} from '@/lib/research-navigation';
import './research-structure.css';

const chapters=[
 ['scope','平台分类与参照关系'],['needs','用户需求与产品价值'],['content','内容发现与使用路径'],
 ['supply','内容供给与运营机制'],['business','商业化路径与公开规模'],['implications','多元拾光的采用条件'],
];
export function ResearchDirectory({navigate}:{navigate:(id:string,anchor?:string)=>void}){
 return <article className="research-directory">
  <header className="page-heading"><h1>研究目录</h1></header>
  <section className="directory-report"><div className="section-heading"><h2>主报告</h2><a href="#report" onClick={e=>{e.preventDefault();navigate('report');}}>阅读全文 <ArrowRight size={15}/></a></div>
   <ol>{chapters.map(([id,title],i)=><li key={id}><a href="#report" onClick={e=>{e.preventDefault();navigate('report',`report-${id}`);}}><span>{String(i+1).padStart(2,'0')}</span>{title}<ArrowRight size={14}/></a></li>)}</ol>
   <div className="brief-links"><a className="directory-download" href="/research-kit/community-research-report.md" download>下载主报告正文</a><a className="directory-download" href="/research-kit/ai-community-report-2026-09-11-conditions.zip" download>下载完整汇报资料包</a></div>
  </section>
  <section className="directory-platforms"><h2>竞品档案</h2><p>按平台查看产品、用户、运营、商业化、截图和实操记录。</p><button onClick={()=>navigate('matrix')}>打开平台对照与档案 <ArrowRight size={15}/></button></section>
  {navigationGroups.filter(g=>g.id!=='reading').map(g=><section key={g.id} className="directory-section"><h2>{g.title}</h2><ul>{g.views.map(id=><li key={id}><a href={`#${id}`} onClick={e=>{e.preventDefault();navigate(id);}}>{viewTitle(id)}<ArrowRight size={14}/></a><p>{topicDescriptions[id]}</p></li>)}</ul></section>)}
 </article>;
}
