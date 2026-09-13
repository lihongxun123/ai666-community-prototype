'use client';
import {profiles} from '@/lib/profiles';
import {isPlanningSection} from '@/lib/research-planning';
import operating from '@/lib/platform-operations.json';
import operationsCases from '@/lib/operations-data.json';
import content from '@/lib/content-forms.json';
import business from '@/lib/business-data.json';
import review from '@/lib/platform-review.json';
import supply from '@/lib/content-demand-platforms.json';
import themes from '@/lib/content-demand-themes.json';
import closure from '@/lib/content-demand-closure.json';
import audience from '@/lib/audience-research.json';
import china from '@/lib/china-ai-users.json';
import report from '@/lib/research-brief.json';
import {businessInsights} from '@/lib/business-synthesis';
import {ContentPriorities} from './content-evidence';
import {FrameworkPlanning,ToolModelPlanning,FrameworkContentPlanning} from './research-framework';
import {ProductTaskIdeas,ProductTaskPlanning} from './content-research';
import movedRaw from '@/lib/planning-moved-copy.json';
import {ResearchOutline} from './research-outline';
import {ComparisonPlanning} from './content-demand-comparison';
import {PanelPlanning} from './content-demand-panel';
import {CasesPlanning} from './content-demand-cases';
import {DepthPlanning} from './content-demand-depth';
import {EcosystemPlanning} from './content-demand-ecosystem';

type Navigate=(view:string,section?:string)=>void;
const moved=movedRaw as {platformId:string;text:string;sources?:{title:string;url:string}[]}[];
function MovedNotes({id}:{id:string}){return <>{moved.filter(x=>x.platformId===id).map((x,i)=><section key={i}><p>{x.text}</p>{x.sources?.length?<div className="study-refs">{x.sources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}</a>)}</div>:null}</section>)}</>;}
function Notes({rows}:{rows:[string,string|string[]][]}){return <dl className="study-definition">{rows.filter(([,value])=>Array.isArray(value)?value.length:!!value).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{Array.isArray(value)?<ul>{value.map((v,i)=><li key={i}>{v}</li>)}</ul>:value}</dd></div>)}</dl>;}
function Back({view,label,navigate,id}:{view:string;label:string;navigate:Navigate;id?:string}){return <p className="study-refs"><a href={'#'+view} onClick={e=>{e.preventDefault();navigate(view,id);}}>研究依据：{label} →</a></p>;}

