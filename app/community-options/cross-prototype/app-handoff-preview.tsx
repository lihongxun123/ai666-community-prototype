'use client';
/* oxlint-disable next/no-img-element -- Local prototype sample assets retain original proportions. */
import {useB} from '../b-prototype/store';
const samples:Record<string,{name:string;image:string;input:string;output:string}>={
 copy:{name:'文案改写',image:'writing',input:'原文、用途与语气要求',output:'改写后的文字'},
 background:{name:'产品换背景',image:'perfume',input:'产品图片、背景描述',output:'产品展示图片'},
 video:{name:'产品短片制作',image:'sea',input:'产品素材、镜头与场景',output:'产品展示视频'},
 'repair-color':{name:'照片色彩修复',image:'portrait',input:'待修复照片',output:'修复后的图片'},
 restore:{name:'照片修复',image:'restore',input:'待修复照片',output:'修复后的图片'}
};
export function AppHandoffPreview({item,recordId,unavailable,back}:{item:string;recordId?:string;unavailable:boolean;back:()=>void}){
 const db=useB(),record=db.records.find(r=>r.id===(recordId||(item==='copy'?'app-1':item)));
 const base=samples[item],d=record?.public;
 const available=!unavailable&&(base||d)&&(!record||(record.publicStatus==='公开'&&record.runtime==='可用'&&d?.entry&&d));
 const app=d?{name:d.title,image:d.cover||'writing',input:d.inputs,output:d.outputs}:base;
 return <section className="xp-app-handoff" aria-label="MakeNow 应用承接演示">
  <p className="xp-eyebrow">MakeNow · 应用承接</p>
  {!available||!app?<><h1>应用暂不可用</h1><p>请返回应用介绍查看当前使用条件。</p><button onClick={back}>返回应用介绍</button></>:<>
  <img src={'/home-prototype/'+app.image+'.png'} alt="" style={{width:96,height:96,objectFit:'contain'}}/>
  <h1>{app.name}</h1><p>在 MakeNow 准备材料、确认费用并生成，进度与结果也在 MakeNow 查看。</p>
  <dl><dt>准备材料</dt><dd>{app.input}</dd><dt>输出说明</dt><dd>{app.output}</dd></dl>
  <aside className="xp-note"><strong>原型演示 · 定向链接待配置</strong><p>此页仅说明使用去向。对应 MakeNow 应用链接尚未配置，不会提交任务、扣费或生成结果。</p></aside>
  <button onClick={back}>返回应用介绍</button>
  </>}
 </section>;
}
