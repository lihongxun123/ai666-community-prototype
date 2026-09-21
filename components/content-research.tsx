'use client';
import {useMemo,useState} from 'react';
import raw from '@/lib/content-research.json';
import type {ContentPlatform,ContentResearch} from '@/lib/content-research-types';

const research=raw as ContentResearch;
const sourceMap=new Map(research.platforms.flatMap(p=>p.sources).map(s=>[s.id,s]));
const accessLabel={page:'详情页面',index:'列表/索引摘录',listing:'浏览器目录卡片'};
const codeLabel={yes:'有可识别说明',no:'已核验未提供',unknown:'未确认'};
const indicators=[['inputDetail','输入 / 参数'],['procedureDetail','操作说明'],['limitsExplained','限制 / 失败处理']] as const;
const refs=(ids:string[])=> <span className="content-refs">{ids.map(id=>{const s=sourceMap.get(id);return s?<a href={s.url} target="_blank" rel="noreferrer" key={id} title={s.title}>[{id}]</a>:null})}</span>;
const total=research.platforms.reduce((n,p)=>n+p.records.length,0);
const pages=research.platforms.reduce((n,p)=>n+p.records.filter(r=>r.access==='page').length,0);

const tasks=[
 {name:'已有商品原图，制作白底图或场景主图',person:'有产品素材、需要上架或换季换场景的运营、设计人员；职业身份尚未访谈确认。',evidence:'三家均有上传产品图、替换背景、调整光影的操作说明。白底输入、遮罩、边缘与产品保真是反复出现的约束。主要是作者供给证据。',test:'第一批试验优先做两种窄任务：白底精修、场景替换。用户带自己的脱敏素材，先写清尺寸、保真部位和使用位置。',limit:'尚未证实需求频次、市场规模或支付意愿。不能把搜索命中数量当成市场需求。',refs:['RH-S03','RH-S26','LL-S13','LL-S17','TA-S51','TA-S52']},
 {name:'长详情页可裁切，且卖点真实',person:'正在制作电商详情、涉及主图或多语言页面的使用者。评论支持具体任务，无法据此确认企业规模。',evidence:'同一Liblib模板的讨论出现清晰度、列宽、商品卖点与多颜色信息重复；至少两条讨论链有再次尝试后的自述。',test:'作为第二阶段方向：先确定每屏宽度、文案审核和裁切方式；拆成单屏交付，再验证整套一致性。',limit:'8条问题记录集中于一个模板，部分属于同一人。未验证真实上线、转化提升或付费。',refs:['LL-B-S01']},
 {name:'连续分镜、动作迁移与口播',person:'有参考视频、角色或脚本的内容制作者；当前证据主要来自工作流说明。',evidence:'分镜案例解释画面描述与控制参数取舍；动作迁移说明参考图与原视频匹配要求。',test:'先作为备选任务收集真实素材与交付标准。图片小任务跑通后，再用一条短视频验证时间与失败成本。',limit:"生成链较长，未运行；样本里有教程和课程导流，不能据此推算视频需求规模。",refs:['RH-S28','TA-S14']},
 {name:'修复失败，降低再次尝试的成本',person:'已实际尝试、能描述输入和错误的人；更接近可访谈的种子用户。',evidence:'可见小尺寸图片报错、低显存替代方案、背景边缘处理，以及4K试错顾虑。',test:'每个案例附失败排查页；记录每次尝试原因、实际成本和人工修正时间。用作者能否排障来筛选合作。',limit:'公开作者描述不等于当前故障可复现；用户自述昂贵也不等于已付款。',refs:['TA-S37','TA-S55','LL-S22','LL-B-S01']}
];
const supply=[
 {name:'LL-B-A01：详情页及商品图系列',seen:'已核验公开作品页与历史答疑链。作者针对裁切、卖点、提示词给建议；用户有再试用反馈。',buy:'优先核实合作意愿。委托一个窄任务：原素材、参数、失败示例、验收说明，以及一轮用户答疑。',gap:'作品页未读到发布日期；最近已读实质回复为8月4日。许可字段与正文限制不一致，合作前需书面澄清。',refs:['LL-B-S01','LL-B-S02']},
 {name:'RunningHub：素材与失败边界较清楚的作者',seen:'RH-A01、A08、A14、A15对应的样本提供白底图、批量/高清开关、显存或参考素材说明。',buy:'优先比较能否用陌生商品复现，并说明何时应停止重试。采购教学和排障交付。',gap:'分组来自公开署名线索，未完全核验唯一主页；未取得用户回复链和近期连续发布。',refs:['RH-S01','RH-S14','RH-S26','RH-S28']},
 {name:'Liblib：换背景与手表等细分工作流作者',seen:'SDXL/FLUX换背景与手表换手模案例说明遮罩、输入条件、在线节点及低显存取舍。',buy:'让作者围绕一种商品给出成功与失败边界；旧版到新版的区别也要讲清。',gap:'V1/V2可能属于同一内容家族；版本多不等于需求多，也不代表愿意持续供稿。',refs:['LL-S13','LL-S17','LL-S22']},
 {name:'吐司 / Tensor.Art：步骤与故障说明型作者',seen:'国内电商系列有多个任务；海外产品换背景有输入步骤，SUPIR有具体报错及采样器替换说明。',buy:'优先委托适配当下模型的一次更新；确认说明仍有效，再谈持续合作。',gap:"不少维护日期为2024–2025年；未证明近30日稳定供给、他人复用成功或跨站同一作者身份。",refs:['TA-S37','TA-S51','TA-S52','TA-L03']}
];
const acquisition=[
 {entry:'具体教程下的任务型讨论',signal:'给出自己的输入、输出规格或失败，并在建议后再次反馈。',route:'先整理匿名问题类型；后续由运营经授权发布招募或联系愿意参与者，以解决这一次任务为入口。',measure:'有效报名 → 真实素材与明确交付 → 首次采用 → 下一次真实任务。每步记录人数与流失原因。',refs:['LL-B-S01']},
 {entry:'细分模板与作者作品页',signal:'同一任务有系列内容，说明条件和限制，能针对反馈修正。',route:'先约一次小额样例合作，再由作者在自己的渠道自愿招募4名任务使用者；入口单独标记。',measure:'合格案例数、陌生素材复现、答疑时间、第二次交付；不以作者粉丝数代替。',refs:['LL-B-S02','LL-S17','TA-L03']},
 {entry:'B站、小红书等外部教程入口',signal:'教程题目明确写商品、素材和交付规格，评论有实际操作问题。',route:'围绕同一真实案例给出可验证的前后对照与失败条件，引导填写任务报名；不要用领取积分作首要承诺。',measure:'按内容与渠道分别记录合格任务率、采用率、运营工时；目前没有外部渠道转化数据。',refs:['RH-S13','RH-S28','LL-S06','LL-S17']},
 {entry:'现有积分用户中的任务筛选',signal:'能说明近期任务、提供素材、接受交付标准，并且有下一次制作计划。',route:'在已有用户中先做任务招募；将只有领券动作的人与愿意完成实际任务的人分开记录。',measure:'奖励领取、实际生成、合格导出、采用、再次任务分别记；补贴成本纳入账本。',refs:[]}
];

