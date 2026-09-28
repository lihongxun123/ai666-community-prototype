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
    store.setItem('cp-light-create-draft', JSON.stringify({ type, prompt, ratio }));
  }, [type, prompt, ratio]);
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
    const next: PrototypeTask = { id: 'light-' + Date.now(), item: 'light-' + type, input: prompt.trim(), model: modes[type].model, ratio, referenceName: reference?.name, activityTask: linked ? store.getItem('cp-activity-task') || undefined : undefined, points: modes[type].points, count: 1, createdAt: Date.now(), status: 'queued', demoFailure: state === 'failure', activityCode: linked ? store.getItem('cp-activity-code') || undefined : undefined, activityName: linked ? store.getItem('cp-activity-name') || undefined : undefined };
    writeTask(next); setSelected(next.id!);
  };
  const publish = () => {
    if (!task || !authenticate()) return;
    writeTask(task);
    const kind = task.item?.replace('light-', '') || 'image';
    store.setItem('cp-post-kind', 'work'); store.removeItem('cp-circle'); store.setItem('cp-source', 'app-result');
    store.setItem('cp-result', JSON.stringify({ kind, title: '我的创作', image: '/home-prototype/sea.png', video: kind === 'video' ? '/home-prototype/sea-sample.mp4' : undefined, text: kind === 'text' ? '清晨，海边的小镇渐渐醒来。主角带着相机，寻找记忆中的那束光。' : undefined, taskId: task.id })); go('post-edit');
  };
  return <section className="lw-workbench">
    <div className="lw-tools"><button onClick={() => go('community')}>找灵感</button><button onClick={() => setHistory(true)}>生成记录</button></div>
    <div className="lw-stage" aria-live="polite">
      {!task ? <div className="lw-empty"><img src="/home-prototype/icons/sparkling-line.svg" alt="" /><h2>AI 灵感工作台</h2><p>写下灵感，开始创作</p></div> : <article className="lw-result">
        <p className="lw-prompt">{task.input}{task.referenceName && <small> · 参考图：{task.referenceName}</small>}</p>
        {running ? <div className="lw-progress"><span />{task.status === 'queued' ? '排队中' : '正在生成'}<small>结果将保存在生成记录</small></div> : task.status === 'completed' ? <>
          {task.item === 'light-text' ? <p className="lw-script">清晨，海边的小镇渐渐醒来。主角带着相机，寻找记忆中的那束光。</p> : task.item === 'light-video' ? <video src="/home-prototype/sea-sample.mp4" controls playsInline><track kind="captions" src="/home-prototype/sea-sample.vtt" srcLang="zh" label="中文" /></video> : <img src="/home-prototype/sea.png" alt="海边小镇创作结果" />}
          <div className="lw-result-actions"><button onClick={() => { setPrompt(task.input || ''); setType((task.item?.replace('light-', '') || 'image') as Mode); setRatio(task.ratio || '1:1'); }}>继续调整</button><button onClick={publish}>发布作品</button></div>
        </> : <div className="lw-progress">生成失败，积分已释放<button onClick={() => { setPrompt(task.input || ''); setType((task.item?.replace('light-', '') || 'image') as Mode); setSelected(''); }}>重新编辑</button></div>}
      </article>}
    </div>
    <div className="lw-composer">
      <div className="lw-tabs">{Object.entries(modes).map(([key, mode]) => <button key={key} aria-pressed={type === key} onClick={() => { setType(key as Mode); setReference(null); }}>{mode.title}</button>)}</div>
      <textarea aria-label="创作描述" placeholder="描述你想创作的内容…" value={prompt} onChange={e => setPrompt(e.target.value)} />
      <div className="lw-parameters"><span>{modes[type].model}</span>{type !== 'text' && <select aria-label="画面比例" value={ratio} onChange={e => setRatio(e.target.value)}><option>1:1</option><option>16:9</option><option>9:16</option><option>4:3</option><option>3:4</option></select>}{type !== 'text' && <label className="lw-upload">{reference ? reference.name : '＋ 参考图'}<input type="file" accept="image/*" onChange={e => setReference(e.target.files?.[0] || null)} /></label>}</div>
      {linked && <div className="lw-activity">{store.getItem('cp-activity-name') || '活动投稿'}<button onClick={() => { ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(k => store.removeItem(k)); refresh(); }}>取消关联</button></div>}
      {state === 'expired' && linked && <p role="alert">活动已结束，请取消关联后继续创作</p>}
      {message && <p role="alert">{message}</p>}
      <div className="lw-submit"><small>预计 {modes[type].points} 积分 · 可用 {pointBalance()}</small><button disabled={Boolean(running) || (state === 'expired' && linked)} onClick={generate}>{running ? '生成中' : '生成'}</button></div>
    </div>
    {history && <div className="lw-history-mask"><dialog open className="lw-history" aria-modal="true" aria-label="生成记录"><header><strong>生成记录</strong><button onClick={() => setHistory(false)}>关闭</button></header>{rows.length ? rows.map(row => <button key={row.id} onClick={() => { setSelected(row.id!); setHistory(false); }}><strong>{row.input}</strong><small>{row.status === 'completed' ? '已完成' : row.status === 'failed' ? '生成失败' : '处理中'}</small></button>) : <p>暂无生成记录</p>}</dialog></div>}
  </section>;
}
