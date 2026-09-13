'use client';

import plan from '@/lib/retention-research.json';
import evidence from '@/lib/retention-evidence.json';

export function RetentionPlan() {
  return <section className="v23-conclusion" id="retention-plan" aria-labelledby="retention-plan-title">
    <h2 id="retention-plan-title">{plan.title}</h2>
    <p>{plan.answer}</p>
    <div className="table-wrap"><table><thead><tr><th>候选方向</th><th>为什么再来</th><th>已有选择与进入条件</th><th>最小试验与投入</th></tr></thead>
      <tbody>{plan.directions.map(row => <tr key={row.name}><th scope="row">{row.name}</th><td>{row.returnReason}</td><td><p>{row.alternative}</p><p>{row.gate}</p></td><td><p>{row.trial}</p><p>{row.burden}</p></td></tr>)}</tbody></table></div>
    <h3>怎么推进</h3>
    <ol>{plan.stages.map(stage => <li key={stage.name}><h4>{stage.name}</h4><p className="muted">{stage.status}</p><p>{stage.work}</p><p><strong>得到什么：</strong>{stage.output}</p><p><strong>如何判断：</strong>{stage.decision}</p></li>)}</ol>
    <details className="study-sources"><summary>任务脚本与比较条件</summary>
      {plan.taskCards.map(task => <article key={task.title}><h3>{task.title}</h3><p><strong>给参与者的任务：</strong>{task.prompt}</p><p><strong>记录：</strong>{task.record}</p><p><strong>条件：</strong>{task.control}</p></article>)}
      <ul>{plan.comparisonRules.map(rule => <li key={rule}>{rule}</li>)}</ul>
    </details>
    <details className="study-sources"><summary>连续四周如何计数、复盘与决定去留</summary>
      <dl>{plan.measurement.map(row => <div key={row.name}><dt><strong>{row.name}</strong></dt><dd>{row.value}</dd></div>)}</dl>
      <h3>试验前先约定的判断规则</h3><p>下面是判断顺序。具体人数目标和工时费用上限，在首批基线与可用投入明确后、正式观察前确定；不借用未知来源的行业留存线。</p>
      <ul>{plan.decisionRules.map(row => <li key={row.state}><strong>{row.state}：</strong>{row.rule}</li>)}</ul>
      <p>{plan.capacityNote}</p>
    </details>
    <details className="study-sources"><summary>记录模板、人工输入与方法来源</summary>
      {plan.records.map(row => <article key={row.name}><h3>{row.name}</h3><p>{row.fields}</p></article>)}
      <h3>真人观察开始前需要补充</h3><ul>{plan.humanInputs.map(item => <li key={item}>{item}</li>)}</ul>
      <h3>方法参考</h3>{plan.methods.map(source => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>：{source.use}</p>)}
    </details>
  </section>;
}

export function RetentionEvidence() {
  return <section className="brief-section" id="retention-evidence" aria-labelledby="retention-evidence-title">
    <h2 id="retention-evidence-title">用户回访与作者维护：具体记录</h2>
    <p>{evidence.summary}</p>
    <div className="table-wrap"><table className="brief-table"><thead><tr><th>方向</th><th>可以确认的行为</th><th>还不能确认什么</th></tr></thead><tbody>
      {evidence.findings.map(row => <tr key={row.direction}><th scope="row">{row.direction}</th><td><p>{row.finding}</p><p>{row.sources.map(source => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.title} ↗ </a>)}</p></td><td>{row.limit}</td></tr>)}
    </tbody></table></div>
    <details className="study-sources"><summary>查看时间线、来源与反例</summary>
      <p>{evidence.countingNote}</p>
      {evidence.records.map(record => <article key={record.id} id={`retention-${record.id}`}>
        <h3>{record.platform} · {record.sourceTitle}</h3>
        <p className="muted">{record.publishedAt || '原页面未确认日期'} · {record.evidenceLabel} · {record.provenanceLabel}</p>
        {record.dateNote && <p className="muted">{record.dateNote}</p>}
        <p><strong>起因：</strong>{record.trigger}</p><p><strong>后续：</strong>{record.repeatEvidence}</p>
        <p><strong>替代选择或困难：</strong>{record.alternative} {record.friction}</p><p><strong>缺少的记录：</strong>{record.whatItDoesNotProve}</p>
        {record.readScope && <p className="muted">读取范围：{record.readScope}</p>}
        <p><a href={record.url} target="_blank" rel="noreferrer">{record.sourceTitle} ↗</a>{record.supportingUrls.map(url => <a key={url} href={url} target="_blank" rel="noreferrer">　关联记录 ↗</a>)}</p>
      </article>)}
    </details>
  </section>;
}
