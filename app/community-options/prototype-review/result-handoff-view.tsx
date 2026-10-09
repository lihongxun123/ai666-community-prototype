'use client';
/* oxlint-disable next/no-img-element -- Local concept sample. */
import {useEffect,useRef,useState} from 'react';
import rules from './result-handoff.json';
import './result-handoff.css';
type Kind='image'|'video'|'text';
const labels={image:'图片',video:'视频',text:'文本'};
type Outcome='success'|'connection'|'media';
type Stage='source'|'pending'|'success'|'connection'|'media';
const image='/home-prototype/sea.png';

export function ResultHandoff({mode}:{mode:string}){
 const [device,setDevice]=useState<'pc'|'mobile'>('pc');
 const [kind,setKind]=useState<Kind>('image');
 const [sourceVideo,setSourceVideo]=useState('');
 const [sourceText,setSourceText]=useState('');
 const [stage,setStage]=useState<Stage>('source'),[outcome,setOutcome]=useState<Outcome>('success'),[notice,setNotice]=useState(''),[hasCanvas,setHasCanvas]=useState(false),[missingPrompt,setMissingPrompt]=useState(false);
 const [revision,setRevision]=useState(0);
 const frame=useRef<HTMLIFrameElement>(null);
 const [originalPrompt,setOriginalPrompt]=useState('');
 const [sourceImage,setSourceImage]=useState(image);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const lock=useRef(false);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const reset=()=>{if(timer.current)clearTimeout(timer.current);lock.current=false;setStage('source');setHasCanvas(false);setNotice('');setRevision(v=>v+1);};
 const start=()=>{if(lock.current)return;if(hasCanvas){setStage('success');return;}lock.current=true;setNotice('');setStage('pending');timer.current=setTimeout(()=>{setStage(outcome);if(outcome==='success')setHasCanvas(true);lock.current=false;},900);};
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||event.data?.type!=='result-handoff-action')return;if(event.data.action==='return'){setStage('source');return;}if(event.data.action==='start'){setOriginalPrompt(event.data.prompt);setSourceImage(event.data.image);setSourceVideo(event.data.video);setSourceText(event.data.text);start();}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);});
 const syncFrame=()=>frame.current?.contentWindow?.postMessage({type:'result-handoff-state',stage,hasCanvas},window.location.origin);
 useEffect(()=>{syncFrame();},[stage,hasCanvas]);
 const copy=async()=>{try{await navigator.clipboard.writeText(originalPrompt);setNotice('提示词已复制');}catch{setNotice('复制失败，请选择提示词手动复制');}};
 const table=(rows:string[][])=><table><tbody>{rows.map(([name,text])=><tr key={name}><th scope="row">{name}</th><td>{text}</td></tr>)}</tbody></table>;
 return <section className="rh-root">{mode!=='prototype'&&<header className="rh-heading"><h2>{rules.title}</h2><p>{rules.status}</p></header>}
 {mode==='plan'?<><h3>用户目标</h3><p>{rules.purpose}</p><h3>本轮范围</h3><p>{rules.scope}</p><h3>业务方案</h3>{table(rules.rules.filter((_,i)=>[0,1,2,3,4,9,10].includes(i)))}<h3>原型展示</h3><p>{rules.presentation}</p><h3>研发待核</h3><ul>{rules.handoff.map(x=><li key={x}>{x}</li>)}</ul></>:
 mode==='requirements'?<><p>{rules.scope}</p><h3>交互规则</h3>{table(rules.rules)}<h3>必要状态</h3>{table(rules.states)}<h3>验收条件</h3><ul>{rules.acceptance.map(x=><li key={x}>{x}</li>)}</ul><h3>研发待核</h3><ul>{rules.handoff.map(x=><li key={x}>{x}</li>)}</ul></>:
 mode==='flow'?<><ol className="rh-flow">{rules.flow.map(x=><li key={x}>{x}</li>)}</ol><h3>移动端</h3><p>{rules.rules[10]?.[1]}</p><h3>异常与恢复</h3><p>连接失败 / 素材接收失败 → 提示原因 → 重试本次交接，或返回原结果。</p><p>重试时已成功 → 打开本次画布；尚未成功 → 继续处理。不能因重试重复创建画布。</p><h3>完成边界</h3><p>{rules.rules[3][1]}</p><p>{rules.rules[9][1]}</p></>:
 <><nav className="rh-types" aria-label="设备">{(['pc','mobile'] as const).map(value=><button key={value} aria-pressed={device===value} onClick={()=>{setDevice(value);reset();}}>{value==='pc'?'PC端':'移动端'}</button>)}</nav><nav className="rh-types" aria-label="生成结果类型">{(['image','video','text'] as Kind[]).map(value=><button key={value} aria-pressed={kind===value} onClick={()=>{setKind(value);reset();}}>{labels[value]}结果</button>)}</nav>{device==='pc'&&<details className="rh-settings"><summary>演示设置</summary><div className="rh-review"><strong>原型演示 · PC继续创作</strong><span>本地模拟，不连接账号、不上传素材、不创建真实画布。</span><label>本次接收结果 <select aria-label="本次接收结果" value={outcome} disabled={stage==='pending'} onChange={e=>setOutcome(e.target.value as Outcome)}><option value="success">成功</option><option value="connection">连接失败</option><option value="media">素材接收失败</option></select></label><label><input type="checkbox" checked={missingPrompt} disabled={stage!=='source'||hasCanvas} onChange={e=>setMissingPrompt(e.target.checked)}/>原提示词缺失</label><button onClick={reset}>重新演示</button></div></details>}
 <div className={'rh-source-frame'+(device==='mobile'?' rh-mobile-frame':'')} hidden={stage==='success'}><iframe key={revision} ref={frame} onLoad={syncFrame} title="已定稿的 AIGC 生成结果页" src={'/community-options/c-prototype?page=create-result&device='+device+'&state='+ (kind==='image'?'normal':'result-'+kind)+'&embed=1&task=sample-light-'+kind+'-complete&handoffReview=result-'+kind+'&missingPrompt='+(missingPrompt?'1':'0')}/></div>
 {stage==='success'&&<div className="rh-screen"><header className="rh-app-header"><strong>{stage==='success'?'MakeNow · 新画布':'多元拾光 · 生成结果'}</strong>{stage==='success'&&<button onClick={()=>{setStage('source');setNotice('');}}>返回结果</button>}</header>
 <div className="rh-destination"><div className="rh-canvas"><span className="rh-success" role="status">{labels[kind]}已添加到画布</span><figure>{kind==='image'?<img src={sourceImage} alt="已带入画布的生成图片"/>:kind==='video'?<video controls playsInline preload="metadata" src={sourceVideo} aria-label="已带入画布的生成视频"/>:<div className="rh-text-result" aria-label="已带入画布的生成文本">{sourceText}</div>}<figcaption>{labels[kind]}素材</figcaption></figure><span>新画布 · 100%</span></div><aside><h3>素材信息</h3><p>来源：多元拾光</p><p>类型：{labels[kind]}</p><h3>原提示词</h3><p className="rh-prompt">{missingPrompt?'未记录':originalPrompt}</p>{!missingPrompt&&<button onClick={copy}>复制</button>}<p role="status">{notice}</p></aside></div></div>} </>}
 </section>;
}
