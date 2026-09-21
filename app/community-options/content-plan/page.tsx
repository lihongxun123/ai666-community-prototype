import Link from '@/components/research-link';
import './content-plan.css';
const priorities=[
 ['重点组织','电商营销','主图、详情页与活动素材','先做完整样板；现有研究含发布流程、品类反馈和批量使用问题。','/community-options/cases/ecommerce#cases'],
 ['重点组织','视觉设计','主视觉与系列延展','已有系列项目参照，适合讨论统一与变化；可复用源文件另行取得。','/community-options/scenarios/design#brand-cases'],
 ['重点组织','写作编辑','按目标修改一篇稿子','已有改稿选择与互读线索，用来检验文字任务需要什么内容。','/community-options/scenarios/writing'],
 ['常规覆盖','本地经营','活动海报、菜单与上新宣传','沿用可解释的活动案例，突出价格、日期和门店信息。','/community-options/scenarios/local-business'],
 ['常规覆盖','人像影像','写真风格与局部修整','组织授权对照，展示哪些特征保留、哪些地方调整。','/community-options/scenarios/portrait'],
 ['常规覆盖','IP文创','角色设定与表情、动作','已有过程与问题线索；以具体产物组织，不以自动成套为前提。','/community-options/scenarios/ip'],
 ['开放贡献','角色故事','可连读片段与角色一致性','欢迎作者提供片段、设定和问题格，材料齐备再编排专题。','/community-options/scenarios/character'],
 ['开放贡献','知识内容','有出处的解释图文','优先接收带来源、图文核对的案例，再扩大主题。','/community-options/scenarios/knowledge'],
 ['开放贡献','职场学习','讲义、讲稿与资料整理','先接受已有材料支持的教学分支，企业汇报暂作方法参考。','/community-options/scenarios/work-learning'],
];
const ecommerce=[
 ['案例','一件商品，哪些图真正用得上？','展示原图、用途、采用图和舍弃理由。','先判断这套做法适不适合自己的商品。'],
 ['应用','先完成一张场景主图','用自己的原图试一种背景，说明适用品类。','进入“商品换景”，做出可检查的第一张。'],
 ['教程','换景后检查这几个地方','形状、文字、标志、颜色、数量与配件。','对照结果，定位需要保留或修改的部分。'],
 ['画布','把主图编成一张活动海报','可编辑区域与不可改的商品事实分清楚。','具备可用项目时进入MakeNow继续编排。'],
 ['工作流','多款商品怎样保持同一风格？','说明共用设置、单款例外和逐张检查。','需要重复制作时再选择批量路径。'],
 ['方法比较','同一原图，两种做法怎么选？','原图、目标和比较条件相同，展示差异与采用理由。','按自己的素材和用途选择方法。'],
 ['讨论','包装文字模糊，问题出在哪？','保留原图、结果、已试做法与相关资源。','去电商营销圈补充问题、阅读回复。'],
 ['案例','修改以后，为什么留下这一版？','交代修改位置与作者实际选择。','回看前面的检查方法，形成可借鉴经验。'],
];
const writing=[
 ['改稿对照','一段活动介绍，怎样缩短又不丢信息？','保留原文、修改目标、必留事实和作者采用理由。'],
 ['AI应用','按要求精简一段文字','提供用途、保留项与改写程度；示例说明变化，不承诺一次定稿。'],
 ['方法教程','先删重复，再调结构','用短片段解释每一次修改的理由。'],
 ['编辑材料','一张可复用的修改要求清单','读者、用途、语气和必留事实；适合文字任务的材料，无需强配画布。'],
 ['圈子讨论','这句话改得顺，但还是我的意思吗？','围绕具体句段和上下文互读，由作者决定采用。'],
];
const external={target:'_blank',rel:'noopener noreferrer'} as const;
export default function Page(){return <main className="cp-page">
<header><Link href="/community-options/concept-overview">← 方案一概念</Link><Link href="/#strategy">研究室目录</Link></header>
<div className="cp-intro"><small>方案一 / 内容建议</small><h1>让用户找到内容后，<br/>知道接下来怎么做。</h1><p>九类场景继续覆盖，先把电商营销、视觉设计和写作编辑组织得更完整。</p><span>基于站内已有研究整理，供当前选择；不是市场排名，也不是上线内容清单。</span></div>
<nav aria-label="本页目录"><Link href="#priorities">内容布局</Link><Link href="#ecommerce">电商样板</Link><Link href="#writing">写作对照</Link><Link href="#selection">推荐标准</Link><Link href="#placement">放在哪里</Link></nav>
<section id="priorities"><small>01 / 内容布局</small><h2>先做深三类，其余保持开放</h2><p>这里区分平台主动编排的力度，不关闭任何场景。每个领域都可投稿；单篇好内容可以进入推荐，不必等整个专题齐全。</p>
<div className="cp-levels"><article><h3>重点组织</h3><p>主动串起案例、方法与制作入口，形成一条清楚的任务路径。</p></article><article><h3>常规覆盖</h3><p>围绕已有可靠材料补充，不要求每个任务集齐所有内容形式。</p></article><article><h3>开放贡献</h3><p>先收具体作品、经验和问题；有连续材料后再加深编排。</p></article></div>
<div className="cp-table"><table><thead><tr><th>建议力度</th><th>场景与任务</th><th>为何这样安排</th><th>已有依据</th></tr></thead><tbody>{priorities.map(([level,name,task,reason,url])=><tr key={name}><td>{level}</td><th>{name}<span>{task}</span></th><td>{reason}</td><td><Link href={url} {...external}>查看 ↗</Link></td></tr>)}</tbody></table></div>
<p className="cp-note">重点专题、常规覆盖与开放贡献分别对应不同的内容投入。排序依据材料成熟度、任务差异和概念承接；未测量各领域市场规模或供需缺口。</p>
<Link href="/community-options/content-system#editorial-plan" {...external}>九类专题取舍依据 ↗</Link></section>
<section id="ecommerce"><small>02 / 代表样板</small><h2>电商营销：从一件商品到一组可用素材</h2><p>面向要自己制作素材的商家、设计师与内容人员。先完成一张图，再按用途扩展海报或批量；不要求每个人从头读完专题。</p>
<div className="cp-route"><span>明确用途</span><b>→</b><span>看案例</span><b>→</b><span>选方法</span><b>→</b><span>制作与检查</span><b>→</b><span>继续调整</span></div>
<div className="cp-cards">{ecommerce.map(([type,title,body,next],i)=><article key={title}><div className="cp-card-top"><span>{type}</span><small>0{i+1}</small></div><h3>{title}</h3><p>{body}</p><p className="cp-next">{next}</p></article>)}</div>
<p className="cp-note">以上八项是拟组织的内容，不是八份已备妥的资产。同一篇案例可包含方法和对照，专题只维护关联。应用、工作流和画布是否可用，以实际资源为准。</p>
<div className="cp-two"><article><h3>先让这四件事成立</h3><p>一个有过程的案例、一条可尝试的制作路径、一份针对结果的检查方法，以及提问入口。素材尚未取得许可时，保留原来源与方法介绍。</p></article><article><h3>已有材料支持到哪里</h3><p>站内收录了厂商披露的商品发布流程、批量预设及使用者反馈，支持按用途、品类和修改组织内容。本站可发布的原图、工程与实际采用对照，还需分别取得。</p><Link href="/community-options/cases/ecommerce#cases" {...external}>案例与证据范围 ↗</Link></article></div>
<Link href="/community-options/concept-overview">查看专题概念稿 →</Link></section>
<section id="writing"><small>03 / 差异检验</small><h2>写作编辑：有用，体现为改得有理由</h2><p>用户要的是保留原意、适合读者的文字。主图和套图不是核心，原文、改动与作者选择才是。</p>
<div className="cp-cards">{writing.map(([type,title,body])=><article key={title}><span className="cp-tag">{type}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
<div className="cp-table"><table><thead><tr><th>比较项</th><th>电商营销</th><th>写作编辑</th></tr></thead><tbody>
<tr><th>先看什么</th><td>商品原图、用途与成果</td><td>原文、读者与修改目标</td></tr><tr><th>核心材料</th><td>图片、版式、应用与工作流</td><td>原文对照、修改约束与编辑工具</td></tr><tr><th>怎样检查</th><td>商品事实、文字、视觉与用途</td><td>原意、事实、结构与语气</td></tr><tr><th>讨论什么</th><td>某处效果为什么不合适</td><td>哪段改动有帮助，哪些应保留</td></tr></tbody></table></div>
<p>共同的是“案例—方法—使用—讨论”的关系；各场景优先组织的内容形式不同。写作无需为了形式齐全而加入工作流或MakeNow画布。</p>
<Link href="/community-options/scenarios/writing" {...external}>写作任务与对照材料 ↗</Link> · <Link href="/community-options/review#increment" {...external}>方法比较与互读线索 ↗</Link></section>
<section id="selection"><small>04 / 推荐标准</small><h2>好看能吸引点开，有用让人继续</h2><div className="cp-levels">
<article><h3>任务清楚</h3><p>看得出为谁解决什么问题，以及需要什么输入。标题不只写“超强神器”。</p></article>
<article><h3>有可借鉴的部分</h3><p>方法、比较、取舍、素材或问题至少有一项具体价值；不强制每篇作者投稿都写成完整教程。</p></article>
<article><h3>有真实的下一步</h3><p>能继续读、尝试或交流。推荐入口说明条件；没有文件时就看方法，不伪装成可下载资源。</p></article></div>
<p>作品可以单独分享，也可以仅交流创作意图。专题优先收录与任务有关的部分，不把全部创作内容都改造成教程。</p>
<p className="cp-note">失效方法停止推荐并说明适用范围；未验证的生成效果不写成成果保证。热点和新工具可以成为选题线索，不能代替具体用途。</p></section>
<section id="placement"><small>05 / 对应产品</small><h2>一份内容，可以从多个地方被找到</h2><div className="cp-table"><table><thead><tr><th>入口</th><th>组织什么</th><th>用户接着做什么</th></tr></thead><tbody>
<tr><th>发现</th><td>代表作品、实用资源与精选专题</td><td>进入内容或专题</td></tr><tr><th>专题</th><td>同一任务的案例、方法和资源</td><td>选择路径，尝试制作</td></tr><tr><th>AI应用</th><td>按用途展示的应用</td><td>直接使用</td></tr><tr><th>圈子</th><td>教程、讨论、求助与案例交流</td><td>阅读、提问、分享</td></tr></tbody></table></div>
<p>一篇教程可以同时被圈子和专题引用，不另发两份。应用和工作流也可以被多个任务收录，原资源与作者归属保持清楚。</p></section>
<footer><h2>内容编排建议</h2><p>保留九类覆盖；先围绕电商营销、视觉设计和写作编辑主动组织。以电商样板检验内容是否能接着用，以写作样板避免把所有场景套成图片制作。</p><p className="cp-note">运营分工涵盖作者合作、专题维护与圈子答疑。</p><Link href="/community-options/operation-plan">查看运营建议 →</Link> · <Link href="/community-options/concept-overview">返回方案一概念 →</Link></footer>
</main>}
