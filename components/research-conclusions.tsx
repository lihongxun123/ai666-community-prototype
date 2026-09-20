const rows=[
 ['欣赏与追看','故事有回看自述，音乐有找版本、重复收听，视觉作品有具体审美反馈。','合集、作者页、曲目页和评论已提供承接。','重复消费已经出现；跨周返回的频率和原因仍未知。','/task-research#task-continue'],
 ['构思与参考','商品场景和包装概念用于探索表达；部分客户自述已采用。','生成工具与原有设计流程共同承担任务。','参考价值有依据，进入生产或实际使用需要另行验收。','/task-research#task-ideation-reference'],
 ['保真与修改','服装图调试后弃用；空间用户报告高度问题，作者有补平面图的调整经验。','参考素材、局部修改与同行回应已存在。','真实障碍集中到具体约束；普遍失败率与修复效果未知。','/task-research#task-faithful-expression'],
 ['学习与排错','B站用户自述看完教程后试做，受阻后澄清一镜到底目标。','教程与同行建议已经介入。','经验消费有直接自述；收到建议后的完成结果仍缺。','/task-research#task-learning-troubleshooting']
];
export function ResearchConclusions(){return <section id="research-conclusions">
<h2>行业与社媒研究：综合判断</h2>
<div className="ms-lead"><strong>AI应用和内容消费都有具体需求；新社区需说明改善哪些现有体验或解决哪些剩余问题。</strong><p>社媒消费研究保留为判断创作者市场需求、选题和合作对象的依据。多元拾光服务创作者、实际应用者、学习者、资源贡献者和协作者，不触达或服务纯娱乐观众；发布也不是所有服务对象的前提。现有资料可区分观看、制作与方法学习，并呈现采用、弃用和求助案例；需求规模、跨周返回和跨平台迁移动机仍缺直接证据。</p></div>
<div className="ms-grid three">
<article><h3>行业规模提供背景</h3><p>全国生成式AI用途调查、平台AI题材观看与作者供给，统计的是不同对象。社区受众应按任务另行识别。</p><a href="/#china-users" target="_blank" rel="noopener noreferrer">行业与用户依据 ↗</a></article>
<article><h3>作品与方法是两种供给</h3><p>观众围绕剧情、角色、音乐与风格消费；这些观察用于理解创作者面对的内容需求。制作者还需要参考、步骤和排错信息，同一人可以承担多个角色。</p><a href="/task-research" target="_blank" rel="noopener noreferrer">八项用户任务 ↗</a></article>
<article><h3>已有满足是比较起点</h3><p>原平台的合集、版本入口、作者回应与教程已承担部分任务。判断尚未满足的需求时，应说明用户具体卡在哪里。</p><a href="/task-research#task-version" target="_blank" rel="noopener noreferrer">版本查找案例 ↗</a></article>
</div>
<h3>四项代表任务：需求与已有满足</h3><div className="ms-table"><table><thead><tr><th>任务</th><th>证据</th><th>已有满足</th><th>判断</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><th><a href={r[4]} target="_blank" rel="noopener noreferrer">{r[0]} ↗</a></th><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table></div>
<h3>知识解释另有准确性要求</h3><p>剧情解读关注角色与设定，历史、科普还涉及出处和事实核对。作者回复可以解释创作意图，准确性判断则需要对照资料与作品内容。</p><a href="/task-research#task-understand" target="_blank" rel="noopener noreferrer">理解与核对依据 ↗</a><h3>三平台可以怎样比较</h3><p>抖音样本较多呈现作品、系列和版本诉求；B站材料包含制作说明与展开讨论；小红书材料包含家居空间案例和使用者反馈。这是已读材料的覆盖差异，平台优劣仍需同任务、相近条件的样本。</p>
<p>关于用户如何发现作品，记录尤其少。搜索结果能帮助找到样本，却无法代替观众最初如何遇见作品、为什么点开、是否返回的记录。</p>
<h3>哪些未知项会改变判断</h3><div className="ms-grid two"><article><h3>帮助后的结果与合作条件</h3><p>九主题已有自然求助、原渠道回应、局部可用及完成自述；部分终稿、商品采用和实物完成仍未公开。公开记录不能确认使用者是否愿意迁入、作者是否授权与持续参与，实际帮助效果仍待验证。</p></article><article><h3>保留边界</h3><p>全站供需比例、国内细分观众规模和本站周活效果，现有公开样本无法估算。它们不妨碍比较已观察到的任务，但会限制规模预测。</p></article></div>
<p>截至2026年9月18日，结合15家竞品与具体任务证据，当前方向为实践主线、创作交流独立入口及九个重点主题。电商与写作区分操作和专业取舍，科普与手作区分知识、画面与技法，角色与人像保留作者反馈和公开选择；设计、本地经营与历史也已有正反比较。现有材料支持按任务安排帮助，尚未验证新社区能改善结果、值得用户迁移。具体判断见<a href="/research-decisions" target="_blank" rel="noopener noreferrer">九主题方向与供给决策 ↗</a>。</p>
<p className="ms-caption">本页任务表与下方14领域表保留截至2026年9月16日的基础比较，不能作为九主题或机会优先级。教学、音乐／MV、通用整理改编的11项开放任务中，3项已有定向深查，其他8项沿用各自依据。资料丰富程度不作为机会排序，未经测量的WAU效果不用于筛除方向；各来源的观察期、地域与读取范围分别保留。</p>
</section>}