export function ResearchApplications({navigate}:{navigate:Navigate}){return <section className="research-applications" id="research-applications">
 <h2>多元拾光可以借鉴什么</h2>
 <p>这里集中讨论可借鉴的做法、需要承担的工作和验证条件。是否采用，仍要看用户是否需要、内容能否持续供给，以及实际投入。</p>
 <ResearchOutline items={[
  ['adoption-platforms','逐个平台看'],['adoption-content','内容怎么组织'],['adoption-audience','服务哪些需要'],['adoption-topics','四类主题怎么尝试'],['adoption-task-plan','商品图试用设想'],['adoption-tools','工具与投入条件'],['adoption-report','综合判断']
 ]}/>
 <details id="adoption-platforms" className="research-appendix"><summary>18个平台：可借鉴的做法与前提</summary>
  {[...new Set(profiles.map(p=>p.group))].map(group=><section key={group}><h3>{group}</h3>{profiles.filter(p=>p.group===group).map(p=>{
   const op=operating.profiles.find(x=>x.id===p.id)?.takeaway,co=content.profiles.find(x=>x.id===p.id)?.takeaway;
   const oc=operationsCases.profiles.find(x=>x.id===p.id);
   const bu=business.find(x=>x.id===p.id),rv=review.platforms.find(x=>x.id===p.id),su=supply.profiles.find(x=>x.id===p.id);
   return <details key={p.id} id={'adoption-platform-'+p.id} className="study-sources"><summary>{p.name}</summary>
    <Notes rows={[["值得借鉴",p.relevance],["不宜照搬",p.notCopy]]}/>
    {p.sections.filter(isPlanningSection).map(s=><section key={s.title}><h4>{s.title}</h4>{s.paragraphs.map((v,i)=><p key={i}>{v}</p>)}<div className="study-refs">{s.refs?.map(n=><a key={n} href={p.sources[n-1].url} target="_blank" rel="noreferrer">{p.sources[n-1].title}</a>)}</div></section>)}
    {co&&<section><h4>内容组织</h4><Notes rows={[["可采用的做法",co.suitable],["先具备的条件",co.conditions],["不宜照搬",co.avoid]]}/><Back view="content" id={'content-'+p.id} label={p.name+'内容档案'} navigate={navigate}/></section>}
    {op&&<section><h4>运营安排</h4><Notes rows={[["可采用的做法",op.suitable],["先具备的条件",op.conditions],["不宜照搬",op.avoid]]}/><Back view="operations" id={'operations-'+p.id} label={p.name+'运营档案'} navigate={navigate}/></section>}
    {oc&&<section><h4>运营案例的启发</h4><Notes rows={[["可参考的做法",oc.takeaway.learn],["先具备的条件",oc.takeaway.prerequisites],["不宜照搬",oc.takeaway.avoid]]}/><div className="study-refs">{oc.sources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}</a>)}</div></section>}
    {p.deep?.tradeoffs.map(t=><section key={t.title}><h4>{t.title}</h4><Notes rows={[["建议怎么做",t.action],["理由",t.reason],["需要投入",t.cost],["何时调整",t.signal]]}/></section>)}
    {rv&&<section><h4>使用与服务条件</h4><Notes rows={[["可以尝试",rv.adoption.usableNow],["需要先具备",rv.adoption.prerequisites],["还未验证",rv.adoption.notProven]]}/></section>}
    {bu&&<section><h4>收费模式带来的取舍</h4>{bu.implications.map((v,i)=><p key={i}>{v}</p>)}</section>}
    {su&&<section><h4>内容供需中的尝试线索</h4><p>{su.opportunity}</p>{su.counterexample&&<p className="muted">{su.counterexample}</p>}<Back view="content-demand" id={'cd-platform-'+p.id} label={p.name+'供给与消费记录'} navigate={navigate}/></section>}
    <MovedNotes id={p.id}/>
    <Back view={p.id} label={p.name+'完整档案与来源'} navigate={navigate}/>
   </details>;
  })}</section>)}
 </details>
 <details id="adoption-content" className="research-appendix"><summary>内容投入与组织方式</summary><ContentPriorities/><FrameworkContentPlanning/><MovedNotes id="content"/>{operating.guide.slice(0,1).map(g=><section key={g.title}><h3>{g.title}</h3><p>{g.text}</p></section>)}<MovedNotes id="operations"/><Back view="content" label="内容形式与页面样本" navigate={navigate}/></details>
 <details id="adoption-audience" className="research-appendix"><summary>用户研究对内容选择的启发</summary>{[...audience.communityImplications,...china.implications].map((x,i)=><section key={i}><h3>{x.title}</h3><p>{x.text}</p></section>)}{china.sections.filter(s=>s.id==='meaning').map(s=><section key={s.id}><h3>{s.title}</h3>{s.paragraphs.map((p,i)=><p key={i}>{p.text}</p>)}{s.tables.map(t=><div className="table-wrap" key={t.title}><h4>{t.title}</h4><table><thead><tr>{t.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{t.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>)}</section>)}<MovedNotes id="china-users"/><MovedNotes id="data"/><Back view="data" label="公开数据与估计方法" navigate={navigate}/><Back view="audience" label="平台用户与需求" navigate={navigate}/><Back view="china-users" label="中国AI用户规模与分层" navigate={navigate}/></details>
 <details id="adoption-topics" className="research-appendix"><summary>历史、科普、连载与教学：怎样尝试</summary>{themes.dossiers.map(t=>{const c=closure.cases.find(x=>x.id===t.id);return <section key={t.id}><h3>{t.name}</h3><Notes rows={[["用户需要",t.purpose],["内容形式",t.form],["持续分工",t.role],["具体展示",t.carrier],["社区可能补充什么",t.increment],["第一份内容",t.supply],["再次访问的理由",t.return],["下一步核对",t.next],["需要补充的条件",t.human]]}/>{c&&<section><h4>重点作品核对后，尝试范围怎么收窄</h4><p>{c.headline}</p><Notes rows={[["展示方式",c.carrier],["供给分工",c.supply],["第一次交付",c.next]]}/></section>}<Back view="content-demand" id={'tc-'+t.id} label={t.name+'作品、评论与已有供给'} navigate={navigate}/></section>;})}<p>{themes.next.human}</p><p>{themes.next.experiment}</p><p>{closure.next}</p></details>
 <details className="research-appendix"><summary>其他题材、评论诉求与试做条件</summary><details className="study-sources"><summary>六类消费任务的尝试</summary><ComparisonPlanning/></details><details className="study-sources"><summary>从评论看内容和合作职责</summary><PanelPlanning/></details><details className="study-sources"><summary>从成片看供给分工</summary><CasesPlanning/></details><details className="study-sources"><summary>细分题材与尝试条件</summary><EcosystemPlanning/><DepthPlanning/></details><MovedNotes id="content-demand"/><Back view="content-demand" label="作品、互动与供给记录" navigate={navigate}/></details>
 <details id="adoption-task-plan" className="research-appendix"><summary>商品图合作与试用设想</summary><p>这是备选任务的试用计划，尚未执行；不能据此把社区方向定为商品制作。</p><ProductTaskIdeas/><ProductTaskPlanning/><Back view="tasks" label="商品图样本与用户讨论" navigate={navigate}/></details>
 <details id="adoption-tools" className="research-appendix"><summary>工具、合作与投入条件</summary>{businessInsights.map((x,i)=>{const ps=i===0||i===2?x.paragraphs.slice(1):i>=3?x.paragraphs:[];return ps.length?<section key={x.title}><h3>{x.title}</h3>{ps.map((p,j)=><p key={j}>{p}</p>)}<div className="study-refs">{x.refs.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}</a>)}</div></section>:null;})}<ToolModelPlanning/><FrameworkPlanning navigate={navigate}/><Back view="discussion" label="18个平台的工具关系" navigate={navigate}/></details>
 <details id="adoption-report" className="research-appendix"><summary>综合判断与待讨论问题</summary>{report.sections.filter(s=>s.id==='implications').map(s=><section key={s.id}><h3>{s.title}</h3><p>{s.answer}</p>{s.claims.map(c=><section key={c.title}><h4>{c.title}</h4><p>{c.text}</p><p>{c.basis}</p><div className="study-refs">{c.sources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.title}</a>)}</div></section>)}</section>)}{report.sections.flatMap(s=>s.comparisons||[]).map(c=><section key={c.id}><h3>{c.title}</h3><Notes rows={[["可借鉴",c.adoption],["要承担的工作",c.requirement],["还需确认",c.missing]]}/></section>)}<MovedNotes id="report"/><ol>{report.discussionQuestions?.map(x=><li key={x}>{x}</li>)}</ol><Back view="report" label="竞品调研报告" navigate={navigate}/></details>
</section>;}
