'use client';
/* oxlint-disable next/no-img-element -- Reuse approved local prototype assets. */
import { useEffect, useRef, useState } from 'react';
type AppEntry = {
  id: string;
  name: string;
  summary: string;
  image: string;
  mobile: boolean;
  available: boolean;
  media: string;
  input: string;
  output: string;
  place: string;
};
// Fictional interface fixtures, not a release list or evidence of runnable capabilities.
const entries: AppEntry[] = [
  {
    id: 'copy',
    name: '文案改写',
    summary: '把已有文字整理成更清楚的表达。',
    image: 'writing',
    mobile: true,
    available: true,
    media: '文字',
    input: '需要改写的文字，以及用途与语气要求。',
    output: '可继续编辑的文字结果。',
    place: '社区内体验',
  },
  {
    id: 'background',
    name: '产品换背景',
    summary: '保留产品主体，尝试不同的展示背景。',
    image: 'perfume',
    mobile: true,
    available: true,
    media: '图片',
    input: '一张有权使用的产品图片，以及背景描述。',
    output: '用于效果对比的图片结果。',
    place: '社区内体验',
  },
  {
    id: 'video',
    name: '产品短片制作',
    summary: '整理产品素材、镜头和场景，制作展示短片。',
    image: 'sea',
    mobile: false,
    available: true,
    media: '视频',
    input: '有权使用的产品素材、镜头目标和场景说明。',
    output: '视频成果；具体效果取决于素材与制作设置。',
    place: 'MakeNow',
  },
  {
    id: 'restore',
    name: '照片修复',
    summary: '改善照片中的模糊和瑕疵。',
    image: 'restore',
    mobile: true,
    available: false,
    media: '图片',
    input: '一张有权使用的待修复照片。',
    output: '修复后的图片，不保证恢复原本不存在的细节。',
    place: '社区内体验',
  },
];
type View = string;
export default function AppCatalog() {
  const [view, setView] = useState<View>('closed'),
    [state, setState] = useState('ready'),
    [rules, setRules] = useState(false),
    [reviewMode, setReviewMode] = useState(false),
    [handoff, setHandoff] = useState(false),
    [removedIds, setRemovedIds] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null),
    listPosition = useRef(0),
    trigger = useRef<HTMLButtonElement>(null);
  const opened = view !== 'closed',
    entry = entries.find((e) => e.id === view);
  // Shared catalogue; prioritize currently usable entries on mobile, preserving source order within each group.
  const list = entries
    .filter((e) => !removedIds.includes(e.id))
    .sort(
      (a, b) =>
        Number(b.mobile && b.available) - Number(a.mobile && a.available),
    );
  useEffect(() => {
    const pop = (e: PopStateEvent) => {
      const target = e.state?.homeApp;
      setView(
        target === 'list' || entries.some((a) => a.id === target)
          ? target
          : 'closed',
      );
      setHandoff(false);
    };
    pop({ state: window.history.state } as PopStateEvent);
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    if (!opened) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, [opened]);
  useEffect(() => {
    if (dialog.current)
      dialog.current.scrollTop = view === 'list' ? listPosition.current : 0;
  }, [view]);
  const navigate = (next: string) => {
    setReviewMode(
      new URLSearchParams(window.location.search).get('review') === '1',
    );

    if (state === 'removed' && next !== 'list')
      setRemovedIds((ids) => [...new Set([...ids, next])]);
    if (view === 'list') listPosition.current = dialog.current?.scrollTop || 0;
    window.history.pushState(
      { ...window.history.state, homeApp: next },
      '',
      window.location.href,
    );
    setView(next);
    setHandoff(false);
  };
  const back = () => {
    setRules(false);
    setHandoff(false);
    if (window.history.state?.homeApp) window.history.back();
    else setView(view === 'list' ? 'closed' : 'list');
  };
  return (
    <>
      <button ref={trigger} onClick={() => navigate('list')}>
        <span>
          <img
            className="mh-icon"
            src="/home-prototype/icons/box-3-line.svg"
            alt=""
          />
        </span>
        AI应用
      </button>
      <dialog
        ref={dialog}
        className="mh-banner-destination mh-app-catalog"
        aria-label="AI应用"
        onCancel={(e) => {
          e.preventDefault();
          back();
        }}
      >
        <header>
          <button
            aria-label={view === 'list' ? '返回首页' : '返回应用列表'}
            onClick={back}
          >
            <img src="/home-prototype/icons/arrow-left-line.svg" alt="" />
          </button>
          <span>{view === 'list' ? 'AI应用' : '应用详情'}</span>
        </header>
        {reviewMode && (
          <button
            className="mh-review-toggle"
            onClick={() => setRules((v) => !v)}
            aria-expanded={rules}
          >
            应用走查
          </button>
        )}
        {rules && (
          <aside className="mh-app-review" aria-label="应用原型走查">
            <strong>本次：入口、列表与详情信息</strong>
            <p>
              本页四项为虚构界面样例，图片沿用研究站素材，不代表首发供给、实测效果或已接入能力。执行路径仅用于展示已确认的两类承接。
            </p>
            <label>
              列表与访问状态
              <select
                aria-label="应用场景"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  if (e.target.value === 'ready') setRemovedIds([]);
                }}
              >
                <option value="ready">正常</option>
                <option value="empty">暂无应用</option>
                <option value="error">列表加载失败</option>
                <option value="removed">点击后发现内容下架</option>
              </select>
            </label>
            <p>
              两端使用同一应用目录，手机端自动将当前可用项排在前面，同组沿用既定顺序；不提供设备筛选或手机可用标签，PC
              使用要求在详情说明。本次不定义具体积分、不生成、不扣费。输入、费用、任务与结果将在应用体验环节深化。运行暂停保留详情；内容下架隐藏内容。
            </p>
            <button onClick={() => setRules(false)}>关闭应用走查</button>
          </aside>
        )}
        {handoff && entry && (
          <aside className="mh-app-review" aria-label="体验原型接线边界">
            <strong>
              原型接线：
              {entry.mobile ? '社区应用体验' : 'MakeNow 指定工具'}
            </strong>
            <p>
              当前完成列表与详情信息。本应用为虚构样例，尚未制作执行页，也没有真实工具链接；此处没有提交任务或发生费用。
            </p>
            <button onClick={() => setHandoff(false)}>继续查看详情</button>
          </aside>
        )}
        <div className="mh-destination-body">
          {view === 'list' ? (
            <>
              {state === 'error' ? (
                <section className="mh-target-state">
                  <h2>应用暂时加载失败</h2>
                  <p>请重试，或返回首页继续浏览。</p>
                  <button
                    className="mh-primary"
                    onClick={() => setState('ready')}
                  >
                    重新加载
                  </button>
                </section>
              ) : state === 'empty' || list.length === 0 ? (
                <section className="mh-target-state">
                  <h2>暂时没有应用</h2>
                  <p>可以稍后再来看看。</p>
                </section>
              ) : (
                <>
                  <div className="mh-app-list">
                    {list.map((a) => (
                      <button
                        className="mh-app-card"
                        aria-label={a.name + (!a.available ? '：暂不可用' : '')}
                        key={a.id}
                        onClick={() => navigate(a.id)}
                      >
                        <img
                          src={'/home-prototype/' + a.image + '.png'}
                          alt=""
                        />
                        <span className="mh-app-card-copy">
                          <strong>{a.name}</strong>
                          {!a.available && (
                            <span className="mh-app-status">暂不可用</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mh-app-list-end">已显示全部应用</p>
                </>
              )}
            </>
          ) : (
            entry &&
            (removedIds.includes(view) ? (
              <section className="mh-target-state">
                <h1>内容暂不可访问</h1>
                <p>应用介绍可能已下架或不再公开。</p>
                <button className="mh-primary" onClick={back}>
                  返回应用列表
                </button>
              </section>
            ) : (
              <>
                <span className="mh-label">
                  {entry.media}
                  {!entry.mobile && ' · 电脑端使用'}
                </span>
                <h1>{entry.name}</h1>
                <p>{entry.summary}</p>
                <img
                  className="mh-app-detail-cover"
                  src={'/home-prototype/' + entry.image + '.png'}
                  alt={entry.name + '的场景示意'}
                />
                <p className="mh-muted">场景示意</p>
                {!entry.available && (
                  <section className="mh-target-note">
                    <h2>应用暂不可用</h2>
                    <p>当前已暂停运行，你仍可阅读介绍；恢复后再尝试使用。</p>
                  </section>
                )}
                <section className="mh-app-section">
                  <h2>需要准备什么</h2>
                  <p>{entry.input}</p>
                </section>
                <section className="mh-app-section">
                  <h2>可以得到什么</h2>
                  <p>{entry.output}</p>
                </section>
                <dl className="mh-app-facts">
                  <dt>提供方</dt>
                  <dd>多元拾光</dd>
                  <dt>使用位置</dt>
                  <dd>{entry.place}</dd>
                  <dt>账号</dt>
                  <dd>
                    {entry.mobile
                      ? '浏览无需登录，使用时登录社区账号。'
                      : '使用 MakeNow 账号，首次回流私人结果时确认关联。'}
                  </dd>
                  <dt>费用</dt>
                  <dd>
                    {entry.mobile
                      ? '使用社区积分，提交任务前显示本次消耗。'
                      : '由 MakeNow 展示其自身费用，与社区积分分别管理。'}
                  </dd>
                </dl>
                {!entry.mobile && (
                  <section className="mh-target-note">
                    <h2>请在电脑端继续</h2>
                    <p>
                      该应用暂不支持手机操作。请在电脑端打开社区，进入同一应用详情后前往
                      MakeNow 使用；手机上可先了解用途与准备条件。
                    </p>
                  </section>
                )}
                {entry.available && (
                  <button
                    className="mh-primary"
                    onClick={() => {
                      setHandoff(true);
                      setRules(false);
                    }}
                  >
                    {entry.mobile ? '在社区体验' : '查看电脑端承接'}
                  </button>
                )}
              </>
            ))
          )}
        </div>
      </dialog>
    </>
  );
}
