import { useState } from 'react';
import type { DataEssay, PublicDataProfile, PublicObservation } from '@/lib/public-data-types';
import { comparisonDomain, comparisonMetric, comparisonMonth, comparisonProvider, domainNote, observationStatus } from '@/lib/public-data-helpers';

function SourceLink({ profile, observation }: { profile: PublicDataProfile; observation?: PublicObservation }) {
  const source = profile.sources.find(item => item.id === observation?.sourceId);
  return source ? <a className="data-source-link" href={source.url} target="_blank" rel="noreferrer">{source.publisher} 原页</a> : null;
}

function DataEssays({ data }: { data: DataEssay[] }) {
  return <>{data.map(essay => <section className="essay-section" key={essay.title}><h2>{essay.title}</h2>{essay.paragraphs.map((paragraph,index) => <p key={index}>{paragraph}</p>)}<div className="citations business-citations">{essay.refs.map(ref => <a href={ref.url} key={`${ref.url}-${ref.title}`} target="_blank" rel="noreferrer">{ref.title}</a>)}</div></section>)}</>;
}

export function PublicDataOverview({ data, allData, methods, insights, onSelect }: {
  data: PublicDataProfile[]; allData: PublicDataProfile[]; methods: DataEssay[]; insights: DataEssay[]; onSelect: (id:string) => void;
}) {
  const [metricKey,setMetricKey] = useState('visits');
  const choices = [{key:'visits',label:'月访问次数',unit:'次'},{key:'duration_seconds',label:'平均访问时长',unit:'分:秒'},{key:'pages_per_visit',label:'每次访问页数',unit:'页/次'},{key:'bounce_pct',label:'跳出率',unit:'%'}];
  const chosen = choices.find(choice => choice.key === metricKey)!;
  const chartRows = data.map(profile => ({profile,metric:comparisonMetric(profile,metricKey)})).filter(row => row.metric);
  const chartMax = Math.max(1,...chartRows.map(row => row.metric!.numericValue!));
  const comparable = allData.filter(profile => comparisonMetric(profile,'visits')).length;
  return <div className="public-data-report">
    <div className="page-heading"><h1>公开数据对照</h1></div>
    <nav className="article-toc" aria-label="公开数据章节">{[['data-comparison','同月对照'],['data-insights','数据带来的判断'],['data-method','统计方法与局限'],['data-coverage','逐家来源与缺口']].map(([id,label]) => <a href="#data" key={id} onClick={event=>{event.preventDefault();document.getElementById(id)?.scrollIntoView({block:'start'});}}>{label}</a>)}</nav>
    <p className="data-scope-note">核验于 2026-09-09。{comparable} / 18 家取得下表指定域名的 Semrush 2026 年 7 月 Visits；其余保留缺口及其他公开证据。M 表示百万，K 表示千。Visits 是访问次数估计。</p>
    <section id="data-comparison">
      <div className="section-heading"><h2>同来源、同月份的网页访问</h2><span>{comparisonProvider} · {comparisonMonth}全球、全设备</span></div>
      <div className="data-metric-controls" aria-label="切换对比指标">{choices.map(choice => <button key={choice.key} aria-pressed={metricKey===choice.key} onClick={()=>setMetricKey(choice.key)}>{choice.label}</button>)}</div>
      <figure className="data-bar-chart"><figcaption>{chosen.label}（{chosen.unit}）· 保留报告顺序；条形从零起，仅表示当前指标的相对大小。</figcaption>{chartRows.map(({profile,metric}) => <div className="data-bar-row" key={profile.id}><button onClick={()=>onSelect(profile.id)}>{profile.name}<small>{comparisonDomain(profile)}</small></button><div className="data-bar-track" aria-hidden="true"><div style={{width:`${metric!.numericValue!/chartMax*100}%`}}/></div><div className="data-bar-value"><strong>{metric!.value}</strong><SourceLink profile={profile} observation={metric}/></div></div>)}{chartRows.length===0&&<p className="empty">当前筛选没有同口径数值。</p>}</figure>
      <div className="table-wrap public-data-comparison-wrap"><table className="comparison-table public-data-comparison"><caption>全部 18 档按左侧筛选显示；缺失值不按零计算。点击名称进入逐项记录。</caption><thead><tr><th scope="col">竞品与观察域名</th><th scope="col">5 月访问</th><th scope="col">6 月访问</th><th scope="col">7 月访问</th><th scope="col">7 月环比</th><th scope="col">平均时长</th><th scope="col">页 / 次</th><th scope="col">跳出率</th><th scope="col">桌面 Direct</th><th scope="col">来源</th></tr></thead><tbody>{data.map(profile => <tr key={profile.id}><th scope="row"><button onClick={()=>onSelect(profile.id)}>{profile.name}</button><small>{comparisonDomain(profile)}</small>{domainNote(profile.id)&&<small>{domainNote(profile.id)}</small>}</th>{['2026-05','2026-06','2026-07'].map(month => <td key={month}>{comparisonMetric(profile,'visits',month)?.value || '未取得'}</td>)}{['mom_pct','duration_seconds','pages_per_visit','bounce_pct','direct_pct'].map(key=><td key={key}>{comparisonMetric(profile,key)?.value || '未取得'}</td>)}<td><SourceLink profile={profile} observation={comparisonMetric(profile,'visits') || comparisonMetric(profile,'visits','2026-06')}/></td></tr>)}</tbody></table></div>
      <p className="data-scope-note">除 Direct 为桌面口径外，本表使用对应公开页的全设备数据。环比保留来源正文精度，没有用已四舍五入的 M/K 数值重算。收入、App 月活和官网累计人数见商业分析，未混入本表。</p>
    </section>
    <div id="data-insights"><DataEssays data={insights}/></div>
    <section id="data-method"><h2>统计方法与局限</h2><DataEssays data={methods}/></section>
    <section id="data-coverage"><h2>逐家数据来源与缺口</h2>{allData.map(profile => <article className="data-coverage-item" key={profile.id}><h3><button onClick={()=>onSelect(profile.id)}>{profile.name}</button></h3><p>{profile.summary}</p><div className="citations business-citations">{profile.sources.map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title}</a>)}</div></article>)}</section>
  </div>;
}

