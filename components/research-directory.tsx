'use client';
import {researchReadingLinks} from '@/lib/research-navigation';
import {ResearchStage} from './research-stage';
import {ArrowRight} from 'lucide-react';
import {groups} from '@/lib/research-types';
import {profiles} from '@/lib/profiles';
import './research-structure.css';
import './editorial-sample.css';
const modules=[
 {id:'market',title:'行业与用户',question:'行业如何运转，服务对象分别需要什么？',text:'产业分工、用户任务、使用与付费数据，以及2026年的应用变化。',links:[['china-users','行业与角色']]},
 {id:'social',title:'社媒与需求',question:'社媒消费如何反映创作者市场需求、选题与合作对象？',text:'抖音、小红书、B站的作品、制作需求与使用反馈。',links:[['content-demand','社媒与内容']]},
 {id:'competitors',title:'竞品研究',question:'平台怎样把内容、用户与工具连接起来？',text:'15家平台的内容组织、使用路径、供给机制与收费方式。',links:[['report','竞品报告'],['content','内容与页面'],['operations','平台运营']]},
 {id:'planning',title:'社区方案',question:'五种重心，怎样选择与组合？',text:'任务创作、项目共学、创作者研讨、方法共建、问题互助。每套展开产品概念、用户路径、内容组织和运营方式。',links:[]},
];
export function ResearchDirectory({navigate:_navigate}:{navigate:(id:string,anchor?:string)=>void}){
 const link=(id:string,title:string)=><a href={'?#'+id}>{title}<ArrowRight size={14}/></a>;
 return <article className="research-directory editorial-overview">
 <header className="page-heading"><h1>研究总览</h1></header>
 <nav className="overview-outline" aria-label="研究模块">{modules.map((m,i)=><a key={m.id} href="#overview" onClick={e=>{e.preventDefault();document.getElementById('overview-'+m.id)?.scrollIntoView({behavior:'smooth'});}}><span>0{i+1}</span>{m.title}</a>)}</nav>
 <p className="overview-brief-link"><a href="/research-brief">简版研究报告 <ArrowRight size={16}/></a><span>行业、需求、竞品与社区方向</span></p><ResearchStage/><div className="overview-modules">{modules.map((m,i)=><section id={'overview-'+m.id} key={m.id} className="overview-module"><div className="module-number">0{i+1}</div><div><h2>{m.title}</h2><h3>{m.question}</h3><p>{m.text}</p><div className="module-links">{m.links.map(([id,title])=><span key={id}>{link(id,title)}</span>)}{researchReadingLinks.filter(link=>link.group===m.id).map(link=><span key={link.href}><a href={link.href}>{link.title}<ArrowRight size={14}/></a></span>)}</div></div></section>)}</div>
 <section className="directory-platforms"><div className="section-heading"><h2>按平台查阅</h2></div><div className="directory-categories">{groups.map(group=><section key={group}><h3>{group}</h3><ul>{profiles.filter(p=>p.group===group).map(p=><li key={p.id}>{link(p.id,p.name)}</li>)}</ul></section>)}</div></section>
 <section className="overview-boundary"><h2>结论适用范围</h2><p>结论用于比较平台机制、内容组织和使用路径。社媒样本不用于估算全站需求；留存与盈利需另有行为和经营数据。</p>{link('evidence','来源与方法')}{researchReadingLinks.filter(item=>item.group==='evidence').map(item=><p key={item.href}><a href={item.href}>{item.title} ↗</a></p>)}</section>
 </article>;
}
