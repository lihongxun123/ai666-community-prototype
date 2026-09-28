'use client';
/* oxlint-disable next/no-html-link-for-pages -- Prototype routes use full-page navigation. */
import {useSyncExternalStore} from 'react';
import {ContentPage,contentPages} from './content';
import {OperationsPage,operationPages} from './operations';
import './prototype.css';
export const bPages=[...contentPages,...operationPages];
function subscribe(cb:()=>void){window.addEventListener('popstate',cb);return()=>window.removeEventListener('popstate',cb);}
export default function Backend(){const search=useSyncExternalStore(subscribe,()=>location.search,()=>''),hydrated=useSyncExternalStore(()=>()=>{},()=>true,()=>false),q=new URLSearchParams(search),page=q.get('page')||'tutorials',state=q.get('state')||'normal';const meta=bPages.find(p=>p.id===page);const parentPage=page.endsWith('-edit')?page.slice(0,-5)+'s':['preview','release','verify','transfer','history','references'].includes(page)?(q.get('id')?.split('-')[0]||'tutorial')+'s':page==='review'?'reviews':page;const go=(target:string,confirmed=false)=>{if(!confirmed&&!window.dispatchEvent(new CustomEvent('prototype-before-navigate',{cancelable:true,detail:{proceed:()=>go(target,true)}})))return;const [id,rest]=target.split('?'),params=new URLSearchParams(rest);params.set('page',id);if(q.has('embed'))params.set('embed','1');history.pushState(null,'','?'+params);window.dispatchEvent(new Event('popstate'));window.scrollTo(0,0);};if(!hydrated)return <main className="bp-shell" aria-busy="true"/>;return <div className="bp-shell" data-page={page} data-state={state}><aside className="bp-nav"><a className="bp-brand" href="/community-options/b-prototype">多元拾光<span>内容与运营</span></a>{[...new Set(bPages.map(p=>p.module))].filter(g=>g!=='维护与记录').map(group=><div key={group}><h3>{group}</h3>{bPages.filter(p=>p.module===group&&!p.id.endsWith('-edit')&&!['preview','review','release','verify','transfer','history','references'].includes(p.id)).map(p=><button key={p.id} aria-current={parentPage===p.id?'page':undefined} className={parentPage===p.id?'active':''} onClick={()=>go(p.id)}>{p.title}</button>)}</div>)}</aside><div className="bp-main"><header className="bp-header"><span>{meta?.module} / {meta?.title}</span><span>内容编辑</span></header><main>{!page.startsWith('op-')&&<h1>{meta?.title||'页面不存在'}</h1>}{page.startsWith('op-')?<OperationsPage key={search} page={page} state={state} go={go}/>:<ContentPage key={search} page={page} state={state} go={go}/>}</main></div></div>;}




