'use client';
import {ArrowRight} from 'lucide-react';
import {groups} from '@/lib/research-types';
import {profiles} from '@/lib/profiles';
import './research-structure.css';
import './editorial-sample.css';
const modules=[
 {id:'market',title:'行业与用户',question:'谁在使用 AI，市场规模怎样理解？',text:'全国使用规模、用户分层与付费资料。区分调查人数、应用活跃和访问量，保留各自的时间与统计范围。',links:[['china-users','中国 AI 用户规模与分层']]},
 {id:'social',title:'内容需求与社媒生态',question:'人们在看什么，创作者在提供什么？',text:'以抖音为主，按主题查看作品、作者、评论诉求和指数记录，追踪社媒需求与 AIGC 供给的关联。',links:[['content-demand','主题、作品与供需证据']]},
 {id:'competitors',title:'竞品研究',question:'平台怎样把内容、用户与工具连接起来？',text:'15 家平台的分类、内容详情、使用路径、供给机制与收费方式。先读综合报告，再按平台或专题查阅。',links:[['report','竞品调研报告'],['content','内容形态与页面'],['operations','平台运营']]},
 {id:'planning',title:'方案与验证',question:'多元拾光可以选择什么，怎样落地？',text:'以周活用户数为主要指标，比较社区方向、内容供给、运营动作和产品承接，明确投入、成立条件与取舍。',links:[['strategy','方向与实施方案'],['supply','内容供给与合作'],['makenow','MakeNow 能力'],['progress','指标与验证条件']]},
];
export function ResearchDirectory({navigate}:{navigate:(id:string,anchor?:string)=>void}){
 const link=(id:string,title:string)=><a href={'?#'+id} target="_blank" rel="noopener noreferrer" title="在新标签页打开">{title}<ArrowRight size={14}/></a>;
 return <article className="research-directory editorial-overview">
 <header className="page-heading"><h1>研究总览</h1></header>
 <nav className="overview-outline" aria-label="研究模块">{modules.map((m,i)=><a key={m.id} href="#overview" onClick={e=>{e.preventDefault();document.getElementById('overview-'+m.id)?.scrollIntoView({behavior:'smooth'});}}><span>0{i+1}</span>{m.title}</a>)}</nav>
 <div className="overview-modules">{modules.map((m,i)=><section id={'overview-'+m.id} key={m.id} className="overview-module"><div className="module-number">0{i+1}</div><div><h2>{m.title}</h2><h3>{m.question}</h3><p>{m.text}</p><div className="module-links">{m.links.map(([id,title])=><span key={id}>{link(id,title)}</span>)}</div></div></section>)}</div>
 <section className="directory-platforms"><div className="section-heading"><h2>按平台查阅</h2></div><div className="directory-categories">{groups.map(group=><section key={group}><h3>{group}</h3><ul>{profiles.filter(p=>p.group===group).map(p=><li key={p.id}>{link(p.id,p.name)}</li>)}</ul></section>)}</div></section>
 <section className="overview-boundary"><h2>结论适用范围</h2><p>现有资料支持平台机制、内容组织和使用路径的比较。社媒作品样本不代表全站需求，平台功能与收费规则也不能直接证明留存或盈利。具体限制随对应数据和案例列出。</p>{link('evidence','来源与研究方法')}</section>
 </article>;
}
