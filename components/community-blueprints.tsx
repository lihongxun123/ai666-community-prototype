'use client';
import {useEffect,useState} from 'react';
import data from '@/lib/community-blueprints.json';
import {ServiceLayers} from './service-layers';
type Block={id:string;title:string;intro?:string;paragraphs?:string[];headers?:string[];rows?:string[][]};
type Blueprint={id:string;title:string;position:string;promise:string;roles:string;journey:string[];sections:Block[];sources:string[][]};
const plans=data as Blueprint[];
export function CommunityBlueprints(){const [selected,setSelected]=useState('practice');useEffect(()=>{const read=()=>{const id=new URLSearchParams(location.search).get('direction');setSelected(plans.some(p=>p.id===id)?id!:'practice');};read();window.addEventListener('popstate',read);return()=>window.removeEventListener('popstate',read);},[]);useEffect(()=>{if(location.hash.startsWith("#blueprint-")){requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({block:"start"}));}},[selected]);const plan=plans.find(p=>p.id===selected)||plans[0];return <>
<div className="ms-lead"><strong>围绕创作、应用与学习组织社区，让内容、工具和合作各自承接具体任务。</strong><p>各方向均为候选设计，页面与流程描述拟提供的服务；示例为虚构走读。服务对象可只阅读、收藏或使用资源，公开发布并非前提。纯娱乐观众不属于服务范围。周活用户数（WAU）仍是北极星，成本与周活评估另行进行。</p></div>
<section id="blueprint-comparison"><h2>共同能力与方向差异</h2><div className="ms-table"><table><thead><tr><th>方向</th><th>核心内容</th><th>需要维护的关系</th></tr></thead><tbody>
<tr><th>作品交流</th><td>作品与过程</td><td>作品归属、方法解释与同行反馈</td></tr><tr><th>资源复用</th><td>资源与运行条件</td><td>许可、版本、依赖与兼容反馈</td></tr><tr><th>行业实践</th><td>任务案例与结果</td><td>素材条件、验收标准与采用记录</td></tr><tr><th>学习成长</th><td>方法、练习与问题</td><td>学习目标、反馈范围与后续尝试</td></tr><tr><th>项目协作</th><td>项目与贡献</td><td>分工、交付、署名与退出</td></tr><tr><th>技术共建</th><td>技术资料与问题记录</td><td>环境复现、变更与维护责任</td></tr>
</tbody></table></div><p>可以共用账号、作者资料、主题标签、收藏、来源授权和举报处理。资源版本、学习进度、项目交付和技术问题状态分别设计，避免把所有内容塞进同一种帖子模板。</p><p>组合示例：作品交流＋资源＋学习；应用实践＋资源＋协作；技术共建＋资源＋学习。主任务决定入口，模块之间保留独立使用路径。</p><p className="ms-links"><a href="#blueprint-acquisition">触达与承接设计 ↓</a><a href="#blueprint-top">阅读方向详案 ↓</a></p></section>
<ServiceLayers/>
<nav className="blueprint-picker" aria-label="选择方向">{plans.map(p=><a key={p.id} aria-current={p.id===selected?'page':undefined} href={'?direction='+p.id+'#blueprint-top'} onClick={e=>{e.preventDefault();setSelected(p.id);history.pushState(null,'','?direction='+p.id+'#blueprint-top');document.getElementById('blueprint-top')?.scrollIntoView({block:'start'});}}>{p.title}</a>)}</nav>
<article id="blueprint-top"><h2>{plan.title}</h2><p>{plan.position}</p><p><strong>核心价值：</strong>{plan.promise}</p><p>{plan.roles}</p><ol className="blueprint-flow" aria-label="主要参与路径">{plan.journey.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,'0')}</span>{step}</li>)}</ol>
<nav className="ms-links blueprint-outline" aria-label="方案章节">{plan.sections.map((b,i)=><a href={'#blueprint-'+plan.id+'-'+b.id} key={b.id}>{i+1}. {b.title}</a>)}</nav>
{plan.sections.map(b=><section key={plan.id+b.id} id={'blueprint-'+plan.id+'-'+b.id}><h2>{b.title}</h2>{b.intro&&<p>{b.intro}</p>}{b.headers&&b.rows&&<div className="ms-table"><table><thead><tr>{b.headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{b.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th scope="row" key={j}>{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}{b.paragraphs?.map(p=><p key={p}>{p}</p>)}<a className="ms-caption" href="#blueprint-top">返回方案目录 ↑</a></section>)}
<section><h2>研究依据</h2><p className="ms-links">{plan.sources.map(([title,url])=><a href={url} target="_blank" rel="noopener noreferrer" key={url}>{title} ↗</a>)}</p><p className="ms-caption">来源用于解释任务和机制，不能替代本社区的使用效果验证。成本与周活效果另行评估，不用于提前筛除方向。</p></section></article>
<section id="blueprint-acquisition"><h2>怎样触达需要这些服务的人</h2><p>获客围绕创作和应用意图设计。入口承诺与落地内容一致，先让用户获得参考、方法或问题解释，再邀请收藏、参与或贡献。</p><div className="ms-table"><table><thead><tr><th>候选入口</th><th>提供什么</th><th>落地与后续</th></tr></thead><tbody>
<tr><th>制作教程与作者分享</th><td>经作者授权的过程补充、资源条件或排错说明</td><td>直达对应案例或方法；允许阅读后离开，保存与提问按需要选择</td></tr>
<tr><th>任务检索</th><td>围绕具体问题组织可检索内容，如商品图保文字、角色跨镜头一致性</td><td>打开匹配任务的案例，展示条件差异；没有答案时给出相近资料与需求入口</td></tr>
<tr><th>专业作者与资源维护者</th><td>有归属的作品集、资源说明、贡献和反馈记录</td><td>作者自愿引用自己的社区内容，使用者可查看上下文；不要求独家迁移</td></tr>
<tr><th>主题共学与项目共创</th><td>明确目标、输入要求、交付与反馈范围的参与说明</td><td>先看规则和示例，自愿参加；结束后保留授权成果与可复用经验</td></tr>
</tbody></table></div><p>这些是渠道与承接设计，触达效果尚未验证。站外发布遵循平台规则与作者授权，普通评论讨论不承担批量引流任务。</p></section>
<section><h2>如何从方向进入产品与运营定义</h2><p>先确定主要任务与服务承诺，再选择内容单元和供给关系，最后细化页面与处理流程。作品交流可以连接资源和学习；行业实践可以连接资源和协作；技术共建可以连接资源和学习。每个入口都应独立提供价值，跨模块参与由用户选择。</p><p>独立定位需要一个清楚的主要任务、一类有用的核心内容和能兑现的服务承诺；作为配套模块时，服务范围由它与主任务的衔接决定。六类方向都可比较，不预设同时建设，也不按未经测量的成本或周活效果排名。</p><p>交付物对应关系：内容规则转为投稿模板与编辑清单；运营流程转为责任分工与处理模板；页面表转为PRD输入；正常及失败案例转为走查场景。工具运行能力、作者合作与专业服务的实际可用条件需要单独确认。</p></section>
</>}
