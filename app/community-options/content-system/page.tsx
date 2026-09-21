import EditorialPlan from './editorial-plan';
import SharedDesign from './shared-design';
import Link from '@/components/research-link';
import {scenarios} from './configuration';
import '../cases/ecommerce/style.css';
const external={target:'_blank',rel:'noopener noreferrer'} as const;
export default function Page(){return <main className="ec-study">
<header><Link href="/community-options/scenarios">← 九类场景</Link><span>内容配置与社区结构 · 设计建议</span></header>
<h1>围绕任务组织专题，让内容能接着用</h1>
<p className="ec-lead">专题连接成果、做法、可复用材料和修改讨论；创作者既能找方法，也能分享自己的实践。</p>
<nav>{[['alignment','规划关系'],['editorial-plan','专题取舍'],['matrix','九类配置'],['evidence','案例依据'],['bundle','内容关系'],['architecture','页面结构'],['journey','用户路径'],['shared','共用能力'],['supply','运营安排'],['scope','产品承接']].map(([id,t])=><a key={id} href={'#'+id}>{t}</a>)}</nav>
<p><Link href="/community-options/product-sample/concepts">查看九类专题概念稿与详情路径 →</Link></p><section id="alignment"><h2>沿用社区定位，细化内容怎么组织</h2><div className="ec-three"><article><h3>实践是主线</h3><p>面向创作者、应用者和学习者，帮助他们完成任务。案例可以被浏览，但专题的目标是让使用者有下一步做法。</p></article><article><h3>创作交流保留独立入口</h3><p>作者可独立发布作品、经验或具体问题。适合某项任务的内容再被专题收录，投稿不要求凑成完整内容包。</p></article><article><h3>社区与工具分工</h3><p>社区帮助发现、理解、选法和交流；MakeNow优先承接适配的视觉制作，文稿和演示保留合适的原工具。</p></article></div><p>九类用于检验不同任务的内容需求，暂不等于九个固定频道，也不替代现有C端导航和功能范围。</p></section>
<EditorialPlan/><section id="matrix"><h2>九类任务，分别配什么内容</h2><p>“核心”是一个专题应优先组织的内容；“按需”由实际任务、资产许可和工具条件决定。表内为供给配置建议。</p><div className="ec-scroll"><table><thead><tr><th>场景与任务</th><th>核心内容</th><th>可复用材料</th><th>按需补充</th><th>完成检查</th></tr></thead><tbody>{scenarios.map(s=><tr key={s.id}><th><Link href={s.detail}>{s.name} →</Link><p>{s.task}</p></th><td>{s.core}</td><td>{s.asset}</td><td>{s.optional}</td><td>{s.check}</td></tr>)}</tbody></table></div><p>工作流适合可重复的步骤；画布项目适合参考、探索和编排；模板适合替换已知字段。写作与知识任务更需要编辑约束、来源定位和修改记录，不必强配视觉工程。</p></section>
<section id="evidence"><h2>用已有案例检验内容组合</h2><p>以下材料分别提供流程、成果或反馈参照。它们支撑的环节与仍缺的部分一并列出；公开可读的案例不直接成为本站可下载资产。</p><div className="ec-two">{scenarios.map(s=><article key={s.id} id={'case-'+s.id}><small>{s.name} · {s.kind}</small><h3>{s.proof}</h3><p>{s.known}</p><p><strong>落实到产品：</strong>{s.lesson}</p><p><strong>证据停在：</strong>{s.gap}</p><p><a href={s.url} {...external}>原始材料 ↗</a>　<Link href={s.detail} {...external}>专题与补充依据 ↗</Link></p></article>)}</div></section>
<section id="bundle"><h2>同一任务，关联四种内容</h2><div className="ec-flow">成果案例 ↔ 方法教程 ↔ 可复用资产 ↔ 问题与改版</div><div className="ec-two"><article><h3>案例：是否适合我的任务</h3><p>展示结果、输入条件、关键取舍和采用情况。图集、文章、视频都可以承载；案例详情连接其使用的方法和资产。</p></article><article><h3>教程：下一步怎么做</h3><p>围绕一个明确步骤讲操作、检查和常见失败。长教程按步骤组织，问题讨论可以直接关联到某一步。</p></article><article><h3>资产：我能改哪些部分</h3><p>模板、画布项目、工作流、Prompt或Skill分别说明格式、工具、版本、依赖、可改范围与许可。ComfyUI是工具实现，具体工作流文件才是资产。</p></article><article><h3>问题与改版：卡在哪里，怎么继续</h3><p>保留具体问题、已试方法、建议、作者采用理由和修改结果。问题可以单独发布，也可以连回案例、步骤或资产版本。</p></article></div><p><strong>场景、内容对象、展示形式分别处理：</strong>“电商”是场景，“案例”是内容对象，“视频”是展示形式，“画布项目”是资产类型。筛选分别回答用途、要找什么、怎样阅读和怎样继续制作。</p><p>同一篇投稿可以含讲解和资产；只保存一份内容，通过关联进入多个专题。视觉设计的商品海报可以同时出现在设计与电商专题，主任务按交付目的确定。</p></section>
<section id="architecture"><h2>首页推荐任务，专题组织路径</h2><div className="ec-scroll"><table><thead><tr><th>页面</th><th>用户要判断什么</th><th>主要内容与动作</th></tr></thead><tbody>{[
['首页','这里有什么值得做、适合我做的事','平台精选专题与代表成果；进入具体任务。保留创作交流入口'],
['专题页','怎样完成这个任务，先走哪条路','成果预览、任务分支、素材条件、方法选择、资产及常见问题'],
['案例/教程详情','做法为什么有效，如何照着继续','输入、步骤、关键修改、结果与出处；进入对应方法或资产'],
['资产详情','文件是否可用、是否适合我的环境','预览、许可、依赖、兼容与已知问题；条件满足才提供下载或制作入口'],
['问题与改版','我的问题有没有相近解法','定位步骤/问题区域，查看回应、采用与更新；选择是否公开自己的结果'],
['个人内容','如何找到自己的收藏和发布','保留原有个人中心归属；具体版本及制作结果关联按能力确认']
].map(r=><tr key={r[0]}>{r.map(c=><td key={c}>{c}</td>)}</tr>)}</tbody></table></div><h3>专题页的阅读顺序</h3><div className="ec-flow">看成果 → 选任务分支 → 查素材条件 → 比较做法 → 取用材料 → 修改与检查</div><p>每一步提供继续入口，方法与资产可以并列选择。没有可用资产时仍可跟教程制作；无需先下载文件才能看懂案例。</p><h3>卡片只放选择所需的信息</h3><p>案例看结果、任务与关键条件；教程看要解决的步骤；资产看预览、类型与使用条件；讨论看问题位置和回应。完整操作和依赖放在详情，首页卡片不堆全部入口。</p></section>
<section id="journey"><h2>九条路径，共用结构、保留不同检查</h2><div className="ec-scroll"><table><thead><tr><th>任务</th><th>使用者怎样走</th><th>回到哪里继续修改</th></tr></thead><tbody>{scenarios.map(s=><tr key={s.id}><th>{s.name}</th><td>{s.route}</td><td><Link href={s.detail} {...external}>查看{ s.check }对应路径 ↗</Link></td></tr>)}</tbody></table></div><div className="ec-two"><article><h3>没有资产，也能继续</h3><p>进入教程，查看素材条件，在适合的工具中制作。外部案例只有公开过程时，入口保持“看方法”，不显示不存在的下载或复制按钮。</p></article><article><h3>制作之后，不强制公开</h3><p>使用者先自行检查或交给任务负责人确认；愿意交流时再提交可公开结果、使用方法和改动理由。私人原片、内部资料留在个人环境。</p></article><article><h3>资产失效，方法仍可查</h3><p>停止推荐失效制作入口，保留教程、适用版本和替代方法。原作者更新后重新核对，问题关联到受影响版本。</p></article><article><h3>工具切换，任务信息保留</h3><p>项目交接未接通时，提供简短任务清单和原文入口，由使用者携带素材继续。自动传递任务与回收成果需单独验证。</p></article></div></section>
<SharedDesign />
<section id="scope"><h2>哪些沿用，哪些仍需设计</h2><div className="ec-scroll"><table><thead><tr><th>事项</th><th>与规划的关系</th><th>当前边界</th></tr></thead><tbody>
<tr><th>发现、理解、复用与讨论</th><td>与现有社区定位一致</td><td>用九类任务校准内容组织，保留创作交流入口</td></tr>
<tr><th>专题编排、内容与资产关联</th><td>研究深化形成的产品建议</td><td>页面关系和字段待纳入具体产品设计，尚非正式开发承诺</td></tr>
<tr><th>MakeNow账户跳转</th><td>现有模块已有票据登录承接定义与代码记录</td><td>模块状态尚未确认入站成功分支的完整联调；需按真实环境验收</td></tr>
<tr><th>MakeNow项目复制、素材导入、成果回流</th><td>符合目标使用路径</td><td>账户跳转不能证明项目交接；接口、权限、归属和异常需单独确认</td></tr>
<tr><th>电商Agent与工作流工具</th><td>自有工具规划</td><td>按任务预留承接方式，不展示为已可运行</td></tr>
</tbody></table></div><p><strong>建议顺序：</strong>先确定专题、详情与内容关联；以真实可用材料验证使用路径；再按已经核实的能力接制作入口。视觉概念稿沿用这套结构，真实C端的导航与页面改动另行进入产品和研发评审。</p><p><Link href="/community-options/home-draft">已有社区样板 →</Link>　<Link href="/community-options/scenarios">九类任务依据 →</Link></p></section>
<footer>规划对照：当前产品逻辑、社区与MakeNow账户互通模块，以及九类专题研究。案例为已有资料的归纳，不代表已取得可发布资产或完成工具集成。</footer>
</main>}
