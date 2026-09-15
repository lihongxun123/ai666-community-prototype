'use client';
import d from '@/lib/content-demand-panel.json';
import './content-demand-panel.css';
const base='/research-kit/douyin-panel-2026-09-12/';
const ratio=(n:number|null)=>n===null?'未取得':(n*100).toFixed(1)+'%';
function Source({id}:{id:string}){const w=d.works.find(w=>w.id===id);return w?<a href={w.url} target="_blank" rel="noreferrer">{w.author} · {w.label.slice(0,36)} ↗</a>:null;}
function Table({heads,rows}:{heads:string[];rows:React.ReactNode[][]}){return <div className="cd-table"><table><thead><tr>{heads.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>;}
function Replies({work}:{work:typeof d.works[number]}){return <>{work.threads.filter(t=>!t.superseded).map((t,i)=><details className="dp-thread" key={i}>
 <summary>顶层第{t.parentPosition}条的讨论 · {t.readableReplyCount}条可读回复{t.capturePhase==='专项补读'?' · 补读':''}</summary>
 <p>{t.summary}</p>
 {t.replyRepresentation==='thread_summary'&&<p className="de-meta">已读回复按楼层归纳。</p>}
 {t.highlights.map((h,j)=><p key={j}>回复第{h.replyPosition}条：{h.point}</p>)}
 {t.response&&t.response!==t.summary&&<p>{t.response}</p>}{t.outcome&&t.outcome!==t.summary&&<p>{t.outcome}</p>}
 {t.replies.length>0&&<Table heads={['回复顺序／身份','回复转述','经历证据']} rows={t.replies.map((r:{position:number;role:string;paraphrase:string;experience:string})=>[r.position+' · '+(r.role==='author'?'作者':'身份未核'),r.paraphrase,r.experience])}/>}
 <p className="de-meta">{t.capturePhase}：{t.observedAt.replace('T',' ').replace('Z',' UTC')}{t.currentPosition!==t.parentPosition?'；重读时位于第'+t.currentPosition+'条，按父评论正文关联。':''}</p>
 </details>)}</>;}
export function DouyinPanel(){return <section className="dp-research" id="dp-research">
 <h2>{d.title}</h2>
 <div className="dp-counts">{[[d.stats.works,'作品快照'],[d.stats.authors,'已核作者'],[d.stats.readableRoot,'可读顶层评论'],[d.stats.readableReplies,'可读回复']].map(([n,t])=><div key={t}><strong>{n}</strong><span>{t}</span></div>)}</div>
 <p className="de-meta">读取：2026年9月12日。63件作品中，35件发布于7月13日至9月6日，21件更早、7件更晚。顶层与回复分别计数，均不代表独立用户数。3个楼层的专项补读另列。</p>
 <nav className="cd-toc" aria-label="互动与评论研究目录">{[['dp-findings','主要发现'],['dp-metrics','互动构成'],['dp-comments','评论与具体问题'],['dp-sources','逐件查看'],['dp-method','采集范围']].map(([id,t])=><button key={id} className="cd-link" data-jump={id} onClick={()=>document.getElementById(id)?.scrollIntoView({block:'start'})}>{t}</button>)}</nav>

 <section id="dp-findings"><h3>看作品表现，也看观众接着需要什么</h3><div className="dp-findings">{d.findings.map(f=><article key={f.title}><h4>{f.title}</h4><p>{f.text}</p><p>{f.meaning}</p><div className="de-sources">{f.workIds.map(id=><Source key={id} id={id}/>)}</div></article>)}</div></section>
 <section id="dp-metrics"><h3>同一作者的互动构成</h3><Table heads={['作品','点赞','收藏','分享','收藏／点赞','分享／点赞']} rows={['DP-002','DP-001','DP-003','DP-006','DP-007'].map(id=>{const w=d.works.find(w=>w.id===id)!;return [<Source id={id} key={id}/>,w.metricsRaw.like??'未显示',w.metricsRaw.collect??'未显示',w.metricsRaw.share??'未显示',ratio(w.collectLike),ratio(w.shareLike)];})}/><p>分母是点赞数，两个比值只描述互动构成。63件作品均未取得播放量，不能计算观看互动率；收藏与点赞来自不同动作，也可能由不同的人完成，比值可以超过100%。作品发布时间不同，不能据此判断教程比成片更有效。</p><p className="de-meta">例如知雪的教程记录为1731赞、1829次收藏，收藏／点赞约105.7%。这不是105.7%的观众收藏，也不是数据异常。数字显示“万”时按近似值计算。<Source id="DP-S002"/></p></section>
 <section id="dp-comments"><h3>评论里的具体诉求与回应</h3>
 <Table heads={['作品与位置','具体反馈（转述）','已读回应／结果','对内容供给的提示']} rows={d.highlights.map(h=>[<span key={h.key}><Source id={h.workId}/><small className="dp-position">顶层第{h.position}条</small></span>,h.paraphrase,h.response,h.implication])}/>
 <details className="cd-profile"><summary><strong>作者回应与新手需求的分歧</strong><span>参考研究视频的两个讨论楼层</span></summary><div className="cd-profile-body"><p>有人要求示范这份分析的制作过程。作者回应认为过程容易；后续读者则指出，熟悉AI的人觉得简单的步骤，对新手仍然困难。其他读者补充了数据处理和成片思路，尚未读到提问者完成任务的确认。</p><p>另一楼层讨论生成结果仍需人工筛选，作者认可了读者的比喻。这是观点互动，不能算提供了操作方法或解决了使用问题。</p><p>一处读到了全部11个展开条目，其中10个有文字；另一处只读到13条提示中的前3条。原第9条评论在重读时已排到第10条，以正文和作品链接关联，没有计成新的顶层评论。</p><Source id="DP-008"/></div></details>
 </section>
 <section id="dp-sources"><h3>63件作品逐件查看</h3><p className="de-meta">窗口内先列，窗外保留为补充材料。未读到评论正文不等于没有讨论。{d.readScope}</p>
 {['窗口内','窗口前','窗口后'].map(window=><details className="cd-profile" key={window} open={window==='窗口内'}><summary><strong>{window} · {d.works.filter(w=>w.window===window).length}件</strong></summary><div className="cd-profile-body">{d.works.filter(w=>w.window===window).map(w=><details className="dp-work" key={w.id}><summary><strong>{w.author} · {w.label}</strong><span>{w.publishedAt?.slice(0,10)} · {w.readableRoot}条可读顶层</span></summary><div><p><a href={w.url} target="_blank" rel="noreferrer">作品原页 ↗</a><a href={w.authorUrl||w.url} target="_blank" rel="noreferrer">作者主页 ↗</a></p><Table heads={['点赞','评论','收藏','分享','收藏／点赞','分享／点赞']} rows={[[w.metricsRaw.like??'未显示',w.metricsRaw.comment??'未显示',w.metricsRaw.collect??'未显示',w.metricsRaw.share??'未显示',ratio(w.collectLike),ratio(w.shareLike)]]}/><p>{w.observation}</p><p className="de-meta">{w.selectionReason} · 读取时间{w.observedAt.replace('T',' ').replace('Z',' UTC')}。</p>{w.comments.length>0?<Table heads={['顺序／身份','评论转述','讨论倾向','经历与回应']} rows={w.comments.map(c=>[c.position+' · '+(c.role==='author'?'作者':'身份未核'),c.paraphrase,c.stance,[c.experience,c.response].filter(Boolean).join('；')])}/>:<p>未取得可编码的评论正文。</p>}<Replies work={w}/></div></details>)}</div></details>)}
 </section>

 <details className="cd-profile" id="dp-method"><summary><strong>一次采集的范围、指标和缺口</strong></summary><div className="cd-profile-body"><Table heads={['对象','同次访问可以记录','仍需另行取得']} rows={d.singlePass.map(x=>[x.item,x.now,x.later])}/><p>固定评论样本共有486个顶层位置，其中{d.stats.readableRoot}条有可读文字；267个回复位置中247条有可读文字。127次楼层展开检查，121次返回展开结果，其他保留为未读。3个专项补读不并入固定样本指标。</p><p>数据来自定向案例、普通网络检索和已采抖音精选分类的顺序补样；51个作者是身份去重结果，不是已完成的48作者面板。近期完整发布、同龄指标、最新评论和全量回复仍未齐备。参考视频的1464条原表没有纳入本数据。</p><p>一条评论里的提问、质疑和明确亲测分别编码。作者标记与普通评论分开；没有确认解决的记录保持未知，不能反写成全部失败。数字、链接与读取时间见作品和评论记录。</p>{' · '}</div></details>
 </section>;}

export function PanelPlanning(){return <section id="dp-community"><h3>这些反馈可以转成哪些社区工作</h3><Table heads={['观察到的信号','相应内容','与供给者相处的身份','需要进一步核实']} rows={d.community.map(x=>[x.signal,x.content,x.relationship,x.check])}/><p>目前证据支持区分消费任务，还不能支持选定一个社区方向。先确认作者是否愿意提供相应材料、抖音及竞品是否已经满足诉求，再看外部用户是否持续回来。工具调用、补贴发文和内部互动都不能替代这个结果。</p></section>;}
