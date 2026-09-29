'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AttachmentPicker,
  ContentBlockPreview,
  MediaPicker,
  MediaPreview,
  mediaReady,
} from './content-media';
import {
  useB,
  readB,
  changeRecord,
  newRecord,
  kindLabels,
  kinds,
  type Kind,
  type Draft,
  type Content,
  type Block,
  makeNowAppHandoff,
} from './store';
import './content-refinement.css';
export const contentPages = [
  ...kinds.flatMap((k) => [
    {
      id: k + 's',
      title: kindLabels[k] + '管理',
      module: '内容管理',
      states: ['normal', 'empty', 'error', 'no-permission'],
    },
    {
      id: k + '-edit',
      title: kindLabels[k] + '编辑',
      module: '内容管理',
      states: [
        'normal',
        'incomplete',
        'conflict',
        'save-error',
        'reviewing',
        'returned',
        'unauthorized',
      ],
    },
  ]),
  {
    id: 'preview',
    title: '内容预览',
    module: '审核与发布',
    states: ['normal', 'private', 'unavailable'],
  },
  {
    id: 'reviews',
    title: '审核任务',
    module: '审核与发布',
    states: ['normal', 'empty', 'error'],
  },
  {
    id: 'review',
    title: '审核详情',
    module: '审核与发布',
    states: ['normal', 'returned', 'stale', 'unknown'],
  },
  {
    id: 'release',
    title: '发布确认',
    module: '审核与发布',
    states: [
      'normal',
      'incomplete',
      'reference-invalid',
      'unverified',
      'published',
    ],
  },
  {
    id: 'verify',
    title: '能力核验',
    module: '审核与发布',
    states: ['normal', 'failed', 'changed', 'paused'],
  },
  {
    id: 'references',
    title: '引用与影响',
    module: '维护与记录',
    states: ['normal', 'unavailable', 'private'],
  },
  {
    id: 'transfer',
    title: '维护交接',
    module: '维护与记录',
    states: ['normal', 'unauthorized', 'pending'],
  },
  {
    id: 'history',
    title: '操作记录',
    module: '维护与记录',
    states: ['normal', 'empty'],
  },
];
export function ContentPage({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (s: string) => void;
}) {
  const db = useB(),
    q = new URLSearchParams(
      typeof location === 'undefined' ? '' : location.search,
    ),
    kind = (
      page.split('-')[0].replace(/s$/, '') in kindLabels
        ? page.split('-')[0].replace(/s$/, '')
        : 'tutorial'
    ) as Kind;
  const fixture =
    page === 'review'
      ? state === 'returned'
        ? 'tutorial-3'
        : 'tutorial-4'
      : page === 'transfer' && state === 'pending'
        ? 'tutorial-4'
        : page === 'tutorial-edit' && state === 'reviewing'
          ? 'tutorial-4'
          : page === 'tutorial-edit' && state === 'returned'
            ? 'tutorial-3'
            : page === 'tutorial-edit' && state === 'incomplete'
              ? 'tutorial-2'
              : '';
  const explicitId = q.get('id');
  const selectedRecord = explicitId
    ? db.records.find((r) => r.id === explicitId)
    : undefined;
  const detailPage =
    page.endsWith('-edit') ||
    [
      'preview',
      'review',
      'release',
      'verify',
      'references',
      'transfer',
      'history',
    ].includes(page);
  const invalidSelection =
    detailPage &&
    q.has('id') &&
    (!selectedRecord ||
      (page.endsWith('-edit') && selectedRecord.kind !== kind));
  const record =
    selectedRecord ||
    db.records.find((r) => r.id === fixture) ||
    db.records.find((r) => r.kind === kind) ||
    db.records[0];
  const displayTitle =
    record.draft.title ||
    (record.kind === 'post'
      ? record.draft.body
          .find(
            (block) =>
              block.text.trim() && !['图片', '视频'].includes(block.type),
          )
          ?.text.slice(0, 34)
      : '') ||
    '未命名草稿';
  const [draft, setDraft] = useState<Draft>(() =>
      state === 'incomplete'
        ? { ...structuredClone(record.draft), title: '', license: '' }
        : structuredClone(record.draft),
    ),
    [base, setBase] = useState(record.revision),
    [message, setMessage] = useState(''),
    [mediaError, setMediaError] = useState(''),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('全部'),
    [reason, setReason] = useState(''),
    [confirm, setConfirm] = useState(''),
    [checked, setChecked] = useState(false),
    [owner, setOwner] = useState(
      record.draft.owner === '运营编辑' ? '内容编辑' : '运营编辑',
    ),
    [checks, setChecks] = useState<string[]>([]),
    [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(
      null,
    );
  const lastId = useRef(record.id);
  const savedSnapshot = useRef(JSON.stringify(draft));
  const dirtyRef = useRef(false);
  const leaveDialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = leaveDialogRef.current;
    if (!pendingNavigation || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [pendingNavigation]);
  useEffect(() => {
    dirtyRef.current =
      page.endsWith('-edit') &&
      !invalidSelection &&
      JSON.stringify(draft) !== savedSnapshot.current;
  }, [draft, page, invalidSelection]);
  useEffect(() => {
    if (!page.endsWith('-edit')) return;
    const beforeNavigate = (event: Event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      const proceed = (event as CustomEvent<{ proceed?: () => void }>).detail
        ?.proceed;
      if (proceed) setPendingNavigation(() => proceed);
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
    };
    window.addEventListener('prototype-before-navigate', beforeNavigate);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('prototype-before-navigate', beforeNavigate);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [page]);
  useEffect(() => {
    if (lastId.current === record.id) return;
    lastId.current = record.id;
    let active = true;
    const next =
      state === 'incomplete'
        ? { ...structuredClone(record.draft), title: '', license: '' }
        : structuredClone(record.draft);
    queueMicrotask(() => {
      if (active) {
        setDraft(next);
        setBase(record.revision);
        savedSnapshot.current = JSON.stringify(next);
        dirtyRef.current = false;
      }
    });
    return () => {
      active = false;
    };
  }, [record.id, record.draft, record.revision, state]);
  const detail = (id: string) => go(id + '?id=' + record.id),
    patch = (key: keyof Draft, value: Draft[keyof Draft]) =>
      setDraft({ ...draft, [key]: value });
  const act = (action: string, fn: (r: Content) => Content, note = reason) => {
    changeRecord(record.id, action, note, fn);
    setMessage(action + '已完成');
    setConfirm('');
  };
  const fieldsMissing = (d: Draft) => {
    const m = [];
    if (!d.title.trim() && record.kind !== 'post') m.push('标题');
    if (
      !d.body.some(
        (b) =>
          b.text.trim() &&
          (record.kind !== 'post' || !['图片', '视频'].includes(b.type)),
      ) &&
      record.kind !== 'work'
    )
      m.push('正文');
    if (!d.author.trim()) m.push('作者');
    if (record.kind !== 'post' && !d.license.trim()) m.push('授权说明');
    if (
      ['tutorial', 'app', 'resource'].includes(record.kind) &&
      !d.summary.trim()
    )
      m.push('简介');
    if (
      ['tutorial', 'app', 'resource'].includes(record.kind) &&
      !d.cover.trim()
    )
      m.push('封面');
    if (
      ['tutorial', 'app', 'resource'].includes(record.kind) &&
      !d.source.trim()
    )
      m.push('内容来源');
    if (['app', 'resource'].includes(record.kind) && !d.owner.trim())
      m.push('维护人');
    if (['app', 'resource'].includes(record.kind) && !d.conditions.trim())
      m.push('使用条件');
    if (record.kind === 'app' && !d.inputs.trim()) m.push('准备材料');
    if (record.kind === 'app' && !d.outputs.trim()) m.push('输出说明');
    if (record.kind === 'work' && !d.core) m.push('作品正文或媒体');
    if (['app', 'resource'].includes(record.kind) && !d.entry.trim())
      m.push(record.kind === 'app' ? 'MakeNow 承接链接' : '工程或文件入口');
    if (record.kind === 'app' && d.entry.trim() && !d.entry.startsWith('/community-options/cross-prototype?page=app&item=') && !/^https:\/\//i.test(d.entry.trim()))
      m.push('有效的 MakeNow 承接链接');
    if (
      (d.core.startsWith('local:') && !mediaReady(d.core)) ||
      d.body.some(
        (b) => ['图片', '视频'].includes(b.type) && !mediaReady(b.text),
      ) ||
      d.attachments.some((x) => !mediaReady(x))
    )
      m.push('重新选择本地素材');
    const images = d.body.filter((b) => b.type === '图片');
    const videos = d.body.filter((b) => b.type === '视频');
    if (
      record.kind === 'post' &&
      (images.length > 9 ||
        videos.length > 1 ||
        (images.length && videos.length))
    )
      m.push('帖子图片与视频数量');
    if (
      d.body.some(
        (b) =>
          ['图片', '视频'].includes(b.type) &&
          !b.text.startsWith('local:') &&
          !b.text.startsWith('/') &&
          !/^https?:/.test(b.text),
      )
    )
      m.push('选择图片或视频文件');
    const totalText = d.body
      .filter((b) => !['图片', '视频'].includes(b.type))
      .reduce((n, b) => n + b.text.length, 0);
    if (
      (record.kind === 'tutorial' && totalText > 100000) ||
      (record.kind === 'post' && totalText > 20000)
    )
      m.push('正文长度');
    if (
      record.kind === 'work' &&
      d.core.length > 20000 &&
      !d.core.startsWith('local:')
    )
      m.push('文字成果长度');
    return m;
  };
  const save = () => {
    if (state === 'save-error') {
      setMessage('保存失败，输入仍保留，请重试。');
      return false;
    }
    const live = readB().records.find((r) => r.id === record.id)!;
    if (state === 'conflict' || live.revision !== base) {
      setMessage('内容已被更新。请复制当前输入后刷新最新版本。');
      return false;
    }
    if (record.draft.review === '待审' || state === 'reviewing') {
      setMessage('请先撤回审核再编辑。');
      return false;
    }
    if (JSON.stringify(draft) === JSON.stringify(live.draft)) {
      savedSnapshot.current = JSON.stringify(draft);
      dirtyRef.current = false;
      setMessage('当前没有新的修改。');
      return true;
    }
    act(
      '保存草稿',
      (r) => ({
        ...r,
        draft: {
          ...draft,
          review: '草稿',
          verified:
            draft.change === '执行更新' ||
            (['app', 'resource'].includes(record.kind) &&
              [
                'entry',
                'version',
                'device',
                'permission',
                'inputs',
                'outputs',
              ].some(
                (k) =>
                  draft[k as keyof Draft] !== record.public?.[k as keyof Draft],
              ))
              ? false
              : draft.verified,
        },
        revision: r.revision + 1,
      }),
      '草稿未影响已公开版本',
    );
    setBase(base + 1);
    savedSnapshot.current = JSON.stringify(draft);
    dirtyRef.current = false;
    return true;
  };
  const notAllowed =
    state === 'no-permission' ||
    state === 'unauthorized' ||
    (!record.authorized && page.endsWith('-edit'));
  if (invalidSelection)
    return (
      <section className="bp-card">
        <h2>内容不可用</h2>
        <p>这条内容不存在，或与当前页面类型不匹配。</p>
        <button
          onClick={() => go(page.endsWith('-edit') ? kind + 's' : 'reviews')}
        >
          返回列表
        </button>
      </section>
    );
  if (notAllowed)
    return (
      <section className="bp-card">
        <h2>暂无维护权限</h2>
        <p>内容正文由原作者或获授权的维护人修改。</p>
        <button onClick={() => go(record.kind + 's')}>返回列表</button>
      </section>
    );
  if (state === 'error')
    return (
      <section className="bp-card">
        <h2>加载失败</h2>
        <button onClick={() => go(page)}>重新加载</button>
      </section>
    );
  const notice = (
    <>
      {mediaError && <p className="bp-warning">{mediaError}</p>}
      {message && <output className="bp-notice">{message}</output>}
      {state === 'returned' && (
        <p className="bp-warning">退回：请补充原作者授权与资源使用条件。</p>
      )}
    </>
  );
  if (kinds.some((k) => page === k + 's') || page === 'reviews') {
    const rows =
      state === 'empty'
        ? []
        : db.records.filter(
            (r) =>
              (page === 'reviews'
                ? r.draft.review === '待审'
                : r.kind === kind) &&
              (r.draft.title.includes(query) ||
                r.draft.summary.includes(query) ||
                r.draft.author.includes(query) ||
                r.id.includes(query)) &&
              (filter === '全部' || r.publicStatus === filter),
          );
    return (
      <>
        <div className="bp-toolbar bp-content-list-tools">
          <input
            aria-label="搜索内容"
            placeholder="搜索标题、摘要、作者或内容 ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            aria-label="公开状态"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {['全部', '私有', '公开', '下架', '已删除'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {page !== 'reviews' && (
            <button
              className="primary"
              onClick={() => {
                const id = newRecord(kind);
                go(kind + '-edit?id=' + id);
              }}
            >
              新建{kindLabels[kind]}
            </button>
          )}
        </div>
        <section className="bp-card bp-table bp-content-list">
          <table>
            <thead>
              <tr>
                <th>内容</th>
                <th>作者 / 维护人</th>
                <th>公开状态</th>
                <th>编辑状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="bp-content-title"
                      onClick={() =>
                        go(
                          (page === 'reviews' ? 'review' : r.kind + '-edit') +
                            '?id=' +
                            r.id,
                        )
                      }
                    >
                      {r.draft.title ||
                        (r.kind === 'post'
                          ? r.draft.body
                              .find(
                                (block) =>
                                  block.text.trim() &&
                                  !['图片', '视频'].includes(block.type),
                              )
                              ?.text.slice(0, 34)
                          : '') ||
                        '未命名草稿'}
                    </button>
                    <small>
                      {r.id} · {kindLabels[r.kind]}
                    </small>
                  </td>
                  <td>
                    {r.draft.author}
                    <small>{r.draft.owner}</small>
                  </td>
                  <td>
                    <span
                      className={
                        'bp-content-status bp-content-status-' + r.publicStatus
                      }
                    >
                      {r.publicStatus}
                    </span>
                  </td>
                  <td>
                    {r.draft.review}
                    {r.revision > r.publishedRevision ? ' · 有修改' : ''}
                  </td>
                  <td className="bp-content-row-actions">
                    {page === 'reviews' && (
                      <button
                        className="primary"
                        onClick={() => go('review?id=' + r.id)}
                      >
                        处理
                      </button>
                    )}
                    <button onClick={() => go('preview?id=' + r.id)}>
                      预览
                    </button>
                    {page !== 'reviews' && (
                      <button onClick={() => go('references?id=' + r.id)}>
                        引用
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="bp-empty">
              <p>当前条件下没有内容</p>
              {(query || filter !== '全部') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setFilter('全部');
                  }}
                >
                  清除筛选
                </button>
              )}
            </div>
          )}
        </section>
      </>
    );
  }
  if (page.endsWith('-edit'))
    return (
      <>
        {notice}
        <div className="bp-columns">
          <section className="bp-card">
            <h2>{kindLabels[record.kind]}信息</h2>
            {(state === 'reviewing' || record.draft.review === '待审') && (
              <p className="bp-warning">
                审核中{' '}
                <button
                  onClick={() => {
                    act('撤回审核', (r) => ({
                      ...r,
                      draft: { ...r.draft, review: '草稿' },
                    }));
                    go(page + '?id=' + record.id);
                  }}
                >
                  撤回
                </button>
              </p>
            )}
            <label>
              标题{record.kind === 'post' ? '（选填）' : ''}
              <input
                maxLength={60}
                value={draft.title}
                onChange={(e) => patch('title', e.target.value)}
              />
            </label>
            {record.kind !== 'post' && (
              <label>
                {record.kind === 'tutorial'
                  ? '简介与教学目标'
                  : record.kind === 'resource'
                    ? '用途与预览说明'
                    : '简介'}
                <textarea
                  value={draft.summary}
                  onChange={(e) => patch('summary', e.target.value)}
                />
              </label>
            )}
            {['tutorial', 'app', 'resource'].includes(record.kind) && (
              <div className="bp-content-cover">
                <label>
                  封面（演示素材）
                  <select
                    value={draft.cover}
                    onChange={(e) => patch('cover', e.target.value)}
                  >
                    <option value="">选择封面</option>
                    <option value="restore">旧照修复</option>
                    <option value="perfume">产品视觉</option>
                    <option value="sea">海边画面</option>
                    <option value="writing">文字创作</option>
                  </select>
                </label>
                {draft.cover && (
                  <MediaPreview
                    value={'/home-prototype/' + draft.cover + '.png'}
                    alt={draft.title || '封面预览'}
                  />
                )}
              </div>
            )}
            {record.kind === 'work' ? (
              <>
                <label>
                  文字作品成果
                  <textarea
                    disabled={!!record.public}
                    maxLength={20000}
                    value={
                      draft.core.startsWith('local:') ||
                      draft.core.startsWith('/')
                        ? ''
                        : draft.core
                    }
                    onChange={(e) => patch('core', e.target.value)}
                    placeholder="填写文字成果，或在下方选择图片/视频"
                  />
                </label>
                <MediaPicker
                  value={
                    draft.core.startsWith('local:') ||
                    draft.core.startsWith('/')
                      ? draft.core
                      : ''
                  }
                  mode="work"
                  disabled={!!record.public}
                  onChange={(x) => patch('core', x)}
                  onError={setMediaError}
                />
                {record.public && (
                  <p className="bp-muted">已公开作品的主体保持原样。</p>
                )}
              </>
            ) : (
              <>
                <h3>
                  {record.kind === 'app'
                    ? '使用说明'
                    : record.kind === 'resource'
                      ? '资源说明'
                      : '正文'}
                </h3>
                {draft.body.map((b, i) => (
                  <div className="bp-block" key={b.id}>
                    <div className="bp-toolbar">
                      <select
                        aria-label={'段落' + (i + 1) + '类型'}
                        value={b.type}
                        onChange={(e) =>
                          patch(
                            'body',
                            draft.body.map((x) =>
                              x.id === b.id
                                ? {
                                    ...x,
                                    type: e.target.value as Block['type'],
                                  }
                                : x,
                            ),
                          )
                        }
                      >
                        {[
                          '段落',
                          '标题',
                          '图片',
                          '视频',
                          '表格',
                          '可复制示例',
                          '链接',
                          '资源引用',
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        disabled={i === 0}
                        onClick={() => {
                          const a = [...draft.body];
                          [a[i - 1], a[i]] = [a[i], a[i - 1]];
                          patch('body', a);
                        }}
                      >
                        上移
                      </button>
                      <button
                        onClick={() =>
                          patch(
                            'body',
                            draft.body.filter((x) => x.id !== b.id),
                          )
                        }
                      >
                        移除
                      </button>
                    </div>
                    {b.type === '图片' || b.type === '视频' ? (
                      <MediaPicker
                        value={b.text}
                        mode={b.type === '图片' ? 'image' : 'video'}
                        onChange={(x) =>
                          patch(
                            'body',
                            draft.body.map((y) =>
                              y.id === b.id ? { ...y, text: x } : y,
                            ),
                          )
                        }
                        onError={setMediaError}
                      />
                    ) : (
                      <textarea
                        aria-label={'段落' + (i + 1) + '内容'}
                        maxLength={record.kind === 'tutorial' ? 100000 : 20000}
                        value={b.text}
                        onChange={(e) =>
                          patch(
                            'body',
                            draft.body.map((x) =>
                              x.id === b.id
                                ? { ...x, text: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    )}{' '}
                  </div>
                ))}
                <button
                  onClick={() =>
                    patch('body', [
                      ...draft.body,
                      { id: Date.now().toString(), type: '段落', text: '' },
                    ])
                  }
                >
                  添加内容块
                </button>
              </>
            )}
            {['app', 'resource'].includes(record.kind) && (
              <>
                <h3>{record.kind === 'app' ? 'MakeNow 入口与说明' : '交付与权限'}</h3>
                <label>
                  {record.kind === 'app' ? 'MakeNow 承接链接' : '工程或文件入口'}
                  <input
                    value={draft.entry}
                    onChange={(e) => patch('entry', e.target.value)}
                  />
                </label>
                {record.kind === 'app' && <p className="bp-muted">当前使用站内演示承接页；MakeNow 真实定向链接尚待配置。示例：{makeNowAppHandoff}</p>}
                <label>
                  {record.kind === 'app' ? '介绍版本' : '版本'}
                  <input
                    value={draft.version}
                    onChange={(e) => patch('version', e.target.value)}
                  />
                </label>
                <label>
                  适用设备
                  <select
                    value={draft.device}
                    onChange={(e) => patch('device', e.target.value)}
                  >
                    <option>电脑端</option>
                    <option>手机与电脑</option>
                  </select>
                </label>
                {record.kind !== 'app' && <label>
                  更新性质
                  <select
                    value={draft.change}
                    onChange={(e) =>
                      patch('change', e.target.value as Draft['change'])
                    }
                  >
                    <option>说明更新</option>
                    <option>执行更新</option>
                  </select>
                </label>}
                <label>
                  {record.kind === 'app' ? '准备材料' : '依赖与准备'}
                  <input
                    value={draft.inputs}
                    onChange={(e) => patch('inputs', e.target.value)}
                  />
                </label>
                {record.kind === 'app' && (
                  <label>
                    输出说明
                    <input
                      value={draft.outputs}
                      onChange={(e) => patch('outputs', e.target.value)}
                    />
                  </label>
                )}
                {record.kind === 'resource' && (
                  <label>
                    复用权限
                    <select
                      value={draft.permission}
                      onChange={(e) => patch('permission', e.target.value)}
                    >
                      {['仅展示成果', '允许查看', '允许查看与复制'].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
            {record.kind !== 'post' && (
              <label>
                {record.kind === 'app'
                  ? 'MakeNow 账号与使用条件'
                  : record.kind === 'resource'
                    ? '取用条件'
                    : '使用条件'}
                <textarea
                  value={draft.conditions}
                  onChange={(e) => patch('conditions', e.target.value)}
                />
              </label>
            )}
            <h3>关联资源</h3>
            {db.records
              .filter((r) => r.kind === 'resource' && r.id !== record.id)
              .map((r) => (
                <label className="bp-check" key={r.id}>
                  <input
                    type="checkbox"
                    disabled={r.publicStatus !== '公开'}
                    checked={draft.refs.includes(r.id)}
                    onChange={(e) =>
                      patch(
                        'refs',
                        e.target.checked
                          ? [...draft.refs, r.id]
                          : draft.refs.filter((id) => id !== r.id),
                      )
                    }
                  />
                  {r.draft.title} · {r.publicStatus}
                </label>
              ))}
            <h3>正文附件</h3>
            <AttachmentPicker
              value={draft.attachments}
              onChange={(x) => patch('attachments', x)}
              onError={setMediaError}
            />
          </section>
          <aside className="bp-card bp-content-maintenance">
            <h2>来源与维护</h2>
            <label>
              作者
              <input
                value={draft.author}
                disabled={!!record.public}
                onChange={(e) => patch('author', e.target.value)}
              />
            </label>
            <label>
              内容来源
              <select
                value={draft.source}
                onChange={(e) => patch('source', e.target.value)}
              >
                <option value="">请选择来源</option>
                {['官方原创', '用户原创', '授权改编', '联合创作'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              授权说明
              <textarea
                value={draft.license}
                onChange={(e) => patch('license', e.target.value)}
              />
            </label>
            <p>维护人：{draft.owner}</p>
            <button onClick={() => detail('transfer')}>交接维护</button>
            <hr />
            <p>
              当前公开版本：{record.public ? record.public.version : '未公开'}
            </p>
            <p>
              编辑状态：
              {state === 'returned'
                ? '退回'
                : state === 'reviewing'
                  ? '待审'
                  : record.draft.review}
            </p>
            <button onClick={() => detail('history')}>查看记录</button>
          </aside>
        </div>
        <footer className="bp-actions">
          <button onClick={() => go(record.kind + 's')}>返回列表</button>
          <button onClick={save}>保存草稿</button>
          <button
            onClick={() => {
              if (save()) detail('preview');
            }}
          >
            预览草稿
          </button>
          <button
            className="primary"
            onClick={() => {
              const missing = fieldsMissing(draft);
              if (missing.length) {
                setMessage('请补充：' + missing.join('、'));
                return;
              }
              if (
                ['通过', '退回'].includes(record.draft.review) &&
                JSON.stringify(draft) === JSON.stringify(record.draft)
              ) {
                setMessage('请先修改当前内容再提交审核。');
                return;
              }
              if (save()) {
                changeRecord(record.id, '提交审核', '等待审核', (r) => ({
                  ...r,
                  draft: { ...r.draft, review: '待审' },
                }));
                detail('review');
              }
            }}
          >
            提交审核
          </button>
        </footer>
        {pendingNavigation && (
          <dialog
            ref={leaveDialogRef}
            className="bp-content-leave-dialog"
            aria-labelledby="bp-content-leave-title"
            aria-describedby="bp-content-leave-description"
            onCancel={(event) => {
              event.preventDefault();
              setPendingNavigation(null);
            }}
          >
            <h2 id="bp-content-leave-title">有未保存的修改</h2>
            <p id="bp-content-leave-description">离开后，当前输入不会保留。</p>
            <div className="bp-content-leave-actions">
              <button
                className="primary"
                onClick={() => setPendingNavigation(null)}
              >
                继续编辑
              </button>
              <button
                className="bp-content-leave-discard"
                onClick={() => {
                  const proceed = pendingNavigation;
                  setPendingNavigation(null);
                  proceed();
                }}
              >
                放弃修改并离开
              </button>
            </div>
          </dialog>
        )}
      </>
    );
  if (page === 'preview') {
    const d = q.get('version') === 'public' ? record.public : record.draft;
    return (
      <>
        {notice}
        {state === 'private' && (
          <p className="bp-warning">
            当前为后台私有版本预览，公开链接不可访问。
          </p>
        )}
        <div className="bp-toolbar bp-content-preview-tabs">
          <button
            onClick={() => go('preview?id=' + record.id + '&version=public')}
          >
            公开版本
          </button>
          <button onClick={() => go('preview?id=' + record.id)}>
            编辑版本
          </button>
          <button onClick={() => go(record.kind + '-edit?id=' + record.id)}>
            继续编辑
          </button>
        </div>
        <article className="bp-card bp-article bp-content-preview">
          {!d || state === 'unavailable' ? (
            <h2>内容不可用</h2>
          ) : (
            <>
              <p className="bp-content-preview-meta">
                {q.get('version') === 'public'
                  ? '当前公开版本'
                  : '待发布编辑版本'}{' '}
                · {kindLabels[record.kind]} · {d.author || '未填写作者'}
              </p>
              <h1>
                {d.title ||
                  (record.kind === 'post'
                    ? d.body
                        .find((block) => block.text.trim())
                        ?.text.slice(0, 34)
                    : '') ||
                  '未命名'}
              </h1>
              {d.summary && (
                <p className="bp-content-preview-summary">{d.summary}</p>
              )}
              {d.cover && record.kind !== 'work' && record.kind !== 'post' && (
                <MediaPreview
                  value={'/home-prototype/' + d.cover + '.png'}
                  alt={d.title || '封面预览'}
                />
              )}
              <div className="bp-content-preview-body">
                {d.body.map((b) => (
                  <ContentBlockPreview key={b.id} block={b} />
                ))}
                {record.kind === 'work' && <MediaPreview value={d.core} />}
              </div>
              {record.kind === 'app' && <section className="bp-content-preview-refs">
                <h3>MakeNow 使用信息</h3>
                <p>准备材料：{d.inputs || '待补充'}</p>
                <p>输出说明：{d.outputs || '待补充'}</p>
                <p>适用设备：{d.device || '待确认'}</p>
                <p>使用条件：{d.conditions || '待补充'}</p>
                <p>目标入口：{d.entry || '待配置'}</p>
                <p>当前站内承接页为演示入口；MakeNow 真实定向链接尚待配置。</p>
              </section>}
              {d.refs.length > 0 && (
                <section className="bp-content-preview-refs">
                  <h3>关联资源</h3>
                  {d.refs.map((id) => {
                    const r = db.records.find((x) => x.id === id);
                    return (
                      <p key={id}>
                        {r?.publicStatus === '公开'
                          ? r.public?.title
                          : '资源不可用'}
                      </p>
                    );
                  })}
                </section>
              )}
            </>
          )}
        </article>
        <button className="primary" onClick={() => detail('release')}>
          发布管理
        </button>
      </>
    );
  }
  if (page === 'review')
    return (
      <section className="bp-card bp-content-step">
        {notice}
        <h2>{displayTitle}</h2>
        <p>
          版本修订 {record.revision} · {record.draft.review}
        </p>
        <button onClick={() => detail('preview')}>查看待审内容</button>
        <label>
          审核意见
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {state === 'stale' && (
          <p className="bp-warning">内容版本已变化，请重新打开任务。</p>
        )}
        {state === 'unknown' && (
          <p className="bp-warning">结果尚未确认，请查询原任务。</p>
        )}
        <div className="bp-toolbar">
          <button
            disabled={
              state === 'stale' ||
              state === 'unknown' ||
              record.draft.review !== '待审' ||
              record.publicStatus === '已删除'
            }
            onClick={() => {
              if (!reason.trim()) {
                setMessage('请填写退回原因');
                return;
              }
              act('审核退回', (r) => ({
                ...r,
                draft: { ...r.draft, review: '退回', note: reason },
              }));
            }}
          >
            退回
          </button>
          <button
            className="primary"
            disabled={
              state === 'stale' ||
              state === 'unknown' ||
              record.draft.review !== '待审' ||
              record.publicStatus === '已删除'
            }
            onClick={() =>
              act('审核通过', (r) => ({
                ...r,
                draft: { ...r.draft, review: '通过' },
                ...(['work', 'post'].includes(r.kind) &&
                r.publicStatus !== '下架'
                  ? {
                      public: { ...r.draft, review: '通过' },
                      publicStatus: '公开',
                      publishedRevision: r.revision,
                    }
                  : {}),
              }))
            }
          >
            通过
          </button>
          <button onClick={() => detail('release')}>发布管理</button>
          {state === 'unknown' && (
            <button onClick={() => detail('history')}>查询处理记录</button>
          )}
        </div>
      </section>
    );
  if (page === 'verify' && !['app', 'resource'].includes(record.kind))
    return (
      <section className="bp-card bp-content-step">
        <h2>选择需要核验的应用或资源</h2>
        <button onClick={() => go('apps')}>查看 AI 应用</button>
      </section>
    );
  if (page === 'verify')
    return (
      <section className="bp-card bp-content-step">
        {notice}
        {state === 'failed' && (
          <p className="bp-warning">
            最近一次能力核验未通过，请检查入口和依赖。
          </p>
        )}
        {state === 'changed' && (
          <p className="bp-warning">入口或说明已变更，原核验结论不能复用。</p>
        )}
        {state === 'paused' && (
          <p className="bp-warning">当前能力已暂停，恢复使用需重新核验。</p>
        )}
        <h2>
          {displayTitle} · {record.draft.version}
        </h2>
        <p>{record.kind === 'app' ? '当前仅核验站内演示承接及展示资料。MakeNow 真实定向链接配置后需另行核验。' : '核验记录绑定当前执行版本。'}</p>
        {[
          record.kind === 'app' ? '站内演示承接页可达' : '入口可达',
          record.kind === 'app' ? '准备材料与输出说明一致' : '项目或文件与说明相符',
          '授权与依赖完整',
          record.kind === 'app' ? '设备与使用条件一致' : '设备与取用权限一致',
        ].map((x) => (
          <label className="bp-check" key={x}>
            <input
              type="checkbox"
              checked={checks.includes(x)}
              onChange={(e) =>
                setChecks(
                  e.target.checked
                    ? [...checks, x]
                    : checks.filter((v) => v !== x),
                )
              }
            />
            {x}
          </label>
        ))}
        <label>
          核验说明
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <div className="bp-toolbar">
          <button
            disabled={checks.length !== 4 || state === 'changed'}
            className="primary"
            onClick={() =>
              act(
                '核验通过',
                (r) => ({
                  ...r,
                  draft: { ...r.draft, verified: true },
                }),
                '执行版本 ' +
                  record.draft.version +
                  (reason.trim()
                    ? ' · ' + reason.trim()
                    : ' · 使用方式与条件已核对'),
              )
            }
          >
            记录通过
          </button>
          <button
            onClick={() => {
              if (!reason) {
                setMessage('请填写失败原因');
                return;
              }
              act('核验未通过', (r) => ({
                ...r,
                draft: { ...r.draft, verified: false },
              }));
            }}
          >
            记录失败
          </button>
          <button
            disabled={record.publicStatus !== '公开'}
            onClick={() => {
              if (!reason) {
                setMessage('请填写暂停原因');
                return;
              }
              act('暂停当前能力', (r) => ({ ...r, runtime: '暂停' }));
            }}
          >
            暂停已公开能力
          </button>
          <button onClick={() => detail('release')}>发布管理</button>
        </div>
      </section>
    );
  if (page === 'release') {
    const missing = fieldsMissing(record.draft),
      bad = record.draft.refs.some(
        (id) => db.records.find((r) => r.id === id)?.publicStatus !== '公开',
      ),
      publicBad =
        record.public?.refs.some(
          (id) => db.records.find((r) => r.id === id)?.publicStatus !== '公开',
        ) || false,
      cap = ['app', 'resource'].includes(record.kind),
      blocked =
        ['已删除', '下架'].includes(record.publicStatus) ||
        (record.publicStatus === '公开' &&
          record.revision <= record.publishedRevision) ||
        missing.length > 0 ||
        bad ||
        record.draft.review !== '通过' ||
        (cap && !record.draft.verified) ||
        ['incomplete', 'reference-invalid', 'unverified'].includes(state);
    return (
      <section className="bp-card bp-content-step">
        {notice}
        {state === 'incomplete' && (
          <p className="bp-warning">编辑版本资料不完整，暂不能发布。</p>
        )}
        <h2>{displayTitle}</h2>
        <dl>
          <dt>公开状态</dt>
          <dd>{record.publicStatus}</dd>
          <dt>审核</dt>
          <dd>{record.draft.review}</dd>
          <dt>修订</dt>
          <dd>
            编辑 {record.revision} · 公开 {record.publishedRevision || '无'}
          </dd>
          <dt>引用</dt>
          <dd>
            {bad || state === 'reference-invalid' ? '存在不可用引用' : '可用'}
          </dd>
          {cap && (
            <>
              <dt>能力核验</dt>
              <dd>
                {record.draft.verified && state !== 'unverified'
                  ? '通过'
                  : '待核验'}
              </dd>
            </>
          )}
        </dl>
        {missing.length > 0 && (
          <p className="bp-warning">缺少：{missing.join('、')}</p>
        )}
        <div className="bp-toolbar bp-content-release-primary">
          <button
            className="primary"
            disabled={blocked}
            onClick={() => setConfirm('发布')}
          >
            发布编辑版本
          </button>
          {cap && <button onClick={() => detail('verify')}>核验能力</button>}
          <button onClick={() => detail('references')}>查看影响</button>
        </div>
        <div className="bp-toolbar bp-content-release-secondary">
          <button
            disabled={record.publicStatus !== '公开'}
            onClick={() => setConfirm('下架')}
          >
            下架
          </button>
          <button
            disabled={record.publicStatus === '已删除'}
            onClick={() => setConfirm('删除')}
          >
            删除内容
          </button>
          {record.publicStatus === '下架' && (
            <button
              disabled={
                !record.public ||
                publicBad ||
                (cap && record.runtime === '暂停')
              }
              onClick={() => setConfirm('恢复')}
            >
              恢复公开
            </button>
          )}
        </div>
        {confirm && (
          <div className="bp-confirm">
            <h3>确认{confirm}？</h3>
            <p>
              {confirm === '发布'
                ? record.public
                  ? '编辑版本将替换公开内容。'
                  : '编辑版本将成为公开内容。'
                : '关联入口会随可见性变化；已存在的活动记录与个人副本保留。恢复不会自动恢复推荐或奖励。'}
            </p>
            <label>
              处理说明
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button onClick={() => setConfirm('')}>取消</button>
            <button
              className="primary"
              onClick={() => {
                if (!reason.trim()) {
                  setMessage('请填写处理说明');
                  return;
                }
                const current = readB().records.find((r) => r.id === record.id);
                if (
                  !current ||
                  current.revision !== record.revision ||
                  current.publicStatus === '已删除' ||
                  (confirm === '发布' &&
                    (current.publicStatus === '下架' ||
                      (current.publicStatus === '公开' &&
                        current.revision <= current.publishedRevision) ||
                      current.draft.review !== '通过' ||
                      fieldsMissing(current.draft).length > 0 ||
                      current.draft.refs.some(
                        (id) =>
                          readB().records.find((x) => x.id === id)
                            ?.publicStatus !== '公开',
                      ) ||
                      (cap && !current.draft.verified))) ||
                  (confirm === '恢复' &&
                    (!current.public ||
                      (cap && current.runtime === '暂停') ||
                      current.public.refs.some(
                        (id) =>
                          readB().records.find((x) => x.id === id)
                            ?.publicStatus !== '公开',
                      )))
                ) {
                  setMessage('内容状态已变化，请重新核对后操作。');
                  setConfirm('');
                  return;
                }
                act(confirm, (r) =>
                  confirm === '发布'
                    ? {
                        ...r,
                        public: structuredClone(r.draft),
                        publicStatus: '公开',
                        publishedRevision: r.revision,
                        runtime: cap ? '可用' : r.runtime,
                      }
                    : confirm === '恢复'
                      ? { ...r, publicStatus: '公开', recommended: false }
                      : {
                          ...r,
                          publicStatus: confirm === '删除' ? '已删除' : '下架',
                          recommended: false,
                          reason,
                        },
                );
              }}
            >
              确认{confirm}
            </button>
          </div>
        )}
      </section>
    );
  }
  if (page === 'references')
    return (
      <section className="bp-card bp-content-step">
        {state === 'unavailable' && (
          <p className="bp-warning">目标已不可用，公开引用已停止展示。</p>
        )}
        {state === 'private' && (
          <p className="bp-warning">私有目标不可用于公开引用。</p>
        )}
        <h2>{displayTitle}</h2>
        <h3>引用了</h3>
        {record.draft.refs.length ? (
          record.draft.refs.map((id) => {
            const r = db.records.find((x) => x.id === id);
            return (
              <div className="bp-content-reference-row" key={id}>
                <span>
                  {r?.draft.title || '目标不存在'} ·{' '}
                  {r?.publicStatus || '不可访问'}
                </span>
                <button onClick={() => go('preview?id=' + id)}>查看</button>
              </div>
            );
          })
        ) : (
          <p>无关联资源</p>
        )}
        <h3>被引用</h3>
        {db.records
          .filter(
            (r) =>
              r.draft.refs.includes(record.id) ||
              r.public?.refs.includes(record.id),
          )
          .map((r) => (
            <div className="bp-content-reference-row" key={r.id}>
              <span>
                {r.draft.title} · {r.publicStatus}
              </span>
              <button onClick={() => go('preview?id=' + r.id)}>查看</button>
            </div>
          ))}
        {!db.records.some(
          (r) =>
            r.draft.refs.includes(record.id) ||
            r.public?.refs.includes(record.id),
        ) && <p>暂无内容引用</p>}
        <p>目标不可用时停止相应公开引用，其他内容仍可阅读。</p>
        {record.publicStatus === '公开' && (
          <Link
            href={
              '/community-options/c-prototype?page=' +
              record.kind +
              '&id=' +
              record.id
            }
          >
            查看公开内容
          </Link>
        )}
      </section>
    );
  if (page === 'transfer')
    return (
      <section className="bp-card bp-content-step">
        {notice}
        {state === 'pending' && (
          <p className="bp-warning">
            交接待接收。确认新维护人的身份与内容授权后继续。
          </p>
        )}
        <h2>交接 {displayTitle}</h2>
        <p>
          原作者：{record.draft.author} · 当前维护人：{record.draft.owner}
        </p>
        <label>
          新维护人
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option>运营编辑</option>
            <option>内容编辑</option>
          </select>
        </label>
        <label>
          交接说明
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <label className="bp-check">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          已确认新维护人具备内容维护授权，并接收未发布草稿
        </label>
        <p>作者署名、工程所有权与运行权限保持原归属。</p>
        <button
          className="primary"
          disabled={!checked || !reason.trim() || owner === record.draft.owner}
          onClick={() =>
            act('维护交接', (r) => ({ ...r, draft: { ...r.draft, owner } }))
          }
        >
          确认交接
        </button>
      </section>
    );
  return (
    <section className="bp-card bp-content-step">
      <h2>{displayTitle} · 操作记录</h2>
      {state === 'empty' ? (
        <p>暂无记录</p>
      ) : (
        record.history
          .slice()
          .reverse()
          .map((h, i) => (
            <div className="bp-log" key={i}>
              <strong>{h.action}</strong>
              <time>{h.at}</time>
              <p>{h.detail}</p>
            </div>
          ))
      )}
    </section>
  );
}
