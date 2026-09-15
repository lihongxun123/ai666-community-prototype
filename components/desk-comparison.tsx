import data from '@/lib/desk-comparison.json';

export function DeskComparisons() {
  return <section className="brief-section" id="desk-comparisons" aria-labelledby="desk-comparisons-title">
    <h2 id="desk-comparisons-title">{data.title}</h2>
    <p>{data.summary}</p>
    <div className="table-wrap"><table className="brief-table">
      <thead><tr><th>任务与平台</th><th>发现</th><th>比较到哪一步</th></tr></thead>
      <tbody>{data.comparisons.map(item => <tr key={item.id}>
        <th scope="row">{item.title}<p className="muted">{item.platforms.join(' / ')}</p></th>
        <td>{item.finding}</td><td><p>{item.method}</p><p>{item.limit}</p></td>
      </tr>)}</tbody>
    </table></div>
    {data.comparisons.map(item => <details className="study-sources" key={item.id} id={`desk-${item.id}`}>
      <summary>{item.title}：逐项记录与原页</summary>
      <p>{item.task}</p><p className="muted">{item.method}</p>
      <div className="table-wrap"><table className="brief-table"><thead><tr><th>检查项</th><th>{item.platforms[0]}</th><th>{item.platforms[1]}</th><th>核对结果</th></tr></thead>
        <tbody>{item.rows.map(row => <tr key={row.step}><th scope="row">{row.step}</th><td>{row.left}</td><td>{row.right}</td><td><p>{row.judgment}</p><small>{row.status}</small></td></tr>)}</tbody>
      </table></div>
      <p>{item.conclusion}</p>
      <details><summary>选择条件与读取范围</summary>
        <h3>固定条件</h3><ul>{item.controlled.map(text => <li key={text}>{text}</li>)}</ul>
        <h3>条件差异</h3><ul>{item.uncontrolled.map(text => <li key={text}>{text}</li>)}</ul>
        <p>{item.access}</p>
      </details>
      <h3>具体页面</h3>{item.sources.map(source => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><br/><small>{source.scope}</small></p>)}
    </details>)}
    <p className="muted">{data.scope}</p>
  </section>;
}
