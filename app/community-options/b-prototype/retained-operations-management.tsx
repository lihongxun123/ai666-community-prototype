'use client';
import { useEffect, useRef, useState } from 'react';
import {
  App,
  Button,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Result,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { readAdminWorks, type Work } from './work-management';
import { readAigcModels } from './aigc-model';
import { useTaxonomyOptions } from './taxonomy-adapter';
import { readOperations, writeOperations } from './operations-model';
import { MediaUpload } from './media-upload';
import './retained-operations-management.css';

type Template = Work & {
  templateConfigured: boolean;
  hotTemplate: boolean;
  templateSortOrder: number;
  updatedAt: string;
  templateModel: string;
};
type PopupItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  link: string;
  jumpType: 'internal' | 'external' | 'platform';
  targetPlatform: string;
  sort: number;
  status: '已上架' | '已下架';
  audience: string;
  frequency: string;
  start: string;
  end: string;
  updatedAt: string;
};
type PopupStore = { title: string; enabled: boolean; items: PopupItem[] };
const outputCode = (value: string) =>
  (
    ({ 图片: 'image', 漫剧: 'image', 视频: 'video', 文本: 'text' }) as Record<
      string,
      string
    >
  )[value];
function readModels() {
  try {
    return readAigcModels();
  } catch {
    return [];
  }
}
const auditValue = (value: unknown): unknown =>
  typeof value === 'string' && value.startsWith('data:')
    ? '[媒体]'
    : Array.isArray(value)
      ? value.map(auditValue)
      : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, auditValue(v)]),
          )
        : value;
const popupKey = 'research-b-login-popup-v1',
  worksKey = 'ai666-work-admin-v3';
const stamp = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
const aliases: Record<string, string> = {
  'load-failed': 'error',
  'save-failed': 'save-error',
  'permission-denied': 'no-permission',
};
export const retainedOperationsPages = [
  { id: 'op-login-popup', title: '登录弹窗配置', module: '运营管理' },
].map((p) => ({
  ...p,
  states: [
    'normal',
    'empty',
    'error',
    'loading',
    'no-permission',
    'save-error',
  ],
}));
const popupSeed = (): PopupStore => ({
  title: '欢迎来到多元拾光',
  enabled: true,
  items: [
    {
      id: 'POP-DEMO-1',
      title: '开始创作',
      description: '发现社区创作与任务',
      image: '/home-prototype/sea.png',
      buttonText: '查看活动',
      link: '/?page=events',
      jumpType: 'internal',
      targetPlatform: '',
      sort: 10,
      status: '已上架',
      audience: 'all',
      frequency: 'once',
      start: '',
      end: '',
      updatedAt: '2026-10-05 10:00:00',
    },
    {
      id: 'POP-DEMO-2',
      title: '继续你的故事',
      description: '把灵感做成漫剧',
      image: '/home-prototype/restore.png',
      buttonText: '前往MakeNow',
      link: 'https://www.makenow.tv',
      jumpType: 'platform',
      targetPlatform: 'MakeNow',
      sort: 20,
      status: '已下架',
      audience: 'all',
      frequency: 'once',
      start: '',
      end: '',
      updatedAt: '2026-10-05 10:00:00',
    },
  ],
});
function readPopup(): PopupStore {
  if (typeof localStorage === 'undefined') return popupSeed();
  const raw = localStorage.getItem(popupKey);
  if (!raw) return popupSeed();
  const parsed = JSON.parse(raw);
  if (
    !parsed ||
    !Array.isArray(parsed.items) ||
    typeof parsed.title !== 'string'
  )
    throw new Error('登录弹窗配置无法读取，请重试');
  return parsed;
}
function readTemplates(): Template[] {
  const works = readAdminWorks();
  return works
    .map((w, i) => {
      const stored = w as Partial<Template>;
      return {
        ...w,
        templateConfigured:
          stored.templateConfigured ?? (w.official && i < 17 && i % 4 === 0),
        hotTemplate: stored.hotTemplate ?? true,
        templateSortOrder: stored.templateSortOrder ?? (i + 1) * 10,
        updatedAt: stored.updatedAt || w.created,
        templateModel:
          stored.templateModel ||
          (['图片', '漫剧'].includes(w.mediaType)
            ? 'image-standard'
            : w.mediaType === '视频'
              ? 'video-standard'
              : 'text-standard'),
      };
    })
    .filter((w) => w.templateConfigured);
}
const fileData = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('素材读取失败'));
    reader.onerror = () => reject(new Error('素材读取失败'));
    reader.readAsDataURL(file);
  });
