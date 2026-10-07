'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  App,
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
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
import dayjs from 'dayjs';
import {
  readShopSites,
  readShopProducts,
  readStock,
  saveShopSites,
  saveShopProducts,
  saveStock,
  type ShopSite,
  type ShopProduct,
  type StockItem,
} from './operations-data';
import {
  readOperations,
  appendLog,
  writeOperations,
  type Bucket,
  type OpRow,
} from './operations-model';
import { UserIdentity, demoUserIdentityId } from './user-identity';
import './shop-management.css';

type Tab = 'catalog' | 'inventory' | 'records';
type Editor = {
  kind: 'site' | 'product' | 'stock';
  id?: string;
  siteId?: string;
  productId?: string;
};
type RecordRow = {
  id: string;
  productId: string;
  name: string;
  points: number;
  user: string;
  method: string;
  status: string;
  createdAt: string;
  exchangedAt: string;
  source?: OpRow;
};
type RecordFilters = {
  id: string;
  productId: string;
  user: string;
  status?: string;
  range: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
};
const userId = (id: string) =>
  id.startsWith('用户 · ')
    ? id.replace('用户 · ', 'U-DEMO-')
    : id && !/^U-|^ADM-|^demo-user-/.test(id)
      ? demoUserIdentityId(id)
      : id;
const blankFilters = (): RecordFilters => ({
  id: '',
  productId: '',
  user: '',
  range: null,
});
const time = (value?: string) =>
  value && dayjs(value).isValid()
    ? dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    : '—';
const text = (value: unknown, fallback = '') =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : fallback;
const uid = (prefix: string) => prefix + '-' + crypto.randomUUID().slice(0, 8);
const statusTag = (status: string) => (
  <Tag
    color={
      ['成功', '已上架', '已兑换', '启用'].includes(status)
        ? 'green'
        : ['失败', '已下架', '未兑换', '停用'].includes(status)
          ? 'default'
          : 'blue'
    }
  >
    {status}
  </Tag>
);

