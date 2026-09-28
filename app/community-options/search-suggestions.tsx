
'use client';
/* oxlint-disable next/no-img-element -- Local topic images. */
import {useEffect,useState} from 'react';
import './search-suggestions.css';
import {useB} from './b-prototype/store';
const key='ai666-home-prototype-search-history';
export function readSearchHistory():string[]{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string').slice(0,8):[]}catch{return []}}
export function rememberSearch(value:string){if(!value.trim())return;try{localStorage.setItem(key,JSON.stringify([value,...readSearchHistory().filter(v=>v!==value)].slice(0,8)));window.dispatchEvent(new Event('community-search-history'))}catch{/* Browser storage may be unavailable. */}}
export function SearchSuggestions({go,search}:{go:(page:string)=>void;search:(term:string)=>void}){
 const db=useB();
 const apps=[{id:'app-1',cover:'writing',title:'文案改写',target:'app?item=copy'},{id:'app-background',cover:'perfume',title:'产品换背景',target:'app?item=background'},{id:'app-restore',cover:'restore',title:'照片修复',target:'app?item=restore'}].filter(a=>!db.records.some(r=>r.id===a.id&&r.publicStatus!=='公开'));
 const [history,setHistory]=useState<string[]>([]);
 useEffect(()=>{const load=()=>setHistory(readSearchHistory());load();window.addEventListener('community-search-history',load);return()=>window.removeEventListener('community-search-history',load)},[]);
 const remove=(value?:string)=>{const next=value?history.filter(x=>x!==value):[];try{localStorage.setItem(key,JSON.stringify(next));window.dispatchEvent(new Event('community-search-history'))}catch{}setHistory(next)};
 return <div className="search-suggestions"><section><div className="search-suggestions-heading"><h2>搜索记录</h2>{history.length>0&&<button onClick={()=>remove()}>清空</button>}</div>{history.length?<div className="search-history">{history.map(t=><span key={t}><button onClick={()=>search(t)}>{t}</button><button aria-label={'删除搜索记录：'+t} onClick={()=>remove(t)}>×</button></span>)}</div>:<p className="search-suggestions-empty">暂无搜索记录</p>}</section><section><h2>热门搜索</h2><div className="search-keywords">{['电商营销','摄影','夏天','猫','图像修复','IP与文创'].map(t=><button key={t} onClick={()=>search(t)}>{t}</button>)}</div></section><section><div className="search-suggestions-heading"><h2>精选专题</h2><button onClick={()=>go('topics')}>全部</button></div><div className="search-topic-grid">{[['perfume','电商营销','topic'],['anime','角色创作','topic?theme=character'],['restore','图像修复','topic?theme=restore'],['writing','写作表达','topic?theme=writing']].map(([cover,title,target])=><button key={target} onClick={()=>go(target)}><img src={'/home-prototype/'+cover+'.png'} alt=""/><strong>{title}</strong></button>)}</div></section><section><div className="search-suggestions-heading"><h2>精选 AI 应用</h2><button onClick={()=>go('apps')}>全部</button></div><div className="search-app-grid">{apps.map(a=><button key={a.id} onClick={()=>go(a.target)}><img src={'/home-prototype/'+a.cover+'.png'} alt=""/><strong>{a.title}</strong></button>)}</div></section></div>
}
