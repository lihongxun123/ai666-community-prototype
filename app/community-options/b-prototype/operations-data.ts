// Shared local records for the research prototype's B/C paths.
import {prototypeStore} from '../c-prototype/storage';
export type ActivitySubmission={id:string;title:string;body?:string;kind:string;activityCode:string|null;activityName:string|null;contentStatus:string;eligibility:string;reward:string;submittedAt:number;reviewReason?:string};
export type ShopSite={id:string;name:string;url:string;remark:string};
export type ShopProduct={id:string;name:string;price:number;stock:number;status:'可兑换'|'已停用';delivery:string;siteId:string;site:string;description:string;start?:string;end?:string};
export const siteDefaults:ShopSite[]=[{id:'dy',name:'多元探索',url:'https://duoyuanx.com',remark:''},{id:'mirror',name:'镜像站',url:'https://chat.duoyuanx.com',remark:''},{id:'makenow',name:'MakeNow 画布',url:'https://dream.duoyuanx.com',remark:''}];
// Public names/prices verified 2026-09-27; stock is isolated review data, never live inventory.
export const shopDefaults:ShopProduct[]=[
 {id:'dy-ten',name:'十元卡密',price:1000,stock:12,status:'可兑换',delivery:'卡密',siteId:'dy',site:'多元探索',description:'可以享受10元的使用额度'},
 {id:'dy-two',name:'两元卡密',price:200,stock:12,status:'可兑换',delivery:'卡密',siteId:'dy',site:'多元探索',description:'可以享用2元的使用额度'},
 {id:'dy-five',name:'五元卡密',price:500,stock:12,status:'可兑换',delivery:'卡密',siteId:'dy',site:'多元探索',description:'可以享用5元的使用额度'},
 {id:'mirror-week',name:'镜像周卡',price:500,stock:12,status:'可兑换',delivery:'卡密',siteId:'mirror',site:'镜像站',description:'镜像周卡'},
 {id:'mirror-day',name:'镜像日卡',price:190,stock:12,status:'可兑换',delivery:'卡密',siteId:'mirror',site:'镜像站',description:'积分兑换多元探索镜像站日卡！'},
];
export const productAvailable=(p:ShopProduct)=>p.status==='可兑换'&&(!p.start||Date.now()>=new Date(p.start).getTime())&&(!p.end||Date.now()<=new Date(p.end).getTime());
export type StockItem={id:string;productId:string;code:string;status:'可用'|'已兑换';createdAt:string;exchangedAt?:string;recordId?:string};
export const readStock=()=>read<StockItem[]>('bp-op-stock-v2',shopDefaults.flatMap(p=>Array.from({length:p.stock},(_,n)=>({id:p.id+'-'+n,productId:p.id,code:'DEMO-'+p.id+'-'+n,status:'可用' as const,createdAt:'2026-09-27T00:00:00Z'}))));
export const saveStock=(rows:StockItem[])=>write('bp-op-stock-v2',rows);
export function consumeStock(productId:string,recordId:string){const rows=readStock();const item=rows.find(r=>r.productId===productId&&r.status==='可用');if(!item)return false;saveStock(rows.map(r=>r.id===item.id?{...r,status:'已兑换' as const,recordId,exchangedAt:new Date().toISOString()}:r));return true;}
function read<T>(key:string,fallback:T):T{if(typeof window==='undefined')return fallback;try{const value=JSON.parse(prototypeStore.getItem(key)||'null');return value===null?fallback:value as T;}catch{return fallback;}}
function write<T>(key:string,value:T){prototypeStore.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event('bp-operations-change'));}
export const readShopSites=()=>read<ShopSite[]>('bp-op-shop-sites-v2',siteDefaults);
export const saveShopSites=(rows:ShopSite[])=>write('bp-op-shop-sites-v2',rows);
export const readShopProducts=()=>read<ShopProduct[]>('bp-op-shop-products-v2',shopDefaults).map(p=>({...p,stock:readStock().filter(r=>r.productId===p.id&&r.status==='可用').length,site:readShopSites().find(s=>s.id===p.siteId)?.name||p.site}));
export const saveShopProducts=(rows:ShopProduct[])=>write('bp-op-shop-products-v2',rows);
export const readActivitySubmissions=()=>read<Partial<ActivitySubmission>[]>('cp-activity-submissions',[]).map((row,index)=>({
  id:row.id||'submission-'+(row.activityCode||'activity')+'-'+(row.submittedAt||'legacy')+'-'+index,
  title:row.title?.trim()||row.body?.trim().slice(0,24)||(row.kind==='post'?'帖子投稿':'作品投稿'),
  body:row.body,
  kind:row.kind||'work',
  activityCode:row.activityCode||null,
  activityName:row.activityName||null,
  contentStatus:row.contentStatus||'review',
  eligibility:row.eligibility||'pending',
  reward:row.reward||'pending',
  submittedAt:row.submittedAt||0,
  reviewReason:row.reviewReason,
}));
export const saveActivitySubmissions=(rows:ActivitySubmission[])=>write('cp-activity-submissions',rows);
export const eventDefaults=[
  {code:'meizhourenwu',title:'每周任务',status:'进行中'},
  {code:'ai_image_challenge',title:'生图挑战',status:'进行中'},
  {code:'prompt_co_creation',title:'Prompt 共创计划',status:'进行中'},
  {code:'referral',title:'邀请有礼',status:'进行中'},
  {code:'newbie_task',title:'新手任务',status:'进行中'},
  {code:'growth_7day',title:'七日成长计划',status:'待解锁'},
] as const;
export function readEventStatuses(){
  const rows=read<{id:string;title:string;status:string}[]>('bp-op-events',[]);
  return eventDefaults.map(item=>({code:item.code,title:item.title,status:rows.find(row=>row.id==='ev-'+item.code)?.status||item.status}));
}