export function ShopManagement({
  state,
  initialTab = 'catalog',
}: {
  state: string;
  initialTab?: Tab;
}) {
  const { message, modal } = App.useApp();
  const [tab, setTab] = useState<Tab>(initialTab),
    [sites, setSites] = useState<ShopSite[]>(readShopSites),
    [products, setProducts] = useState<ShopProduct[]>(readShopProducts),
    [stock, setStock] = useState<StockItem[]>(readStock),
    [redemptions, setRedemptions] = useState<OpRow[]>(
      () => readOperations().rows.redemptions,
    );
  const [siteId, setSiteId] = useState(() => readShopSites()[0]?.id || ''),
    [productId, setProductId] = useState(
      () =>
        readShopProducts().find((p) => p.siteId === readShopSites()[0]?.id)
          ?.id || '',
    ),
    [drawerSite, setDrawerSite] = useState<string | null>(null),
    [editor, setEditor] = useState<Editor | null>(null),
    [detail, setDetail] = useState<StockItem | null>(null),
    [dirty, setDirty] = useState(false),
    [loadingFailed, setLoadingFailed] = useState(state === 'load-failed'),
    [saving, setSaving] = useState(false),
    [filters, setFilters] = useState<RecordFilters>(blankFilters),
    [applied, setApplied] = useState<RecordFilters>(blankFilters),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(20);
  const [form] = Form.useForm();
  const bypass = useRef(false),
    failedOnce = useRef(false),
    mutation = useRef<{ bucket: Bucket; id: string } | null>(null);
  const denied = state === 'permission-denied';
  const refresh = useCallback(() => {
    setSites(readShopSites());
    setProducts(readShopProducts());
    setStock(readStock());
    setRedemptions(readOperations().rows.redemptions);
  }, []);
  useEffect(() => {
    window.addEventListener('bp-operations-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('bp-operations-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);
  const closeEditor = () => {
    if (saving) return;
    const close = () => {
      setEditor(null);
      setDirty(false);
    };
    if (dirty)
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: close,
      });
    else close();
  };
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const navigate = (e: Event) => {
      if (bypass.current || (!dirty && !saving)) return;
      e.preventDefault();
      if (saving) {
        message.warning('正在保存，请稍候');
        return;
      }
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          bypass.current = true;
          setDirty(false);
          setEditor(null);
          (e as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    window.addEventListener('beforeunload', unload);
    window.addEventListener('prototype-before-navigate', navigate);
    return () => {
      window.removeEventListener('beforeunload', unload);
      window.removeEventListener('prototype-before-navigate', navigate);
    };
  }, [dirty, saving, message, modal]);
  const open = (next: Editor) => {
    bypass.current = false;
    failedOnce.current = false;
    form.resetFields();
    if (next.kind === 'site')
      form.setFieldsValue(
        sites.find((s) => s.id === next.id) || {
          name: '',
          url: '',
          remark: '',
        },
      );
    if (next.kind === 'product') {
      const p = products.find((p) => p.id === next.id);
      form.setFieldsValue(
        p
          ? {
              ...p,
              start: p.start ? dayjs(p.start) : null,
              end: p.end ? dayjs(p.end) : null,
            }
          : { name: '', price: null, description: '', status: '可兑换' },
      );
    }
    setDirty(false);
    setEditor(next);
  };
  const attempt = async (action: () => void, success: string) => {
    if (denied || saving) return false;
    setSaving(true);
    try {
      if (state === 'save-failed' && !failedOnce.current) {
        failedOnce.current = true;
        throw new Error('保存失败，请稍后重试');
      }
      mutation.current = null;
      action();
      if (mutation.current) {
        const entry = mutation.current as { bucket: Bucket; id: string };
        writeOperations(
          appendLog(readOperations(), entry.bucket, entry.id, success, ''),
        );
      }
      refresh();
      message.success(success);
      return true;
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '操作失败，请稍后重试',
      );
      return false;
    } finally {
      setSaving(false);
    }
  };
  const save = async () => {
    if (!editor) return;
    try {
      const values = await form.validateFields();
      const ok = await attempt(
        () => {
          if (editor.kind === 'site') {
            const next: ShopSite = {
              id: editor.id || uid('site'),
              name: values.name.trim(),
              url: values.url.trim(),
              remark: values.remark?.trim() || '',
            };
            mutation.current = { bucket: 'sites', id: next.id };
            const current = readShopSites();
            saveShopSites(
              editor.id
                ? current.map((s) => (s.id === editor.id ? next : s))
                : [...current, next],
            );
          } else if (editor.kind === 'product') {
            if (!readShopSites().some((s) => s.id === editor.siteId))
              throw new Error('所属站点已不存在，请关闭后重试');
            const current = readShopProducts(),
              prior = current.find((p) => p.id === editor.id);
            const next: ShopProduct & { createdAt?: string } = {
              ...prior,
              id: editor.id || uid('product'),
              createdAt:
                (prior as (ShopProduct & { createdAt?: string }) | undefined)
                  ?.createdAt ||
                (editor.id ? undefined : new Date().toISOString()),
              name: values.name.trim(),
              price: values.price,
              stock: prior?.stock || 0,
              status: values.status,
              description: values.description?.trim() || '',
              siteId: editor.siteId!,
              site: sites.find((s) => s.id === editor.siteId)?.name || '',
              delivery: prior?.delivery || '卡密',
              start: values.start?.toISOString() || undefined,
              end: values.end?.toISOString() || undefined,
            };
            mutation.current = { bucket: 'products', id: next.id };
            saveShopProducts(
              editor.id
                ? current.map((p) => (p.id === editor.id ? next : p))
                : [...current, next],
            );
          } else {
            if (!readShopProducts().some((p) => p.id === editor.productId))
              throw new Error('所属产品已不存在，请关闭后重试');
            const codes = [
              ...new Set(
                String(values.codes)
                  .split(/[\n,]/)
                  .map((c) => c.trim())
                  .filter(Boolean),
              ),
            ];
            if (!codes.length) throw new Error('请至少输入一条卡密');
            if (codes.some((c) => !/^DEMO-[a-z\d_-]+$/i.test(c)))
              throw new Error('请使用 DEMO- 开头的虚构卡密');
            const current = readStock();
            if (codes.some((c) => current.some((r) => r.code === c)))
              throw new Error('卡密已存在，请检查后重试');
            mutation.current = { bucket: 'stock', id: editor.productId! };
            saveStock([
              ...current,
              ...codes.map((code) => ({
                id: uid('card'),
                productId: editor.productId!,
                code,
                status: '可用' as const,
                createdAt: new Date().toISOString(),
              })),
            ]);
            setPage(1);
          }
        },
        editor.kind === 'stock' ? '卡密已新增' : '保存成功',
      );
      if (ok) {
        setDirty(false);
        setEditor(null);
      }
    } catch {
      /* Form displays field validation without clearing input. */
    }
  };
  const confirmDelete = (
    kind: 'site' | 'product' | 'stock',
    id: string,
    name: string,
  ) => {
    failedOnce.current = false;
    modal.confirm({
      title:
        '确认删除' +
        { site: '站点', product: '产品', stock: '卡密' }[kind] +
        '？',
      content: name,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        const ok = await attempt(() => {
          mutation.current = {
            bucket:
              kind === 'site'
                ? 'sites'
                : kind === 'product'
                  ? 'products'
                  : 'stock',
            id,
          };
          if (kind === 'site') {
            if (readShopProducts().some((p) => p.siteId === id))
              throw new Error('站点仍有产品，请先处理产品');
            saveShopSites(readShopSites().filter((s) => s.id !== id));
          } else if (kind === 'product') {
            if (
              readStock().some((s) => s.productId === id) ||
              readOperations().rows.redemptions.some((r) => r.productId === id)
            )
              throw new Error('产品仍有关联卡密或兑换记录，请先处理');
            saveShopProducts(readShopProducts().filter((p) => p.id !== id));
          } else {
            const current = readStock();
            if (current.find((s) => s.id === id)?.status !== '可用')
              throw new Error('该卡密已兑换，不能删除');
            saveStock(current.filter((s) => s.id !== id));
          }
        }, '删除成功');
        if (!ok) throw new Error('delete failed');
      },
    });
  };
  const siteProducts = products.filter((p) => p.siteId === siteId),
    selectedProduct = products.find((p) => p.id === productId),
    drawerProducts = products.filter((p) => p.siteId === drawerSite);
  const inventory =
    state === 'empty'
      ? []
      : stock.filter((s) => s.productId === productId && s.status === '可用');
  const records: RecordRow[] = [
    ...redemptions.map((r) => ({
      id: r.id,
      productId: text(r.productId),
      name: r.name,
      points: Number(r.price || 0),
      user: text(r.user, '—'),
      method:
        text(r.redeemType) ||
        text(r.redeem_type_str) ||
        (Number(r.price) > 0 ? '积分兑换' : r.type),
      status: r.status === '未兑换' ? '未兑换' : '已兑换',
      createdAt:
        stock.find((s) => s.recordId === r.id)?.createdAt || text(r.createdAt),
      exchangedAt: text(r.at),
      source: r,
    })),
    ...stock
      .filter(
        (s) =>
          s.status === '可用' ||
          (s.status === '已兑换' &&
            !redemptions.some((r) => r.id === s.recordId)),
      )
      .map((s) => ({
        id: s.recordId || s.id,
        productId: s.productId,
        name: products.find((p) => p.id === s.productId)?.name || s.productId,
        points: 0,
        user: '—',
        method: s.status === '可用' ? '未兑换' : '卡密兑换',
        status: s.status === '可用' ? '未兑换' : '已兑换',
        createdAt: s.createdAt,
        exchangedAt: s.exchangedAt || '',
      })),
  ];
  const filteredRecords =
    state === 'empty'
      ? []
      : records.filter(
          (r) =>
            (!applied.id ||
              r.id.toLowerCase() === applied.id.trim().toLowerCase()) &&
            (!applied.productId || r.productId === applied.productId.trim()) &&
            (!applied.user ||
              r.user === applied.user.trim() ||
              (r.user !== '—' && userId(r.user) === applied.user.trim())) &&
            (!applied.status ||
              r.method === applied.status ||
              r.status === applied.status) &&
            (!applied.range?.[0] ||
              (!!r.exchangedAt &&
                dayjs(r.exchangedAt).valueOf() >=
                  applied.range[0].startOf('day').valueOf())) &&
            (!applied.range?.[1] ||
              (!!r.exchangedAt &&
                dayjs(r.exchangedAt).valueOf() <=
                  applied.range[1].endOf('day').valueOf())),
        );
  const pagination = {
    current: page,
    pageSize,
    showSizeChanger: true,
    pageSizeOptions: [20, 50, 100],
    showQuickJumper: false,
    onChange: (p: number, s: number) => {
      setPage(s !== pageSize ? 1 : p);
      setPageSize(s);
    },
  };
  const productColumns = [
    { title: 'ID', dataIndex: 'id', width: 130 },
    { title: '产品名称', dataIndex: 'name', width: 160 },
    { title: '积分价格', dataIndex: 'price', width: 100 },
    { title: '可用库存', dataIndex: 'stock', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 95,
      render: (s: string) => statusTag(s === '可兑换' ? '启用' : '停用'),
    },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: time },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 170,
      render: (_: unknown, p: ShopProduct) => (
        <Space size={0}>
          <Button
            type="link"
            disabled={denied}
            onClick={() =>
              open({ kind: 'product', id: p.id, siteId: p.siteId })
            }
          >
            编辑
          </Button>
          <Button
            danger
            type="link"
            disabled={denied}
            onClick={() => confirmDelete('product', p.id, p.name)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  if (denied) return <Result status="403" title={initialTab === 'records' ? '没有兑换记录访问权限' : '没有商城管理权限'} />;
  return (
    <section className="shop-management">
      {initialTab !== 'records' && <div className="shop-tab-shell">
        <Tabs
          activeKey={tab}
          onChange={(t) => {
            setTab(t as Tab);
            setPage(1);
          }}
          items={[
            { key: 'catalog', label: '站点与产品' },
            { key: 'inventory', label: '卡密库存' },
            { key: 'records', label: '兑换记录' },
          ]}
        />
        {tab === 'catalog' && (
          <Button
            type="primary"
            disabled={denied || loadingFailed}
            onClick={() => open({ kind: 'site' })}
          >
            新增站点
          </Button>
        )}
      </div>}
      {loadingFailed ? (
        <Alert
          type="error"
          showIcon
          title="加载失败，请稍后重试"
          action={
            <Button
              onClick={() => {
                refresh();
                setLoadingFailed(false);
              }}
            >
              重新加载
            </Button>
          }
        />
      ) : (
        <>
          {tab === 'catalog' && (
            <div className="shop-panel">
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={state === 'empty' ? [] : sites}
                scroll={{ x: 840 }}
                columns={[
                  { title: 'ID', dataIndex: 'id', width: 110 },
                  { title: '站点名称', dataIndex: 'name', width: 180 },
                  {
                    title: '域名',
                    dataIndex: 'url',
                    width: 240,
                    ellipsis: true,
                  },
                  {
                    title: '产品数量',
                    key: 'count',
                    width: 100,
                    render: (_: unknown, s: ShopSite) => (
                      <Button type="link" onClick={() => setDrawerSite(s.id)}>
                        {products.filter((p) => p.siteId === s.id).length}
                      </Button>
                    ),
                  },
                  {
                    title: '备注',
                    dataIndex: 'remark',
                    ellipsis: true,
                    render: (s: string) => s || '—',
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 130,
                    render: (_: unknown, s: ShopSite) => (
                      <Space size={0}>
                        <Button
                          type="link"
                          disabled={denied}
                          onClick={() => open({ kind: 'site', id: s.id })}
                        >
                          编辑
                        </Button>
                        <Button
                          type="link"
                          danger
                          disabled={denied}
                          onClick={() => confirmDelete('site', s.id, s.name)}
                        >
                          删除
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </div>
          )}
          {tab === 'inventory' && (
            <>
              <div className="shop-panel shop-toolbar">
                <Space wrap size={8}>
                  <Select
                    aria-label="选择站点"
                    placeholder="选择站点"
                    allowClear
                    value={siteId || undefined}
                    style={{ width: 180 }}
                    options={sites.map((s) => ({ label: s.name, value: s.id }))}
                    onChange={(id) => {
                      setSiteId(id || '');
                      setProductId(
                        products.find((p) => p.siteId === id)?.id || '',
                      );
                      setPage(1);
                    }}
                  />
                  <Select
                    aria-label="选择产品"
                    placeholder="选择产品"
                    allowClear
                    disabled={!siteId}
                    value={productId || undefined}
                    style={{ width: 180 }}
                    options={siteProducts.map((p) => ({
                      label: p.name,
                      value: p.id,
                    }))}
                    onChange={(id) => {
                      setProductId(id || '');
                      setPage(1);
                    }}
                  />
                  <Button
                    type="primary"
                    disabled={!productId}
                    onClick={() => {
                      refresh();
                      setPage(1);
                    }}
                  >
                    搜索
                  </Button>
                  <Button
                    onClick={() => {
                      const first = sites[0]?.id || '';
                      setSiteId(first);
                      setProductId(
                        products.find((p) => p.siteId === first)?.id || '',
                      );
                      setPage(1);
                    }}
                  >
                    重置
                  </Button>
                </Space>
                <Button
                  type="primary"
                  disabled={!productId || denied}
                  onClick={() => open({ kind: 'stock', productId })}
                >
                  新增卡密
                </Button>
              </div>
              <div className="shop-panel">
                <Table
                  size="small"
                  rowKey="id"
                  dataSource={inventory}
                  pagination={pagination}
                  scroll={{ x: 1380 }}
                  locale={{
                    emptyText: (
                      <Empty
                        description={
                          productId ? '暂无未兑换卡密' : '请选择站点和产品'
                        }
                      />
                    ),
                  }}
                  columns={[
                    { title: 'ID', dataIndex: 'id', width: 130 },
                    {
                      title: '卡密',
                      dataIndex: 'code',
                      width: 210,
                      ellipsis: true,
                      render: (code: string) =>
                        code.startsWith('DEMO-') ? code : '[CARD_CODE]',
                    },
                    {
                      title: '站点',
                      key: 'site',
                      width: 140,
                      render: () =>
                        sites.find((s) => s.id === siteId)?.name || '—',
                    },
                    {
                      title: '产品',
                      key: 'product',
                      width: 160,
                      render: () => selectedProduct?.name || '—',
                    },
                    {
                      title: '库存状态',
                      dataIndex: 'status',
                      width: 100,
                      render: () => <Tag color="green">未兑换</Tag>,
                    },
                    {
                      title: '兑换方式',
                      key: 'method',
                      width: 100,
                      render: () => '—',
                    },
                    {
                      title: '实扣积分',
                      key: 'points',
                      width: 100,
                      render: () => '—',
                    },
                    {
                      title: '兑换用户',
                      key: 'user',
                      width: 130,
                      render: () => '—',
                    },
                    {
                      title: '兑换时间',
                      dataIndex: 'exchangedAt',
                      width: 170,
                      render: time,
                    },
                    {
                      title: '入库时间',
                      dataIndex: 'createdAt',
                      width: 170,
                      render: time,
                    },
                    {
                      title: '操作',
                      key: 'action',
                      fixed: 'right',
                      width: 130,
                      render: (_: unknown, s: StockItem) => (
                        <Space size={0}>
                          <Button type="link" onClick={() => setDetail(s)}>
                            查看
                          </Button>
                          <Button
                            type="link"
                            danger
                            disabled={denied}
                            onClick={() => confirmDelete('stock', s.id, s.code)}
                          >
                            删除
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </div>
            </>
          )}
          {tab === 'records' && (
            <>
              <div className="shop-panel shop-filter">
                <Form layout="inline">
                  <Form.Item label="记录 ID">
                    <Input
                      placeholder="请输入完整记录 ID"
                      allowClear
                      value={filters.id}
                      onChange={(e) =>
                        setFilters({ ...filters, id: e.target.value })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="产品 ID">
                    <Input
                      placeholder="请输入产品 ID"
                      allowClear
                      value={filters.productId}
                      onChange={(e) =>
                        setFilters({ ...filters, productId: e.target.value })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="兑换用户">
                    <Input
                      placeholder="请输入用户 ID"
                      allowClear
                      value={filters.user}
                      onChange={(e) =>
                        setFilters({ ...filters, user: e.target.value })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="兑换状态">
                    <Select
                      placeholder="全部状态"
                      allowClear
                      value={filters.status}
                      style={{ width: 140 }}
                      options={[
                        '未兑换',
                        '积分兑换',
                        '卡密兑换',
                        '成功',
                        '兑换处理中',
                        '返还处理中',
                        '失败',
                      ].map((s) => ({ label: s, value: s }))}
                      onChange={(s) => setFilters({ ...filters, status: s })}
                    />
                  </Form.Item>
                  <Form.Item label="兑换时间">
                    <DatePicker.RangePicker
                      value={filters.range}
                      onChange={(range) => setFilters({ ...filters, range })}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => {
                          setApplied(filters);
                          setPage(1);
                        }}
                      >
                        查询
                      </Button>
                      <Button
                        onClick={() => {
                          setFilters(blankFilters());
                          setApplied(blankFilters());
                          setPage(1);
                        }}
                      >
                        重置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
              <div className="shop-panel">
                <Table
                  size="small"
                  rowKey="id"
                  dataSource={filteredRecords}
                  pagination={pagination}
                  scroll={{ x: 1150 }}
                  columns={[
                    { title: '记录 ID', dataIndex: 'id', width: 160 },
                    { title: '产品', dataIndex: 'name', width: 170 },
                    { title: '实扣积分', dataIndex: 'points', width: 100 },
                    {
                      title: '兑换用户',
                      dataIndex: 'user',
                      width: 160,
                      render: (user: string) =>
                        user === '—' ? '—' : <UserIdentity id={user} />,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      width: 120,
                      render: statusTag,
                    },
                    {
                      title: '入库时间',
                      dataIndex: 'createdAt',
                      width: 170,
                      render: time,
                    },
                    {
                      title: '兑换时间',
                      dataIndex: 'exchangedAt',
                      width: 170,
                      render: time,
                    },
                  ]}
                />
              </div>
            </>
          )}
        </>
      )}
      <Drawer
        title={
          '产品列表 - ' + (sites.find((s) => s.id === drawerSite)?.name || '—')
        }
        open={!!drawerSite}
        onClose={() => setDrawerSite(null)}
        size={820}
        mask={{ closable: false }}
        destroyOnHidden
      >
        <div className="shop-drawer-toolbar">
          <Button
            type="primary"
            disabled={denied}
            onClick={() => open({ kind: 'product', siteId: drawerSite! })}
          >
            新增产品
          </Button>
        </div>
        <Table
          size="small"
          rowKey="id"
          dataSource={drawerProducts}
          columns={productColumns}
          scroll={{ x: 1200 }}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: [20, 50, 100],
            showQuickJumper: false,
          }}
        />
      </Drawer>
      <Modal
        title={
          editor?.kind === 'site'
            ? editor.id
              ? '编辑站点'
              : '新增站点'
            : editor?.kind === 'product'
              ? editor.id
                ? '编辑产品'
                : '新增产品'
              : '新增卡密'
        }
        open={!!editor}
        onCancel={closeEditor}
        onOk={() => void save()}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
        mask={{ closable: false }}
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => setDirty(true)}
        >
          {editor?.kind === 'site' ? (
            <>
              <Form.Item
                name="name"
                label="站点名称"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入站点名称',
                  },
                ]}
              >
                <Input placeholder="请输入站点名称" />
              </Form.Item>
              <Form.Item
                name="url"
                label="站点域名"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入站点域名',
                  },
                  {
                    validator: (_, value) => {
                      const v = String(value || '').trim();
                      if (!v) return Promise.resolve();
                      if (
                        /^(?:localhost|(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,63})(?::\d{1,5})?\/?$/i.test(
                          v,
                        )
                      )
                        return Promise.resolve();
                      try {
                        const u = new URL(v);
                        if (
                          ['http:', 'https:'].includes(u.protocol) &&
                          u.hostname
                        )
                          return Promise.resolve();
                      } catch {}
                      return Promise.reject(
                        new Error('请输入有效的站点域名或 HTTP(S) 地址'),
                      );
                    },
                  },
                ]}
              >
                <Input placeholder="请输入站点域名" />
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={3} maxLength={200} showCount />
              </Form.Item>
            </>
          ) : editor?.kind === 'product' ? (
            <>
              <Form.Item
                name="name"
                label="产品名称"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入产品名称',
                  },
                ]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
              <Form.Item
                name="price"
                label="积分价格"
                rules={[
                  { required: true, message: '请输入积分价格' },
                  {
                    validator: (_, v) =>
                      Number.isInteger(v) && v >= 1
                        ? Promise.resolve()
                        : Promise.reject(new Error('积分价格必须为正整数')),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="请输入兑换所需积分"
                />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  options={[
                    { label: '启用', value: '可兑换' },
                    { label: '停用', value: '已停用' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="start" label="有效期开始">
                <DatePicker
                  showTime
                  placeholder="开始时间（可选）"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                name="end"
                label="有效期结束"
                dependencies={['start']}
                rules={[
                  {
                    validator: (_, end) =>
                      !end ||
                      !form.getFieldValue('start') ||
                      end.valueOf() >= form.getFieldValue('start').valueOf()
                        ? Promise.resolve()
                        : Promise.reject(new Error('结束时间不能早于开始时间')),
                  },
                ]}
              >
                <DatePicker
                  showTime
                  placeholder="结束时间（可选）"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item label="所属产品">
                <Input
                  disabled
                  value={products.find((p) => p.id === editor?.productId)?.name}
                />
              </Form.Item>
              <Form.Item
                name="codes"
                label="卡密内容"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入卡密内容',
                  },
                ]}
              >
                <Input.TextArea
                  rows={9}
                  placeholder="每行输入一条 DEMO- 开头的虚构卡密"
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
      <Modal
        title="卡密详情"
        open={!!detail}
        footer={null}
        onCancel={() => setDetail(null)}
      >
        {detail && (
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              { key: 'id', label: '卡密 ID', children: detail.id },
              {
                key: 'product',
                label: '所属产品',
                children:
                  products.find((p) => p.id === detail.productId)?.name ||
                  detail.productId,
              },
              {
                key: 'code',
                label: '完整卡密',
                children: (
                  <Space>
                    <span className="shop-code">
                      {detail.code.startsWith('DEMO-')
                        ? detail.code
                        : '[CARD_CODE]'}
                    </span>
                    <Button
                      type="link"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            detail.code.startsWith('DEMO-')
                              ? detail.code
                              : '[CARD_CODE]',
                          );
                          message.success('卡密已复制');
                        } catch {
                          message.error('复制失败，请手动复制');
                        }
                      }}
                    >
                      复制
                    </Button>
                  </Space>
                ),
              },
              {
                key: 'status',
                label: '库存状态',
                children: detail.status === '可用' ? '未兑换' : '已兑换',
              },
              {
                key: 'created',
                label: '入库时间',
                children: time(detail.createdAt),
              },
            ]}
          />
        )}
      </Modal>
    </section>
  );
}
