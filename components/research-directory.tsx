'use client';
import {ResearchCompletion} from '@/components/research-completion';
import {ArrowRight} from 'lucide-react';
import {navigationGroups,topicDescriptions,viewTitle} from '@/lib/research-navigation';
import './research-structure.css';

const chapters=[["scope","目标人群与平台参照"],["needs","持续消费与参与价值"],["content","内容发现、保存与回访"],["supply","内容供给与持续运营"],["business","工具投入与平台经营机制"],["implications","候选方向与验证条件"]];
export function ResearchDirectory({navigate}:{navigate:(id:string,anchor?:string)=>void}){
 return <article className="research-directory">
  <header className="page-heading"><h1>研究目录</h1></header>
  <section className="directory-report"><div className="section-heading"><h2>主报告</h2><a href="#report" onClick={e=>{e.preventDefault();navigate('report');}}>阅读全文 <ArrowRight size={15}/></a></div>
   <ol>{chapters.map(([id,title],i)=><li key={id}><a href="#report" onClick={e=>{e.preventDefault();navigate('report',`report-${id}`);}}><span>{String(i+1).padStart(2,'0')}</span>{title}<ArrowRight size={14}/></a></li>)}</ol>
   <div className="brief-links"><a className="directory-download" href="/research-kit/community-research-report.md" download>下载主报告正文</a><a className="directory-download" href="/research-kit/ai-community-report-2026-09-11-northstar.zip" download>下载完整汇报资料包</a></div>
  </section>
  <section className="directory-current"><ResearchCompletion compact/><a href="#progress" onClick={e=>{e.preventDefault();navigate('progress');}}>查看执行计划 →</a></section><section className="directory-platforms"><h2>竞品档案</h2><p>按平台查看产品、用户、运营、商业化、截图和实操记录。</p><button onClick={()=>navigate('matrix')}>打开平台对照与档案 <ArrowRight size={15}/></button></section>
  {navigationGroups.filter(g=>g.id!=='reading').map(g=><section key={g.id} className="directory-section"><h2>{g.title}</h2><ul>{g.views.map(id=><li key={id}><a href={`#${id}`} onClick={e=>{e.preventDefault();navigate(id);}}>{viewTitle(id)}<ArrowRight size={14}/></a><p>{topicDescriptions[id]}</p></li>)}</ul></section>)}
 </article>;
}
