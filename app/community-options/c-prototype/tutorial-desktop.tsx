'use client';
/* oxlint-disable next/no-img-element -- Local prototype assets. */
import {useState,type ReactNode} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {communityTutorials} from './community-landing';
import {Comments} from './reading';
import {ActionBar} from './content-actions';
import {useB} from '../b-prototype/store';
import './tutorial-desktop.css';
type Go=(page:string)=>void;
const picture=(id:string)=>'/home-prototype/'+id+'.png';
export function TutorialDesktopList({go}:{go:Go}){
 const [category,setCategory]=useState('全部');const db=useB();
 const rows=communityTutorials.filter(t=>{const record=db.records.find(r=>r.id==='tutorial-'+(t.id==='restore'?'1':t.id));return (!record||record.publicStatus==='公开')&&(category==='全部'||t.topic===category)});
 return <section className="td-list"><header className="td-banner"><img src="/home-prototype/tutorial-banner.webp" alt=""/><div><small>多元拾光 · 创作课堂</small><h1>跟着教程<br/>开始你的创作</h1><p>从真实案例出发，把方法用在下一次创作里。</p></div></header><nav className="td-filters" aria-label="教程分类">{['全部',...new Set(communityTutorials.map(t=>t.topic))].map(c=><button key={c} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</nav><div className="td-grid">{rows.map(t=><button className="td-card" key={t.id} onClick={()=>go('tutorial?item='+t.id)}><div><img src={picture(t.cover)} alt=""/><span>{t.topic}</span></div><small>多元拾光官方</small><h2>{t.title}</h2><p>{t.views} 次阅读 <span>阅读教程 →</span></p></button>)}</div><p className="td-end">{rows.length?'全部教程已展示':'该分类暂无教程'}</p></section>;
}
const fallback:Record<string,string[][]>={restore:[['判断破损','保留原始文件，先辨认划痕、缺失与偏色的位置，区分需要修复和应当保留的细节。'],['分步修复','先处理大面积破损，再检查人物表情与衣物边缘。每一步另存版本，方便对照。'],['复查与保存','将原图与结果按相同比例查看，确认没有改变人物特征，再保存最终版本。']],product:[['准备主体','选择轮廓清晰的产品照片，明确材质、主色和需要保留的标识。'],['比较光线','固定产品与镜头，只调整光线方向。对比高光和阴影，选择主体最清楚的版本。'],['整理结果','检查产品形状与材质是否保持一致，记录有效条件用于下一次创作。']]};
export type TutorialDetailContent={title:string;topic:string;author:string;summary:string;cover:string;sections:[string,ReactNode][];intro?:ReactNode;related?:ReactNode;conditions?:string;target:string;commentId:string};
export function TutorialDesktopDetail({id,go,published}:{id:string;go:Go;published?:TutorialDetailContent}){
 const sample=communityTutorials.find(t=>t.id===id)||communityTutorials[0];
 const t=published||sample;
 const sections=published?published.sections:sample.sections.length?sample.sections:fallback[id]||[];
 const target=published?.target||'tutorial?item='+id;
 const jump=(index:number)=>document.getElementById(sections.length?'td-step-'+index:'td-body-start')?.scrollIntoView({behavior:'smooth',block:'start'});
 return <section className="td-detail"><header className="td-hero"><div className="td-cover"><img src={picture(t.cover)} alt={t.title}/></div><div className="td-overview"><div className="td-meta">{t.topic} · {published?.author||'多元拾光官方'}</div><h1>{t.title}</h1><p>{published?.summary??'从具体问题入手，跟随步骤完成练习，整理出可以复用的方法。'}</p><div className="td-outcomes"><h2>{published?'本篇内容':'本节你将完成'}</h2>{sections.slice(0,3).map(([heading],i)=><button key={i} onClick={()=>jump(i)}><span>{i+1}</span>{heading}</button>)}</div><button className="td-start" onClick={()=>jump(0)}>开始学习 →</button>{!published&&<small className="td-meta">{sample.views} 次阅读 · 2026年9月25日</small>}</div></header><div className="td-reading"><aside className="td-directory"><strong>本篇目录</strong>{sections.map(([heading],i)=><button key={i} onClick={()=>jump(i)}>{String(i+1).padStart(2,'0')} · {heading}</button>)}<button onClick={()=>document.getElementById('td-comments')?.scrollIntoView({behavior:'smooth'})}>评论与交流</button></aside><article className="td-article"><div id="td-body-start">{published?.intro}</div>{sections.map(([heading,body],i)=><section key={i} id={'td-step-'+i}><h2>{heading}</h2>{typeof body==='string'?<Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>:body}{!published&&i===0&&<blockquote>练习时保留一份原始素材和基准结果，让后续的调整有依据。</blockquote>}{!published&&id==='variable'&&i===0&&<Markdown remarkPlugins={[remarkGfm]}>{"### 写下一条基准提示词\n\n先明确主体、环境和角度，再做比较。\n\n~~~text\n一只白色陶瓷杯，放在浅灰色台面上，平视，产品摄影，背景简洁。\n~~~"}</Markdown>}{!published&&id==='variable'&&i===1&&<Markdown remarkPlugins={[remarkGfm]}>{"### 记录每轮结果\n\n- 先比较光线，再决定构图。\n- 每轮只改变一项，保存对应结果。\n\n| 调整项 | 观察重点 | 后续处理 |\n| --- | --- | --- |\n| 侧光 | 杯身轮廓是否清楚 | 保留清楚的轮廓 |\n| 背景 | 是否干扰主体 | 减少不必要的装饰 |\n\n不要同时改变主体、角度和风格，否则难以判断变化来自哪里。"}</Markdown>}</section>)}<>{published?.conditions&&<p className="published-reading-conditions">{published.conditions}</p>}{published?.related}</><ActionBar kind="tutorial" target={target} title={t.title} go={go} onComment={()=>document.getElementById('td-comments')?.scrollIntoView({behavior:'smooth'})}/><div id="td-comments" className="td-comments"><Comments inline kind={published?.commentId||'tutorial-'+id} target={target} go={go}/></div></article></div></section>;
}
