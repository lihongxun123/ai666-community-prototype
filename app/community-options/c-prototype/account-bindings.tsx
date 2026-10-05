'use client';
/* eslint-disable next/no-img-element -- The local demonstration QR asset is displayed at its native dimensions. */
import {TransientFeedback} from './transient-feedback';
import {useEffect,useRef,useState} from 'react';
import {prototypeStore} from './storage';
import './account-bindings.css';

type Kind='phone'|'wechat';
// Local demonstration only: no SMS, authorization, or account mutation requests.
export function AccountBindings(){
 const [sample]=useState(()=>typeof window==='undefined'?'':new URLSearchParams(window.location.search).get('reviewOverlay')||'');
 const review=sample.startsWith('account-');
 const [phone,setPhone]=useState(()=>review?sample!=='account-phone'&&sample!=='account-last-method':prototypeStore.getItem('cp-demo-bound-phone')==='1');
 const [wechat,setWechat]=useState(()=>review?sample!=='account-wechat':prototypeStore.getItem('cp-demo-bound-wechat')!=='0');
 const [kind,setKind]=useState<Kind|null>(()=>review?sample.includes('phone')?'phone':'wechat':null),[mode,setMode]=useState<'manage'|'bind'|'unlink'>(()=>review?(sample.includes('unlink')||sample==='account-last-method'?'unlink':'bind'):'manage');
 const [number,setNumber]=useState(''),[code,setCode]=useState(''),[sent,setSent]=useState(false),[remaining,setRemaining]=useState(0),[verified,setVerified]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const node=dialog.current;if(kind)node?.showModal();return()=>node?.close();},[kind]);
 useEffect(()=>{if(!remaining)return;const timer=window.setTimeout(()=>{setRemaining(remaining-1);if(remaining===1)setSent(false);},1000);return()=>window.clearTimeout(timer);},[remaining]);
 const bound=kind==='phone'?phone:wechat,alternative=kind==='phone'?wechat:phone;
 const close=()=>setKind(null);
 const open=(next:Kind)=>{setKind(next);setMode((next==='phone'?phone:wechat)?'manage':'bind');setNumber('');setCode('');setSent(false);setRemaining(0);setVerified(false);setError('');setNotice('');};
 const verifying=mode==='bind'&&bound&&!verified;
 const qr=verifying?!phone:kind==='wechat'&&mode==='bind'||kind==='phone'&&mode==='unlink';
 const title=mode==='manage'?(kind==='phone'?'手机号':'微信'):(mode==='unlink'?'解绑':bound?'更换':'绑定')+(kind==='phone'?'手机号':'微信');
 const finish=()=>{
   if(!qr&&(!sent||!/^\d{6}$/.test(code))){setError('请获取并填写 6 位验证码');return;}
   if(verifying){setVerified(true);setSent(false);setRemaining(0);setCode('');setError('');return;}
   if(mode==='unlink'&&!alternative){setError('请先绑定另一种登录方式');return;}
   if(kind==='phone'){setPhone(mode!=='unlink');if(!review)prototypeStore.setItem('cp-demo-bound-phone',mode==='unlink'?'0':'1');}
   else{setWechat(mode!=='unlink');if(!review)prototypeStore.setItem('cp-demo-bound-wechat',mode==='unlink'?'0':'1');}
   setNotice(title+'成功');close();
 };
 return <section className="cp-account-bindings"><h2>账号与绑定</h2>
   <button className="cp-binding-row" onClick={()=>open('phone')}><span>手机号<small>{phone?'138 **** 0000':'绑定后可使用手机号登录'}</small></span><em>{phone?'管理':'去绑定'} ›</em></button>
   <button className="cp-binding-row" onClick={()=>open('wechat')}><span>微信<small>{wechat?'微信账号已绑定':'绑定后可使用微信登录'}</small></span><em>{wechat?'管理':'去绑定'} ›</em></button>
   <TransientFeedback message={notice} onClear={()=>setNotice('')}/>
   {kind&&<dialog ref={dialog} className="cp-binding-dialog" onCancel={close} aria-labelledby="binding-title"><header><h2 id="binding-title">{title}</h2><button aria-label="关闭账号绑定" onClick={close} data-dismiss-icon="true"><img src="/home-prototype/icons/close-line.svg" alt="" /></button></header>
   {mode==='manage'?<><p>{bound?'当前已绑定，可更换登录方式。':'绑定后可使用该方式登录同一账号。'}</p><div className="cp-binding-actions"><button onClick={()=>setMode('bind')}>{bound?'更换绑定':'立即绑定'}</button>{bound&&<button className="secondary" onClick={()=>{setError('');setMode('unlink');}}>解绑</button>}</div></>:mode==='unlink'&&!alternative?<><p>这是当前唯一的登录方式，请先绑定{kind==='phone'?'微信':'手机号'}，再进行解绑。</p><div className="cp-binding-actions"><button onClick={()=>open(kind==='phone'?'wechat':'phone')}>去绑定{kind==='phone'?'微信':'手机号'}</button></div></>:<>
   <p>{mode==='unlink'?'解绑后将无法使用该方式登录，已有内容和积分保留。请通过另一种已绑定方式验证身份。':bound?'验证通过后替换原绑定，取消或失败时保留原绑定。':'绑定到当前账号，不会创建新的社区账号。'}</p>
   {qr?<div className="cp-binding-qr"><img src="/demo-login-qr.svg" alt="微信绑定二维码示意"/><p>{mode==='unlink'||verifying?'使用已绑定微信扫码验证身份':'使用微信扫码授权绑定'}</p><button onClick={()=>setNotice('二维码已刷新')}>刷新二维码</button></div>:<div className="cp-binding-fields">{mode==='bind'&&!verifying?<label>{bound?'新手机号':'手机号'}<input inputMode="tel" value={number} maxLength={11} placeholder="请输入手机号" onChange={e=>{setNumber(e.target.value);setSent(false);setCode('');}}/></label>:<p>验证已绑定手机号：138 **** 0000</p>}<label>验证码<div><input inputMode="numeric" value={code} maxLength={6} placeholder="请输入验证码" onChange={e=>setCode(e.target.value)}/><button disabled={sent} onClick={()=>{if(mode==='bind'&&!verifying&&!/^1\d{10}$/.test(number)){setError('请输入正确的手机号');return;}setSent(true);setRemaining(60);setError('');}}>{sent?remaining+'秒后重发':'获取验证码'}</button></div></label></div>}
   {error&&<p role="alert">{error}</p>}<div className="cp-binding-actions"><button className="secondary" onClick={close}>取消</button><button onClick={finish}>{verifying?'验证并继续':mode==='unlink'?'确认解绑':'确认绑定'}</button></div>
   </>}
   </dialog>}
 </section>;
}
