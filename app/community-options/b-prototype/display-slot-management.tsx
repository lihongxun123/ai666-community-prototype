'use client';
import { useEffect, useRef, useState } from 'react';
import {createPortal} from 'react-dom';
import {
  App,
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Result,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from 'antd';
import { MediaUpload } from './media-upload';
import { resolveSlotTarget } from '../c-prototype/slots';
import {
  appendLog,
  readOperations,
  writeOperations,
  type OpRow,
} from './operations-model';
import './operations-management.css';
import {ContentPlacements} from './content-placements';

export const displaySlotTabs = [
  { key: 'homeBanner', label: '首页 Banner' },
  { key: 'homeAigc', label: '首页金刚区' },
];
const slotTypes: Record<string, string> = {
  homeBanner: '首页 Banner',
  homeAigc: '金刚区',
};
const idLabels: Record<string, string> = {
  homeBanner: 'Banner ID',
  homeAigc: '导航 ID',
};
const active = (row: OpRow) =>
  ['已发布', '上架', '已上架', '启用', '1'].includes(row.status);
const tabFor = (row: OpRow) =>
  typeof row.slotTab === 'string'
    ? row.slotTab
    : Object.keys(slotTypes).find((key) => slotTypes[key] === row.type) ||
      displaySlotTabs.find((t) => t.label === row.type)?.key ||
      '';
const text = (value: unknown) =>
  typeof value === 'string'
    ? value
    : typeof value === 'number'
      ? String(value)
      : '';
const isVideo = (url: string) =>
  /^data:video\//i.test(url) ||
  /\.(mp4|webm|avi|mkv|mov|flv|wmv)(?:[?#]|$)/i.test(url);
const imageUrl = (url: string) =>
  url === 'banner' ? '/home-prototype/banner.png' : url;
// Old prototype seeds contain a target label instead of a URL. Represent only
// targets resolved by the existing C prototype; these are local prototype paths,
// never inferred production routes. No storage or C snapshot migration occurs.
function slotJump(row: OpRow) {
  const url = text(row.jump_url || row.link);
  const configuredType = text(row.jump_type);
  if (url || configuredType) {
    return {
      jump_url: url,
      jump_type:
        configuredType ||
        (tabFor(row) === 'homeBanner'
          ? 'link'
          : /^https:\/\//i.test(url)
            ? 'external'
            : 'internal'),
      target_platform: text(row.target_platform),
    };
  }
  const target = resolveSlotTarget(text(row.target));
  if (target?.page === 'makenow') {
    return {
      jump_url: 'https://www.makenow.tv',
      jump_type: 'platform',
      target_platform: 'MakeNow',
    };
  }
  return {
    jump_url: target
      ? '/community-options/c-prototype?page=' + target.page.replace('?', '&')
      : '',
    jump_type: tabFor(row) === 'homeBanner' ? 'link' : 'internal',
    target_platform: '',
  };
}
type SlotForm = {
  title: string;
  description: string;
  image_url: string;
  jump_type: string;
  target_platform: string;
  jump_url: string;
  link_type: string;
  sort_order: number;
  status: string;
  media_type?: string;
};

function ExistingDisplaySlots({
  state = 'normal',
  actionHost,
}: {
  state?: string;
  actionHost: HTMLDivElement | null;
}) {
  const { message, modal } = App.useApp();
  const [data, setData] = useState(readOperations);
  const [tab, setTab] = useState('homeBanner');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [editor, setEditor] = useState<OpRow | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [videoPreview, setVideoPreview] = useState('');
  const [media, setMedia] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [manual, setManual] = useState(false);
  const [form] = Form.useForm<SlotForm>();
  const uploadVersion = useRef(0);
  const failureUsed = useRef(false);
  const [loadFailed, setLoadFailed] = useState(state === 'load-failed');
  const jumpType = Form.useWatch('jump_type', form);
  const label = displaySlotTabs.find((t) => t.key === tab)!.label;
  const banner = tab === 'homeBanner';
  const nav = tab === 'homeAigc';
  const ad = tab === 'flashFirst';
  const generic = !banner && !nav && !ad;
  useEffect(() => {
    const refresh = () => setData(readOperations());
    window.addEventListener('bp-operations-change', refresh);
    return () => window.removeEventListener('bp-operations-change', refresh);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const unload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const guard = (e: Event) => {
      e.preventDefault();
      modal.confirm({
        title: '放弃未保存修改？',
        content: '关闭后将丢失当前修改。',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          uploadVersion.current++;
          setDirty(false);
          setEditor(null);
          (e as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    window.addEventListener('beforeunload', unload);
    window.addEventListener('prototype-before-navigate', guard);
    return () => {
      window.removeEventListener('beforeunload', unload);
      window.removeEventListener('prototype-before-navigate', guard);
    };
  }, [dirty, modal]);
  const rows = (state === 'empty' ? [] : data.rows.slots)
    .filter(
      (r) =>
        tabFor(r) === tab &&
        (!filter || r.id.trim().toLowerCase() === filter.trim().toLowerCase()),
    )
    .sort((a, b) => a.order - b.order);
  function open(row?: OpRow) {
    uploadVersion.current++;
    form.resetFields();
    const current = row || {
      id: '',
      name: '',
      type: slotTypes[tab],
      status: '停用',
      order: ad ? 100 : 0,
    };
    const url = imageUrl(text(current.image_url || current.cover));
    const values: SlotForm = {
      title: current.name,
      description: text(current.description || current.summary),
      image_url: url,
      ...slotJump(current),
      link_type: text(current.link_type) || '_blank',
      sort_order: current.order,
      status: active(current) ? '1' : '0',
    };
    form.setFieldsValue(values);
    setMedia(url);
    setMediaType(
      current.media_type === 'video' || isVideo(url) ? 'video' : 'image',
    );
    setManual(!!row);
    setDirty(false);
    setEditor(current);
  }
  function close() {
    if (busy) return;
    const discard = () => {
      uploadVersion.current++;
      setEditor(null);
      setDirty(false);
    };
    if (dirty)
      modal.confirm({
        title: '放弃未保存修改？',
        content: '关闭后将丢失当前修改。',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: discard,
      });
    else discard();
  }
  // Only B configuration is saved here. The existing C published snapshot uses a
  // different target/device contract and must not receive partially mapped rows.
  function persist(rows: OpRow[], object: string, action: string) {
    const current = readOperations();
    const next = appendLog(
      { ...current, rows: { ...current.rows, slots: rows } },
      'slots',
      object,
      action,
      label,
    );
    writeOperations(next);
    setData(next);
  }
  async function save() {
    if (busy || !editor) return;
    let values: SlotForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    try {
      if (state === 'save-failed' && !failureUsed.current) {
        failureUsed.current = true;
        throw new Error('保存失败，请重试');
      }
      const current = readOperations();
      const existing = current.rows.slots.find((r) => r.id === editor.id);
      if (editor.id && !existing)
        throw new Error('展示位已不存在，请刷新后重试');
      const id = editor.id || 'slot-' + crypto.randomUUID();
      const next: OpRow = {
        ...editor,
        ...values,
        id,
        name: values.title.trim(),
        title: values.title.trim(),
        summary: values.description?.trim() || '',
        description: values.description?.trim() || '',
        type: slotTypes[tab],
        slotTab: tab,
        order: values.sort_order,
        status: values.status === '1' ? '已发布' : '已下架',
        image_url: values.image_url?.trim() || '',
        jump_url: values.jump_url?.trim() || '',
        target_platform:
          values.jump_type === 'platform' ? values.target_platform : '',
        media_type: mediaType,
        published: true,
      };
      // Keep one canonical media value; copying a data URL into cover doubles
      // local storage consumption and is unnecessary for this B-only contract.
      delete next.cover;
      delete next.publicSnapshot;
      delete next.draftPending;
      persist(
        existing
          ? current.rows.slots.map((r) => (r.id === id ? next : r))
          : [next, ...current.rows.slots],
        next.name,
        existing ? '编辑' : '新建投放',
      );
      setDirty(false);
      setEditor(null);
      message.success('保存成功');
    } catch (error) {
      message.error(
        error instanceof DOMException && error.name === 'QuotaExceededError'
          ? '本地演示存储空间不足，请使用较小素材或填写素材链接'
          : error instanceof Error
            ? error.message
            : '保存失败，请重试',
      );
    } finally {
      setBusy(false);
    }
  }
  function action(row: OpRow, remove = false) {
    modal.confirm({
      title: remove
        ? '删除展示位？'
        : active(row)
          ? '下架展示位？'
          : '上架展示位？',
      content: row.name,
      okText: remove ? '删除' : '确认',
      okButtonProps: { danger: remove },
      cancelText: '取消',
      onOk: () => {
        try {
          const current = readOperations();
          if (!current.rows.slots.some((r) => r.id === row.id))
            throw new Error('展示位已不存在，请刷新后重试');
          persist(
            remove
              ? current.rows.slots.filter((r) => r.id !== row.id)
              : current.rows.slots.map((r) =>
                  r.id === row.id
                    ? {
                        ...r,
                        status: active(r) ? '已下架' : '已发布',
                        published: true,
                      }
                    : r,
                ),
            row.name,
            remove ? '删除' : active(row) ? '下架' : '上架',
          );
          message.success('操作成功');
        } catch (error) {
          message.error(
            error instanceof Error ? error.message : '操作失败，请重试',
          );
          throw error;
        }
      },
    });
  }
  async function upload(files: File[]) {
    const file = files[0];
    if (!file) return;
    const video = file.type.startsWith('video/');
    if (
      (!banner && video) ||
      (!video && !file.type.startsWith('image/')) ||
      (banner &&
        !/\.(jpe?g|png|gif|webp|bmp|avif|mp4|webm|avi|mkv|mov|flv|wmv)$/i.test(
          file.name,
        ))
    ) {
      message.error(banner ? '不支持该素材格式' : '请选择图片文件');
      return;
    }
    if (
      generic &&
      (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 5 * 1024 * 1024)
    ) {
      message.error('仅支持 5MB 以内的 JPG、PNG、WebP 图片');
      return;
    }
    const version = ++uploadVersion.current;
    setBusy(true);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === 'string'
            ? resolve(reader.result)
            : reject(new Error('素材读取失败'));
        reader.onerror = () => reject(new Error('素材读取失败，请重试'));
        reader.readAsDataURL(file);
      });
      if (version !== uploadVersion.current) return;
      form.setFieldValue('image_url', url);
      setMedia(url);
      setMediaType(video ? 'video' : 'image');
      setDirty(true);
      message.success('素材已选择');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '素材读取失败');
    } finally {
      if (version === uploadVersion.current) setBusy(false);
    }
  }
  const linkRules = [
    {
      validator: (_: unknown, value: string) => {
        const url = (value || '').trim();
        const httpsValid = (() => { try { const parsed = new URL(url); return parsed.protocol === 'https:' && !!parsed.hostname && !/[\s\\]/.test(url); } catch { return false; } })();
        if (banner)
          return url
            ? Promise.resolve()
            : Promise.reject(new Error('请输入跳转链接'));
        if (jumpType === 'platform' && !url) return Promise.resolve();
        if (!url) return Promise.reject(new Error('请输入跳转地址'));
        if (jumpType === 'external' || jumpType === 'platform')
          return httpsValid
            ? Promise.resolve()
            : Promise.reject(new Error('请输入 HTTPS 链接'));
        return /^(?:\/(?!\/)|\.{1,2}\/|#[^\s]+|\?[^\s]+)/.test(url) &&
          !/[\s\\]/.test(url)
          ? Promise.resolve()
          : Promise.reject(new Error('请输入 C 端相对路径'));
      },
    },
  ];
  if (state === 'permission-denied' || state === 'no-permission')
    return <Result status="403" title="暂无访问权限" />;
  if (loadFailed)
    return (
      <Result
        status="error"
        title="加载失败"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setData(readOperations());
              setLoadFailed(false);
            }}
          >
            重新加载
          </Button>
        }
      />
    );
  return (
    <div className="om-root om-slots">
      <Tabs
        activeKey={tab}
        items={displaySlotTabs}
        onChange={(key) => {
          setTab(key);
          setQuery('');
          setFilter('');
          setPagination((p) => ({ ...p, current: 1 }));
        }}
      />
      <div className="om-filter">
        <Space wrap>
          <span>{idLabels[tab] || '展示位 ID'}</span>
          <Input
            aria-label={idLabels[tab] || '展示位 ID'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={() => {
              setFilter(query);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            placeholder="请输入 ID"
            style={{ width: 220 }}
          />
          <Button
            type="primary"
            onClick={() => {
              setFilter(query);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
          >
            查询
          </Button>
          <Button
            onClick={() => {
              setQuery('');
              setFilter('');
              setPagination((p) => ({ ...p, current: 1 }));
            }}
          >
            重置
          </Button>
        </Space>
      </div>
      {actionHost && createPortal(
        <Button type="primary" onClick={() => open()}>
          新建投放
        </Button>,actionHost)}
      <Table<OpRow>
        rowKey="id"
        dataSource={rows}
        scroll={{ x: 1190 }}
        locale={{ emptyText: '暂无数据' }}
        pagination={{
          ...pagination,
          total: rows.length,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100],
          showQuickJumper: false,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (current, pageSize) =>
            setPagination({
              current: pageSize !== pagination.pageSize ? 1 : current,
              pageSize,
            }),
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 120 },
          { title: '标题', dataIndex: 'name', width: 180 },
          {
            title: '描述',
            width: 210,
            render: (_, r) =>
              r.jump_type === 'platform'
                ? `平台互通 · ${text(r.target_platform)}`
                : text(r.description || r.summary) || '—',
          },
          {
            title: '跳转链接',
            width: 210,
            render: (_, r) =>
              slotJump(r).jump_url ||
              (r.jump_type === 'platform' ? '无备用链接' : '—'),
          },
          {
            title: '背景素材',
            width: 120,
            render: (_, r) => {
              const url = text(r.image_url || r.cover);
              return !url ? (
                '—'
              ) : r.media_type === 'video' || isVideo(url) ? (
                <button
                  type="button"
                  aria-label={`预览 ${r.name} 视频`}
                  onClick={() => setVideoPreview(url)}
                  style={{
                    width: 72,
                    height: 40,
                    position: 'relative',
                    border: 0,
                    padding: 0,
                    background: '#f5f5f5',
                    cursor: 'pointer',
                  }}
                >
                  <video
                    src={url}
                    muted
                    preload="metadata"
                    style={{ width: 72, height: 40, objectFit: 'cover' }}
                  >
                    <track kind="captions" />
                  </video>
                  <span
                    style={{
                      position: 'absolute',
                      right: 2,
                      bottom: 2,
                      fontSize: 10,
                      background: '#0009',
                      color: 'white',
                    }}
                  >
                    视频
                  </span>
                </button>
              ) : (
                <Image
                  src={imageUrl(url)}
                  alt={r.name}
                  width={72}
                  height={40}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              );
            },
          },
          {
            title: '状态',
            width: 90,
            render: (_, r) => (
              <Tag color={active(r) ? 'success' : 'default'}>
                {active(r) ? '已上架' : '已下架'}
              </Tag>
            ),
          },
          { title: '排序', dataIndex: 'order', width: 70 },
          {
            title: '操作',
            fixed: 'right',
            width: 190,
            render: (_, r) => (
              <Space size={0}>
                <Button type="link" onClick={() => open(r)}>
                  编辑
                </Button>
                <Button type="link" onClick={() => action(r)}>
                  {active(r) ? '下架' : '上架'}
                </Button>
                <Button type="link" danger onClick={() => action(r, true)}>
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={!!editor}
        title={`${editor?.id ? '编辑' : '新建'}${nav ? '首页导航' : ad ? '广告位' : label}`}
        width={880}
        centered
        className="placement-editor"
        okText="保存"
        cancelText="取消"
        onOk={save}
        onCancel={close}
        mask={{ closable: false }}
        confirmLoading={busy}
        destroyOnHidden
      >
        <Form
          className="placement-form"
          form={form}
          layout="vertical"
          onValuesChange={(_, values) => {
            setDirty(true);
            if (values.image_url !== media) {
              setMedia(values.image_url || '');
              setMediaType(isVideo(values.image_url || '') ? 'video' : 'image');
            }
          }}
        >
          {editor?.id && (
            <div className="placement-full placement-id"><span>{idLabels[tab] || '展示位 ID'}</span><span>{editor.id}</span></div>
          )}
          {generic && (
            <Form.Item label="展示位置">
              <Input value={label} disabled />
            </Form.Item>
          )}
          <Form.Item
            className={banner ? 'placement-full' : undefined}
            label={nav ? '导航名称' : ad ? '广告名称' : '标题'}
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: nav
                  ? '请输入导航名称'
                  : ad
                    ? '请输入广告名称'
                    : '请输入标题',
              },
            ]}
          >
            <Input maxLength={banner ? 100 : nav || ad ? 64 : 128} showCount />
          </Form.Item>
          {!banner && (
            <Form.Item
              label={nav ? '导航简介' : ad ? '广告简介' : '描述'}
              name="description"
            >
              {generic ? (
                <Input.TextArea rows={3} maxLength={512} showCount />
              ) : (
                <Input maxLength={255} showCount />
              )}
            </Form.Item>
          )}
          <Form.Item
            className="placement-full placement-media"
            label={banner ? '素材' : ad ? '背景图' : '背景图片'}
            required={!nav}
          >
            <Space style={{ marginBottom: 8 }}>
              <span>{banner ? '素材来源' : '图片来源'}</span>
              <Radio.Group
                value={manual ? 'url' : 'upload'}
                options={[
                  { label: '上传文件', value: 'upload' },
                  { label: '手动输入', value: 'url' },
                ]}
                onChange={(e) => setManual(e.target.value === 'url')}
              />
            </Space>
            {!manual && (
              <MediaUpload
                items={media ? [{ url: imageUrl(media), type: mediaType }] : []}
                onFiles={upload}
                onRemove={() => {
                  form.setFieldValue('image_url', '');
                  setMedia('');
                  setDirty(true);
                }}
                accept={
                  banner
                    ? '.jpg,.jpeg,.png,.gif,.webp,.bmp,.avif,.mp4,.webm,.avi,.mkv,.mov,.flv,.wmv'
                    : generic
                      ? 'image/jpeg,image/png,image/webp'
                      : 'image/*'
                }
                busy={busy}
                firstAsCover={false}
              />
            )}
            <Form.Item
              name="image_url"
              noStyle
              rules={[
                {
                  required: !nav,
                  message: banner
                    ? '请上传或填写图片、视频 URL'
                    : '请上传或填写背景图',
                },
                {
                  validator: (_, value) => {
                    if (
                      !value ||
                      !banner ||
                      value === 'banner' ||
                      /^data:(image|video)\//i.test(value) ||
                      /\.(jpe?g|png|gif|webp|bmp|avif|mp4|webm|avi|mkv|mov|flv|wmv)(?:[?#]|$)/i.test(
                        value,
                      )
                    )
                      return Promise.resolve();
                    return Promise.reject(
                      new Error('素材格式不受支持，请检查 URL 后缀'),
                    );
                  },
                },
              ]}
            >
              <Input
                style={manual ? undefined : {display:'none'}}
                maxLength={banner ? undefined : nav || ad ? 500 : 512}
                placeholder={manual ? '请输入素材 URL' : '选择文件后自动填入'}
              />
            </Form.Item>
            {manual && media && (
              <MediaUpload
                items={[{ url: imageUrl(media), type: mediaType }]}
                onFiles={() => {}}
                onRemove={() => {}}
                accept=""
                disabled
                firstAsCover={false}
              />
            )}
          </Form.Item>
          <Form.Item
            label="业务类型"
            name="jump_type"
            rules={[{ required: true }]}
          >
            <Radio.Group
              options={
                banner
                  ? [
                      { label: '普通链接', value: 'link' },
                      { label: '平台互通', value: 'platform' },
                    ]
                  : [
                      { label: '站内路径', value: 'internal' },
                      { label: '站外链接', value: 'external' },
                      { label: '平台互通', value: 'platform' },
                    ]
              }
              onChange={(e) => {
                form.setFieldsValue({
                  target_platform:
                    e.target.value === 'platform' ? 'MakeNow' : '',
                  jump_url:
                    banner && e.target.value === 'platform'
                      ? 'https://www.makenow.tv'
                      : '',
                  ...(banner && e.target.value === 'platform'
                    ? { link_type: '_blank' }
                    : {}),
                });
              }}
            />
          </Form.Item>
          {jumpType === 'platform' && (
            <Form.Item
              label="目标平台"
              name="target_platform"
              rules={[{ required: true, message: '请选择互通目标平台' }]}
            >
              <Select options={[{ label: 'MakeNow', value: 'MakeNow' }]} />
            </Form.Item>
          )}
          {banner && jumpType === 'link' && (
            <Form.Item
              label="打开方式"
              name="link_type"
              rules={[{ required: true }]}
            >
              <Radio.Group
                options={[
                  { label: '站内跳转', value: '_self' },
                  { label: '站外跳转', value: '_blank' },
                ]}
              />
            </Form.Item>
          )}
          <Form.Item
            className="placement-full"
            label={
              jumpType === 'platform'
                ? '备用链接'
                : banner
                  ? '跳转链接'
                  : '跳转地址'
            }
            name="jump_url"
            rules={linkRules}
          >
            <Input
              maxLength={banner ? undefined : nav || ad ? 500 : 512}
              placeholder={
                jumpType === 'platform'
                  ? banner
                    ? '请输入备用链接'
                    : '可选，互通失败或旧版 C 端使用'
                  : jumpType === 'external'
                    ? '请输入 HTTPS 链接'
                    : banner
                      ? '请输入跳转链接'
                      : '请输入 C 端相对路径'
              }
            />
          </Form.Item>
          <Form.Item
            label="排序"
            name="sort_order"
            rules={[
              { required: true, message: '请输入排序' },
              {
                type: 'integer',
                min: ad ? 1 : 0,
                message: ad ? '排序必须为大于 0 的整数' : '排序必须为非负整数',
              },
            ]}
          >
            <InputNumber
              min={ad ? 1 : 0}
              precision={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}>
            <Radio.Group
              options={[
                { label: '上架', value: '1' },
                { label: '下架', value: '0' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={!!videoPreview}
        title="视频预览"
        onCancel={() => setVideoPreview('')}
        footer={null}
        destroyOnHidden
      >
        <video
          src={videoPreview}
          controls
          playsInline
          style={{ width: '100%' }}
        >
          <track kind="captions" />
        </video>
      </Modal>
    </div>
  );
}

export function DisplaySlotManagement({state='normal'}:{state?:string}){const [area,setArea]=useState('home');const [actionHost,setActionHost]=useState<HTMLDivElement|null>(null);return <div className="om-root"><Tabs activeKey={area} onChange={setArea} tabBarExtraContent={<div ref={setActionHost}/>} items={[{key:'home',label:'首页'},{key:'app',label:'AI应用页'},{key:'search',label:'搜索页'}]}/>{area==='home'?<ExistingDisplaySlots state={state} actionHost={actionHost}/>:<ContentPlacements key={area} area={area as 'app'|'search'} state={state} actionHost={actionHost}/>}</div>;}
