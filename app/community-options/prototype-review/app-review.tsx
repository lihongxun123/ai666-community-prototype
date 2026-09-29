'use client';
import {MobileBrowserFrame} from './mobile-browser-frame';
import {DocumentBlocks} from './document-blocks';
import {useEffect,useRef,useState} from 'react';
import cRequirements from '../../../design-notes/requirements-c-flows.md?raw';
import crossRequirements from '../../../design-notes/requirements-cross-product.md?raw';
export const appReviewPages=['apps','app'];
export const appReviewIds:Record<string,string>={apps:'C-APP-01',app:'C-APP-02'};
type Edge={action:string;target:string;condition:string;match?:string};
export const appEdges:Record<string,Edge[]>={
 apps:[{action:'选择应用',match:'文案改写',target:'app',condition:'进入对应应用详情，保留应用身份'}],
 app:[{action:'在 MakeNow 中使用',target:'cross:app',condition:'当前可用且设备支持；进入 MakeNow 承接演示，不在社区提交或扣费'},{action:'获取电脑端链接',target:'pc-handoff',condition:'手机访问电脑专属能力，复制同一应用详情以便在电脑继续'}]
};
const titles:Record<string,string>={apps:'应用列表',app:'应用详情','pc-handoff':'电脑端继续','cross:app':'MakeNow 应用承接'};
const pageFacts:Record<string,{fields:string;rules:string;source:string}>={
 apps:{fields:'应用名称、效果图、任务分类和当前可用状态。',rules:'社区负责应用露出与发现，列表进入原应用介绍；同一应用不因设备重复建档。',source:'C端需求 §4.4'},
 app:{fields:'用途、效果、准备材料、输出说明、提供方、MakeNow 使用入口与设备条件。',rules:'全部应用由 MakeNow 执行；输入、参数、费用、任务及结果在 MakeNow 确认和查看。社区不预占积分、不生成任务、不自动回流结果。电商 Agent 未上线，不提供入口。真实定向链接待配置，当前仅演示承接。',source:'C端需求 §4.4；跨产品需求 §2'}
};
function section(text:string,start:string,end:string){return text.slice(text.indexOf(start),text.indexOf(end,text.indexOf(start)));}
export function AppRequirements({page}:{page:string}){
 const [source,setSource]=useState('page');
 const cSection=section(cRequirements,'### 4.4 ','### 4.5 ');

 const crossSection=section(crossRequirements,'## 2.','## 3.');
 return <section className="rv-requirements"><h3>{appReviewIds[page]} · {titles[page]}</h3><div className="rv-pages"><button aria-pressed={source==='page'} onClick={()=>setSource('page')}>页面需求</button><button aria-pressed={source==='module'} onClick={()=>setSource('module')}>模块规则</button></div>{source==='page'?<><table><thead><tr><th>动作</th><th>去向</th><th>条件与边界</th></tr></thead><tbody>{appEdges[page].map(e=><tr key={e.action}><td>{e.action}</td><td>{titles[e.target]}</td><td>{e.condition}</td></tr>)}</tbody></table><h3>必要信息</h3><p>{pageFacts[page].fields}</p><h3>业务规则</h3><p>{pageFacts[page].rules}</p><h3>两端差异</h3><p>共享应用身份与内容。手机端优先排列当前可用应用，不显示设备筛选；需要电脑操作的能力在详情引导。执行位置与设备支持分别判断。</p></>:<><DocumentBlocks text={cSection}/><DocumentBlocks text={crossSection}/></>}</section>
}
export function AppFlow({open}:{open:(target:string)=>void}){return <section className="rv-requirements"><h3>AI应用 · 模块流程</h3><div className="rv-flow">{appReviewPages.map((id,i)=><div key={id}><button onClick={()=>open(id)}><small>{appReviewIds[id]}</small>{titles[id]}</button>{i<appReviewPages.length-1&&<span>→</span>}</div>)}</div><p>社区发现应用 → 阅读介绍 → MakeNow 使用。设备限制只影响继续方式，不改变执行平台。</p><table><thead><tr><th>起点</th><th>触发动作</th><th>条件</th><th>去向</th></tr></thead><tbody>{Object.entries(appEdges).flatMap(([id,edges])=>edges.map(e=><tr key={id+e.action}><td>{titles[id]}</td><td>{e.action}</td><td>{e.condition}</td><td><button onClick={()=>open(e.target)}>{titles[e.target]}</button></td></tr>))}</tbody></table><p>当前承接页为原型演示，真实 MakeNow 定向链接待配置。社区内旧应用输入、任务、结果页面已退出目录，旧链接回到应用介绍。</p></section>}
export function AnnotatedApp({page,url,annotations,open,onNavigate}:{page:string;url:string;annotations:boolean;open:(target:string)=>void;onNavigate:(id:string,search:string,section?:string)=>void}){
 const [initialUrl]=useState(url);const frame=useRef<HTMLIFrameElement>(null),[actual,setActual]=useState(page),[marks,setMarks]=useState<{n:number;x:number;y:number}[]>([]);
 useEffect(()=>{const el=frame.current;if(!el)return;let observer:MutationObserver|undefined;let win:Window|null=null;
 const update=()=>{try{const w=el.contentWindow;if(!w)return;const u=new URL(w.location.href);const id=u.searchParams.get('page')||page;setActual(id);if(u.pathname.endsWith('/c-prototype'))onNavigate(id,u.search,'c');else if(u.pathname.endsWith('/cross-prototype'))onNavigate(id,u.search,'cross');const edges=appEdges[id]||[];const buttons=Array.from(w.document.querySelectorAll('button'));setMarks(edges.flatMap((edge,n)=>{const button=buttons.find(b=>b.textContent?.includes(edge.match||edge.action));if(!button)return [];const r=button.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<el.clientHeight?[{n:n+1,x:Math.max(0,Math.min(r.left,350)),y:Math.max(0,r.top)}]:[]}));}catch{setMarks([])}};
 const bind=()=>{observer?.disconnect();win?.removeEventListener('scroll',update);win?.removeEventListener('popstate',update);try{win=el.contentWindow;if(win){observer=new MutationObserver(update);observer.observe(win.document.body,{childList:true,subtree:true,attributes:true});win.addEventListener('scroll',update);win.addEventListener('popstate',update);}}catch{}update()};el.addEventListener('load',bind);bind();return()=>{el.removeEventListener('load',bind);observer?.disconnect();win?.removeEventListener('scroll',update);win?.removeEventListener('popstate',update);};},[page,url,onNavigate]);
 return <div className="rv-annotated"><div className="rv-phone"><MobileBrowserFrame><iframe ref={frame} title="AI应用交互原型" src={initialUrl} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"/>{annotations&&marks.map(m=><span className="rv-pin" key={m.n} style={{left:m.x+1,top:m.y+1}}>{m.n}</span>)}</MobileBrowserFrame></div>{annotations&&<aside className="rv-annotations"><h3>{titles[actual]||'关联页面'} · 入口标注</h3>{(appEdges[actual]||[]).map((e,i)=><article key={e.action}><strong>{i+1}. {e.action}</strong><p>{e.condition}</p><button onClick={()=>open(e.target)}>查看{titles[e.target]}</button></article>)}</aside>}</div>
}

