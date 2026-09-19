'use client';
import {useState} from 'react';
import data from '@/lib/research-readiness.json';
import analysis from '@/lib/research-condition-review.json';
import {NorthStarOverview} from '@/components/community-north-star';
import {calculateResearchCost,type CostInputs} from '@/lib/research-cost';
import './research-completion.css';

export function ResearchCompletion({compact=false}:{compact?:boolean}){
 const passed=data.checks.filter(c=>c.status==='passed').length;
 return <section className="research-completion" id="research-completion">
  <NorthStarOverview compact={compact}/>
  {!compact&&<><details className="research-appendix" id="research-cost"><summary>投入与单位成本计算</summary><ResearchCostCalculator/></details><details className="ns-history"><summary>历史资料验收记录 · {passed}/{data.checks.length}项 · {data.date}</summary><p>{data.meaning}</p><p>以下记录对应{data.date}的资料验收与当时判断，不代表当前方向或社区活跃表现；任务运行要求仅适用于对应内容的交付承诺。</p><div className="completion-grid">{data.groups.map(g=>{const checks=data.checks.filter(c=>c.id.startsWith(g.id));return <details key={g.id}><summary><b>{g.title}</b><span>{checks.filter(c=>c.status==='passed').length} / {checks.length}</span></summary><ul>{checks.map(c=><li key={c.id}><div><b>{c.id} {c.title}</b><span>{c.status==='passed'?'已核对':c.status==='manual'?'待人工':'核对中'}</span></div><p>{c.result}</p></li>)}</ul></details>;})}</div></details><details className="ns-history"><summary>行业与工具条件的研究记录</summary><ConditionReview/></details><section><h2>内容交付与维护</h2><p>作品、过程、资源和讨论可按各自承诺供给。承诺可直接运行的模板还需提供素材、运行结果、费用与接收者复现记录；其他内容可按各自条件试点。</p></section></>}
 </section>;
}
export function ConditionReview({kind='all'}:{kind?:'all'|'industry'|'api'}){
 const entries=kind==='industry'?analysis.industry:kind==='api'?analysis.api:[...analysis.industry,...analysis.api];
 return <section className="condition-review"><h2>{kind==='industry'?'统计基准与付费口径复核':kind==='api'?'API的交付条件':'行业与工具的关键条件'}</h2>{entries.map(e=><details key={e.title}><summary>{e.title}</summary><p>{e.finding}</p>{'implication' in e&&<p>{e.implication}</p>}{'delivery' in e&&<p>{e.delivery}</p>}{'unknown' in e&&<p>{e.unknown}</p>}<div className="completion-links">{e.sourceIds.map(id=>{const s=analysis.sources.find(x=>x.id===id)!;return <a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>;})}</div></details>)}</section>;
}
export function ResearchCostCalculator(){
 const [values,setValues]=useState<CostInputs>({gross:'',refund:'',other:'',hours:'',rate:'',maintenance:'',accepted:''});
 const fields:[keyof CostInputs,string][]=[['gross','期间渠道、作者、奖励、算力与服务实付'],['refund','已确认退还'],['other','其他外部费用（不重复计入）'],['hours','期间内容、回应与维护小时'],['rate','每小时成本（工时加权均价）'],['maintenance','分摊维护与存储费用'],['accepted','同期周活用户数（或已注明的活跃账号数）']];
 const result=calculateResearchCost(values),fmt=(n:number)=>n.toLocaleString('zh-CN',{maximumFractionDigits:2});
 return <section className="research-cost"><h2>按同一观察期计算投入</h2><p>金额使用同一币种，费用和人数对应同一个完整自然周；未知字段留空。输入只用于当前页面，不保存为经营数据。</p><div className="cost-fields">{fields.map(([key,title])=><label key={key}>{title}<input type="number" min="0" step={key==='accepted'?'1':'any'} value={values[key]} onChange={e=>setValues({...values,[key]:e.target.value})}/></label>)}</div><div className="cost-result" aria-live="polite">{result.status==='empty'?<p>填写全部字段后显示现金支出、人工成本和每位周活用户的期间成本；确无费用的字段可填0。</p>:result.status==='invalid'?<p>请填写非负数；退还金额不能超过实扣，人数必须是整数。</p>:<><p>现金支出 {fmt(result.cash)}；人工成本 {fmt(result.labor)}；总成本 {fmt(result.total)}。</p><strong>{result.perAccepted===null?'尚无符合口径用户，不计算单位成本。':`每位周活用户／活跃账号 ${fmt(result.perAccepted)}（所填币种）`}</strong></>}</div><p>这是期间投入指标，不是获客成本或增量成本。外包人工若已计入实付费用，不再重复计算。存在多种单价时，先求总人工成本，再以总人工成本÷总工时填写每小时成本（工时加权均价）；总工时为0时填0。工具任务的单位结果成本另计。</p></section>;
}