function validLink(value: string, kind: PopupItem['jumpType']) {
  if (kind === 'platform' && !value) return true;
  if (kind === 'external' || kind === 'platform')
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  return (
    /^(\/(?!\/)|\?[^\s]+|#[^\s]+|\.{1,2}\/)/.test(value) &&
    !/[\s\\]/.test(value)
  );
}
export function RetainedOperationsManagement({
  page,
  state,
}: {
  page: string;
  state: string;
  go: (s: string) => void;
}) {
  const { message, modal } = App.useApp();
  const templatePage = page === 'content-templates';
  const [popup, setPopup] = useState(popupSeed),
    [templates, setTemplates] = useState<Template[]>([]),
    [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [localState, setLocalState] = useState(aliases[state] || state),
    [query, setQuery] = useState({
      id: '',
      name: '',
      type: undefined as string | undefined,
      status: undefined as string | undefined,
    }),
    [applied, setApplied] = useState(query),
    [current, setCurrent] = useState(1),
    [size, setSize] = useState(20),
    [editor, setEditor] = useState<Template | PopupItem | null>(null),
    [creating, setCreating] = useState(false),
    [dirty, setDirty] = useState(false),
    [settingsDirty, setSettingsDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [action, setAction] = useState<{
      row: Template | PopupItem;
      label: string;
    } | null>(null);
  const [form] = Form.useForm();
  const lock = useRef(false),
    alive = useRef(true),
    context = useRef(0),
    stateRef = useRef(localState);
  const mediaType = Form.useWatch('mediaType', form),
    modelCode = Form.useWatch('templateModel', form),
    jumpType = Form.useWatch('jumpType', form),
    images = Form.useWatch('images', { form, preserve: true }) as
      | string[]
      | undefined,
    video = Form.useWatch('video', { form, preserve: true }) as
      | string
      | undefined,
    image = Form.useWatch('image', form) as string | undefined,
    references = Form.useWatch('references', { form, preserve: true }) as
      | string[]
      | undefined;
  const categories = useTaxonomyOptions(
      'work',
      editor && 'mediaType' in editor ? editor.categories : undefined,
    ),
    topics = useTaxonomyOptions('work-topic'),
    scenarios = useTaxonomyOptions('work-scenario');
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);
  useEffect(() => {
    alive.current = true;
    queueMicrotask(() => {
      try {
        setPopup(readPopup());
        setTemplates(readTemplates());
        if (templatePage) readAigcModels();
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败');
      }
      setReady(true);
    });
    return () => {
      alive.current = false;
    };
  }, [templatePage]);
  useEffect(() => {
    queueMicrotask(() => setLocalState(aliases[state] || state));
  }, [state]);
  useEffect(() => {
    if (!dirty && !settingsDirty && !busy && !uploading) return;
    const before = (e: Event) => {
      e.preventDefault();
      if (lock.current || uploading) {
        message.info('正在保存，请稍候');
        return;
      }
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          context.current++;
          setEditor(null);
          setDirty(false);
          setSettingsDirty(false);
          (e as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    const unload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('prototype-before-navigate', before);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('prototype-before-navigate', before);
      window.removeEventListener('beforeunload', unload);
    };
  }, [dirty, settingsDirty, busy, uploading, message, modal]);
  const allowed = () => {
    if (!['normal', 'empty', 'save-error'].includes(stateRef.current)) {
      message.error('暂无操作权限');
      return false;
    }
    return !lock.current && !uploading;
  };
  function reload() {
    if (settingsDirty) {
      modal.confirm({
        title: '放弃未保存的弹窗设置？',
        okText: '刷新',
        cancelText: '继续编辑',
        onOk: () => {
          setSettingsDirty(false);
          reloadData();
        },
      });
    } else reloadData();
  }
  function reloadData() {
    try {
      setPopup(readPopup());
      setTemplates(readTemplates());
      if (templatePage) readAigcModels();
      setError('');
      setLocalState('normal');
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败，请重试');
    }
  }
  function close() {
    if (lock.current || uploading) return;
    const finish = () => {
      context.current++;
      setEditor(null);
      setDirty(false);
      form.resetFields();
    };
    if (dirty)
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: finish,
      });
    else finish();
  }
  function open(row?: Template | PopupItem) {
    if (!allowed()) return;
    context.current++;
    setCreating(!row);
    setDirty(false);
    form.resetFields();
    const next =
      row ||
      (templatePage
        ? {
            id: 'work-' + crypto.randomUUID().slice(0, 8),
            mediaType: '图片',
            title: '',
            author: '多元拾光编辑部',
            authorId: 'user-official',
            official: true,
            category: '',
            categories: [],
            topics: [],
            scenarios: [],
            model: '',
            templateModel: '',
            status: '草稿',
            hot: false,
            created: stamp(),
            prompt: '',
            summary: '',
            images: [],
            references: [],
            logs: [],
            templateConfigured: true,
            hotTemplate: true,
            templateSortOrder: 10,
            updatedAt: stamp(),
          }
        : {
            ...popupSeed().items[0],
            id: 'POP-DEMO-' + crypto.randomUUID().slice(0, 8),
            title: '',
            description: '',
            image: '',
            buttonText: '',
            link: '',
            status: '已下架',
            sort: 10,
          });
    setEditor(structuredClone(next as Template | PopupItem));
    form.setFieldsValue(next);
  }
  async function write(
    label: string,
    target: string,
    before: unknown,
    after: unknown,
    storageKey: string,
    value: unknown,
  ) {
    if (!allowed()) return false;
    lock.current = true;
    setBusy(true);
    const token = context.current;
    await new Promise((resolve) => setTimeout(resolve, 240));
    if (!alive.current) {
      lock.current = false;
      return false;
    }
    try {
      if (
        token !== context.current ||
        !['normal', 'empty', 'save-error'].includes(stateRef.current)
      )
        throw new Error('当前操作对象或权限已变化，请重新操作');
      if (stateRef.current === 'save-error') {
        setLocalState('normal');
        throw new Error('保存失败，输入已保留，请重试');
      }
      if (storageKey === worksKey) {
        const latest = readAdminWorks();
        const current = latest.find((row) => row.id === target);
        const beforeRow = before as Partial<Template>;
        if (
          beforeRow.id &&
          (!current ||
            current.title !== beforeRow.title ||
            current.status !== beforeRow.status ||
            JSON.stringify(current.logs) !==
              JSON.stringify((beforeRow as Template).logs))
        )
          throw new Error('模板已被更新，请保留输入并重新核对');
        const proposed = (value as Work[]).find(
          (row) => row.id === target,
        ) as Template;
        if (
          label.includes('编辑') ||
          label.includes('创建') ||
          label === '上架' ||
          label === '设置爆款模板'
        ) {
          const model = readAigcModels().find(
            (row) => row.code === proposed.templateModel,
          );
          if (
            !model ||
            model.status !== '1' ||
            !model.output_types.includes(outputCode(proposed.mediaType))
          )
            throw new Error('默认模型已停用或输出类型已变化，请重新选择');
        }
        value = current
          ? latest.map((row) => (row.id === target ? proposed : row))
          : [proposed, ...latest];
      } else {
        const latest = readPopup();
        const proposed = value as PopupStore;
        if (label === '保存弹窗设置')
          value = {
            ...latest,
            title: proposed.title,
            enabled: proposed.enabled,
          };
        else {
          const current = latest.items.find((row) => row.id === target);
          const beforeRow = before as Partial<PopupItem>;
          if (
            beforeRow.id &&
            JSON.stringify(current) !== JSON.stringify(beforeRow)
          )
            throw new Error('弹窗子项已被更新，请保留输入并重新核对');
          const item = proposed.items.find((row) => row.id === target)!;
          value = {
            ...latest,
            items: current
              ? latest.items.map((row) => (row.id === target ? item : row))
              : [item, ...latest.items],
          };
        }
      }
      const previous = localStorage.getItem(storageKey);
      localStorage.setItem(storageKey, JSON.stringify(value));
      try {
        const ops = readOperations();
        writeOperations({
          ...ops,
          revision: ops.revision + 1,
          logs: [
            {
              id: 'retained-log-' + crypto.randomUUID(),
              at: stamp(),
              actor: '演示运营员',
              module: templatePage ? '模板配置' : '登录弹窗配置',
              object: target,
              action: label,
              detail: JSON.stringify({
                before: auditValue(before),
                after: auditValue(after),
              }),
            },
            ...ops.logs,
          ],
        });
      } catch (e) {
        if (previous === null) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, previous);
        throw e;
      }
      if (storageKey === worksKey) {
        window.dispatchEvent(new Event('ai666-work-admin-change'));
        setTemplates(readTemplates());
        if (templatePage) readAigcModels();
      } else
        setPopup((previous) =>
          settingsDirty
            ? {
                ...(value as PopupStore),
                title: previous.title,
                enabled: previous.enabled,
              }
            : (value as PopupStore),
        );
      message.success('保存成功');
      return true;
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : '保存失败，输入已保留，请重试',
      );
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save() {
    if (!editor || !allowed()) return;
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      if (templatePage) {
        const item = editor as Template;
        const models = readAigcModels();
        const model = models.find((m) => m.code === values.templateModel);
        const expectedType = outputCode(values.mediaType);
        if (
          !model ||
          model.status !== '1' ||
          !model.output_types.includes(expectedType)
        )
          throw new Error('请选择已启用且与内容类型匹配的默认模型');
        if (values.mediaType === '视频' && !values.video)
          throw new Error('请上传视频成果');
        if (
          ['图片', '漫剧'].includes(values.mediaType) &&
          !values.images?.length
        )
          throw new Error('请上传至少一张成果图片');
        const latest = readAdminWorks();
        const before = latest.find((w) => w.id === item.id);
        if (!creating && (!before || !before.official))
          throw new Error('官方模板作品已变化，请重新加载');
        const next: Template = {
          ...item,
          ...before,
          ...values,
          title: values.title.trim(),
          summary: values.summary.trim(),
          prompt: values.prompt.trim(),
          category: values.categories[0],
          model: model.name,
          templateModel: model.code,
          generation: { model: model.code },
          templateConfigured: true,
          hotTemplate: creating
            ? true
            : ((before as Template | undefined)?.hotTemplate ??
              item.hotTemplate),
          templateSortOrder: values.templateSortOrder,
          updatedAt: stamp(),
          logs: [
            {
              at: stamp(),
              action: creating ? '创建官方模板' : '编辑官方模板',
              reason: '维护模板资料',
            },
            ...(before?.logs || []),
          ],
        };
        const rows = creating
          ? [next, ...latest]
          : latest.map((w) => (w.id === next.id ? next : w));
        if (
          await write(
            creating ? '创建官方模板' : '编辑官方模板',
            next.id,
            before || {},
            next,
            worksKey,
            rows,
          )
        ) {
          setEditor(null);
          setDirty(false);
        }
      } else {
        const item = editor as PopupItem;
        if (!validLink(values.link?.trim() || '', values.jumpType))
          throw new Error(
            values.jumpType === 'internal'
              ? '请填写 C端相对路径'
              : '请填写有效的HTTPS链接',
          );
        const store = readPopup();
        const before = store.items.find((x) => x.id === item.id);
        if (!creating && !before) throw new Error('弹窗子项已变化，请重新加载');
        const next: PopupItem = {
          ...item,
          ...before,
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
          buttonText: values.buttonText.trim(),
          link: values.link?.trim() || '',
          targetPlatform:
            values.jumpType === 'platform' ? values.targetPlatform : '',
          updatedAt: stamp(),
        };
        const updated = {
          ...store,
          items: creating
            ? [next, ...store.items]
            : store.items.map((x) => (x.id === next.id ? next : x)),
        };
        if (
          await write(
            creating ? '新建弹窗子项' : '编辑弹窗子项',
            next.id,
            before || {},
            next,
            popupKey,
            updated,
          )
        ) {
          setEditor(null);
          setDirty(false);
        }
      }
    } catch (e) {
      if (e instanceof Error) message.error(e.message);
    }
  }
  async function setStatus(selected = action) {
    if (!selected || !allowed()) return;
    const row = selected.row;
    if (templatePage) {
      const all = readAdminWorks(),
        current = all.find((w) => w.id === row.id);
      if (!current || !current.official) {
        message.error('模板已变化，请重新加载');
        return;
      }
      const item = { ...row, ...current } as Template;
      const patch =
        selected.label === '取消爆款模板'
          ? { hotTemplate: false }
          : selected.label === '设置爆款模板'
            ? { hotTemplate: true }
            : selected.label === '上架'
              ? {
                  status: '已公开' as const,
                  hotTemplate: item.hotTemplate,
                  publicAt: item.publicAt || stamp(),
                }
              : { status: '已下架' as const, hot: false };
      const next = {
        ...item,
        ...patch,
        updatedAt: stamp(),
        logs: [
          { at: stamp(), action: selected.label, reason: selected.label },
          ...item.logs,
        ],
      };
      if (
        await write(
          selected.label,
          item.id,
          item,
          next,
          worksKey,
          all.map((w) => (w.id === item.id ? next : w)),
        )
      )
        setAction(null);
    } else {
      const store = readPopup(),
        item = store.items.find((x) => x.id === row.id);
      if (!item) {
        message.error('弹窗子项已变化，请重新加载');
        return;
      }
      const next = {
        ...item,
        status:
          selected.label === '上架' ? ('已上架' as const) : ('已下架' as const),
        updatedAt: stamp(),
      };
      if (
        await write(selected.label, item.id, item, next, popupKey, {
          ...store,
          items: store.items.map((x) => (x.id === item.id ? next : x)),
        })
      )
        setAction(null);
    }
  }
  async function upload(
    files: File[],
    field: 'image' | 'images' | 'video' | 'references',
  ) {
    if (!editor || !files.length || !allowed()) return;
    const max = field === 'images' || field === 'references' ? 4 : 1,
      current = form.getFieldValue(field);
    const previous = Array.isArray(current) ? current : [];
    if (previous.length + files.length > max) {
      message.error(`最多上传${max}个文件`);
      return;
    }
    if (
      files.some((f) =>
        field === 'video'
          ? !['video/mp4', 'video/webm', 'video/quicktime'].includes(f.type) ||
            f.size > 300 * 1024 * 1024
          : !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
            f.size > (templatePage ? 20 : 5) * 1024 * 1024,
      )
    ) {
      message.error(
        field === 'video'
          ? '支持300MB以内MP4、WebM、MOV'
          : templatePage
            ? '支持20MB以内JPG、PNG、WebP'
            : '支持5MB以内JPG、PNG、WebP',
      );
      return;
    }
    setUploading(true);
    const token = context.current;
    try {
      const urls = await Promise.all(files.map(fileData));
      if (token !== context.current || !alive.current) return;
      form.setFieldValue(field, max === 1 ? urls[0] : [...previous, ...urls]);
      setDirty(true);
    } catch {
      message.error('素材读取失败，请重试');
    } finally {
      setUploading(false);
    }
  }
  if (localState === 'no-permission')
    return <Result status="403" title="暂无查看权限" />;
  if (localState === 'error' || error)
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={<Button onClick={reloadData}>重新加载</Button>}
      />
    );
  const templateRows =
    localState === 'empty'
      ? []
      : templates
          .filter(
            (w) =>
              (!applied.id ||
                w.id.toLowerCase() === applied.id.trim().toLowerCase()) &&
              (!applied.name || w.title.includes(applied.name.trim())) &&
              (!applied.type || w.mediaType === applied.type),
          )
          .sort((a, b) => a.templateSortOrder - b.templateSortOrder);
  const popupRows =
    localState === 'empty'
      ? []
      : popup.items
          .filter(
            (p) =>
              (!applied.id ||
                p.id.toLowerCase() === applied.id.trim().toLowerCase()) &&
              (!applied.name || p.title.includes(applied.name.trim())) &&
              (!applied.status || p.status === applied.status),
          )
          .sort((a, b) => a.sort - b.sort);
  const templateColumns: ColumnsType<Template> = [
    { title: '作品 ID', dataIndex: 'id', width: 150 },
    {
      title: '封面',
      width: 90,
      render: (_, r) =>
        r.images[0] ? (
          <Image
            src={r.images[0]}
            alt={r.title}
            width={64}
            height={40}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: '标题',
      width: 210,
      render: (_, r) => (
        <>
          {r.title}
          <small className="rom-muted">{r.mediaType}</small>
        </>
      ),
    },
    { title: '分类', dataIndex: 'category', width: 130 },
    {
      title: '默认模型',
      width: 160,
      render: (_, r) =>
        readModels().find((m) => m.code === r.templateModel)?.name ||
        r.model ||
        '未绑定模型',
    },
    {
      title: '单次积分',
      width: 110,
      render: (_, r) =>
        (readModels().find((m) => m.code === r.templateModel)?.cost_points ??
          '—') + ' 积分 / 次',
    },
    { title: '模板排序', dataIndex: 'templateSortOrder', width: 100 },
    {
      title: '展示状态',
      width: 100,
      render: (_, r) => (
        <Tag
          color={r.hotTemplate && r.status === '已公开' ? 'green' : 'default'}
        >
          {r.hotTemplate && r.status === '已公开' ? '展示中' : '停用'}
        </Tag>
      ),
    },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    {
      title: '操作',
      fixed: 'right',
      width: 280,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" onClick={() => open(r)}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() =>
              setAction({
                row: r,
                label: r.hotTemplate ? '取消爆款模板' : '设置爆款模板',
              })
            }
          >
            {r.hotTemplate ? '取消爆款模板' : '设置爆款模板'}
          </Button>
          <Button
            type="link"
            danger={r.status === '已公开'}
            onClick={() =>
              setAction({
                row: r,
                label: r.status === '已公开' ? '下架' : '上架',
              })
            }
          >
            {r.status === '已公开' ? '下架' : '上架'}
          </Button>
        </Space>
      ),
    },
  ];
  const popupColumns: ColumnsType<PopupItem> = [
    { title: '子项 ID', dataIndex: 'id', width: 160 },
    { title: '标题', dataIndex: 'title', width: 140 },
    { title: '描述', dataIndex: 'description', width: 220, ellipsis: true },
    {
      title: '活动大图',
      width: 100,
      render: (_, r) => (
        <Image
          src={r.image}
          alt={r.title}
          width={72}
          height={45}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    { title: '按钮文案', dataIndex: 'buttonText', width: 140 },
    {
      title: '跳转配置',
      width: 230,
      render: (_, r) =>
        r.jumpType === 'platform' ? '平台互通 · ' + r.targetPlatform : r.link,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, r) => <Space><Switch checked={r.status === '已上架'} disabled={busy} onChange={checked => void setStatus({row:r,label:checked?'上架':'下架'})}/><span>{r.status === '已上架'?'上架':'下架'}</span></Space>,
    },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '操作',
      fixed: 'right',
      width: 130,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" onClick={() => open(r)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];
  const EditorSurface = templatePage ? Drawer : Modal;
  const models = readModels().filter(
    (m) => m.status === '1' && m.output_types.includes(outputCode(mediaType)),
  );
  const mediaPicker = (
    field: 'images' | 'references' | 'video',
    label: string,
  ) => {
    const urls =
      field === 'images'
        ? images || []
        : field === 'references'
          ? references || []
          : video
            ? [video]
            : [];
    return (
      <MediaUpload
        label={label}
        firstAsCover={field === 'images'}
        items={urls.map((url) => ({
          url,
          type: field === 'video' ? 'video' : 'image',
        }))}
        multiple={field !== 'video'}
        maxCount={field === 'video' ? 1 : 4}
        accept={
          field === 'video'
            ? 'video/mp4,video/webm,video/quicktime'
            : 'image/jpeg,image/png,image/webp'
        }
        disabled={busy || uploading}
        onFiles={(files) => upload(files, field)}
        onRemove={(i) => {
          form.setFieldValue(
            field,
            field === 'video' ? '' : urls.filter((_, n) => n !== i),
          );
          setDirty(true);
        }}
        onReorder={(from, to) => {
          const next = [...urls];
          next.splice(to, 0, next.splice(from, 1)[0]);
          form.setFieldValue(field, next);
          setDirty(true);
        }}
      />
    );
  };
  return (
    <section className="rom-root">
      {!templatePage && (
        <Form layout="inline" className="rom-settings">
          <Form.Item label="弹窗标题" required>
            <Input
              aria-label="弹窗标题"
              maxLength={80}
              value={popup.title}
              onChange={(e) => {
                setPopup((p) => ({ ...p, title: e.target.value }));
                setSettingsDirty(true);
              }}
            />
          </Form.Item>
          <Form.Item label="是否弹出">
            <Switch
              checked={popup.enabled}
              onChange={(enabled) => {
                setPopup((p) => ({ ...p, enabled }));
                setSettingsDirty(true);
              }}
            />
          </Form.Item>
          <Button onClick={reload} disabled={busy}>
            刷新
          </Button>
          <Button
            type="primary"
            disabled={!settingsDirty || busy || localState === 'loading'}
            loading={busy}
            onClick={async () => {
              if (!popup.title.trim()) {
                message.error('请输入弹窗标题');
                return;
              }
              const previous = readPopup();
              if (
                await write(
                  '保存弹窗设置',
                  'login-popup',
                  previous,
                  { title: popup.title.trim(), enabled: popup.enabled },
                  popupKey,
                  {
                    ...previous,
                    title: popup.title.trim(),
                    enabled: popup.enabled,
                  },
                )
              )
                setSettingsDirty(false);
            }}
          >
            保存设置
          </Button>
        </Form>
      )}
      <div className="rom-toolbar">
        <Form
          layout="inline"
          onFinish={() => {
            setApplied({ ...query });
            setCurrent(1);
          }}
        >
          <Form.Item label={templatePage ? '作品 ID' : '子项 ID'}>
            <Input
              aria-label={templatePage ? '作品 ID' : '子项 ID'}
              placeholder="完整 ID"
              allowClear
              value={query.id}
              onChange={(e) => setQuery((p) => ({ ...p, id: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label={templatePage ? '模板标题' : '标题关键词'}>
            <Input
              aria-label="标题关键词"
              allowClear
              value={query.name}
              onChange={(e) =>
                setQuery((p) => ({ ...p, name: e.target.value }))
              }
            />
          </Form.Item>
          {templatePage ? (
            <Form.Item label="内容类型">
              <Select
                aria-label="内容类型"
                allowClear
                placeholder="全部"
                value={query.type}
                onChange={(type) => setQuery((p) => ({ ...p, type }))}
                options={['漫剧', '图片', '视频', '文本'].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Form.Item>
          ) : (
            <Form.Item label="状态">
              <Select
                aria-label="状态"
                allowClear
                placeholder="全部"
                value={query.status}
                onChange={(status) => setQuery((p) => ({ ...p, status }))}
                options={['已上架', '已下架'].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Form.Item>
          )}
          <Space>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button
              onClick={() => {
                setQuery({
                  id: '',
                  name: '',
                  type: undefined,
                  status: undefined,
                });
                setApplied({
                  id: '',
                  name: '',
                  type: undefined,
                  status: undefined,
                });
                setCurrent(1);
              }}
            >
              重置
            </Button>
          </Space>
        </Form>
        <Button
          type="primary"
          disabled={!ready || busy || localState === 'loading'}
          onClick={() => open()}
        >
          {templatePage ? '新增官方模板' : '新建子项'}
        </Button>
      </div>
      {templatePage ? (
        <Table
          rowKey="id"
          size="small"
          columns={templateColumns}
          dataSource={templateRows}
          loading={!ready || localState === 'loading'}
          scroll={{ x: 1500 }}
          pagination={{
            current: Math.min(
              current,
              Math.max(1, Math.ceil(templateRows.length / size)),
            ),
            pageSize: size,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showQuickJumper: false,
            showTotal: (n) => `共 ${n} 条`,
            onChange: (p, s) => {
              setCurrent(s !== size ? 1 : p);
              setSize(s);
            },
          }}
        />
      ) : (
        <Table
          rowKey="id"
          size="small"
          columns={popupColumns}
          dataSource={popupRows}
          loading={!ready || localState === 'loading'}
          scroll={{ x: 1300 }}
          pagination={{
            current: Math.min(
              current,
              Math.max(1, Math.ceil(popupRows.length / size)),
            ),
            pageSize: size,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showQuickJumper: false,
            showTotal: (n) => `共 ${n} 条`,
            onChange: (p, s) => {
              setCurrent(s !== size ? 1 : p);
              setSize(s);
            },
          }}
        />
      )}
      <EditorSurface
        open={!!editor}
        title={
          templatePage
            ? creating
              ? '新增官方模板'
              : '编辑官方模板'
            : creating
              ? '新建弹窗子项'
              : '编辑弹窗子项'
        }
        {...(templatePage ? {size:760,onClose:close} : {size:760,onCancel:close,styles:{body:{maxHeight:'calc(100vh - 220px)',overflowY:'auto' as const}}})}
        mask={{ closable: false }}
        footer={
          <Space>
            <Button disabled={busy || uploading} onClick={close}>
              取消
            </Button>
            <Button
              type="primary"
              loading={busy}
              disabled={uploading}
              onClick={() => void save()}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Spin spinning={uploading}>
          <Form
            form={form}
            layout="vertical"
            disabled={busy || uploading}
            onValuesChange={() => setDirty(true)}
          >
            {!creating && (
              <Form.Item label={templatePage ? '作品 ID' : '子项 ID'}>
                <Input value={editor?.id} disabled />
              </Form.Item>
            )}
            <Form.Item
              name="title"
              label={templatePage ? '模板标题' : '标题'}
              rules={[
                { required: true, whitespace: true, message: '请输入标题' },
              ]}
            >
              <Input maxLength={templatePage ? 60 : 40} showCount />
            </Form.Item>
            {templatePage ? (
              <>
                <Form.Item
                  name="mediaType"
                  label="内容类型"
                  rules={[{ required: true }]}
                >
                  <Select
                    disabled={!creating}
                    options={['漫剧', '图片', '视频', '文本'].map((value) => ({
                      value,
                      label: value,
                    }))}
                    onChange={() => {
                      form.setFieldsValue({
                        images: [],
                        video: '',
                        textBody: '',
                        templateModel: '',
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="summary"
                  label="模板简介"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入模板简介',
                    },
                  ]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="prompt"
                  label="提示词"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入提示词',
                    },
                  ]}
                >
                  <Input.TextArea rows={5} />
                </Form.Item>
                <Form.Item
                  name="categories"
                  label="作品分类"
                  rules={[
                    {
                      required: true,
                      type: 'array',
                      min: 1,
                      message: '请选择分类',
                    },
                  ]}
                >
                  <Select mode="multiple" options={categories} />
                </Form.Item>
                <Form.Item name="topics" label="关联话题">
                  <Select mode="multiple" options={topics} />
                </Form.Item>
                <Form.Item
                  name="templateModel"
                  label="默认创作模型"
                  rules={[{ required: true, message: '请选择默认模型' }]}
                >
                  <Select
                    showSearch={{ optionFilterProp: 'label' }}
                    options={[
                      ...models.map((m) => ({ value: m.code, label: m.name })),
                      ...(modelCode && !models.some((m) => m.code === modelCode)
                        ? [
                            {
                              value: modelCode,
                              label: modelCode + '（不可用）',
                              disabled: true,
                            },
                          ]
                        : []),
                    ]}
                  />
                </Form.Item>
                <div className="rom-cost">
                  单次积分：
                  {readModels().find((m) => m.code === modelCode)
                    ?.cost_points ?? '—'}
                </div>
                <Form.Item name="scenarios" label="使用场景">
                  <Select mode="multiple" options={scenarios} />
                </Form.Item>
                <Form.Item
                  name="templateSortOrder"
                  label="模板排序"
                  rules={[
                    {
                      required: true,
                      type: 'integer',
                      min: 0,
                      message: '请输入非负整数排序',
                    },
                  ]}
                >
                  <InputNumber min={0} precision={0} />
                </Form.Item>
                {mediaType === '文本' ? (
                  <Form.Item
                    name="textBody"
                    label="文本成果"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: '请输入文本成果',
                      },
                    ]}
                  >
                    <Input.TextArea rows={6} />
                  </Form.Item>
                ) : mediaType === '视频' ? (
                  mediaPicker('video', '视频成果')
                ) : (
                  mediaPicker('images', '成果图片')
                )}
                {mediaPicker('references', '参考素材')}
              </>
            ) : (
              <>
                <Form.Item
                  name="description"
                  label="描述"
                  rules={[
                    { required: true, whitespace: true, message: '请输入描述' },
                  ]}
                >
                  <Input maxLength={80} showCount />
                </Form.Item>
                <Form.Item
                  name="image"
                  label="活动大图"
                  rules={[
                    { required: true, message: '请上传活动大图或填写图片地址' },
                  ]}
                >
                  <Input placeholder="图片地址" />
                </Form.Item>
                <MediaUpload
                  label="活动大图"
                  items={image ? [{ url: image, type: 'image' }] : []}
                  accept="image/jpeg,image/png,image/webp"
                  maxCount={1}
                  disabled={busy || uploading}
                  onFiles={(files) => upload(files, 'image')}
                  onRemove={() => {
                    form.setFieldValue('image', '');
                    setDirty(true);
                  }}
                />
                <Form.Item
                  name="buttonText"
                  label="按钮文案"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入按钮文案',
                    },
                  ]}
                >
                  <Input maxLength={24} showCount />
                </Form.Item>
                <Form.Item
                  name="jumpType"
                  label="业务类型"
                  rules={[{ required: true }]}
                >
                  <Radio.Group
                    options={[
                      { value: 'internal', label: '站内路径' },
                      { value: 'external', label: '站外链接' },
                      { value: 'platform', label: '平台互通' },
                    ]}
                    onChange={(e) =>
                      form.setFieldValue(
                        'targetPlatform',
                        e.target.value === 'platform' ? 'MakeNow' : '',
                      )
                    }
                  />
                </Form.Item>
                {jumpType === 'platform' && (
                  <Form.Item
                    name="targetPlatform"
                    label="目标平台"
                    rules={[{ required: true, message: '请选择目标平台' }]}
                  >
                    <Select
                      options={[{ value: 'MakeNow', label: 'MakeNow' }]}
                    />
                  </Form.Item>
                )}
                <Form.Item
                  name="link"
                  label={jumpType === 'platform' ? '备用链接' : '跳转链接'}
                  rules={[
                    {
                      required: jumpType !== 'platform',
                      message: '请输入跳转链接',
                    },
                  ]}
                >
                  <Input
                    maxLength={256}
                    placeholder={
                      jumpType === 'internal' ? 'C端相对路径' : 'HTTPS链接'
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="sort"
                  label="排序"
                  rules={[
                    {
                      required: true,
                      type: 'integer',
                      min: 0,
                      max: 9999,
                      message: '请输入0–9999整数',
                    },
                  ]}
                >
                  <InputNumber min={0} max={9999} precision={0} />
                </Form.Item>
                <Form.Item
                  name="status"
                  label="状态"
                  getValueProps={value=>({checked:value==='已上架'})}
                  getValueFromEvent={checked=>checked?'已上架':'已下架'}
                  rules={[{ required: true }]}
                >
                  <Switch checkedChildren="上架" unCheckedChildren="下架" />
                </Form.Item>
              </>
            )}
          </Form>
        </Spin>
      </EditorSurface>
      <Modal
        open={!!action}
        title={action?.label}
        okText="确认"
        cancelText="取消"
        confirmLoading={busy}
        okButtonProps={{
          danger: action?.label === '下架' || action?.label === '取消爆款模板',
        }}
        mask={{ closable: false }}
        onCancel={() => {
          if (!busy) setAction(null);
        }}
        onOk={() => void setStatus()}
      >
        <p>{action?.row.title}</p>
        <p>
          {templatePage
            ? action?.label === '取消爆款模板'
              ? '取消后不再进入模板库，原作品与媒体保留。'
              : action?.label === '下架'
                ? '下架后停止公开展示，原作品与媒体保留。'
                : action?.label === '上架'
                  ? '上架后恢复作品公开展示，爆款模板标记保持原配置。'
                  : '设置后进入模板库，公开状态仍由原作品决定。'
            : action?.label === '下架'
              ? '下架后子项不再出现在登录弹窗。'
              : '上架后子项可出现在登录弹窗。'}
        </p>
      </Modal>
    </section>
  );
}
