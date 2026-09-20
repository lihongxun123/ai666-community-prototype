'use client';
import {useState} from 'react';
import Link from 'next/link';
import '../style.css';
const steps=[
{name:'明确需求',user:'我卖什么，需要做哪些图？',input:'商品品类、图片用途、目标渠道、真实卖点、已有素材。',action:'提供按任务选择的入口；从案例进入时带上来源，让用户确认适用品类与图型。',output:'任务简报：商品、用途、图型清单、已确认事实与待补素材。',gate:'没有素材时可先看案例和准备清单；没有证实的卖点留空。'},
{name:'选择做法',user:'哪条路径适合我？',input:'任务简报、可用素材、用户愿意投入的操作深度。',action:'提供画布编辑、复用工作流、电商 Agent 辅助三条路径；解释各自要准备什么。',output:'选定路径及案例、模板或工作流版本。',gate:'尚未接入的能力标为规划；提供已有画布的替代路径。'},
{name:'进入制作',user:'能带着前面的选择直接开始吗？',input:'简报、素材授权、选定项目或模板、目标图型。',action:'在 MakeNow 新建或打开项目；可用引用自动关联，缺失项集中补齐。',output:'与社区任务关联的 MakeNow 项目和待制作图序。',gate:'未登录先保留选择，登录后继续；传递失败保留简报，不重复创建项目。'},
{name:'确认与修改',user:'每张图是否说对了，也做对了？',input:'图序、文案、参考和候选结果。',action:'先确认图序与文案，再制作；逐图选择、修改或重做，保留已满意的结果。',output:'候选图、采用版本、修改说明及待解决问题。',gate:'Agent可提议，用户确认关键卖点；重做单张不覆盖整套已选结果。'},
{name:'检查与交付',user:'这套图能用于我的商品吗？',input:'所选图片、原始商品与目标用途。',action:'核对商品信息、文字、图型、尺寸和使用权；按图序导出，附项目与版本记录。',output:'图片交付包、检查结果和可继续编辑的项目。',gate:'未完成检查可导出草稿并标明状态；最终交付需确认清单。渠道上架另行处理。'},
{name:'复用与交流',user:'下次换商品，或遇到问题怎么接着做？',input:'原项目、资产版本、检查记录、可公开的结果。',action:'复制项目替换商品；保留排版与方法，重新核对商品事实。自愿分享或向关联内容求助。',output:'新项目，或与原案例和版本相连的反馈。',gate:'求助前选择可公开素材；商业图片和项目默认不随反馈公开。'}
];
export default function Page(){const [step,setStep]=useState(0);const [route,setRoute]=useState('画布编辑');const [purpose,setPurpose]=useState('主图＋场景图');const s=steps[step];return <main className="ec-study">
<header><Link href="/community-options/cases/ecommerce#topic-plan">← 电商营销专题</Link><span>一站式任务设计 · 拟议流程</span></header>
<h1>从商品素材，到一套可以交付的图片</h1><p className="ec-lead">专题组织方法，MakeNow 承接制作；项目保存选择、修改与结果。</p>
<nav>{[['flow','任务流程'],['handoff','项目衔接'],['exceptions','中断处理'],['operations','内容与运营'],['scope','建设边界']].map(([id,t])=><a key={id} href={'#'+id}>{t}</a>)}</nav>
<section id="flow"><h2>六步走完，随时能接着做</h2><p>点击步骤查看用户目标、承接动作和完成条件。这里演示信息架构，未连接真实 MakeNow 项目。</p><div className="journey-steps">{steps.map((x,i)=><button key={x.name} onClick={()=>setStep(i)} aria-pressed={i===step}>{i+1}. {x.name}</button>)}</div><article className="journey-detail" aria-live="polite"><small>步骤 {step+1}</small><h3>{s.user}</h3><dl><dt>带进来</dt><dd>{s.input}</dd><dt>产品怎样接</dt><dd>{s.action}</dd><dt>这一阶段留下什么</dt><dd>{s.output}</dd><dt>需要处理的情况</dt><dd>{s.gate}</dd></dl></article>
<h3>同一任务，三种制作路径</h3><div className="ec-three ec-choice"><article><h3>画布编辑</h3><p>适合已有素材、希望自己组织画面的人。在 MakeNow 调整图序、文案和布局。</p><b>已有画布能力；具体编辑动作需与实际产品对齐。</b></article><article><h3>复用工作流</h3><p>适合有明确重复步骤的任务。替换输入、检查依赖，再处理候选图。</p><b>自有工作流工具规划中。</b></article><article><h3>电商 Agent 辅助</h3><p>帮助整理需求、提出图序、选择方法。用户确认后再执行，结果仍需检查。</p><b>自有 Agent 规划中。</b></article></div>
<h3>任务简报怎样随选择变化</h3><div className="journey-brief"><label>需要的图片<select value={purpose} onChange={e=>setPurpose(e.target.value)}>{['主图＋场景图','详情图序','一批商品统一版式'].map(x=><option key={x}>{x}</option>)}</select></label><label>制作路径<select value={route} onChange={e=>setRoute(e.target.value)}>{['画布编辑','复用工作流','电商 Agent 辅助'].map(x=><option key={x}>{x}</option>)}</select></label><div aria-live="polite"><b>将带入项目的选择</b><p>任务：{purpose}；路径：{route}；商品素材和真实卖点：待用户补充。</p><p>{route==='画布编辑'?'下一步拟进入 MakeNow 画布，先确认素材和图序。':'此路径为规划能力；当前提供 MakeNow 画布编辑作为替代。'}</p><small>这是本页内的选择演示，不保存任务，也不创建项目。</small></div></div></section>
<section id="handoff"><h2>案例到制作，中间不重新来一遍</h2><p>社区与 MakeNow 接通后，应传递和保留以下内容。</p><div className="ec-scroll"><table><thead><tr><th>交接内容</th><th>怎样处理</th></tr></thead><tbody>
<tr><th>任务简报</th><td>商品、用途、目标图型与已确认卖点随项目保存；渠道规则注明来源与适用时间。</td></tr>
<tr><th>案例与资产</th><td>记录来源案例、作者、模板或工作流版本；复制后保留来源关系。</td></tr>
<tr><th>素材</th><td>区分商品实图、风格参考与排版参考；检查访问权限，避免把参考图当成商品事实。</td></tr>
<tr><th>项目</th><td>任务关联 MakeNow 项目标识，返回专题后能继续打开。新建请求重复时应返回原项目。</td></tr>
<tr><th>结果与修改</th><td>记录采用图、候选版本和修改说明；制作过程保存在项目，不默认发布到社区。</td></tr>
<tr><th>求助上下文</th><td>用户选定步骤、版本和可公开截图后再提交；凭据与私人素材不进入反馈。</td></tr>
</tbody></table></div><p>以上是产品交接要求。账号关系、文件权限、项目接口、复制方式及结果回传需要与 MakeNow 实际能力核对，尚未确认接口已具备。</p></section>
<section id="exceptions"><h2>一站式，也包括卡住之后的去处</h2><div className="ec-scroll"><table><thead><tr><th>遇到的问题</th><th>用户下一步</th><th>应保留什么</th></tr></thead><tbody>
{[['素材不够','查看拍摄或素材准备清单，补齐后继续','已选任务、案例与图型'],['资产失效或工具未接入','改用画布或另一条已验证的方法','素材与任务简报'],['商品细节变了','定位问题区域，回到对应图片修改','原图、问题图和已满意图片'],['只需重做一张','对所选图片创建新候选，其他图片保持','采用版本与修改历史'],['中途退出或执行失败','重新打开项目或重试失败步骤','任务状态、已完成结果与失败提示'],['仍然不知道怎么改','查看相关诊断内容，或带上下文求助','工具版本、步骤与用户选择公开的素材']].map(r=><tr key={r[0]}>{r.map(x=><td key={x}>{x}</td>)}</tr>)}</tbody></table></div></section>
<section id="operations"><h2>内容就放在用户需要它的地方</h2><div className="ec-scroll"><table><thead><tr><th>位置</th><th>需要的内容</th><th>平台的工作</th></tr></thead><tbody>
<tr><th>开始之前</th><td>相似案例、方法对比、素材清单</td><td>按任务与品类组织入口，解释适用条件。</td></tr>
<tr><th>制作过程中</th><td>步骤说明、工作流、画布项目、局部修改教程</td><td>把内容关联到具体操作，核对版本与使用许可。</td></tr>
<tr><th>检查时</th><td>商品检查清单、常见失真、渠道要求来源</td><td>维护标准来源，区分内容建议与正式渠道规则。</td></tr>
<tr><th>使用之后</th><td>修改记录、问题解答、复用案例</td><td>邀请自愿补充采用理由；整理反馈并通知相关作者更新。</td></tr>
</tbody></table></div><p>专业点评与疑难协助需明确谁来响应、能处理什么、何时转交。具体服务承诺与激励方案在运营条件确认后制定。</p></section>
<section id="scope"><h2>先明确整条路径，再按能力接入</h2><p><strong>已有前提：</strong>用户确认拥有 MakeNow 画布。<strong>规划能力：</strong>自有电商 Agent、工作流工具。社区与画布之间的项目关联、复制、权限及结果回传尚需核对。</p>
<h3>优先接通的目标路径</h3><p>电商营销专题 → 案例与素材要求 → MakeNow 画布项目 → 修改与检查 → 导出并继续复用。工作流和 Agent 沿用这份任务简报与项目关系，逐步增加自动执行。</p>
<h3>完成验收时，要实际走通这些事</h3><ul><li>从案例进入制作后，用户能看到此前选择的任务与来源，无需重复填写。</li><li>关闭后重新进入能继续项目，单图修改不会覆盖其他已选结果。</li><li>不可用资产有明确替代路径，规划功能不会触发真实执行。</li><li>最终输出对应已选图序；检查记录与项目版本可追溯。</li><li>用户可以只完成制作，不分享；发起求助前能选择公开范围。</li></ul>
<p>本轮深化的是产品方案与交接要求，尚未实施这些能力，也不承诺商品平台审核通过。上架、订单和销售管理不纳入本专题的当前交付范围。</p><p><Link href="/community-options/product-sample">返回四页产品样板 →</Link></p></section>
</main>}
