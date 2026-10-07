'use client';
import {TransientFeedback} from './transient-feedback';

/* eslint-disable next/no-img-element -- Images belong to the local prototype asset set. */
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {ActionBar} from './content-actions';
import {Comments,PostImageGallery,postImages} from './reading';
import {prototypeStore as storage} from './storage';
import {samplePosts,postTarget,circleTarget,publicPostRows,contentMediaSrc,postDateOrder,contentCircleId,type SamplePost} from './content-data';
import {useB} from '../b-prototype/store';
import './circle-pages.css';
import './circle-desktop.css';

type Props={page:string;state:string;go:(page:string)=>void};
type Circle={id:string;name:string;description:string;cover:string;members:number};

// Fictional content used only by this concept prototype. The two shared circles keep their B-end state.
const demoCircles:Circle[]=[
 {id:'repair',name:'修复交流圈',description:'旧照修复与人像细节交流',cover:'portrait',members:326},
  {id:'image',name:'影像练习圈',description:'照片修复、构图与视觉叙事',cover:'restore',members:1286},
  {id:'visual',name:'视觉创作圈',description:'产品视觉、光线与配色',cover:'perfume',members:963},
  {id:'writing',name:'写作灵感圈',description:'日常观察、短篇与表达练习',cover:'writing',members:742},
  {id:'film',name:'短片实验圈',description:'镜头语言、剪辑与声音',cover:'sea',members:618},
  {id:'life',name:'生活美学圈',description:'空间、器物与生活记录',cover:'interior',members:525},
  {id:'character',name:'角色创作圈',description:'人物设定、故事与画面',cover:'anime',members:409},
];
const img=contentMediaSrc;
const signedIn=()=>storage.getItem('cp-auth')==='1';
function joinKey(id:string){return 'cp-circle-joined:'+id}
function joinedRelation(id:string){
  const saved=storage.getItem(joinKey(id));
  if(saved!==null)return saved==='1';
  if(id==='image'&&storage.getItem('cp-circle-joined')!==null)return storage.getItem('cp-circle-joined')==='1';
  return id==='image'||id==='visual';
}
function isJoined(id:string){
  if(typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('state')==='guest')return false;
  return joinedRelation(id);
}
function setJoinedRelation(id:string,joined:boolean){
  storage.setItem(joinKey(id),joined?'1':'0');
  if(id==='image')storage.setItem('cp-circle-joined',joined?'1':'0');
}
function memberCount(circle:Circle){
  const initiallyJoined=circle.id==='image'||circle.id==='visual';
  return Math.max(0,circle.members+Number(joinedRelation(circle.id))-Number(initiallyJoined));
}
function loginFor(go:Props['go']){
  if(typeof window!=='undefined'){
    const q=new URLSearchParams(window.location.search),id=q.get('page')||'circles';
    q.delete('page');if(q.get('state')==='guest')q.delete('state');
    storage.setItem('cp-return',id+'?'+q.toString());
  }
  go('login');
}
function adminRows(){
  try{const raw=storage.getItem('bp-op-circles');return raw?JSON.parse(raw) as {id:string;title:string;detail?:string;status?:string}[]:null;}catch{return null;}
}
function circles():Circle[]{
  const rows=adminRows();
  if(!rows)return demoCircles;
  const managed=rows.map(row=>{
    const id=row.id.replace(/^ci-/,'');
    const base=demoCircles.find(c=>c.id===id);
    return {id,name:row.title,description:row.detail||base?.description||'围绕创作分享与交流',cover:base?.cover||'restore',members:base?.members||128};
  });
  return [...managed,...demoCircles.filter(c=>!managed.some(row=>row.id===c.id))];
}
function postCircle(post:SamplePost){
  const id=contentCircleId(post.circle||'',post.circleId);
  return circles().find(c=>c.id===id);
}
function closed(id:string){return adminRows()?.some(row=>row.id==='ci-'+id&&row.status==='已关闭')||false}
function rules(id:string){
  try{return JSON.parse(storage.getItem('bp-op-circle-public-ci-'+id)||'null') as {intro?:string;announcement?:string}|null;}catch{return null;}
}
function State({title,body,action,onAction}:{title:string;body?:string;action?:string;onAction?:()=>void}){
  return <div className="circle-state"><strong>{title}</strong>{body&&<p>{body}</p>}{action&&<button type="button" onClick={onAction}>{action}</button>}</div>;
}
function CircleCard({circle,go,joined}:{circle:Circle;go:Props['go'];joined:boolean}){
  return <button type="button" className="circle-list-card" onClick={()=>go(circleTarget(circle.id))}>
    <img src={img(circle.cover)} alt="" />
    <span className="circle-list-copy"><strong>{circle.name}</strong><span>{circle.description}</span><small>{memberCount(circle).toLocaleString('zh-CN')} 人加入</small></span>
    <span className="circle-list-arrow" aria-hidden="true">{joined?'已加入':'›'}</span>
  </button>;
}
export function CirclesPage({state,go}:Props){
  if(typeof window!=='undefined'&&new URLSearchParams(location.search).get('device')==='pc')return <DesktopCircleCommunity state={state} go={go}/>;
  if(state==='loading')return <div className="circle-skeleton" aria-label="正在加载圈子"/>;
  if(state==='error')return <State title="圈子暂时加载失败" body="请稍后再试。" action="重试" onAction={()=>go('circles')}/>;
  if(state==='empty')return <State title="暂时没有可发现的圈子" action={new URLSearchParams(location.search).get('device')==='pc'?'浏览作品':'返回社区'} onAction={()=>go('community')}/>;
  const available=circles().filter(c=>!closed(c.id));
  const joined=available.filter(c=>isJoined(c.id));
  const discover=available.filter(c=>!isJoined(c.id));
  return <div className="circle-pages circle-list-page">

    <section className="circle-list-section"><div className="circle-section-heading"><h2>已加入</h2><span>{joined.length} 个圈子</span></div>
      {joined.length?<div className="circle-card-grid">{joined.map(c=><CircleCard key={c.id} circle={c} go={go} joined/>)}</div>:<div className="circle-list-empty">还没有加入圈子</div>}
    </section>
    {discover.length>0&&<section className="circle-list-section"><div className="circle-section-heading"><h2>发现圈子</h2><span>{discover.length} 个圈子</span></div>
      <div className="circle-card-grid">{discover.map(c=><CircleCard key={c.id} circle={c} go={go} joined={false}/>)}</div>
    </section>}
  </div>;
}
function FeedCard({item,go}:{item:SamplePost;go:Props['go']}){
  const open=()=>go(postTarget(item.id));
  return <article className="circle-feed-card"><button type="button" className="circle-feed-byline" onClick={()=>go('author?name='+encodeURIComponent(item.author))}><span className="circle-feed-avatar">{item.author.slice(0,1)}</span><span><strong>{item.author}</strong><small>{item.date}</small></span></button>
    <button type="button" className="circle-feed-open" onClick={open}>
      <strong>{item.title}</strong><span>{item.summary}</span>
    </button>
    {item.image&&<PostImageGallery compact images={postImages(item.id,item.image)} title={item.title}/>}
    <ActionBar kind="post" target={postTarget(item.id)} title={item.title} go={go} onComment={()=>go(postTarget(item.id)+'&discussion=1')}/>
  </article>;
}
export function CirclePage({state,go}:Props){
  const [publishSlot,setPublishSlot]=useState<HTMLElement|null>(null);
  useEffect(()=>{const frame=requestAnimationFrame(()=>setPublishSlot(document.getElementById('circle-publish-slot')));return()=>cancelAnimationFrame(frame)},[]);
  const db=useB();
  const id=typeof window==='undefined'?'image':new URLSearchParams(window.location.search).get('item')||'image';
  const circle=circles().find(c=>c.id===id);
  const [joined,setJoined]=useState(()=>isJoined(id));
  const [notice,setNotice]=useState('');
  const publicRules=rules(id);
  if(state==='loading')return <div className="circle-skeleton" aria-label="正在加载圈子"/>;
  if(state==='removed'||state==='forbidden'||!circle)return <State title="圈子暂不可访问" action="返回圈子" onAction={()=>go('circles')}/>;
  const feed=publicPostRows(db.records).filter(p=>postCircle(p)?.id===circle.id&&(p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.publicStatus==='公开')).sort((a,b)=>{return postDateOrder(b.date)-postDateOrder(a.date)||a.id.localeCompare(b.id);});
  const publish=()=>{
    if(state==='guest'||!signedIn()){loginFor(go);return}
    if(!joined){setNotice('加入圈子后即可在这里发布');return}
    storage.setItem('cp-post-kind','post');storage.setItem('cp-circle',circle.name);storage.setItem('cp-circle-id',circle.id);go('post-publish');
  };
  if(state==='closed'||closed(id))return <div className="circle-pages circle-detail-page"><State title="圈子已停用" body="这里不再接收加入和新帖子。你可以返回社区继续浏览公开内容。" action="返回社区" onAction={()=>go('community')}/></div>;
  const join=()=>{
    if(state==='guest'||!signedIn()){loginFor(go);return}
    setJoinedRelation(id,!joined);
    setJoined(!joined);setNotice(joined?'已退出圈子，已发布内容仍会保留':'已加入圈子');
  };
  return <div className="circle-pages circle-detail-page">
    <div className="circle-detail-intro"><img className="circle-detail-avatar" src={img(circle.cover)} alt=""/><div className="circle-detail-copy"><h1>{circle.name}</h1><p>{publicRules?.intro||circle.description}</p><span className="circle-member-count">{memberCount(circle).toLocaleString('zh-CN')} 人加入</span></div><button type="button" className={(joined?'circle-secondary':'circle-primary')+' circle-join'} onClick={join}>{joined?'退出圈子':'加入圈子'}</button></div>
    <TransientFeedback message={notice} onClear={()=>setNotice('')}/>
    {publicRules?.announcement&&<p className="circle-announcement"><strong>圈子公告</strong>{publicRules.announcement}</p>}
    <section className="circle-feed">{publishSlot?createPortal(<button type="button" className="circle-nav-publish" onClick={publish}>发布</button>,publishSlot):<div className="circle-feed-heading"><button type="button" className="circle-secondary circle-publish" onClick={publish}>在圈内发布</button></div>}
      {state==='empty'||!feed.length?<State title="还没有公开帖子" body="加入圈子，分享你的第一次尝试。" action="发布帖子" onAction={publish}/>:feed.map(p=><FeedCard key={p.id} item={p} go={go}/>)}
    </section>
  </div>;
}

