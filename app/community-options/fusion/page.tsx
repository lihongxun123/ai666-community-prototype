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
const journey = [
 ['找任务','发现 → 电商营销专题','选择「保留商品，替换场景」，查看案例和推荐方法。'],
 ['选应用','专题 → 应用详情','看前后对比、原图要求和适用条件，再决定使用。'],
 ['做图片','应用 → 制作项目','上传有使用权的原图，选择场景，生成预览；保留原项目。'],
 ['提问题','制作项目 → 电商设计圈子','包装文字变形时，选择可公开的图片和参数，带着具体问题求助。'],
 ['继续修改','问题回应 → 原制作项目','收到建议后，回到原项目锁定商品主体、调整背景，并比较结果。'],
 ['保存与分享','制作项目 → 我的 / 作品详情','保存、下载三张营销图；自愿公开作品和制作过程。'],
 ['补充结果','原问题 → 应用 / 专题','标记有帮助的回答，补充采用结果；作者更新说明，编辑择优收录。'],
];
export default function Page(){return <main className="op-shell fusion-page">
 <header className="op-top"><Link href="/#overview">多元拾光 / 研究室</Link><div><Link href="/community-options">五套方案</Link><Link href="/community-options/presentation">汇报演示</Link></div></header>
 <section className="op-hero"><span>融合方案 / 产品概念</span><h1>从找到方法，<br/>到完成一件作品。</h1><p>用专题组织任务，用应用承接制作，用圈子连接交流与经验。五套方案的能力围绕同一份内容衔接。</p><nav><Link href="#home">首页概念</Link><Link href="#architecture">信息架构</Link><Link href="#journey">完整路径</Link><Link href="#connections">内容如何关联</Link></nav></section>
 <section id="home" className="op-section"><span>01 / 首页</span><h2>先发现内容，再进入具体任务</h2><figure className="fusion-art"><a href="/proposal-fusion/home-v2.png" target="_blank" rel="noopener noreferrer"><img src="/proposal-fusion/home-v2.png" alt="融合方案首页：单行导航、等宽 Banner 与四专题、多比例内容卡片" /></a><figcaption>首页概念初稿 · <a href="/proposal-fusion/home-v2.png" target="_blank" rel="noopener noreferrer">放大查看 ↗</a></figcaption></figure><p>Banner 与四专题只出现在发现页。卡片标明内容形式：应用看使用量，作品看互动，问题看回应；共学和维护信息在相关内容中出现。</p></section>
 <section id="architecture" className="op-section"><span>02 / 信息架构</span><h2>五个入口，各有明确用途</h2><div className="fusion-map">{modules.map(([name,purpose,...items])=><article key={name}><h3>{name}</h3><p>{purpose}</p><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div><div className="fusion-rail"><b>全局服务</b><span>搜索 · 活动中心 · AI商城 · 邀请有礼 · 我的／积分／签到</span></div><p>「我的」收纳作品、制作项目、收藏、练习和关注的问题。搜索覆盖内容、应用、工作流、模型与作者；推荐面板提供历史、热门搜索、活动和应用入口。</p></section>
 <section id="journey" className="op-section"><span>03 / 用户路径</span><h2>一件商品，完成三张营销图</h2><p>用户已有商品原图，需要更换场景，同时保留包装文字。下方展示途中出现问题、获得回应后的完整路径。</p><ol className="fusion-journey">{journey.map(([title,place,text],i)=><li key={title}><span className="fusion-number">{String(i+1).padStart(2,'0')}</span><div><h3>{title}</h3><b>{place}</b><p>{text}</p></div></li>)}</ol><div className="op-callout"><h3>没有回应，也能继续</h3><p>先展示同应用的已有问题与常见修正方法，用户可返回项目自行调整；新问题保留待回应状态。共学作为可选路径，不设为制作前提。</p></div></section>
 <section id="connections" className="op-section"><span>04 / 内容关联</span><h2>同一份内容，多处发现，持续积累</h2><div className="fusion-links"><article><h3>专题 ↔ 圈子</h3><p>「电商营销」专题组织任务与方法；「电商设计」圈子承接讨论。教程、作品和共学项目可被专题收录。</p></article><article><h3>应用 ↔ 方法维护</h3><p>模型与方法各自记录来源、版本和适用条件；应用注明所依赖的模型。复现与改进建议归到对应资源，更新时提示相关方法重新核对。</p></article><article><h3>作品 ↔ 制作过程</h3><p>作品关联作者，以及可公开的方法或研讨问题；原创表达也可从作者与讨论继续探索。作者选择公开哪些过程与材料，供他人理解或复用。</p></article></div><div className="op-table"><table><thead><tr><th>保留的方案</th><th>融合后的落点</th></tr></thead><tbody>{[['A 任务创作','发现、专题与制作主路径'],['B 项目共学','圈子中的共学项目，专题按需推荐'],['C 创作者研讨','作品内容与作者入口，圈子中的作品研讨'],['D 方法共建','应用、工作流、教程的版本与维护'],['E 问题互助','圈子中的求助，以及资源详情中的问题反馈']].map(([a,b])=><tr key={a}><th>{a}</th><td>{b}</td></tr>)}</tbody></table></div></section>
 <footer className="op-footer"><p>融合方向已确认；本页首页图为新一轮评审稿。路径中的项目保留、选择性公开和跨页关联属于产品设计要求，尚未验证为现有能力。原五套方案继续保留，商业逻辑暂缓。</p><Link href="/community-options">返回五套方案 →</Link></footer>
 </main>}
