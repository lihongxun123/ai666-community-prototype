import Link from '@/components/research-link';
import '../../options.css';
import '../fusion.css';

const types = [
 ['单图生成','按应用接受文字描述，或原图、场景与比例','图片结果；有原图时支持对照，重新生成保留旧结果'],
 ['局部修改','原图、选区、修改要求','修改前后对照；继续调整保留选区'],
 ['文字处理','原文或支持的文档、修改目标','可编辑结果、改前对照、复制与导出'],
 ['批量处理','多份素材、统一设置、单项例外','输入输出逐项对应；成功项先保存，失败项单独重试'],
 ['视频生成','首帧、运动、时长、比例','播放、下载；声音仅在应用支持时提供'],
 ['分步任务','需求、参考、关键步骤确认','各步产物与最终集合；回退修改时提示受影响的后续步骤'],
];
const entrances = [
 ['首页','浏览或直接输入想法','作品详情／应用使用／专题／轻创作；返回保留浏览位置'],
 ['专题','选择场景与任务','同一任务关联作品、教程、应用与工作流；不是必须经过的入口'],
 ['应用','了解用途后立即使用','示例与本次结果分开；输入、处理、结果在同一任务中承接'],
 ['作品','欣赏表达，了解作者','按需附资源、讨论、修改记录；不强制提供教程'],
 ['圈子','表达、提问、交流','发布后进入同一内容详情；专题与圈子引用原内容，不复制评论'],
 ['模型广场','进入既有模型服务','保留清楚的外跳提示与社区原页面，不假定账号、积分或结果互通'],
 ['我的','找自己的内容与记录','生成记录、已发布、草稿、收藏；公开作者主页与私人管理分开'],
];
function Art({src,title,note}:{src:string;title:string;note:string}) {return <figure className="fusion-art"><a href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt={title+'概念稿'} loading="lazy" /></a><figcaption><strong>{title}</strong> · {note} <a href={src} target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure>}

