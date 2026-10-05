import cPlans from './product-plans-c.json';
import bPlans from './product-plans-b.json';
import crossPlans from './product-plans-cross.json';

type Plan = { audience:string; scenario:string; need?:string; role:string; rationale?:string; journey:string; boundary:string; success:string };
const plans:Record<string,Record<string,Plan>> = {c:cPlans,b:bPlans,cross:crossPlans};
const productScope:Record<string,string> = {
  c:'社区以内容展示与交流为主，同时提供创作入口。用户可独立浏览、学习、体验、创作或发布，无需按固定顺序完成。',
  b:'后台负责内容供给、审核、公开与运营配置。复杂内容前期由官方维护，内容维护权与实际执行、计费和工程权限分开。',
  cross:'社区负责内容发现与交流，MakeNow 承接工程查看、复制和制作。成果、公开工程和个人副本分别管理，用户主动选择分享与回流。',
};

export function ProductPlan({section,page,device,onRead}:{section:string;page:{id:string;title:string};device:string;onRead:(mode:string)=>void}) {
  const plan=plans[section]?.[page.id];
  return <section className="rv-requirements rv-product-plan">
    <h3>{page.title} · 产品方案</h3>
    {section!=='c'&&<p className="rv-plan-context">{productScope[section]}</p>}
    {plan ? section==='c' ? <dl><dt>用途</dt><dd>{plan.role}</dd><dt>使用场景</dt><dd>{plan.scenario}</dd><dt>操作路径</dt><dd>{plan.journey}</dd><dt>业务边界</dt><dd>{plan.boundary}</dd><dt>验收要点</dt><dd>{plan.success}</dd></dl> : <>
      <h4>用户与场景</h4>
      <dl><dt>目标用户</dt><dd>{plan.audience}</dd><dt>使用场景</dt><dd>{plan.scenario}</dd><dt>用户问题</dt><dd>{plan.need}</dd></dl>
      <h4>页面职责与设计依据</h4>
      <dl><dt>页面承载</dt><dd>{plan.role}</dd><dt>为什么这样设计</dt><dd>{plan.rationale}</dd><dt>入口与去向</dt><dd>{plan.journey}</dd><dt>职责边界</dt><dd>{plan.boundary}</dd></dl>
      <h4>设备与验收</h4>
      <dl><dt>设备分工</dt><dd>{section==='b'?'PC 承接内容编辑、审核与运营配置；不从当前页面推导独立移动后台。':section==='cross'?'手机承接公开介绍、状态查看与 PC 引导；复杂工程操作在 PC 完成，执行权限仍需逐项校验。':device==='pc'?'PC 与手机共用内容身份和业务规则，按宽屏组织信息；画布、工作流和复杂编辑在对应产品承接。':'手机优先完成浏览、交流及适配的操作；设备限制在详情或具体动作处说明，不将完整画布塞入手机页面。'}</dd><dt>验收重点</dt><dd>{plan.success}</dd></dl>
    </> : <p>此页面的产品方案尚待补充。</p>}
    <div className="rv-plan-actions"><button onClick={()=>onRead('prototype')}>查看页面原型</button><button onClick={()=>onRead('requirements')}>查看具体需求</button><button onClick={()=>onRead('flow')}>查看模块流程</button></div>
  </section>;
}
