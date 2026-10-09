'use client';
/* oxlint-disable jsx-a11y/media-has-caption -- Bundled silent sea-sample video has no audio track. */
/* oxlint-disable next/no-img-element -- Local prototype sample media. */
import {DesktopAppDetail} from './app-desktop';
import {DesktopContinuation,appEntryState} from './desktop-continuation';
import {appSamples,AppSampleContent} from './app-samples';
import { useEffect, useRef, useState } from 'react';
import './application-flow.css';
import './app-latest.css';
import './apps-pc-concept.css';
import { ActionBar, Comments } from './reading';
import {useB} from '../b-prototype/store';
import {contentMediaSrc} from './content-data';
import {AppIntroduction,appSummaries} from './app-introduction';
import {useFeatured} from './featured';
export const applicationPages = [
  {
    id: 'apps',
    title: 'AI应用',
    module: 'AI应用',
    states: ['normal', 'loading', 'empty', 'error'],
  },
  {
    id: 'app',
    title: '应用详情',
    module: 'AI应用',
    states: ['normal', 'pc', 'paused', 'removed', 'error'],
  },
];
const applicationCategories = [{id:'all',label:'全部'},{id:'writing',label:'写文案'},{id:'product-image',label:'做商品图'},{id:'photo',label:'修照片'},{id:'video',label:'做视频'}];
// Prototype first-publication fixtures; production uses the content publication timestamp.
// Independent editorial fixtures; backend mapping remains an R&D handoff.
const firstPublished:Record<string,string>={background:'2026-09-30',video:'2026-09-29','repair-color':'2026-09-28',copy:'2026-09-27',restore:'2026-09-26'};
const apps = [
 {id:'repair-color',category:'photo',name:'照片色彩修复',image:'portrait',mobile:true,available:true,input:'待修复照片',output:'图片',purpose:'影像处理',place:'MakeNow'},

  {
    id: 'copy',
    category: 'writing',
    name: '文案改写',
    image: 'writing',
    mobile: true,
    available: true,
    input: '原文、用途和语气',
    output: '文字',
    purpose: '写作表达',
    place: 'MakeNow',
  },
  {
    id: 'background',
    category: 'product-image',
    name: '产品换背景',
    image: 'perfume',
    mobile: true,
    available: true,
    input: '产品图片、背景描述',
    output: '图片',
    purpose: '商品展示',
    place: 'MakeNow',
  },
  {
    id: 'video',
    category: 'video',
    name: '产品短片制作',
    image: 'sea',
    mobile: false,
    available: true,
    input: '产品素材、镜头与场景',
    output: '视频',
    purpose: '商品展示',
    place: 'MakeNow',
  },
  {
    id: 'restore',
    category: 'photo',
    name: '照片修复',
    image: 'restore',
    mobile: true,
    available: false,
    input: '待修复照片',
    output: '图片',
    purpose: '影像处理',
    place: 'MakeNow',
  },
];
export function ApplicationsPage({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (p: string) => void;
}) {
  const contentDB=useB();
  const placements=useFeatured();
  const bannerRevision=JSON.stringify(placements.appBanner);
  const latestTrack=useRef<HTMLDivElement>(null);
  const [latestPosition,setLatestPosition]=useState({start:true,end:false});
  useEffect(()=>{
    const track=latestTrack.current;if(!track)return;
    const measure=()=>setLatestPosition({start:track.scrollLeft<2,end:track.scrollLeft+track.clientWidth>=track.scrollWidth-2});
    const observer=new ResizeObserver(measure);observer.observe(track);
    for(const card of Array.from(track.children))observer.observe(card);
    measure();return ()=>observer.disconnect();
  },[page,state,contentDB.records,bannerRevision]);
  const query =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const desktop=query?.get('device')==='pc';
  const sampleItems:Record<string,string>={'app-suite':'sample-suite','app-analysis':'sample-analysis','app-music':'sample-music','app-storyboard':'sample-storyboard','app-website':'sample-website'};
  const explicitId=query?.get('id');
  const item = explicitId?(explicitId==='app-1'?'copy':explicitId):sampleItems[state] || query?.get('item') || 'copy';
  const baseApp = apps.find((a) => a.id === item) || apps[0];
  const configuredApp=explicitId?contentDB.records.find(r=>r.id===explicitId&&r.kind==='app'):!item.startsWith('sample-')&&baseApp.id==='copy'?contentDB.records.find(r=>r.id==='app-1'):null;
  const presentation=!explicitId&&item.startsWith('sample-')?item.slice(7):undefined,sample=presentation?appSamples[presentation]:undefined;
  const app={...baseApp,name:sample?.title||configuredApp?.public?.title||baseApp.name,input:sample?.input||configuredApp?.public?.inputs||baseApp.input,output:sample?.output||configuredApp?.public?.outputs||baseApp.output,mobile:sample?false:configuredApp?.public?configuredApp.public.device==='手机与电脑':baseApp.mobile};
  const [local, setLocal] = useState(state),
    [category, setCategory] = useState(applicationCategories.some(c=>c.id===query?.get('category'))?query!.get('category')!:'all');
  const canonicalSample=!explicitId?sampleItems[state]:undefined;
  const sampleNeedsSync=Boolean(canonicalSample&&(query?.get('item')!==canonicalSample||query?.has('id')));
  useEffect(()=>{if(!sampleNeedsSync||!canonicalSample)return;const url=new URL(location.href);if(['sample-suite','sample-storyboard','sample-weekly'].includes(canonicalSample)){url.searchParams.set('id',canonicalSample.replace('sample-','app-'));url.searchParams.delete('item');}else{url.searchParams.set('item',canonicalSample);url.searchParams.delete('id');}history.replaceState(history.state,'',url);window.dispatchEvent(new PopStateEvent('popstate'));},[canonicalSample,sampleNeedsSync]);
  if(sampleNeedsSync)return null;
  const s = local;
  if (page === 'apps') {
    if (s === 'loading')
      return (
        <div className="cp-skeleton" aria-label="加载中">
          <div />
          <div />
        </div>
      );
    if (s === 'empty' || s === 'error')
      return (
        <div className="cp-state">
          <h2>{s === 'empty' ? '暂无应用' : '加载失败'}</h2>
          <button className="cp-button" onClick={() => setLocal('normal')}>
            重新加载
          </button>
        </div>
      );
    const updateCategory=(value:string)=>{
      setCategory(value);
      const url=new URL(location.href);
      url.searchParams.delete('purpose');url.searchParams.delete('output');
      if(value==='all')url.searchParams.delete('category');else url.searchParams.set('category',value);
      history.replaceState(history.state,'',url);window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const managedApps=contentDB.records.filter(r=>r.kind==='app'&&r.managed);
    const publicApps=[...apps.filter(a=>!managedApps.some(r=>r.id===(a.id==='copy'?'app-1':'app-'+a.id))),...managedApps.filter(r=>r.publicStatus==='公开'&&r.public).map(r=>({id:r.id==='app-1'?'copy':r.id,category:/视频/.test(r.public!.outputs)?'video':/图片/.test(r.public!.outputs)?'product-image':'writing',name:r.public!.title,summary:r.public!.summary,image:r.public!.cover||'writing',mobile:r.public!.device==='手机与电脑',available:r.runtime==='可用',input:r.public!.inputs,output:r.public!.outputs,purpose:r.category||'创作',place:'MakeNow'}))];
    const publishedDate=(id:string)=>contentDB.records.find(r=>r.id===(id==='copy'?'app-1':id))?.firstPublishedAt||firstPublished[id]||'';
    const latest=desktop?placements.appBanner.flatMap(slot=>{const id=typeof slot.targetId==='string'?slot.targetId:'',app=publicApps.find(a=>(a.id===id||(a.id==='copy'?'app-1':'app-'+a.id)===id)&&a.available);return app?[{...app,name:slot.name||app.name,image:typeof slot.cover==='string'&&slot.cover?slot.cover:app.image}]:[]}):publicApps.filter(a=>a.available).sort((a,b)=>publishedDate(b.id).localeCompare(publishedDate(a.id))||a.id.localeCompare(b.id)).slice(0,5);
    const openApp=(id:string)=>{const activity=query?.get('activity');go((id.startsWith('app-')?'app?id='+id:'app?item='+id)+(activity?'&activity='+encodeURIComponent(activity):''));};
    const moveLatest=(direction:number)=>{const track=latestTrack.current;const card=track?.firstElementChild;if(track&&card)track.scrollBy({left:direction*(card.getBoundingClientRect().width+16),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
    const list=publicApps
      .filter(a=>category==='all'||a.category===category)
      .sort((a,b)=>desktop?(publishedDate(b.id).localeCompare(publishedDate(a.id))||a.id.localeCompare(b.id)):(Number(b.mobile&&b.available)-Number(a.mobile&&a.available)||publishedDate(b.id).localeCompare(publishedDate(a.id))||a.id.localeCompare(b.id)));
    return (
      <section className="cp-app-discovery" aria-label="应用列表">
        {desktop&&<p className="app-discovery-intro">将想法变成作品。</p>}
        {latest.length>0&&<section className="app-latest" aria-label={desktop?"精选应用":"最新上线"}>
          <header><h2>{desktop?'精选应用':'最新上线'}</h2><div className="app-latest-controls"><button aria-label={desktop?"上一组精选应用":"上一组新应用"} disabled={latestPosition.start} onClick={()=>moveLatest(-1)}><img src="/home-prototype/icons/arrow-left-s-line.svg" alt=""/></button><button aria-label={desktop?"下一组精选应用":"下一组新应用"} disabled={latestPosition.end||latest.length<2} onClick={()=>moveLatest(1)}><img src="/home-prototype/icons/arrow-right-s-line.svg" alt=""/></button></div></header>
          <div className="app-latest-track" ref={latestTrack} onScroll={e=>{const t=e.currentTarget;setLatestPosition({start:t.scrollLeft<2,end:t.scrollLeft+t.clientWidth>=t.scrollWidth-2});}}>
            {latest.map(a=><button className="app-latest-card" key={a.id} onClick={()=>openApp(a.id)} aria-label={(desktop?'查看精选应用：':'查看新应用：')+a.name}><img src={contentMediaSrc(a.image)} alt=""/><span>{desktop&&<em>精选应用</em>}<strong>{a.name}</strong><small>{('summary' in a?String(a.summary):undefined)||appSummaries[a.id]}</small>{desktop&&<b className="app-banner-explore">探索应用<img src="/home-prototype/icons/arrow-right-line.svg" alt=""/></b>}</span></button>)}
          </div>
        </section>}
        <h2 className="app-directory-heading">全部应用</h2>
        <div className="cp-discovery-filters">
          <nav aria-label="应用任务分类">{applicationCategories.map(({id,label})=><button key={id} aria-pressed={category===id} onClick={()=>updateCategory(id)}>{label}</button>)}</nav>
        </div>
        {list.length===0?<div className="cp-state"><h2>暂无符合条件的应用</h2><button className="cp-button" onClick={()=>updateCategory('all')}>清除筛选</button></div>:<>
          <div className="cp-app-gallery">{list.map(a=><button className="cp-app-effect" key={a.id} aria-label={a.name} onClick={()=>{const activity=query?.get('activity');go((a.id.startsWith('app-')?'app?id='+a.id:'app?item='+a.id)+(activity?'&activity='+encodeURIComponent(activity):''));}}>
            <img src={contentMediaSrc(a.image)} alt=""/>
            <span className="cp-app-caption"><strong>{a.name}{desktop&&<em>官方</em>}</strong>{desktop&&<span className="app-summary">{('summary' in a?String(a.summary):undefined)||appSummaries[a.id]}</span>}{!a.available&&<small>暂不可用</small>}</span>
          </button>)}</div>
          <p className="cp-end">没有更多了</p>
        </>}
      </section>
    );
  }
  if (page==='app'&&(explicitId&&!configuredApp||!explicitId&&Boolean(query?.get('item'))&&!apps.some(a=>a.id===item)&&!sample||configuredApp&&configuredApp.publicStatus!=='公开'))
    return <div className="cp-state"><h2>应用暂不可访问</h2><button className="cp-button" onClick={()=>go('apps')}>返回应用列表</button></div>;
  if (page === 'app') {
    if (s === 'removed' || s === 'error')
      return (
        <div className="cp-state">
          <h2>{s === 'removed' ? '内容暂不可访问' : '加载失败'}</h2>
          <button
            className="cp-button"
            onClick={() => (s === 'error' ? setLocal('normal') : go('apps'))}
          >
            {s === 'error' ? '重试' : '返回应用列表'}
          </button>
        </div>
      );
    const pc = s === 'pc' || !app.mobile,
      paused = s === 'paused' || !app.available || Boolean(configuredApp&&configuredApp.runtime!=='可用');
    const destination=sample?.destination||configuredApp?.public?.entry;
    const entry=appEntryState({destination,paused,mobile:!pc,device:query?.get('device')==='pc'?'pc':'mobile'});
    const open=()=>{if(entry.status==='available')window.location.assign(entry.href)};
    if(query?.get('device')==='pc')return <DesktopAppDetail presentation={presentation} title={app.name} summary={sample?.summary||appSummaries[app.id]} item={app.id} cover={app.image} input={app.input} output={app.output} provider="多元拾光" destination={destination} unavailable={paused?'暂不可用':undefined} onUse={open} go={go}/>;
    return (
      <article className="cp-app-detail">
        <div className="cp-app-detail-heading"><h2>{app.name}</h2><p>{sample?.summary||appSummaries[app.id]}</p></div>
        {sample?<AppSampleContent sample={presentation!}/>:<img
          className="cp-app-detail-cover"
          src={'/home-prototype/' + app.image + '.png'}
          alt={app.name}
        />}

        {['missing','paused'].includes(entry.status) && (
          <div className="cp-alert">
            {entry.status==='missing'?'暂未开放使用':'应用已暂停使用，介绍与讨论仍可查看。'}
          </div>
        )}
        {['available','desktop'].includes(entry.status) && <div className="cp-app-dock" aria-label="应用操作">
          {entry.status==='desktop' ? <DesktopContinuation item={item} id={configuredApp?.id}/> : <button className="cp-button" onClick={open}>在 MakeNow 中使用</button>}
        </div>}
        {['available','desktop'].includes(entry.status)&&<p className="cp-app-account-note">在 MakeNow 中准备材料并使用应用。</p>}
        <AppIntroduction input={app.input} output={app.output} provider={sample?'MakeNow':'多元拾光'}/>

        <ActionBar kind="app" go={go}/>
        <Comments go={go} kind="app"/>
      </article>
    );
  }
  return null;
}