export default function Page(){return <main className="op-shell fusion-page">
 <header className="op-top"><Link href="/community-options/fusion">多元拾光 / 融合方案</Link><Link href="/community-options/fusion/gallery">完整概念图集 →</Link></header>
 <section className="op-hero"><span>融合方案 / 页面与路径</span><h1>找到内容，动手创作，<br/>留下自己的成果。</h1><p>首页保持轻量；方法按需展开；保存与公开分开。</p><nav><Link href="#search">搜索</Link><Link href="#author">作者与我的</Link><Link href="#publish">发布与提问</Link><Link href="#canvas">MakeNow</Link><Link href="#templates">应用结构</Link><Link href="#scope">页面分工</Link></nav></section>

 <section id="search" className="op-section"><h2>搜索连接公开内容</h2><p>聚焦搜索框，查看本人历史、推荐词与精选专题、应用。点词语进入搜索结果；点具体应用或专题，直接进入详情。</p><p>结果按真实类型分组：作品、应用、方法、专题、圈子、作者。「方法」包含教程与工作流，「圈子」同时承接相关圈子及公开帖子。更多结果沿用当前关键词切换到对应类型。</p><div className="fusion-links"><article><h3>只查公开内容</h3><p>私人结果、原素材、草稿与未公开参数不进入全局搜索。模型仍在原模型服务中查找。</p></article><article><h3>保留查找位置</h3><p>从详情返回，保留关键词、类型和浏览位置。历史可清除；关键词为空时不请求全部内容。推荐词需有真实统计，无统计时只展示精选。</p></article><article><h3>没有结果</h3><p>保留输入，提供改词与清除分类入口。推荐内容单独标识，不伪装成命中结果。</p></article></div><Art src="/proposal-fusion/search-panel-v1.png" title="搜索推荐面板" note="历史与词语进入结果，精选卡片直接进入详情。"/><Art src="/proposal-fusion/search-results-v1.png" title="搜索结果" note="应用去使用，作品去详情，署名去作者主页。"/></section>

 <section id="author" className="op-section"><h2>作者主页公开，「我的」私有</h2><p>点击署名进入作者主页，浏览其主动公开的作品、应用与方法、讨论。关注只建立订阅关系，不增加首页的「推荐／关注」切换，也不新增私信。</p><p>右上角「我的」进入个人管理：生成记录、已发布、草稿、收藏。收藏默认私有；作品收藏与应用收藏按类型区分。草稿从「我的」进入，不增加全局导航。</p><p>保存结果时，同时保留成品、原素材、必要设置和来源关联，均为私有。下载不等于站内保存；取消公开不删除私人原记录，删除私人记录也不自动删除已发布作品。</p><Art src="/proposal-fusion/author-profile-v1.png" title="作者主页" note="访客只看公开内容，卡片进入对应详情。"/><p><Link href="/community-options/fusion#concept-records">查看我的生成记录 →</Link></p></section>

 <section id="publish" className="op-section"><h2>发布很轻，公开范围清楚</h2><div className="fusion-links"><article><h3>入口</h3><p>结果页和个人记录可分享作品；圈子可发作品或提问；「我的」可上传站外作品。保留这些局部入口，不新增顶部发布按钮。</p></article><article><h3>内容</h3><p>作品需要标题，以及图片、视频或文字至少一项。标题可建议生成并修改；想法、方法和关联圈子选填，不要求附完整教程。</p></article><article><h3>公开</h3><p>带入选中的成品与应用关联，原图、完整提示词和参数不默认公开。右侧预览公开内容，点击「发布作品」才提交；草稿始终私有。</p></article></div><Art src="/proposal-fusion/publish-work-v1.png" title="作品发布" note="成图与应用关联带入，用户编辑后发布；选择圈子只增加引用。"/><p>提交后进入该内容详情。需要审核时，作者看到提交状态，通过后才公开；未通过的内容可修改。审核状态仅在作者自己的管理视图出现。</p><div className="op-callout"><h3>提问沿用发帖能力</h3><p>从应用或结果求助，带入具体资源关联；用户说明目标与实际问题，选择公开的图片或段落。已有版本可带入，参数与已尝试步骤选填。发布前预览，发布后进入问题详情；回复、建议和结果补充留在同一条问题下。</p><Link href="/community-options/fusion#concept-e">查看提问与回访概念 →</Link></div><p>独立发布的作品只有一个详情和评论区。圈子中针对它另起的问题是独立帖子，明确引用原作品，不复制原评论；教程也是可被专题引用的帖子。</p></section>

 <section id="canvas" className="op-section"><h2>回应用重做，去画布继续编辑</h2><div className="op-table"><table><thead><tr><th>动作</th><th>带入内容</th><th>保存与返回</th></tr></thead><tbody><tr><th>继续制作</th><td>回到原应用，恢复原素材与设置；不会把成图误当原图</td><td>生成新结果，保留旧结果；原素材缺失时重新上传，应用下线时仍可下载已保存成品</td></tr><tr><th>下载后打开 MakeNow</th><td>下载选中且有权使用的成图，在画布中手动导入</td><td>新标签打开画布，社区原页面保留；画布导出的成品可由用户上传保存或发布</td></tr></tbody></table></div><p>画布项目与社区记录分开管理，当前方案不依赖自动传图、账号互通或导出回传。</p></section>

 <section id="templates" className="op-section"><h2>共用结构，保留六类操作差异</h2><p>共用用途与示例、作者、必要输入、结果和保存区。教程、更多参数与更新说明按需展开；示例不能混作用户结果。</p><div className="op-table"><table><thead><tr><th>类型</th><th>输入</th><th>结果与后续</th></tr></thead><tbody>{types.map(([type,input,result])=><tr key={type}><th>{type}</th><td>{input}</td><td>{result}</td></tr>)}</tbody></table></div><p>六类共用详情骨架，不统一成万能表单。单张与批量采用不同操作区，可以属于同一应用；不另建一套作者、收藏与反馈。中断、失败和返回时保留已有有效结果，不自动公开任何产物。</p><p><Link href="/community-options/fusion#concept-a">查看六类应用概念 →</Link></p></section>

 <section id="scope" className="op-section"><h2>入口不增加，职责更明确</h2><div className="op-table"><table><thead><tr><th>位置</th><th>目的</th><th>承接</th></tr></thead><tbody>{entrances.map(([place,goal,destination])=><tr key={place}><th>{place}</th><td>{goal}</td><td>{destination}</td></tr>)}</tbody></table></div><p>活动中心、AI商城、邀请有礼、积分、签到、通知沿用既有业务入口。私有保存和发布需要登录；登录后返回原动作，保留已填写内容。应用试用权限沿用各工具的规则。</p><div className="fusion-links"><article><h3>共学与研讨</h3><p>共学仅用于有人组织的圈内项目；任务与提交采用同一份成果要求。电商练习统一为主图、场景海报、氛围海报三项；普通发布不套用此要求。研讨与主动公开的修订记录附在原作品下，作者也可保留原作。</p></article><article><h3>维护与互助</h3><p>资源条件、更新与使用反馈留在资源详情；改进建议交给明确维护者处理。版本归属于具体资源，效果对比使用同一输入与目标。问题对比与回访留在原问题，不建立独立一级模块。</p></article><article><h3>本轮边界</h3><p>不增加模型托管、训练、部署、交易或专业服务承诺。HuggingFace／魔搭式定位单独讨论，不作为当前路径的前提。</p></article></div><p>实现时优先复用现有账户、发布、圈子和画布能力；本页提出页面职责与路径建议，不把已有入口等同于接口已经接通。</p></section>
 <footer className="op-footer"><Link href="/community-options/fusion">返回融合方案 →</Link> · <Link href="/community-options/fusion#cup-path">查看白杯完整路径 →</Link></footer>
</main>}
