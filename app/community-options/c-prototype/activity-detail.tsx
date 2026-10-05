'use client';

import { useEffect, useRef, useState } from 'react';
import { ActivityDescription } from './activity-description';
import { prototypeStore } from './storage';
export type DetailTask = {title:string;description:string;reward:string;progress:string;status:string;disabled:boolean;action?:string;run:()=>void};
type DetailProps={code:string;name:string;period:string;reward:string;image?:string;status:string;description:string;joined:boolean;blocked:boolean;join:()=>void;go:(page:string)=>void;tasks:DetailTask[];showWorks:boolean;notice?:string};
export function ActivityDetail({code,name,period,reward,image,status,description,joined,blocked,join,go,tasks,showWorks,notice}:DetailProps) {
  const [activeSection,setActiveSection]=useState(description.trim()?'national-description':'national-tasks');
  const navRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    const sections=['national-description','national-tasks','national-works'].map(id=>document.getElementById(id)).filter((node):node is HTMLElement=>Boolean(node));
    let frame=0;
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const edge=(navRef.current?.getBoundingClientRect().bottom || 96)+24;let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=edge)current=section;}if(current)setActiveSection(current.id);});};
    document.addEventListener('scroll',update,true);update();
    return ()=>{document.removeEventListener('scroll',update,true);cancelAnimationFrame(frame);};
  },[description]);
  const wasJoined = useRef(joined);
  useEffect(()=>{if(joined && !wasJoined.current) document.getElementById('national-tasks')?.scrollIntoView({behavior:'smooth',block:'start'});wasJoined.current=joined;},[joined]);
  const primary = () => {if(blocked)return;if(!joined){join();return;}document.getElementById(tasks.length?'national-tasks':'national-description')?.scrollIntoView({behavior:'instant',block:'start'});};
  const primaryLabel = blocked?status:!joined?'立即参与':tasks.length?'去做任务':'查看说明';
  return <article className="cp-national">
    <div className="cp-national-intro"><div className="cp-national-banner"><img className="cp-national-cover" src={image} alt={name+"活动封面"}/><span className="cp-national-badge">{status}</span></div>
    <header><h1>{name}</h1>{reward && <strong>{reward}</strong>}<small>{period}</small></header></div>
    <div className="cp-national-participation"><div><h2>我的参与状态</h2><p>{blocked?status:joined?'已参与':'尚未参与'}{joined&&tasks.length>0?' · 任务进度见下方':''}</p></div><button disabled={blocked} onClick={primary}>{primaryLabel}</button></div>
    {notice && <p className="cp-national-notice">{notice}</p>}
    <nav ref={navRef} className="cp-national-nav" aria-label="活动分区">{[['national-description','活动说明'],['national-tasks','活动任务'],['national-works','投稿作品']].filter(([id])=>id==='national-description'?Boolean(description.trim()):id==='national-tasks'?tasks.length>0:showWorks).map(([id,label])=><button key={id} aria-current={activeSection===id?"location":undefined} onClick={()=>{setActiveSection(id);document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'});}}>{label}</button>)}</nav>
    {tasks.length>0 && <section id="national-tasks" className="cp-national-task-section"><h2>活动任务</h2><div className="cp-national-task-list">
      {tasks.map((task,index)=>{const [current,total]=task.progress.split('/').map(Number);const finished=/已完成|已领奖/.test(task.status);const inactive=task.disabled&&!finished;return <article className={`cp-national-task ${task.disabled?'is-muted':'is-available'} ${inactive?'is-inactive':''} ${finished?'is-finished':''}`} key={index}><div className="cp-national-task-top"><span className="cp-national-task-state">{task.status}</span><strong>{task.reward}</strong></div><h3>{task.title}</h3><p>{task.description}</p><div className="cp-national-task-bottom"><div className="cp-national-progress"><span>任务进度 <b>{task.progress}</b></span>{Number.isFinite(total)&&total>0&&<progress value={current||0} max={total} aria-label={task.title+'进度'}/>}</div><span className="cp-task-pc-note">{inactive?(task.status.includes("过期")?"任务已结束":task.status):""}</span>{task.disabled&&<span className="cp-task-pc-result">{finished?<>已完成<small>积分已发放</small></>:/开放|解锁/.test(task.status)?"未开放":task.status}</span>}{task.action&&<button disabled={blocked||task.disabled} onClick={()=>joined?task.run():join()}>{task.action}</button>}</div></article>;})}
    </div></section>}
    {description.length>0 && <section id="national-description" className="cp-national-description-section"><h2>活动说明</h2><ActivityDescription content={description}/></section>}
    {showWorks && <section id="national-works" className="cp-national-works-section"><div className="cp-national-heading"><h2>投稿作品</h2><button onClick={()=>{prototypeStore.setItem('cp-activity-code',code);prototypeStore.setItem('cp-activity-name',name);go('submissions');}}>我的投稿 →</button></div><div className="cp-national-works">{[['sea','日落之前'],['perfume','一瓶夏日晴光'],['interior','在海边住一下午'],['underwater','沉入一场蓝色的梦'],['portrait','把阳光留在眼睛里'],['restore','旧照修复练习'],['girl','夏日的转角'],['anime','风从蓝色花间经过']].map(([item,title])=><button key={item} onClick={()=>go('work?item='+item)}><div className="cp-national-work-cover"><img src={'/home-prototype/'+item+'.png'} alt={title}/></div><span>{title}</span></button>)}</div></section>}
    <footer><button disabled={blocked} onClick={primary}>{primaryLabel}</button></footer>
  </article>;
}
