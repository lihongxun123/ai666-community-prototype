'use client';
import { useState } from 'react';
import Link from '@/components/research-link';
import Image from 'next/image';
import './concept.css';

const groups = [
 {id:'discover',name:'发现',title:'先看到值得尝试的内容',text:'作品、应用和工作流共同呈现。按场景寻找，也可以从感兴趣的效果开始。',images:[['home-v8-card-spacing','发现首页']]},
 {id:'topics',name:'专题',title:'围绕任务，把方法整理好',text:'专题将案例、应用、工作流与教程放在一起。用户先选任务，再找到适合自己的做法。',images:[['topics-index-v1','专题首页'],['topic-ecommerce-v1','电商营销专题']]},
 {id:'apps',name:'AI应用',title:'知道要做什么，就直接动手',text:'应用有固定入口。不同任务使用不同的操作界面，六类详情共同承接制作。',images:[['ai-apps-v3-combined','应用列表'],['app-product-scene-before-v1','表单生成'],['app-local-edit-selection-v1','局部编辑'],['app-writing-input-v1','文字文档'],['app-batch-scene-before-v1','批量处理'],['app-video-input-v1','音视频'],['app-steps-input-v1','分步任务'],['app-product-scene-result-v1','生成结果']]},
 {id:'methods',name:'作品与工作流',title:'看懂成果，也找到制作入口',text:'作品呈现效果和做法，工作流提供可复用的处理过程。需要画布时进入MakeNow，不新增画布详情页。',images:[['work-case-detail-v1','作品／案例详情'],['workflow-detail-v1','工作流详情']]},
 {id:'circles',name:'圈子',title:'把问题和经验留在交流中',text:'圈子集中教程、讨论、求助与案例。既能找到交流空间，也能围绕具体问题继续讨论。',images:[['circles-index-v1','圈子首页'],['circle-home-v1','电商营销圈'],['circle-post-detail-v1','帖子详情']]},
];
const paths=[
 {title:'不知道怎么做',desc:'想做一组电商素材，但还没选定方法。',steps:[['topics','选择专题'],['methods','看案例与做法'],['apps','进入制作']],result:'从一个具体任务，找到可尝试的方法。'},
 {title:'知道要做什么',desc:'已经确定要给图片换背景。',steps:[['apps','找到应用'],['apps','上传自己的素材'],['apps','生成与调整']],result:'直接使用应用，完成制作。'},
 {title:'做过，但遇到问题',desc:'换景后，包装上的文字变模糊了。',steps:[['circles','进入相关圈子'],['circles','阅读教程或提问'],['apps','回到制作']],result:'带着具体问题交流，再继续尝试。'},
];
export default function ConceptOverview(){
 const [active,setActive]=useState(0);
 const [selected,setSelected]=useState(0);
 const group=groups[active];
 const current=group.images[selected];
 const src='/proposal-one/'+current[0]+'.png';
 function choose(index:number){setActive(index);setSelected(0);}
 function follow(id:string,label:string){choose(groups.findIndex(g=>g.id===id));setSelected(label==='生成与调整'?7:label==='进入相关圈子'?1:label==='阅读教程或提问'?2:label==='上传自己的素材'||label==='生成与调整'||label==='进入制作'||label==='回到制作'?1:0);document.getElementById('concept-gallery')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
 return <main className="co-page">
 <header className="co-top"><Link href="/#strategy">← 研究室 · 社区方案</Link><Link href="/community-options/content-plan">内容布局与专题样板 →</Link><Link href="/community-options">五套方案 →</Link></header>
 <section className="co-intro"><span className="co-eyebrow">方案一 / 产品概念</span><h1>围绕任务组织的<br/>AI 创作社区</h1><p>把内容、方法和工具连起来，让创作者、实际应用者与学习者找到做法，完成自己的任务。</p><div className="co-pills"><span>发现内容</span><span>找到方法</span><span>动手制作</span><span>交流经验</span></div></section>
 <section id="concept-gallery" className="co-gallery" aria-label="方案一概念稿">
 <nav className="co-tabs" aria-label="概念分组">{groups.map((g,i)=><button key={g.id} aria-pressed={active===i} onClick={()=>choose(i)}>{g.name}</button>)}<a href="#journeys">用户路径 ↓</a></nav>
 <div className="co-copy"><div><span className="co-eyebrow">0{active+1} / {group.name}</span><h2>{group.title}</h2></div><p>{group.text}</p></div>
 <div className="co-switch" aria-label="当前分组页面">{group.images.map((item,i)=><button key={item[0]} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{item[1]}</button>)}</div>
 <figure><a href={src} target="_blank" rel="noopener noreferrer" aria-label={current[1]+'，新页面打开原图'}><Image key={src} src={src} alt={current[1]+'概念稿'} width={1536} height={1200} unoptimized /></a><figcaption><span>{current[1]}</span><a href={src} target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure>

 </section>
 <section id="journeys" className="co-journeys"><span className="co-eyebrow">用户路径</span><h2>三种起点，都能接着往下做</h2><div className="co-paths">{paths.map((p,i)=><article key={p.title}><span className="co-number">0{i+1}</span><h3>{p.title}</h3><p>{p.desc}</p><ol>{p.steps.map(([id,label],j)=><li key={j}><button onClick={()=>follow(id,label)}>{label}<span>↗</span></button></li>)}</ol><p className="co-result">{p.result}</p></article>)}</div></section>
 <section className="co-position"><div><span className="co-eyebrow">方案取舍</span><h2>平台整理资源，<br/>社区补充经验。</h2></div><div><p>专题围绕任务组织内容；应用和工作流承接制作；圈子让教程、问题与实践有持续交流的地方。</p><p>我们服务创作者、实际应用者和学习者。价值来自任务选择、资源质量与持续维护，仍需后续验证。</p></div></section>
 <footer className="co-footer"><Link href="/#strategy">返回研究室</Link><Link href="/research-brief">研究与方案演示 ↗</Link></footer>
 </main>
}
