'use client';
/* oxlint-disable next/no-img-element -- Bundled research-prototype artwork is served from fixed local paths. */
/* oxlint-disable react/react-compiler -- Local navigation and session restoration run only in event handlers or mount effects. */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- The dialog backdrop closes on pointer click; its content stops propagation. */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import Link from 'next/link';
import '../content-card-tokens.css';
import './prototype.css';
import {LayoutSkeleton} from '../common-states/layout-skeleton';
import {workRatios} from '../c-prototype/work-feed';
import {prototypeStore} from '../c-prototype/storage';
import {DesktopHeader} from '../community-header';
import CreationWorkbench from './workbench';
import {readOperations,publicOperationRows} from '../b-prototype/operations-model';
import {contentMediaSrc} from '../c-prototype/content-data';
import {workSampleId} from '../c-prototype/featured';
import {useB} from '../b-prototype/store';
import {contentCategories,normalizeContentCategory,sampleWorkCategories} from '../c-prototype/content-categories';
import {subscribeSlots,slotSnapshot,readPublishedSlots,resolveSlotTarget} from '../c-prototype/slots';

type Work={id:string;title:string;image:string;ratio:string;category:string;author:string;likes:string;source?:string;recordId?:string;type?:'视频'};
const A='/home-prototype/';
const works:Work[]=[
 {id:'girl',title:'夏日的转角',image:'girl',ratio:'9/16',category:'IP与文创',author:'周与斯',likes:'1.2k'},
 {id:'cat',title:'西瓜味的夏天',image:'cat',ratio:'1/1',category:'游戏',author:'小鹿',likes:'862'},
 {id:'portrait',title:'把阳光留在眼睛里',image:'portrait',ratio:'3/4',category:'摄影',author:'夏目川',likes:'2.3k'},
 {id:'cup',title:'柠檬与蓝花杯',image:'cup',ratio:'4/3',category:'电商营销',author:'鹿与光',likes:'328'},
 {id:'writing',title:'写给夏天的一封信',image:'writing',ratio:'4/3',category:'写作',author:'林间',likes:'216'},
 {id:'headphones',title:'只听见风的声音',image:'headphones',ratio:'1/1',category:'IP与文创',author:'Tide',likes:'1.8k'},
 {id:'sea',title:'日落之前',image:'sea',ratio:'16/9',category:'摄影',author:'陈屿',likes:'726',type:'视频'},
 {id:'tram',title:'下一站，海边',image:'tram',ratio:'4/3',category:'生活',author:'她与海',likes:'981'},
 {id:'underwater',title:'沉入一场蓝色的梦',image:'underwater',ratio:'9/16',category:'设计与视觉',author:'拾光',likes:'3.1k'},
 {id:'dog',title:'快乐没有理由',image:'dog',ratio:'1/1',category:'生活',author:'小野',likes:'1.1k'},
 {id:'interior',title:'在海边住一下午',image:'interior',ratio:'4/3',category:'生活',author:'林间',likes:'536'},
 {id:'anime',title:'风从蓝色花间经过',image:'anime',ratio:'4/3',category:'游戏',author:'Tide',likes:'982'},
 {id:'perfume',title:'一瓶夏日晴光',image:'perfume',ratio:'4/3',category:'电商营销',author:'鹿与光',likes:'617'},
 {id:'restore',title:'旧照修复练习',image:'restore',ratio:'4/3',category:'历史',author:'林间',likes:'1.4k'},
];
const categories=contentCategories;
const subscribeTopics=(notify:()=>void)=>{window.addEventListener('bp-operations-change',notify);window.addEventListener('storage',notify);return()=>{window.removeEventListener('bp-operations-change',notify);window.removeEventListener('storage',notify);};};
const topicsSnapshot=()=>JSON.stringify(publicOperationRows(readOperations().rows.topics).filter(r=>r.status==='已发布'&&r.published!==false).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id)));
const services:Record<string,string>={'AI应用':'/proposal-fusion/apps-index-v4.png','圈子':'/proposal-one/circles-index-v1.png','活动中心':'/proposal-fusion/activities-v1.png','AI商城':'/proposal-fusion/shop-v1.png','邀请有礼':'/proposal-fusion/invite-v2.png','通知':'/proposal-fusion/notifications-v1.png','积分':'/proposal-fusion/audit-points-v1.png','我的':'/proposal-fusion/my-center-v2.png'};
function Icon({name,className=''}:{name:string;className?:string}){return <img className={'hp-icon '+className} src={A+'icons/'+name+'-line.svg'} alt="" aria-hidden="true"/>;}

