'use client';
import {ResearchOutline,ResearchAppendix} from './research-outline';
import editorial from '@/lib/content-demand-editorial.json';
import data from '@/lib/content-demand-platforms.json';
import {CreatorSupplyLink} from '@/components/creator-supply';
import {ContentDemandIndex} from './content-demand-index';
import {ContentDemandSamples} from './content-demand-samples';
import './content-demand.css';
import {DouyinEcosystem} from './content-demand-ecosystem';

type Item={text:string;sourceIds:string[]};
const profiles=data.profiles;
function jump(id:string){const el=document.getElementById(id);if(el instanceof HTMLDetailsElement)el.open=true;for(let p=el?.parentElement;p;p=p.parentElement)if(p instanceof HTMLDetailsElement)p.open=true;el?.scrollIntoView({block:'start'});}
function Jump({id,children}:{id:string;children:React.ReactNode}){return <button type="button" className="cd-link" data-jump={id} onClick={()=>jump(id)}>{children}</button>;}
function External({url,children}:{url:string;children:React.ReactNode}){return <a href={url} target="_blank" rel="noreferrer">{children} ↗</a>;}
function Items({items,platform}:{items:Item[];platform?:string}){return <ul>{items.map((v,i)=><li key={i}>{v.text}{platform&&v.sourceIds.length>0&&<span className="cd-cites">{v.sourceIds.map(id=><Jump key={id} id={`cd-source-${platform}-${id}`}>来源</Jump>)}</span>}</li>)}</ul>;}
function Refs({ids}:{ids:string[]}){return <span className="cd-refs">{ids.map(id=><Jump key={id} id={`cd-platform-${id}`}>{profiles.find(p=>p.id===id)?.name||id}</Jump>)}</span>;}

export function ContentDemand({navigate}:{navigate?:(id:string,anchor?:string)=>void}){
 return <article className="content-demand">
  <DouyinEcosystem/>
<ResearchAppendix id="cd-platforms" title="18个平台的内容供给与消费线索"><p>{editorial.reading}</p>
   <div className="cd-table"><table><thead><tr><th>平台</th><th>可见供给主题／用途</th><th>消费线索</th><th>证据状态</th></tr></thead><tbody>{profiles.map(p=><tr key={p.id}><th><Jump id={`cd-platform-${p.id}`}>{p.name} ↓</Jump></th>{p.summary.map((s,i)=><td key={i}>{s}</td>)}</tr>)}</tbody></table></div>
   {profiles.map(p=><details id={`cd-platform-${p.id}`} className="cd-profile" key={p.id}><summary><strong>{p.name}</strong><span>{p.summary[0]}</span></summary>
    <div className="cd-profile-body"><div className="cd-columns">{[['供给题材',p.supplyTopics],['行业与使用场景',p.industryUses],['消费主题与意图',p.consumptionTopics],['内容形式',p.contentForms],['谁在供给',p.supplierTypes],['已观察到的信号',p.observedSignals]].map(([label,items])=><div key={label as string}><h3>{label as string}</h3><Items items={items as Item[]} platform={p.id}/></div>)}</div>
    {p.counterexample&&!p.counterexample.startsWith('若出现以下情况')&&<p className="cd-counter">反例：{p.counterexample}</p>}
    <h3>还缺的数据</h3><Items items={p.unknowns}/>
    <h3>来源</h3><ol className="cd-sources">{p.sources.map(s=><li id={`cd-source-${p.id}-${s.id}`} key={s.id}><External url={s.url}>{s.title}</External><span>{s.whatSupports}</span><small>资料日期：{s.date||'未标明'} · 观察：{s.accessedAt}</small></li>)}</ol>
    <a className="cd-link" href={`#${p.id}`} onClick={e=>{if(navigate){e.preventDefault();navigate(p.id);}}}>查看{p.name}完整竞品档案 →</a></div>
   </details>)}
  </ResearchAppendix>

  <details className="cd-profile"><summary><strong>关键词与任务记录附录</strong><span>关键词查询与 18 个任务观察的来源</span></summary><div className="cd-profile-body"><ContentDemandIndex/><ContentDemandSamples/></div></details>
 <div className="research-related"><strong>相关研究</strong><a href="#supply" onClick={e=>{if(navigate){e.preventDefault();navigate('supply');}}}>内容怎样供给，如何与作者合作 →</a></div>
 </article>;
}
