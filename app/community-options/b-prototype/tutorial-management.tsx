'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  App,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Result,
  Select,
  Space,
  Spin,
  Table,
  Segmented,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  changeContentModel,
  contentTime,
  createContent,
  useContentModel,
  type AdminContent,
} from './content-model';
import { MarkdownEditor, markdownBody } from './markdown-editor';
import { ContentBlockPreview } from './content-media';
import { MediaUpload } from './media-upload';
import { useTaxonomyOptions } from './taxonomy-adapter';
import './tutorial-management.css';

type Tutorial = AdminContent & {
  tutorialInfo?: { format: string; duration: string; sort: number };
  viewCount?: number;
};
type Fields = {
  title: string;
  category: string;
  format: string;
  duration: string;
  sort: number;
  summary: string;
  cover: string;
  body: string;
};
function fields(item: Tutorial): Fields {
  return {
    title: item.draft.title,
    category: item.draft.category,
    format: item.tutorialInfo?.format || 'article',
    duration: item.tutorialInfo?.duration || '',
    sort: item.tutorialInfo?.sort ?? 100,
    summary: item.draft.summary,
    cover: item.draft.cover,
    body: markdownBody(item.draft.blocks) || item.draft.body,
  };
}
function validate(value: Fields) {
  if (!value.title.trim()) return '请输入教程标题';
  if (value.title.length > 100) return '教程标题不能超过100字';
  if (!value.category) return '请选择教程板块';
  if (!['article', 'video'].includes(value.format)) return '请选择内容形式';
  if (!value.body.trim()) return '请输入教程正文';
  if (value.duration.length > 64) return '时长 / 难度不能超过64字';
  if (value.summary.length > 512) return '教程摘要不能超过512字';
  if (!Number.isInteger(value.sort) || value.sort < 0)
    return '排序必须为非负整数';
  return '';
}
export function TutorialManagement({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (target: string) => void;
}) {
  const db = useContentModel(),
    { message, modal } = App.useApp(),
    query = new URLSearchParams(
      typeof location === 'undefined' ? '' : location.search,
    ),
    id = query.get('id'),
    existing = db.records.find((r) => r.kind === 'tutorial' && r.id === id) as
      | Tutorial
      | undefined;
  const [newItem] = useState<Tutorial>(() => {
    const item = createContent('tutorial');
    item.draft.category = '';
    return item;
  });
  const item =
      existing ||
      (page === 'tutorial-detail'
        ? (db.records.find((r) => r.kind === 'tutorial') as
            | Tutorial
            | undefined)
        : undefined) ||
      newItem,
    options = useTaxonomyOptions('tutorial', item.draft.category);
  const [value, setValue] = useState<Fields>(() => fields(item)),
    [base, setBase] = useState(item.revision),
    [tab, setTab] = useState(query.get('tab') || 'published'),
    [keyword, setKeyword] = useState(query.get('keyword') || ''),
    [section, setSection] = useState(query.get('section') || ''),
    [current, setCurrent] = useState(Number(query.get('p')) || 1),
    [size, setSize] = useState(Number(query.get('size')) || 20),
    [busy, setBusy] = useState(false);
  const baseline = useRef(JSON.stringify(value)),
    dirty = useRef(false),
    allowLeave = useRef(false),
    locked = useRef(false),
    failedOnce = useRef(false);
  useEffect(() => {
    dirty.current =
      page === 'tutorial-edit' && JSON.stringify(value) !== baseline.current;
  }, [page, value]);
  const context = () => {
    const params = new URLSearchParams({
      tab,
      keyword,
      section,
      p: String(current),
      size: String(size),
    });
    return params.toString();
  };
  const back = () => go('tutorials?' + context());
  useEffect(() => {
    if (page !== 'tutorial-edit') return;
    const navigate = (event: Event) => {
      if (!dirty.current || allowLeave.current) return;
      event.preventDefault();
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          dirty.current = false;
          (event as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty.current) event.preventDefault();
    };
    window.addEventListener('prototype-before-navigate', navigate);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('prototype-before-navigate', navigate);
      window.removeEventListener('beforeunload', unload);
    };
  }, [page, modal]);
  const patch = <K extends keyof Fields>(key: K, next: Fields[K]) =>
    setValue((v) => ({ ...v, [key]: next }));
  const write = (
    target: Tutorial,
    action: string,
    next: (record: Tutorial) => Tutorial | null,
  ) => {
    if (state === 'save-error' && !failedOnce.current) { failedOnce.current = true; throw new Error('保存失败，请重试。'); }
    changeContentModel((model) => {
      const live = model.records.find((r) => r.id === target.id) as
        | Tutorial
        | undefined;
      if ((live?.revision ?? 0) !== target.revision)
        throw new Error('教程已更新，请刷新后重试。');
      const after = next(live || target);
      if (!after) {
        model.records = model.records.filter((r) => r.id !== target.id);
        return;
      }
      after.revision = target.revision + 1;
      after.updatedAt = contentTime();
      after.logs = [
        { at: contentTime(), action, reason: '', operator: '内容编辑' },
        ...after.logs,
      ];
      model.records = live
        ? model.records.map((r) => (r.id === target.id ? after : r))
        : [after, ...model.records];
    });
  };
  const statusAction = (target: Tutorial, action: '上架' | '下架' | '删除') =>
    modal.confirm({
      title: `确认${action}该教程？`,
      content: target.draft.title || '未命名教程',
      okText: action,
      cancelText: '取消',
      okButtonProps: { danger: action !== '上架' },
      onOk: () => {
        try {
          write(target, action, (r) =>
            action === '删除'
              ? null
              : {
                  ...r,
                  published:
                    action === '上架' ? structuredClone(r.draft) : null,
                  visibility: action === '上架' ? '已公开' : '未公开',
                  review: action === '上架' ? '已通过' : '草稿',
                  submissionId: null,
                  submittedAt: null,
                  firstPublishedAt:
                    action === '上架'
                      ? r.firstPublishedAt || contentTime()
                      : r.firstPublishedAt,
                },
          );
          message.success(`教程已${action}`);
          if (page !== 'tutorials') {
            allowLeave.current = true;
            back();
          }
        } catch (error) {
          message.error((error as Error).message);
          return Promise.reject(error);
        }
      },
    });
  const save = async (publish = false) => {
    if (locked.current) return;
    const error = validate(value);
    if (error) {
      message.warning(error);
      return;
    }
    if (publish && !existing) {
      message.warning('请先保存草稿');
      return;
    }
    locked.current = true;
    setBusy(true);
    try {
      const target = { ...item, revision: base };
      write(
        target,
        publish
          ? '发布教程'
          : item.visibility === '已公开'
            ? '保存修改'
            : '保存草稿',
        (r) => {
          const draft = {
            ...r.draft,
            title: value.title.trim(),
            category: value.category,
            summary: value.summary.trim(),
            cover: value.cover,
            body: value.body.trim(),
            blocks: [
              {
                id: 'markdown-body',
                type: 'Markdown' as const,
                text: value.body.trim(),
              },
            ],
          };
          const published = publish || r.visibility === '已公开';
          return {
            ...r,
            draft,
            published: published ? structuredClone(draft) : null,
            visibility: published ? '已公开' : '未公开',
            review: published ? '已通过' : '草稿',
            submissionId: null,
            submittedAt: null,
            tutorialInfo: {
              format: value.format,
              duration: value.duration.trim(),
              sort: value.sort,
            },
            firstPublishedAt: published
              ? r.firstPublishedAt || contentTime()
              : r.firstPublishedAt,
          };
        },
      );
      baseline.current = JSON.stringify(value);
      dirty.current = false;
      setBase(base + 1);
      message.success(
        publish
          ? '教程已发布'
          : item.visibility === '已公开'
            ? '教程修改已保存'
            : '草稿已保存',
      );
      if (!existing) {
        allowLeave.current = true;
        go('tutorial-edit?id=' + item.id + '&' + context());
      } else if (publish) {
        allowLeave.current = true;
        back();
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  if (state === 'no-permission' || state === 'unauthorized')
    return <Result status="403" title="暂无教程管理权限" />;
  if (state === 'error')
    return (
      <Result
        status="error"
        title="教程加载失败"
        extra={
          <Button
            onClick={() =>
              go(page + '?' + (id ? 'id=' + id + '&' : '') + context())
            }
          >
            重新加载
          </Button>
        }
      />
    );
  if (state === 'loading')
    return (
      <div className="tm-loading">
        <Spin />
      </div>
    );
  if (page !== 'tutorials' && id && !existing)
    return (
      <Result
        status="404"
        title="教程不存在"
        extra={<Button onClick={back}>返回列表</Button>}
      />
    );
  const rowActions = (record: Tutorial, list = false) => (
    <Space size={0}>
      {list && record.visibility === '已公开' && (
        <Button
          type="link"
          onClick={() =>
            go('tutorial-detail?id=' + record.id + '&' + context())
          }
        >
          查看
        </Button>
      )}
      <Button
        type="link"
        onClick={() => go('tutorial-edit?id=' + record.id + '&' + context())}
      >
        编辑
      </Button>
      <Button
        type="link"
        danger={record.visibility === '已公开'}
        onClick={() =>
          statusAction(record, record.visibility === '已公开' ? '下架' : '上架')
        }
      >
        {record.visibility === '已公开' ? '下架' : '上架'}
      </Button>
      <Button type="link" danger onClick={() => statusAction(record, '删除')}>
        删除
      </Button>
    </Space>
  );
  if (page === 'tutorials') {
    const rows =
        state === 'empty'
          ? []
          : (db.records.filter(
              (r) =>
                r.kind === 'tutorial' &&
                (tab === 'published'
                  ? r.visibility === '已公开'
                  : r.visibility !== '已公开') &&
                r.draft.title.includes(keyword.trim()) &&
                (tab === 'draft' || !section || r.draft.category === section),
            ) as Tutorial[]),
      safeCurrent = Math.min(
        current,
        Math.max(1, Math.ceil(rows.length / size)),
      );
    const columns: ColumnsType<Tutorial> = [
      {
        title: '封面',
        width: 80,
        render: (_, r) =>
          r.draft.cover ? (
            <Image
              className="tm-cover"
              src={r.draft.cover}
              alt="教程封面"
              width={56}
              height={56}
              unoptimized
            />
          ) : (
            '-'
          ),
      },
      {
        title: '标题',
        dataIndex: ['draft', 'title'],
        width: 270,
        ellipsis: true,
      },
      ...(tab === 'published'
        ? [
            {
              title: '板块',
              dataIndex: ['draft', 'category'],
              width: 140,
              render: (v: string) => v || '暂无归属板块',
            },
          ]
        : []),
      { title: '浏览量', width: 100, render: (_, r) => r.viewCount ?? 0 },
      {
        title: '评论数',
        width: 100,
        render: (_, r) =>
          db.comments.filter(
            (c) =>
              c.contentId === r.id &&
              !['本人删除', '后台屏蔽'].includes(c.state),
          ).length,
      },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      {
        title: '操作',
        width: 230,
        fixed: 'right',
        render: (_, r) => rowActions(r, true),
      },
    ];
    return (
      <div className="tm-management">
        <Card>
          <div className="tm-tools">
            <Space wrap>
              <Input.Search
                aria-label="教程关键词"
                placeholder="搜索教程标题"
                value={keyword}
                allowClear
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrent(1);
                }}
                style={{ width: 260 }}
              />
              {tab === 'published' && (
                <Select
                  aria-label="教程板块"
                  placeholder="全部板块"
                  allowClear
                  value={section || undefined}
                  options={options}
                  onChange={(v) => {
                    setSection(v || '');
                    setCurrent(1);
                  }}
                  style={{ width: 180 }}
                />
              )}
              <Button
                onClick={() => {
                  setKeyword('');
                  setSection('');
                  setCurrent(1);
                }}
              >
                重置
              </Button>
            </Space>
            <Segmented
              className="tm-tabs"
              value={tab}
              options={[
                { value: 'published', label: '已发布' },
                { value: 'draft', label: '草稿箱' },
              ]}
              onChange={(v) => {
                setTab(v);
                setSection('');
                setCurrent(1);
              }}
            />
            <Button
              type="primary"
              onClick={() => go('tutorial-edit?' + context())}
            >
              发布教程
            </Button>
          </div>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            scroll={{ x: 1080 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无教程"
                />
              ),
            }}
            pagination={{
              current: safeCurrent,
              pageSize: size,
              pageSizeOptions: [20, 50, 100],
              showSizeChanger: true,
              showQuickJumper: false,
              total: rows.length,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (p, s) => {
                setCurrent(s !== size ? 1 : p);
                setSize(s);
              },
            }}
          />
        </Card>
      </div>
    );
  }
  if (page === 'tutorial-detail')
    return (
      <div className="tm-management">
        <Card
          title={item.draft.title}
          extra={
            <Space>
              <Button onClick={back}>返回列表</Button>
              {rowActions(item)}
            </Space>
          }
        >
          <div className="tm-detail-meta">
            {value.cover ? (
              <Image
                className="tm-detail-cover"
                src={value.cover}
                alt="教程封面"
                width={270}
                height={180}
                unoptimized
              />
            ) : (
              <div className="tm-detail-placeholder">暂无封面</div>
            )}
            <Descriptions
              bordered
              size="small"
              column={2}
              items={[
                { key: 'id', label: '教程编号', children: item.id },
                {
                  key: 'section',
                  label: '所属板块',
                  children: value.category || '-',
                },
                {
                  key: 'views',
                  label: '浏览量',
                  children: item.viewCount ?? 0,
                },
                {
                  key: 'comments',
                  label: '评论数',
                  children: db.comments.filter(
                    (c) =>
                      c.contentId === item.id &&
                      !['本人删除', '后台屏蔽'].includes(c.state),
                  ).length,
                },
                { key: 'likes', label: '点赞数', children: 0 },
                {
                  key: 'status',
                  label: '发布状态',
                  children: (
                    <Tag
                      color={item.visibility === '已公开' ? 'green' : 'default'}
                    >
                      {item.visibility === '已公开' ? '已发布' : '未发布'}
                    </Tag>
                  ),
                },
                {
                  key: 'source',
                  label: '来源',
                  children: item.official ? '官方' : '个人',
                },
                {
                  key: 'published',
                  label: '发布时间',
                  children: item.firstPublishedAt || '-',
                },
                { key: 'created', label: '创建时间', children: item.createdAt },
                {
                  key: 'updated',
                  label: '更新时间',
                  children: item.updatedAt,
                },
              ]}
            />
          </div>
          <ContentBlockPreview
            block={{ id: item.id, type: 'Markdown', text: value.body }}
          />
        </Card>
      </div>
    );
  return (
    <div className="tm-management">
      <div className="tm-editor-heading">
        <Tag color={item.visibility === '已公开' ? 'green' : 'orange'}>
          {item.visibility === '已公开' ? '已发布' : '草稿'}
        </Tag>
      </div>
      <Card title="基础信息">
        <Form layout="vertical">
          <div className="tm-basic">
            <div>
              <div className="tm-title-row">
                <Form.Item label="教程标题" required>
                  <Input
                    value={value.title}
                    maxLength={100}
                    showCount
                    onChange={(e) => patch('title', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="教程板块" required>
                  <Select
                    value={value.category || undefined}
                    options={options}
                    allowClear
                    placeholder="请选择教程板块"
                    onChange={(v) => patch('category', v || '')}
                  />
                </Form.Item>
              </div>
              <div className="tm-setting-row">
                <Form.Item label="内容形式" required>
                  <Select
                    value={value.format}
                    options={[
                      { label: '图文', value: 'article' },
                      { label: '视频', value: 'video' },
                    ]}
                    onChange={(v) => patch('format', v)}
                  />
                </Form.Item>
                <Form.Item label="时长 / 难度">
                  <Input
                    value={value.duration}
                    maxLength={64}
                    placeholder="例如：12分钟、入门"
                    onChange={(e) => patch('duration', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="排序">
                  <InputNumber
                    min={0}
                    precision={0}
                    value={value.sort}
                    onChange={(v) => patch('sort', v ?? 0)}
                  />
                </Form.Item>
              </div>
              <Form.Item label="教程摘要">
                <Input.TextArea
                  rows={2}
                  maxLength={512}
                  showCount
                  value={value.summary}
                  onChange={(e) => patch('summary', e.target.value)}
                />
              </Form.Item>
            </div>
            <div>
              <MediaUpload
                label="教程封面"
                items={value.cover ? [{ url: value.cover, type: 'image' }] : []}
                accept="image/jpeg,image/png"
                maxCount={1}
                busy={busy}
                onRemove={() => patch('cover', '')}
                onFiles={async (files) => {
                  const file = files[0];
                  if (!file) return;
                  if (
                    !['image/jpeg', 'image/png'].includes(file.type) ||
                    file.size > 5 * 1024 * 1024
                  ) {
                    message.error('封面仅支持JPG、PNG，不超过5MB');
                    return;
                  }
                  const url = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () =>
                      typeof reader.result === 'string'
                        ? resolve(reader.result)
                        : reject(new Error('封面读取失败'));
                    reader.onerror = () => reject(new Error('封面读取失败'));
                    reader.readAsDataURL(file);
                  });
                  patch('cover', url);
                }}
              />
              <p className="tm-cover-help">JPG、PNG，不超过5MB</p>
              {value.cover && (
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => patch('cover', '')}
                >
                  移除封面
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card>
      <Card title="详情正文" extra={<Tag>Markdown</Tag>}>
        <MarkdownEditor value={value.body} onChange={(v) => patch('body', v)} />
      </Card>
      <div className="tm-actions">
        <Space>
          <Button disabled={busy} onClick={back}>
            取消
          </Button>
          <Button loading={busy} onClick={() => void save()}>
            {item.visibility === '已公开' ? '保存修改' : '保存草稿'}
          </Button>
          {item.visibility === '已公开' ? (
            <Button
              danger
              disabled={busy}
              onClick={() => statusAction({ ...item, revision: base }, '下架')}
            >
              下架教程
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={!existing || busy}
              title={!existing ? '请先保存草稿' : undefined}
              onClick={() => void save(true)}
            >
              发布教程
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}
