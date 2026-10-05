'use client';
/* oxlint-disable next/no-img-element, jsx-a11y/media-has-caption -- Local prototype assets and the bundled silent video. */
import {useState,type ReactNode} from 'react';
import {ActionBar,Comments} from './reading';
import {AppIntroduction} from './app-introduction';
import './app-desktop.css';
import {appSamples,AppSampleContent} from './app-samples';
import {appEntryState} from './desktop-continuation';
export function DesktopAppDetail({title,summary,item,cover,input,output,provider,conditions,unavailable,onUse,body,go,presentation,destination}:{destination?:string;presentation?:string;title:string;summary:string;item:string;cover:string;input:string;output:string;provider:string;conditions?:string;unavailable?:string;onUse:()=>void;body?:ReactNode;go:(p:string)=>void}) {
 const [imageIndex,setImageIndex]=useState(0);
 const sample=presentation?appSamples[presentation]:undefined;
 if(sample){({title,summary,input,output,conditions}=sample);provider='MakeNow';destination=sample.destination;}
 const entry=appEntryState({destination,paused:Boolean(unavailable),mobile:true,device:'pc'});
 unavailable=entry.status==='missing'?'暂未开放使用':entry.status==='paused'?'应用已暂停使用':undefined;
 onUse=()=>{if(entry.status==='available')window.location.assign(entry.href)};
 const mode=presentation||(item==='copy'?'text':item==='video'?'video':item==='restore'?'compare':'image');
 const gallery=item==='background'?['perfume','cup']:[cover];
 return <article className="ad-detail">
  <button className="ad-back" onClick={()=>go('apps')}><img src="/home-prototype/icons/arrow-left-line.svg" alt=""/>全部应用</button>
  <div className="ad-layout"><div className="ad-content">
   {sample?<AppSampleContent sample={presentation!}/>:<><section className={'ad-example '+(mode==='text'?'is-copy':'')} aria-label="效果示例">
    {mode==='text'?<><header><span>文案改写</span><span>效果示例</span></header><div className="ad-copy-source"><small>改写前</small><p>这个杯子很好看，蓝色花纹，喝水喝咖啡都能用，也适合送朋友。</p></div><div className="ad-copy-result"><small>改写后 · 生活方式文案</small><h2>把一小片蓝色，放进日常。</h2><p>清晨的咖啡，午后的一杯水，都可以多一点仪式感。蓝色花纹在杯身轻轻铺开，陪你度过慢下来的片刻。</p><p>留给自己，或送给喜欢生活的朋友。</p></div></>:mode==='video'?<div className="ad-video"><video controls playsInline preload="metadata" poster="/home-prototype/sea.png" src="/home-prototype/sea-sample.mp4"/><p>视频效果示例 · 画面与镜头运动</p></div>:mode==='compare'?<div className="ad-comparison"><header><span>修复前</span><span>修复后</span></header><img src="/home-prototype/restore.png" alt="旧照片修复前后对比"/><p>对比原图与处理后的细节表现</p></div>:mode==='mixed'?<div className="ad-mixed"><header>图文组合示例</header><img src="/home-prototype/perfume.png" alt="商品展示图"/><section><small>场景说明</small><h2>把夏日晴光，留在身边。</h2><p>柠檬的清新、海风的轻盈，为日常添一份明亮心情。</p></section></div>:<div className="ad-gallery"><img src={'/home-prototype/'+gallery[imageIndex % gallery.length]+'.png'} alt={title+'效果示例'}/>{gallery.length>1&&<nav aria-label="切换效果示例">{gallery.map((image,i)=><button key={image} aria-label={'示例 '+(i+1)} aria-pressed={imageIndex===i} onClick={()=>setImageIndex(i)}><img src={'/home-prototype/'+image+'.png'} alt=""/></button>)}</nav>}</div>}
   </section>
   <section className="ad-description"><h2>应用介绍</h2>{body||<p>{summary} 准备{input}，进入应用后按需要调整，完成后查看{output}结果。</p>}</section></>}
   <div className="ad-discussion"><Comments inline kind={'app-'+(sample?presentation:item)} go={go}/></div>
  </div><aside className="ad-panel pc-work-info"><h1 className="reading-title">{title}</h1><p className="ad-provider">由 {provider||'多元拾光'} 提供</p>
   <ActionBar key={sample?presentation:item} target={sample?`app?item=sample-${presentation}&device=pc&state=app-${presentation}`:undefined} kind="app" title={title} go={go} onComment={()=>document.querySelector('.ad-discussion')?.scrollIntoView({behavior:'smooth'})}/>
   <p className="reading-prose">{summary}</p><div className="reading-inline reading-work-meta"><span>{sample?.kind||'AI 应用'}</span><span>{sample?'MakeNow · '+(presentation==='suite'||presentation==='analysis'?'电商':presentation==='music'?'自媒体':presentation==='website'?'工作':'短剧'):output}</span></div>
   <section className="ad-spec"><h2>使用信息</h2><AppIntroduction input={input} output={output} provider="" conditions={conditions}/></section>
   <div className="ad-use"><button disabled={!!unavailable} onClick={onUse}>{unavailable||(sample?({suite:'打开电商套图',analysis:'前往选择 Agent',music:'打开音乐翻唱',storyboard:'前往选择 Skill',website:'前往选择 Agent'}[presentation!]||'在 MakeNow 中打开'):'在 MakeNow 中使用')}{!unavailable&&<img src="/home-prototype/icons/arrow-right-line.svg" alt=""/>}</button><p>{unavailable?'介绍与讨论仍可查看':'使用当前账号继续；输入、参数与费用在 MakeNow 中确认'}</p></div>
  </aside></div>
 </article>;
}
