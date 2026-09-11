import data from '@/lib/content-demand-observations.json';
import './content-demand-samples.css';

type Sample = (typeof data.samples)[number];
type Metric = Sample['metrics'][number];

function External({ url, children }: { url: string; children: React.ReactNode }) {
  return <a href={url} target="_blank" rel="noreferrer">{children} ↗</a>;
}

function MetricTable({ metrics }: { metrics: Metric[] }) {
  if (!metrics.length) return <p className="cds-empty">未读取到明确标注的消费计数。</p>;
  return <div className="cds-metrics"><table>
    <thead><tr><th>页面字段</th><th>数值</th><th>周期与含义</th></tr></thead>
    <tbody>{metrics.map((m, i) => <tr key={`${m.field}-${i}`}>
      <th>{m.field}{m.kind !== 'consumption' && <small>{m.kind === 'participation' ? '协作记录' : '任务表现'}</small>}</th>
      <td>{m.value === null ? '未取得' : <>{m.value}{m.unit && <span className="cds-unit"> {m.unit}</span>}</>}</td>
      <td>{m.window}<small>{m.note}</small></td>
    </tr>)}</tbody>
  </table></div>;
}

function SampleDetails({ sample: s }: { sample: Sample }) {
  const hasRequest = s.demand.request !== null;
  return <details className="cds-sample" id={`cd-sample-${s.id}`}>
    <summary>
      <span className="cds-sample-heading"><strong>{s.title}</strong><span>{s.platform.name}</span></span>
      <span className="cds-sample-meta"><span>{s.novelty.label}</span><span>{s.forms.join(' · ')}</span></span>
    </summary>
    <div className="cds-body">
      <div className="cds-source-line"><External url={s.url}>原始页面</External><span>查询：{s.observedAt}</span>{s.checkedAt && <span>批次核对：{s.checkedAt.replace('T', ' ')}</span>}</div>
      <dl className="cds-dates">
        <div><dt>发布</dt><dd>{s.publication.publishedAt || '未标明'}</dd></div>
        <div><dt>更新</dt><dd>{s.publication.updatedAt || '未标明'}</dd></div>
        {s.publication.latestParticipationAt && <div><dt>可见参与</dt><dd>{s.publication.latestParticipationAt}</dd></div>}
      </dl>
      <p className="cds-date-note">{s.publication.note}</p>

      <div className="cds-columns">
        <div>
          <h4>题材与用途</h4>
          <p className="cds-topics">{s.topics.join('、')}</p>
          <p>{s.purpose}</p>
          <dl className="cds-fields">
            <div><dt>用途行业</dt><dd>{s.industry || '未确认'}</dd></div>
            <div><dt>形式</dt><dd>{s.forms.join('、')}</dd></div>
            <div><dt>供给者</dt><dd>{s.author.type}</dd></div>
          </dl>
        </div>
        <div>
          <h4>可见消费与参与</h4>
          <MetricTable metrics={s.metrics}/>
          {s.metricNote && <p className="cds-note">{s.metricNote}</p>}
          {s.unlabeledNumbers.length > 0 && <p className="cds-note">另有未标明含义的数字，未计入消费指标。</p>}
        </div>
      </div>

      <div className="cds-demand">
        <h4>{hasRequest ? '直接求助与解决状态' : '读者反馈'}</h4>
        <p className="cds-status">{s.demand.status}</p>
        {hasRequest ? <dl className="cds-fields">
          <div><dt>具体需求</dt><dd>{s.demand.request}</dd></div>
          {s.demand.failure && <div><dt>遇到的问题</dt><dd>{s.demand.failure}</dd></div>}
          <div><dt>解法与结果</dt><dd>{s.demand.solution || '未见提问者确认解决。'}</dd></div>
          {s.demand.followUp && <div><dt>后续记录</dt><dd>{s.demand.followUp}</dd></div>}
          <div><dt>判断依据</dt><dd>{s.demand.basis}</dd></div>
        </dl> : <p>{s.demand.basis}</p>}
      </div>

      {s.authorObservations.length > 0 && <div className="cds-author-notes">
        <h4>作者说明与页面状态</h4>
        <ul>{s.authorObservations.map((o, i) => <li key={i}><strong>{o.type}：</strong>{o.text}{o.url && <> <External url={o.url}>关联页面</External></>}</li>)}</ul>
      </div>}

      <div className="cds-columns cds-supply">
        <div><h4>已提供的材料</h4>{!hasRequest && <p className="cds-note">{s.supply.status}</p>}<ul>{s.supply.provided.map((v, i) => <li key={i}>{v}</li>)}</ul></div>
        <div><h4>还缺什么</h4><ul>{s.supply.missing.map((v, i) => <li key={i}>{v}</li>)}</ul></div>
      </div>
      <p className="cds-interpretation">{s.interpretation}</p>

      <details className="cds-provenance"><summary>采样入口与来源</summary>
        <dl className="cds-fields">
          <div><dt>入口</dt><dd>{s.entry.description}</dd></div>
          <div><dt>选取原因</dt><dd>{s.entry.reason}</dd></div>
          <div><dt>读取范围</dt><dd>{s.entry.scope}</dd></div>
          <div><dt>记录关系</dt><dd>{s.novelty.detail}</dd></div>
        </dl>
        <ol>{s.sources.map((source, i) => <li key={`${source.url}-${i}`}>
          <External url={source.url}>{source.title}</External>
          <span>{source.whatSupports}</span>
          <small>内容日期：{source.date || '未标明'} · 查询：{source.accessedAt}</small>
        </li>)}</ol>
      </details>
    </div>
  </details>;
}

export function ContentDemandSamples() {
  return <section className="cd-samples" id="cd-observations" aria-labelledby="cd-observations-title">
    <h2 id="cd-observations-title">18条内容与使用样本</h2>
    <p className="cds-batch-meta">查询日期：{data.observedRange.from} · {data.stats.platformCount}个平台 · 新增{data.stats.newCount}条，复核{data.stats.recheckedCount}条</p>
    {data.groups.map(group => <div className="cds-group" id={`cd-sample-group-${group.id}`} key={group.id}>
      <h3>{group.label}<span>{group.sampleIds.length}条</span></h3>
      <p className="cds-group-finding">{group.summary}</p>
      {data.samples.filter(s => s.groupId === group.id).map(sample => <SampleDetails key={sample.id} sample={sample}/>)}
    </div>)}
  </section>;
}