export default function HomePrototype({navigate,initialState='normal'}:{navigate?:(target:string)=>void;initialState?:string}={}){
 const contentDB=useB();
 const [viewState,setViewState]=useState(initialState);
 const topicData=useSyncExternalStore(subscribeTopics,topicsSnapshot,()=> '[]');
 const topics=(JSON.parse(topicData) as import('../b-prototype/operations-model').OpRow[]).filter(t=>Array.isArray(t.refs)&&t.refs.some(id=>contentDB.records.some(r=>r.id===id&&r.publicStatus==='公开'))).filter(t=>t.id!=='tp-restore'||contentDB.records.some(r=>r.id==='tutorial-1'&&r.publicStatus==='公开')).filter(t=>t.id!=='tp-writing'||contentDB.records.some(r=>r.id==='app-1'&&r.publicStatus==='公开')).slice(0,4).map(t=>({id:t.id,title:t.name,image:contentMediaSrc(typeof t.cover==='string'?t.cover:''),category:t.name}));
 useSyncExternalStore(subscribeSlots,slotSnapshot,()=> '');
 const slots=readPublishedSlots('pc'),banner=slots.find(s=>s.type==='首页 Banner');
 const [category,setCategory]=useState(()=>{const saved=prototypeStore.getItem('cp-home-pc-category');return saved&&categories.includes(saved)?saved:'全部';}),[search,setSearch]=useState('');
 const [modal,setModal]=useState(''),[selected]=useState<Work|null>(null),[saved,setSaved]=useState<string[]>([]),[liked,setLiked]=useState<string[]>([]),[toast,setToast]=useState(''),[_signed]=useState(false);
 useEffect(()=>{if(new URLSearchParams(location.search).get('open')==='model-plaza'){window.location.replace('https://duoyuanx.com/pricing');}},[navigate]);
 const [prompt,setPrompt]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{if(modal){dialog.current?.showModal();document.body.style.overflow='hidden';}else{dialog.current?.close();document.body.style.overflow='';}return()=>{document.body.style.overflow='';};},[modal]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 const notify=(text:string)=>{setToast(text);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),2500);};
 const route=(target:string)=>{if(navigate){navigate(target);return;}const [id,rest]=target.split('?');window.location.assign('/community-options/c-prototype?page='+id+(rest?'&'+rest:'')+'&origin=pc&device=pc');};
 const topicRoute=(id:string)=>route('topic?theme='+encodeURIComponent(id.replace(/^tp-/,'')));
 const open=(name:string)=>{const targets:Record<string,string>={topics:'topics','AI应用':'apps','圈子':'circles','活动中心':'activities','AI商城':'shop','邀请有礼':'invite','通知':'notifications','积分':'points','我的':'mine','签到':'checkin',saved:'favorites',flash:'post-edit?state=post',create:'create'};if(targets[name]){route(targets[name]);return;}setModal(name);};

 const chooseCategory=(value:string)=>{prototypeStore.setItem('cp-home-pc-category',value);setCategory(value);setSearch('');};
 const openWork=(work:Work)=>{if(work.recordId){route('work?id='+work.recordId+'&item='+work.image+(work.type==='视频'?'&state=video':''));return;}route('work?item='+work.image+(work.type==='视频'?'&state=video':work.id==='writing'?'&state=text':''));};
 const create=(_work?:Work)=>{if(prototypeStore.getItem('cp-auth')!=='1'){prototypeStore.setItem('cp-return','create');prototypeStore.setItem('cp-login-background','home');route('login');return;}route('create');};
 const toggleSave=(id:string)=>{setSaved(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);notify(saved.includes(id)?'已取消收藏':'已收藏');};
 const selectedWorks:Work[]=contentDB.records.filter(r=>r.kind==='work'&&r.publicStatus==='公开'&&r.public&&r.adminWork?.hot).sort((a,b)=>(b.firstPublishedAt||'').localeCompare(a.firstPublishedAt||'')||a.id.localeCompare(b.id)).map(r=>{const key=workSampleId(r.id),old=works.find(w=>w.id===key);return {id:key,recordId:r.id,source:r.public!.cover||'',title:r.public!.title,image:key,ratio:r.adminWork?.coverRatio||old?.ratio||'4/3',category:r.adminWork?.category||old?.category||'生活',author:r.public!.author,likes:String(r.adminWork?.metrics?.likes||0),type:r.adminWork?.mediaType==='视频'?'视频':undefined};});
 const publicWorks:Work[]=selectedWorks.flatMap(w=>{const r=contentDB.records.find(r=>r.id===(w.recordId||'work-'+(w.id==='restore'?'1':w.id)));if(!r)return [w];if(r.publicStatus!=='公开'||!r.public)return [];return [{...w,recordId:r.id,title:r.public.title,author:r.public.author,source:r.public.cover||w.source,category:r.adminWork?.category||w.category}];});
 const filtered=(viewState==='empty'?[]:publicWorks).filter(w=>(category==='全部'||normalizeContentCategory(sampleWorkCategories[w.id]||w.category)===normalizeContentCategory(category))&&(!search||[w.title,w.category,w.author,w.type||'',w.id==='restore'?'图像修复':''].join(' ').toLowerCase().includes(search.toLowerCase())));
 const showTopics=filtered.length>0&&topics.length>0;
 const columns:Work[][]=[[],[],[],[],[]];
 filtered.forEach((w,i)=>{const col=showTopics?(i<3?i+2:(i-3)%5):i%5;columns[col].push(w);});
 const renderWork=(w:Work)=><button key={w.id} className="hp-work" style={{aspectRatio:workRatios[w.id]||w.ratio}} onClick={()=>openWork(w)} aria-label={'查看作品：'+w.title}>
  {(w.recordId&&!w.source)||viewState==='image-error'?<p>封面暂不可用</p>:<img src={w.source||A+w.image+'.png'} alt={w.title} loading="lazy"/>}{w.type==='视频'&&<><span className="hp-play"><img className="hp-icon" src="/home-prototype/icons/play-fill.svg" alt="" aria-hidden="true"/></span><span className="hp-time">00:03</span></>}
  <span className="hp-work-info"><strong>{w.title}</strong><span><img src={A+'portrait.png'} alt=""/>{w.author}<span className="hp-metrics"><Icon name={'heart'}/>{w.likes}</span></span></span>
 </button>;
 return <div className="hp-root">
  <DesktopHeader go={route} onHome={()=>{chooseCategory('全部');window.scrollTo({top:0,behavior:'smooth'})}} onModels={()=>window.open('https://duoyuanx.com/pricing','_blank','noopener,noreferrer')}/>
  <main className="hp-main">{banner&&<button type="button" className="hp-banner" style={{border:0,padding:0,width:'100%',cursor:'pointer'}} onClick={()=>route(resolveSlotTarget(banner.target)?.page||'activities')} aria-label={banner.title}><img src={A+'banner.png'} alt={banner.title}/></button>}
  <section className="hp-shortcuts" aria-label="快捷创作">{slots.filter(s=>s.type==='金刚区').map(slot=>{const target=resolveSlotTarget(slot.target)?.page||'home';const [sub,icon]=({'MakeNow':['无限画布','brush'],'一句话生成':['想法变成画面','play-circle'],'模型直通车':['找到合适模型','box-3'],'发布帖子':['分享创作想法','lightbulb']} as Record<string,string[]>)[slot.target]||['','arrow-right-s'];return <button key={slot.id} onClick={()=>target==='makenow'?open('MakeNow'):target==='model-plaza'?window.open('https://duoyuanx.com/pricing','_blank','noopener,noreferrer'):target==='create'?create():route(target)}><Icon name={icon}/><span><strong>{slot.title}</strong>{sub&&<small>{sub}</small>}</span><Icon name="arrow-right-s"/></button>;})}</section>
  <section id="hp-feed" className="hp-feed"><nav className="hp-categories" aria-label="内容分类">{categories.map(c=><button aria-pressed={c===category} className={c===category?'active':''} key={c} onClick={()=>chooseCategory(c)}>{c}</button>)}</nav>
   {search&&<div className="hp-search-summary"><span>“{search}” · {filtered.length} 项内容</span><button onClick={()=>{setSearch('');}}>清除搜索<Icon name="close"/></button></div>}
   {['loading','error'].includes(viewState)&&<div className="hp-waterfall">{[0,1,2,3,4].map(i=><div className="hp-column" key={i}>{i<2&&<div className="hp-topic-stack">{[topics[i],topics[i+2]].filter(Boolean).map(t=><button key={t.id} className="hp-topic" onClick={()=>topicRoute(t.id)}><img src={t.image} alt=""/><span className="hp-topic-tag">专题</span><strong>{t.title}<Icon name="arrow-right-s"/></strong></button>)}</div>}</div>)}</div>}{viewState==='loading'?<LayoutSkeleton kind="grid"/>:viewState==='error'?<output className="hp-empty"><h2>作品加载失败</h2><button onClick={()=>setViewState('normal')}>重试</button></output>:<>{filtered.length===0?<div className="hp-empty"><Icon name="search"/><h2>暂时没有相关内容</h2><p>换个关键词，或看看其他创作。</p><button onClick={()=>{chooseCategory('全部');setViewState('normal')}}>浏览全部</button></div>:null}{filtered.length>0&&<div className="hp-waterfall">{columns.map((col,i)=><div className="hp-column" key={i}>{showTopics&&i<2&&<div className="hp-topic-stack">{[topics[i],topics[i+2]].filter(Boolean).map(t=><button key={t.id} className="hp-topic" onClick={()=>{topicRoute(t.id);}}><img src={t.image} alt=""/><span className="hp-topic-tag">专题</span><strong>{t.title}<Icon name="arrow-right-s"/></strong></button>)}</div>}{col.map(renderWork)}</div>)}</div>}{viewState==='more-error'&&<output className="hp-empty"><p>更多作品加载失败</p><button onClick={()=>setViewState('normal')}>重试</button></output>}</>}
   
  </section></main>
  <button className="hp-floating-create" aria-label="打开轻创作体验" onClick={()=>create()}><Icon name="sparkling"/><span>输入灵感，即刻体验</span><span className="hp-floating-arrow"><Icon name="arrow-up"/></span></button>
  {toast&&<output className="hp-toast"><Icon name="check"/>{toast}</output>}
  <dialog ref={dialog} className={'hp-dialog '+(modal==='create'?'hp-create-dialog':'')} onCancel={()=>setModal('')} onClick={e=>{if(e.target===e.currentTarget)setModal('');}}><div className="hp-dialog-body"><button className="hp-close" aria-label="关闭" onClick={()=>setModal('')}><Icon name="close"/></button>
  {modal==='work'&&selected&&<div className="hp-detail"><div className="hp-detail-image"><img src={A+selected.image+'.png'} alt={selected.title}/>{selected.type==='视频'&&<span className="hp-video-note">视频封面预览 · 00:03</span>}</div><aside><span className="hp-eyebrow">{selected.category}</span><h1>{selected.title}</h1><div className="hp-author"><img src={A+'portrait.png'} alt=""/><span>{selected.author}<small>分享每一次创作</small></span></div><p>用光线、色彩和一点想象，留下这个瞬间。</p><div className="hp-detail-actions"><button onClick={()=>setLiked(v=>v.includes(selected.id)?v.filter(x=>x!==selected.id):[...v,selected.id])} aria-pressed={liked.includes(selected.id)}><Icon name="heart"/>{liked.includes(selected.id)?'已喜欢':selected.likes}</button><button onClick={()=>toggleSave(selected.id)} aria-pressed={saved.includes(selected.id)}><Icon name="bookmark"/>{saved.includes(selected.id)?'已收藏':'收藏'}</button></div><button className="hp-primary" onClick={()=>create(selected)}><Icon name="sparkling"/>{'一键同款'}</button><small className="hp-muted">使用相同灵感，创作你的版本。</small></aside></div>}
  <CreationWorkbench active={modal==='create'} seed={selected} notify={notify}/>
  {modal==='topics'&&<section className="hp-topic-dialog"><h2>精选专题</h2><div>{topics.map(t=><button key={t.id} onClick={()=>{chooseCategory(t.category);setModal('');document.getElementById('hp-feed')?.scrollIntoView({behavior:'smooth'});}}><img src={t.image} alt=""/><strong>{t.title}<Icon name="arrow-right-s"/></strong></button>)}</div></section>}
  {modal==='saved'&&<section className="hp-topic-dialog"><h2>我的收藏</h2>{saved.length?<div>{works.filter(w=>saved.includes(w.id)).map(w=><button key={w.id} onClick={()=>openWork(w)}><img src={A+w.image+'.png'} alt=""/><strong>{w.title}</strong></button>)}</div>:<p>还没有收藏，遇到喜欢的作品可以先留在这里。</p>}</section>}
  {modal==='flash'&&<section className="hp-flash"><h2>发布帖子</h2><textarea aria-label="闪念内容" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="一个想法、一次发现，都值得记录。"/><button className="hp-primary" disabled={!prompt.trim()} onClick={()=>{notify('已保存闪念草稿');setModal('');}}>保存草稿</button></section>}
  {(modal==='MakeNow'||modal==='模型广场')&&<section className="hp-external"><Icon name={modal==='MakeNow'?'brush':'box-3'}/><h2>{modal}</h2><p>{modal==='MakeNow'?'在无限画布中继续创作。':'查找适合你的模型服务。'}</p>{modal==='MakeNow'?<a className="hp-primary" target="_blank" rel="noopener noreferrer" href="https://dream.ai666.net/">打开MakeNow<Icon name="external-link"/></a>:<a className="hp-primary" href="https://duoyuanx.com/pricing" target="_blank" rel="noopener noreferrer">打开模型广场<Icon name="external-link"/></a>}</section>}
  {services[modal]&&<section className="hp-service-preview"><h2>{modal}</h2><img src={services[modal]} alt={modal+'页面概念'}/><Link href="/community-options/fusion/gallery">查看完整页面说明<Icon name="arrow-right-s"/></Link></section>}
  </div></dialog>
 </div>;
}
