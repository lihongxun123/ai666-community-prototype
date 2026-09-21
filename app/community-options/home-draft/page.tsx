'use client';
import {useEffect,useRef,useState} from 'react';
import Link from '@/components/research-link';
import {scenarios} from './scenarios';
import FocusTopics from './focus-topics';
import {caseChoices} from '../content-system/case-choices';
import './style.css';
type Kind='案例'|'教程'|'资产'|'讨论';
const kinds:Kind[]=['案例','教程','资产','讨论'];
export default function Page(){
 const [topic,setTopic]=useState('all'),[kind,setKind]=useState('全部'),[query,setQuery]=useState(''),[active,setActive]=useState<{id:string;kind:Kind}|null>(null),[notes,setNotes]=useState(false),[handoff,setHandoff]=useState(false);
 useEffect(()=>{const id=window.location.hash.slice(1);if(scenarios.some(s=>s.id===id))setTopic(id)},[]);
 const detail=useRef<HTMLElement>(null),trigger=useRef<HTMLButtonElement|null>(null);
 const selected=scenarios.find(s=>s.id===active?.id);
 const filtered=scenarios.flatMap(s=>kinds.map(k=>({s,k}))).filter(({s,k})=>(topic==='all'||s.id===topic)&&(kind==='全部'||kind===k)&&(!query.trim()||[s.name,s.title,s.asset,s.question,s.format].join(' ').includes(query.trim())));
 const cards=topic==='all'&&kind==='全部'&&!query.trim()?scenarios.map((s,i)=>({s,k:kinds[i%3]})):filtered;
 useEffect(()=>{if(active)detail.current?.focus();},[active]);
 function open(id:string,k:Kind,button?:HTMLButtonElement){if(button)trigger.current=button;setActive({id,kind:k});setHandoff(false)}
 function close(){setActive(null);setHandoff(false);trigger.current?.focus()}
 function reset(){setTopic('all');setKind('全部');setQuery('');setActive(null);setHandoff(false)}
 return <main className="hd">
 <aside className="hd-review"><Link href="/research-brief">← 社区方案</Link><span>交互样板 · 卡片为拟议内容，资产未接入</span><button aria-expanded={notes} onClick={()=>setNotes(!notes)}>设计说明</button></aside>
 {notes&&<aside className="hd-notes"><button onClick={()=>setNotes(false)}>关闭说明</button><h2>平台组织专题，作者提供经验与资产</h2><p>首页内容草案以电商营销、视觉设计、写作编辑为推荐专题，九类场景均可筛选。案例讲取舍，教程讲步骤，资产讲使用条件，讨论定位问题。专题排序为编排建议，非市场排名。</p><p>MakeNow已有画布；复制、导入、版本和导出待逐项核对，电商Agent与工作流工具为规划。此页没有实际上传、运行、下载和提交。私人原片与内部文件默认不公开。</p><p>本页属于研究室信息架构探索，不替代真实C端产品基线。</p><a href="/community-options/scenarios#content-map" target="_blank" rel="noopener noreferrer">九类设计依据 ↗</a></aside>}
 <header className="hd-head"><strong>多元拾光</strong><nav><button onClick={reset}>发现方法</button><a href="#creation">创作交流</a></nav></header>
 <section className="hd-intro"><span>从想做的事情开始</span><h1>看懂怎么做，带着方法继续创作。</h1><p>案例、教程、可复用材料和具体问题，放在一起找。</p></section>
 <FocusTopics />
 <nav className="hd-topics" aria-label="场景筛选">{[{id:'all',name:'全部'},...scenarios].map(s=><button key={s.id} aria-pressed={topic===s.id} onClick={()=>{setTopic(s.id);setActive(null);window.history.replaceState(null,'','#'+s.id)}}>{s.name}</button>)}</nav>
 <div className="hd-filter"><div role="group" aria-label="内容形式">{['全部',...kinds].map(k=><button key={k} aria-pressed={kind===k} onClick={()=>{setKind(k);setActive(null)}}>{k}</button>)}</div><label>查找内容<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setActive(null)}} placeholder="例如：标签、分镜、来源" /></label></div>
 {active&&selected&&<section className="hd-detail" ref={detail} tabIndex={-1} aria-label="内容详情"><button className="hd-close" onClick={close}>返回列表 ×</button><small>{selected.name} / {active.kind} · 内容结构示例</small><h2>{active.kind==='案例'?selected.title:active.kind==='教程'?selected.name+'：步骤与检查':active.kind==='资产'?selected.asset:selected.question}</h2><div className="hd-detail-grid"><div>{active.kind==='案例'?<><h3>原始条件</h3><p>{selected.input}</p><h3>两种做法</h3><p>{caseChoices[selected.id].alternatives}</p><h3>本例拟采用的取舍</h3><p>{caseChoices[selected.id].reason}</p><h3>应展示的成果</h3><p>{caseChoices[selected.id].result}</p><p>当前为内容结构示例。实际结果与采用记录由授权案例补充。</p></>:active.kind==='教程'?<><h3>先准备</h3><p>{selected.input}</p><h3>怎么完成</h3><ol>{selected.steps.map(x=><li key={x}>{x}</li>)}</ol><h3>最后检查</h3><p>{selected.check}</p></>:active.kind==='资产'?<><h3>材料形式</h3><p>{selected.format}</p><h3>可以调整什么</h3><p>{selected.editable}</p><h3>使用条件</h3><p>{selected.input}</p><p>真实文件、作者许可与工具兼容性尚待绑定。</p></>:<><h3>把问题说具体</h3><p>{selected.issue}</p><h3>怎么判断改好了</h3><p>{selected.check}</p><h3>回应后继续</h3><p>建议对应具体位置，作者补充采纳情况和修改结果；资产更新时保留版本关系。</p></>}<Link href={"/community-options/product-sample/concepts#"+selected.id}>进入{selected.name}专题 →</Link><p> </p><a href={selected.research} target="_blank" rel="noopener noreferrer">研究依据与案例来源 ↗</a></div><aside className="hd-next"><h3>接着做</h3>{kinds.filter(k=>k!==active.kind).map(k=><button key={k} onClick={()=>open(selected.id,k)}>{k==='案例'?'看案例路径':k==='教程'?'看制作步骤':k==='资产'?'查看材料与使用条件':'查看相关问题'} →</button>)}{active.kind==='资产'&&<><button onClick={()=>setHandoff(!handoff)} aria-expanded={handoff}>查看制作衔接</button>{handoff&&<div className="hd-handoff"><h4>带走什么</h4><p>目标、输入条件、编辑范围和检查清单。</p><h4>在哪里做</h4><p>{['knowledge','writing','work-learning'].includes(selected.id)?'资料、文字和演示在适合的工具中处理；视觉素材按兼容情况进入MakeNow。':'优先衔接MakeNow画布，项目与兼容条件确认后开放。'}</p><button disabled>{['knowledge','writing','work-learning'].includes(selected.id)?'文稿与资料工具 · 示例未接入':'MakeNow · 示例项目未接入'}</button></div>}</>}<p className="hd-source-note">组织与交互示例</p></aside></div></section>}
 <div className="hd-section-title"><h2>{topic==='all'?'专题精选':scenarios.find(s=>s.id===topic)?.name}</h2><span aria-live="polite">{cards.length} 张内容示例 · {topic==='all'&&kind==='全部'&&!query.trim()?'编辑编排示意':'筛选结果'}</span></div>
 {cards.length?<div className="hd-grid">{cards.map(({s,k})=><button className="hd-card" key={s.id+k} onClick={e=>open(s.id,k,e.currentTarget)}><div className={'hd-art hd-art-'+k}><span>{s.name} · {k}</span>{k==='案例'||k==='教程'?<div className="hd-mini-sequence">{s.result.split(' / ').map((part,i)=><b key={part}><em>0{i+1}</em>{part}</b>)}</div>:k==='资产'?<><strong>{s.format}</strong><span>可改范围 · 文件条件 · 使用许可</span></>:<><strong>哪里卡住了？</strong><span>问题位置 → 建议 → 作者反馈</span></>}</div><div className="hd-card-body"><small>内容示例</small><h3>{k==='案例'?s.title:k==='教程'?s.name+'：步骤与检查':k==='资产'?s.asset:s.question}</h3><p>{k==='案例'?s.input:k==='教程'?s.steps.join(' → '):k==='资产'?s.editable:s.issue}</p><span>{k==='案例'?'看过程与检查':k==='教程'?'看步骤与材料':k==='资产'?'查看使用条件':'看问题与回应路径'} →</span></div></button>)}</div>:<div className="hd-empty"><h2>没有匹配的内容示例</h2><p>换一个词，或清除场景和形式筛选。</p><button onClick={reset}>清除全部筛选</button></div>}
 <section id="creation" className="hd-creation"><div><small>独立入口 · 虚构作品示例</small><h2>创作交流</h2><p>先看作品与创作意图；作者可以只分享，也可以选择想讨论的问题。</p></div><div className="hd-works">{[
{id:'character',title:'夜访观测站',image:'topic-character-v1.png',intent:'用同一角色的动作和视线，表现从犹豫到好奇的变化。',question:'希望交流：哪一格的情绪转折最清楚？'},
{id:'ip',title:'云朵的日常',image:'topic-ip-v1.png',intent:'保持同一轮廓，用表情和姿态形成不同情绪。',question:'希望交流：小尺寸下哪些表情更容易辨认？'},
{id:'writing',title:'一次散步的记录',image:'topic-writing-v1.png',intent:'删去重复描述，保留作者自己的观察和节奏。',question:'仅分享创作思路，暂不征求改稿。'}
].map(w=><article key={w.id}><img src={'/product-concepts/'+w.image} alt={w.title+'的概念示意'} style={{width:'100%',height:'auto'}}/><h3>{w.title}</h3><p>{w.intent}</p><p>{w.question}</p><Link href={'/community-options/product-sample/concepts#'+w.id}>查看创作方法与相关专题 →</Link></article>)}</div></section>
 <footer>交互样板 · <Link href="/community-options/scenarios">九类场景依据</Link> · <Link href="/community-options/product-sample">电商营销深入样板</Link></footer></main>
}
