 'use client';
import {DocumentBlocks} from './document-blocks';
import {useEffect,useRef,useState} from 'react';
import cRequirements from '../../../design-notes/requirements-c-flows.md?raw';
import crossRequirements from '../../../design-notes/requirements-cross-product.md?raw';
export const appReviewPages=['apps','app','app-input','app-task','app-result'];
export const appReviewIds:Record<string,string>={apps:'C-APP-01',app:'C-APP-02','app-input':'C-APP-03','app-task':'C-APP-04','app-result':'C-APP-05'};
type Edge={action:string;target:string;condition:string;match?:string};
export const appEdges:Record<string,Edge[]>={
 apps:[{action:'选择应用',match:'文案改写',target:'app',condition:'进入所选应用详情，保留应用身份'}],
 app:[{action:'开始使用',target:'app-input',condition:'社区执行且可用；未登录先登录，恢复后主动操作'},{action:'获取电脑端链接',target:'pc-handoff',condition:'手机访问需要电脑操作的应用；仍可阅读介绍'},{action:'在 MakeNow 中打开',target:'cross:project',condition:'PC 且运行位置为 MakeNow；进入不自动生成或扣费'}],
 'app-input':[{action:'确认并生成',target:'app-task',condition:'输入有效、登录有效、报价及积分核验通过；价格变化需重新确认'},{action:'前往积分中心',target:'points',condition:'积分不足，保留输入；不提供充值'},{action:'重新登录',target:'login',condition:'登录过期，恢复后不自动提交'}],
 'app-task':[{action:'查看生成结果',target:'app-result',condition:'任务确认完成'},{action:'查看生成记录',target:'records',condition:'离开后可找回原任务'},{action:'重新填写并确认',target:'app-input',condition:'明确未受理、失败或取消；未知结果只查原任务'}],
 'app-result':[{action:'再次创作',target:'app-input',condition:'新任务须重新填写、核价和主动确认'},{action:'发布作品',match:'发布作品',target:'post-edit',condition:'主动选择成果进入作品编辑，不自动公开'},{action:'返回生成记录',target:'records',condition:'私人结果可找回；失效结果按实际状态展示'}]
};
const titles:Record<string,string>={apps:'应用列表',app:'应用详情','app-input':'应用输入','app-task':'生成任务','app-result':'生成结果','pc-handoff':'电脑端继续',points:'积分中心',login:'登录',records:'生成记录','post-edit':'作品编辑','cross:project':'MakeNow 公开项目'};
const pageFacts:Record<string,{fields:string;rules:string;source:string}>={
 apps:{fields:'效果图、应用名称、当前可用状态；分类按用户任务：全部、写文案、做商品图、修照片、做视频。',rules:'两端共享目录；手机可用优先，组内按运营排序。暂停应用不作为可立即体验项推荐。',source:'C端需求 §4，D-C05'},
 app:{fields:'用途与效果、准备材料、输入输出、提供方、使用入口、设备要求及账号与费用条件。',rules:'阅读不触发生成或扣费。运行位置与设备限制独立；暂停操作不连带删除介绍。',source:'C端需求 §4；跨产品需求 §2.1，D-X01'},
 'app-input':{fields:'素材、描述、影响费用的参数、本次积分、可用积分和不足缺口。',rules:'提交核价；价格未变不二次确认，变化保留输入并重新确认。核价失败不预占；积分不足无充值入口。',source:'跨产品需求 §2.2，D-X02、D-X06'},
 'app-task':{fields:'原任务身份、受理/执行状态、积分预占与结算状态、结果找回入口。',rules:'受理未知只查原任务，不重提或自动释放。执行开始后不主动取消；排队取消须执行侧可靠支持。',source:'跨产品需求 §2.2，D-X03—D-X05'},
 'app-result':{fields:'实际交付结果、部分成功情况、独立积分结算状态、结果保存与主动发布入口。',rules:'结果默认私有；成功但结算中仍展示结果。再次创作为新任务；发布须经编辑和主动提交。',source:'跨产品需求 §2.2—2.3'}
};
function section(text:string,start:string,end:string){return text.slice(text.indexOf(start),text.indexOf(end,text.indexOf(start)));}
export function AppRequirements({page}:{page:string}){
 const [source,setSource]=useState('page');
 const cSection=section(cRequirements,'### 4.4 ','### 4.5 ');

 const crossSection=section(crossRequirements,'## 2.','## 3.');
 return <section className="rv-requirements"><h3>{appReviewIds[page]} · {titles[page]}</h3><div className="rv-pages"><button aria-pressed={source==='page'} onClick={()=>setSource('page')}>页面需求</button><button aria-pressed={source==='module'} onClick={()=>setSource('module')}>模块规则</button></div>{source==='page'?<><table><thead><tr><th>动作</th><th>去向</th><th>条件与边界</th></tr></thead><tbody>{appEdges[page].map(e=><tr key={e.action}><td>{e.action}</td><td>{titles[e.target]}</td><td>{e.condition}</td></tr>)}</tbody></table><h3>必要信息</h3><p>{pageFacts[page].fields}</p><h3>业务规则</h3><p>{pageFacts[page].rules}</p><h3>两端差异</h3><p>共享应用身份与内容。手机端优先排列当前可用应用，不显示设备筛选；需要电脑操作的能力在详情引导。执行位置与设备支持分别判断。</p></>:<><DocumentBlocks text={cSection}/><DocumentBlocks text={crossSection}/></>}</section>
}
export function AppFlow({open}:{open:(target:string)=>void}){return <section className="rv-requirements"><h3>AI应用 · 模块流程</h3><div className="rv-flow">{appReviewPages.map((id,i)=><div key={id}><button onClick={()=>open(id)}><small>{appReviewIds[id]}</small>{titles[id]}</button>{i<4&&<span>→</span>}</div>)}</div><p>上方为社区内直接体验路径。以下分支按运行位置、设备、身份和任务结果进入。</p><table><thead><tr><th>起点</th><th>触发动作</th><th>条件</th><th>去向</th></tr></thead><tbody>{Object.entries(appEdges).flatMap(([id,edges])=>edges.map(e=><tr key={id+e.action}><td>{titles[id]}</td><td>{e.action}</td><td>{e.condition}</td><td><button onClick={()=>open(e.target)}>{titles[e.target]}</button></td></tr>))}</tbody></table><p>MakeNow 案例入口是本地跨产品演示；实际指定工具承接尚待业务实现核验。</p></section>}
export function AnnotatedApp({page,url,annotations,open,onNavigate}:{page:string;url:string;annotations:boolean;open:(target:string)=>void;onNavigate:(id:string,search:string,section?:string)=>void}){
 const [initialUrl]=useState(url);const frame=useRef<HTMLIFrameElement>(null),[actual,setActual]=useState(page),[marks,setMarks]=useState<{n:number;x:number;y:number}[]>([]);
 useEffect(()=>{const el=frame.current;if(!el)return;let observer:MutationObserver|undefined;let win:Window|null=null;
 const update=()=>{try{const w=el.contentWindow;if(!w)return;const u=new URL(w.location.href);const id=u.searchParams.get('page')||page;setActual(id);if(u.pathname.endsWith('/c-prototype'))onNavigate(id,u.search,'c');else if(u.pathname.endsWith('/cross-prototype'))onNavigate(id,u.search,'cross');const edges=appEdges[id]||[];const buttons=Array.from(w.document.querySelectorAll('button'));setMarks(edges.flatMap((edge,n)=>{const button=buttons.find(b=>b.textContent?.includes(edge.match||edge.action));if(!button)return [];const r=button.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<el.clientHeight?[{n:n+1,x:Math.max(0,Math.min(r.left,350)),y:Math.max(0,r.top)}]:[]}));}catch{setMarks([])}};
 const bind=()=>{observer?.disconnect();win?.removeEventListener('scroll',update);win?.removeEventListener('popstate',update);try{win=el.contentWindow;if(win){observer=new MutationObserver(update);observer.observe(win.document.body,{childList:true,subtree:true,attributes:true});win.addEventListener('scroll',update);win.addEventListener('popstate',update);}}catch{}update()};el.addEventListener('load',bind);bind();return()=>{el.removeEventListener('load',bind);observer?.disconnect();win?.removeEventListener('scroll',update);win?.removeEventListener('popstate',update);};},[page,url,onNavigate]);
 return <div className="rv-annotated"><div className="rv-phone"><iframe ref={frame} title="AI应用交互原型" src={initialUrl} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"/>{annotations&&marks.map(m=><span className="rv-pin" key={m.n} style={{left:m.x+1,top:m.y+1}}>{m.n}</span>)}</div>{annotations&&<aside className="rv-annotations"><h3>{titles[actual]||'关联页面'} · 入口标注</h3>{(appEdges[actual]||[]).map((e,i)=><article key={e.action}><strong>{i+1}. {e.action}</strong><p>{e.condition}</p><button onClick={()=>open(e.target)}>查看{titles[e.target]}</button></article>)}</aside>}</div>
}

