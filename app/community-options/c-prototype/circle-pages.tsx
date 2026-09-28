'use client';

/* eslint-disable next/no-img-element -- Images belong to the local prototype asset set. */
import {useState} from 'react';
import {prototypeStore as storage} from './storage';
import {samplePosts,postTarget,circleTarget,type SamplePost} from './content-data';
import {useB} from '../b-prototype/store';
import './circle-pages.css';

type Props={page:string;state:string;go:(page:string)=>void};
type Circle={id:string;name:string;description:string;cover:string;members:number};

// Fictional content used only by this concept prototype. The two shared circles keep their B-end state.
const demoCircles:Circle[]=[
  {id:'image',name:'影像练习圈',description:'照片修复、构图与视觉叙事',cover:'restore',members:1286},
  {id:'visual',name:'视觉创作圈',description:'产品视觉、光线与配色',cover:'perfume',members:963},
  {id:'writing',name:'写作灵感圈',description:'日常观察、短篇与表达练习',cover:'writing',members:742},
  {id:'film',name:'短片实验圈',description:'镜头语言、剪辑与声音',cover:'sea',members:618},
  {id:'life',name:'生活美学圈',description:'空间、器物与生活记录',cover:'interior',members:525},
  {id:'character',name:'角色创作圈',description:'人物设定、故事与画面',cover:'anime',members:409},
];
const demoReplies:Record<string,number>={restore:12,'image-window':9,'image-crop':18,'image-album':7,light:14,question:11,'visual-space':6,'writing-commute':16,'writing-sound':8,'film-opening':13,'film-cut':5,'life-desk':10,'life-colors':4,'character-expression':21,'character-objects':7};
const img=(name:string)=>`/home-prototype/${name}.png`;
const isEmbed=()=>typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('embed')==='1';
const signedIn=()=>storage.getItem('cp-auth')==='1';
function joinKey(id:string){return 'cp-circle-joined:'+id}
function isJoined(id:string){
  if(!signedIn()&&!isEmbed())return false;
  const saved=storage.getItem(joinKey(id));
  if(saved!==null)return saved==='1';
  if(id==='image'&&storage.getItem('cp-circle-joined')!==null)return storage.getItem('cp-circle-joined')==='1';
  return isEmbed()&&(id==='image'||id==='visual');
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
function closed(id:string){return adminRows()?.some(row=>row.id==='ci-'+id&&row.status==='已关闭')||false}
function rules(id:string){
  try{return JSON.parse(storage.getItem('bp-op-circle-public-ci-'+id)||'null') as {intro?:string;rules?:string;announcement?:string}|null;}catch{return null;}
}
function State({title,body,action,onAction}:{title:string;body?:string;action?:string;onAction?:()=>void}){
  return <div className="circle-state"><strong>{title}</strong>{body&&<p>{body}</p>}{action&&<button type="button" onClick={onAction}>{action}</button>}</div>;
}
function CircleCard({circle,go,joined}:{circle:Circle;go:Props['go'];joined:boolean}){
  return <button type="button" className="circle-list-card" onClick={()=>go(circleTarget(circle.id))}>
    <img src={img(circle.cover)} alt="" />
    <span className="circle-list-copy"><strong>{circle.name}</strong><span>{circle.description}</span><small>{circle.members.toLocaleString('zh-CN')} 人加入</small></span>
    <span className="circle-list-arrow" aria-hidden="true">{joined?'已加入':'›'}</span>
  </button>;
}
export function CirclesPage({state,go}:Props){
  if(state==='loading')return <div className="circle-skeleton" aria-label="正在加载圈子"/>;
  if(state==='error')return <State title="圈子暂时加载失败" body="请稍后再试。" action="重试" onAction={()=>go('circles')}/>;
  if(state==='empty')return <State title="暂时没有可发现的圈子" body="可以返回社区继续阅读。" action="返回社区" onAction={()=>go('community')}/>;
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
      <strong>{item.title}</strong><span>{item.summary}</span>{item.image&&<img src={img(item.image)} alt=""/>}
    </button>
    <div className="circle-feed-foot"><span>讨论 {demoReplies[item.id]||0}</span><button type="button" onClick={open}>查看帖子 <span aria-hidden="true">›</span></button></div>
  </article>;
}
export function CirclePage({state,go}:Props){
  const db=useB();
  const id=typeof window==='undefined'?'image':new URLSearchParams(window.location.search).get('item')||'image';
  const circle=circles().find(c=>c.id===id);
  const [joined,setJoined]=useState(()=>isJoined(id));
  const [notice,setNotice]=useState('');
  const publicRules=rules(id);
  if(state==='loading')return <div className="circle-skeleton" aria-label="正在加载圈子"/>;
  if(state==='removed'||state==='forbidden'||!circle)return <State title="圈子暂不可访问" action="返回圈子" onAction={()=>go('circles')}/>;
  const feed=samplePosts.filter(p=>p.circle===(demoCircles.find(c=>c.id===id)?.name||circle.name)&&(p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.publicStatus==='公开')).sort((a,b)=>{const date=(v:string)=>{const n=v.match(/\d+/g)||[];return Number(n[0])*100+Number(n[1]);};return date(b.date)-date(a.date)||a.id.localeCompare(b.id);});
  const publish=()=>{
    if(state==='guest'||!signedIn()){loginFor(go);return}
    if(!joined){setNotice('加入圈子后即可在这里发布');return}
    storage.setItem('cp-post-kind','post');storage.setItem('cp-circle',circle.name);go('post-edit');
  };
  if(state==='closed'||closed(id))return <div className="circle-pages circle-detail-page"><State title="圈子已关闭" body="这里不再接收新帖子，已公开的历史内容仍可阅读。" action="返回圈子" onAction={()=>go('circles')}/><section className="circle-feed"><h2>历史帖子</h2>{feed.map(p=><FeedCard key={p.id} item={p} go={go}/>)}</section></div>;
  const join=()=>{
    if(state==='guest'||!signedIn()){loginFor(go);return}
    storage.setItem(joinKey(id),joined?'0':'1');
    if(id==='image')storage.setItem('cp-circle-joined',joined?'0':'1');
    setJoined(!joined);setNotice(joined?'已退出圈子，已发布内容仍会保留':'已加入圈子');
  };
  return <div className="circle-pages circle-detail-page">
    <div className="circle-detail-intro"><img className="circle-detail-avatar" src={img(circle.cover)} alt=""/><div className="circle-detail-copy"><h1>{circle.name}</h1><p>{publicRules?.intro||circle.description}</p><span className="circle-member-count">{circle.members.toLocaleString('zh-CN')} 人加入</span></div><button type="button" className="circle-primary circle-join" onClick={join}>{joined?'退出圈子':'加入圈子'}</button></div>
    {notice&&<output className="circle-notice">{notice}</output>}
    {publicRules?.announcement&&<p className="circle-announcement"><strong>圈子公告</strong>{publicRules.announcement}</p>}
    <details className="circle-rules"><summary>圈子规则 <span>展开查看</span></summary><p>{publicRules?.rules||'尊重原创，围绕主题分享自己的实践与想法；引用他人的作品时，请保留原内容入口。'}</p></details>
    <section className="circle-feed"><div className="circle-feed-heading"><h2>圈内帖子</h2><button type="button" className="circle-secondary circle-publish" onClick={publish}>在圈内发布</button></div>
      {state==='empty'||!feed.length?<State title="还没有公开帖子" body="加入圈子，分享你的第一次尝试。" action="发布帖子" onAction={publish}/>:feed.map(p=><FeedCard key={p.id} item={p} go={go}/>)}
    </section>
  </div>;
}
