'use client';
import {researchReadingLinks} from '@/lib/research-navigation';
import {ResearchStage} from './research-stage';
import {ArrowRight} from 'lucide-react';
import {groups} from '@/lib/research-types';
import {profiles} from '@/lib/profiles';
import './research-structure.css';
import './editorial-sample.css';
const modules=[
 {id:'market',title:'行业与用户',question:'行业如何运转，服务对象分别需要什么？',text:'从模型工具、可复用资源到内容消费，梳理创作者、实际应用者、学习者、资源贡献者和协作者的任务。社媒观看记录用于观察创作者面对的市场需求，全国使用与付费数据提供背景。',links:[['china-users','行业与角色']]},
 {id:'social',title:'社媒与需求',question:'社媒消费如何反映创作者市场需求、选题与合作对象？',text:'围绕14个领域与8项任务，研究抖音、小红书、B站的需求、供给和已有解决办法。这两组分类与社区方案的九个主题分别统计，范围也不同。',links:[['content-demand','社媒与内容']]},
 {id:'competitors',title:'竞品研究',question:'平台怎样把内容、用户与工具连接起来？',text:'15 家平台的分类、内容详情、使用路径、供给机制与收费方式。先读综合报告，再按平台或专题查阅。',links:[['report','竞品报告'],['content','内容与页面'],['operations','平台运营']]},
 {id:'planning',title:'社区方案',question:'已选主题怎样组织内容、提供帮助？',text:'实践案例是主线，创作交流保留独立入口，九个重点主题已选。提供具体帮助前，需明确承接者、授权与维护责任。北极星指标为周活用户数。',links:[['strategy','方案与承接']]},
];
export function ResearchDirectory({navigate:_navigate}:{navigate:(id:string,anchor?:string)=>void}){
 const link=(id:string,title:string)=><a href={'?#'+id} target="_blank" rel="noopener noreferrer" title="在新标签页打开">{title}<ArrowRight size={14}/></a>;
 return <article className="research-directory editorial-overview">
 <header className="page-heading"><h1>研究总览</h1></header>
 <nav className="overview-outline" aria-label="研究模块">{modules.map((m,i)=><a key={m.id} href="#overview" onClick={e=>{e.preventDefault();document.getElementById('overview-'+m.id)?.scrollIntoView({behavior:'smooth'});}}><span>0{i+1}</span>{m.title}</a>)}</nav>
 <ResearchStage/><div className="overview-modules">{modules.map((m,i)=><section id={'overview-'+m.id} key={m.id} className="overview-module"><div className="module-number">0{i+1}</div><div><h2>{m.title}</h2><h3>{m.question}</h3><p>{m.text}</p><div className="module-links">{m.links.map(([id,title])=><span key={id}>{link(id,title)}</span>)}{researchReadingLinks.filter(link=>link.group===m.id).map(link=><span key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.title}<ArrowRight size={14}/></a></span>)}</div></div></section>)}</div>
 <section className="directory-platforms"><div className="section-heading"><h2>按平台查阅</h2></div><div className="directory-categories">{groups.map(group=><section key={group}><h3>{group}</h3><ul>{profiles.filter(p=>p.group===group).map(p=><li key={p.id}>{link(p.id,p.name)}</li>)}</ul></section>)}</div></section>
 <section className="overview-boundary"><h2>结论适用范围</h2><p>现有资料支持平台机制、内容组织和使用路径的比较。社媒作品样本不代表全站需求，平台功能与收费规则也不能直接证明留存或盈利。具体限制随对应数据和案例列出。</p>{link('evidence','来源与方法')}{researchReadingLinks.filter(item=>item.group==='evidence').map(item=><p key={item.href}><a href={item.href} target="_blank" rel="noopener noreferrer">{item.title} ↗</a></p>)}</section>
 </article>;
}
