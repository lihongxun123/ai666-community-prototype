
'use client';
/* oxlint-disable next/no-img-element -- Local topic images. */
import {useEffect,useState} from 'react';
import './search-suggestions.css';
import {useB} from './b-prototype/store';
import {useFeatured} from './c-prototype/featured';
import {readOperations,publicOperationRows} from './b-prototype/operations-model';
import {contentMediaSrc} from './c-prototype/content-data';
const key='ai666-home-prototype-search-history';
export function readSearchHistory():string[]{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string').slice(0,8):[]}catch{return []}}
export function rememberSearch(value:string){if(!value.trim())return;try{localStorage.setItem(key,JSON.stringify([value,...readSearchHistory().filter(v=>v!==value)].slice(0,8)));window.dispatchEvent(new Event('community-search-history'))}catch{/* Browser storage may be unavailable. */}}
export function SearchSuggestions({go,search}:{go:(page:string)=>void;search:(term:string)=>void}){
 const db=useB(),placements=useFeatured();
 const appSamples=[{id:'app-1',cover:'writing',title:'文案改写',target:'app?item=copy'},{id:'app-background',cover:'perfume',title:'产品换背景',target:'app?item=background'},{id:'app-restore',cover:'restore',title:'照片修复',target:'app?item=restore'},{id:'app-video',cover:'sea',title:'产品短片制作',target:'app?item=video'},{id:'app-repair-color',cover:'portrait',title:'照片色彩修复',target:'app?item=repair-color'}];
 const apps=placements.searchApps.flatMap(slot=>{const id=typeof slot.targetId==='string'?slot.targetId:'',record=db.records.find(r=>r.id===id&&r.kind==='app');if(record){return record.publicStatus==='公开'&&record.public&&record.runtime==='可用'?[{id,cover:record.public.cover||'writing',title:record.public.title,target:'app?id='+encodeURIComponent(id)}]:[];}const sample=appSamples.find(a=>a.id===id);return sample?[sample]:[];});
 const publicTopics=publicOperationRows(readOperations().rows.topics).filter(row=>row.status==='已发布'&&row.published!==false);
 const topics=placements.searchTopics.flatMap(slot=>{const row=publicTopics.find(topic=>topic.id===slot.targetId);return row?[{id:row.id,cover:typeof row.cover==='string'&&row.cover?row.cover:'perfume',title:row.name,target:'topic?theme='+encodeURIComponent(row.id.replace(/^tp-/,''))}]:[];});
 const words=[...new Set(placements.hotwords.map(slot=>slot.name.trim()).filter(Boolean))];
 const [history,setHistory]=useState<string[]>([]);
 useEffect(()=>{const load=()=>setHistory(readSearchHistory());load();window.addEventListener('community-search-history',load);return()=>window.removeEventListener('community-search-history',load)},[]);
 const remove=(value?:string)=>{const next=value?history.filter(x=>x!==value):[];try{localStorage.setItem(key,JSON.stringify(next));window.dispatchEvent(new Event('community-search-history'))}catch{}setHistory(next)};
 return <div className="search-suggestions"><section><div className="search-suggestions-heading"><h2>搜索记录</h2>{history.length>0&&<button onClick={()=>remove()}>清空</button>}</div>{history.length?<div className="search-history">{history.map(t=><span key={t}><button onClick={()=>search(t)}>{t}</button><button aria-label={'删除搜索记录：'+t} onClick={()=>remove(t)}>×</button></span>)}</div>:<p className="search-suggestions-empty">暂无搜索记录</p>}</section>{words.length>0&&<section><h2>推荐搜索</h2><div className="search-keywords">{words.map(t=><button key={t} onClick={()=>search(t)}>{t}</button>)}</div></section>}{topics.length>0&&<section><div className="search-suggestions-heading"><h2>精选专题</h2><button onClick={()=>go('topics')}>全部</button></div><div className="search-topic-grid">{topics.map(topic=><button key={topic.id} onClick={()=>go(topic.target)}><img src={contentMediaSrc(topic.cover)} alt=""/><strong>{topic.title}</strong></button>)}</div></section>}{apps.length>0&&<section><div className="search-suggestions-heading"><h2>精选 AI 应用</h2><button onClick={()=>go('apps')}>全部</button></div><div className="search-app-grid">{apps.map(a=><button key={a.id} onClick={()=>go(a.target)}><img src={contentMediaSrc(a.cover)} alt=""/><strong>{a.title}</strong></button>)}</div></section>}</div>
}
