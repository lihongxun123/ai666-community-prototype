import data from '@/lib/batch1-profiles.json';

export function Batch1Profile({id}:{id:string}){
 const p=data[id as keyof typeof data];
 if(!p)return null;
 return <>
  <nav className="article-toc" aria-label="产品与运营分析章节">{p.sections.map((s,i)=><a key={s.title} href={`#${id}`} onClick={e=>{e.preventDefault();document.getElementById(`${id}-analysis-${i}`)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{s.title}</a>)}</nav>
  {p.sections.map((s,i)=><section className="essay-section" key={s.title} id={`${id}-analysis-${i}`}><h3>{s.title}</h3>{s.paragraphs.map((t,j)=><p key={j}>{t}</p>)}<div className="citations">{s.sources.map((r,j)=><a key={j} href={r.url} target="_blank" rel="noreferrer">{r.title} · {r.date} ↗</a>)}</div></section>)}
  <details className="profile-section-group" id={`${id}-catalog-evidence`}><summary>分类下的内容样本</summary>{p.catalogs.map(c=><section className="essay-section" key={c.title}><h3>{c.title}</h3><p>{c.scope}</p><div className="table-wrap"><table><thead><tr><th>序号</th><th>目录条目</th></tr></thead><tbody>{c.rows.map((r,i)=><tr key={`${r.url}-${i}`}><td>{i+1}</td><th><a href={r.url} target="_blank" rel="noreferrer">{r.label} ↗</a></th></tr>)}</tbody></table></div></section>)}</details>
  <details className="profile-section-group" id={`${id}-page-evidence`}><summary>卡片、详情与操作截图</summary>{p.images.map(im=><figure key={im.src}><a href={im.src} target="_blank" rel="noreferrer"><img src={im.src} alt={im.title} loading="lazy" style={{width:'100%',height:'auto',display:'block'}}/></a><figcaption>{im.title} · {im.date} · <a href={im.url} target="_blank" rel="noreferrer">来源页面 ↗</a></figcaption></figure>)}</details>
 </>;
}
