import cPlans from './product-plans-c.json';
import bPlans from './product-plans-b.json';
import crossPlans from './product-plans-cross.json';

type Plan = { audience:string; scenario:string; need?:string; role:string; rationale?:string; journey:string; boundary:string; success:string };
const plans:Record<string,Record<string,Plan>> = {c:cPlans,b:bPlans,cross:crossPlans};

export function ProductPlan({section,page,device,onRead}:{section:string;page:{id:string;title:string};device:string;onRead:(mode:string)=>void}) {
  const plan=plans[section]?.[page.id];
  return <section className="rv-requirements rv-product-plan">
    <h3>{page.title} · 产品方案</h3>

    {plan ? section==='c' ? <dl><dt>用途</dt><dd>{plan.role}</dd><dt>使用场景</dt><dd>{plan.scenario}</dd><dt>操作路径</dt><dd>{plan.journey}</dd><dt>业务边界</dt><dd>{plan.boundary}</dd><dt>验收要点</dt><dd>{plan.success}</dd></dl> : <>
      <h4>用户与场景</h4>
      <dl><dt>目标用户</dt><dd>{plan.audience}</dd><dt>使用场景</dt><dd>{plan.scenario}</dd><dt>用户问题</dt><dd>{plan.need}</dd></dl>
      <h4>页面职责与设计依据</h4>
      <dl><dt>页面承载</dt><dd>{plan.role}</dd><dt>为什么这样设计</dt><dd>{plan.rationale}</dd><dt>入口与去向</dt><dd>{plan.journey}</dd><dt>职责边界</dt><dd>{plan.boundary}</dd></dl>
      <h4>设备与验收</h4>
      <dl><dt>验收重点</dt><dd>{plan.success}</dd></dl>
    </> : <p>此页面的产品方案尚待补充。</p>}
    <div className="rv-plan-actions"><button onClick={()=>onRead('prototype')}>查看页面原型</button><button onClick={()=>onRead('requirements')}>查看具体需求</button><button onClick={()=>onRead('flow')}>查看模块流程</button></div>
  </section>;
}
