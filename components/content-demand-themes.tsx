'use client';
import data from '@/lib/content-demand-themes.json';
import './content-demand-themes.css';
import {ClosureOverview,ClosureCase} from './content-demand-closure';
const base='/research-kit/theme-comparison-2026-09-13/';
function Source({url,children}:{url:string;children:React.ReactNode}){return <a href={url} target="_blank" rel="noreferrer">{children} ↗</a>}
export function ThemeComparison(){return <section className="tc-research" id="theme-comparison">
 <header className="tc-heading"><h2>{data.title}</h2><p>{data.summary}</p><div className="tc-downloads"><a href={base+'report.html'} target="_blank" rel="noreferrer">独立阅读／打印</a><a href={base+'report.md'} download>下载正文</a><a href={base+'data.json'} download>下载对照数据</a></div></header>
 <p className="tc-meta">{data.window} {data.counts.authors}个作者署名、{data.counts.works}个窗口内入口；{data.counts.detail}件已读详情与说明、{data.counts.indexed}件为索引摘要。重点作品的抽帧、评论和来源核对范围见各档案。</p>
 <ClosureOverview/>
 <div className="tc-table"><table><thead><tr><th>主题</th><th>用户要什么</th><th>内容组织</th><th>谁持续供给</th></tr></thead><tbody>{data.dossiers.map(t=><tr key={t.id}><th><a href={'#tc-'+t.id} onClick={e=>{e.preventDefault();const el=document.getElementById('tc-'+t.id);if(el instanceof HTMLDetailsElement)el.open=true;el?.scrollIntoView({block:'start'});}}>{t.name} ↓</a><small>{t.counts.authors}位作者 · {t.counts.works}件</small></th><td>{t.purpose}</td><td>{t.form}</td><td>{t.role}</td></tr>)}</tbody></table></div>
 <div className="tc-judgments">{data.judgments.map(x=><article key={x.title}><h3>{x.title}</h3><p>{x.text}</p></article>)}</div>
 {data.dossiers.map(t=><details className="tc-dossier" key={t.id} id={'tc-'+t.id}><summary><strong>{t.name}</strong><span>{t.purpose}</span></summary><div className="tc-body">
  <ClosureCase id={t.id}/>
  <dl className="tc-fields">{[['内容怎样展示',t.carrier],['社区可能增加什么',t.increment],['第一份内容怎样供给',t.supply],['为什么可能回来',t.return]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
  <h3>作品与作者</h3>{t.authors.map(a=><section className="tc-author" key={a.name}><h4>{a.url?<Source url={a.url}>{a.name}</Source>:a.name}</h4><p className="tc-meta">{a.role}。{a.coverage}</p><div className="tc-table"><table><thead><tr><th>作品与发布时间</th><th>赞／评／藏／转</th><th>形式与阅读范围</th><th>观察</th></tr></thead><tbody>{a.works.map(w=><tr key={w.url}><td><Source url={w.url}>{w.title}</Source><small>{w.date.replace('T',' ').replace(/:00\+08:00$/,'')}</small></td><td>{w.metrics.join(' / ')}<small>读取：{w.observedAt?.slice(0,10)||'详见底表'}</small></td><td>{w.contentType}<small>{w.read}</small></td><td>{w.observation}<small>{w.ai}</small></td></tr>)}</tbody></table></div></section>)}
  <h3>具体发现</h3>{t.findings.map((f,i)=><article className="tc-finding" key={i}><h4>{f.claim}</h4><p>{f.note}</p><div className="tc-sources">{f.urls.map((url,j)=><Source key={url} url={url}>依据 {j+1}</Source>)}</div></article>)}
  <h3>现有路径已经解决到哪一步</h3><div className="tc-table"><table><thead><tr><th>具体需要</th><th>已有供给</th><th>已提供</th><th>仍需核对</th></tr></thead><tbody>{t.alternatives.map((a,i)=><tr key={i}><th>{a.need}</th><td><Source url={a.url}>{a.provider}</Source></td><td>{a.provides}</td><td>{a.remaining}</td></tr>)}</tbody></table></div>
  {t.comments.length>0&&<><h3>剧情评论中的具体诉求</h3><p className="tc-meta">精选转述，不计算人群占比；作者澄清与观众意见分开。</p><ul className="tc-comments">{t.comments.map(c=><li key={c.id}><Source url={c.url}>{c.theme}</Source>（{c.role==='author'?'作者':'观众'}）：{c.paraphrase}</li>)}</ul></>}
  <dl className="tc-fields"><div><dt>继续公开核查</dt><dd>{t.next}</dd></div><div><dt>需要人补充</dt><dd>{t.human}</dd></div></dl><p><a href={base+t.download} download>下载{t.name}完整档案</a></p>
  {t.outside.length>0&&<details className="tc-outside"><summary>{t.outside.length}件窗口外或日期未定的参考</summary><ul>{t.outside.map(w=><li key={w.url}><Source url={w.url}>{w.author} · {w.title}</Source> — {w.date}</li>)}</ul></details>}
 </div></details>)}
 <footer className="tc-next"><h3>接下来补什么</h3><p>{data.next.public}</p><p>{data.next.human}</p><p>{data.next.experiment}</p></footer>
 </section>}
