'use client';
import {useEffect,useState} from 'react';
import './review-points-notice.css';

// Ephemeral review sample: never changes the balance or the local task ledger.
export function ReviewPointsNotice({kind}:{kind:'points-arrival'|'points-refund'}){
 const [visible,setVisible]=useState(true);
 useEffect(()=>{const timer=window.setTimeout(()=>setVisible(false),3000);return()=>window.clearTimeout(timer);},[]);
 if(!visible)return null;
 return <output className="cp-review-points-notice" role="status" aria-live="polite"><img src="/home-prototype/icons/check-line.svg" alt=""/><span>{kind==='points-arrival'?'+20 积分已到账':'20 积分已退回'}</span><button type="button" aria-label="关闭积分提示" onClick={()=>setVisible(false)} data-dismiss-icon="true"><img src="/home-prototype/icons/close-line.svg" alt="" /></button></output>;
}
