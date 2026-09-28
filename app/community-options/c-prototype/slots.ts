// Published local prototype configuration shared by B operations and C homepage.
import {prototypeStore as sessionStorage} from './storage';
export type Slot={id:string;title:string;type:string;status:string;target:string;device:string;cover?:string};
export const defaultSlots:Slot[]=[
  {id:'sl-banner',title:'一起画个夏天',type:'首页 Banner',status:'已发布',target:'活动 · 生图挑战',device:'全端',cover:'banner'},
  {id:'sl-mobile-apps',title:'AI应用',type:'金刚区',status:'已发布',target:'AI应用',device:'移动端'},
  {id:'sl-mobile-topics',title:'专题',type:'金刚区',status:'已发布',target:'专题列表',device:'移动端'},
  {id:'sl-mobile-activities',title:'活动中心',type:'金刚区',status:'已发布',target:'活动中心',device:'移动端'},
  {id:'sl-mobile-checkin',title:'每日签到',type:'金刚区',status:'已发布',target:'每日签到',device:'移动端'},
  {id:'sl-pc-makenow',title:'MakeNow',type:'金刚区',status:'已发布',target:'MakeNow',device:'仅 PC'},
  {id:'sl-pc-create',title:'一句话生成',type:'金刚区',status:'已发布',target:'一句话生成',device:'仅 PC'},
  {id:'sl-pc-models',title:'模型直通车',type:'金刚区',status:'已发布',target:'模型直通车',device:'仅 PC'},
  {id:'sl-pc-post',title:'发布帖子',type:'金刚区',status:'已发布',target:'发布帖子',device:'仅 PC'},
];
export const slotTargets=['AI应用','专题列表','活动中心','每日签到','MakeNow','一句话生成','模型直通车','发布帖子'];
const activityCodes:Record<string,string>={'每周任务':'meizhourenwu','生图挑战':'ai_image_challenge','Prompt 共创计划':'prompt_co_creation','邀请有礼':'referral','新手任务':'newbie_task','七日成长计划':'growth_7day'};
const topicKeys:Record<string,string>={'电商营销':'perfume','角色创作':'character','图像修复':'restore','写作表达':'writing'};
export function resolveSlotTarget(target:string):{page:string;href?:string}|null{
  const map:Record<string,string>={'AI应用':'apps','专题列表':'topics','活动中心':'activities','每日签到':'checkin','一句话生成':'create','发布帖子':'post-edit?state=post','模型直通车':'model-plaza','MakeNow':'makenow'};
  if(map[target])return {page:map[target]};
  if(target.startsWith('活动 · ')){const code=activityCodes[target.slice(5)];return code?{page:'activity?item='+code}:null;}
  if(target.startsWith('专题 · ')){const name=target.slice(5);const key=topicKeys[name];if(key!==undefined)return {page:'topic?theme='+key};try{const rows=JSON.parse(sessionStorage.getItem('bp-op-topics')||'[]') as {id:string;title:string;status:string}[];const match=rows.find(r=>r.title===name&&r.status==='已发布');return match?{page:'topic?theme='+match.id.replace(/^tp-/,'')}:null;}catch{return null;}}
  return null;
}
type NamedStatus={title:string;status:string};
export function isSlotTargetValid(slot:Pick<Slot,'target'|'device'>,events:NamedStatus[]=[],topics:NamedStatus[]=[]){
  if(!slot.target||!resolveSlotTarget(slot.target))return false;
  if(slot.device!=='仅 PC'&&['MakeNow','模型直通车','一句话生成','发布帖子'].includes(slot.target))return false;
  if(slot.target.startsWith('活动 · '))return events.some(e=>e.title===slot.target.slice(5)&&e.status==='进行中');
  if(slot.target.startsWith('专题 · '))return topics.some(t=>t.title===slot.target.slice(5)&&t.status==='已发布');
  return true;
}
export function readPublishedSlots(device:'mobile'|'pc'){
  let slots=defaultSlots;
  try{const raw=sessionStorage.getItem('bp-op-slots-live');if(raw)slots=JSON.parse(raw) as Slot[];}catch{/* default local sample */}
  let events:NamedStatus[]=[{title:'生图挑战',status:'进行中'}],topics:NamedStatus[]=[];
  try{events=JSON.parse(sessionStorage.getItem('bp-op-events')||'null')||events;topics=JSON.parse(sessionStorage.getItem('bp-op-topics')||'null')||topics;}catch{/* retain defaults */}
  return slots.filter(s=>s.status==='已发布'&&s.device!==(device==='mobile'?'仅 PC':'移动端')&&isSlotTargetValid(s,events,topics));
}
export const subscribeSlots=(listener:()=>void)=>{window.addEventListener('bp-slots-change',listener);window.addEventListener('storage',listener);return()=>{window.removeEventListener('bp-slots-change',listener);window.removeEventListener('storage',listener);};};
export const slotSnapshot=()=>[sessionStorage.getItem('bp-op-slots-live'),sessionStorage.getItem('bp-op-events'),sessionStorage.getItem('bp-op-topics')].join('|');
