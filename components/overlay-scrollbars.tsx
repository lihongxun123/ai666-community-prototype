'use client';
import {useEffect} from 'react';

// Native scrolling remains intact; only its gutters are replaced by overlay handles.
export default function OverlayScrollbars() {
  useEffect(() => {
    const root = document.documentElement;
    const layer = document.createElement('div');
    layer.className = 'site-scrollbar-layer';
    document.body.appendChild(layer);
    root.classList.add('site-overlay-scrollbars');
    let frame = 0;
    let nativeModal: HTMLDialogElement | null = null;
    let timer: ReturnType<typeof setTimeout>;

    let targets: HTMLElement[] = [];
    const bars = new Map<HTMLElement, HTMLDivElement[]>();
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = new ResizeObserver(schedule);
    function discover() {
      targets = [document.scrollingElement as HTMLElement, ...Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter(el => {
        if (layer.contains(el)) return false;
        const style = getComputedStyle(el);
        return /(auto|scroll)/.test(style.overflowX + style.overflowY);
      })];
      resize.disconnect();
      resize.observe(document.body);
      targets.forEach(el => resize.observe(el));
      for (const [el, handles] of bars) if (!targets.includes(el)) {handles.forEach(h => h.remove()); bars.delete(el);}
      schedule();
    }
    function makeHandle(el: HTMLElement, horizontal: boolean) {
      const handle = document.createElement('div');
      handle.className = 'site-scrollbar-handle ' + (horizontal ? 'horizontal' : 'vertical');
      handle.tabIndex = 0;
      handle.setAttribute('role','scrollbar');
      handle.setAttribute('aria-label',horizontal ? '横向滚动' : '纵向滚动');
      handle.setAttribute('aria-orientation',horizontal ? 'horizontal' : 'vertical');
      handle.setAttribute('aria-valuemin','0');
      handle.addEventListener('keydown', event => {
        const max = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
        const position = horizontal ? el.scrollLeft : el.scrollTop;
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? max : position + (['ArrowDown','ArrowRight','PageDown'].includes(event.key) ? 60 : -60);
        if (!['Home','End','ArrowDown','ArrowRight','ArrowUp','ArrowLeft','PageDown','PageUp'].includes(event.key)) return;
        event.preventDefault(); if(horizontal) el.scrollLeft = next; else el.scrollTop = next;
      });
      handle.addEventListener('pointerdown', event => {
        event.preventDefault(); handle.setPointerCapture(event.pointerId);
        const start = horizontal ? event.clientX : event.clientY;
        const position = horizontal ? el.scrollLeft : el.scrollTop;
        const range = horizontal ? el.scrollWidth-el.clientWidth : el.scrollHeight-el.clientHeight;
        const travel = Number(handle.dataset.travel) || 1;
        handle.onpointermove = e => {const next=position+((horizontal?e.clientX:e.clientY)-start)*range/travel; if(horizontal) el.scrollLeft=next; else el.scrollTop=next;};
        handle.onlostpointercapture = () => {handle.onpointermove=null;schedule();};
      });
      layer.appendChild(handle);
      return handle;
    }
    function draw() {
      frame = 0;
      const nextModal = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog:modal')).at(-1) || null;
      if (nextModal !== nativeModal) {
        if (layer.matches(':popover-open')) layer.hidePopover();
        nativeModal = nextModal;
        (nativeModal || document.body).appendChild(layer);
        if (nativeModal) {layer.setAttribute('popover','manual');layer.showPopover();}
        else layer.removeAttribute('popover');
      }
      const modal = Array.from(document.querySelectorAll<HTMLElement>('[aria-modal="true"],dialog:modal')).filter(el=>el.getClientRects().length>0).sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0)).at(-1);
      for (const el of targets) {
        if (!el.isConnected) continue;
        const page = el === document.scrollingElement;
        const rect = page ? {left:0,top:0,right:innerWidth,bottom:innerHeight} : el.getBoundingClientRect();
        let left=Math.max(0,rect.left),top=Math.max(0,rect.top),right=Math.min(innerWidth,rect.right),bottom=Math.min(innerHeight,rect.bottom);
        for(let p=el.parentElement; !page && p && p!==document.body; p=p.parentElement) {
          const css=getComputedStyle(p), r=p.getBoundingClientRect();
          if (/(auto|scroll|hidden|clip)/.test(css.overflowY)) {top=Math.max(top,r.top);bottom=Math.min(bottom,r.bottom);}
          if (/(auto|scroll|hidden|clip)/.test(css.overflowX)) {left=Math.max(left,r.left);right=Math.min(right,r.right);}
        }
        if (!bars.has(el)) bars.set(el,[makeHandle(el,false),makeHandle(el,true)]);
        bars.get(el)!.forEach((handle,index) => {
          const horizontal = index===1;
          const client=horizontal?el.clientWidth:el.clientHeight, total=horizontal?el.scrollWidth:el.scrollHeight;
          const size=(horizontal?right-left:bottom-top)-4;
          const css=getComputedStyle(el);
          const allowed=page || /(auto|scroll)/.test(horizontal?css.overflowX:css.overflowY);
          const visible=(!modal || modal===el || modal.contains(el)) && allowed && total>client+1 && size>24 && right>left && bottom>top && el.getClientRects().length>0;
          handle.style.display=visible?'block':'none';
          if (!visible) return;
          const length=Math.max(24,size*client/total), travel=Math.max(1,size-length);
          const position=horizontal?el.scrollLeft:el.scrollTop;
          handle.dataset.travel=String(travel);
          handle.setAttribute('aria-valuemax',String(total-client));handle.setAttribute('aria-valuenow',String(Math.round(position)));
          handle.style.width=horizontal?length+'px':'12px'; handle.style.height=horizontal?'12px':length+'px';
          handle.style.left=(horizontal?left+2+travel*position/(total-client):right-12)+'px';
          handle.style.top=(horizontal?bottom-12:top+2+travel*position/(total-client))+'px';
        });
      }
    }
    const mutations=new MutationObserver(records=>{
      if(records.every(record=>layer.contains(record.target))) return;
      clearTimeout(timer);timer=setTimeout(discover,80);
    });
    mutations.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','open']});
    document.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
    discover();
    return () => {root.classList.remove('site-overlay-scrollbars');mutations.disconnect();resize.disconnect();cancelAnimationFrame(frame);clearTimeout(timer);document.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);layer.remove();};
  },[]);
  return null;
}
