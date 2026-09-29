// Isolate review frames from each other and from the interactive prototype tab.
function prefix() {
  if (typeof window === 'undefined') return '';
  const q = new URLSearchParams(window.location.search);
  return q.get('embed') === '1'
    ? 'review:' + (q.get('reviewScope') || q.get('page') + ':' + q.get('state')) + ':'
    : '';
}
export const prototypeStore = {
  getItem(key: string) {
    // Business prototypes are signed-in demos; explicit identity samples remain isolated.
    if(key==='cp-auth'&&typeof window!=='undefined'){
      const q=new URLSearchParams(window.location.search);
      if(q.get('page')!=='login'&&!['guest','login-expired'].includes(q.get('state')||''))return '1';
    }
    return typeof window === 'undefined'
      ? null
      : window.sessionStorage.getItem(prefix() + key);
  },
  setItem(key: string, value: string) {
    if (typeof window !== 'undefined')
      window.sessionStorage.setItem(prefix() + key, value);
  },
  removeItem(key: string) {
    if (typeof window !== 'undefined')
      window.sessionStorage.removeItem(prefix() + key);
  },
  get length() {
    if (typeof window === 'undefined') return 0;
    const p = prefix();
    return Object.keys(window.sessionStorage).filter((k) =>
      p ? k.startsWith(p) : !k.startsWith('review:'),
    ).length;
  },
  key(index: number) {
    if (typeof window === 'undefined') return null;
    const p = prefix();
    const keys = Object.keys(window.sessionStorage).filter((k) =>
      p ? k.startsWith(p) : !k.startsWith('review:'),
    );
    return keys[index]?.slice(p.length) || null;
  },
};

export type Favorite = { target: string; title: string; type: string };
export function getFavorites(): Favorite[] {
  try {
    return JSON.parse(prototypeStore.getItem('cp-favorites') || '[]');
  } catch {
    return [];
  }
}
export function toggleFavorite(item: Favorite) {
  const list = getFavorites(),
    exists = list.some((x) => x.target === item.target);
  prototypeStore.setItem(
    'cp-favorites',
    JSON.stringify(
      exists ? list.filter((x) => x.target !== item.target) : [item, ...list],
    ),
  );
  return !exists;
}
export function currentTarget() {
  if (typeof window === 'undefined') return '';
  const q = new URLSearchParams(window.location.search),
    page = q.get('page') || 'home';
  q.delete('page');
  q.delete('state');
  q.delete('embed');
  return page + (q.size ? '?' + q.toString() : '');
}

export type PrototypeTask={model?:string;ratio?:string;demoFailure?:boolean;referenceName?:string;activityTask?:string;id?:string;status:string;createdAt?:number;item?:string;input?:string;purpose?:string;tone?:string;points?:number;settledPoints?:number;count?:number;activityCode?:string;activityName?:string};
export function taskHistory():PrototypeTask[] {
  try {const rows=JSON.parse(prototypeStore.getItem('cp-tasks')||'[]');if(Array.isArray(rows)&&rows.length){const settled=rows.map((t:PrototypeTask)=>t.item?.startsWith('light-') && ['queued','running'].includes(t.status) && Date.now()-(t.createdAt||Date.now())>4000 ? {...t,status:t.demoFailure?'failed':'completed'}:t);prototypeStore.setItem('cp-tasks',JSON.stringify(settled));return settled;}const old=JSON.parse(prototypeStore.getItem('cp-task')||'null');return old?[{...old,id:old.id||'task-'+String(old.createdAt||'legacy')}]:[];}catch{return [];}
}
export function readTask():PrototypeTask|null {
  try {
    const id=typeof window==='undefined'?null:new URLSearchParams(window.location.search).get('task');
    if(id)return taskHistory().find(t=>t.id===id)||null;
    const task=JSON.parse(prototypeStore.getItem('cp-task') || 'null') as PrototypeTask|null;
    return task?{...task,id:task.id||'task-'+String(task.createdAt||'legacy')}:null;
  } catch {return null;}
}
export function writeTask(task:PrototypeTask){
  const next={...task,id:task.id||'task-'+String(task.createdAt||Date.now())+'-'+Math.random().toString(36).slice(2,7)};
  const history=taskHistory(),index=history.findIndex(t=>t.id===next.id);
  if(index<0)history.unshift(next);else history[index]=next;
  prototypeStore.setItem('cp-tasks',JSON.stringify(history));
  prototypeStore.setItem('cp-task',JSON.stringify(next));
  if(typeof window!=='undefined')window.dispatchEvent(new Event('cp-task-change'));
}
export type ShopRecord = { id: string; productId?: string; siteId?: string; name: string; site: string; price: number; code: string; status: 'success' | 'pending' | 'failed'; createdAt: string };
export function shopRecords(): ShopRecord[] {
  try { const rows = JSON.parse(prototypeStore.getItem('cp-shop-records') || '[]'); return Array.isArray(rows) ? rows : []; } catch { return []; }
}
export function pointBalance() {
  const history=taskHistory(),tasks=history.length?history:[readTask()].filter((t):t is PrototypeTask=>Boolean(t));
  const reserved=tasks.reduce((sum,t)=>sum+(!['cancelled','unaccepted','failed'].includes(String(t.status))?Number(t.status==='partial'?(t.settledPoints??t.points??0):(t.points??0)):0),0);
  return Math.max(
    0,
    100 +
      (prototypeStore.getItem('cp-checkin') === 'done' ? 20 : 0) -
      (shopRecords().filter(r=>r.status === 'success').reduce((n,r)=>n + Number(r.price || 0),0) + (prototypeStore.getItem('cp-redeemed') === '1' ? 50 : 0)) -
      reserved,
  );
}
