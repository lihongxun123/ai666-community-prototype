import raw from '@/lib/representative-evidence.json';
import './representative-evidence.css';

export function RepresentativeEvidence({platformId,compact=false}:{platformId?:string;compact?:boolean}){
 const platforms=platformId?raw.platforms.filter(p=>p.id===platformId):raw.platforms;
 if(!platforms.length)return null;
 return <section className="followup-evidence" id={platformId?`followup-${platformId}`:'report-followups'}>
  <h3>{platformId?'持续使用与维护记录':'持续使用、失败处理与作者维护'}</h3>
  {!platformId&&<><p><a href="/research-kit/representative-evidence.md" download>下载案例与来源</a></p><div className="table-wrap"><table className="brief-table"><thead><tr><th>平台</th><th>已能确认</th><th>尚不能确认</th></tr></thead><tbody>{platforms.map(p=><tr key={p.id}><th>{p.name}</th><td>{p.confirmed}</td><td>{p.missing}</td></tr>)}</tbody></table></div></>}
  {platforms.map(p=><div className="followup-platform" key={p.id}>
   {!platformId&&!compact&&<h4>{p.name}</h4>}
   {!compact&&<p>{p.assessment}</p>}
   <details className="brief-records" open={platformId?true:undefined}><summary>{platformId?'案例经过与原始来源':`${p.name}：${p.cases.length}项具体记录`}</summary>
    {p.cases.map(c=><article className="followup-case" key={c.id} id={c.id}>
     <h4>{c.title}</h4><p className="followup-meta">{c.actorType}</p>
     <dl><dt>任务</dt><dd>{c.task}</dd><dt>问题</dt><dd>{c.problem}</dd></dl>
     <ol className="followup-timeline">{c.timeline.map((t,i)=><li key={i}><span>{t.date}</span><p>{t.event}</p></li>)}</ol>
     <dl><dt>观察结果</dt><dd>{c.observedOutcome}</dd><dt>仍未解决</dt><dd>{c.unresolved}</dd><dt>对内容与运营的启发</dt><dd>{c.implication}</dd></dl>
     <div className="brief-evidence">{c.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" title={`${s.publishedAt||'页面未标日期'} · 查阅${s.accessedAt} · ${s.supports}`}>{s.title} ↗</a>)}</div>
    </article>)}
    <p className="followup-commercial"><strong>商业化判断：</strong>{p.commercialBoundary}</p>
   </details>
  </div>)}
 </section>;
}
