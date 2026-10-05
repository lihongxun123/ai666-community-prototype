'use client';
import {useState, type ReactNode} from 'react';
type Card={cover:string;title:string;kind:string;target:string};
export function DesktopTopic({title,intro,cards,share,go}:{title:string;intro:string;cards:Card[];share:ReactNode;go:(p:string)=>void}) {
 const [selected,setSelected]=useState(''),[filter,setFilter]=useState('全部');
 const featured=cards.slice(0,4),active=featured.find(c=>c.target===selected)||featured[0];
 const category=(c:Card)=>c.kind==='文字作品'?'作品':c.kind;
 const kinds=['全部',...Array.from(new Set(cards.map(category)))];
 const currentFilter=kinds.includes(filter)?filter:'全部';
 const action=(c:Card)=>category(c)==='教程'?'阅读教程':category(c)==='AI应用'?'查看应用':category(c)==='资源'?'查看资源':category(c)==='帖子'?'查看帖子':'查看作品';
 return <article className="topic-detail-showcase">
  <div className="topic-detail-topline"><button onClick={()=>go('topics')}><img src="/home-prototype/icons/arrow-left-line.svg" alt=""/>全部专题</button>{share}</div>
  <section className="topic-detail-feature">
   <div className="topic-detail-intro"><span className="topic-detail-eyebrow">精选专题</span><h1>{title}</h1><p>{intro}</p>
    {featured.length>0&&<nav className="topic-detail-feature-menu" aria-label="精选内容预览">{featured.map((c,i)=><button key={c.target} aria-pressed={active?.target===c.target} onClick={()=>setSelected(c.target)}><span>{String(i+1).padStart(2,'0')}</span><strong>{c.title}</strong><img src="/home-prototype/icons/arrow-right-line.svg" alt=""/></button>)}</nav>}
   </div>
   {active&&<div className="topic-detail-preview"><img key={active.target} src={'/home-prototype/'+active.cover+'.png'} alt={active.title}/><div className="topic-detail-preview-caption"><div><span>{active.kind}</span><h2>{active.title}</h2></div><button onClick={()=>go(active.target)}>{action(active)}<img src="/home-prototype/icons/arrow-right-line.svg" alt=""/></button></div></div>}
  </section>
  <section className="topic-detail-collection" aria-label="专题全部内容"><nav className="topic-detail-filters" aria-label="内容类型">{kinds.map(kind=><button key={kind} aria-pressed={currentFilter===kind} onClick={()=>setFilter(kind)}>{kind}<span>{kind==='全部'?cards.length:cards.filter(c=>category(c)===kind).length}</span></button>)}</nav>
  {cards.length?<div className="topic-detail-grid">{cards.filter(c=>currentFilter==='全部'||category(c)===currentFilter).map(c=><button className="topic-detail-card" key={c.target} onClick={()=>go(c.target)} aria-label={action(c)+'：'+c.title}><div className="topic-detail-card-image"><img src={'/home-prototype/'+c.cover+'.png'} alt=""/><span>{c.kind}</span></div><div className="topic-detail-card-title"><h2>{c.title}</h2><img src="/home-prototype/icons/arrow-right-line.svg" alt=""/></div></button>)}</div>:<p className="cp-end">暂无可浏览内容</p>}
  </section>
 </article>;
}