export function ContentOverview({onSelect}:{onSelect:(id:string)=>void}){
 return <div className="content-report">
  <div className="page-heading"><h1>商品图任务的需求与交付条件</h1></div>
  <div className="content-verdict"><h2>商品图样本说明输入条件，也暴露交付限制。</h2><p>已读案例包括白底图、背景替换和详情页制作，讨论涉及清晰度、列宽、文案准确性和多款商品组织。这些材料支持任务要求与作者答疑，不能证明商品图内容需求大于连载创作或API使用。</p>{refs(['LL-B-S01','LL-S13','TA-S52'])}</div>
  <div className="data-highlights"><div><span>按站点及内容ID去重</span><strong>{total} 条</strong><small>三家任务与目录样本，不是随机样本</small></div><div><span>读到详情页面</span><strong>{pages} 条</strong><small>只有可识别说明才编码为“有”</small></div><div><span>重点讨论拆解</span><strong>{research.comments.length} 条问题记录</strong><small>集中于一个模板，不是8个独立用户</small></div></div>
  <nav className="article-toc" aria-label="研究章节">{[['content-scope','采到了什么'],['content-tasks','任务需求表'],['content-comments','具体讨论'],['content-supply','内容与作者'],['content-ledger','逐条样本']].map(([id,label])=><a key={id} href="#tasks" onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}}>{label}</a>)}</nav>
  <section id="content-scope"><h2>样本覆盖：三家的入口并不相同</h2><p>Liblib样本来自图片模型的最新、最热、搜索入口，各20条；RunningHub主要来自定向搜索；国内吐司从推荐中筛选任务，海外Tensor.Art读取推荐前20条。后两家未取得可核验的最新或热门排序，不能比较平台优劣。</p>
   <div className="table-wrap"><table className="content-table"><thead><tr><th>平台</th><th>去重后内容</th><th>访问层次</th><th>实际取得的入口与缺口</th></tr></thead><tbody>{research.platforms.map(p=><tr key={p.platformId}><th><button className="text-button" onClick={()=>onSelect(p.platformId)}>{p.name} ↗</button></th><td>{p.records.length}条</td><td>{p.records.filter(r=>r.access==='page').length}条详情<br/>{p.records.filter(r=>r.access==='index').length}条列表/索引<br/>{p.records.filter(r=>r.access==='listing').length}条仅目录卡片</td><td>{p.streams.map(s=><details className="content-stream" key={s.id}><summary>{s.label}：{s.observed}/{s.requested}</summary><p>{s.limitation}</p><a href={s.entryUrl} target="_blank" rel="noreferrer">原入口 ↗</a></details>)}</td></tr>)}</tbody></table></div>
   <p className="data-scope-note">分子/分母为实际记录/计划记录，允许定向探索超过20。Liblib的23条检索与60张目录卡片合为83项，其中1张卡片继续深读；深读不是额外第84项。国内吐司与海外Tensor.Art分域观察，不相加成用户数。旧版本与新版本若使用不同内容ID仍保留，但不作为两种独立需求。</p>
   <h3>多少样本提供了可识别的说明？</h3><p>下面只计算读到详情页面的样本。字段“有”表示找到了相关说明，尚不等于教程完整或用户能够复现。“未确认”保留为未知，不计算成内容缺失。</p><div className="content-quality">{research.platforms.map(p=><Quality key={p.platformId} platform={p}/>)}</div>
   <p className="muted">三家采样入口与任务构成不同；Liblib样本偏向操作型工作流。样本成功使用、结果采用和持续供给未获独立验证；Tensor.Art示例未核视觉效果。</p>
  </section>
  <section id="content-tasks"><h2>任务需求表：供给线索与用户问题分别看</h2><div className="table-wrap"><table className="content-table content-wide"><thead><tr><th>任务 / 候选使用者</th><th>具体证据</th><th>还不能下的结论</th></tr></thead><tbody>{tasks.map(t=><tr key={t.name}><th>{t.name}<small>{t.person}</small></th><td>{t.evidence}{refs(t.refs)}</td><td>{t.limit}</td></tr>)}</tbody></table></div></section>
  <section id="content-comments"><h2>使用者还有什么问题，作者怎样回答</h2><p>以下为同一详情页模板的8条问题记录，均为转述。页面显示在线生成17.0k、讨论76、作品展示59；这些数值分别包含重复生成、作者回复与原作者作品，不能解释为17,000位用户或59位成功复用者。{refs(['LL-B-S01'])}</p>
   <div className="content-comment-list">{research.comments.map(c=><article key={c.id}><div className="content-comment-meta"><span>{c.id}</span><span>提问 {c.postedAt}</span></div><h3>{c.topic}</h3><dl><dt>使用者描述</dt><dd>{c.problem}</dd><dt>作者如何回应</dt><dd>{c.response}{c.replyAt&&<small>所引回复：{c.replyAt}</small>}</dd><dt>后来是否解决</dt><dd>{c.followup}</dd></dl><p className="data-scope-note">{c.status} {refs([c.sourceId])}</p></article>)}</div>
   <p className="data-scope-note">两条讨论链有再次尝试的自述，可用于识别任务、输入与失败原因，不能证明稳定留存。尚无私下访谈、实际文件验收或真实上线证据；可见排序影响样本，也无法覆盖沉默与流失的用户。</p>
  </section>
  <section id="content-supply"><h2>作者提供了什么，哪些情况还不清楚</h2><p>可以形成候选线索，尚没有可直接认定为稳定供稿者的名单。匿名代号用于回到公开来源核对；同名分组、跨站身份和近期档期均需后续确认。</p><div className="table-wrap"><table className="content-table content-wide"><thead><tr><th>线索</th><th>已观察到什么</th><th>尚未确认</th></tr></thead><tbody>{supply.map(s=><tr key={s.name}><th>{s.name}</th><td>{s.seen}{refs(s.refs)}</td><td>{s.gap}</td></tr>)}</tbody></table></div>

   <details className="data-sources"><summary>查看各平台作者观察与原始缺口</summary>{research.platforms.map(p=><div key={p.platformId}><h3>{p.name}</h3>{p.authors.map(a=><article className="content-author" key={a.key}><strong>{a.key}</strong>{a.profileUrl&&<a href={a.profileUrl} target="_blank" rel="noreferrer"> 公开作品页 ↗</a>}<p>{a.maintenanceEvidence}</p><p>{a.replyEvidence}</p><p className="data-scope-note">{a.limitation}</p>{refs(a.refs)}</article>)}</div>)}</details>
  </section>


  <section id="content-ledger"><h2>逐条样本与原始页面</h2><Ledger/></section>
  <section><h2>影响判断的资料缺口</h2><p>资料不足以确认这三家的付费人数、真实收入、获客成本、用户职业分布、内容成功率和留存。专业流量工具能补访问路径与受众估计；创作者合作与自愿任务记录，才能继续接近“谁愿意持续用、为什么用”。</p></section>
 </div>
}

