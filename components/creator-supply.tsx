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
 <header className="page-heading"><h1>{data.title}</h1><p className="cs-conclusion">{data.conclusion}</p><p>{data.summary}</p><div className="cs-downloads"><a href="/research-kit/creator-supply-2026-09-12/report.html" target="_blank" rel="noreferrer">独立阅读</a><a href="/research-kit/creator-supply-2026-09-12/report.md" download>下载正文</a><a href="/research-kit/creator-supply-2026-09-12/cooperation-worksheet.csv" download>合作与交付记录表</a><a href="/research-kit/creator-supply-2026-09-12/data.json" download>来源与结构化材料</a></div></header>
 <nav className="cs-toc" aria-label="供给研究章节">{data.sections.map(s=><a href={`#cs-${s.id}`} key={s.id} onClick={e=>{e.preventDefault();jump(`cs-${s.id}`);}}>{s.title}</a>)}</nav>
 {data.sections.map(s=><section id={`cs-${s.id}`} tabIndex={-1} key={s.id}><h2>{s.title}</h2>{s.paragraphs?.map((p,i)=><p key={i}>{p}</p>)}<Refs ids={s.sourceIds}/>{s.table&&<TableView data={s.table}/>}<div className="cs-articles">{s.articles?.map((a,i)=><article key={i}><h3>{a.title}</h3>{a.paragraphs.map((p,j)=><p key={j}>{p}</p>)}{a.table&&<TableView data={a.table}/>}<Refs ids={a.sourceIds}/></article>)}</div></section>)}
 <details id="cs-sources" className="cs-sources"><summary>来源与核对范围</summary>{data.sources.map(s=><article id={`cs-source-${s.id}`} key={s.id} tabIndex={-1}><h3><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></h3><p className="cs-meta">{s.publisher} · 资料日期：{s.date} · 核对：{s.accessedAt}</p><p>{s.fact}</p><p>{s.limit}</p></article>)}</details>
 </article>;}
const summaries={
 demand:'题材热度决定值得观察什么；是否能持续供给，还取决于作者能力、合作回报、编辑工时和后续消费。40个题材分别缩到可完成的合作内容，再比较。',
 operations:'作者发现、合作提案、首份交付、第二次合作与日常维护需要单独管理。平台编辑、约稿、额度合作、授权整理和自然贡献分别记录，工具使用不是作者入选条件。',
 content:'作品展示、交流、制作方法与可运行文件需要不同的交付和维护责任。不要因为页面能容纳源文件，就要求每位作者都提供源文件。',
 discussion:'作者可以是合作编辑对象、制作伙伴、主题主持或普通成员。社区提供的关系和服务应单独说明，自营工具是其中一种支持。',
 progress:'增加供给侧记录：实际联系、合格首份、第二份完成、作者投入与维护工时。它们解释内容能否持续，不替代外部目标用户的跨周有效活跃。',
 strategy:'各方向同时比较作者来源、合作回报与维护责任；在完成这部分核对前，不预设视觉内容最容易启动。',
 report:'内容的价值包括消费、资料积累和交流。稳定供给需要编辑、作者与维护者的明确分工，赠送额度只能解决其中一部分制作成本。'
};
export function CreatorSupplyLink({context,navigate}:{context:keyof typeof summaries;navigate?:(id:string)=>void}){return <aside className="cs-connection"><p>{summaries[context]}</p><a href="#supply" onClick={e=>{if(navigate){e.preventDefault();navigate('supply');}}}>内容供给与创作者合作 →</a></aside>;}
