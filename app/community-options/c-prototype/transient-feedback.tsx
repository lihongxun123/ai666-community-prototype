'use client';
import {useEffect,useRef} from 'react';
import './transient-feedback.css';

export function useFeedbackExpiry(value: unknown, clear:()=>void, delay=2500) {
  const callback=useRef(clear);
  callback.current=clear;
  useEffect(()=>{
    if(!value)return;
    const timer=window.setTimeout(()=>callback.current(),delay);
    return()=>window.clearTimeout(timer);
  },[value,delay]);
}

export function TransientFeedback({message,onClear}:{message:string;onClear:()=>void}) {
  const ref=useRef<HTMLOutputElement>(null);
  useFeedbackExpiry(message,onClear);
  useEffect(()=>{
    if(message)ref.current?.showPopover();
    else ref.current?.hidePopover();
  },[message]);
  return <output ref={ref} popover="manual" className="cp-transient-feedback" role="status" aria-live="polite">{message}</output>;
}
