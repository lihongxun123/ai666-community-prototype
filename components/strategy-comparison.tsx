'use client';
import {CreatorSupplyLink} from '@/components/creator-supply';
import { useState, type ReactNode } from 'react';
import data from '@/lib/strategy-comparison.json';
import {NorthStarDirections} from '@/components/community-north-star';
import { ContentArrangementLab } from '@/components/content-arrangement-lab';
import { StrategyConditionsSummary, StrategyConditionReview } from '@/components/strategy-conditions';
import './strategy-comparison.css';
import {ResearchApplications} from './research-applications';
import {RetentionPlan, RetentionEvidence} from './retention-research';

const tabs=[['options','四种组织方式'],['content','内容浏览对照'],['mechanisms','做法取舍']] as const;
type Tab=typeof tabs[number][0];
function List({items}:{items:string[]}){return <ul>{items.map(i=><li key={i}>{i}</li>)}</ul>;}
function Definition({rows}:{rows:[string,ReactNode][]}){return <dl className="v23-definition">{rows.map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>;}
function RefLinks({ids}:{ids:string[]}){return <p className="study-refs">依据：{ids.map(id=>{const s=data.sources.find(s=>s.id===id);return s?<a key={id} href={`#v23-source-${id}`} title={s.title} onClick={e=>{e.preventDefault();const details=document.getElementById('v23-sources') as HTMLDetailsElement|null;if(details)details.open=true;document.getElementById(`v23-source-${id}`)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{s.title}〔{id}〕 </a>:null;})}</p>;}

export function StrategyComparison({navigate}:{navigate:(id:string)=>void}){
 const [tab,setTab]=useState<Tab>('options'),[active,setActive]=useState('A');
 const option=data.options.options.find(o=>o.id===active)??data.options.options[0];
 const showContent=()=>{setTab('content');document.getElementById('v23-tabs')?.scrollIntoView({behavior:'smooth',block:'start'});};
 return <article className="framework-study v23">
  <header className="page-heading v23-intro"><h1>借鉴与方案比较</h1><p className="muted">{data.date} · 候选方向待验证</p></header>
  <RetentionPlan/>
  <details className="study-sources"><summary>持续行为研究：已找到哪些证据</summary><RetentionEvidence/></details>
  <ResearchApplications navigate={navigate}/>
  <CreatorSupplyLink context="strategy" navigate={navigate}/>
  <NorthStarDirections/>
  <details className="study-sources"><summary>目标、供给、人员、工具与投入条件</summary><Definition rows={data.basis.map(b=>[b.label,<><p>{b.fact}</p><p className="muted">{b.limit}</p></>])}/><RefLinks ids={data.sources.filter(s=>s.id.startsWith('BASE23')).map(s=>s.id)}/></details>
  <fieldset id="v23-tabs" className="v23-controls is-tabs" aria-label="研究内容">{tabs.map(([id,label])=><button key={id} aria-pressed={tab===id} className={tab===id?'is-active':''} onClick={()=>setTab(id)}>{label}</button>)}</fieldset>
  {tab==='options'&&<section aria-label="四种内容与服务组织方式">
   <h2>四种组织方式</h2>
   <div className="v23-small-grid">{data.options.options.map(o=><article key={o.id}><h3>{o.id} · {o.name}</h3><p>{o.promise}</p><button className="text-button" onClick={()=>{setActive(o.id);document.getElementById('v23-option-picker')?.scrollIntoView({behavior:'smooth',block:'start'});}}>查看组织方式 {o.id} →</button></article>)}</div>
   <details className="study-sources"><summary>展开12个维度的并排比较</summary><div className="table-wrap"><table><thead><tr><th>比较维度</th><th>A 筛选发现</th><th>B 解法实践</th><th>C 视觉创作</th><th>D 练习反馈</th></tr></thead><tbody>{data.options.comparison.map(r=><tr key={r.dimension}><th>{r.dimension}</th><td>{r.A}</td><td>{r.B}</td><td>{r.C}</td><td>{r.D}</td></tr>)}</tbody></table></div></details>
   <StrategyConditionsSummary/>
   <fieldset id="v23-option-picker" className="v23-controls" aria-label="选择组织方式">{data.options.options.map(o=><button key={o.id} aria-pressed={o.id===active} className={o.id===active?'is-active':''} onClick={()=>setActive(o.id)}>{o.id} · {o.name}</button>)}</fieldset>
   <article className="v23-option" key={option.id}>
    <h2>{option.id} · {option.name}</h2><p className="lead">{option.promise}</p><RefLinks ids={option.sourceIds}/>
    <StrategyConditionReview optionId={option.id}/>
    <section><h3>谁会来，希望得到什么</h3><p>{option.audience}</p><List items={option.needs}/></section>
    <section><h3>首页、卡片、详情为什么这样组织</h3><p>{option.homeOrganization.firstView}</p><List items={option.homeOrganization.zones}/><Definition rows={[["卡片",option.homeOrganization.card],["详情",option.homeOrganization.detail],["组织原因",option.homeOrganization.reason]]}/><div className="table-wrap"><table><thead><tr><th>内容形式</th><th>承担的作用</th></tr></thead><tbody>{option.contentMix.map(c=><tr key={c.form}><th>{c.form}</th><td>{c.role}</td></tr>)}</tbody></table></div><button className="text-button" onClick={showContent}>用同一批材料查看 {option.id} 的相关编排 →</button>{['C','D'].includes(option.id)&&<p className="muted">{data.composition.modes.find(m=>m.id===option.id)?.representationLimit}</p>}</section>
    <section><h3>用户路径与运营工作</h3><div className="table-wrap"><table><thead><tr><th>环节</th><th>用户动作</th><th>接下来</th><th>平台工作</th></tr></thead><tbody>{option.journey.map(j=><tr key={j.step}><th>{j.step}</th><td>{j.action}</td><td>{j.next}</td><td>{j.operatorWork}</td></tr>)}</tbody></table></div></section>
    <section><h3>谁持续供给，能力不足时如何缩小范围</h3>{option.supply.map(s=><article key={s.role}><h4>{s.role}</h4><p>{s.internalTask}</p><Definition rows={[["需要的能力",s.requiredSkill],["当前缺口",s.missingCapability],["持续维护",s.maintenance],["缩小范围",s.reduceScope]]}/></article>)}</section>
    <section><h3>社区与工具的关系</h3><Definition rows={[["社区",option.toolRelation.community],["MakeNow",option.toolRelation.MakeNow],["API",option.toolRelation.API],["不用自营工具",option.toolRelation.withoutTool],["尚未确认",option.toolRelation.unknown]]}/></section>
    <section><h3>获客与回访设想</h3><p>{option.acquisition}</p><p><strong>再次访问的理由：</strong>{option.returnReason}</p></section>
    <section><h3>轻量版本也必须兑现的承诺</h3><p>{option.minimumPromise}</p><p><strong>承诺范围：</strong>{option.declinePromise}</p><p><strong>可缩小到：</strong>{option.lightVersion}</p></section>
    <section><h3>持续投入与服务容量</h3><Definition rows={[["固定工作",option.workload.fixed],["随使用增长",option.workload.variable],["容量限制",option.workload.growthLimit]]}/><h4>成本来源</h4><List items={option.economics.costDrivers}/><p><strong>业务关联观察（非验收项）：</strong>{option.economics.revenueHypothesis}</p><p><strong>资料不足：</strong>{option.economics.unknown}</p></section>
    <section><h3>什么情况下不成立</h3><List items={option.failureModes}/><h4>哪些条件会改变判断</h4><List items={option.conditionsToCompare}/><div className="table-wrap"><table><thead><tr><th>需要的证据</th><th>改变哪项判断</th></tr></thead><tbody>{option.evidenceNeeded.map(e=><tr key={e.evidence}><td>{e.evidence}</td><td>{e.changesJudgment}</td></tr>)}</tbody></table></div></section>
   </article>
   <details className="study-sources"><summary>可以共用什么，哪些工作仍需单独承担</summary><div className="table-wrap"><table><thead><tr><th>工作</th><th>可共用</th><th>仍需单独承担</th></tr></thead><tbody>{data.options.sharedWorkAndNonSharedWork.map(w=><tr key={w.work}><th>{w.work}</th><td>{w.shareable}</td><td>{w.notShareable}</td></tr>)}</tbody></table></div></details>
  </section>}
  {tab==='content'&&<><ContentArrangementLab items={data.contentPack.content} modes={data.composition.modes} scope={data.composition.scope} limit={data.composition.limit} activeMode={active} onMode={setActive} refs={ids=><RefLinks ids={ids}/>}/><details className="study-sources"><summary>内容池的来源、代表性和使用范围</summary><p>{data.contentPack.summary}</p><p>{data.contentPack.scope}</p><p>{data.contentPack.editorialStatus}</p><List items={data.contentPack.comparisonRules}/><List items={data.contentPack.reuseLimits}/></details></>}
  {tab==='mechanisms'&&<section aria-label="竞品做法的取舍"><h2>竞品做法的采用条件</h2>
   <div className="table-wrap"><table><thead><tr><th>做法</th><th>当前判断</th><th>可承担的承诺</th></tr></thead><tbody>{data.mechanisms.mechanisms.map(m=><tr key={m.id}><th><a href={`#v23-${m.id}`} onClick={e=>{e.preventDefault();document.getElementById(`v23-${m.id}`)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{m.name}</a></th><td>{m.stance}</td><td>{m.claim}</td></tr>)}</tbody></table></div>
   {data.mechanisms.mechanisms.map(m=><article className="v23-mechanism" id={`v23-${m.id}`} key={m.id}><h3>{m.name}</h3><p><strong>{m.stance}。</strong>{m.claim}</p><h4>竞品页面能确认什么</h4><List items={m.pageFacts}/><RefLinks ids={m.sourceIds}/><p><strong>分析：</strong>{m.inference}</p><p><strong>读者得到什么：</strong>{m.userValue}</p><h4>持续工作与代价</h4><List items={m.platformWork.map(w=>`${w.role}：${w.work}`)}/><p>{m.cost}</p><h4>失效条件与相反证据</h4><List items={m.failureConditions}/><p>{m.counterexample}</p><Definition rows={[["现有承载",m.existingCarrier],["还缺什么",m.gap],["改变判断的证据",m.evidenceToChangeJudgment],["工具关系",m.toolRelation]]}/></article>)}
   <details className="study-sources"><summary>补证何时停止，哪些判断不能由竞品替代</summary><p>{data.mechanisms.method.sampleBoundary}</p><List items={data.mechanisms.stopRules}/></details>
  </section>}
  <section className="v23-conclusion"><h2>方案成立条件与待补证据</h2><div className="table-wrap"><table><thead><tr><th>仍缺的条件</th><th>影响什么</th><th>最低证据</th><th>缺失时的范围</th></tr></thead><tbody>{data.options.comparisonConditions.map(c=><tr key={c.unknown}><th>{c.unknown}</th><td>{c.affects}</td><td>{c.minimumEvidence}</td><td>{c.ifMissing}</td></tr>)}</tbody></table></div><div className="study-actions"><button className="text-button" onClick={()=>navigate('progress')}>查看自身材料与数据 →</button><button className="text-button" onClick={()=>navigate('content')}>查看18家内容形式与截图 →</button></div></section>
  <details className="study-sources" id="v23-sources"><summary>{data.sources.length}项来源记录与适用范围（可共用底层页面）</summary>{data.sources.map(s=><article className="v23-source" id={`v23-source-${s.id}`} key={s.id}><h3>{s.id} · {s.url?<a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>:s.title}</h3><p>{s.date}</p><p className="v23-path muted">位置：{s.path}；{s.locator}</p><p>{s.scope}</p></article>)}</details>
 </article>;
}
