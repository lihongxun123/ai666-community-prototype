import Link from '@/components/research-link';
import '../options.css';
import './fusion.css';

const modules = [
 ['首页','浏览作品，直接开始创作','轻创作输入与四个快捷入口','Banner、专题组合与场景分类','多比例作品与应用卡片'],
 ['专题','围绕任务，把内容和工具组织齐','专题总览 → 电商营销等专题','按任务找案例、应用与方法','关联教程、常见问题、圈子与共学'],
 ['AI应用','选择方法，开始制作','按场景和任务选择应用','详情呈现效果、条件与使用入口','关联工作流与 MakeNow 画布'],
 ['圈子','围绕兴趣、作品和问题交流','圈子总览 → 电商设计等圈子','作品研讨、问题互助、教程经验','共学项目：练习、提交与点评'],
 ['模型广场','进入现有模型服务','保留既有入口','模型选择与使用由原服务承接','模型社区能力另行确定'],
];
const journeys = [
 {id:'making',title:'用工具制作营销图',goal:'商家有商品原图，需要一组可用于推广的图片。',steps:[
 ['直接试用','发现中的应用 → 制作入口','看到合适的效果，确认需要什么原图后上传素材；需要比较其他做法时再进入电商营销专题。','效果示例、必要输入、使用入口'],
 ['制作与检查','应用详情 → 对应制作工具','上传有使用权的素材，比较生成结果，核对商品外观、文字和画面用途。','AI应用、工作流或 MakeNow 画布'],
 ['使用与求助','保存结果；遇到问题 → 电商圈子','下载合适的图片。文字变形时，先查同资源的问题记录，再选取可公开的图片求助；收到建议后回到工具修改。','结果文件、问题记录、可公开的方法关联']
 ],outcome:'完成可用的营销图；作品和原始素材由作者选择是否公开。',href:'/community-options/cases/ecommerce/journey',link:'电商营销路径'},
 {id:'writing',title:'借助方法改好一篇文章',goal:'作者已有初稿，希望表达更清楚，同时保留自己的观点和语气。',steps:[
 ['开始改稿','发现中的文字应用 → 输入稿件','选择精简、结构或语气等修改目标，输入愿意交给工具处理的段落；想了解改法时再看修改对照。','修改目标、输入框、可选示例'],
 ['修改自己的稿件','文字应用或惯用编辑器','确定本次修改目标，在惯用编辑器或文字类应用中处理稿件，逐项核对事实和表达。','修改要求、文字类应用、检查清单'],
 ['定稿或讨论','作者定稿；有争议的段落 → 写作圈子','作者决定保留哪些修改。需要意见时，只公开选定段落和具体疑问，参考回应后自行定稿。','定稿、段落讨论、作者取舍']
 ],outcome:'得到作者认可的稿件；完整原文可以始终保留在自己的工具中。',href:'/community-options/scenarios/writing#reading-plan',link:'写作内容与方法'},
 {id:'discussion',title:'带着已有作品找同行研讨',goal:'创作者已有一张海报，想讨论构图是否准确表达了主题。',steps:[
 ['发起研讨','相关圈子 → 发布作品 / 已有作品 → 开放研讨','选择作品，说明创作意图，圈定希望讨论的部分。作品可以来自站外制作工具。','作品、创作意图、具体问题'],
 ['获得具体反馈','作品研讨 → 同行回应','回应者围绕指定部分给出理由和参考。主持人维护讨论范围，按需邀请相关作者参与。','局部标注、参考作品、修改建议'],
 ['作者决定后续','研讨 → 保留原作或发布修订','作者决定是否修改，愿意时补充新版本与取舍理由。等待回应期间可以继续创作。','原作、可选修订版、讨论记录']
 ],outcome:'获得可供取舍的创作意见；保留原作同样是完整结果。',href:'/community-options/proposals/c',link:'创作者研讨方案'}
];
type ConceptImage={id?:string;src:string;title:string;note:string};
type ConceptGroup={id:string;code:string;name:string;description:string;href:string;images:ConceptImage[]};
const conceptGroups:ConceptGroup[]=[
 {id:'a',code:'A',name:'任务创作的共享页面',description:'专题、应用详情、作品与圈子的能力参考。',href:'/community-options/concept-overview',images:[
  {src:'/proposal-fusion/audit-topics-index-v1.png',title:'专题首页',note:'按创作任务查找内容。'},
  {src:'/proposal-fusion/audit-topic-ecommerce-v2.png',title:'电商营销专题',note:'案例、方法和应用围绕同一任务编排。'},
  {src:'/proposal-fusion/apps-index-v4.png',title:'AI应用首页',note:'精选应用与场景分组；卡片进入应用，「查看全部」进入对应分类。'},
  {src:'/proposal-fusion/apps-ecommerce-v1.png',title:'电商营销应用分类',note:'从应用首页进入，按换背景、精修等任务选择应用。'},
  {id:'concept-use',src:'/proposal-fusion/app-background-v2.png',title:'应用详情与使用',note:'上传白杯原图，选择奶油棚拍与 1:1；生成后在同页查看结果。'},
  {id:'concept-result',src:'/proposal-fusion/audit-app-background-result-v1.png',title:'生成结果',note:'核对杯身与背景，下载或保存到我的；继续编辑、分享和求助均由用户选择。'},
  {id:'concept-records',src:'/proposal-fusion/my-results-v1.png',title:'我的生成记录',note:'从「我的」或结果页进入，找到已保存的白杯图片；继续制作回到原应用并恢复对应输入与设置。'},
  {src:'/proposal-one/app-local-edit-selection-v1.png',title:'局部编辑',note:'处理局部修改需求。'},
  {src:'/proposal-one/app-writing-input-v1.png',title:'文字文档',note:'承接写作编辑任务。'},
  {src:'/proposal-fusion/audit-batch-v1.png',title:'批量处理',note:'处理同类素材的批量任务。'},
  {src:'/proposal-one/app-video-input-v1.png',title:'视频生成',note:'输入图片与运动要求，生成后播放和下载视频。'},
  {src:'/proposal-one/app-steps-input-v1.png',title:'分步任务',note:'将复杂制作拆成步骤。'},
  {src:'/proposal-one/work-case-detail-v1.png',title:'作品详情',note:'理解成果、作者与可公开做法。'},
  {src:'/proposal-fusion/audit-workflow-detail-v1.png',title:'工作流详情',note:'查看可复用的处理过程。'},
  {src:'/proposal-one/circles-index-v1.png',title:'圈子首页',note:'按兴趣与创作需要进入交流。'},
  {src:'/proposal-fusion/audit-circle-home-v1.png',title:'电商营销圈',note:'围绕具体场景沉淀经验。'},
  {src:'/proposal-one/circle-post-detail-v1.png',title:'帖子详情',note:'承接教程、讨论和求助。'}
 ]},
 {id:'services',code:'入口与发布',name:'搜索、作者与发布',description:'找到公开内容，认识作者，主动分享自己的成果。',href:'/community-options/fusion/structure',images:[
  {src:'/proposal-fusion/search-panel-v1.png',title:'搜索推荐面板',note:'词语去结果，精选应用与专题直接去详情。'},
  {src:'/proposal-fusion/search-results-v1.png',title:'搜索结果',note:'按类型查看公开内容；私人结果与草稿不进入搜索。'},
  {src:'/proposal-fusion/author-profile-v1.png',title:'作者主页',note:'展示公开作品、应用与方法、讨论；不展示私人生成记录。'},
  {src:'/proposal-fusion/publish-work-v1.png',title:'作品发布',note:'带入成图和应用关联，检查公开预览后主动发布。'}
 ]},
 {id:'b',code:'B',name:'项目共学',description:'选取从进入项目、推进练习到获得反馈的页面，作为融合中“按需参加共学”的能力参考。',href:'/community-options/proposals/b',images:[
  {src:'/proposal-options/b-home-differentiated.png',title:'共学项目首页',note:'先继续已有练习，再发现可加入项目。'},
  {src:'/proposal-fusion/audit-b-project.png',title:'项目任务板',note:'用检查点推进同一练习。'},
  {src:'/proposal-fusion/audit-b-feedback.png',title:'同伴反馈与主理人点评',note:'反馈关联到当前检查点。'}
 ]},
 {id:'c',code:'C',name:'创作者研讨',description:'选取作品、限定讨论和作者取舍，作为融合中作品交流与同行研讨的能力参考。',href:'/community-options/proposals/c',images:[
  {src:'/proposal-options/c-work-v2.png',title:'作品详情与创作意图',note:'讨论前先明确作者想表达什么。'},
  {src:'/proposal-options/c-discussion-v2.png',title:'限定研讨页',note:'围绕指定片段或问题回应。'},
  {src:'/proposal-fusion/audit-c-versions.png',title:'版本与作者取舍页',note:'记录采用、保留或放弃的选择。'}
 ]},
 {id:'d',code:'D',name:'方法共建',description:'选取条件判断、版本变化和维护动作，作为融合中方法可用性与更新机制的能力参考。',href:'/community-options/proposals/d',images:[
  {src:'/proposal-fusion/audit-d-method-v2.png',title:'方法条目与运行条件',note:'判断输入、依赖、许可和适用性。'},
  {src:'/proposal-fusion/audit-d-versions.png',title:'版本差异与兼容状态',note:'说明旧方法为何不能直接复用。'},
  {src:'/proposal-fusion/audit-d-maintain.png',title:'维护者更新与替代方法',note:'公开维护范围和迁移路径。'}
 ]},
 {id:'e',code:'E',name:'问题互助',description:'选取提问、条件化建议和结果回填，作为融合中处理具体卡点的能力参考。',href:'/community-options/proposals/e',images:[
  {src:'/proposal-fusion/audit-e-ask.png',title:'结构化提问页',note:'补齐目标、材料和已尝试步骤。'},
  {src:'/proposal-fusion/audit-e-compare.png',title:'建议对照与适用条件',note:'比较建议依据、条件和风险。'},
  {src:'/proposal-options/e-result-v4.png',title:'采用结果与相似问题归并',note:'把建议、尝试和结果分开记录。'}
 ]}
];
export default function Page(){return <main className="op-shell fusion-page">
 <header className="op-top"><Link href="/#overview">多元拾光 / 研究室</Link><div><Link href="/community-options">五套方案</Link><Link href="/research-brief">简版研究报告</Link></div></header>
 <section className="op-hero"><span>融合方案 / 产品概念</span><h1>先动手创作，<br/>再找到方法与同行。</h1><p>看到喜欢的效果可以直接试用；需要方法或帮助时，再进入专题与交流。</p><nav><Link href="#value">为什么融合</Link><Link href="#journey">用户如何使用</Link><Link href="#architecture">信息架构</Link><Link href="#connections">内容与运营</Link><Link href="/community-options/fusion/gallery">完整概念图集</Link><Link href="/community-options/fusion/structure">页面与路径</Link></nav></section>
 <section id="value" className="op-section"><span>01 / 方案重心</span><h2>首页轻松开始，内容按需深入</h2><p>有想法，直接输入并创作；被作品吸引，查看表达与制作方法；遇到具体任务，再找应用或专题。教程与讨论按需要展开。</p><div className="fusion-links"><article><h3>看到效果，直接试用</h3><p>应用卡片标明用途和使用入口，详情先呈现效果、所需素材与操作。阅读教程不作为使用前提。</p></article><article><h3>想再改好，找到方法</h3><p>专题整理案例、修改方法和常见问题。用户需要比较、排错或学习时再深入，制作由适合任务的工具承接。</p></article><article><h3>看见作品，也看见作者</h3><p>保留创作想法、兴趣表达与日常交流。分享作品无需附带完整教程，制作结果也可以只保存自用。</p></article></div><div className="op-callout"><h3>五种能力如何组合</h3><p>任务创作连接找方法与动手制作；作品研讨允许作者直接带作品来交流。共学由主理人组织，方法由维护者更新，互助围绕具体问题展开。</p></div><p><Link href="/community-options/review">查看竞品与案例依据 →</Link> · <Link href="/community-options">比较五套方案 →</Link></p></section>
 <section id="journey" className="op-section"><span>02 / 使用场景</span><h2>制作、改稿、研讨，从各自的需要出发</h2>
 <div className="op-callout"><h3>已有想法，直接开始</h3><p>首页输入想法 → 生成结果 → 保存或继续编辑。只有想分享时才发布作品；找方法、加入圈子和阅读教程都不是前提。</p></div>
 <div id="cup-path" className="op-callout"><h3>一只白杯，从制作到再次使用</h3><p><Link href="#concept-use">上传白杯原图</Link> → 选择奶油棚拍、1:1 → <Link href="#concept-result">核对生成结果</Link> → 保存到我的 → <Link href="#concept-records">再次打开记录</Link>。</p><p>下载后可以结束；想调整就回到原应用。保存与发布分开：只有主动分享或求助时，才进入公开内容的编辑与确认。</p><Link href="#sharing-path">分享与求助如何承接 →</Link></div>
 <div className="fusion-paths">{journeys.map(path=><article id={path.id} className="fusion-path" key={path.id}><h3>{path.title}</h3><p className="fusion-path-goal">{path.goal}</p><ol>{path.steps.map(([title,place,action,content],i)=><li key={title}><span className="fusion-step">{i+1}</span><div><h4>{title}</h4><p className="fusion-place">{place}</p><p>{action}</p><p className="fusion-material"><b>所需内容</b>{content}</p></div></li>)}</ol><p className="fusion-outcome">{path.outcome}</p><Link href={path.href}>{path.link} →</Link></article>)}</div>
 <p className="fusion-note">制作入口随任务选择；工具间的素材传递、项目保存与结果回传，取决于对应工具的接入能力。</p>
 <div className="fusion-links"><article><h3>专题负责整理</h3><p>编辑把案例、方法和应用按任务编排。用户在这里比较和选择，再进入工具或具体讨论。</p></article><article><h3>圈子承接交流</h3><p>作者发起研讨或求助，同行回应，主持人组织共学。相关讨论链接回原作品、方法或应用。</p></article><article><h3>同一内容，多处引用</h3><p>一件作品可出现在首页、专题和圈子，仍指向同一详情，共用作者署名、评论和更新记录。</p></article></div>
 <p><Link href="/community-options/content-system#editorial-plan">查看专题内容配置 →</Link></p></section>
 <section id="architecture" className="op-section"><span>03 / 信息架构</span><h2>五个入口，各有明确用途</h2><div className="fusion-map">{modules.map(([name,purpose,...items])=><article key={name}><h3>{name}</h3><p>{purpose}</p><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div><div className="fusion-rail"><b>全局服务</b><span>搜索 · 活动中心 · AI商城 · 邀请有礼 · 我的／积分／签到</span></div><p>「我的」集中查找自己的结果、作品与收藏。搜索连接内容、应用和作者，推荐面板提供历史与精选入口；模型搜索由现有模型服务承接。</p></section>
 <section id="content-relations" className="op-section"><h2>结果、作品与讨论，各有归属</h2><div className="fusion-links"><article><h3>结果先留给自己</h3><p>生成结果默认私有，主动保存后进入「我的／生成记录」。下载只拿走文件；收藏应用只保留应用入口。这些操作都不等于公开发布。</p></article><article><h3>作品可以只表达</h3><p>图片、文字与创作想法即可组成作品。方法、资源、研讨和修改记录按需附加，不要求每次分享都写完整教程。</p></article><article><h3>讨论关联原内容</h3><p>从应用或作品求助，关联具体资源；素材由用户选择公开。回答链接到可尝试的方法，尝试结果补回原问题。</p></article></div><p>专题整理任务与资源，圈子组织人与交流。共学属于圈内项目，方法更新属于资源详情，建议对比与回访属于同一个问题。</p></section>
 <section id="sharing-path" className="op-section"><h2>分享作品，或带着问题交流</h2><div className="fusion-links"><article><h3>保存后继续制作</h3><p>打开白杯记录，回到「商品换背景」，恢复这次的输入和设置。再次生成保留原结果；若原素材不可用，先提示重新上传。</p></article><article><h3>分享作品</h3><p>从结果或记录进入作品发布，带入选中的成图与应用关联。用户补充标题和想法，确认后发布；原图和完整生成参数不默认公开。选择圈子时引用同一作品。</p></article><article><h3>去圈子求助</h3><p>进入电商营销圈的提问编辑，关联「商品换背景」。用户说明“杯身纹理怎样保留”，选择公开的图片；检查预览后发布。回答与后续尝试都留在同一问题下。</p></article></div><p>MakeNow 采用下载后手动导入；回原应用继续制作时恢复原素材与设置。两种路径分开，不预设自动同步。</p></section>
 <section id="connections" className="op-section"><span>04 / 内容与运营</span><h2>先做好少量专题，让内容持续可用</h2><p>内容可以覆盖多个兴趣与场景，重点维护集中在有稳定供给的专题。卡片上区分应用与作品：应用说明用途，作品保留作者表达；不要求每位作者同时提供教程、工作流和答疑。</p><div className="fusion-links"><article><h3>编辑组织专题</h3><p>先选择能直接使用的应用和有表达的作品。重点专题补充必要的案例与常见问题，检查入口；其他领域按已有可靠内容覆盖。</p></article><article><h3>维护者更新方法</h3><p>优先使用作者授权或允许引用的材料，保留来源。重点资源记录适用条件和更新时间；失效时撤下推荐或给出替代入口，不承诺全站资源持续代维护。</p></article><article><h3>圈子主持交流</h3><p>围绕作品、兴趣和具体问题组织交流，按需邀请相关作者。点评与共学在有人承接时开展，互助不承诺即时回应或保证解决。</p></article></div><div className="op-callout"><h3>一条电商案例怎样持续完善</h3><p>作者提供商品原图、效果对照与做法；编辑核对素材条件，把案例、应用和教程编入电商营销专题。用户遇到包装文字变形，可关联原应用向圈子求助。同行给出建议后，维护者核对适用条件，再补入资源说明，保留回应者署名；修复结果由用户另行反馈。</p></div><p>先观察新用户能否顺利开始并保存结果，再看是否回来创作、关注作者或参与交流。使用、互动和复访分别记录，不能用点赞或一次试用代替持续参与。</p><div className="op-table"><table><thead><tr><th>方案能力</th><th>在社区中的位置</th></tr></thead><tbody>{[['A 任务创作','发现、专题与制作主路径'],['B 项目共学','圈子中的共学项目，专题按需推荐'],['C 创作者研讨','作品内容与作者入口，圈子中的作品研讨'],['D 方法共建','应用、工作流、教程的版本与维护'],['E 问题互助','圈子中的求助，以及资源详情中的问题反馈']].map(([a,b])=><tr key={a}><th>{a}</th><td>{b}</td></tr>)}</tbody></table></div></section>
 <section id="home" className="op-section"><span>05 / 概念图集</span><h2>首页与核心页面</h2><p><Link href="/community-options/fusion/gallery">浏览完整社区概念稿：创作、内容、交流、活动与个人服务 →</Link></p><p><Link href="/community-options/fusion/structure">搜索、发布、MakeNow 与六类应用的页面关系 →</Link></p><p>从首页直接创作，或进入专题、应用与圈子。各页按需要进入，无须依次经过。</p><figure className="fusion-art fusion-home-art"><a href="/proposal-fusion/home-v5-light-creation.png" target="_blank" rel="noopener noreferrer"><img src="/proposal-fusion/home-v5-light-creation.png" alt="融合方案首页：轻创作、快捷入口、专题组合与多比例卡片" /></a><figcaption><span>融合首页</span><a href="/proposal-fusion/home-v5-light-creation.png" target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure><p>首页保留轻创作、四个快捷入口、Banner和专题组合。卡片支持横图、方图与竖图，标题、作者和互动在悬停时呈现；应用保留类型标识。</p><div id="concepts" className="fusion-concepts" aria-label="融合方案概念稿图集">{conceptGroups.map(group=><section id={'concept-'+group.id} className="fusion-concept-group" key={group.id}><div className="fusion-concept-head"><div><span>{group.code} / 能力参考</span><h3>{group.name}</h3></div><div><p>{group.description}</p><Link href={group.href}>查看对应方案说明 →</Link></div></div><div className="fusion-concept-grid">{group.images.map(image=><figure id={image.id} key={image.src}><a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={'查看'+image.title+'原图'}><img src={image.src} alt={group.name+' · '+image.title+'概念稿'} loading="lazy" /></a><figcaption><strong>{image.title}</strong><span>{image.note}</span><a href={image.src} target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure>)}</div></section>)}</div></section>
 <footer className="op-footer"><Link href="/community-options">返回五套方案 →</Link> · <Link href="/community-options/library">研究依据 →</Link></footer>
 </main>}