function Quality({platform:p}:{platform:ContentPlatform}){const rows=p.records.filter(r=>r.access==='page');return <article><h3>{p.name}</h3><p className="data-scope-note">本组分母：{rows.length}条详情</p>{indicators.map(([key,title])=>{const yes=rows.filter(r=>r[key]==='yes').length;const unknown=rows.filter(r=>r[key]==='unknown').length;return <div className="content-quality-row" key={key}><div><span>{title}</span><strong>{yes}/{rows.length}</strong></div><div className="content-quality-track" aria-label={`${title}：${yes}条有说明，${unknown}条未确认`}><span style={{width:`${rows.length?100*yes/rows.length:0}%`}}/></div><small>有说明{yes}条 · 未确认{unknown}条</small></div>})}</article>}

function Ledger(){
 const [platform,setPlatform]=useState('all');const [access,setAccess]=useState('all');const [query,setQuery]=useState('');const [limit,setLimit]=useState(20);
 const records=useMemo(()=>research.platforms.filter(p=>platform==='all'||p.platformId===platform).flatMap(p=>p.records.map(r=>({...r,platformName:p.name,streams:p.streams}))).filter(r=>(access==='all'||r.access===access)&&`${r.id} ${r.title} ${r.task} ${r.taskEvidence}`.toLowerCase().includes(query.trim().toLowerCase())),[platform,access,query]);
 return <><div className="content-controls"><label>平台<select value={platform} onChange={e=>{setPlatform(e.target.value);setLimit(20)}}><option value="all">三个平台</option>{research.platforms.map(p=><option key={p.platformId} value={p.platformId}>{p.name}</option>)}</select></label><label>访问层次<select value={access} onChange={e=>{setAccess(e.target.value);setLimit(20)}}><option value="all">全部层次</option>{Object.entries(accessLabel).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>搜索任务或样本编号<input placeholder="如：换背景、LL-B01" value={query} onChange={e=>{setQuery(e.target.value);setLimit(20)}}/></label></div><p className="data-scope-note">匹配{records.length}条 · 当前展示{Math.min(limit,records.length)}条。展开可看编码、访问限制与原始计数。</p>{records.slice(0,limit).map(r=><details className="content-record" key={r.id}><summary><span>{r.id} · {r.title}</span><small>{r.platformName} · {accessLabel[r.access]}</small></summary><p>{r.taskEvidence}</p><dl><dt>采样入口</dt><dd>{r.streamIds.map(id=>r.streams.find(s=>s.id===id)?.label||id).join('；')}</dd><dt>说明编码</dt><dd>{indicators.map(([key,label])=><span className="content-code" key={key}>{label}：{codeLabel[r[key]]}</span>)}{r.access!=='page'&&<small>目录与索引编码不进入详情统计。</small>}</dd><dt>复用证据</dt><dd>{r.reuseNote}</dd><dt>访问与时间边界</dt><dd>{r.evidenceNote}</dd></dl>{r.metrics.map((m,i)=><p key={i}>{m.label}：{m.value}<small> {m.scope}</small></p>)}<p><a href={r.url} target="_blank" rel="noreferrer">打开研究原页 ↗</a>采集{r.capturedAt} · {r.domain}</p></details>)}{records.length===0&&<p className="empty">没有匹配样本。可换关键词或调整筛选。</p>}{limit<records.length&&<button className="primary-button" onClick={()=>setLimit(limit+20)}>再显示20条</button>}</>
}

export function ContentProfile({id,onOpen}:{id:string;onOpen:()=>void}){const p=research.platforms.find(p=>p.platformId===id);if(!p)return null;return <section className="content-profile" id="content-observations"><div className="section-heading"><h2>内容、作者与任务</h2><span>{p.records.length}条去重样本</span></div><p>{p.scope}</p><Quality platform={p}/><p className="data-scope-note">“有说明”不等于已复现；未确认的字段保持未知。最新/热门排序、近期作者供给和他人采用的缺口见完整章节。</p><button className="text-button" onClick={onOpen}>查看任务、作者和评论记录 ↗</button></section>}

export function ProductTaskPlanning(){return <div><section id="content-acquisition"><h2>获客入口表：寻找正在做事的人</h2><p>入口存在不等于获客有效。本表列出可检验的小规模路径；尚未联系作者或用户，也未发布招募。</p><div className="table-wrap"><table className="content-table content-wide"><thead><tr><th>从哪里找</th><th>优先辨认什么</th><th>如何接到一次任务</th><th>怎样记录</th></tr></thead><tbody>{acquisition.map(a=><tr key={a.entry}><th>{a.entry}</th><td>{a.signal}{refs(a.refs)}</td><td>{a.route}</td><td>{a.measure}</td></tr>)}</tbody></table></div></section>
<section id="content-pilot"><details className="data-gaps"><summary>商品图试用构想：8人、未执行</summary><p>此处属于多元拾光自身的产品验证构想，不属于已取得的竞品证据。每组4人分别试白底精修和场景替换；一位作者准备案例，一位运营记录任务与答疑，产品负责交付验收。是否启动仍取决于后续方向判断。</p>
   <ol className="business-funnel"><li><strong>招募时核任务。</strong>记录过去一次制作时间、原来的方法、下一次用途；要求自愿提供可使用的脱敏素材与交付规格。愿意领积分可以保留记录，但不能直接计为有任务。</li><li><strong>首单核采用。</strong>记录原素材、尝试次数、生成成本、人工修改分钟数、是否达到约定尺寸与商品保真要求，以及是否被使用者采用。结果不合格也保留原因。</li><li><strong>第二单核主动性。</strong>观察下一次任务是否真的到来、是否主动回来、是否需要催促或额外奖励，以及能否换素材独立完成。没有到下次制作周期的人记为“尚未到期”。</li><li><strong>单独核社区帮助。</strong>记录哪条他人案例或答疑改变了结果、节省了什么；只有工具被再次使用，仍不足以证明社区内容有价值。</li><li><strong>再决定继续、改任务或招聘。</strong>若首单反复失败，先修案例；首单能采用却无人带第二个任务回来，核需求周期与替代方案。第二次任务与答疑负担反复出现，再讨论扩大内容供给。</li></ol>
   <div className="table-wrap"><table className="content-table"><thead><tr><th>要判断的事</th><th>分子与分母</th><th>如何避免误判</th></tr></thead><tbody><tr><th>报名有没有真实需求</th><td>有素材、明确用途与规格的人数 / 去重报名人数</td><td>每个渠道单列。未完成核实记待核实，展示原始人数。</td></tr><tr><th>第一次有没有做成</th><td>用户确认采用人数 / 已开始首单人数</td><td>把未完成、失败、仅觉得好看分开；合格导出与实际采用也分别记。</td></tr><tr><th>有没有第二次需求</th><td>主动带来第二个真实任务的人数 / 观察期内已到下次制作周期的人数</td><td>同时展示全体入组人数、尚未到期和失联人数，不能靠排除失败者抬高比例。</td></tr><tr><th>社区内容有没有帮助</th><td>明确指出案例或答疑帮助且可核对结果的人数 / 已开始任务人数</td><td>分别记录作者代做、运营指导与成员互助；不都记作自主复用。</td></tr><tr><th>供给是否值得持续采购</th><td>陌生素材下合格案例数、每单支持分钟数与全部成本</td><td>作者报酬、补贴、重试和人工修订都计入；不要只算Token。</td></tr></tbody></table></div>
   <p className="data-scope-note">8人用于寻找失败原因和下一次任务线索，不能估计市场转化率，也不适合做显著性比较。两周没有复访不自动等于没有需求；先核实实际制作周期。</p></details>
  </section></div>;}

export function ProductTaskIdeas(){return <section>   <div className="content-verdict"><h3>先合作一名能做案例、能排障的人</h3><p>短期缺少可检验的交付能力。一次案例合作应交代素材与授权、可运行步骤、成本与耗时、两类失败示例、陌生素材复现和一轮答疑。只有持续出现适配、答疑和更新工作，才据此确定招聘职责与工作量。</p><p>不宜只按成片数量结算。美观示例仍可能依赖手工修订、特定输入或过时模型；用户还要能用自己的素材完成任务。</p>{refs(['LL-B-S01','LL-S22','TA-S37'])}</div><h3>商品图任务与合作设想</h3>{tasks.map(t=><article key={t.name}><h4>{t.name}</h4><p>{t.test}</p><p className="muted">{t.limit}</p>{refs(t.refs)}</article>)}{supply.map(a=><article key={a.name}><h4>{a.name}</h4><p>{a.buy}</p><p className="muted">{a.gap}</p>{refs(a.refs)}</article>)}</section>;}
