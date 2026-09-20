'use client';
import raw from '@/lib/creator-supply.json';
import './creator-supply.css';

type Source={id:string;title:string;publisher:string;url:string;date:string;accessedAt:string;fact:string;limit:string};
type Table={headers:string[];rows:string[][]};
type Paragraphs={title:string;paragraphs:string[];sourceIds?:string[];table?:Table};
type Section={id:string;title:string;paragraphs?:string[];table?:Table;articles?:Paragraphs[];sourceIds?:string[]};
const data=raw as {title:string;date:string;status:string;conclusion:string;summary:string;sources:Source[];sections:Section[]};
function jump(id:string){const target=document.getElementById(id);for(let n=target?.parentElement;n;n=n.parentElement)if(n instanceof HTMLDetailsElement)n.open=true;target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});}
function TableView({data}:{data:Table}){return <div className="cs-table" role="region" tabIndex={0} aria-label={data.headers.join('、')}><table><thead><tr>{data.headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{data.rows.map((r,i)=><tr key={i}>{r.map((v,j)=>j===0?<th scope="row" key={j}>{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div>;}
function Refs({ids=[]}:{ids?:string[]}){return ids.length?<p className="cs-refs">{ids.map(id=>{const s=data.sources.find(s=>s.id===id);return s?<a key={id} href={`#cs-source-${id}`} onClick={e=>{e.preventDefault();jump(`cs-source-${id}`);}}>{s.publisher} · {s.title}</a>:null;})}</p>:null;}
export function CreatorSupply(){return <article className="creator-supply">
 <aside className="research-related"><strong>前轮供给与试点建议</strong><p>本页保留当时的作者合作和四周试点思路。当前已按九类任务组织专题，运营安排请从内容体系阅读；此处排期、成本和周活观察不作为本轮执行计划。</p><a href="/community-options/content-system#supply">当前专题运营安排 →</a></aside><header className="page-heading"><h1>{data.title}</h1><p className="cs-conclusion">{data.conclusion}</p><p>{data.summary}</p></header>
 <nav className="cs-toc" aria-label="供给研究章节">{data.sections.map(s=><a href={`#cs-${s.id}`} key={s.id} onClick={e=>{e.preventDefault();jump(`cs-${s.id}`);}}>{s.title}</a>)}</nav>
 {data.sections.map(s=><section id={`cs-${s.id}`} tabIndex={-1} key={s.id}><h2>{s.title}</h2>{s.paragraphs?.map((p,i)=><p key={i}>{p}</p>)}<Refs ids={s.sourceIds}/>{s.table&&<TableView data={s.table}/>}<div className="cs-articles">{s.articles?.map((a,i)=><article key={i}><h3>{a.title}</h3>{a.paragraphs.map((p,j)=><p key={j}>{p}</p>)}{a.table&&<TableView data={a.table}/>}<Refs ids={a.sourceIds}/></article>)}</div></section>)}
 <details id="cs-sources" className="cs-sources"><summary>来源与核对范围</summary>{data.sources.map(s=><article id={`cs-source-${s.id}`} key={s.id} tabIndex={-1}><h3><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></h3><p className="cs-meta">{s.publisher} · 资料日期：{s.date} · 核对：{s.accessedAt}</p><p>{s.fact}</p><p>{s.limit}</p></article>)}</details>
 </article>;}
const relatedLabels={demand:'题材怎样转成持续供给',operations:'作者发现、合作与交付流程',content:'不同内容的交付与维护责任',discussion:'社区与作者的合作关系',progress:'供给记录与外部消费指标',strategy:'作者来源、回报与维护条件',report:'内容供给方式与合作条件'};
export function CreatorSupplyLink({context,navigate}:{context:keyof typeof relatedLabels;navigate?:(id:string)=>void}){return <div className="research-related"><strong>相关研究</strong><a href="#supply" onClick={e=>{if(navigate){e.preventDefault();navigate('supply');}}}>{relatedLabels[context]} →</a></div>;}
