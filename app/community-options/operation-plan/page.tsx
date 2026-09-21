import Link from '@/components/research-link';
import '../content-plan/content-plan.css';
const roles = [
 ['平台编辑','选择任务、邀请作者、核对材料、编排专题、维护推荐入口。','对专题是否清楚、入口是否可用负责。'],
 ['内容作者','提供作品、过程、取舍与允许公开的素材，补充适用条件。','对自己提交的内容和约定修改负责。'],
 ['应用与工作流维护者','说明输入要求、适用版本、常见故障，处理资源问题。','合作时单独约定维护范围；投稿本身不包含无限售后。'],
 ['圈子主持与参与者','主持人整理提问、邀请合适的人回复；成员分享经验和修改结果。','主持人可承担问题整理与回复邀请；是否持续跟进须先确认承接人。'],
];
const stages = [
 ['找人','从现有案例、圈子讨论和站内投稿寻找真正做过任务的人。','电商编辑邀请一位能提供原图、采用图和修改说明的作者。'],
 ['约定','先说清公开材料、署名、使用许可、修改范围与回报。','作者同意展示过程；源文件和商用复用另行约定。'],
 ['补齐','围绕用户下一步补材料，编辑协助整理表达。','案例已有成果，补上换景条件和文字检查方法即可。'],
 ['发布','原内容保留作者归属，专题引用并连接可用资源。','案例进入电商专题；应用进入应用目录；讨论回到电商圈。'],
 ['跟进','收集具体卡点，将共性问题补回内容。','出现包装文字问题，补充对照示例并关联讨论。'],
 ['再合作','根据材料质量、实际使用反馈和作者意愿决定继续邀请。','请作者补一个品类对照或修正版，而非反复交相同作品。'],
];
export default function Page(){return <main className="cp-page">
 <header><Link href="/community-options/content-plan">← 方案一内容</Link><Link href="/#strategy">研究室目录</Link></header>
 <div className="cp-intro"><small>方案一 / 运营建议</small><h1>平台组织内容，<br/>作者贡献方法，圈子承接交流。</h1><p>先把一个专题持续维护好，再扩大主动组织的范围。</p><span>基于已有研究的方案建议。角色可以由同一人兼任，实际分工待结合团队情况确认。</span></div>
 <nav aria-label="本页目录"><Link href="#roles">谁来负责</Link><Link href="#supply">内容从哪里来</Link><Link href="#example">电商示例</Link><Link href="#participation">用户怎样参与</Link><Link href="#maintenance">怎样持续</Link><Link href="#choices">待讨论取舍</Link></nav>
 <section id="roles"><small>01 / 分工</small><h2>建议分工：平台整理，作者提供专业内容</h2><p className="cp-note">以下列出拟承担的工作。确定责任人和可承接范围后，再向用户说明服务；暂时无人承接的事项不对外承诺。</p><div className="cp-cards">{roles.map(([name,job,boundary])=><article key={name}><h3>{name}</h3><p>{job}</p><p className="cp-next">{boundary}</p></article>)}</div><p>首轮建议让一位负责人统筹电商专题的选题、作者联系和页面编排；专业制作与资源维护分别寻找合作对象。圈子答疑先按具体问题邀请，不预设全天候专家服务。</p></section>
 <section id="supply"><small>02 / 供给</small><h2>定向邀请补核心，日常投稿补差异</h2><div className="cp-levels"><article><h3>定向合作</h3><p>邀请有真实过程的作者，补齐关键案例和可用方法。交付物、修改次数、许可与回报在合作前约定。</p></article><article><h3>授权整理</h3><p>把分散材料编成易读的任务路径。转载正文、图片和文件先取得相应许可；普通引用保留原出处。</p></article><article><h3>自然贡献</h3><p>接受成果、教程、问题和经验。编辑从中发现值得扩展的内容，再邀请作者补充。</p></article></div><h3>作者为什么愿意留下来</h3><p>内容得到合适的展示，使用者能找到作者，问题和改进有反馈。需要明确交付的合作可谈稿酬、工具支持或后续商业合作；曝光与自然投稿不能替代约定报酬。</p><div className="cp-table"><table><thead><tr><th>合作环节</th><th>平台要做什么</th><th>电商例子</th></tr></thead><tbody>{stages.map(([step,action,example])=><tr key={step}><th>{step}</th><td>{action}</td><td>{example}</td></tr>)}</tbody></table></div></section>
 <section id="example"><small>03 / 专题样板</small><h2>电商专题先串起四项内容</h2><p>上一轮八项是完整选题池。首轮主动组织可以从案例、应用、检查教程和讨论四项开始，画布与批量工作流随可用材料加入。</p><div className="cp-cards"><article><h3>一个有过程的案例</h3><p>作者提供原图、采用图、用途和取舍；编辑检查材料与许可，提炼标题和阅读路径。</p></article><article><h3>一个可尝试的应用</h3><p>维护者说明输入和适用品类；编辑核对入口与示例。尚未具备的自有能力保留为方案，先呈现现有可用路径。</p></article><article><h3>一份结果检查方法</h3><p>作者说明形状、文字、配件等检查点；编辑把它放在案例和应用旁，帮助用户判断结果。</p></article><article><h3>一条具体问题讨论</h3><p>主持人帮助用户说明卡点，邀请相关作者；用户选择是否采用回复，并可补充修改结果。</p></article></div><p>例如“换景后包装文字变糊”：先补原图、结果和已试方法，再判断是输入条件、应用故障还是精修问题。故障转维护者，方法问题邀请作者；没有合适回复时如实保留，用户补交结果后再更新结论。</p><Link href="/community-options/content-plan#ecommerce">对照八项内容建议 →</Link></section>
 <section id="participation"><small>04 / 参与</small><h2>从一次使用，走到一次有价值的交流</h2><div className="cp-route"><span>看案例</span><b>→</b><span>选方法尝试</span><b>→</b><span>分享成果或卡点</span><b>→</b><span>获得反馈</span><b>→</b><span>继续修改</span></div><div className="cp-two"><article><h3>新用户</h3><p>从任务明确的案例进入；根据自己的材料选择应用、工作流或教程。提问只需先说明目标和卡点，主持人协助补信息。</p></article><article><h3>已有经验的用户</h3><p>分享不同做法、指出适用条件，或帮助别人判断结果。有连续贡献后，再邀请其参与专题共编。</p></article></div><h3>怎样找到第一批使用者</h3><p>建议从已有社区用户和合作作者的受众中，邀请正在做对应任务的人试用专题；在抖音、小红书、B站展示具体过程，承接到相应案例或专题。后续以方法更新、问题回复和相关新案例形成回访理由，通知由用户选择订阅。</p><h3>活动中心怎么配合</h3><p>可围绕同一素材开展“不同背景的适用比较”，或征集“修改前后与采用理由”。成果回到专题，方法回到作者内容，疑问回到圈子。活动结束后仍能留下可用材料。</p><p className="cp-note">活动素材须允许参与者使用与展示。奖励机制另行确认，优先认可具体贡献，避免只按发帖量或点赞量发奖。</p></section>
 <section id="maintenance"><small>05 / 持续维护</small><h2>推荐之后，继续关心是否好用</h2><div className="cp-table"><table><thead><tr><th>发生什么</th><th>建议承接角色</th><th>建议处理方式</th></tr></thead><tbody><tr><th>内容值得推荐</th><td>专题编辑</td><td>按任务价值、材料完整性和可用路径选择；新作者同样可以进入推荐。</td></tr><tr><th>工具更新或入口失效</th><td>维护者与编辑</td><td>核对影响，补适用版本或替代入口；恢复前退出当前方法推荐。</td></tr><tr><th>出现重复问题</th><td>主持人与作者</td><td>归并共性卡点，补回教程；保留各用户的不同条件。</td></tr><tr><th>出现错误、侵权或滥用</th><td>平台负责人</td><td>先处理问题内容与传播范围，联系相关方核查并更正；争议期间停止推荐。</td></tr><tr><th>作者暂时无法维护</th><td>专题编辑</td><td>调整推荐、寻找替代内容；经授权后再安排他人接续整理。</td></tr></tbody></table></div><p>复盘重点看：用户能否找到方法并继续尝试、卡点是否被具体回应、内容是否随变化更新、作者是否愿意再次贡献。使用量与互动量帮助发现问题，实际采用还要结合用户反馈判断。</p><p>写作编辑采用同样分工，但反馈围绕原意、结构与语气展开。主持人邀请互读，采用哪一版由作者决定；应用维护者处理工具问题。</p></section>
 <section id="choices"><small>06 / 讨论重点</small><h2>先确定组织方式，再谈投入和承诺</h2><div className="cp-levels"><article><h3>供给方式</h3><p>建议平台编排为主，定向作者合作与自然投稿并行。先补专题缺的内容，再扩作者规模。</p></article><article><h3>答疑程度</h3><p>建议平台负责分流和邀请回复，圈子提供经验交流。专业点评、代制作若要开展，单独定义交付。</p></article><article><h3>活动作用</h3><p>建议活动围绕专题任务展开，让作品、方法和问题沉淀回日常内容。</p></article></div><p>实际落地前需确认：谁能承担专题负责人、已有作者和可用资源有哪些、能够提供哪些合作回报、能否承诺持续答疑。这四项决定运营力度。</p></section>
 <footer><h2>依据与下一步</h2><p>本页把已有内容方案转为运营分工建议。竞品材料用于参考作者合作、版本维护与活动组织，具体执行效果仍需在我们的参与者和团队条件下观察。</p><p><Link href="/#operations" target="_blank" rel="noopener noreferrer">平台运营研究 ↗</Link> · <Link href="/community-options/content-plan">内容布局与样板 →</Link> · <Link href="/community-options/concept-overview">方案一概念 →</Link></p><p>当前先收口内容与运营方案，商业逻辑留待后续讨论。</p></footer>
</main>}
