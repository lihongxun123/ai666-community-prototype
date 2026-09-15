import data from '@/lib/function-pages.json';
import {LiblibSupplySamples} from './liblib-supply-samples';
import {LiblibDemandPilot} from './liblib-demand-pilot';
import {LiblibWindowStudy} from './liblib-window-study';
import {LiblibRepresentative} from './liblib-representative';
import {Batch1Profile} from './batch1-profile';

type Source = {title:string;url:string;date:string};
type Block = {type:'paragraph';text:string;sources:Source[]} | {type:'table';headers:string[];rows:string[][]} | {type:'image';title:string;src:string;date?:string};
type Profile = Omit<(typeof data.profiles)[number], 'sections'> & {sections:{title:string;body:string;sources:Source[];blocks?:Block[]}[]};
export const functionProfiles = new Map<string,Profile>(data.profiles.map(p => [p.id, p as Profile]));

function Citations({sources}:{sources:Source[]}) {
 return sources.length ? <div className="citations">{sources.map((r,j)=><a key={j} href={r.url} target="_blank" rel="noreferrer">{r.title} · {r.date} ↗</a>)}</div> : null;
}

export function FunctionProfile({id,evidenceOnly=false}:{id:string;evidenceOnly?:boolean}) {
 const p=functionProfiles.get(id);
 if(!p) return null;
 if(id==='liblib'&&!evidenceOnly)return <section className="function-profile"><LiblibRepresentative/><nav className="liblib-evidence-entry" aria-label="详细资料"><h2>研究资料</h2><a href="/liblib-evidence" target="_blank" rel="noopener noreferrer">功能、样本与截图 ↗</a><a href="/liblib-evidence?section=liblib-demand-appendix" target="_blank" rel="noopener noreferrer">使用体验与反馈 ↗</a></nav></section>;
 const expanded=['liblib','jimeng','runninghub'].includes(id);
 const EvidenceGroup=expanded&&!evidenceOnly?'details':'div';
 return <section id="function-pages" className="function-profile">
  <div className="section-heading"><h2>{expanded?'产品、运营与商业机制':'主要功能与用户路径'}</h2><span>资料核查截至 {p.evidenceDate || (expanded?'2026-09-15':'2026-09-14')}</span></div>

  {['jimeng','runninghub'].includes(id)&&<Batch1Profile id={id}/>}
  <EvidenceGroup className={expanded?'profile-section-group':undefined}>
  {expanded&&!evidenceOnly&&<summary>功能与页面详细证据</summary>}
  {p.sections.some(s=>s.blocks)&&<nav className="article-toc" aria-label="功能研究章节">{p.sections.map((s,i)=><a href={`#${id}`} key={s.title} onClick={e=>{e.preventDefault();document.getElementById(`${id}-function-${i}`)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{s.title}</a>)}</nav>}
  {p.sections.map((s,i)=><section className="essay-section" key={s.title} id={`${id}-function-${i}`}>
   <h3>{s.title}</h3>
   {s.blocks ? s.blocks.map((b,j)=>b.type==='paragraph' ? <div key={j}>{b.text&&<p>{b.text}</p>}<Citations sources={b.sources}/></div> : b.type==='table' ? <div className="table-wrap" key={j}><table><thead><tr>{b.headers.map((h,k)=><th key={k}>{h}</th>)}</tr></thead><tbody>{b.rows.map((r,k)=><tr key={k}>{r.map((c,l)=>l===0?<th key={l}>{c}</th>:<td key={l}>{c}</td>)}</tr>)}</tbody></table></div> : <figure key={j}><a href={b.src} target="_blank" rel="noreferrer"><img src={b.src} alt={b.title} loading="lazy" style={{width:'100%',height:'auto',display:'block'}}/></a><figcaption>{b.title} · {b.date || '2026-09-14'}</figcaption></figure>) : <><p>{s.body}</p><Citations sources={s.sources}/></>}
  </section>)}
  </EvidenceGroup>
  {id==='liblib'&&<>
   <section className="evidence-chapter" id="liblib-supply-evidence"><h2>供给目录、作品详情与截图样本</h2><p>模型目录：699条；工作流目录：45条（18条工作流、27个应用）；去重作品：534件，其中36件核对详情（32件图片、4件视频）。各入口独立统计。</p><p>主题与用途按标题、标签及部分详情编码，支持多标签归类。模型目录的主题未识别155条，交付用途未确认521条。</p><LiblibSupplySamples/><LiblibWindowStudy/></section>
   <section className="evidence-chapter" id="liblib-demand-appendix"><h2>使用体验与反馈</h2><LiblibDemandPilot/></section>
  </>}
  <details className="profile-section-group" id="function-coverage"><summary>主要页面与核对范围</summary>
   <div className="table-wrap"><table><thead><tr><th>页面／功能</th><th>证据状态</th><th>读取范围</th><th>日期</th></tr></thead><tbody>{p.coverage.map((r,i)=><tr key={i}><th><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></th><td>{r.status}</td><td>{r.scope}</td><td>{r.date}</td></tr>)}</tbody></table></div>
  </details>
  {p.gaps.length>0&&<details className="profile-section-group"><summary>影响判断的资料缺口</summary><ul>{p.gaps.map(g=><li key={g}>{g}</li>)}</ul></details>}
 </section>;
}