function VisitTrends({ profile }: { profile: PublicDataProfile }) {
  const groups = new Map<string,PublicObservation[]>();
  for(const observation of profile.observations) {
    if(!observation.domain||observation.key!=='visits'||observation.provider!==comparisonProvider||observation.evidenceStatus!=='page'||observation.numericValue===null||!/^2026-0[567]$/.test(observation.period)) continue;
    const values=groups.get(observation.domain)||[]; values.push(observation); groups.set(observation.domain,values);
  }
  return <>{Array.from(groups.entries()).filter(([,values])=>values.length>1).map(([domain,values])=>{
    const sorted=[...values].sort((a,b)=>a.period.localeCompare(b.period));
    const max=Math.max(1,...sorted.map(observation=>observation.numericValue!));
    return <figure key={domain} className="data-trend"><figcaption>{domain}Semrush 月访问估计（次）</figcaption><div className="data-trend-columns">{sorted.map(observation=><div key={`${observation.period}-${observation.sourceId}`} className="data-trend-column"><strong>{observation.value}</strong><div className="data-trend-height"><div style={{height:`${observation.numericValue!/max*100}%`}}/></div><span>{observation.period}</span></div>)}</div><SourceLink profile={profile} observation={sorted[0]}/></figure>;
  })}</>;
}

export function PublicDataProfileSection({ data }: { data: PublicDataProfile }) {
  const highlights=['visits','mom_pct','duration_seconds','pages_per_visit','bounce_pct','direct_pct'].map(key=>comparisonMetric(data,key)||data.observations.filter(observation=>observation.key===key&&observation.evidenceStatus==='page'&&observation.numericValue!==null&&/^2026-\d{2}$/.test(observation.period)).sort((a,b)=>b.period.localeCompare(a.period))[0]).filter(Boolean) as PublicObservation[];
  return <section className="public-data-report public-data-profile" id="public-data"><div className="section-heading"><h2>公开数据与访问行为</h2><span>公开数据补核 · 2026.09.09</span></div><p className="data-summary">{data.summary}</p><p className="data-scope-note">观察域名：{data.domains.join('、')}。摘要按可得资料分别列示，每项标明月份与来源；不同口径不能直接比较。第三方流量估计与平台公开活动数字不代表内部用户或支付数据。</p>
    {highlights.length>0&&<div className="data-highlights">{highlights.map((observation,index)=><div key={index}><span>{observation.metric}</span><strong>{observation.value}</strong><small>{observation.provider} · {observation.period}<br/>{observation.domain ?? 'App 指标'}</small><small>{observation.scope}</small><SourceLink profile={data} observation={observation}/></div>)}</div>}
    <VisitTrends profile={data}/>
    <h3>数据支持的判断</h3>{data.interpretations.map((paragraph,index)=><p className="data-interpretation" key={index}>{paragraph}</p>)}
    <div className="citations business-citations">{data.sources.filter(source=>data.observations.some(observation=>observation.sourceId===source.id&&observation.evidenceStatus==='page')).map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title}</a>)}</div>
    <h3>逐项数值与统计范围</h3><p className="data-scope-note">按来源保留完整记录。不同月份、设备、域名及提供方的数值分别阅读；原页面更新后可能与本次记录不同。</p>
    {data.sources.map(source=>{
      const observations=data.observations.filter(observation=>observation.sourceId===source.id);
      if(!observations.length) return null;
      return <details className="data-observation-group" key={source.id}><summary>{source.publisher} · {observations[0].domain ?? 'App 指标'} · {Array.from(new Set(observations.map(observation=>observation.period))).join(' / ')} <span>（{observations.length} 项）</span></summary><p><a className="data-source-link" href={source.url} target="_blank" rel="noreferrer">{source.title}</a></p><p className="data-scope-note">{source.accessNote}</p><div className="table-wrap"><table className="data-observation-table"><thead><tr><th scope="col">指标</th><th scope="col">原始数值</th><th scope="col">时期与对象</th><th scope="col">范围与解释边界</th></tr></thead><tbody>{observations.map((observation,index)=><tr key={index}><th scope="row">{observation.metric}</th><td>{observation.value}</td><td>{observation.period}<small>{observation.domain ?? 'App 指标'}</small><small>{observationStatus(observation.evidenceStatus)}</small></td><td>{observation.scope}<small>{observation.limitation}</small></td></tr>)}</tbody></table></div></details>;
    })}
    <details className="data-gaps" open><summary>仍缺少什么</summary><ul>{data.gaps.map((gap,index)=><li key={index}>{gap}</li>)}</ul></details>
    <details className="data-sources"><summary>公开数据来源（{data.sources.length} 条）</summary>{data.sources.map(source=><div className="source-row" key={source.id}><div><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.publisher}发布日期：{source.publishedAt ?? '未标注'}查阅：{source.accessedAt}</p><p>{source.accessNote}</p></div></div>)}</details>
  </section>;
}
