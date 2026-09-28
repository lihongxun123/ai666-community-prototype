'use client';
/* oxlint-disable jsx-a11y/media-has-caption -- Bundled silent sea-sample video has no audio track. */
import { readTask, writeTask, pointBalance } from './storage';
/* oxlint-disable next/no-img-element -- Local prototype sample media. */
import { prototypeStore as sessionStorage } from './storage';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import './application-flow.css';
import { ActionBar, Comments } from './reading';
import {useB} from '../b-prototype/store';
import { readPublishedEventConfigs } from '../b-prototype/retained-event-config';
const subscribeInput = () => () => {};
export const applicationPages = [
  {
    id: 'apps',
    title: 'AI应用',
    module: 'AI应用',
    states: ['normal', 'loading', 'empty', 'error'],
  },
  {
    id: 'app',
    title: '应用详情',
    module: 'AI应用',
    states: ['normal', 'pc', 'paused', 'removed', 'error'],
  },
  {
    id: 'app-input',
    title: '应用输入',
    module: 'AI应用',
    states: [
      'normal',
      'invalid',
      'insufficient',
      'quote-error',
      'price-changed',
      'login-expired',
      'paused',
    ],
  },
  {
    id: 'app-task',
    title: '生成任务',
    module: 'AI应用',
    states: [
      'queued',
      'running',
      'submitting',
      'unknown',
      'unaccepted',
      'cancelling',
      'cancel-failed',
      'cancelled',
      'failed',
      'completed',
    ],
  },
  {
    id: 'app-result',
    title: '生成结果',
    module: 'AI应用',
    states: ['normal', 'partial', 'settling', 'released', 'expired', 'error'],
  },
  {
    id: 'pc-handoff',
    title: '电脑端继续',
    module: 'AI应用',
    states: ['normal', 'unavailable', 'copy-failed'],
  },
  {
    id: 'account-link',
    title: '关联账号',
    module: '跨产品承接',
    states: ['normal', 'mismatch', 'expired', 'error'],
  },
  {
    id: 'return-result',
    title: '选择成果',
    module: '跨产品承接',
    states: ['normal', 'error', 'activity-ended', 'duplicate', 'forbidden'],
  },
];
const applicationCategories = [{id:'all',label:'全部'},{id:'writing',label:'写文案'},{id:'product-image',label:'做商品图'},{id:'photo',label:'修照片'},{id:'video',label:'做视频'}];
const apps = [
  {
    id: 'copy',
    category: 'writing',
    name: '文案改写',
    image: 'writing',
    mobile: true,
    available: true,
    input: '原文、用途和语气',
    output: '文字',
    purpose: '写作表达',
    place: '社区',
  },
  {
    id: 'background',
    category: 'product-image',
    name: '产品换背景',
    image: 'perfume',
    mobile: true,
    available: true,
    input: '产品图片、背景描述',
    output: '图片',
    purpose: '商品展示',
    place: '社区',
  },
  {
    id: 'video',
    category: 'video',
    name: '产品短片制作',
    image: 'sea',
    mobile: false,
    available: true,
    input: '产品素材、镜头与场景',
    output: '视频',
    purpose: '商品展示',
    place: 'MakeNow',
  },
  {
    id: 'restore',
    category: 'photo',
    name: '照片修复',
    image: 'restore',
    mobile: true,
    available: false,
    input: '待修复照片',
    output: '图片',
    purpose: '影像处理',
    place: '社区',
  },
];
const lightCreators=[
 {id:'light-image',name:'图片创作',image:'sea',mobile:true,available:true,input:'提示词与参考素材',output:'图片',purpose:'轻创作',place:'社区'},
 {id:'light-text',name:'剧本创作',image:'writing',mobile:true,available:true,input:'主题、人物与情节',output:'文字',purpose:'轻创作',place:'社区'},
 {id:'light-video',name:'视频创作',image:'sea',mobile:true,available:true,input:'提示词与参考素材',output:'视频',purpose:'轻创作',place:'社区'},
];
export function ApplicationsPage({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (p: string) => void;
}) {
  const contentDB=useB();
  const query =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const item = query?.get('item') || 'copy';
  const baseApp = [...apps,...lightCreators].find((a) => a.id === item) || apps[0];
  const configuredApp=baseApp.id==='copy'?contentDB.records.find(r=>r.id==='app-1'):null;
  const app={...baseApp,name:configuredApp?.public?.title||baseApp.name};
  const [local, setLocal] = useState(state),
    [category, setCategory] = useState(applicationCategories.some(c=>c.id===query?.get('category'))?query!.get('category')!:'all'),
    [typedInput, setInput] = useState<string | null>(null),
    [file, setFile] = useState(''),
    [tip, setTip] = useState(''),
    [count, setCount] = useState(()=>sessionStorage.getItem('cp-count-'+app.id)||'1'),
    [purpose,setPurpose]=useState(()=>sessionStorage.getItem('cp-purpose-'+app.id)||'日常表达'),
    [tone,setTone]=useState(()=>sessionStorage.getItem('cp-tone-'+app.id)||'自然'),
    [picked, setPicked] = useState(true),
    [linked, setLinked] = useState(false),
    [resultIndex, setResultIndex] = useState(0);
  const submitting=useRef(false);
  const savedInput = useSyncExternalStore(
    subscribeInput,
    () => sessionStorage.getItem('cp-input-' + app.id) || '',
    () => '',
  );
  const input = typedInput ?? savedInput;
  const s =
    page === 'app-task' && local === 'normal'
      ? readTask()?.status || 'queued'
      : local;
  useEffect(()=>{
    if(page!=='app-result'||local!=='released')return;
    const task=readTask();
    if(task?.item===app.id&&task.status!=='partial')writeTask({...task,status:'partial',settledPoints:10});
  },[page,local,app.id]);
  const changeTask = (status: string) => {
    setTip('');
    const task = readTask();
    if (task)
      writeTask({ ...task, status });
    setLocal(status);
  };
  const nav = (p: string) => {if(p==='app-input'&&app.id.startsWith('light-')){go('create');return;}const t=readTask();const activity=new URLSearchParams(location.search).get('activity');go(p+'?item='+app.id+(['app-task','app-result'].includes(p)&&t?.id?'&task='+encodeURIComponent(t.id):'')+(activity?'&activity='+encodeURIComponent(activity):''));};
  const saveTask = (status: string) => {
    const activityCode=new URLSearchParams(window.location.search).get('activity')||'';
    const activityName=readPublishedEventConfigs().find(item=>item.code===activityCode)?.name||'';
    writeTask({
        status,
        createdAt: Date.now(),
        activityCode:activityName?activityCode:undefined,
        activityName:activityName||undefined,
        item: app.id,
        input,
        purpose, tone,
        count: Number(count),
        points: Number(count) * 10,
      });
    nav('app-task');
  };
  const action = (p: string) => {
    if (sessionStorage.getItem('cp-auth') !== '1') {
      const activity=new URLSearchParams(location.search).get('activity');
      sessionStorage.setItem('cp-return', p + '?item=' + app.id+(activity?'&activity='+encodeURIComponent(activity):''));
      go('login');
    } else nav(p);
  };
  if (page === 'apps') {
    if (s === 'loading')
      return (
        <div className="cp-skeleton" aria-label="加载中">
          <div />
          <div />
        </div>
      );
    if (s === 'empty' || s === 'error')
      return (
        <div className="cp-state">
          <h2>{s === 'empty' ? '暂无应用' : '加载失败'}</h2>
          <button className="cp-button" onClick={() => setLocal('normal')}>
            重新加载
          </button>
        </div>
      );
    const updateCategory=(value:string)=>{
      setCategory(value);
      const url=new URL(location.href);
      url.searchParams.delete('purpose');url.searchParams.delete('output');
      if(value==='all')url.searchParams.delete('category');else url.searchParams.set('category',value);
      history.replaceState(history.state,'',url);window.dispatchEvent(new PopStateEvent('popstate'));
    };
    const publicCopy=contentDB.records.find(r=>r.id==='app-1');
    const list=apps.filter(a=>a.id!=='copy'||publicCopy?.publicStatus==='公开')
      .map(a=>({...a,name:a.id==='copy'?(publicCopy?.public?.title||a.name):a.name,available:a.available&&(a.id!=='copy'||publicCopy?.runtime==='可用')}))
      .filter(a=>category==='all'||a.category===category)
      .sort((a,b)=>query?.get('device')!=='pc'?Number(b.mobile&&b.available)-Number(a.mobile&&a.available):0);
    return (
      <section className="cp-app-discovery" aria-label="应用列表">
        <div className="cp-discovery-filters">
          <nav aria-label="应用任务分类">{applicationCategories.map(({id,label})=><button key={id} aria-pressed={category===id} onClick={()=>updateCategory(id)}>{label}</button>)}</nav>
        </div>
        {list.length===0?<div className="cp-state"><h2>暂无符合条件的应用</h2><button className="cp-button" onClick={()=>updateCategory('all')}>清除筛选</button></div>:<>
          <div className="cp-app-gallery">{list.map(a=><button className="cp-app-effect" key={a.id} aria-label={a.name} onClick={()=>{const activity=query?.get('activity');go('app?item='+a.id+(activity?'&activity='+encodeURIComponent(activity):''));}}>
            <img src={'/home-prototype/'+a.image+'.png'} alt=""/>
            <span className="cp-app-caption"><strong>{a.name}</strong>{!a.available&&<small>暂不可用</small>}</span>
          </button>)}</div>
          <p className="cp-end">没有更多了</p>
        </>}
      </section>
    );
  }
  if ((page==='app'||page==='app-input')&&configuredApp?.publicStatus!=='公开'&&configuredApp)
    return <div className="cp-state"><h2>应用暂不可访问</h2><button className="cp-button" onClick={()=>go('apps')}>返回应用列表</button></div>;
  if (page==='app-input'&&configuredApp&&configuredApp.runtime!=='可用')
    return <div className="cp-state"><h2>应用暂不可使用</h2><p>已有任务仍可从生成记录查看。</p><button className="cp-button" onClick={()=>nav('app')}>查看应用说明</button></div>;
  if(['app-task','app-result'].includes(page)&&new URLSearchParams(typeof location==='undefined'?'':location.search).has('task')&&(!readTask()||readTask()?.item!==app.id))return <div className="cp-state"><h2>任务暂不可访问</h2><button className="cp-button" onClick={()=>go('records')}>返回生成记录</button></div>;
  if (page === 'app') {
    if (s === 'removed' || s === 'error')
      return (
        <div className="cp-state">
          <h2>{s === 'removed' ? '内容暂不可访问' : '加载失败'}</h2>
          <button
            className="cp-button"
            onClick={() => (s === 'error' ? setLocal('normal') : go('apps'))}
          >
            {s === 'error' ? '重试' : '返回应用列表'}
          </button>
        </div>
      );
    const pc = s === 'pc' || !app.mobile,
      paused = s === 'paused' || !app.available || Boolean(configuredApp&&configuredApp.runtime!=='可用');
    return (
      <article className="cp-app-detail">
        <img
          className="cp-app-detail-cover"
          src={'/home-prototype/' + app.image + '.png'}
          alt={app.name}
        />
        <div className="cp-app-detail-heading"><h2>{app.name}</h2><p>{app.purpose} · {app.output}</p></div>
        {paused && (
          <div className="cp-alert">
            应用暂不可用，已有任务可在生成记录查看。
          </div>
        )}
        {pc && <section className="cp-note cp-mobile-only"><h2>请在电脑端使用</h2><p>画布与工作流操作需在电脑端完成。</p></section>}
        {!paused && <div className="cp-app-dock" aria-label="应用操作">
          {pc ? <><button className="cp-button cp-mobile-only" onClick={()=>nav('pc-handoff')}>获取电脑端链接</button><button className="cp-button cp-desktop-only" onClick={()=>{window.location.href='/community-options/cross-prototype?page=project&source=app&item='+app.id+'&return='+encodeURIComponent(location.pathname+location.search);}}>在 MakeNow 中打开</button></> : <button className="cp-button" onClick={()=>action('app-input')}>开始使用</button>}
        </div>}
        <dl className="cp-app-detail-facts">
          <dt>准备材料</dt>
          <dd>{app.input}</dd>
          <dt>输出</dt>
          <dd>{app.output}</dd>
          <dt>提供方</dt>
          <dd>多元拾光</dd>
          <dt>费用</dt>
          <dd>
            {pc
              ? '使用 MakeNow 账户，费用在目标工具确认。'
              : '使用社区积分，提交前确认本次消耗。'}
          </dd>
        </dl>
        <ActionBar kind="app" go={go}/>
        <Comments go={go} kind="app"/>
      </article>
    );
  }
  if (page === 'app-input') {
    if(!app.mobile)return <section className="af-page"><div className="cp-note"><h2>请在电脑端使用</h2><p>此应用需要在电脑端操作。</p></div><button className="cp-button" onClick={()=>nav('pc-handoff')}>获取电脑端链接</button></section>;
    const cost=Number(count)*10,available=s==='insufficient'?5:pointBalance();
    const blocked=['insufficient','quote-error','paused','login-expired'].includes(s);
    return <section className="af-page af-input">
      <div className="af-app-context"><img src={'/home-prototype/'+app.image+'.png'} alt=""/><div><strong>{app.name}</strong><span>{app.output==='文字'?'调整文字的语气与表达':'准备素材，生成你想要的效果'}</span></div></div>
      <form id="application-input" onSubmit={e=>{
        e.preventDefault(); if(submitting.current||blocked)return;
        if(!input.trim()||(app.output==='图片'&&!file)){setLocal('invalid');return;}
        if(s==='price-changed'){setLocal('normal');setTip('积分已更新，请确认后生成');return;}
        if(sessionStorage.getItem('cp-auth')!=='1'){sessionStorage.setItem('cp-return','app-input?item='+app.id+(query?.get('activity')?'&activity='+encodeURIComponent(query.get('activity')!):''));go('login');return;}
        if(pointBalance()<cost){setLocal('insufficient');return;}
        submitting.current=true;saveTask('queued');
      }}>
      {app.output==='图片'&&<div className="af-field"><label htmlFor="app-image">参考图片</label><label className="af-upload" htmlFor="app-image">{file?<img src={file} alt="已选图片"/>:<><img className="af-upload-icon" src="/home-prototype/icons/image-line.svg" alt=""/><span>选择图片</span></>}<input id="app-image" type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){setTip('请选择图片文件');return;}setFile(URL.createObjectURL(f));setTip('');}}/></label>{file&&<button className="af-text-button" type="button" onClick={()=>{URL.revokeObjectURL(file);setFile('');}}>移除图片</button>}</div>}
      <div className="af-field"><label htmlFor="app-prompt">{app.output==='文字'?'原文':'背景描述'}</label><textarea id="app-prompt" value={input} onChange={e=>{setInput(e.target.value);sessionStorage.setItem('cp-input-'+app.id,e.target.value);if(s==='invalid')setLocal('normal');}} placeholder={app.output==='文字'?'输入需要改写的文字':'描述背景、光线与氛围'} aria-invalid={s==='invalid'&&!input.trim()}/></div>
      {app.output==='文字'&&<div className="af-two"><label>用途<select value={purpose} onChange={e=>{setPurpose(e.target.value);sessionStorage.setItem('cp-purpose-'+app.id,e.target.value);}}>{['日常表达','社交分享','产品介绍'].map(x=><option key={x}>{x}</option>)}</select></label><label>语气<select value={tone} onChange={e=>{setTone(e.target.value);sessionStorage.setItem('cp-tone-'+app.id,e.target.value);}}>{['自然','简洁','正式'].map(x=><option key={x}>{x}</option>)}</select></label></div>}
      <fieldset className="af-count"><legend>生成数量</legend>{['1','2'].map(n=><label key={n}><input type="radio" name="output-count" checked={count===n} onChange={()=>{setCount(n);sessionStorage.setItem('cp-count-'+app.id,n);}}/><span>{n} 份</span></label>)}</fieldset>
      {s==='invalid'&&<p className="af-alert" role="alert">{!input.trim()?'请填写'+(app.output==='文字'?'原文':'背景描述'):'请添加参考图片'}</p>}
      {s==='price-changed'&&<p className="af-alert" role="alert">本次积分由 {Number(count)*8} 调整为 {cost}，请重新确认。</p>}
      {s==='quote-error'&&<p className="af-alert" role="alert">暂时无法获取本次积分，输入已保留。</p>}
      {s==='paused'&&<p className="af-alert" role="alert">应用暂不可用，输入已保留。</p>}
      {s==='insufficient'&&<p className="af-alert" role="alert">还差 {Math.max(0,cost-available)} 积分。<button type="button" className="af-text-button" onClick={()=>go('points')}>前往积分中心</button></p>}
      {s==='login-expired'&&<p className="af-alert">登录已失效，输入已保留。<button type="button" className="af-text-button" onClick={()=>action('app-input')}>重新登录</button></p>}
      <div className="af-submit-bar"><div><strong>{s==='quote-error'?'积分待获取':cost+' 积分'}</strong><span>可用 {available} 积分</span></div><button className="cp-button" disabled={blocked||!input.trim()||(app.output==='图片'&&!file)}>{s==='price-changed'?'确认新积分':'确认并生成'}</button></div>
      {s==='quote-error'&&<button type="button" className="af-text-button" onClick={()=>{setLocal('normal');setTip('');}}>重新获取积分</button>}
      {tip&&<output className="af-feedback">{tip}</output>}
      </form>
    </section>;
  }
  if (page === 'app-task') {
    const titles: Record<string, string> = {
      normal: '排队中',
      queued: '排队中',
      running: '生成中',
      submitting: '提交中',
      unknown: '结果待确认',
      unaccepted: '未受理',
      cancelling: '取消中',
      'cancel-failed': '任务已开始，无法取消',
      cancelled: '已取消',
      failed: '生成失败',
      completed: '生成完成',
    };
    return (
      <section className="af-page af-task">
        <div className="af-task-status">
          <img className={'af-state-icon '+(['running','submitting','cancelling'].includes(s)?'af-spinning':'')} src={'/home-prototype/icons/'+(s==='completed'?'checkbox-circle-line':s==='failed'?'error-warning-line':s==='cancelled'?'close-circle-line':'time-line')+'.svg'} alt=""/><h2>{titles[s] || '排队中'}</h2>
          <p>{app.name}</p>
          {['normal', 'queued', 'running', 'submitting', 'cancelling'].includes(
            s,
          ) && (
            <p className="af-task-hint">离开页面后，可在生成记录中继续查看。</p>
          )}
        </div>
        <dl className="cp-facts af-task-facts">
          <dt>积分</dt>
          <dd>
            {s === 'completed'
              ? `${readTask()?.points || 10} 积分已消耗`
              : s === 'cancelled'
                ? `${readTask()?.points || 10} 积分已释放`
                : s === 'failed'
                  ? `${readTask()?.points || 10} 积分释放中`
                  : s === 'unaccepted'
                    ? '未产生积分消耗'
                    : `${readTask()?.points || 10} 积分占用中`}
          </dd>
          <dt>结果</dt>
          <dd>
            {s === 'unknown'
              ? '正在核对原任务，请勿重复提交。'
              : s === 'failed'
                ? '未交付结果'
                : s === 'cancelled'
                  ? '任务未执行'
                  : s==='completed'?'已可查看':'尚未生成'}
          </dd>
        </dl>
        {['normal', 'queued'].includes(s) && (
          <button
            className="cp-button cp-secondary"
            onClick={() => changeTask('cancelled')}
          >
            取消排队
          </button>
        )}
        {[
          'normal',
          'queued',
          'running',
          'submitting',
          'cancelling',
          'cancel-failed',
          'unknown',
        ].includes(s) && (
          <button
            className="cp-button"
            onClick={() => {
              if (s === 'unknown') setTip('仍在核对原任务');
              else if (s === 'cancelling') changeTask('cancelled');
              else {
                const task = readTask();
                if (task?.createdAt && Date.now() - task.createdAt >= 12000) {
                  changeTask('completed');
                } else if (
                  task?.createdAt &&
                  Date.now() - task.createdAt >= 5000
                ) {
                  changeTask('running');
                } else setTip('任务仍在处理中');
              }
            }}
          >
            刷新状态
          </button>
        )}
        {s === 'completed' && (
          <button className="cp-button" onClick={() => nav('app-result')}>
            查看生成结果
          </button>
        )}
        {['unaccepted', 'failed', 'cancelled'].includes(s) && (
          <button className="cp-button" onClick={() => nav('app-input')}>
            重新填写并确认
          </button>
        )}
        <button
          className="af-text-button af-records-link"
          onClick={() => go('records')}
        >
          查看生成记录
        </button>
        {tip && <output>{tip}</output>}
      </section>
    );
  }
  if (page === 'app-result') {
    const textResult =
      '用清晰的表达记录创作想法。 从一张图片开始，整理素材、尝试不同背景，再选择适合的效果。';
    const sampleCount = ['partial', 'released'].includes(s)
      ? 1
      : Math.min(2, Number(readTask()?.count || 1));
    if (s === 'expired' || s === 'error')
      return (
        <div className="cp-state">
          <h2>{s === 'expired' ? '结果已过期' : '结果加载失败'}</h2>
          <p>{s === 'expired' ? '生成记录仍可查看。' : '请稍后重试。'}</p>
          <button
            className="cp-button"
            onClick={() =>
              s === 'expired' ? go('records') : setLocal('normal')
            }
          >
            {s === 'expired' ? '返回生成记录' : '重试'}
          </button>
        </div>
      );
    return (
      <section className="af-page af-result"><div className="af-result-heading"><strong>{app.name}</strong><span>{['partial','released'].includes(s)?'部分完成':'已完成'}</span></div>
        {Array.from({ length: sampleCount }, (_, index) => (
          <div className="af-result-item" key={index}>
            {sampleCount > 1 && (
              <label>
                <input
                  type="radio"
                  name="result"
                  checked={resultIndex === index}
                  onChange={() => setResultIndex(index)}
                />
                结果 {index + 1}
              </label>
            )}
            {app.output === '文字' ? (
              <div className="cp-result-text">
                用清晰的表达记录创作想法。
                从一张图片开始，整理素材、尝试不同背景，再选择适合的效果。
              </div>
            ) : app.output==='视频' ? <video className="cp-cover" controls playsInline poster="/home-prototype/sea.png" src="/home-prototype/sea-sample.mp4" aria-label="视频结果示例"/> : (
              <img className="cp-cover" src={'/home-prototype/' + app.image + '.png'} alt="生成结果"/>
            )}
          </div>
        ))}
        {['partial', 'released'].includes(s) && (
          <div className="cp-alert">1 项成功，1 项失败。仅成功项结算。</div>
        )}
        <dl className="cp-facts">
          <dt>消耗</dt>
          <dd>{s === 'settling' ? '结算中' : sampleCount * 10 + ' 积分'}</dd>
          {['partial', 'released'].includes(s) && (
            <>
              <dt>释放</dt>
              <dd>
                {s === 'released'
                  ? `${Math.max(0,Number(readTask()?.points||20)-sampleCount*10)} 积分已释放`
                  : '失败项 10 积分释放中'}
              </dd>
            </>
          )}
        </dl>
        <div className="cp-actions af-result-actions">
          <button
            onClick={() => {
              if (app.output === '文字') {
                const blob = new Blob([textResult], {
                  type: 'text/plain',
                });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = '创作结果.txt';
                a.click();
                URL.revokeObjectURL(a.href);
              } else {
                const a = document.createElement('a');
                a.href = app.output==='视频'?'/home-prototype/sea-sample.mp4':'/home-prototype/' + app.image + '.png';
                a.download = app.output==='视频'?'创作结果.mp4':'创作结果.png';
                a.click();
              }
              setTip('已发起下载');
            }}
          >
            {app.output==='文字'?'保存文本':'保存到本地'}
          </button>
          <button onClick={() => nav('app-input')}>再次创作</button>
        </div>
        <button
          className="cp-button"
          onClick={() => {
            sessionStorage.setItem('cp-source', 'app-result');
            sessionStorage.setItem(
              'cp-result',
              JSON.stringify({
                kind: app.output === '文字' ? 'text' : app.output==='视频'?'video':'image',
                video:app.output==='视频'?'/home-prototype/sea-sample.mp4':undefined,
                text: textResult,
                image: '/home-prototype/' + app.image + '.png',
                title:
                  app.name +
                  '结果' +
                  (sampleCount > 1 ? ' ' + (resultIndex + 1) : ''),
                app: app.id,
                taskId:readTask()?.id,
                activityCode:readTask()?.activityCode,
                activityName:readTask()?.activityName,
              }),
            );
            go('post-edit');
          }}
        >
          编辑并发布
        </button>
        <button
          className="af-text-button af-records-link"
          onClick={() => go('records')}
        >
          返回生成记录
        </button>
        {tip && <output>{tip}</output>}
      </section>
    );
  }
  if (page === 'pc-handoff')
    return (
      <section className="af-page af-handoff">
        <div className="af-app-context"><img src={'/home-prototype/'+app.image+'.png'} alt=""/><div><strong>{app.name}</strong><span>在电脑浏览器中打开链接即可继续</span></div></div>
        {s === 'unavailable' ? (
          <div className="cp-state">
            <h2>目标暂不可访问</h2>
          </div>
        ) : (
          <>
            <label>
              应用链接
              <input
                readOnly
                value={
                  typeof window === 'undefined'
                    ? ''
                    : window.location.origin +
                      '/community-options/c-prototype?page=app&item=' +
                      app.id
                }
              />
            </label>
            <button
              className="cp-button"
              onClick={async () => {
                try {
                  if (s === 'copy-failed') throw Error();
                  await navigator.clipboard.writeText(
                    window.location.origin +
                      '/community-options/c-prototype?page=app&item=' +
                      app.id,
                  );
                  setTip('链接已复制');
                } catch {
                  setTip('复制失败，可长按链接手动复制');
                }
              }}
            >
              复制链接
            </button>
          </>
        )}
        {app.place==='MakeNow'&&<p className="af-subtle">进入 MakeNow 后，账号与费用以该平台为准。</p>}
        {tip && <output>{tip}</output>}
      </section>
    );
  if (page === 'account-link')
    return (
      <section className="af-page af-account">
        
        <dl className="cp-facts">
          <dt>社区</dt>
          <dd>林间</dd>
          <dt>MakeNow</dt>
          <dd>{s === 'mismatch' ? '另一位创作者' : '林间的工作室'}</dd>
        </dl>
        <p>关联后可将本人选定的成果带回社区。两端积分独立。</p>
        {s === 'mismatch' && (
          <div className="cp-alert">请确认这两个账号均属于你。</div>
        )}
        {s === 'expired' && (
          <div className="cp-alert">关联已失效，请重新登录确认。</div>
        )}
        {s === 'error' && (
          <div className="cp-alert">关联失败，原成果仍保留在 MakeNow。</div>
        )}
        {s === 'expired' && (
          <button
            className="cp-button"
            onClick={() => {
              sessionStorage.setItem('cp-return', 'account-link');
              go('login');
            }}
          >
            重新登录
          </button>
        )}
        {s === 'error' && (
          <button className="cp-button" onClick={() => setLocal('normal')}>
            重试关联
          </button>
        )}
        <label>
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
          />
          确认两个账号均由本人使用
        </label>
        <button
          className="cp-button"
          disabled={!linked || s === 'expired' || s === 'error'}
          onClick={() => {
            sessionStorage.setItem('cp-linked', '1');
            go('return-result');
          }}
        >
          确认关联
        </button>
        <button
          className="cp-button cp-secondary"
          onClick={() => go('resource')}
        >
          暂不关联
        </button>
      </section>
    );
  if (page === 'return-result')
    return (
      <section className="af-page af-return">
        {s === 'forbidden' ? (
          <div className="cp-state">
            <h2>无法确认成果归属</h2>
            <p>请使用制作该成果的账号。</p>
            <button className="cp-button" onClick={() => go('account-link')}>
              核对账号
            </button>
          </div>
        ) : (
          <>
            
            <label>
              <input
                type="checkbox"
                checked={picked}
                onChange={(e) => setPicked(e.target.checked)}
              />
              一瓶夏日晴光
            </label>
            <img
              className="cp-cover"
              src="/home-prototype/perfume.png"
              alt="待发布成果"
            />
            {s === 'activity-ended' && (
              <div className="cp-alert">
                活动已结束，无法继续投稿。成果仍为私有。
              </div>
            )}
            {s === 'error' && (
              <div className="cp-alert">
                回流失败，MakeNow 中的原成果不受影响。
              </div>
            )}
            {s === 'error' && (
              <button className="cp-button" onClick={() => setLocal('normal')}>
                重新获取成果
              </button>
            )}
            {s === 'duplicate' ? (
              <button
                className="cp-button"
                onClick={() => go('publish-status')}
              >
                查看原提交
              </button>
            ) : (
              <button
                className="cp-button"
                disabled={!picked || s === 'error'}
                onClick={() => {
                  sessionStorage.setItem('cp-source', 'MakeNow');
                  if (s === 'activity-ended')
                    sessionStorage.removeItem('cp-activity');
                  sessionStorage.setItem(
                    'cp-result',
                    JSON.stringify({
                      kind: 'image',
                      image: '/home-prototype/perfume.png',
                      title: '一瓶夏日晴光',
                    }),
                  );
                  go('post-edit');
                }}
              >
                {s === 'activity-ended'
                  ? '取消活动关联，作为普通作品编辑'
                  : '继续编辑作品'}
              </button>
            )}
          </>
        )}
      </section>
    );
  return null;
}

