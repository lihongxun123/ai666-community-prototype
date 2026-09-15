import data from '@/lib/liblib-supply-multiaxis.json';
const conditionNames:Record<string,string>={type:'资源类型',baseAlgorithm:'基础算法',baseModel:'基础模型',referenceImageParameters:'参考图输入',promptSupport:'提示词支持'};

export function LiblibSupplyAxes(){
  const unmatched=data.resources.filter(r=>!r.topics.length).length;
  const tasks=data.resources.filter(r=>r.scenarios.length).length;
  return <section id="liblib-supply-axes">
    <h4>供给主题与明确用途</h4>
    <p>699份资源按主题和用途分别统计。例如，人物是题材，证件照是用途；空间风格可以用于多个场景。每份资源允许归入多个主题，但在每个主题内只计一次。标签占比以699份资源为分母，不能相加为100%。</p>
    <div className="table-wrap"><table><thead><tr><th>主题信号</th><th>资源数</th><th>占观察集合</th><th>可核对实例</th></tr></thead><tbody>{data.summary.topics.counts.map(g=><tr key={g.name}><th>{g.name}</th><td>{g.count}</td><td>{g.sharePct}%</td><td>{data.resources.filter(r=>r.topics.includes(g.name)).slice(0,2).map(r=><p key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></p>)}</td></tr>)}</tbody></table></div>
    <p>{unmatched}份资源未被现有题材规则识别。统计以标题词、已记录的标题语义判断及详情标签为依据，不等于全部资源已完成内容判读，也不代表各行业用户占比。</p>
    <div className="table-wrap"><table><thead><tr><th>标题或详情明确提及的用途</th><th>资源数</th><th>占观察集合</th></tr></thead><tbody>{data.summary.scenarios.counts.map(g=><tr key={g.name}><th>{g.name}</th><td>{g.count}</td><td>{g.sharePct}%</td></tr>)}</tbody></table></div>
    <p>{tasks}份资源识别到明确用途词，其余{699-tasks}份未确认用途。详情中的作者用途说明与标签仅说明发布者如何介绍资源，尚不能证明用户已完成任务或持续使用。</p>
    <h4>使用条件的证据覆盖</h4>
    <p>62份有效详情来自标题用途待核的资源，属于定向选取，不能代表699份的条件分布。表格统计基础模型、参考图输入与提示词支持等字段的证据覆盖；其余637份没有可用详情记录。运行次数和下载次数不作为使用条件。</p>
    <div className="table-wrap"><table><thead><tr><th>详情字段</th><th>已观察资源数</th><th>占62份有效详情</th></tr></thead><tbody>{data.summary.conditions.observedFieldCounts.filter(r=>conditionNames[r.name]).map(r=><tr key={r.name}><th>{conditionNames[r.name]}</th><td>{r.count}</td><td>{r.sharePct}%</td></tr>)}</tbody></table></div>
    <details><summary>699份资源：主题、用途、形式与依据</summary>
      <p>按资源ID去重。相同标题、简介或系列名称的不同ID不合并。主题和用途可以多选，下表按资源形式分组，每份资源仅展示一次。</p>
      {['LoRA','模板','Checkpoint'].map(form=><details key={form}><summary>{form}（{data.resources.filter(r=>r.form===form).length}）</summary><div className="table-wrap"><table><thead><tr><th>资源与署名</th><th>主题</th><th>用途</th><th>归类依据</th><th>详情条件</th></tr></thead><tbody>{data.resources.filter(r=>r.form===form).map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a><p>{r.author}</p></td><td>{r.topics.join('、')||'规则未识别'}</td><td>{r.scenarios.join('、')||'用途未确认'}</td><td>{r.evidence.length?r.evidence.map((e,i)=><p key={i}>{e}</p>):'标题未命中；尚不能确认归类。'}</td><td>{r.conditions?<>{Object.entries(r.conditions).filter(([k,v])=>conditionNames[k]&&v!==null).map(([k,v])=><p key={k}>{conditionNames[k]}：{String(v)}</p>)}</>:r.conditionStatus}</td></tr>)}</tbody></table></div></details>)}
    </details>
  </section>;
}
