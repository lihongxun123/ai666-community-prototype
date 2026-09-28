 'use client';
import {useState,useSyncExternalStore,useRef,useEffect} from 'react';
import './states.css';
import {CrossPageScenario,crossPageCases} from './cross-page-scenarios';
const sub=()=>()=>{};
export default function CommonDemo(){const sample=useSyncExternalStore(sub,()=>new URLSearchParams(location.search).get('sample')||'submit',()=> 'submit');const [phase,setPhase]=useState('idle'),[value,setValue]=useState(''),[attempt,setAttempt]=useState(0);const lock=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 const run=(end:string)=>{if(lock.current)return;lock.current=true;setPhase('pending');timer.current=setTimeout(()=>{lock.current=false;setPhase(end);if(sample==='success'&&end==='done')timer.current=setTimeout(()=>setPhase('idle'),1800)},1200)};
 const cancel=()=>{if(timer.current)clearTimeout(timer.current);lock.current=false;setPhase('idle')};
 if(crossPageCases.includes(sample))return <CrossPageScenario key={sample} sample={sample}/>;
 if(['more-loading','end'].includes(sample))return <main className="gs-sample">{['已加载内容一','已加载内容二','已加载内容三'].map(t=><div className="gs-items" key={t}>{t}</div>)}<output>{sample==='end'?'没有更多了':'正在加载更多…'}</output></main>;
 if(sample==='upload')return <main className="gs-sample"><p>示例图片.png</p>{phase==='pending'?<><progress aria-label="上传进度"/><output>上传中…</output><button onClick={cancel}>取消</button></>:phase==='failed'?<><p role="alert">上传失败，请重试</p><button onClick={()=>run('done')}>重试上传</button></>:phase==='done'?<output>上传完成</output>:<button onClick={()=>run('failed')}>开始上传演示</button>}</main>;
 return <main className="gs-sample"><label>内容<textarea value={value} onChange={e=>{setValue(e.target.value);if(phase==='invalid')setPhase('idle')}} disabled={phase==='pending'||(phase==='done'&&sample!=='success')} aria-invalid={phase==='invalid'} aria-describedby={phase==='invalid'?'field-error':undefined}/></label>{phase==='invalid'&&<p id="field-error" role="alert">请填写内容</p>}{phase==='failed'&&<p role="alert">操作失败，已填写的内容已保留</p>}{phase==='done'&&sample==='success'&&<output className="gs-toast">操作成功</output>}{phase==='done'&&sample!=='success'?<output>操作成功</output>:<button disabled={phase==='pending'} onClick={()=>{if(sample==='validation'&&!value.trim()){setPhase('invalid');return}const fail=sample==='action-error'&&attempt===0;setAttempt(n=>n+1);run(fail?'failed':'done')}}>{phase==='pending'?'提交中…':phase==='failed'?'重试':'提交'}</button>}</main>;
}
