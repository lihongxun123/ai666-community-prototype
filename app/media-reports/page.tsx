import {DualTrackResearch} from '@/components/dual-track-research';
import catalog from '@/lib/media-report-catalog.json';
import '@/components/market-social.css';

export default function Page(){return <main className="ms-report" style={{margin:'0 auto',padding:'32px 24px 80px'}}>
 <p><a href="/#content-demand">多元拾光研究室 / 内容需求与社媒生态</a></p>
 <header className="page-heading"><h1>AIGC双线研究：兴趣消费与实用应用</h1><p>抖音 · 小红书 · B站　资料检索截至2026年9月16日</p></header>
 <div className="ms-lead"><strong>比较作品消费与实际工作中的需求、内容和工具。</strong><p>行业报告提供背景，作品、工作流和实际应用案例提供任务证据。研究覆盖六类兴趣消费与八类实际应用；故事、音乐、电商、制作学习和空间任务有具体案例。各领域证据深度不同，结论与剩余问题见综合判断页。</p></div>
 <nav className="ms-links" aria-label="本页目录"><a href="/domain-research" target="_blank" rel="noopener noreferrer">综合判断与14领域比较 ↗</a><a href="/task-research" target="_blank" rel="noopener noreferrer">用户任务交叉分析 ↗</a><a href="#report-lessons">关键判断</a><a href="#report-topics">采样地图</a><a href="#report-catalog">报告目录</a></nav>
 <section id="report-lessons"><h2>跨平台比较需要区分的四件事</h2><div className="ms-grid two">
 <article><h3>围绕同一任务比较三站</h3><p>跨平台研究提示用户按需组合使用平台。比较商品制作、故事追看等具体任务，分别检查发现、解释、系列与讨论。</p><a href="https://www.questmobile.cn/research/report/2000767092954075138/" target="_blank" rel="noopener noreferrer">QuestMobile新媒体研究 ↗</a></article>
 <article><h3>兴趣要落到具体作品与角色</h3><p>B站与CTR发布摘要涉及个人空间、手工创意、虚拟角色与情绪需求。报告中的广泛兴趣作为背景；重点核查AI直接参与的作品与任务。</p><a href="https://www.ctrchina.cn/rich/report/802" target="_blank" rel="noopener noreferrer">B站／CTR联合发布摘要 ↗</a></article>
 <article><h3>不同指标，保留不同解释</h3><p>新榜2024发布节选讨论长短内容点赞占比，B站2025年报讨论观看时长与深度内容。时期和指标不同，需要按同题、同指标比较。</p><a href="https://www.newrank.cn/report/detail/425" target="_blank" rel="noopener noreferrer">新榜节选 ↗</a> · <a href="https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0416/2026041601346.pdf" target="_blank" rel="noopener noreferrer">B站年报内容章节 ↗</a></article>
 <article><h3>生活报告保留背景用途</h3><p>小红书相关研究将兴趣细化到手工DIY、次元潮玩、国风与饮食。这些材料用于理解兴趣背景；研究重点是AI内容消费与实际应用。</p><a href="https://www.qian-gua.com/information/detail/3197" target="_blank" rel="noopener noreferrer">千瓜兴趣生活报告摘要 ↗</a></article>
 </div></section>
 <section><h2>应用机会需要检验实际结果</h2><p>电商、包装和服装案例可以定位具体制作任务。能力介绍、客户自述使用、交付结果和消费者反馈分别记录；营销资料辅助理解供给者动机。</p><p>周活用户数保持现有定义。热门选题进入采样后，还要核对普通作者、低互动作品和已有答案，再判断内容质量、信息组织或持续供给是否存在缺口。</p><a href="https://www.alibabagroup.com/zh-HK/document-1738398759789789184" target="_blank" rel="noopener noreferrer">淘天商家工具与应用披露 ↗</a></section>
 <DualTrackResearch/>
 <section id="report-catalog"><h2>报告目录与阅读范围</h2><p>{catalog.length}项去重材料。正文节选、发布摘要、转载与候选分别标记；同一报告的多个入口合并，已读章节不计为全文。</p><div className="ms-grid three">{['抖音','小红书','B站与跨平台'].map(group=><div key={group}><h3>{group}</h3><strong>{catalog.filter(r=>r.group===group).length}项</strong></div>)}</div>
 {['抖音','小红书','B站与跨平台'].map(group=><section key={group}><h3>{group}</h3><ol className="ms-sources">{catalog.filter(r=>r.group===group).map(r=><li key={r.id}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title} ↗</a><small>{r.publisher} · {r.date||'日期待核'} · {r.level}</small><p>{r.findings.join('；')}</p><small>阅读范围：{r.readScope}</small><small>{r.limitations}</small></li>)}</ol></section>)}
 </section>
 </main>}
