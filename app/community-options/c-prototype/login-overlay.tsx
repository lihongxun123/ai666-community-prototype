'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { prototypeStore as sessionStorage } from './storage';
import {bindDemoInviter,readDemoInviter} from './personal-benefits-data';
import './login-overlay.css';

type LoginOverlayProps = { state: string; go: (page: string) => void };

/** Prototype-only login; form values stay in component state and no real auth request is made. */
export function LoginOverlay({ state, go }: LoginOverlayProps) {
  const isPc = useSyncExternalStore(() => () => {}, () => {
    return new URLSearchParams(window.location.search).get('device') === 'pc';
  }, () => false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [invite, setInvite] = useState(()=>typeof window==='undefined'?'':new URLSearchParams(window.location.search).get('invite')||'');
  const [message, setMessage] = useState('');
  const [phoneError,setPhoneError]=useState('');
  const [codeError,setCodeError]=useState('');
  const [showQr, setShowQr] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    const target = sessionStorage.getItem('cp-login-background') || 'home';
    sessionStorage.removeItem('cp-return');
    sessionStorage.removeItem('cp-login-background');
    go(target);
  }, [go]);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    return () => { previousFocus.current?.focus(); };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (showQr) setShowQr(false);
        else close();
      }
      if (event.key !== 'Tab') return;
      const nodes = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]') || []).filter((node) => node.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showQr, close]);

  const complete = () => {
    const validPhone=/^1\d{10}$/.test(phone),validCode=/^\d{6}$/.test(code);
    setPhoneError(validPhone?'':'请输入 11 位手机号。');
    setCodeError(validCode?'':'请输入 6 位验证码。');
    if(!validPhone||!validCode)return;
    // Save the demo identity flag; phone and verification code stay in component memory.
    sessionStorage.setItem('cp-auth', '1');
    // Binding is a separate local demo result; its failure never prevents successful login.
    if(invite.trim()){
      const result=readDemoInviter()?{ok:false,message:'已绑定邀请人，原邀请关系保持不变。'}:bindDemoInviter(invite);
      sessionStorage.setItem('cp-demo-invite-feedback',result.message);
    }
    const target = sessionStorage.getItem('cp-return') || sessionStorage.getItem('cp-login-background') || 'home';
    sessionStorage.removeItem('cp-return');
    sessionStorage.removeItem('cp-login-background');
    go(state === 'activity-ended' ? 'activity' : state === 'object-gone' ? 'mine' : target);
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className={`cp-login-overlay ${isPc ? 'is-pc' : 'is-mobile'}`}>
      <button type="button" className="cp-login-backdrop" aria-label="关闭登录" onClick={close} />
      <dialog ref={dialog} open className="cp-login-dialog" aria-modal="true" aria-labelledby={showQr && !isPc ? 'cp-login-scan-title' : 'cp-login-title'}>
        <button ref={closeButton} type="button" className="cp-login-close" aria-label="关闭登录" onClick={close}>×</button>
        <section className="cp-login-phone">
          <h2 id="cp-login-title">手机验证码登录</h2>
          {state === 'expired' && <p className="cp-login-message">登录状态已过期，请重新验证。</p>}
          {state === 'activity-ended' && <p className="cp-login-message">活动已结束，不能继续投稿。</p>}
          {state === 'object-gone' && <p className="cp-login-message">原目标已失效，请返回查看。</p>}
          <form onSubmit={(event) => { event.preventDefault(); complete(); }}>
            <label>手机号<input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={11} value={phone} aria-invalid={Boolean(phoneError)} aria-describedby={phoneError?'login-phone-error':undefined} onChange={(event) => {setPhone(event.target.value.replace(/\D/g,''));setPhoneError('');}} placeholder="请输入手机号" />{phoneError&&<small id="login-phone-error" className="cp-login-field-error">{phoneError}</small>}</label>
            <label>验证码<span className="cp-login-code"><input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} aria-invalid={Boolean(codeError)} aria-describedby={codeError?'login-code-error':undefined} onChange={(event) => {setCode(event.target.value.replace(/\D/g,''));setCodeError('');}} placeholder="请输入验证码" /><button type="button" onClick={() => { if (!/^1\d{10}$/.test(phone)) { setPhoneError('请先输入 11 位手机号。'); return; } setCode('123456');setCodeError(''); setMessage(''); }}>获取验证码</button></span>{codeError&&<small id="login-code-error" className="cp-login-field-error">{codeError}</small>}</label>
            <label><span>邀请码 <small>选填</small></span><input type="text" autoComplete="off" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="请输入邀请码（选填）" /></label>
            {message && <output className="cp-login-message">{message}</output>}
            <button type="submit" className="cp-login-submit">登录</button>
          </form>
          <button type="button" className="cp-login-more" onClick={() => setShowQr(true)}>更多登录方式 <span>微信扫码登录 ›</span></button>
          <p className="cp-login-terms">登录即表示同意 <a href="https://www.ai666.net/privacy.html#terms" target="_blank" rel="noreferrer">《用户协议》</a>和<a href="https://www.ai666.net/privacy.html#privacy" target="_blank" rel="noreferrer">《隐私政策》</a></p>
        </section>
        <section className={`cp-login-scan${showQr ? ' is-visible' : ''}`} aria-label="微信扫码登录">
          <h3 id="cp-login-scan-title">微信扫码登录</h3>
          <div className="cp-login-qr-placeholder" role="img" aria-label="虚拟微信登录二维码" />
          {message && <output className="cp-login-message">{message}</output>}
          <button type="button" className="cp-login-scan-back" onClick={() => setShowQr(false)}>返回手机号登录</button>
        </section>
      </dialog>
    </div>, document.body
  ) : null;
}
