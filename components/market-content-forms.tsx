'use client';
import {ResearchOutline,ResearchAppendix} from './research-outline';
import { useState } from 'react';
import data from '@/lib/market-content-forms.json';
import previous from '@/lib/content-screenshots.json';

function Refs({ids}:{ids:string[]}) {return <span className="study-refs">{ids.map(id=>{const i=data.sources.findIndex(x=>x.id===id);const s=data.sources[i];return <a href={s.url} key={id} target="_blank" rel="noreferrer" title={`${s.title}；${s.access}`}>〔{i+1}〕</a>;})}</span>;}

export function MarketContentForms({embedded=false}:{embedded?:boolean}={}) {
 const [active,setActive]=useState('gallery');
 const f=data.forms.find(x=>x.id===active)!;
 const jump=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
 const choose=(id:string)=>{setActive(id);jump('market-form-detail');};
 const images=data.images.filter(x=>x.formId===active);
 const priorId=data.previousImages[active as keyof typeof data.previousImages];
 const prior=previous.pairs.find(x=>x.id===priorId);
 return <article className="framework-study market-forms-study">
  <div className="page-heading">{embedded?<h2>{data.title}</h2>:<h1>{data.title}</h1>}</div>
  <ResearchOutline items={[
   ['market-form-matrix','15种形式对照'],['market-form-detail','内容、用法与成本'],['content-visual-evidence','卡片与详情截图'],['content-platform-directory','15个平台档案'],['market-form-findings','跨平台发现']
  ]}/>

  <p className="muted">资料截至 {data.date}</p>
  <section className="study-platform" id="market-form-matrix"><h2>形式总览</h2><div className="table-wrap"><table><thead><tr><th>内容形式</th><th>实际怎样组织</th><th>为什么采用（分析）</th><th>要好用，还需满足什么（分析）</th></tr></thead><tbody>{data.forms.map(x=><tr key={x.id}><th><button className="text-button" onClick={()=>choose(x.id)}>{x.shortName} →</button></th><td>{x.carrier}</td><td>{x.reason}</td><td>{x.competitiveCondition}</td></tr>)}</tbody></table></div></section>
  <section className="study-platform" id="market-form-detail"><h2>具体样本、使用方法与成本</h2><div className="compare-options" aria-label="选择内容形式">{data.forms.map(x=><button key={x.id} className={active===x.id?'chosen':''} aria-pressed={active===x.id} onClick={()=>setActive(x.id)}>{x.shortName}</button>)}</div>
   <article key={f.id} aria-live="polite"><h3>{f.name}</h3><p className="market-representatives">{f.representatives.map(r=><span key={r.url}><a href={r.url} target="_blank" rel="noreferrer">{r.name} ↗</a></span>)}</p><p><strong>已确认事实与样本：</strong>{f.fact}<Refs ids={f.sourceIds}/></p>
    <dl className="study-definition"><div><dt>发现入口</dt><dd>{f.entry}</dd></div><div><dt>详情如何展开</dt><dd>{f.detail}</dd></div><div><dt>最后交付什么</dt><dd>{f.deliverable}</dd></div></dl>
    <h3>为什么采用这种形式</h3><p>{f.why}</p><p><strong>对使用者的帮助（分析）：</strong>{f.advantage}</p><div className="table-wrap"><table><thead><tr><th>最基本要交代什么</th><th>哪些做法更方便使用</th></tr></thead><tbody><tr><td>{f.baseline}</td><td>{f.enhancement}</td></tr></tbody></table></div>
    <h3>持续成本与取舍</h3><p>{f.cost}</p><p>{f.tradeoff}</p><p className="notice"><strong>证据边界：</strong>{f.boundary}</p>
    {images.length>0&&<section><h3>实际页面截图</h3><div className={images.length===2?'content-pair-images':'market-single-image'}>{images.map(im=><figure className="content-evidence-figure" key={im.src}><div className="content-image-label">{im.label}</div><a href={im.src} target="_blank" rel="noreferrer"><img src={im.src} width={im.width} height={im.height} alt={im.caption} loading="lazy"/></a><figcaption>{im.caption} · {im.date}</figcaption><a href={im.url} target="_blank" rel="noreferrer">来源页面 ↗</a></figure>)}</div></section>}
    {prior&&<details className="content-pair"><summary>卡片与详情截图：{prior.platform}</summary><p>{prior.relationship}</p><p className="muted">截图日期：{previous.capturedAt}</p><div className="content-pair-images">{[prior.card,prior.detail].map((im,i)=><figure className="content-evidence-figure" key={im.src}><div className="content-image-label">{i===0?'卡片 / 列表':'对应详情'}</div><a href={im.src} target="_blank" rel="noreferrer"><img src={im.src} width={im.width} height={im.height} alt={im.caption} loading="lazy"/></a><figcaption>{im.caption}</figcaption><a href={im.url} target="_blank" rel="noreferrer">来源页面 ↗</a></figure>)}</div><p className="muted">{prior.limits}</p></details>}
    {images.length===0&&!prior&&<p className="muted">本项依据上列正文与官方说明，未取得配套卡片和详情截图。</p>}
    <details className="study-sources"><summary>本项来源与查阅范围</summary>{f.sourceIds.map(id=>{const s=data.sources.find(x=>x.id===id)!;return <p key={id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> · {s.publisher}<br/>{s.date} · {s.access}<br/>{s.scope}</p>;})}</details>
   </article>
  </section>
  <section className="study-platform" id="market-form-findings"><h2>跨样本发现</h2>{data.findings.map(x=><div key={x.title}><h3>{x.title}</h3><p>{x.text}<Refs ids={x.refs}/></p></div>)}<h3>怎样判断这些形式是否好用</h3>{data.criteria.map(x=><p key={x.name}><strong>{x.name}：</strong>{x.text}</p>)}<p>{data.evidenceNote}</p></section>
  <section className="study-platform"><h2>资料不足与适用边界</h2><ul>{data.limits.map(x=><li key={x}>{x}</li>)}</ul></section>
  <details className="study-sources"><summary>全部{data.sources.length}条来源记录</summary><ol>{data.sources.map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p>{s.publisher} · {s.date} · {s.access}</p><p>{s.scope}</p></li>)}</ol></details>
 </article>;
}
