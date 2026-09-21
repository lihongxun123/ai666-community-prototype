import {SupplyVisuals,DistributionVisual,OperationVisual,UsePathVisual} from './liblib-visuals';
import {type ReactNode} from 'react';
import supplyData from '@/lib/liblib-supply-multiaxis.json';

export function revealLiblibEvidence(id:string){
 const target=document.getElementById(id);
 if(!target)return;
 let parent=target.parentElement;
 while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}
 if(target instanceof HTMLDetailsElement)target.open=true;
 target.scrollIntoView({behavior:'smooth',block:'start'});
}
function Ref({id,children}:{id:string;children:ReactNode}){return <a href={'/liblib-evidence?section='+encodeURIComponent(id)} target="_blank" rel="noopener noreferrer" title="在新标签页查看证据">{children} →</a>;}
function Table({headers,rows}:{headers:string[];rows:string[][]}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map((c,i)=>i===0?<th key={i}>{c}</th>:<td key={i}>{c}</td>)}</tr>)}</tbody></table></div>;}

export function LiblibRepresentative(){return <>
 <section className="essay-section" id="liblib-platform-model"><h2>平台如何运作</h2>
 <p>LiblibAI 将看作品、找方法和在线制作连接起来；用户既可继续浏览，也可进入不同深度的创作。</p>
 <ol className="liblib-mechanism" aria-label="内容与制作的关系"><li><strong>作品</strong><span>发现效果、继续浏览</span></li><li><strong>模型／模板／工作流</strong><span>选择方法、核对条件</span></li><li><strong>生成器／项目</strong><span>制作、保存、继续编辑</span></li></ol>
 <p>作者提供方法和维护，平台提供分发及工具。会员、积分、资源许可与 API 分别收费，社区对收入和回访的贡献未被单独披露。</p>
 <div className="study-refs"><Ref id="liblib-function-0">产品范围与已核对路径</Ref><Ref id="liblib-function-15">机制与结果边界</Ref></div></section>
 <section className="essay-section" id="liblib-user-tasks"><h2>用户与产品价值</h2>
 <p><strong>LiblibAI 的主要价值，是把创作效果与制作方法放在一起，让用户从看到想要的效果，继续走到找到方法并动手制作。</strong></p>
 <Table headers={['用户角色','主要需求','平台提供的价值']} rows={[
 ['灵感浏览者','找风格、看效果、发现创作方向','通过作品、分类和作者发现内容，并找到相关制作资源。'],
 ['具体任务使用者','修商品图、换背景、处理材质、修复画质','按任务寻找已有模型或工作流，进入在线制作。'],
 ['进阶创作者','调整效果、组合方法、控制制作过程','选择模型和参数、编辑节点；通过 LibTV 复制画布，继续制作视频项目。'],
 ['资源作者','发布方法、积累使用者、获得回报','展示资源、维护版本、回应使用问题，并参与作者激励计划。'],
 ['API 接入方','把生成能力接入自己的产品','使用独立的 API 服务与计费体系。']
 ]}/>
 <p>以上按使用任务和参与角色划分，同一个人可以承担多个角色。电商供给已细化到产品精修、背景替换、文字保护和布料处理，可服务设计师、商家及个人创作者。</p>
 <div className="study-refs"><Ref id="liblib-function-1">任务分类与案例</Ref><Ref id="liblib-function-5">视频项目</Ref><Ref id="liblib-function-6">作者资源与发布</Ref><Ref id="liblib-function-13">作者激励</Ref><Ref id="liblib-function-11">API 服务</Ref></div></section>
 <section className="essay-section" id="liblib-distribution"><h2>分类与分发</h2>
 <DistributionVisual/>
 <p>“电商”搜索进一步指向主图、详情页、海报、场景和产品；“电商主图”结果同时包含模板、LoRA与Checkpoint。同一用途可以连接不同资源。</p></section>
 <section className="essay-section" id="liblib-use-paths"><h2>内容如何转为使用</h2><UsePathVisual/></section>
 <section className="essay-section" id="liblib-supply-model"><h2>供给结构与运营</h2>
 <figure className="supply-chart"><figcaption><strong>图片模型目录样本构成（{supplyData.summary.denominator}条）</strong></figcaption><div className="supply-chart-rows">{supplyData.summary.form.counts.map(r=><div className="supply-chart-row" key={r.name}><span>{r.name}</span><div className="supply-bar-track"><span className="supply-bar" style={{width:(r.count/supplyData.summary.denominator*100)+'%'}}/></div><strong>{r.count}</strong></div>)}</div><div className="study-refs"><Ref id="liblib-supply-evidence">样本范围与明细</Ref></div></figure>
 <SupplyVisuals/>

 <OperationVisual/>

 <div className="study-refs"><Ref id="liblib-supply-evidence">目录、作品与详细样本</Ref><Ref id="liblib-demand-appendix">需求反馈与替代工具</Ref><Ref id="liblib-function-8">活动机制</Ref><Ref id="liblib-function-13">作者激励规则</Ref></div></section>
 <section className="essay-section" id="liblib-commercial-model"><h2>收费方式与经营边界</h2>
 <Table headers={['收费对象','提供什么','需要分别判断的条件']} rows={[
 ['创作会员与积分','生成额度及相应生产权益','通用、模型专享和 TV 等积分适用范围不同，部分有有效期。'],
 ['资源访问与许可','特定资源的下载、运行或授权','会员资格不代表全站资源统一可商用，须看具体资源与模型组合。'],
 ['API 接入','向外部产品提供生成能力','API 会员与积分独立于网站体系，不能用网站套餐计算接入成本。'],
 ['作者分配','使用或付费贡献对应的回报规则','规则存在不等于实际结算收入；不同资源和动作的分配依据不同。']
 ]}/>
 <p>统一账号也不意味着权益完全互通。停服及迁移公告仅涉及星流服务。具体日期、处理条件与收费来源保留在详细记录中。</p>
 <p>平台的留存、盈利与整体供需状况仍待经营数据验证。关键缺项包括任务完成与采用、持续使用与回访、付费转化与续费，以及作者收入和维护成本。</p>
 <div className="study-refs"><Ref id="liblib-function-9">会员</Ref><Ref id="liblib-function-10">积分</Ref><Ref id="liblib-function-11">API</Ref><Ref id="liblib-function-12">关联产品</Ref><Ref id="liblib-function-14">许可</Ref></div></section>
 </>;}
