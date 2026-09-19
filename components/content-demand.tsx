'use client';
import {ResearchOutline,ResearchAppendix} from './research-outline';
import editorial from '@/lib/content-demand-editorial.json';
import data from '@/lib/content-demand-platforms.json';
import {CreatorSupplyLink} from '@/components/creator-supply';
import {ContentDemandIndex} from './content-demand-index';
import {ContentDemandSamples} from './content-demand-samples';
import './content-demand.css';
import './market-social.css';
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
<section id="cd-platforms"><h2>15个平台的供给档案</h2><p>平台的内容分类、用户任务与供给机制以现行档案为准。作品卡片与采集记录按原观察日期保留。</p><div className="ms-platforms">{profiles.map(p=><a id={`cd-platform-${p.id}`} key={p.id} href={`/?section=${p.id==='liblib'?'liblib-supply-model':p.id+'-digest-supply'}#${p.id}`} target="_blank" rel="noopener noreferrer">{p.name} · 供给与运营 ↗</a>)}</div></section>

  <details className="cd-profile"><summary><strong>关键词与任务记录附录</strong><span>关键词查询与 18 个任务观察的来源</span></summary><div className="cd-profile-body"><ContentDemandIndex/><ContentDemandSamples/></div></details>
 <div className="research-related"><strong>相关研究</strong><a href="#supply" onClick={e=>{if(navigate){e.preventDefault();navigate('supply');}}}>内容怎样供给，如何与作者合作 →</a></div>
 </article>;
}
