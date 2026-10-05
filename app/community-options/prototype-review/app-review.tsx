'use client';
import {MobileBrowserFrame} from './mobile-browser-frame';
import {useEffect,useRef,useState} from 'react';
export const appReviewPages=['apps','app'];
export const appReviewIds:Record<string,string>={apps:'C-APP-01',app:'C-APP-02'};
type Edge={action:string;target:string;condition:string;match?:string};
export const appEdges:Record<string,Edge[]>={
 apps:[{action:'选择应用',match:'文案改写',target:'app',condition:'进入对应应用详情，保留应用身份'}],
 app:[{action:'在 MakeNow 中使用',target:'cross:app',condition:'目标有效且设备支持；打开配置的MakeNow入口，执行和计费由MakeNow负责'},{action:'获取电脑端链接',target:'app',condition:'手机访问PC专属能力时，在详情弹层复制电脑端链接'}]
};
const titles:Record<string,string>={apps:'应用列表',app:'应用详情','app?item=video':'应用详情内轻弹层','cross:app':'MakeNow 应用承接'};
export function AppFlow({open}:{open:(target:string)=>void}){return <section className="rv-requirements"><h3>AI应用 · 模块流程</h3><div className="rv-flow">{appReviewPages.map((id,i)=><div key={id}><button onClick={()=>open(id)}><small>{appReviewIds[id]}</small>{titles[id]}</button>{i<appReviewPages.length-1&&<span>→</span>}</div>)}</div><p>社区发现应用 → 阅读介绍 → MakeNow 使用。设备限制只影响继续方式，不改变执行平台。</p><table><thead><tr><th>起点</th><th>触发动作</th><th>条件</th><th>去向</th></tr></thead><tbody>{Object.entries(appEdges).flatMap(([id,edges])=>edges.map(e=><tr key={id+e.action}><td>{titles[id]}</td><td>{e.action}</td><td>{e.condition}</td><td><button onClick={()=>open(e.target)}>{titles[e.target]}</button></td></tr>))}</tbody></table><p>按应用配置打开有效MakeNow地址，使用同一账号；素材传递和结果回传尚未提供。</p></section>}
export function AnnotatedApp({page,url,annotations,open,onNavigate}:{page:string;url:string;annotations:boolean;open:(target:string)=>void;onNavigate:(id:string,search:string,section?:string)=>void}){
 const [initialUrl]=useState(url);const frame=useRef<HTMLIFrameElement>(null),[actual,setActual]=useState(page),[marks,setMarks]=useState<{n:number;x:number;y:number}[]>([]);
 useEffect(()=>{const el=frame.current;if(!el)return;let observer:MutationObserver|undefined;let win:Window|null=null;
 const update=()=>{try{const w=el.contentWindow;if(!w)return;const u=new URL(w.location.href);const id=u.searchParams.get('page')||page;setActual(id);if(u.pathname.endsWith('/c-prototype'))onNavigate(id,u.search,'c');else if(u.pathname.endsWith('/cross-prototype'))onNavigate(id,u.search,'cross');const edges=appEdges[id]||[];const buttons=Array.from(w.document.querySelectorAll('button'));setMarks(edges.flatMap((edge,n)=>{const button=buttons.find(b=>b.textContent?.includes(edge.match||edge.action));if(!button)return [];const r=button.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<el.clientHeight?[{n:n+1,x:Math.max(0,Math.min(r.left,350)),y:Math.max(0,r.top)}]:[]}));}catch{setMarks([])}};
 const bind=()=>{observer?.disconnect();win?.removeEventListener('scroll',update);win?.removeEventListener('popstate',update);try{win=el.contentWindow;if(win){observer=new MutationObserver(update);observer.observe(win.document.body,{childList:true,subtree:true,attributes:true});win.addEventListener('scroll',update);win.addEventListener('popstate',update);}}catch{}update()};el.addEventListener('load',bind);bind();return()=>{el.removeEventListener('load',bind);observer?.disconnect();win?.removeEventListener('scroll',update);win?.removeEventListener('popstate',update);};},[page,url,onNavigate]);
 return <div className="rv-annotated"><div className="rv-phone"><MobileBrowserFrame><iframe ref={frame} title="AI应用交互原型" src={initialUrl} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"/>{annotations&&marks.map(m=><span className="rv-pin" key={m.n} style={{left:m.x+1,top:m.y+1}}>{m.n}</span>)}</MobileBrowserFrame></div>{annotations&&<aside className="rv-annotations"><h3>{titles[actual]||'关联页面'} · 入口标注</h3>{(appEdges[actual]||[]).map((e,i)=><article key={e.action}><strong>{i+1}. {e.action}</strong><p>{e.condition}</p><button onClick={()=>open(e.target)}>查看{titles[e.target]}</button></article>)}</aside>}</div>
}

