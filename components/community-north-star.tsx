import {CreatorSupplyLink} from '@/components/creator-supply';
import data from '@/lib/community-north-star.json';
import './community-north-star.css';

export function NorthStarOverview({compact=false}:{compact?:boolean}){
 return <section className="north-star" aria-label="社区目标与持续活跃">
  <header><p className="ns-label">社区目标</p><h2>{data.goal}</h2><p>{data.businessRole}</p></header>
  <div className="ns-metric" id="ns-metric"><div><span>北极星指标</span><h3>{data.metricName}</h3><p>{data.northStar.definition}</p></div><dl><div><dt>实际人数</dt><dd>待取得</dd></div><div><dt>阶段目标</dt><dd>待确认</dd></div><div><dt>截止日期</dt><dd>待确认</dd></div></dl></div>
  <p className="ns-formula">{data.northStar.formula}</p>
  <p>{data.northStar.targetAudience}</p>

  {!compact&&<>
   <section><h3>怎样计入有效活跃</h3><div className="ns-columns"><div><h4>计入</h4><ul>{data.northStar.inclusionNotes.map(x=><li key={x}>{x}</li>)}</ul></div><div><h4>剔除</h4><ul>{data.northStar.notIncluded.map(x=><li key={x}>{x}</li>)}</ul></div></div></section>
   <details><summary>时间、身份与数据覆盖</summary><p>{data.northStar.timezone}；{data.northStar.week}</p><p>{data.northStar.closedWindow}</p>{Object.entries(data.identityAndCoverage).filter(([,v])=>typeof v==='string').map(([k,v])=><p key={k}>{v as string}</p>)}<h4>每期记录</h4><ul>{data.identityAndCoverage.disclosure.map(x=><li key={x}>{x}</li>)}</ul></details>
   <details><summary>浏览、观看与参与的观测口径建议</summary><p>{data.eventCandidates.status}</p>{[...data.eventCandidates.consumption,...data.eventCandidates.participation,...data.eventCandidates.reuse].map(e=><section key={e.type}><h4>{e.type}</h4><p>{e.proposal}</p><p>{e.caveat}</p></section>)}<ul>{data.eventCandidates.antiAccidental.map(x=><li key={x}>{x}</li>)}</ul></details>
   <section id="ns-support"><h3>辅助指标</h3><div className="table-wrap"><table><thead><tr><th>指标</th><th>口径</th><th>用途</th></tr></thead><tbody>{data.supportingMetrics.map(e=><tr key={e.name}><th>{e.name}</th><td>{e.formula}{'missing' in e&&<small>{e.missing}</small>}</td><td>{e.purpose}</td></tr>)}</tbody></table></div></section>
   <section><h3>投入和体验约束</h3><div className="ns-guardrails">{data.guardrails.map(e=><article key={e.name}><h4>{e.name}</h4><p>{e.measure}</p><p>{e.rule}</p></article>)}</div></section>
   <CreatorSupplyLink context="progress"/>
   <NorthStarPlan/>
   <section className="ns-inputs" id="ns-inputs"><h3>需要补充的资料</h3>{data.humanInputs.map(e=><article key={e.id}><h4>{e.id} · {e.name}</h4><ul>{e.needed.map(x=><li key={x}>{x}</li>)}</ul><p>{e.canProceed}</p></article>)}</section>
  </>}
 </section>;
}

export function NorthStarDirections(){
 return <section className="north-star ns-directions"><h2>三个候选方向</h2><p>{data.decision}</p><p className="ns-status">{data.decisionStatus}。</p>
  <div className="ns-direction-grid">{data.directions.map(e=><article key={e.id}><span className="ns-priority">{e.priority}</span><h3>{e.name}</h3><p>{e.audience}</p><dl><div><dt>为什么回来</dt><dd>{e.returnReason}</dd></div><div><dt>看见什么</dt><dd>{e.content}</dd></div><div><dt>如何持续供给</dt><dd>{e.operations}</dd></div><div><dt>工具的作用</dt><dd>{e.toolRole}</dd></div><div><dt>观察信号</dt><dd>{e.mvpSignal}</dd></div><div><dt>调整条件</dt><dd>{e.stop}</dd></div><div><dt>内容组合</dt><dd>{e.modes}</dd></div></dl></article>)}</div><p>{data.organizationNote}</p>
 </section>;
}

export function NorthStarPlan(){
 return <section className="ns-plan" id="ns-plan"><h3>四周试点</h3><p>{data.mvp.duration}</p><p>{data.mvp.scope}</p><p>{data.mvp.sample}</p><ol>{data.mvp.weeks.map(w=><li key={w.week}><span>第 {w.week} 周</span><div><h4>{w.question}</h4><p>{w.work}</p><p><b>记录：</b>{w.output}</p></div></li>)}</ol><details><summary>继续、调整和停止的判断</summary>{data.mvp.decision.map(e=><section key={e.action}><h4>{e.action}</h4><p>{e.condition}</p></section>)}</details><p>{data.mvp.makeNowBoundary}</p></section>;
}
