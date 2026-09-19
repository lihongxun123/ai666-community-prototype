'use client';
import data from '@/lib/candidate-comparison.json';
import './market-social.css';
export function CandidateComparison(){return <div className="ms-report" id="candidate-comparison">
<div className="ms-lead"><strong>{data.decision}</strong><p>服务对象按参与目的区分：创作、应用、学习、贡献或协作。浏览、阅读和收藏都是合理的参与方式，公开发布并非使用前提。纯娱乐观看不属于社区服务范围。</p></div>
<nav className="ms-links" aria-label="候选方向"><a href="/domain-research#research-conclusions" target="_blank" rel="noopener noreferrer">研究依据 ↗</a>{data.options.map(o=><a key={o.id} href={'/?section=candidate-'+o.id+'#strategy'} onClick={e=>{e.preventDefault();document.getElementById('candidate-'+o.id)?.scrollIntoView({block:'start'});}}>{o.name}</a>)}</nav>
<p className="ms-links"><a href="/community-blueprints" target="_blank" rel="noopener noreferrer">阅读完整方向蓝图：内容、运营、产品与业务关系 ↗</a></p><section><h2>六类方向，各自解决什么问题</h2><div className="ms-grid three">{data.options.map(o=><article key={o.id}><h3>{o.name}</h3><p>{o.first}</p><p className="ms-caption">{o.audience}</p></article>)}</div><p>电商、故事、空间等是应用领域；模型、作品、教程是内容形式。社区定位由主要任务和服务关系决定。</p></section>
{data.options.map(o=><section key={o.id} id={'candidate-'+o.id}><h2>{o.name}</h2><p>{o.audience}</p><p><a href={"/community-blueprints?direction="+o.id} target="_blank" rel="noopener noreferrer">阅读该方向完整蓝图 ↗</a></p><div className="ms-table"><table><tbody>{[['核心内容',o.content],['产品路径（候选）',o.path],['再次使用的理由（假设）',o.repeat],['供给与运营',o.supply],['参与各方的权责',o.business],['成立条件与关键问题',o.risk]].map(([k,v])=><tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table></div><p className="ms-links">{o.sources.map(([name,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</p></section>)}
<section id="candidate-combinations"><h2>如何组合成一个社区</h2><p>建议围绕共同任务连接内容与功能，让用户从需要的环节进入。六类方向是设计选项，是否独立成站或作为模块取决于服务承诺。</p><div className="ms-table"><table><thead><tr><th>组合示例</th><th>共同任务</th><th>内容与功能的连接</th></tr></thead><tbody>
<tr><th>作品交流＋资源复用＋学习</th><td>完成一项创作</td><td>作品关联方法和资源，方法关联练习及问题；用户可只找灵感，也可深入制作。</td></tr>
<tr><th>行业实践＋资源复用＋协作</th><td>完成实际应用任务</td><td>案例呈现结果要求，资源说明执行条件，协作承接多人完成的部分。</td></tr>
<tr><th>技术共建＋资源复用＋学习</th><td>使用并改进AIGC工具</td><td>技术文档连接资源版本、使用问题与贡献记录，入门材料帮助理解和使用。</td></tr>
</tbody></table></div><p>组合时共用主题、任务和作者信息；作品讨论、技术排错和合作交付分别保留必要字段与规则。用户无需按固定顺序经过所有环节。</p></section>
<section><h2>研究如何进入方案</h2><p>15家竞品用于比较分类、资源、工具、学习和共建机制；抖音、小红书、B站用于理解作品面向的市场需求、创作者供给和应用场景。社媒观看量与评论不直接代表本社区用户需求。</p><p>方案继续细化内容示例、作者参与方式、运营流程、页面承接和异常处理。成本与周活效果另行评估，不用于提前排除方向。</p><p className="ms-caption">{data.date} · 以上为基于研究提出的设计选项；引用档案提供机制依据，各方案的使用效果尚待验证。</p></section>
</div>}
