import data from '@/lib/strategy-comparison.json';
import evidence from '@/lib/representative-evidence.json';
import './strategy-conditions.css';

function CaseSources({ids}:{ids:string[]}){
 const records=evidence.platforms.flatMap(p=>p.cases).filter(c=>ids.includes(c.id));
 const sources=[...new Map(records.flatMap(c=>c.sources).map(s=>[s.url,s])).values()];
 return <div className="condition-sources">{sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" title={s.supports}>{s.title} ↗</a>)}</div>;
}

export function StrategyConditionsSummary(){
 return <section className="strategy-conditions" id="strategy-conditions-summary"><h3>四份方案的采用条件</h3><div className="table-wrap"><table className="brief-table"><thead><tr><th>方案</th><th>证据影响的判断</th><th>最低可交付范围</th></tr></thead><tbody>{data.options.options.map(o=><tr key={o.id}><th>{o.id} · {o.name}</th><td>{o.evidenceReview.map(r=><p key={r.id}>{r.change}</p>)}<details><summary>依据</summary><CaseSources ids={o.evidenceReview.flatMap(r=>r.caseIds)}/></details></td><td>{o.lightVersion}</td></tr>)}</tbody></table></div></section>;
}

export function StrategyConditionReview({optionId}:{optionId:string}){
 const option=data.options.options.find(o=>o.id===optionId);if(!option)return null;
 return <div className="strategy-conditions">
 <section><h3>证据与采用条件</h3>{option.evidenceReview.map(r=><article className="condition-change" key={r.id} id={r.id}><h4>{r.title}</h4><dl><dt>原判断</dt><dd>{r.previous}</dd><dt>已观察事实</dt><dd>{r.observed}</dd><dt>判断</dt><dd>{r.judgment}</dd><dt>方案调整</dt><dd>{r.change}</dd><dt>仍需核对</dt><dd>{r.remaining}</dd></dl><CaseSources ids={r.caseIds}/></article>)}</section>
 <section><h3>内容展示与持续责任</h3>{option.contentResponsibilities.map(c=><details className="condition-carrier" key={c.form}><summary>{c.form}</summary><dl><dt>发现入口</dt><dd>{c.discovery}</dd><dt>卡片</dt><dd>{c.card}</dd><dt>详情</dt><dd>{c.detail}</dd><dt>使用动作</dt><dd>{c.use}</dd><dt>组织原因</dt><dd>{c.reason}</dd></dl><div className="condition-responsibility"><dl><dt>制作</dt><dd>{c.produce}</dd><dt>核验</dt><dd>{c.verify}</dd><dt>维护</dt><dd>{c.maintain}</dd><dt>何时处理</dt><dd>{c.trigger}</dd><dt>能力不足时</dt><dd>{c.fallback}</dd></dl></div></details>)}</section>
 </div>;
}
