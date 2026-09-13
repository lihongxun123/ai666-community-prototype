/* oxlint-disable next/no-img-element -- Original research screenshots. */
import data from '@/lib/linuxdo-login.json';

function Refs({ ids }: { ids: string[] }) {
 return <span className="study-refs">{ids.map(id => { const s = data.sources.find(s => s.id === id); return s ? <a key={id} href={s.url} target="_blank" rel="noreferrer">〔{s.title}〕</a> : null; })}</span>;
}

export function LinuxDoImages({ contentOnly = false }: { contentOnly?: boolean }) {
 const images = contentOnly ? data.images.filter((_, i) => [0, 2, 3, 4].includes(i)) : data.images;
 return <div className="research-gallery">{images.map(img => <figure key={img.file}><a href={`/research-images/v11-linuxdo/${img.file}`} target="_blank" rel="noreferrer"><img src={`/research-images/v11-linuxdo/${img.file}`} alt={img.title} loading="lazy"/></a><figcaption><strong>{img.title}</strong><p>{img.observation}</p><p className="muted">{img.limitation}</p><Refs ids={[img.source]}/></figcaption></figure>)}</div>;
}

export function LinuxDoLoginUpdate() {
 return <section id="linuxdo-login" className="study-platform linuxdo-update">
  <div className="section-heading"><h2>{data.title}</h2><span className="status status-事实">{data.date}</span></div>
  <p className="lead">{data.summary}</p><p className="muted">{data.scope}</p>

  <h3>这次补到了什么</h3>{data.findings.map(f => <section className="study-mechanism" key={f.title}><h4>{f.title}</h4><p><strong>已确认：</strong>{f.fact}<Refs ids={f.refs}/></p><p><strong>分析与边界：</strong>{f.analysis}</p></section>)}
  <h3>运营如何持续运转</h3>{data.operations.map(o => <section className="study-mechanism" key={o.title}><h4>{o.title}</h4><p>{o.observed}<Refs ids={o.refs}/></p><p><strong>运营作用（分析）：</strong>{o.meaning}</p><p><strong>持续投入与限制：</strong>{o.cost}</p></section>)}
  <h3>6类内容分别交付什么</h3><div className="table-wrap"><table><thead><tr><th>内容形态</th><th>列表与详情</th><th>价值与限制</th></tr></thead><tbody>{data.forms.map(f => <tr key={f.name}><th>{f.name}<Refs ids={f.refs}/></th><td><p>{f.list}</p><p>{f.detail}</p></td><td><p>{f.value}</p><p className="muted">{f.limit}</p></td></tr>)}</tbody></table></div>
  <h3>样本读到了哪里</h3><p className="muted">按用途选择的6个主题，结果记录完整度各不相同。这里没有计算全站比例。</p><div className="table-wrap"><table><thead><tr><th>样本</th><th>阅读范围</th><th>观察结果</th></tr></thead><tbody>{data.samples.map(s => <tr key={s.source}><th>{s.title}<Refs ids={[s.source]}/></th><td>{s.scope}</td><td><p>{s.observed}</p><p className="muted">{s.result}</p></td></tr>)}</tbody></table></div>
  <h3>商业化：标价、服务收入与积分分开看</h3>{data.commercial.map(c => <section key={c.label}><h4>{c.label}</h4><p>{c.text}<Refs ids={c.refs}/></p></section>)}
  <h3>从实际行为辨认参与者</h3><div className="table-wrap"><table><thead><tr><th>观察角色</th><th>行为线索</th><th>尚不能确认</th></tr></thead><tbody>{data.people.map(p => <tr key={p.role}><th>{p.role}</th><td>{p.signal}<Refs ids={p.refs}/></td><td>{p.boundary}</td></tr>)}</tbody></table></div>
  <h3>界面与阅读体验</h3>{data.ux.map(x => <p key={x}>{x}</p>)}
  <h3>页面证据：7张实际截图</h3><p className="muted">仅裁切与遮挡身份信息，没有重绘界面。点击图片可放大。</p><LinuxDoImages/>
  <h3>新旧材料存在的差异</h3>{data.conflicts.map(c => <section key={c.title}><h4>{c.title}</h4><p>{c.text}<Refs ids={c.refs}/></p></section>)}
  <h3>还没有补齐的证据</h3><ul>{data.gaps.map(g => <li key={g}>{g}</li>)}</ul>
  <details className="study-sources"><summary>16条来源与读取范围</summary><ol>{data.sources.map(s => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p>{s.kind} · {s.date}</p><p className="muted">{s.scope}</p></li>)}</ol></details>
 </section>;
}
