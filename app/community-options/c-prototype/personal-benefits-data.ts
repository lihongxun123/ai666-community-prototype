import {checkinRecords, pointBalance, prototypeStore, shopRecords, taskHistory} from './storage';

export const demoInviteCode='DEMO-ONLY';
export const readDemoInviter=()=>prototypeStore.getItem('cp-demo-inviter')||'';
// Local flow fixture. Real inviter validity and account uniqueness come from the identity service.
export function bindDemoInviter(input:string){
  const code=input.trim();
  if(readDemoInviter())return {ok:false,message:'已绑定邀请人，不能重复绑定或更换。'};
  if(!code)return {ok:false,message:'请输入邀请码。'};
  if(code.toUpperCase()===demoInviteCode)return {ok:false,message:'不能绑定自己的邀请码。'};
  if(['INVALID','无效码'].includes(code.toUpperCase()))return {ok:false,message:'邀请码无效，请核对后重试。'};
  try{prototypeStore.setItem('cp-demo-inviter',code);}catch{return {ok:false,message:'绑定结果未保存，请稍后核对邀请关系。'};}
  return {ok:true,message:'邀请人已绑定，奖励按实际条件自动发放。'};
}

export const invitationRules = {
  introduction: '好友完成对应阶段并通过系统校验后，积分将自动发放至邀请人的积分账户。',
  stages: [
    {title:'完成注册',points:100,description:'好友通过邀请链接或邀请码成功注册并完成绑定。'},
    {title:'首次互动',points:100,description:'好友完成首次有效点赞或评论行为。'},
    {title:'首次发布',points:100,description:'好友首次成功发布符合社区规范的 AI 作品，并通过审核和系统校验。'},
  ],
  limits: [
    {title:'每日上限',points:2000,description:'达到上限后，当天停止发放邀请积分。'},
    {title:'每月上限',points:10000,description:'达到上限后，当月停止发放邀请积分。'},
  ],
  conditions: [
    {title:'唯一绑定',description:'新账号及旧账号未绑定邀请人时均可绑定，不设补绑期限。以首次成功建立的邀请关系为准，不允许自邀、重复绑定、更换或解绑。'},
    {title:'内容审核',description:'好友发布的作品需符合社区规范；低质、灌水或违规作品不发放奖励。'},
    {title:'异常账号',description:'同设备或同 IP 高频注册时，暂停发放奖励并进入风险复核。'},
  ],
};

type PointRow = {id:string;title:string;date:string;points:number|null;status:string;target:string};
const day=86400000;
const dateKey=(time:number)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date(time));

// Display fixture only. This does not implement issuance, batch deduction, or settlement.
export function personalPointsSample(now=Date.now()) {
  const today=dateKey(now),weekStart=dateKey(now-6*day);
  const rows:PointRow[]=[{id:'opening',title:'创作体验奖励',date:dateKey(now-day),points:100,status:'已到账',target:'points?state=expiry'}];
  checkinRecords().forEach(r=>rows.push({id:'checkin-'+r.date,title:'每日签到',date:r.date,points:r.points,status:'已到账',target:'checkin'}));
  shopRecords().filter(r=>r.status==='success').forEach(r=>rows.push({id:r.id,title:r.name+'兑换',date:r.createdAt?dateKey(new Date(r.createdAt).getTime()):'legacy',points:-r.price,status:'已完成',target:'shop-records'}));
  if(prototypeStore.getItem('cp-redeemed')==='1') rows.push({id:'exchange',title:'AI 体验权益兑换',date:today,points:-50,status:'已完成',target:'shop-records'});
  let occupied=0,unknownOccupied=false;
  taskHistory().filter(t=>t.item?.startsWith('light-')&&!t.id?.startsWith('sample-light-')).forEach((t,i)=>{
    const released=['cancelled','unaccepted','failed'].includes(t.status),settled=['completed','partial'].includes(t.status);
    const cost=t.status==='partial'?(t.settledPoints??t.points):t.points;
    if(!released&&!settled){if(cost===undefined)unknownOccupied=true;else occupied+=cost;}
    rows.push({id:t.id||'task-'+i,title:({'light-image':'图片生成','light-text':'剧本创作','light-video':'视频生成'} as Record<string,string>)[t.item||'']||'AI 生成',date:t.createdAt?dateKey(t.createdAt):'legacy',points:released?0:cost===undefined?null:-cost,status:released?'费用已释放':settled?'费用已结算':'费用占用中',target:'create?task='+encodeURIComponent(t.id||'')});
  });
  rows.sort((a,b)=>b.date.localeCompare(a.date));
  const income=(start:string,end:string)=>rows.filter(r=>r.status==='已到账'&&r.date!=='legacy'&&r.date>=start&&r.date<=end).reduce((sum,r)=>sum+(r.points||0),0);
  const balance=pointBalance(),soon=Math.min(balance,100);
  const expiries=[...(soon?[{id:'experience',title:'创作体验奖励',points:soon,expiresAt:dateKey(now+7*day)+' 23:59'}]:[]),...(balance>soon?[{id:'checkin',title:'签到奖励',points:balance-soon,expiresAt:dateKey(now+30*day)+' 23:59'}]:[])];
  const pendingSnapshot=prototypeStore.getItem('cp-demo-pending-reward');
  const pendingReward=pendingSnapshot===null||!Number.isFinite(Number(pendingSnapshot))||Number(pendingSnapshot)<0?null:Number(pendingSnapshot);
  return {todayEarned:income(today,today),weekEarned:income(weekStart,today),balance,pendingReward,occupied:unknownOccupied?null:occupied,rows,expiries};
}

export const pointChange=(points:number|null)=>points===null?'待确认':points>0?'+'+points:points<0?'−'+Math.abs(points):'0';
