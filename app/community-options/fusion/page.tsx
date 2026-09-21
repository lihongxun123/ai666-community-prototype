import Link from '@/components/research-link';
import '../options.css';
import './fusion.css';

const modules = [
 ['发现','找到值得看、值得用的内容','活动 Banner＋四专题','九类场景横向展开','作品、应用、工作流、画布与经验混排'],
 ['专题','围绕任务，把内容和工具组织齐','专题总览 → 电商营销等专题','按任务找案例、应用与方法','关联教程、常见问题、圈子与共学'],
 ['AI应用','选择方法，开始制作','按用途、输入与结果筛选','详情呈现效果、条件与使用入口','关联工作流与 MakeNow 画布'],
 ['圈子','围绕共同任务持续交流','圈子总览 → 电商设计等圈子','作品研讨、问题互助、教程经验','共学项目：练习、提交与点评'],
 ['模型广场','查找和使用模型','模型分类与搜索','模型详情、来源、版本与效果示例','关联适用应用与使用入口'],
];
const journeys = [
 {id:'making',title:'用工具制作营销图',goal:'商家有商品原图，需要一组可用于推广的图片。',steps:[
 ['选择方法','发现 / 电商营销专题 → 应用详情','对照案例，确认原图要求、包装文字处理方式和输出规格。','效果对照、输入说明、适用条件'],
 ['制作与检查','应用详情 → 对应制作工具','上传有使用权的素材，比较生成结果，核对商品外观、文字和画面用途。','AI应用、工作流或 MakeNow 画布'],
 ['使用与求助','保存结果；遇到问题 → 电商圈子','下载合适的图片。文字变形时，先查同资源的问题记录，再选取可公开的图片求助；收到建议后回到工具修改。','结果文件、问题记录、可公开的方法关联']
 ],outcome:'完成可用的营销图；作品和原始素材由作者选择是否公开。',href:'/community-options/cases/ecommerce/journey',link:'电商营销路径'},
 {id:'writing',title:'借助方法改好一篇文章',goal:'作者已有初稿，希望表达更清楚，同时保留自己的观点和语气。',steps:[
 ['看懂改法','发现 / 写作专题 → 修改对照','比较原文与改稿，判断方法解决的是结构、冗余还是语气问题。','原文与改稿、修改理由、适用说明'],
 ['修改自己的稿件','方法详情 → 合适的文字工具','确定本次修改目标，在惯用编辑器或文字类应用中处理稿件，逐项核对事实和表达。','修改要求、文字类应用、检查清单'],
 ['定稿或讨论','作者定稿；有争议的段落 → 写作圈子','作者决定保留哪些修改。需要意见时，只公开选定段落和具体疑问，参考回应后自行定稿。','定稿、段落讨论、作者取舍']
 ],outcome:'得到作者认可的稿件；完整原文可以始终保留在自己的工具中。',href:'/community-options/scenarios/writing#reading-plan',link:'写作内容与方法'},
 {id:'discussion',title:'带着已有作品找同行研讨',goal:'创作者已有一张海报，想讨论构图是否准确表达了主题。',steps:[
 ['发起研讨','相关圈子 → 发布作品 / 已有作品 → 开放研讨','选择作品，说明创作意图，圈定希望讨论的部分。作品可以来自站外制作工具。','作品、创作意图、具体问题'],
 ['获得具体反馈','作品研讨 → 同行回应','回应者围绕指定部分给出理由和参考。主持人维护讨论范围，按需邀请相关作者参与。','局部标注、参考作品、修改建议'],
 ['作者决定后续','研讨 → 保留原作或发布修订','作者决定是否修改，愿意时补充新版本与取舍理由。等待回应期间可以继续创作。','原作、可选修订版、讨论记录']
 ],outcome:'获得可供取舍的创作意见；保留原作同样是完整结果。',href:'/community-options/proposals/c',link:'创作者研讨方案'}
];
type ConceptImage={src:string;title:string;note:string};
type ConceptGroup={id:string;code:string;name:string;description:string;href:string;images:ConceptImage[]};
const conceptGroups:ConceptGroup[]=[
 {id:'a',code:'A',name:'任务创作的共享页面',description:'沿用任务创作方案的页面，连接发现、专题、应用、作品与圈子。',href:'/community-options/concept-overview',images:[
  {src:'/proposal-one/home-v8-card-spacing.png',title:'发现首页',note:'从内容卡片进入任务或资源。'},
  {src:'/proposal-one/topics-index-v1.png',title:'专题首页',note:'按创作任务查找内容。'},
  {src:'/proposal-one/topic-ecommerce-v1.png',title:'电商营销专题',note:'案例、方法和应用围绕同一任务编排。'},
  {src:'/proposal-one/ai-apps-v3-combined.png',title:'AI 应用列表',note:'按用途选择制作入口。'},
  {src:'/proposal-one/app-product-scene-before-v1.png',title:'表单生成',note:'适合有明确素材和目标的制作。'},
  {src:'/proposal-one/app-local-edit-selection-v1.png',title:'局部编辑',note:'处理局部修改需求。'},
  {src:'/proposal-one/app-writing-input-v1.png',title:'文字文档',note:'承接写作编辑任务。'},
  {src:'/proposal-one/app-batch-scene-before-v1.png',title:'批量处理',note:'处理同类素材的批量任务。'},
  {src:'/proposal-one/app-video-input-v1.png',title:'音视频',note:'承接音视频制作输入。'},
  {src:'/proposal-one/app-steps-input-v1.png',title:'分步任务',note:'将复杂制作拆成步骤。'},
  {src:'/proposal-one/app-product-scene-result-v1.png',title:'生成结果',note:'比较结果后决定下一步。'},
  {src:'/proposal-one/work-case-detail-v1.png',title:'作品详情',note:'理解成果、作者与可公开做法。'},
  {src:'/proposal-one/workflow-detail-v1.png',title:'工作流详情',note:'查看可复用的处理过程。'},
  {src:'/proposal-one/circles-index-v1.png',title:'圈子首页',note:'按共同任务进入交流。'},
  {src:'/proposal-one/circle-home-v1.png',title:'电商营销圈',note:'围绕具体场景沉淀经验。'},
  {src:'/proposal-one/circle-post-detail-v1.png',title:'帖子详情',note:'承接教程、讨论和求助。'}
 ]},
 {id:'b',code:'B',name:'项目共学',description:'选取从进入项目、推进练习到获得反馈的页面，作为融合中“按需参加共学”的能力参考。',href:'/community-options/proposals/b',images:[
  {src:'/proposal-options/b-home-differentiated.png',title:'共学项目首页',note:'先继续已有练习，再发现可加入项目。'},
  {src:'/proposal-options/b-project-v2.png',title:'项目任务板',note:'用检查点推进同一练习。'},
  {src:'/proposal-options/b-feedback-v3.png',title:'同伴反馈与主理人点评',note:'反馈关联到当前检查点。'}
 ]},
 {id:'c',code:'C',name:'创作者研讨',description:'选取作品、限定讨论和作者取舍，作为融合中作品交流与同行研讨的能力参考。',href:'/community-options/proposals/c',images:[
  {src:'/proposal-options/c-work-v2.png',title:'作品详情与创作意图',note:'讨论前先明确作者想表达什么。'},
  {src:'/proposal-options/c-discussion-v2.png',title:'限定研讨页',note:'围绕指定片段或问题回应。'},
  {src:'/proposal-options/c-versions-v2.png',title:'版本与作者取舍页',note:'记录采用、保留或放弃的选择。'}
 ]},
 {id:'d',code:'D',name:'方法共建',description:'选取条件判断、版本变化和维护动作，作为融合中方法可用性与更新机制的能力参考。',href:'/community-options/proposals/d',images:[
  {src:'/proposal-options/d-method.png',title:'方法条目与运行条件',note:'判断输入、依赖、许可和适用性。'},
  {src:'/proposal-options/d-versions-v3.png',title:'版本差异与兼容状态',note:'说明旧方法为何不能直接复用。'},
  {src:'/proposal-options/d-maintain-v2.png',title:'维护者更新与替代方法',note:'公开维护范围和迁移路径。'}
 ]},
 {id:'e',code:'E',name:'问题互助',description:'选取提问、条件化建议和结果回填，作为融合中处理具体卡点的能力参考。',href:'/community-options/proposals/e',images:[
  {src:'/proposal-options/e-ask-v2.png',title:'结构化提问页',note:'补齐目标、材料和已尝试步骤。'},
  {src:'/proposal-options/e-compare-v2.png',title:'建议对照与适用条件',note:'比较建议依据、条件和风险。'},
  {src:'/proposal-options/e-result-v4.png',title:'采用结果与相似问题归并',note:'把建议、尝试和结果分开记录。'}
 ]}
];
export default function Page(){return <main className="op-shell fusion-page">
 <header className="op-top"><Link href="/#overview">多元拾光 / 研究室</Link><div><Link href="/community-options">五套方案</Link><Link href="/research-brief">简版研究报告</Link></div></header>
 <section className="op-hero"><span>融合方案 / 产品概念</span><h1>围绕创作任务，<br/>连接方法、工具与同行。</h1><p>以任务创作为主线，保留作品交流；把共学、互助和方法维护放到用户需要它们的地方。</p><nav><Link href="#value">为什么融合</Link><Link href="#journey">用户如何使用</Link><Link href="#architecture">信息架构</Link><Link href="#connections">内容与运营</Link><Link href="#home">概念图集</Link></nav></section>
 <section id="value" className="op-section"><span>01 / 方案重心</span><h2>按任务组织内容与入口</h2><p>做营销图、设计角色、学习一种表现方法，都要回答三个问题：什么方法适合我，在哪里动手，结果不满意时怎么改。融合方案围绕这三个问题安排内容与入口。</p><div className="fusion-links"><article><h3>找得到方法</h3><p>专题按任务整理案例、教程和应用，说明需要什么素材、适合什么结果。</p></article><article><h3>接得上制作</h3><p>从案例进入相关应用、工作流或 MakeNow 画布。作品保留可公开的方法关联，方便再次使用。</p></article><article><h3>找得到交流对象</h3><p>作品连到作者与研讨，具体问题连到资源与圈子。想系统练习的人再参加共学。</p></article></div><div className="op-callout"><h3>五种能力如何组合</h3><p>任务创作连接找方法与动手制作；作品研讨允许作者直接带作品来交流。共学由主理人组织，方法由维护者更新，互助围绕具体问题展开。</p></div><p><Link href="/community-options/review">查看竞品与案例依据 →</Link> · <Link href="/community-options">比较五套方案 →</Link></p></section>
 <section id="journey" className="op-section"><span>02 / 使用场景</span><h2>制作、改稿、研讨，从各自的需要出发</h2>
 <div className="fusion-paths">{journeys.map(path=><article id={path.id} className="fusion-path" key={path.id}><h3>{path.title}</h3><p className="fusion-path-goal">{path.goal}</p><ol>{path.steps.map(([title,place,action,content],i)=><li key={title}><span className="fusion-step">{i+1}</span><div><h4>{title}</h4><p className="fusion-place">{place}</p><p>{action}</p><p className="fusion-material"><b>所需内容</b>{content}</p></div></li>)}</ol><p className="fusion-outcome">{path.outcome}</p><Link href={path.href}>{path.link} →</Link></article>)}</div>
 <p className="fusion-note">制作入口随任务选择；工具间的素材传递、项目保存与结果回传，取决于对应工具的接入能力。</p>
 <div className="fusion-links"><article><h3>专题负责整理</h3><p>编辑把案例、方法和应用按任务编排。用户在这里比较和选择，再进入工具或具体讨论。</p></article><article><h3>圈子承接交流</h3><p>作者发起研讨或求助，同行回应，主持人组织共学。相关讨论链接回原作品、方法或应用。</p></article><article><h3>同一内容，多个专题引用</h3><p>一篇电商海报案例可同时进入电商营销与视觉设计专题，共用原内容、作者署名和更新记录。</p></article></div>
 <p><Link href="/community-options/content-system#editorial-plan">查看专题内容配置 →</Link></p></section>
 <section id="architecture" className="op-section"><span>03 / 信息架构</span><h2>五个入口，各有明确用途</h2><div className="fusion-map">{modules.map(([name,purpose,...items])=><article key={name}><h3>{name}</h3><p>{purpose}</p><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div><div className="fusion-rail"><b>全局服务</b><span>搜索 · 活动中心 · AI商城 · 邀请有礼 · 我的／积分／签到</span></div><p>「我的」收纳作品、制作项目、收藏、练习和关注的问题。搜索覆盖内容、应用、工作流、模型与作者；推荐面板提供历史、热门搜索、活动和应用入口。</p></section>
 <section id="connections" className="op-section"><span>04 / 内容与运营</span><h2>平台负责组织，作者与同行共同完善</h2><div className="fusion-links"><article><h3>编辑组织专题</h3><p>围绕具体任务选择案例，配齐应用、教程和常见问题；把圈子中的好回答与作品收进专题，并检查入口是否仍可用。</p></article><article><h3>维护者更新方法</h3><p>作者、资源维护者与资料编辑共同补充来源、版本和适用条件；应用注明所依赖的模型。复现与改进建议归到对应资源，更新时提示相关方法重新核对。</p></article><article><h3>圈子主持交流</h3><p>将求助归到相关任务与资源，邀请有经验的人回应；组织作品点评与共学，把有效回答整理为可查阅的内容，并保留贡献者署名。</p></article></div><div className="op-callout"><h3>一条电商案例怎样持续完善</h3><p>作者提供商品原图、效果对照与做法；编辑核对素材条件，把案例、应用和教程编入电商营销专题。用户遇到包装文字变形，可关联原应用向圈子求助。同行给出建议后，维护者核对适用条件，再补入资源说明，保留回应者署名；修复结果由用户另行反馈。</p></div><div className="op-table"><table><thead><tr><th>方案能力</th><th>在社区中的位置</th></tr></thead><tbody>{[['A 任务创作','发现、专题与制作主路径'],['B 项目共学','圈子中的共学项目，专题按需推荐'],['C 创作者研讨','作品内容与作者入口，圈子中的作品研讨'],['D 方法共建','应用、工作流、教程的版本与维护'],['E 问题互助','圈子中的求助，以及资源详情中的问题反馈']].map(([a,b])=><tr key={a}><th>{a}</th><td>{b}</td></tr>)}</tbody></table></div></section>
 <section id="home" className="op-section"><span>05 / 概念图集</span><h2>首页与核心页面</h2><p>首页呈现整体组织；其余概念稿按任务创作、共学、研讨、维护与互助分组，说明各项能力的页面设计。</p><figure className="fusion-art fusion-home-art"><a href="/proposal-fusion/home-v2.png" target="_blank" rel="noopener noreferrer"><img src="/proposal-fusion/home-v2.png" alt="融合方案首页：单行导航、等宽 Banner 与四专题、多比例内容卡片" /></a><figcaption><span>融合首页</span><a href="/proposal-fusion/home-v2.png" target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure><p>Banner 与四专题只出现在发现页。卡片标明内容形式：应用看使用量，作品看互动，问题看回应；共学和维护信息在相关内容中出现。</p><div id="concepts" className="fusion-concepts" aria-label="融合方案概念稿图集">{conceptGroups.map(group=><section id={'concept-'+group.id} className="fusion-concept-group" key={group.id}><div className="fusion-concept-head"><div><span>{group.code} / 能力参考</span><h3>{group.name}</h3></div><div><p>{group.description}</p><Link href={group.href}>查看对应方案说明 →</Link></div></div><div className="fusion-concept-grid">{group.images.map(image=><figure key={image.src}><a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={'查看'+image.title+'原图'}><img src={image.src} alt={group.name+' · '+image.title+'概念稿'} loading="lazy" /></a><figcaption><strong>{image.title}</strong><span>{image.note}</span><a href={image.src} target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure>)}</div></section>)}</div></section>
 <footer className="op-footer"><Link href="/community-options">返回五套方案 →</Link> · <Link href="/community-options/library">研究依据 →</Link></footer>
 </main>}
