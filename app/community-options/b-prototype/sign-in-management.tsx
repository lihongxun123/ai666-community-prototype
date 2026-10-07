'use client';
import {useEffect,useState} from 'react';
import {Alert,App,Button,Card,Form,InputNumber,Result,Space,Spin} from 'antd';
import {appendLog,readOperations,writeOperations,type OpRow} from './operations-model';

type Reward={day_index:number;points:number};
type Streak={streak_days:number;points:number};
const week=['周一','周二','周三','周四','周五','周六','周日'];
const validPoints=(value:unknown)=>typeof value==='number'&&Number.isInteger(value)&&value>=0;

export function SignInManagement({state}:{state:string}){
 const {message,modal}=App.useApp();
 const [plan,setPlan]=useState<OpRow|null>(null),[rewards,setRewards]=useState<Reward[]>([]),[streaks,setStreaks]=useState<Streak[]>([]),[supported,setSupported]=useState(false),[busy,setBusy]=useState(false),[dirty,setDirty]=useState(false),[localState,setState]=useState(state),[ready,setReady]=useState(false);
 const denied=['permission-denied','no-permission'].includes(localState);
 const readonly=['readonly','read-only'].includes(localState);
 const reload=()=>{
  try{
   const row=readOperations().rows.checkin.find(r=>r.type==='自然周计划');
   const basic=row?.rewards as Reward[]|undefined;
   if(!row||!Array.isArray(basic)||basic.length!==7||basic.some(x=>!validPoints(x.points)||![1,2,3,4,5,6,7].includes(x.day_index))||new Set(basic.map(x=>x.day_index)).size!==7)throw Error('invalid configuration');
   const extra=row.streak_rewards as Streak[]|undefined;
   const hasStreaks=Array.isArray(extra)&&extra.length===3&&extra.every(x=>[3,5,7].includes(x.streak_days)&&validPoints(x.points))&&new Set(extra.map(x=>x.streak_days)).size===3;
   setPlan(row);setRewards([...basic].sort((a,b)=>a.day_index-b.day_index).map(x=>({...x})));setSupported(hasStreaks);setStreaks(hasStreaks?[...extra!].sort((a,b)=>a.streak_days-b.streak_days).map(x=>({...x})):[]);setDirty(false);setReady(true);
  }catch{setReady(false);setState('load-failed');}
 };
 useEffect(()=>{queueMicrotask(reload);},[]);
 useEffect(()=>{if(!dirty)return;const guard=(event:Event)=>{event.preventDefault();modal.confirm({title:'放弃未保存的修改？',okText:'放弃修改',cancelText:'继续编辑',onOk:()=>{setDirty(false);(event as CustomEvent<{proceed:()=>void}>).detail.proceed();}});};const unload=(event:BeforeUnloadEvent)=>event.preventDefault();window.addEventListener('prototype-before-navigate',guard);window.addEventListener('beforeunload',unload);return()=>{window.removeEventListener('prototype-before-navigate',guard);window.removeEventListener('beforeunload',unload);};},[dirty,modal]);
 const loading=localState==='loading';
 const failed=localState==='load-failed';
 const disabled=!ready||failed||loading||busy||readonly||denied;
 const basicTotal=rewards.every(x=>validPoints(x.points))?rewards.reduce((n,x)=>n+x.points,0):null;
 const streakTotal=streaks.every(x=>validPoints(x.points))?streaks.reduce((n,x)=>n+x.points,0):null;
 const saveDisabled=disabled||basicTotal===null||(supported&&streakTotal===null);
 async function save(){
  if(saveDisabled||!plan)return;
  setBusy(true);
  try{
   if(['save-failed','save-error'].includes(localState)){setState('normal');throw Error('保存失败，请重试');}
   const data=readOperations(),previous=data.rows.checkin.find(r=>r.id===plan.id);
   if(!previous)throw Error('签到配置已不存在，请重新加载');
   const next={...previous,rewards:rewards.map(x=>({...x})),...(supported?{streak_rewards:streaks.map(x=>({...x}))}:{}),status:'启用',published:true,draftPending:false};
   writeOperations(appendLog({...data,rows:{...data.rows,checkin:data.rows.checkin.map(r=>r.id===plan.id?next:r)}},'checkin',plan.id,'保存签到配置',''));
   message.success('签到积分配置已保存');reload();
  }catch(error){message.error(error instanceof Error?error.message:'保存失败，请重试');}finally{setBusy(false);}
 }
 if(denied)return <Result status="403" title="暂无查看权限"/>;
 return <section className="om-root"><Card title="签到积分配置"><Spin spinning={loading||!ready&&!failed}>
  {failed&&<Alert type="error" title="签到配置读取失败，当前不可保存" action={<Button onClick={()=>{setState('normal');reload();}}>重新加载</Button>}/>}
  <Form layout="vertical" disabled={disabled}>
   <h3>基础签到积分</h3><Space wrap>{rewards.map((item,i)=><Form.Item key={item.day_index} label={`D${item.day_index} · ${week[item.day_index-1]}`}><InputNumber min={0} precision={0} aria-label={`D${item.day_index} 积分`} value={item.points} onChange={value=>{setRewards(items=>items.map((x,n)=>n===i?{...x,points:value as number}:x));setDirty(true);}}/></Form.Item>)}</Space>
   <p>七日基础合计：{basicTotal===null?'—':basicTotal+' 积分'}</p>
   <h3>连签奖励</h3>{supported?<><Space wrap>{streaks.map((item,i)=><Form.Item key={item.streak_days} label={`连签 ${item.streak_days} 天`}><InputNumber min={0} precision={0} aria-label={`连签 ${item.streak_days} 天奖励`} value={item.points} onChange={value=>{setStreaks(items=>items.map((x,n)=>n===i?{...x,points:value as number}:x));setDirty(true);}}/></Form.Item>)}</Space><p>连签奖励合计：{streakTotal===null?'—':streakTotal+' 积分'}</p><p>单周最高可得：{basicTotal===null||streakTotal===null?'—':basicTotal+streakTotal+' 积分'}</p></>:<Alert type="warning" title="当前配置仅支持基础签到积分"/>}
   <Button type="primary" disabled={saveDisabled} loading={busy} onClick={()=>modal.confirm({title:'确认保存签到积分配置？',content:`七日基础合计 ${basicTotal} 积分${supported?`、连签奖励合计 ${streakTotal} 积分，单周最高可得 ${Number(basicTotal)+Number(streakTotal)} 积分`:''}；保存后新签到按此配置计算。`,okText:'确认保存',cancelText:'取消',onOk:save})}>保存配置</Button>
  </Form>
 </Spin></Card></section>;
}
