import Link from '@/components/research-link';
import {scenarios} from '../community-options/content-system/configuration';
import '@/components/market-social.css';
export default function Page(){return <main className="ms-report blueprint-report">
<p><Link href="/#overview">研究总览</Link> / 当前方案</p><header><h1>社区方向与当前范围</h1><p>以实践为主线，创作交流保留独立入口。</p></header>
<nav className="ms-links"><a href="#choices">服务与方案</a><a href="#themes">九类任务</a><a href="#supply">产品与运营</a><a href="#evidence">待验证事项</a></nav>
<section id="choices"><h2>帮助使用者找到做法，也让作者交流作品</h2><p>服务创作者、实际应用者、学习者及贡献方法的人。用户可以只阅读、收藏和私下实践；纯娱乐观众不在服务范围。</p><p>五套机制仍可比较：任务决策、项目共学、创作者研讨、方法共建、具体互助。当前推荐以任务决策组织实践内容，创作者研讨保留独立入口；共学、维护与互助按供给条件配置。</p><Link href="/community-options">五套方案与取舍 →</Link></section>
<section id="themes"><h2>九类任务，共用一套内容结构</h2><p>九类用于检验任务差异，尚未定为九个固定频道，也不是市场机会排名。历史、科普归入知识；范围不含手作、家居；职场学习与IP纳入当前范围。</p><div className="ms-grid three">{scenarios.map(s=><article key={s.id} id={'theme-'+s.id}><h3>{s.name}</h3><p>{s.task}</p><p>{s.check}</p><Link href={s.detail}>任务与依据 →</Link></article>)}</div><p id="task-choices"><Link href="/research-decisions/tasks">前轮23项任务记录 →</Link> · <Link href="/research-status">当前证据状态 →</Link></p></section>
<section id="supply"><h2>产品负责连接，运营负责组织</h2><div className="ms-grid two"><article><h3>同一任务连接四类内容</h3><p>案例解释结果与取舍，教程说明步骤，资产交代使用条件，讨论保留问题与改版。内容可被多个专题收录，原文和版本只维护一份。</p><Link href="/community-options/content-system#architecture">共同产品结构 →</Link></article><article><h3>编辑编排，作者分别贡献</h3><p>作者可单独投稿作品、方法或问题；编辑补齐专题路径，核对展示许可与资产条件。回应由愿意参与且具备相关经验的人承担。</p><Link href="/community-options/content-system#supply">运营安排与异常处理 →</Link></article></div><p><Link href="/community-options/home-draft">进入社区样板 →</Link> · <Link href="/community-options/product-sample/concepts">九类概念稿 →</Link></p></section>
<section id="evidence"><h2>哪些仍要靠实际使用确认</h2><p>作者合作、可公开素材与文件许可、用户持续参与、方法采用后的效果仍待验证。MakeNow已有画布，项目复制、导入和成果回流需逐项确认；自有电商Agent与工作流工具属于规划。专业服务撮合暂缓。</p><Link href="/research-status">逐类查看已有依据与缺口 →</Link></section></main>}
