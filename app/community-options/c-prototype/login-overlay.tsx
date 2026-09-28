'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { prototypeStore as sessionStorage } from './storage';
import './login-overlay.css';

type LoginOverlayProps = { state: string; go: (page: string) => void };

/** Prototype-only login; form values stay in component state and no real auth request is made. */
export function LoginOverlay({ state, go }: LoginOverlayProps) {
  const isPc = useSyncExternalStore(() => () => {}, () => {
    return new URLSearchParams(window.location.search).get('device') === 'pc';
  }, () => false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [invite, setInvite] = useState('');
  const [message, setMessage] = useState('');
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
    if (!/^1\d{10}$/.test(phone)) { setMessage('请输入 11 位手机号。'); return; }
    if (!/^\d{6}$/.test(code)) { setMessage('请输入 6 位验证码。'); return; }
    // Only a demo login flag is saved. The phone, code and invitation stay in memory.
    sessionStorage.setItem('cp-auth', '1');
    const target = sessionStorage.getItem('cp-return') || sessionStorage.getItem('cp-login-background') || 'home';
    sessionStorage.removeItem('cp-return');
    sessionStorage.removeItem('cp-login-background');
    go(state === 'activity-ended' ? 'activity' : state === 'object-gone' ? 'mine' : target);
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className={`cp-login-overlay ${isPc ? 'is-pc' : 'is-mobile'}`}>
      <button type="button" className="cp-login-backdrop" aria-label="关闭登录" onClick={close} />
      <dialog ref={dialog} open className="cp-login-dialog" aria-modal="true" aria-labelledby="cp-login-title">
        <button ref={closeButton} type="button" className="cp-login-close" aria-label="关闭登录" onClick={close}>×</button>
        <section className="cp-login-phone">
          <p className="cp-login-eyebrow">多元拾光</p>
          <h2 id="cp-login-title">手机验证码登录</h2>
          <p className="cp-login-muted">输入手机号和验证码登录</p>
          {state === 'expired' && <p className="cp-login-message">登录状态已过期，请重新验证。</p>}
          {state === 'activity-ended' && <p className="cp-login-message">活动已结束，不能继续投稿。</p>}
          {state === 'object-gone' && <p className="cp-login-message">原目标已失效，请返回查看。</p>}
          <form onSubmit={(event) => { event.preventDefault(); complete(); }}>
            <label>手机号<input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={11} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="请输入手机号" /></label>
            <label>验证码<span className="cp-login-code"><input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} placeholder="请输入验证码" /><button type="button" onClick={() => { if (!/^1\d{10}$/.test(phone)) { setMessage('请先输入 11 位手机号。'); return; } setCode('123456'); setMessage('演示验证码已填入。'); }}>获取验证码</button></span></label>
            <label><span>邀请码 <small>选填</small></span><input type="text" autoComplete="off" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="请输入邀请码（选填）" /></label>
            {message && <output className="cp-login-message">{message}</output>}
            <button type="submit" className="cp-login-submit">登录</button>
          </form>
          <button type="button" className="cp-login-more" onClick={() => setShowQr(true)}>更多登录方式 <span>微信扫码登录 ›</span></button>
          <p className="cp-login-terms">登录即表示同意 <a href="https://www.ai666.net/privacy.html#terms" target="_blank" rel="noreferrer">《用户协议》</a>和<a href="https://www.ai666.net/privacy.html#privacy" target="_blank" rel="noreferrer">《隐私政策》</a></p>
        </section>
        <section className={`cp-login-scan${showQr ? ' is-visible' : ''}`} aria-label="微信扫码登录">
          <button type="button" className="cp-login-scan-back" onClick={() => setShowQr(false)}>‹ 返回手机号登录</button>
          <h3>微信扫码登录</h3>
          <p>使用微信 APP 扫码登录</p>
          <div className="cp-login-qr-placeholder" aria-label="暂时无法获取二维码"><span>暂时无法获取二维码</span><button type="button" onClick={() => setMessage('暂时无法获取二维码，请使用手机号登录。')}>重试</button></div>
          {message && <output className="cp-login-message">{message}</output>}
        </section>
      </dialog>
    </div>, document.body
  ) : null;
}
