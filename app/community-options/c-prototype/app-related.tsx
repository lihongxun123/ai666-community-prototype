'use client';
import {useEffect,useState} from 'react';
import {publicOperationRows,readOperations} from '../b-prototype/operations-model';
export function AppRelatedTopics({ids,go}:{ids:string[];go:(target:string)=>void}){
 const [,refresh]=useState(0);
 useEffect(()=>{const update=()=>refresh(x=>x+1);window.addEventListener('bp-operations-change',update);window.addEventListener('storage',update);return()=>{window.removeEventListener('bp-operations-change',update);window.removeEventListener('storage',update)}} ,[]);
 const items=publicOperationRows(readOperations().rows.topics).filter(x=>ids.includes(x.id)&&x.status==='已发布'&&x.published!==false);
 if(!items.length)return null;
 return <section className="ad-related"><h2>相关专题</h2>{items.map(x=><button className="reading-jump" aria-label={"查看专题："+x.name} key={x.id} onClick={()=>go('topic?theme='+encodeURIComponent(x.id.replace(/^tp-/,'')))}><span><strong>{x.name}</strong><small>{String(x.summary||'')}</small></span></button>)}</section>;
}