function CircleFeedCard({post:p,go,selectCircle}:{post:SamplePost;go:Props['go'];selectCircle:(id:string)=>void}){
 const [comments,setComments]=useState(false),[expanded,setExpanded]=useState(false);
 const circle=postCircle(p);
 const sampleIndex=Math.max(0,samplePosts.findIndex(post=>post.id===p.id));
 let ownCommentCount=0;try{ownCommentCount=JSON.parse(storage.getItem('reading-comments:'+postTarget(p.id))||'[]').length;}catch{}
 const counts={likes:36+sampleIndex*17,favorites:8+sampleIndex*3,comments:7+ownCommentCount};
 const time=({'restore-color':'3分钟前','restore-detail':'18分钟前','restore-background':'1小时前','light':'8分钟前','image-window':'26分钟前'} as Record<string,string>)[p.id]||p.date;
 return <article className="cd-post"><div className="cd-post-meta"><button className="cd-author" onClick={()=>go('author?name='+encodeURIComponent(p.author))}><span>{p.author[0]}</span><span className="cd-author-text"><strong>{p.author}</strong><small>{time}</small></span></button>{circle&&<button className="cd-post-circle" onClick={()=>selectCircle(circle.id)}><span aria-hidden="true">#</span> {circle.name}</button>}</div><div className="cd-post-open"><h2>{p.title}</h2>{expanded?p.body.map((t,i)=><p key={i}>{t}</p>):<p>{p.summary}</p>}<button className="cd-expand-post" onClick={()=>setExpanded(!expanded)}>{expanded?'收起正文':'展开全文'}</button>{p.image&&<PostImageGallery compact images={postImages(p.id,p.image)} title={p.title}/>}</div><ActionBar kind="post" target={postTarget(p.id)} title={p.title} go={go} counts={counts} onComment={()=>setComments(!comments)}/>{comments&&<section className="cd-inline-comments"><button className="cd-collapse-comments" onClick={()=>setComments(false)}>收起评论</button><Comments key={p.id} target={postTarget(p.id)} kind="post" go={go} inline/></section>}</article>;
}

export function DesktopCircleCommunity({state,go}:{state:string;go:Props['go']}){
 const db=useB();
 const [revision,setRevision]=useState(0),[notice,setNotice]=useState('');
 const available=circles().filter(c=>!closed(c.id));
 const joined=available.filter(c=>isJoined(c.id)),suggested=available.filter(c=>!isJoined(c.id));
 const selectedId=typeof window==='undefined'?'':new URLSearchParams(location.search).get('item')||'';
 const selected=circles().find(c=>c.id===selectedId);
 const selectCircle=(id:string)=>go('circles'+(id?'?item='+id:''));
 const name=storage.getItem('cp-profile-name')||'林间';
 const avatar=storage.getItem('cp-profile-avatar');
 const guest=state==='guest';
 const feed=publicPostRows(db.records).filter(p=>(p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.publicStatus==='公开')&&(selected?postCircle(p)?.id===selected.id:p.recommended)).sort((a,b)=>postDateOrder(b.date)-postDateOrder(a.date)||a.id.localeCompare(b.id));
 if(selectedId&&(!selected||['removed','forbidden'].includes(state)))return <State title="圈子暂不可访问" action="返回推荐" onAction={()=>selectCircle('')}/>;
 const publish=()=>{if(guest||!signedIn()){loginFor(go);return;}storage.setItem('cp-post-kind','post');if(selected){if(!isJoined(selected.id)){setNotice('加入圈子后即可在这里发布');return;}if((state==='closed'||closed(selected.id))){setNotice('圈子已停用，暂不可发布');return;}storage.setItem('cp-circle',selected.name);storage.setItem('cp-circle-id',selected.id);}else {storage.removeItem('cp-circle');storage.removeItem('cp-circle-id');}go('post-publish');};
 const row=(c:Circle,join=false)=><div className="cd-circle-row" key={c.id}><button className="cd-circle-link" aria-label={c.name} onClick={()=>selectCircle(c.id)}><img src={img(c.cover)} alt=""/><span><strong>{c.name}</strong><small>{join?memberCount(c).toLocaleString('zh-CN')+' 人加入':c.description}</small></span></button>{join&&<button className="cd-join" onClick={()=>{if(guest||!signedIn()){loginFor(go);return;}setJoinedRelation(c.id,true);setRevision(revision+1);setNotice('已加入圈子');}}>加入</button>}</div>;
 return <div className="cd-layout"><section className="cd-stream"><header className="cd-heading"><nav aria-label="圈子内容筛选"><button aria-pressed={!selected} onClick={()=>selectCircle('')}>推荐</button>{joined.map(c=><button key={c.id} aria-pressed={selected?.id===c.id} onClick={()=>selectCircle(c.id)}>{c.name}</button>)}{selected&&!joined.some(c=>c.id===selected.id)&&<button aria-pressed="true" onClick={()=>selectCircle(selected.id)}>{selected.name}</button>}</nav></header>
 {selected&&<details className="cd-pinned"><summary><span>置顶</span><strong>{selected.name} · 交流须知</strong><small>圈子管理员</small></summary><p>{rules(selected.id)?.announcement||'欢迎分享你的创作过程、经验与问题。发帖时请说明使用的方法和希望讨论的重点，让交流更有帮助。'}</p></details>}
 {state==='error'?<State title="帖子暂时加载失败" action="重试" onAction={()=>selectCircle(selectedId)}/>:state==='empty'||!feed.length?<State title="还没有公开帖子" action="发布帖子" onAction={publish}/>:feed.map(p=><CircleFeedCard key={p.id} post={p} go={go} selectCircle={selectCircle}/>)}<p className="cd-end">已经看完了，去圈子里发现更多灵感</p></section>
 <aside className="cd-sidebar"><section className="cd-user"><button className="cd-profile" onClick={()=>guest?loginFor(go):go('mine')}><span className="cd-avatar">{avatar&&!guest?<img src={avatar} alt=""/>:guest?'客':name.slice(0,1)}</span><span><strong>{guest?'欢迎来到圈子':name}</strong><small>{guest?'登录后分享灵感，加入讨论':'今天也来分享一点灵感'}</small></span><span aria-hidden="true">›</span></button><button className="cd-publish" onClick={publish}><img src="/home-prototype/icons/edit-line.svg" alt=""/>发布帖子</button></section>
 {selected&&<section className="cd-selected-circle"><header className="cd-selected-header"><img src={img(selected.cover)} alt=""/><div><h2>{selected.name}</h2><small>{memberCount(selected).toLocaleString('zh-CN')} 人加入</small></div><button className={"cd-membership"+(isJoined(selected.id)?" is-joined":"")} disabled={(state==='closed'||closed(selected.id))} onClick={()=>{if(guest||!signedIn()){loginFor(go);return;}const wasJoined=isJoined(selected.id);setJoinedRelation(selected.id,!wasJoined);setRevision(revision+1);setNotice(wasJoined?'已退出圈子':'已加入圈子');if(wasJoined)selectCircle('');}}>{(state==='closed'||closed(selected.id))?'圈子已停用':isJoined(selected.id)?'退出圈子':'加入圈子'}</button></header><p>{rules(selected.id)?.intro||selected.description}</p>{rules(selected.id)?.announcement&&<p className="cd-announcement"><strong>公告</strong>{rules(selected.id)?.announcement}</p>}</section>}
 {!selected&&<section className="cd-circle-section"><header><h2>我的圈子</h2><button onClick={()=>guest?loginFor(go):go('my-circles')}>{guest?'登录':'查看全部'} ›</button></header>{guest?<p className="cd-muted">登录后查看已加入的圈子</p>:joined.length?joined.slice(0,3).map(c=>row(c)):<p className="cd-muted">加入感兴趣的圈子，和同好交流</p>}</section>}
 <section className="cd-circle-section"><header><h2>推荐圈子</h2><button onClick={()=>go('discover-circles')}>查看全部 ›</button></header><div>{suggested.filter(c=>c.id!==selected?.id).slice(0,selected?2:3).map(c=>row(c,true))}{!suggested.length&&<p className="cd-muted">你已加入全部圈子</p>}</div></section></aside><TransientFeedback message={notice} onClear={()=>setNotice('')}/></div>;
}

export function DiscoverCircles({state,go}:Props){
 const [revision,setRevision]=useState(0),[notice,setNotice]=useState('');
 const rows=circles().filter(c=>!closed(c.id));
 return <section className="cd-discover"><button className="cd-discover-back" onClick={()=>go('circles')}>‹ 圈子首页</button><header><div><h1>发现圈子</h1><p>找到同好，一起分享创作中的发现</p></div></header><div className="cd-discover-grid">{rows.map(c=><article key={c.id}><button className="cd-discover-open" onClick={()=>go('circles?item='+c.id)}><img src={img(c.cover)} alt=""/><strong>{c.name}</strong><p>{c.description}</p></button><footer><small>{memberCount(c).toLocaleString('zh-CN')} 人加入</small><button className="cd-join" onClick={()=>{if(isJoined(c.id)){go('circles?item='+c.id);return;}if(state==='guest'||!signedIn()){loginFor(go);return;}setJoinedRelation(c.id,true);setRevision(revision+1);setNotice('已加入圈子');}}>{isJoined(c.id)?'进入圈子':'加入圈子'}</button></footer></article>)}</div>{!rows.length&&<State title="暂时没有可发现的圈子"/>}<TransientFeedback message={notice} onClear={()=>setNotice('')}/></section>;
}

export function PostCirclePanel({circleName,circleId,go}:{circleName?:string;circleId?:string;go:Props['go']}){
 const [,refresh]=useState(0),[notice,setNotice]=useState('');
 const circle=circles().find(c=>c.id===contentCircleId(circleName||'',circleId));
 const joined=!!circle&&isJoined(circle.id);
 const publish=()=>{if(!signedIn()){loginFor(go);return;}if(circle&&!joined){setNotice('加入圈子后即可在这里发布');return;}storage.setItem('cp-post-kind','post');if(circle){storage.setItem('cp-circle',circle.name);storage.setItem('cp-circle-id',circle.id);}else {storage.removeItem('cp-circle');storage.removeItem('cp-circle-id');}go('post-publish');};
 return <>{circle&&<section className="pd-circle"><header><img src={img(circle.cover)} alt=""/><div><h2>{circle.name}</h2><small>{memberCount(circle).toLocaleString('zh-CN')} 人加入</small></div></header><p>{circle.description}</p><div className="pd-circle-actions"><button onClick={()=>go('circles?item='+circle.id)}>进入圈子</button><button className={joined?'pd-exit':''} disabled={closed(circle.id)} onClick={()=>{if(!signedIn()){loginFor(go);return;}setJoinedRelation(circle.id,!joined);refresh(v=>v+1);setNotice(joined?'已退出圈子':'已加入圈子');}}>{closed(circle.id)?'圈子已停用':joined?'退出圈子':'加入圈子'}</button></div></section>}<button className="cd-publish" disabled={!!circle&&closed(circle.id)} onClick={publish}><img src="/home-prototype/icons/edit-line.svg" alt=""/>发布帖子</button><TransientFeedback message={notice} onClear={()=>setNotice('')}/></>;
}
