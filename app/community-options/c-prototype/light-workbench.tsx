'use client';
import {readPublishedEventConfigs} from '../b-prototype/retained-event-config';
import {MediaPreview} from './media-preview';
import {TransientFeedback} from './transient-feedback';
/* eslint-disable next/no-img-element -- Bundled prototype assets. */
import { useEffect, useRef, useState } from 'react';
import { prototypeStore as store, taskHistory, writeTask, pointBalance, currentTarget, type PrototypeTask } from './storage';
import { createPortal } from 'react-dom';
import { readCActivities } from './retained-activities';
import './light-workbench.css';
import {PcGeneration} from './pc-generation';
import {ParameterMenu} from './parameter-menu';

// Local demonstration quotes; production quotes must come from the selected model configuration.
const modes = { image: { title: '图片生成', model: '图片模型', points: 10 }, text: { title: '剧本创作', model: '文字模型', points: 2 }, video: { title: '视频生成', model: '视频模型', points: 20 } };
type Mode = keyof typeof modes;
function draft() { try { return JSON.parse(store.getItem('cp-light-create-draft') || '{}'); } catch { return {}; } }
// Review fixtures stay outside the task ledger and do not consume demonstration points.
function sampleHistory(): PrototypeTask[] {
  const now = new Date(); const date = (days: number, hour: number) => { const value = new Date(now); value.setDate(value.getDate()-days); value.setHours(hour,0,0,0); return value.getTime(); };
  return [
    {id:'sample-light-image-complete',item:'light-image',input:'海边日落，浪花映着暖金色的光',model:'图片模型 · 标准模型',ratio:'16:9',referenceName:'海岸参考图',activityCode:'ai_image_challenge',activityName:'生图挑战',points:10,status:'completed',createdAt:date(0,9)},
    {id:'sample-light-video-running',item:'light-video',input:'镜头沿海岸缓缓推进，海面泛起微光',model:'视频模型 · 标准模型',ratio:'16:9',referenceName:'海岸参考图',points:20,status:'running',createdAt:date(0,8)},
    {id:'sample-light-text-complete',item:'light-text',input:'写一段寻找晨光的海边短片剧本',model:'文字模型 · 创意模型',points:2,status:'completed',createdAt:date(1,16)},
    {id:'sample-light-video-complete',item:'light-video',input:'海岸风景短片，记录浪花与晚霞',model:'视频模型 · 标准模型',ratio:'16:9',points:20,status:'completed',createdAt:date(1,14)},
    {id:'sample-light-image-failed',item:'light-image',input:'尝试柔和光线下的海边构图',model:'图片模型 · 创意模型',ratio:'4:3',points:10,status:'failed',createdAt:date(1,10)},
    {id:'sample-light-text-earlier',item:'light-text',input:'清晨小镇，一段关于回忆的独白',model:'文字模型 · 标准模型',points:2,status:'completed',createdAt:date(3,11)},
  ];
}
function workbenchHistory() { return [...taskHistory().filter(task => task.item?.startsWith('light-') && !task.id?.startsWith('sample-light-')), ...sampleHistory()]; }
function MobileLightWorkbench({ state, go }: { state: string; go: (page: string) => void }) {
  const [reviewOverlay] = useState(()=>typeof window==='undefined'?'':new URLSearchParams(window.location.search).get('reviewOverlay')||'');
  const reviewMenu=reviewOverlay==='aigc-model'||reviewOverlay==='aigc-ratio';
  const [type, setType] = useState<Mode>(() => reviewMenu?'image':draft().type in modes ? draft().type : 'image');
  const [prompt, setPrompt] = useState<string>(() => draft().prompt || '');
  const [ratio, setRatio] = useState(() => reviewMenu?'1:1':draft().ratio || '1:1');
  const [references, setReferences] = useState<{file?: File; url: string; name?: string}[]>(() => (draft().references || []).filter((reference:{url:string})=>reference.url?.startsWith('/home-prototype/')));
  const referenceUrls = useRef<string[]>([]);
  const taskReferences = useRef<Record<string, {file?: File; url: string; name?: string}[]>>({});
  const [toolsSlot, setToolsSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setToolsSlot(document.getElementById('create-tools-slot')); }, []);
  const [history, setHistory] = useState(false);
  const [historyType, setHistoryType] = useState('all');
  const [collapsed, setCollapsed] = useState(!reviewMenu&&['running','completed','failure'].includes(state));
  const [referenceIndex,setReferenceIndex]=useState<number|null>(null);
  const [previewResult, setPreviewResult] = useState(false);
  const [model, setModel] = useState(() => reviewMenu?'标准模型':draft().model || '标准模型');
  useEffect(() => () => referenceUrls.current.forEach(url => URL.revokeObjectURL(url)), []);
  const [rows, setRows] = useState(() => workbenchHistory());
  const [selected, setSelected] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('task') || (state === 'running' ? 'sample-light-video-running' : state === 'completed' ? 'sample-light-image-complete' : state === 'failure' ? 'sample-light-image-failed' : ''));
  const [message, setMessage] = useState('');
  const busy = useRef(false);
  const task = rows.find(t => t.id === selected);
  const running = task?.status === 'queued' || task?.status === 'running';
  const linked = store.getItem('cp-activity') === '1';
  const activityOptions = readCActivities().filter(activity => activity.status === '进行中' && !activity.locked && activity.publishKind === 'work' && activity.tasks.some(task => task.action?.includes('发布')) && (()=>{const p=readPublishedEventConfigs().find(c=>c.code===activity.code)?.extra_config.publish_config;return !p?.content_types.length||p.content_types.includes(type==='image'?2:type==='video'?3:4)})());
  const selectedActivity = linked ? store.getItem('cp-activity-code') || '' : '';
  const chooseActivity = (code: string) => {
    ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(key => store.removeItem(key));
    const activity = activityOptions.find(item => item.code === code);
    if (activity) { store.setItem('cp-activity', '1'); store.setItem('cp-activity-code', activity.code); store.setItem('cp-activity-name', activity.name); }
    refresh();
  };
  const refresh = () => setRows(workbenchHistory());
  useEffect(() => { window.addEventListener('cp-task-change', refresh); return () => window.removeEventListener('cp-task-change', refresh); }, []);
  useEffect(() => {
    if(reviewMenu)return;
    store.setItem('cp-light-create-draft', JSON.stringify({ type, prompt, ratio, model, references:references.filter(reference=>reference.url.startsWith('/home-prototype/')).map(({url,name})=>({url,name})) }));
  }, [type, prompt, ratio, model,reviewMenu,references]);
  useEffect(() => {
    const timers = rows.filter(row => !row.id?.startsWith('sample-light-') && ['queued', 'running'].includes(row.status)).map(row => window.setTimeout(() => {
      writeTask({ ...row, status: state === 'failure' ? 'failed' : row.status === 'queued' ? 'running' : 'completed' }); busy.current = false;
    }, row.status === 'queued' ? 1200 : 2200));
    return () => timers.forEach(window.clearTimeout);
  }, [rows, state]);
  const authenticate = () => {
    if (store.getItem('cp-auth') === '1') return true;
    store.setItem('cp-login-background', currentTarget()); store.setItem('cp-return', currentTarget()); go('login'); return false;
  };
  const generate = () => {
    if (busy.current || running) return;
    if (!prompt.trim()) { setMessage('请输入创作描述'); return; }
    if (!authenticate()) return;
    if (pointBalance() < modes[type].points) { setMessage('积分不足'); return; }
    if(selectedActivity&&!activityOptions.some(a=>a.code===selectedActivity)){setMessage('当前活动已失效或不支持此类型，请重新选择活动或取消关联。');return;}
    busy.current = true; setMessage('');
    const next: PrototypeTask = { id: 'light-' + Date.now(), item: 'light-' + type, input: prompt.trim(), model: modes[type].model + " · " + model, ratio, referenceName: references.map(r => r.file?.name || r.name || '参考素材').join("、") || undefined, activityTask: linked ? store.getItem('cp-activity-task') || undefined : undefined, points: modes[type].points, count: 1, createdAt: Date.now(), status: 'queued', demoFailure: state === 'failure', activityCode: linked ? store.getItem('cp-activity-code') || undefined : undefined, activityName: linked ? store.getItem('cp-activity-name') || undefined : undefined };
    taskReferences.current[next.id!] = [...references];
    writeTask(next); setSelected(next.id!); setCollapsed(true);
  };
  const restoreTask = () => {
    if (!task) return;
    setPrompt(task.input || ''); setType((task.item?.replace('light-', '') || 'image') as Mode);
    setRatio(task.ratio || '1:1'); setModel(task.model?.split(' · ')[1] || '标准模型');
    setReferences(taskReferences.current[task.id!] || []);
    ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(key => store.removeItem(key));
    if (task.activityCode) { store.setItem('cp-activity','1'); store.setItem('cp-activity-code',task.activityCode); store.setItem('cp-activity-name',task.activityName || '活动投稿'); if(task.activityTask) store.setItem('cp-activity-task',task.activityTask); }
    setMessage(task.referenceName && !taskReferences.current[task.id!]?.length ? '请重新选择参考图：' + task.referenceName : '');
    setCollapsed(false);
  };
  const filteredHistory = [...rows].filter(row => historyType === 'all' || row.item === 'light-' + historyType).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  const historyGroups = filteredHistory.reduce<{key: string; label: string; rows: PrototypeTask[]}[]>((groups, row) => {
    const date = row.createdAt ? new Date(row.createdAt) : null;
    const key = date ? date.toLocaleDateString('sv-SE') : 'unknown';
    const today = new Date(); const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const label = !date ? '更早' : key === today.toLocaleDateString('sv-SE') ? '今天' : key === yesterday.toLocaleDateString('sv-SE') ? '昨天' : date.getFullYear() === today.getFullYear() ? (date.getMonth()+1)+'月'+date.getDate()+'日' : date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
    const group = groups.find(item => item.key === key);
    if (group) group.rows.push(row); else groups.push({key,label,rows:[row]});
    return groups;
  }, []);
  const publish = () => {
    if (!task || !authenticate()) return;
    if (task.id?.startsWith('sample-light-')) store.setItem('cp-task', JSON.stringify(task)); else writeTask(task);
    const kind = task.item?.replace('light-', '') || 'image';
    store.setItem('cp-post-kind', 'work'); store.removeItem('cp-circle'); store.setItem('cp-source', 'light-result');
    store.setItem('cp-result', JSON.stringify({ kind, prompt: task.input, model: task.model, title: '我的创作', image: '/home-prototype/sea.png', video: kind === 'video' ? '/home-prototype/sea-sample.mp4' : undefined, text: kind === 'text' ? '清晨，海边的小镇渐渐醒来。主角带着相机，寻找记忆中的那束光。\n镜头从海面的晨光移向街道，最后停在主角翻开的旧相册上。' : undefined, taskId: task.id })); go('post-edit');
  };
  const renderMedia = (row: PrototypeTask) => row.item === 'light-text' ? <div className="lw-script"><h3>剧本创作结果</h3><p>清晨，海边的小镇渐渐醒来。主角带着相机，寻找记忆中的那束光。</p><p>镜头从海面的晨光移向街道，最后停在主角翻开的旧相册上。</p></div> : row.item === 'light-video' ? <video src="/home-prototype/sea-sample.mp4" controls playsInline><track kind="captions" src="/home-prototype/sea-sample.vtt" srcLang="zh" label="中文" /></video> : <img src="/home-prototype/sea.png" alt="海岸创作结果" />;
  const renderDownload = (row: PrototypeTask) => <a download={row.item === 'light-text' ? '创作文字.txt' : row.item === 'light-video' ? '创作视频.mp4' : '创作图片.png'} href={row.item === 'light-text' ? 'data:text/plain;charset=utf-8,' + encodeURIComponent('清晨，海边的小镇渐渐醒来。主角带着相机，寻找记忆中的那束光。\n镜头从海面的晨光移向街道，最后停在主角翻开的旧相册上。') : row.item === 'light-video' ? '/home-prototype/sea-sample.mp4' : '/home-prototype/sea.png'}>下载</a>;
  const renderTaskInfo = (row: PrototypeTask, detail = false) => {
    const referenceImages = ['sample-light-image-complete','sample-light-video-running'].includes(row.id || '') ? ['/home-prototype/sea.png'] : (taskReferences.current[row.id!] || []).map(item => item.url);
    return <div className={"lw-task-info" + (detail ? " lw-detail-info" : "")}>
      {row.referenceName && <section className="lw-task-references"><header><h3>参考素材</h3>{referenceImages.length > 0 && <small>{referenceImages.length} 张图片</small>}</header>{referenceImages.length > 0 ? <div>{referenceImages.map((url,index) => <figure key={url}><img src={url} alt={'参考图 '+(index+1)} /><figcaption>参考图 {index+1}</figcaption></figure>)}</div> : <small>{row.referenceName}（请重新选择本地参考图后继续调整）</small>}</section>}
      {detail && <section className="lw-detail-summary"><header><h3>{row.item === 'light-text' ? '剧本创作' : row.item === 'light-video' ? '视频生成' : '图片生成'}</h3><span>生成成功</span></header><dl><div><dt>模型</dt><dd>{row.model}</dd></div>{row.item !== 'light-text' && <div><dt>比例</dt><dd>{row.ratio}</dd></div>}<div><dt>积分</dt><dd>{row.points} 积分</dd></div>{row.activityName && <div><dt>投稿活动</dt><dd>{row.activityName}</dd></div>}</dl></section>}<div className="lw-task-meta" aria-label="生成参数"><span>{row.model || '未记录'}</span>{row.item !== 'light-text' && row.ratio && <span>{row.ratio}</span>}<span>{row.points ?? '—'} 积分{row.status === 'failed' ? '（已释放）' : ''}</span>{row.activityName && <span>{row.activityName}</span>}</div>
      {detail ? <section className="lw-detail-prompt"><header><h3>提示词</h3><button onClick={async () => {try {await navigator.clipboard.writeText(row.input || '');setMessage('提示词已复制');} catch {setMessage('复制失败，请手动选择提示词复制');}}}>复制</button></header><p className="lw-full-prompt">{row.input || '未记录提示词'}</p></section> : <p className="lw-full-prompt">{row.input || '未记录提示词'}</p>}
    </div>;
  };
  return <section className={'lw-workbench'+(reviewMenu?' lw-review-menu':'')}>
    {toolsSlot ? createPortal(<div className="lw-nav-tools"><button onClick={() => go('community')}>找灵感</button><button className="lw-history-trigger" aria-label="生成记录" title="生成记录" onClick={() => setHistory(true)}><img src="/home-prototype/icons/time-line.svg" alt="" /></button></div>, toolsSlot) : <div className="lw-nav-tools lw-tools"><button onClick={() => go('community')}>找灵感</button><button className="lw-history-trigger" aria-label="生成记录" title="生成记录" onClick={() => setHistory(true)}><img src="/home-prototype/icons/time-line.svg" alt="" /></button></div>}
    <div className="lw-stage" aria-live="polite">
      {!task ? <div className="lw-empty"><img src="/home-prototype/icons/sparkling-line.svg" alt="" /><h2>AI 灵感工作台</h2><p>写下灵感，开始创作</p></div> : <article className="lw-result">
        <div className="lw-task-date">{task.createdAt ? <time dateTime={new Date(task.createdAt).toISOString()}><strong>{new Date(task.createdAt).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'}).replace('/','.')}</strong><span>{new Date(task.createdAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})}</span></time> : '生成记录'}</div>
        {renderTaskInfo(task)}
        {running ? <><div className="lw-generation-progress"><strong>{task.status === 'queued' ? '排队中' : '生成中 27%'}</strong><progress aria-label="生成进度" max={100} value={task.status === 'queued' ? 0 : 27} /></div><p className="lw-generation-status" role="status">{task.status === 'queued' ? '排队中' : '生成中'}</p></> : task.status === 'completed' ? <>
          <div className="lw-result-media">{renderMedia(task)}</div>
          <p className="lw-success" role="status">生成成功</p>
          <div className="lw-result-actions"><button onClick={() => setPreviewResult(true)}>查看结果</button>{renderDownload(task)}<button onClick={restoreTask}>继续调整</button><button onClick={publish}>{task.activityCode ? '发布 / 投稿' : '发布作品'}</button></div>
        </> : <div className="lw-progress" role="status"><strong>生成失败</strong><p>本次生成未完成，积分已释放</p><button onClick={() => { restoreTask(); setSelected(''); }}>重新编辑</button></div>}
      </article>}
    </div>
    <div className="lw-composer" data-mode={type} data-collapsed={collapsed}>
      {collapsed ? <button className="lw-expand" onClick={() => { if (running) setSelected(''); setCollapsed(false); }} aria-expanded="false">继续创作 <span>展开输入框 ↑</span></button> : <>
      {task && <button className="lw-collapse" onClick={() => setCollapsed(true)} aria-label="收起创作输入框">收起 ↓</button>}
      <div className="lw-tabs">{Object.entries(modes).map(([key, mode]) => <button key={key} aria-pressed={type === key} onClick={() => { setType(key as Mode); setReferences([]); }}>{mode.title}</button>)}</div>
      {type !== 'text' && <div className="lw-references">{references.map((reference, index) => <div className="lw-reference" key={reference.url}><button type="button" className="lw-reference-preview" aria-label={'预览参考图 '+(index+1)} onClick={()=>setReferenceIndex(index)}><img src={reference.url} alt={'参考图 '+(index+1)}/></button><button aria-label={'移除参考图 ' + (index + 1)} onClick={() => setReferences(items => items.filter(item => item.url !== reference.url))}>×</button></div>)}{references.length < 4 && <label className="lw-upload">＋<small>参考图 {references.length}/4</small><input aria-label="添加参考图" type="file" accept="image/*" multiple onChange={e => { const files = Array.from(e.target.files || []); e.target.value = ''; if (files.some(file => !file.type.startsWith('image/'))) { setMessage('请选择图片文件'); return; } if (files.length + references.length > 4) { setMessage('最多添加 4 张参考图'); return; } setReferences(items => [...items, ...files.map(file => { const url = URL.createObjectURL(file); referenceUrls.current.push(url); return {file, url}; })]); setMessage(''); }} /></label>}</div>}
      <textarea aria-label="创作描述" placeholder="描述你想创作的内容…" value={prompt} onChange={e => setPrompt(e.target.value)} />
      <label className="lw-activity-picker"><span>活动投稿</span><select aria-label="活动投稿" value={selectedActivity} onChange={e => chooseActivity(e.target.value)}><option value="">暂不参加</option>{selectedActivity && !activityOptions.some(item => item.code === selectedActivity) && <option value={selectedActivity} disabled>{store.getItem('cp-activity-name') || '原活动'}（暂不可选）</option>}{activityOptions.map(activity => <option key={activity.code} value={activity.code}>{activity.name}</option>)}</select></label>

      {message && message!=='提示词已复制' && <p role="alert">{message}</p>}
      <div className="lw-bottom-toolbar"><div className="lw-parameters"><ParameterMenu label="生成模型" value={model} onChange={setModel} options={['标准模型','创意模型']} initialOpen={reviewOverlay==='aigc-model'}/>{type !== 'text' && <ParameterMenu label="画面比例" value={ratio} onChange={setRatio} options={['1:1','16:9','9:16','4:3','3:2','3:4']} initialOpen={reviewOverlay==='aigc-ratio'}/>}</div><div className="lw-submit"><button aria-label={"开始生成，预计消耗" + modes[type].points + "积分"} disabled={!prompt.trim() || Boolean(running)} onClick={generate}>{running ? '生成中' : modes[type].points+' 积分 ↑'}</button></div></div>
      </>}
    </div>
    <TransientFeedback message={message==='提示词已复制'?message:''} onClear={()=>setMessage('')}/>
    {history && <div className="lw-history-mask"><dialog open className="lw-history" aria-modal="true" aria-label="生成记录" onKeyDown={e => {if(e.key === 'Escape') setHistory(false);}}><header><button autoFocus aria-label="返回创作" onClick={() => setHistory(false)}><img src="/home-prototype/icons/arrow-left-s-line.svg" alt="" /></button><h2>生成记录</h2><span /></header><div className="lw-history-body"><div className="lw-tabs" aria-label="记录类型">{[['all','全部'],['image','图片'],['video','视频'],['text','剧本']].map(([key,title]) => <button key={key} aria-pressed={historyType === key} onClick={() => setHistoryType(key)}>{title}</button>)}</div><p className="lw-history-count">{filteredHistory.length} 条记录</p>{historyGroups.length ? historyGroups.map(group => <section className="lw-history-group" key={group.key}><div className="lw-history-date"><strong>{group.label}</strong><small>{group.rows.length} 条</small></div>{group.rows.map(row => <button className="lw-history-row" key={row.id} onClick={() => {setSelected(row.id!);setHistory(false);setCollapsed(true);}}><span className="lw-history-thumbnail">{row.status === 'completed' && row.item === 'light-image' ? <img src="/home-prototype/sea.png" alt="" /> : <img className="lw-history-kind-icon" src="/home-prototype/icons/sparkling-line.svg" alt="" />}</span><span className="lw-history-copy"><strong>{row.input || '未命名创作'}</strong><small>{row.item === 'light-video' ? '视频生成' : row.item === 'light-text' ? '剧本创作' : '图片生成'}{row.points !== undefined ? ' / '+row.points+' 积分' : ''}</small><small>{row.model || '模型信息待同步'}</small></span><span className={'lw-history-status '+row.status}>{row.status === 'completed' ? '已完成' : row.status === 'failed' ? '生成失败' : row.status === 'queued' ? '排队中' : '生成中'}<img src="/home-prototype/icons/arrow-right-s-line.svg" alt="" /></span></button>)}</section>) : <div className="lw-history-empty"><p>{historyType === 'all' ? '还没有生成记录' : '还没有'+(historyType === 'image' ? '图片' : historyType === 'video' ? '视频' : '剧本')+'生成记录'}</p></div>}</div></dialog></div>}
    <MediaPreview title="参考素材预览" items={references.map((r,i)=>({src:r.url,name:r.name||"参考图 "+(i+1)}))} index={referenceIndex} onIndexChange={setReferenceIndex} onClose={()=>setReferenceIndex(null)}/>
    {previewResult && task?.status === 'completed' && <div className="lw-result-overlay" role="dialog" aria-modal="true" aria-label="生成结果"><header><button aria-label="返回创作结果" onClick={() => setPreviewResult(false)}><img src="/home-prototype/icons/arrow-left-s-line.svg" alt="" /></button><h2>生成结果</h2><span /></header><div className="lw-result-detail"><div className="lw-result-media">{renderMedia(task)}</div>{renderTaskInfo(task, true)}{message && message!=='提示词已复制' && <p className="lw-detail-notice" role="status">{message}</p>}<div className="lw-result-actions">{renderDownload(task)}<button onClick={() => {setPreviewResult(false);restoreTask();}}>继续调整</button><button onClick={publish}>{task.activityCode ? '发布 / 投稿' : '发布作品'}</button></div></div></div>}
  </section>;
}

export function LightWorkbench(props:{state:string;go:(page:string)=>void}) {
 const [rows,setRows]=useState(workbenchHistory);
 useEffect(()=>{const refresh=()=>setRows(workbenchHistory());window.addEventListener('cp-task-change',refresh);return()=>window.removeEventListener('cp-task-change',refresh);},[]);
 return typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('device')==='pc'?<PcGeneration {...props} rows={rows}/>:<MobileLightWorkbench {...props}/>;
}

export function GenerationResult({state,go}:{state:string;go:(page:string)=>void}) { return <PcGeneration key={state} state={state} go={go} rows={workbenchHistory()} resultOnly/>; }
