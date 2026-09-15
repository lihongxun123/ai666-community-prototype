'use client';
import { useState } from 'react';
import data from '@/lib/community-options.json';
import { ContentPresentation } from '@/components/content-presentation';
import { IntegratedStrategies } from '@/components/integrated-strategies';

function Refs({ids}:{ids:string[]}) {
 return <span className="study-refs">{ids.map(id=>{const s=data.sources.find(s=>s.id===id);return s?<a key={id} href={s.url} target="_blank" rel="noreferrer">〔{s.title}〕</a>:null;})}</span>;
}

export function CommunityOptions({navigate}:{navigate:(id:string)=>void}) {
 const [active,setActive]=useState('A');
 const o=data.options.find(o=>o.id===active)!;
 const jump=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
 return <div className="framework-study options-study">


  <IntegratedStrategies navigate={navigate}/>
  <details className="study-sources"><summary>讨论：三种展示结构与四个经营假设</summary>
  <ContentPresentation />
  <section className="study-platform" id="previous-options"><h2>四个经营假设</h2><p>保留人群、供给、成本和运营路径的分析。它们不是四个互斥的完整产品方案；需要结合上面的产品形态继续比较。</p><p className="muted">讨论记录：{data.date}。</p></section>
  <div className="table-wrap"><table className="options-summary"><thead><tr><th>方案</th><th>用户选择它的理由</th><th>回访与经营路径</th><th>当前判断</th></tr></thead><tbody>{data.options.map(p=><tr key={p.id}><th><button className="text-button" onClick={()=>{setActive(p.id);jump('option-details');}}>{p.id} · {p.name}</button></th><td>{p.promise}</td><td><p>{p.returnReason}</p><p className="muted">{p.business}</p></td><td>{p.verdict}</td></tr>)}</tbody></table></div>
  <details className="notice"><summary>方案成立的条件</summary><strong>{data.recommendation.headline}</strong><p>{data.recommendation.why}</p><p>{data.recommendation.condition}</p><p className="muted">{data.status}</p></details>
  <nav className="study-actions" aria-label="经营假设比较目录"><button className="text-button" onClick={()=>jump('options-comparison')}>逐项比较</button><button className="text-button" onClick={()=>jump('option-details')}>四份经营假设</button><button className="text-button" onClick={()=>jump('options-metrics')}>如何评估</button><button className="text-button" onClick={()=>jump('options-decisions')}>条件与组合</button></nav>

  <section className="study-platform" id="options-comparison"><div className="section-heading"><h2>同一套约束下，逐项比较</h2><span>定性判断，不是市场得分</span></div>
   <div className="table-wrap"><table className="options-comparison"><thead><tr><th>比较项</th>{data.options.map(p=><th key={p.id}>{p.id} · {p.name}</th>)}</tr></thead><tbody>{data.comparison.map(row=><tr key={row.dimension}><th>{row.dimension}</th><td>{row.A}</td><td>{row.B}</td><td>{row.C}</td><td>{row.D}</td></tr>)}</tbody></table></div>
   <details className="study-sources"><summary>比较依据、已知条件与资料不足</summary>{data.basis.map(b=><p key={b.label}><strong>{b.label} · {b.status}：</strong>{b.text}</p>)}<ul>{data.rules.map(x=><li key={x}>{x}</li>)}</ul></details>
  </section>

  <section id="option-details" className="study-platform"><div className="section-heading"><h2>每个方向怎样运营</h2><span>12周排程均为条件式建议</span></div>
   <div className="compare-options" aria-label="选择完整方案">{data.options.map(p=><button key={p.id} aria-pressed={p.id===active} className={p.id===active?'chosen':''} onClick={()=>setActive(p.id)}>{p.id} · {p.name}</button>)}</div>
   <article key={o.id} aria-live="polite"><h3>{o.id} · {o.name}</h3><p className="lead">{o.promise}</p><p><strong>用户与任务：</strong>{o.audience}</p><p><strong>持续使用理由：</strong>{o.returnReason}</p><p><strong>区别于相邻方向：</strong>{o.distinction}</p><p><strong>工具关系：</strong>{o.tools}</p>
    <h3>内容如何组织与供应</h3><p>{o.content}</p><p><strong>最低交付要求：</strong>{o.quality}</p><p><strong>供给来源与回报：</strong>{o.supply}</p><p><strong>信息组织：</strong>{o.organization}</p>
    <h3>从获客到再次使用</h3><div className="table-wrap"><table><thead><tr><th>环节</th><th>运营动作</th><th>应留下什么</th></tr></thead><tbody>{o.journey.map(j=><tr key={j.stage}><th>{j.stage}</th><td>{j.action}</td><td>{j.evidence}</td></tr>)}</tbody></table></div>
    <h3>收益与成本</h3><p>{o.business}</p><p>{o.economics}</p><p><strong>商业承诺的边界：</strong>{o.commercialBoundary}</p>
    <h3>团队怎样分工</h3><p className="muted">两位研发同时承担既有产品；下表是责任分配建议，不意味着已有可用工时。外部供给均需单独预算。</p><div className="table-wrap"><table><thead><tr><th>角色</th><th>承担工作</th><th>限制与需要补足</th></tr></thead><tbody>{o.team.map(t=><tr key={t.role}><th>{t.role}</th><td>{t.work}</td><td>{t.limit}</td></tr>)}</tbody></table></div>
    <h3>12周起步路径</h3><div className="table-wrap"><table><thead><tr><th>阶段</th><th>主要工作</th><th>进入下一阶段的条件</th></tr></thead><tbody>{o.phases.map(p=><tr key={p.period}><th>{p.period}</th><td>{p.work}</td><td>{p.gate}</td></tr>)}</tbody></table></div>
    <h3>要放弃什么，什么情况下调整</h3><p><strong>机会成本：</strong>{o.tradeoff}</p><p><strong>起步范围：</strong>{o.minimal}</p><ul>{o.stop.map(x=><li key={x}>{x}</li>)}</ul>
    <h3>竞品依据支持到哪里</h3>{o.evidence.map(e=><p key={e.claim}>{e.claim}<Refs ids={e.refs}/></p>)}<p className="muted">{o.unknown}</p>
   </article>
  </section>

  <section className="study-platform"><div className="section-heading"><h2>同一种内容，在四个方向里承担不同职责</h2><span>不以内容类型多少决定方案</span></div><div className="table-wrap"><table className="options-comparison"><thead><tr><th>对象</th><th>A 实用内容</th><th>B API实践</th><th>C 创作复用</th><th>D 创作练习</th></tr></thead><tbody>{data.contentPolicy.map(r=><tr key={r.object}><th>{r.object}</th><td>{r.A}</td><td>{r.B}</td><td>{r.C}</td><td>{r.D}</td></tr>)}</tbody></table></div><button className="text-button" onClick={()=>navigate('discussion')}>回到内容质量与15家工具关系证据 →</button></section>

  <section className="study-platform" id="options-metrics"><div className="section-heading"><h2>怎样比较结果，避免各报各的活跃</h2><span>计划指标，尚未执行</span></div><p>{data.measurement.principle}</p><div className="table-wrap"><table><thead><tr><th>方案</th><th>首次价值</th><th>有效回访</th><th>不能混算</th></tr></thead><tbody>{data.measurement.byOption.map(m=><tr key={m.id}><th>{m.id}</th><td>{m.first}</td><td>{m.return}</td><td>{m.counter}</td></tr>)}</tbody></table></div>{data.measurement.common.map(m=><p key={m.name}><strong>{m.name}：</strong>{m.definition}</p>)}<p className="muted">{data.measurement.threshold}</p></section>

  <section className="study-platform"><div className="section-heading"><h2>预算与规模：先把缺少的输入列清</h2><span>不预填增长与回报</span></div><p>{data.budget.principle}</p><div className="table-wrap"><table><thead><tr><th>输入</th><th>当前状态</th><th>怎样用于比较</th></tr></thead><tbody>{data.budget.inputs.map(x=><tr key={x.name}><th>{x.name}</th><td>{x.value}</td><td>{x.use}</td></tr>)}</tbody></table></div><p>{data.budget.review}</p></section>
  <section className="study-platform" id="options-decisions"><div className="section-heading"><h2>哪些新信息会改变排序</h2><span>条件明确后可重排</span></div><div className="table-wrap"><table><thead><tr><th>出现的条件</th><th>优先方向与依据</th><th>会推翻判断的情况</th></tr></thead><tbody>{data.decisionScenarios.map(s=><tr key={s.order}><td>{s.condition}</td><td><strong>{s.order}</strong><p>{s.reason}</p></td><td>{s.reversal}</td></tr>)}</tbody></table></div>
   <h3>能否组合</h3><p>{data.combination.principle}</p><ul>{data.combination.reasonable.map(x=><li key={x}>{x}</li>)}</ul><h3>组合不是零成本</h3><ul>{data.combination.conflicts.map(x=><li key={x}>{x}</li>)}</ul>
   <h3>建议与待补的判断材料</h3><p>{data.recommendation.next}</p><p>{data.recommendation.alternatives}</p><div className="table-wrap"><table><thead><tr><th>需要作出的判断</th><th>建议</th><th>可能改变判断的材料</th></tr></thead><tbody>{data.nextDecisions.map(x=><tr key={x.question}><th>{x.question}</th><td>{x.current}</td><td>{x.need}</td></tr>)}</tbody></table></div>
  </section>
  <details className="study-sources"><summary>方案所引用的竞品来源</summary><ol>{data.sources.map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p>{s.date} · {s.scope}</p></li>)}</ol></details>
  </details>
 </div>;
}
