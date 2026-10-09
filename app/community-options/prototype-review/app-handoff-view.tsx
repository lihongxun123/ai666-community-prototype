'use client';
import {useEffect,useRef,useState} from 'react';
import rules from './app-handoff.json';
import './result-handoff.css';
export function AppHandoff({mode}:{mode:string}){
 const [device,setDevice]=useState('pc'),[state,setState]=useState('normal'),[target,setTarget]=useState(''),[example,setExample]=useState('suite');
 const frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin===location.origin&&event.source===frame.current?.contentWindow&&event.data?.type==='app-handoff-open'&&device==='pc')setTarget(String(event.data.title));};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[device]);
 const table=<table><tbody>{rules.rules.map(([name,text])=><tr key={name}><th>{name}</th><td>{text}</td></tr>)}</tbody></table>;
 const src='/community-options/c-prototype?page=app&device='+device+'&embed=1&handoffReview=app&id='+(state==='missing'?'app-weekly':'app-'+example)+'&state='+(state==='missing'?'normal':state);
 return <section className="rh-root">
 {mode==='prototype'?<><nav className="rh-types" aria-label="设备">{['pc','mobile'].map(d=><button key={d} aria-pressed={device===d} onClick={()=>{setDevice(d);setTarget('');}}>{d==='pc'?'PC端':'移动端'}</button>)}</nav><nav className="rh-types" aria-label="应用案例">{[['suite','电商套图'],['weekly','周报总结'],['storyboard','分镜质检']].map(([id,label])=><button key={id} aria-pressed={example===id} onClick={()=>{setExample(id);setTarget('');}}>{label}</button>)}<a href="/community-options/c-prototype?page=topic&theme=launch&device=pc">商品上新专题</a><a href={'/community-options/b-prototype?page=app-edit&id=app-'+example}>后台维护</a></nav><details className="rh-settings"><summary>演示设置</summary><div className="rh-review"><label>应用状态 <select value={state} onChange={e=>{setState(e.target.value);setTarget('');}}><option value="normal">可用入口示例</option><option value="missing">入口缺失</option><option value="paused">应用暂停</option><option value="removed">社区下架</option></select></label><span>本地模拟；样例地址未验证线上可用性。</span></div></details>{target?<div className="rh-screen"><header className="rh-app-header"><strong>MakeNow · 对应应用</strong><button onClick={()=>setTarget('')}>返回应用详情</button></header><div className="rh-canvas"><h2>{target}</h2><p>准备材料 → 使用应用 → 查看结果</p><p>承接对象示意，实际入口待核实。</p></div></div>:<div className={'rh-source-frame'+(device==='mobile'?' rh-mobile-frame':'')}><iframe ref={frame} key={device+state+example} title="AI应用内容详情" src={src}/></div>}</>:
 <><header className="rh-heading"><h2>{rules.title}</h2><p>{rules.status}</p></header><p>{rules.scope}</p>{mode==='flow'?<ol className="rh-flow">{rules.flow.map(x=><li key={x}>{x}</li>)}</ol>:table}{mode==='requirements'&&<><h3>验收条件</h3><ul>{rules.acceptance.map(x=><li key={x}>{x}</li>)}</ul></>}<h3>研发待核</h3><ul>{rules.handoff.map(x=><li key={x}>{x}</li>)}</ul></>}
 </section>;
}
