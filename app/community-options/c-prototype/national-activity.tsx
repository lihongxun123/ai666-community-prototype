'use client';

import { useEffect, useRef, useState } from 'react';
import { ActivityDescription } from './activity-description';
import { prototypeStore } from './storage';
const days = [
  ['浏览 5 条内容',20,5,'去浏览','community'],
  ['收藏 3 个作品',30,3,'去收藏','community'],
  ['发布 1 条纯文字帖子',40,1,'去发布','post-publish'],
  ['发布 1 条图片帖子',50,1,'去发布','post-publish'],
  ['点赞或评论 5 个作品',60,5,'去互动','community'],
  ['收藏 5 个作品',70,5,'去收藏','community'],
  ['分享 1 个作品',80,1,'去分享','community'],
] as const;
export function NationalActivity({joined,join,go,publish,image,status,description}:{joined:boolean;join:()=>void;go:(page:string)=>void;publish:()=>void;image?:string;status:string;description:string}) {
  const today = Math.floor((Date.now()-Date.parse('2026-10-01T00:00:00+08:00'))/86400000)+1;
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
  const active = status === '进行中' && today>=1 && today<=7;
  const taskDescriptions = ['浏览 5 条社区内容，发现国庆创作灵感。','收藏 3 个喜欢的作品，积累创作灵感。','发布 1 条纯文字帖子，记录你的国庆灵感。','发布 1 条带图片的帖子，分享你的国庆创意。','点赞或评论 5 个社区作品，参与创作者互动。','收藏 5 个喜欢的作品，完善你的灵感清单。','分享 1 个喜欢的社区作品，完成国庆七日任务。'];
  const runTask = (index:number) => {
    if(!active || index+1!==today)return;
    if(!joined){join();return;}
    const task=days[index];
    if(task[4]==='post-publish'){
      ['cp-source','cp-result','cp-circle','cp-activity-task'].forEach(key=>prototypeStore.removeItem(key));
      prototypeStore.setItem('cp-activity','1');prototypeStore.setItem('cp-activity-code','guoqing_qitianle_20261001');prototypeStore.setItem('cp-activity-name','国庆七天乐');prototypeStore.setItem('cp-activity-task',task[0]);
    }
    go(task[4]);
  };
  return <article className="cp-national">
    <div className="cp-national-intro"><div className="cp-national-banner"><img className="cp-national-cover" src={image} alt="国庆七天乐活动封面"/><span className="cp-national-badge">{status}</span></div>
    <header><h1>国庆七天乐</h1><strong>最高可得 1,750 积分</strong><small>10月1日至10月7日</small></header></div>
    <div className="cp-national-participation"><div><h2>我的参与状态</h2><p>{joined?'已参与 · 七日任务 0/7':'尚未参与'}</p></div><button disabled={!active} onClick={()=>joined?document.getElementById('national-tasks')?.scrollIntoView({behavior:'smooth'}):join()}>{active?(joined?'去做任务':'立即参与'):(today<1?'未开始':'已结束')}</button></div>
    <nav ref={navRef} className="cp-national-nav" aria-label="活动分区">{[['national-description','活动说明'],['national-tasks','活动任务'],['national-works','投稿作品']].filter(([id])=>id!=='national-description'||description.trim()).map(([id,label])=><button key={id} aria-current={activeSection===id?"location":undefined} onClick={()=>{setActiveSection(id);document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'});}}>{label}</button>)}</nav>
    <section id="national-tasks" className="cp-national-task-section"><h2>活动任务</h2><div className="cp-national-task-list">
      <article className={`cp-national-task ${active?"is-available":"is-muted"}`}><div className="cp-national-task-top"><span className="cp-national-task-state">{active?'待完成':today<1?'未开放':'已结束'}</span><strong>+100 <small>积分 / 条</small></strong></div><h3>每天发布 2 条图片作品</h3><p>活动期间每天发布前 2 条图片作品，每条奖励 100 积分；每日最高 200 积分。</p><div className="cp-national-task-bottom"><div className="cp-national-progress"><span>今日进度 <b>0/2</b></span><progress value={0} max={2} aria-label="每日图片任务进度"/></div><button disabled={!active} onClick={()=>joined?publish():join()}>去发布作品</button></div></article>
      {days.map((task,index)=>{const state=index+1<today?'已过期':index+1>today?'未开放':'待完成';return <article className={`cp-national-task ${active && index+1===today?"is-available":"is-muted"}`} key={task[0]}><div className="cp-national-task-top"><span className="cp-national-task-state">{state}</span><strong>+{task[1]} <small>积分</small></strong></div><h3>第 {index+1} 天：{task[0]}</h3><p>{taskDescriptions[index]}</p><div className="cp-national-task-bottom"><div className="cp-national-progress"><span>任务进度 <b>0/{task[2]}</b></span><progress value={0} max={task[2]} aria-label={task[0]+"进度"}/></div><button disabled={!active || index+1!==today} onClick={()=>runTask(index)}>{task[3]}</button></div></article>;})}
    </div></section>
    {description.length>0 && <section id="national-description" className="cp-national-description-section"><h2>活动说明</h2><ActivityDescription content={description}/></section>}
    <section id="national-works" className="cp-national-works-section"><div className="cp-national-heading"><h2>投稿作品</h2><button onClick={()=>{prototypeStore.setItem('cp-activity-code','guoqing_qitianle_20261001');go('submissions');}}>我的投稿 →</button></div><div className="cp-national-works">{[['sea','日落之前'],['perfume','一瓶夏日晴光'],['interior','在海边住一下午'],['underwater','沉入一场蓝色的梦'],['portrait','把阳光留在眼睛里'],['restore','旧照修复练习'],['girl','夏日的转角'],['anime','风从蓝色花间经过']].map(([item,title])=><button key={item} onClick={()=>go('work?item='+item)}><div className="cp-national-work-cover"><img src={'/home-prototype/'+item+'.png'} alt={title}/></div><span>{title}</span></button>)}</div></section>
    <footer><button disabled={!active} onClick={()=>joined?document.getElementById('national-tasks')?.scrollIntoView({behavior:'smooth'}):join()}>{active?(joined?'去做任务':'立即参与'):(today<1?'活动未开始':'活动已结束')}</button></footer>
  </article>;
}
