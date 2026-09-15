import data from '@/lib/liblib-supply-samples.json';

export function LiblibSupplySamples(){return <section id="liblib-supply-samples">
 <h3>供给样本与具体任务</h3>
 <p>{data.count} 条去重资源记录。每条保留具体用途、输入条件和原始页面，按研究用途分组。</p>
 <div className="table-wrap"><table><thead><tr><th>用途分组</th><th>样本数</th></tr></thead><tbody>{data.categories.map(c=><tr key={c.name}><td>{c.name}</td><td>{c.count}</td></tr>)}</tbody></table></div>
 <p>{data.limit}</p>
 <h4>样本中的具体差异</h4>{data.differences.map((d,i)=><div key={i}><p>{d.text}</p><div className="study-refs">{d.ids.map(id=>{const r=data.records.find(r=>r.id===id)!;return <a key={id} href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a>;})}</div></div>)}
 {data.categories.map(c=><details key={c.name}><summary>{c.name} · {c.count} 条</summary><div className="table-wrap"><table><thead><tr><th>资源与作者署名</th><th>具体任务与供给</th><th>输入与条件</th><th>使用证据</th></tr></thead><tbody>{data.records.filter(r=>r.category===c.name).map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a><p>{r.form} · {r.author}</p></td><td><strong>{r.task}</strong><p>{r.supplyDetails}</p></td><td>{r.inputsOrConditions}<p>{r.limitation}</p></td><td>{r.usageEvidence||'未取得独立使用者反馈'}<p>{r.observedAt} · {r.access}</p></td></tr>)}</tbody></table></div></details>)}
 <details><summary>样本口径与覆盖缺口</summary><p>{data.method}</p><p>{data.next}</p><p>资源形式：{data.forms.map(f=>`${f.name} ${f.count} 条`).join('；')}。</p></details>
 </section>;}
