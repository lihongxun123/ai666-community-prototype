'use client';
import {useState} from 'react';
import data from '@/lib/research-readiness.json';
import analysis from '@/lib/research-condition-review.json';
import {calculateResearchCost,type CostInputs} from '@/lib/research-cost';
import './research-completion.css';

export function ResearchCompletion({compact=false}:{compact?:boolean}){
 const passed=data.checks.filter(c=>c.status==='passed').length;
 return <section className="research-completion" id="research-completion">
  <header><h1>{compact?'研究进度':'研究进度与待确认'}</h1><div className="completion-total"><strong>{Math.round(passed/data.checks.length*1000)/10}<small>%</small></strong><span>{passed} / {data.checks.length} 项研究交付已核对<br/>资料核查：{data.date}</span></div></header>
  <p className="completion-note">{data.meaning}</p>
  <div className="completion-links"><a href="/research-kit/research-readiness.md" download>逐项验收记录</a><a href="/research-kit/research-human-input.md" download>下载待补材料</a><a href="/research-kit/platform-review.md" download>18个平台补充研究</a></div>
  {!compact&&<><div className="completion-grid">{data.groups.map(g=>{const checks=data.checks.filter(c=>c.id.startsWith(g.id));return <details key={g.id}><summary><b>{g.title}</b><span>{checks.filter(c=>c.status==='passed').length} / {checks.length}</span></summary><ul>{checks.map(c=><li key={c.id}><div><span className={`completion-state ${c.status}`}>{c.status==='passed'?'已核对':c.status==='manual'?'待人工':'核对中'}</span><b>{c.id} {c.title}</b></div><p>{c.result}</p><a href={c.evidence}>查看依据 →</a></li>)}</ul></details>;})}</div>
  <section className="completion-manual"><h2>需要补充的四组材料</h2><ol>{data.manual.map(m=><li key={m.id}><h3>{m.title}</h3><p>{m.need}</p><p className="completion-note">影响：{m.impact}</p></li>)}</ol><a href="/research-kit/research-human-input.md" download>打开可填写清单 ↓</a></section>
  <ConditionReview/>
  <ResearchCostCalculator/>
  <section><h2>内容交付与持续维护</h2><p>已有材料可以整理成结构阅读、创作方法和问题记录。可执行模板还需素材、运行结果与接收者复现。产量、工时与实际效果分别等待业务记录。</p><div className="completion-links"><a href="/research-kit/research-delivery-standard.md" download>交付要求与两个真实材料样例</a><a href="/research-kit/research-cost-model.md" download>四方案成本与敏感变量</a></div></section>
  </>}
 </section>;
}
export function ConditionReview({kind='all'}:{kind?:'all'|'industry'|'api'}){
 const entries=kind==='industry'?analysis.industry:kind==='api'?analysis.api:[...analysis.industry,...analysis.api];
 return <section className="condition-review"><h2>{kind==='industry'?'统计基准与付费口径复核':kind==='api'?'API的交付条件':'行业与工具的关键条件'}</h2>{entries.map(e=><details key={e.title}><summary>{e.title}</summary><p>{e.finding}</p>{'implication' in e&&<p>{e.implication}</p>}{'delivery' in e&&<p>{e.delivery}</p>}{'unknown' in e&&<p>{e.unknown}</p>}<div className="completion-links">{e.sourceIds.map(id=>{const s=analysis.sources.find(x=>x.id===id)!;return <a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>;})}</div></details>)}<p><a href="/research-kit/research-condition-review.md" download>阅读检索记录、日期与未取得资料</a></p></section>;
}
export function ResearchCostCalculator(){
 const [values,setValues]=useState<CostInputs>({gross:'',refund:'',other:'',hours:'',rate:'',maintenance:'',accepted:''});
 const fields:[keyof CostInputs,string][]=[['gross','全部尝试实扣'],['refund','已确认退还'],['other','素材与外部服务费用'],['hours','制作与复核小时'],['rate','每小时成本'],['maintenance','分摊维护与存储费用'],['accepted','合格交付数量']];
 const result=calculateResearchCost(values),fmt=(n:number)=>n.toLocaleString('zh-CN',{maximumFractionDigits:2});
 return <section className="research-cost"><h2>按实际记录计算交付成本</h2><p>金额使用同一币种；字段为空时不计算。输入只用于当前页面，不保存为经营数据。</p><div className="cost-fields">{fields.map(([key,title])=><label key={key}>{title}<input type="number" min="0" step={key==='accepted'?'1':'any'} value={values[key]} onChange={e=>setValues({...values,[key]:e.target.value})}/></label>)}</div><div className="cost-result" aria-live="polite">{result.status==='empty'?<p>填写全部字段后显示现金支出、人工成本和每个合格交付成本；确无费用的字段可填0。</p>:result.status==='invalid'?<p>请填写非负数；退还金额不能超过实扣，交付数量必须是整数。</p>:<><p>现金支出 {fmt(result.cash)}；人工成本 {fmt(result.labor)}；总成本 {fmt(result.total)}。</p><strong>{result.perAccepted===null?'尚无合格交付，暂不计算单位成本。':`每个合格交付 ${fmt(result.perAccepted)}（所填币种）`}</strong></>}</div><p><a href="/research-kit/research-cost-model.md" download>计算口径与四方案取舍</a></p></section>;
}
