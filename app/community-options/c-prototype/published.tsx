'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element -- Local prototype routes and media. */
import {hiddenPublicTarget} from './content-visibility';
import {WorkDetailsExtras,workCreationInfo,WorkMedia} from './work-details-extras';
import {DesktopAppDetail} from './app-desktop';
import {DesktopContinuation,appEntryState} from './desktop-continuation';
import {TutorialDesktopDetail,type TutorialDetailContent} from './tutorial-desktop';
import {AppIntroduction} from './app-introduction';
import {type ReactNode} from 'react';
import {useB,type Kind} from '../b-prototype/store';
import {ActionBar,Comments,PCWorkLayout,WorkAuthor} from './reading';
import {ContentBlockPreview,MediaPreview} from '../b-prototype/content-media';
export function publishedContentTarget(ref:{kind:Kind;id:string}){
 if(ref.kind==='resource')return ref.id==='resource-1'?'app?item=restore':null;
 return ref.kind+'?id='+encodeURIComponent(ref.id);
}
export function PublishedBoundary({page,state,children,go}:{page:string;state:string;children:ReactNode;go:(s:string)=>void}){
 const db=useB();
 const q=new URLSearchParams(typeof location==='undefined'?'':location.search);
 if(q.has('owned'))return children;
 const match:Record<string,Kind>={tutorial:'tutorial',work:'work',post:'post',app:'app'};
 const kind=match[page],mapped=kind==='work'&&q.get('item')&&q.get('item')!=='restore'?'work-'+q.get('item'):kind+'-1',r=db.records.find(r=>r.id===(q.get('id')||mapped));
 const sample=kind==='app'&&q.has('id')&&!['removed','error','loading'].includes(state)||['normal','video','text'].includes(state)&&!q.has('embed')&&(q.has('id')||kind==='work'||!q.has('item')||q.get('item')===(kind==='app'?'copy':'restore'));
 if(!kind||!r||!sample)return children;
 if(r.publicStatus!=='公开'||!r.public||hiddenPublicTarget(publishedContentTarget(r)||''))return <div className="cp-state"><h2>内容暂不可访问</h2><button className="cp-button" onClick={()=>go('home')}>返回首页</button></div>;
 if(kind!=='app'&&!(kind==='tutorial'&&q.get('device')==='pc')&&r.publishedRevision<=1&&!q.has('id')&&!(kind==='resource'&&r.runtime==='暂停'))return children;
 const d=r.public;
 const relatedLink=(id:string)=>{
  const ref=db.records.find(x=>x.id===id),target=ref?publishedContentTarget(ref):null;
  if(ref?.publicStatus!=='公开'||!ref.public||!target||hiddenPublicTarget(target))return null;
  const title=ref.kind==='resource'?'照片修复 · AI 应用':ref.public.title;
  return <button key={id} type="button" className="reading-jump" aria-label={'打开'+title} onClick={()=>go(target)}><span><strong>{title}</strong><small>{ref.public.summary}</small></span></button>;
 };
 if(kind==='app'){
  const pc=state==='pc'||d.device!=='手机与电脑',paused=state==='paused'||r.runtime!=='可用',item=r.id==='app-1'?'copy':r.id;
  const entry=appEntryState({destination:d.entry,paused,mobile:!pc,device:q.get('device')==='pc'?'pc':'mobile'});
  const connected=Boolean(entry.href),open=()=>{if(entry.status==='available')window.location.assign(entry.href)};
  if(q.get('device')==='pc')return <DesktopAppDetail title={d.title} summary={d.summary} item={item} cover={d.cover||'writing'} input={d.inputs} output={d.outputs} provider="多元拾光" destination={d.entry} conditions={[pc?'需在电脑端使用':'',d.conditions].filter(Boolean).join('；')} unavailable={!connected?'暂未开放使用':paused?'暂不可用':undefined} onUse={open} go={go} body={<>{d.body.map(b=><ContentBlockPreview key={b.id} block={b} consumer/>)}{d.refs.map(relatedLink)}</>}/>;
  return <article className="cp-app-detail">
    <div className="cp-app-detail-heading"><h2>{d.title}</h2><p>{d.summary}</p></div>
    <img className="cp-app-detail-cover" src={'/home-prototype/'+(r.id==='app-1'?'writing':d.cover||'writing')+'.png'} alt={d.title}/>

    {entry.status==='missing'?<div className="cp-alert">暂未开放使用</div>:entry.status==='paused'?<div className="cp-alert">应用已暂停使用，介绍与讨论仍可查看。</div>:<>
      {pc&&<section className="cp-note cp-mobile-only"><h2>请在电脑端使用</h2><p>此应用需在电脑端操作。</p></section>}
      <div className="cp-app-dock" aria-label="应用操作">
        {entry.status==='desktop'?<DesktopContinuation item={item} id={r.id}/>:<button className="cp-button" onClick={open}>在 MakeNow 中使用</button>}
      </div>
      <p className="cp-app-account-note">使用当前账号在 MakeNow 中继续；输入、参数与费用在 MakeNow 中确认。</p>
    </>}

    <section className="cp-app-published-body">{d.body.map(b=><ContentBlockPreview key={b.id} block={b} consumer/>)}{d.refs.map(relatedLink)}</section>
    <AppIntroduction input={d.inputs} output={d.outputs} provider="多元拾光" conditions={d.conditions}/>
    <ActionBar kind={kind} go={go}/><Comments kind={kind} go={go}/>
  </article>;
 }

 if(kind==='tutorial'&&q.get('device')==='pc'){
  const content:TutorialDetailContent={title:d.title,topic:d.source||'创作教程',author:d.author||'多元拾光官方',summary:d.summary,cover:d.cover||'restore',sections:[],target:'tutorial?id='+r.id,commentId:r.id,conditions:d.conditions};
  const before:ReactNode[]=[];
  for(const block of d.body){
   if(block.type==='标题'&&block.text.trim())content.sections.push([block.text.trim(),[]]);
   else {const nodes=content.sections.length?content.sections[content.sections.length-1][1] as ReactNode[]:before;nodes.push(<ContentBlockPreview key={block.id} block={block} consumer/>)}
  }
  content.intro=before;
  content.related=d.refs.some(id=>relatedLink(id)!==null)?<section className="reading-related"><h3>相关内容</h3>{d.refs.map(relatedLink)}</section>:undefined;
  return <TutorialDesktopDetail id={r.id} published={content} go={go}/>;
 }

 if(kind==='work'&&q.get('device')==='pc')return <PCWorkLayout media={/\.(png|jpe?g|webp|gif)(\?|$)/i.test(d.core)?<WorkMedia image={d.core} title={d.title}/>:<MediaPreview consumer value={r.id==='work-sea'?'/home-prototype/sea-sample.mp4':d.core}/>} info={<><h2 className="reading-title">{d.title}</h2><WorkAuthor name={d.author||'创作者'} go={go}/><ActionBar kind="work" go={go} onComment={()=>document.querySelector('.pc-work-discussion')?.scrollIntoView({behavior:'smooth'})}/><p className="reading-prose">{d.summary}</p>{workCreationInfo[r.id==='work-1'?'restore':r.id.replace(/^work-/, '')]?<WorkDetailsExtras item={r.id==='work-1'?'restore':r.id.replace(/^work-/, '')} state={state} description={d.summary} go={go}/>:<section className="wd-generation"><h3>提示词</h3><p>提示词暂不可用</p></section>}{d.refs.map(relatedLink)}</>} discussion={<Comments inline kind={r.id} go={go}/>}/>;
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
   {d.refs.length>0&&<section className="reading-related"><h3>相关内容</h3>{d.refs.map(relatedLink)}</section>}
  </article>
  <ActionBar kind={kind} go={go}/><Comments kind={kind} go={go}/>
 </div>;
}





