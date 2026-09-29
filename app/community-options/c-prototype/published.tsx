'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element -- Local prototype routes and media. */
import {AppIntroduction} from './app-introduction';
import {appHandoffUrl} from './app-handoff';
import {type ReactNode} from 'react';
import {useB,type Kind} from '../b-prototype/store';
import {ActionBar,Comments} from './reading';
import {ContentBlockPreview,MediaPreview} from '../b-prototype/content-media';
export function PublishedBoundary({page,state,children,go}:{page:string;state:string;children:ReactNode;go:(s:string)=>void}){
 const db=useB();
 const q=new URLSearchParams(typeof location==='undefined'?'':location.search);
 const match:Record<string,Kind>={tutorial:'tutorial',resource:'resource',work:'work',post:'post',app:'app'};
 const kind=match[page],mapped=kind==='work'&&q.get('item')&&q.get('item')!=='restore'?'work-'+q.get('item'):kind+'-1',r=db.records.find(r=>r.id===(q.get('id')||mapped));
 const sample=['normal','video','text'].includes(state)&&!q.has('embed')&&(q.has('id')||kind==='work'||!q.has('item')||q.get('item')===(kind==='app'?'copy':'restore'));
 if(!kind||!r||!sample)return children;
 if(r.publicStatus!=='公开'||!r.public)return <div className="cp-state"><h2>内容暂不可访问</h2><button className="cp-button" onClick={()=>go('home')}>返回首页</button></div>;
 if(kind!=='app'&&r.publishedRevision<=1&&!q.has('id')&&!(kind==='resource'&&r.runtime==='暂停'))return children;
 const d=r.public;
 if(kind==='app'){
  const pc=d.device!=='手机与电脑',paused=r.runtime!=='可用',item=r.id==='app-1'?'copy':r.id,connected=Boolean(d.entry);
  const open=()=>window.location.assign(appHandoffUrl(item,r.id));
  return <article className="cp-app-detail">
    <div className="cp-app-detail-heading"><h2>{d.title}</h2><p>{d.summary}</p></div>
    <img className="cp-app-detail-cover" src={'/home-prototype/'+(r.id==='app-1'?'writing':d.cover||'writing')+'.png'} alt={d.title}/>

    {!connected?<div className="cp-alert">暂未开放使用</div>:paused?<div className="cp-alert">应用暂不可用，介绍与讨论仍可查看。</div>:<>
      {pc&&<section className="cp-note cp-mobile-only"><h2>请在电脑端使用</h2><p>此应用需在电脑端操作。</p></section>}
      <div className="cp-app-dock" aria-label="应用操作">
        {pc?<><button className="cp-button cp-mobile-only" onClick={()=>go('pc-handoff?item='+encodeURIComponent(item))}>获取电脑端链接</button><button className="cp-button cp-desktop-only" onClick={open}>在 MakeNow 中使用</button></>:<button className="cp-button" onClick={open}>在 MakeNow 中使用</button>}
      </div>
    </>}

    <section className="cp-app-published-body">{d.body.map(b=><ContentBlockPreview key={b.id} block={b} consumer/>)}{d.refs.map(id=>{const ref=db.records.find(x=>x.id===id);return ref?.publicStatus==='公开'?<button key={id} className="cp-row" onClick={()=>go(ref.kind+'?id='+ref.id)}>{ref.public?.title}</button>:<p key={id}>关联资源暂不可用</p>})}</section>
    <AppIntroduction input={d.inputs} output={d.outputs} provider={d.author} conditions={d.conditions}/>
    <ActionBar kind={kind} go={go}/><Comments kind={kind} go={go}/>
  </article>;
 }

 const sections=kind==='tutorial'?d.body.flatMap((block,index)=>block.type==='标题'&&block.text.trim()?[{id:'published-step-'+index,title:block.text.trim()}]:[]):[];
 return <div className="reading-page published-reading-page">
  <article>
   <div className="published-reading-heading">
    {d.source&&<span className="reading-tag">{d.source}</span>}
    <h2 className="reading-title">{d.title}</h2>
    {d.author&&<p className="reading-muted">{d.author}</p>}
    {d.summary&&<p className="reading-lead">{d.summary}</p>}
   </div>
   {kind!=='work'&&d.cover&&<img className="reading-picture" src={'/home-prototype/'+d.cover+'.png'} alt={d.title}/>}
   {sections.length>0&&<nav className="reading-toc" aria-label="文章目录"><strong>目录</strong>{sections.map((section,index)=><button key={section.id} type="button" onClick={()=>document.getElementById(section.id)?.scrollIntoView({behavior:'smooth',block:'start'})}>{String(index+1).padStart(2,'0')} {section.title}</button>)}</nav>}
   {kind!=='work'&&<div className="reading-prose published-reading-body">{d.body.map((block,index)=><div key={block.id} id={block.type==='标题'?'published-step-'+index:undefined} className={block.type==='标题'?'published-reading-section':undefined}><ContentBlockPreview block={block} consumer/></div>)}</div>}
   {kind==='work'&&<div className="published-reading-media"><MediaPreview consumer value={r.id==='work-sea'?'/home-prototype/sea-sample.mp4':d.core}/></div>}
   {d.conditions&&<p className="published-reading-conditions">{d.conditions}</p>}
   {kind==='resource'&&(r.runtime==='暂停'?<div className="reading-resource-handoff"><strong>暂不可使用</strong><p>资源说明仍可阅读。</p></div>:d.permission!=='仅展示成果'&&<section className="reading-resource-handoff"><strong>在电脑端继续</strong><p>在电脑端查看此项目。</p><div className="reading-resource-handoff-actions"><div className="cp-mobile-only cp-note">请在电脑端打开此资源继续。</div><a className="cp-desktop-only reading-button" href={'/community-options/cross-prototype?page=project&source=resource'+(d.permission==='允许查看'?'&state=view-only':'')}>查看项目</a></div></section>)}
   {d.refs.length>0&&<section className="reading-related"><h3>相关内容</h3>{d.refs.map(id=>{const ref=db.records.find(x=>x.id===id);return ref?.publicStatus==='公开'&&ref.public?<button key={id} type="button" className="reading-jump" aria-label={'打开'+ref.public.title} onClick={()=>go(ref.kind+'?id='+ref.id)}><span><strong>{ref.public.title}</strong><small>{ref.public.summary}</small></span></button>:<p key={id} className="reading-muted">关联内容暂不可访问</p>})}</section>}
  </article>
  <ActionBar kind={kind} go={go}/><Comments kind={kind} go={go}/>
 </div>;
}





