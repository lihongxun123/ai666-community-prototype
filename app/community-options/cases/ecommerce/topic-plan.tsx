function Evidence({id,children}:{id:string,children:React.ReactNode}){return <a href={'/community-options/cases/ecommerce#'+id} target="_blank" rel="noopener noreferrer">{children} ↗</a>}
export default function TopicPlan(){return <>
<section id="topic-plan" className="ec-plan">
<h2>专题要帮用户完成什么</h2><p><a href="/community-options/cases/ecommerce/journey">一站式深化：从素材到交付，六步怎样接通 →</a></p><p><a href="/community-options/content-system" target="_blank" rel="noopener noreferrer">九类场景的内容配置与社区结构 ↗</a></p>
<p>商家、设计师或内容制作者带着商品原图进来，找到适合自己品类和用途的做法，知道需要准备什么、哪些细节要检查，再进入 MakeNow 完成制作。</p>
<div className="ec-flow">明确需求 → 选择做法 → MakeNow制作 → 修改检查 → 导出复用</div>
<p>首版建议以内容专题承接，制作优先连接已有 MakeNow 画布。内容目标是提供具体做法和检查清单；有已核验资产时，一并提供可复用工作流或项目；是否愿意回来分享结果，需要后续验证。</p>
<h3>首页只给一个清楚的入口</h3>
<div className="ec-topic-preview"><small>首页入口文案草案</small><h3>商品图怎么做？从你的商品和用途开始</h3><p>主图、场景图、详情图：看相似商品的做法、素材要求和容易出错的地方。</p><a href="#content-plan">查看专题内容安排 ↓</a></div>
</section>
<section id="content-plan"><h2>专题里，先放这三组内容</h2><p>以下是拟定的内容结构。已有研究材料作为编辑参考，正式内容仍需成稿及必要授权。</p>
<div className="ec-three ec-choice">
<article><small>把商品拍清楚</small><h3>换了背景，标签和颜色还对吗？</h3><p>读者有一张商品原图，希望得到干净的展示图。</p><ul><li>原图与处理结果并排看，有可用资产时关联换背景工作流</li><li>说明适用素材和具体步骤</li><li>放大检查文字、颜色与边缘</li></ul><b>完成标准：选定工具，按步骤制作一张候选图并检查</b><p><Evidence id="comparison">已有对照材料</Evidence></p></article>
<article><small>让套图说对重点</small><h3>这件商品，真的需要十张卖点图吗？</h3><p>读者准备详情页，需要决定每张图说明什么。</p><ul><li>先列真实卖点，再安排图序</li><li>按品类删改模板，用图序表或已核验的画布项目组织</li><li>生成前确认文案和构图</li></ul><b>完成标准：整理出一份可删改的图序与文案表</b><p><Evidence id="workflow">已有工作流参照</Evidence></p></article>
<article><small>让下一次更好做</small><h3>换一件商品，哪些设置还能沿用？</h3><p>读者要连续处理多个商品，希望保持一致。</p><ul><li>拟组织可复用版式、批处理工作流与命名约定</li><li>重新核对商品本身的信息</li><li>列出必须单独处理的例外</li></ul><b>完成标准：列出可复用设置与每次必须重核的项目</b><p><Evidence id="batch-case">已有批量案例</Evidence></p></article>
</div></section>
<section id="content-detail"><h2>一篇好用的内容，必须回答四个问题</h2>
<div className="ec-scroll"><table><thead><tr><th>读者的问题</th><th>内容里怎么回答</th></tr></thead><tbody>
<tr><th>适合我吗？</th><td>说明商品品类、目标图片、原始素材要求；开头就展示结果。</td></tr>
<tr><th>我该怎么做？</th><td>提供工具入口、必要条件和关键步骤；引用模板时标明作者与适用版本。</td></tr>
<tr><th>为什么这样做？</th><td>展示选用或放弃某种做法的理由；有修改过程时，指出具体改动。</td></tr>
<tr><th>做完怎么判断？</th><td>给出检查清单。讨论紧跟具体图片或步骤，方便描述哪里出了问题。</td></tr>
</tbody></table></div>
<p>完整案例、失败处理、方法比较、批量经验、人工分工是编辑选材角度。用户优先按自己要做的事找内容，首页无需摆出五种研究分类。</p></section>
<section id="editorial-plan"><h2>平台负责组织，作者贡献经验</h2>
<div className="ec-two"><article><h3>平台的日常工作</h3><ol><li>选一个具体任务，整理适用案例和工具入口。</li><li>请作者补齐素材要求、过程与选择理由。</li><li>检查标题、图文对应、来源及使用条件。</li><li>把重复出现的问题整理到对应步骤。</li><li>工具变化后更新内容，保留修订说明。</li></ol></article><article><h3>作者与参与者贡献什么</h3><ul><li>作者说明自己处理的商品与目标，展示愿意公开的过程。</li><li>使用者带着原要求与结果描述问题，方便有经验的人回应。</li><li>有依据的补充和修改回写到内容，保留贡献者署名。</li></ul><p>参与方式和实际维护负担，后续与运营条件一起确认。</p></article></div>
<h3>首版需要的产品承接</h3><p>先用一个专题入口、三组按用途组织的内容、MakeNow项目入口与检查清单承接。单篇标明适用品类；每篇成稿需给出具体工具和操作步骤，有可复用工作流、画布项目或模板时关联资产详情与使用条件。</p>
<p>有持续内容与反馈后，再增加品类筛选、步骤讨论和公开修订记录。案例回流是后续要验证的行为；电商 Agent 与工作流工具作为自有规划能力纳入路径，具体实现另行对接。</p><h3>这一轮的建议</h3><p><strong>把电商做成一个可试用的任务专题。</strong>先让人找到方法、看懂条件、判断结果，再检验案例交流是否带来持续价值。它是社区内容组织的代表方案，尚不构成电商优先于其他主题的市场结论。</p>
</section>
<div className="ec-evidence-heading"><h2>支持这份方案的研究材料</h2><p>以下保留案例、对照与15家核查，方便追溯判断。</p></div>
</>}
