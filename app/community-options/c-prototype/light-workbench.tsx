'use client';
/* eslint-disable next/no-img-element -- Bundled prototype assets. */
import { useEffect, useRef, useState } from 'react';
import { prototypeStore as store, taskHistory, writeTask, pointBalance, currentTarget, type PrototypeTask } from './storage';
import './light-workbench.css';

// Local demonstration quotes; production quotes must come from the selected model configuration.
const modes = { image: { title: '图片生成', model: '图片模型', points: 10 }, text: { title: '剧本创作', model: '文字模型', points: 2 }, video: { title: '视频生成', model: '视频模型', points: 20 } };
type Mode = keyof typeof modes;
function draft() { try { return JSON.parse(store.getItem('cp-light-create-draft') || '{}'); } catch { return {}; } }
export function LightWorkbench({ state, go }: { state: string; go: (page: string) => void }) {
  const [type, setType] = useState<Mode>(() => draft().type in modes ? draft().type : 'image');
  const [prompt, setPrompt] = useState<string>(() => draft().prompt || '');
  const [ratio, setRatio] = useState(() => draft().ratio || '1:1');
  const [reference, setReference] = useState<File | null>(null);
  const [history, setHistory] = useState(false);
  const [historyType, setHistoryType] = useState('all');
  const [collapsed, setCollapsed] = useState(false);
  const [model, setModel] = useState(() => draft().model || '标准模型');
  const [referenceUrl, setReferenceUrl] = useState('');
  useEffect(() => () => { if (referenceUrl) URL.revokeObjectURL(referenceUrl); }, [referenceUrl]);
  const [rows, setRows] = useState(() => taskHistory().filter(t => t.item?.startsWith('light-')));
  const [selected, setSelected] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('task') || '');
  const [message, setMessage] = useState('');
  const busy = useRef(false);
  const task = rows.find(t => t.id === selected);
  const running = task?.status === 'queued' || task?.status === 'running';
  const linked = store.getItem('cp-activity') === '1';
  const refresh = () => setRows(taskHistory().filter(t => t.item?.startsWith('light-')));
  useEffect(() => { window.addEventListener('cp-task-change', refresh); return () => window.removeEventListener('cp-task-change', refresh); }, []);
  useEffect(() => {
    store.setItem('cp-light-create-draft', JSON.stringify({ type, prompt, ratio, model }));
  }, [type, prompt, ratio, model]);
  useEffect(() => {
    const timers = rows.filter(row => ['queued', 'running'].includes(row.status)).map(row => window.setTimeout(() => {
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
    busy.current = true; setMessage('');
    const next: PrototypeTask = { id: 'light-' + Date.now(), item: 'light-' + type, input: prompt.trim(), model: modes[type].model + " · " + model, ratio, referenceName: reference?.name, activityTask: linked ? store.getItem('cp-activity-task') || undefined : undefined, points: modes[type].points, count: 1, createdAt: Date.now(), status: 'queued', demoFailure: state === 'failure', activityCode: linked ? store.getItem('cp-activity-code') || undefined : undefined, activityName: linked ? store.getItem('cp-activity-name') || undefined : undefined };
    writeTask(next); setSelected(next.id!); setCollapsed(true);
  };
  const publish = () => {
    if (!task || !authenticate()) return;
    writeTask(task);
    const kind = task.item?.replace('light-', '') || 'image';
    store.setItem('cp-post-kind', 'work'); store.removeItem('cp-circle'); store.setItem('cp-source', 'light-result');
    store.setItem('cp-result', JSON.stringify({ kind, title: '我的创作', image: '/home-prototype/sea.png', video: kind === 'video' ? '/home-prototype/sea-sample.mp4' : undefined, text: kind === 'text' ? '清晨，海边的小镇渐渐醒来。主角带着相机，寻找记忆中的那束光。' : undefined, taskId: task.id })); go('post-edit');
  };
  return <section className="lw-workbench">
    <div className="lw-tools"><button onClick={() => go('community')}>找灵感</button><button onClick={() => setHistory(true)}>生成记录</button></div>
    <div className="lw-stage" aria-live="polite">
      {!task ? <div className="lw-empty"><img src="/home-prototype/icons/sparkling-line.svg" alt="" /><h2>AI 灵感工作台</h2><p>写下灵感，开始创作</p></div> : <article className="lw-result">
        <p className="lw-prompt">{task.input}{task.referenceName && <small> · 参考图：{task.referenceName}</small>}</p>
        {running ? <div className="lw-progress"><span />{task.status === 'queued' ? '排队中' : '正在生成'}<small>结果将保存在生成记录</small></div> : task.status === 'completed' ? <>
          {task.item === 'light-text' ? <p className="lw-script">清晨，海边的小镇渐渐醒来。主角带着相机，寻找记忆中的那束光。</p> : task.item === 'light-video' ? <video src="/home-prototype/sea-sample.mp4" controls playsInline><track kind="captions" src="/home-prototype/sea-sample.vtt" srcLang="zh" label="中文" /></video> : <img src="/home-prototype/sea.png" alt="海边小镇创作结果" />}
          <div className="lw-result-actions"><button onClick={() => { setPrompt(task.input || ''); setType((task.item?.replace('light-', '') || 'image') as Mode); setRatio(task.ratio || '1:1'); setModel(task.model?.split(' · ')[1] || '标准模型'); setCollapsed(false); }}>继续调整</button><button onClick={publish}>发布作品</button></div>
        </> : <div className="lw-progress">生成失败，积分已释放<button onClick={() => { setPrompt(task.input || ''); setType((task.item?.replace('light-', '') || 'image') as Mode); setSelected(''); setCollapsed(false); }}>重新编辑</button></div>}
      </article>}
    </div>
    <div className="lw-composer">
      {collapsed ? <button className="lw-expand" onClick={() => setCollapsed(false)} aria-expanded="false">继续创作 <span>展开输入框 ↑</span></button> : <>
      {task && <button className="lw-collapse" onClick={() => setCollapsed(true)} aria-label="收起创作输入框">收起 ↓</button>}
      <div className="lw-tabs">{Object.entries(modes).map(([key, mode]) => <button key={key} aria-pressed={type === key} onClick={() => { setType(key as Mode); setReference(null); }}>{mode.title}</button>)}</div>
      {type !== 'text' && <div className="lw-references">{reference && referenceUrl ? <div className="lw-reference"><img src={referenceUrl} alt="参考图" /><button aria-label="移除参考图" onClick={() => {setReference(null); setReferenceUrl('');}}>×</button></div> : <label className="lw-upload">＋<small>参考图</small><input aria-label="添加参考图" type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0] || null; setReference(file); setReferenceUrl(file ? URL.createObjectURL(file) : ''); }} /></label>}</div>}
      <textarea aria-label="创作描述" placeholder="描述你想创作的内容…" value={prompt} onChange={e => setPrompt(e.target.value)} />
      <div className="lw-parameters"><select aria-label="生成模型" value={model} onChange={e => setModel(e.target.value)}><option>标准模型</option><option>创意模型</option></select>{type !== 'text' && <select aria-label="画面比例" value={ratio} onChange={e => setRatio(e.target.value)}><option>1:1</option><option>16:9</option><option>9:16</option><option>4:3</option><option>3:2</option><option>3:4</option></select>}</div>
      {linked && <div className="lw-activity">{store.getItem('cp-activity-name') || '活动投稿'}<button onClick={() => { ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(k => store.removeItem(k)); refresh(); }}>取消关联</button></div>}
      {state === 'expired' && linked && <p role="alert">活动已结束，请取消关联后继续创作</p>}
      {message && <p role="alert">{message}</p>}
      <div className="lw-submit"><small>可用 {pointBalance()} 积分</small><button aria-label={"开始生成，预计消耗" + modes[type].points + "积分"} disabled={!prompt.trim() || Boolean(running) || (state === 'expired' && linked)} onClick={generate}>{running ? '生成中' : modes[type].points+' 积分 ↑'}</button></div>
      </>}
    </div>
    {history && <div className="lw-history-mask"><dialog open className="lw-history" aria-modal="true" aria-label="生成记录"><header><strong>生成记录</strong><button onClick={() => setHistory(false)}>关闭</button></header><div className="lw-tabs">{[['all','全部'],['image','图片'],['text','剧本'],['video','视频']].map(([key,title]) => <button key={key} aria-pressed={historyType === key} onClick={() => setHistoryType(key)}>{title}</button>)}</div>{rows.filter(row => historyType === 'all' || row.item === 'light-' + historyType).length ? rows.filter(row => historyType === 'all' || row.item === 'light-' + historyType).map(row => <button key={row.id} onClick={() => { setSelected(row.id!); setHistory(false); setCollapsed(true); }}><strong>{row.input}</strong><small>{row.status === 'completed' ? '已完成' : row.status === 'failed' ? '生成失败' : '处理中'}</small></button>) : <p>暂无生成记录</p>}</dialog></div>}
  </section>;
}
