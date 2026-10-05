'use client';
/* eslint-disable next/no-img-element -- Local SVG icons match the prototype asset set. */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { prototypeStore as sessionStorage, currentTarget } from './storage';
import './creation-entry.css';

type CreationEntryProps = {
  go: (page: string) => void;
  label?: string;
  className?: string;
  children?: ReactNode;
  controlledOpen?: boolean;
  onClose?: () => void;
  onSelect?: (target: 'create' | 'publish') => void;
};

/** Shared home/personal entry: choose a creation or publishing path before navigation. */
export function CreationEntry({ go, label = '开始创作', className = '', children, controlledOpen, onClose, onSelect }: CreationEntryProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = (value: boolean) => { setLocalOpen(value); if (!value) onClose?.(); };
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const desktop=typeof window!=='undefined'&&new URLSearchParams(location.search).get('device')==='pc';

  useEffect(() => {
    if (!open || (desktop&&!onSelect)) return;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
      if (event.key === 'Tab') {
        const buttons = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button') || []);
        if (!buttons.length) return;
        if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
      }
    };
    window.addEventListener('keydown', onKey);


  return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const select = (target: 'create' | 'publish' | 'flash') => {
    setLocalOpen(false);
    if (onSelect && target !== 'flash') { onClose?.(); onSelect(target); return; }
    ['cp-activity', 'cp-activity-code', 'cp-activity-name', 'cp-activity-task'].forEach(key => sessionStorage.removeItem(key));
    if (target !== 'create') {
      sessionStorage.setItem('cp-post-kind', target === 'flash' ? 'post' : 'work');
      sessionStorage.removeItem('cp-circle');
      sessionStorage.removeItem('cp-source');
      sessionStorage.removeItem('cp-result');
    }
    const page = target === 'create' ? 'create' : (target === 'flash' ? 'post-publish' : 'post-edit') + '?entry=' + target + '-' + Date.now();
    if (sessionStorage.getItem('cp-auth') !== '1') {
      sessionStorage.setItem('cp-login-background', currentTarget());
      sessionStorage.setItem('cp-return', page);
      go('login');
      return;
    }
    go(page);
  };

    if(desktop&&!onSelect)return controlledOpen===false?null:<div className="cp-creation-desktop-links"><button onClick={()=>select('create')}>AIGC 生成</button><button onClick={()=>select('publish')}>发布作品</button>{!onSelect&&<button onClick={()=>select('flash')}>发布帖子</button>}</div>;
  return (
    <>
      {controlledOpen === undefined && <button ref={trigger} type="button" className={`cp-creation-trigger ${className}`} onClick={() => setOpen(true)}>
        {children || <><img src="/home-prototype/icons/sparkling-line.svg" alt="" />{label}</>}
      </button>}
      {open && typeof document !== 'undefined' && createPortal(
        <div className={"cp-creation-overlay"+(desktop?" is-desktop":"")}>
          <button type="button" className="cp-creation-backdrop" aria-label="关闭创作与发布方式" onClick={() => setOpen(false)} />
          <dialog ref={panel} open className="cp-creation-panel" aria-modal="true" aria-label="选择创作与发布方式">
            <div className="cp-creation-heading"><strong>{onSelect?"选择参与方式":"创作与发布"}</strong><button type="button" aria-label="关闭" onClick={() => { setOpen(false); trigger.current?.focus(); }}><img src="/home-prototype/icons/close-line.svg" alt="" /></button></div>
            <button type="button" className="cp-creation-option" aria-label="AIGC 生成" onClick={() => select('create')}>
              <span className="cp-creation-icon" aria-hidden="true"><img src="/home-prototype/icons/sparkling-line.svg" alt="" /></span><span><strong>AIGC 生成</strong><small>把灵感变成作品</small></span><img className="cp-creation-arrow" src="/home-prototype/icons/arrow-right-s-line.svg" alt="" />
            </button>
            <button type="button" className="cp-creation-option" aria-label="直接发布" onClick={() => select('publish')}>
              <span className="cp-creation-icon" aria-hidden="true"><img src="/home-prototype/icons/image-line.svg" alt="" /></span><span><strong>直接发布</strong><small>上传已有作品</small></span><img className="cp-creation-arrow" src="/home-prototype/icons/arrow-right-s-line.svg" alt="" />
            </button>
            {!onSelect && <button type="button" className="cp-creation-option" aria-label="发布帖子" onClick={() => select('flash')}>
              <span className="cp-creation-icon" aria-hidden="true"><img src="/home-prototype/icons/chat-3-line.svg" alt="" /></span><span><strong>发布帖子</strong><small>分享问题、过程或经验</small></span><img className="cp-creation-arrow" src="/home-prototype/icons/arrow-right-s-line.svg" alt="" />
            </button>}
          </dialog>
        </div>, document.body
      )}
    </>
  );
}
