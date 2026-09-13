'use client';
import plan from '@/lib/validation-plan.json';
import {NorthStarPlan} from '@/components/community-north-star';

export function ValidationOverview(){
 return <article className="validation-report content-report north-star">
  <header className="page-heading"><h1>用户研究准备</h1><p>{plan.status}</p></header>

  <NorthStarPlan/>
  <section><h2>招募对象</h2><p>第一批围绕一个主题组织。观看、收藏、尝试和交流都是可能的参与方式；生产任务和付款经历不作为入组条件。</p><div className="table-wrap"><table><thead><tr><th>候选方向</th><th>对象</th><th>回访原因</th></tr></thead><tbody>{plan.directions.map(d=><tr key={d.id}><th>{d.name}</th><td>{d.audience}</td><td>{d.returnReason}</td></tr>)}</tbody></table></div><h3>筛选问题</h3><ol>{plan.screening.map(q=><li key={q}>{q}</li>)}</ol><details><summary>入组、来源与记录规则</summary><ul>{plan.selectionRules.map(q=><li key={q}>{q}</li>)}</ul></details></section>
  <section><h2>30分钟访谈</h2><div className="table-wrap"><table><thead><tr><th>时间与目的</th><th>提问</th><th>记录</th></tr></thead><tbody>{plan.interview.map(q=><tr key={q.time}><th>{q.time}<br/>{q.title}</th><td>{q.prompt}</td><td>{q.record}</td></tr>)}</tbody></table></div><p>原话、可见材料和研究者解释分别记录。未回访者与不满意者也保留；口头认同不代替实际行为。</p></section>
  <section><h2>作者与运营供给</h2><ol>{plan.authorTrial.map(q=><li key={q}>{q}</li>)}</ol></section>
  <section><h2>试点启动条件</h2><p>首批目标范围、内容主题、执行人、投入上限、数据覆盖与开始日期。具体人数和留存通过线待基线与预算明确后确定。</p><div className="ns-links"><a href="#progress">持续活跃与投入</a><a href="#strategy">方向与内容组织</a></div></section>
 </article>;
}
