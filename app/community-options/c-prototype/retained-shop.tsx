'use client';
/* oxlint-disable next/no-img-element -- The artwork is copied from the local C-end repository. */
import { useEffect, useRef, useState } from 'react';
import { pointBalance, prototypeStore, shopRecords, type ShopRecord } from './storage';
import { readShopProducts, consumeStock, readShopSites, productAvailable, type ShopProduct } from '../b-prototype/operations-data';
import './retained-shop.css';

type Props = { page: string; state: string; go: (page: string) => void };
type Product = ShopProduct;
type Panel = 'confirm' | 'success' | 'records' | 'visit' | null;

const readRecords = (): ShopRecord[] => shopRecords().filter((item) =>
  item && typeof item.id === 'string' && typeof item.price === 'number' && ['success', 'pending', 'failed'].includes(item.status));
const returningProduct = (): Product => {
  const id = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('item');
  return readShopProducts().find((item) => item.id === id) || readShopProducts()[0];
};

export function RetainedShop({ page, state, go }: Props) {
  const desktop = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('device') === 'pc';
  const recordsPage = page === 'shop-records' || state === 'records';
  const reviewFixture = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const gated = state === 'guest' || state === 'login-expired' || (!reviewFixture && prototypeStore.getItem('cp-auth') !== '1');
  const [records, setRecords] = useState<ShopRecord[]>(readRecords);
  const [catalog,setCatalog]=useState(readShopProducts);
  const [selectedBase, setSelected] = useState<Product>(returningProduct);
  const selected={...selectedBase,...catalog.find(item=>item.id===selectedBase.id)};
  const displayGroups=readShopSites().map(site=>({site:site.name,items:catalog.filter(p=>p.siteId===site.id&&productAvailable(p))})).filter(group=>group.items.length);
  const [visitSite,setVisitSite]=useState('');
  const visit=()=>{const url=readShopSites().find(site=>site.name===(visitSite||result?.site||selected.site))?.url;return url&&url.startsWith('https://')?url:null;};
  const [panel, setPanel] = useState<Panel>(gated ? null : desktop && recordsPage ? 'records' : state === 'confirm' || (reviewFixture && ['insufficient','unavailable','failure'].includes(state)) ? 'confirm' : state === 'success' || state === 'done' ? 'success' : null);
  const [notice, setNotice] = useState(reviewFixture ? ({insufficient:'积分不足，暂时无法兑换该商品。',unavailable:'该商品暂不可兑换，积分未扣除。',failure:'兑换失败，积分未扣除。请稍后重试。'} as Record<string,string>)[state]||'' : '');
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(pointBalance);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const result = records.find((item) => item.status === 'success');
  const displayedBalance = state === 'insufficient' ? 10 : balance;
  const available = displayedBalance >= selected.price;
  const soldout = state === 'soldout' || state === 'unavailable' || !productAvailable(selected) || Number(selected.stock) <= 0;

  useEffect(()=>{
    const refresh=()=>setCatalog(readShopProducts());
    const timer=window.setTimeout(refresh,0);
    window.addEventListener('bp-operations-change',refresh);
    return()=>{window.clearTimeout(timer);window.removeEventListener('bp-operations-change',refresh);};
  },[]);

  useEffect(() => {
    const node = dialog.current;
    if (panel && node && !node.open) node.showModal();
    if (!panel && node?.open) node.close();
  }, [panel]);

  const close = () => {
    setPanel(null);
    setNotice('');
    setCopied(false);
    window.setTimeout(() => returnFocus.current?.focus(), 0);
  };
  const open = (next: Panel) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setNotice('');
    setPanel(next);
  };
  const requireLogin = (target: string) => {
    prototypeStore.setItem('cp-return', target);
    go('login');
  };
  const openProduct = (item: Product) => {
    if (gated) { requireLogin(`shop?item=${encodeURIComponent(item.id)}`); return; }
    setSelected(item);
    open('confirm');
  };
  const confirm = () => {
    if (gated) { requireLogin(`shop?item=${encodeURIComponent(selected.id)}`); return; }
    // Review states simulate distinct server outcomes. Failed/unknown outcomes never create a debit record.
    if (state === 'unknown') { setNotice('兑换结果待确认，请先查看兑换记录，避免重复提交。'); return; }
    if (state === 'failure') { setNotice('兑换失败，积分未扣除。请稍后重试。'); return; }
    if (soldout) { setNotice('该商品库存不足，积分未扣除。'); return; }
    const current = pointBalance();
    setBalance(current);
    if (current < selected.price || state === 'insufficient') { setNotice('积分不足，暂时无法兑换该商品。'); return; }
    const latest=readShopProducts();
    const stock=latest.find(item=>item.id===selected.id);
    if(!stock||!productAvailable(stock)||stock.stock<=0){setNotice('该商品暂不可兑换，积分未扣除。');setCatalog(latest);return}
    if(stock.price!==selected.price){setCatalog(latest);setNotice('商品积分条件已更新，请重新核对后确认。');return;}
    const next: ShopRecord = {
      id: `demo-${Date.now()}`, productId:selected.id, siteId:selected.siteId, name: selected.name, site: selected.site,
      price: selected.price, code: 'DEMO-NOT-VALID', status: 'success', createdAt: new Date().toISOString(),
    };
    if(!consumeStock(selected.id,next.id)){setNotice('商品暂缺货，积分未扣除。');return;}
    const updated = [next, ...readRecords()];
    prototypeStore.setItem('cp-shop-records', JSON.stringify(updated));
    setCatalog(readShopProducts());
    setRecords(updated);
    setBalance(pointBalance());
    setPanel('success');
    setNotice('');
  };
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText('DEMO-NOT-VALID');
      setCopied(true);
    } catch { setNotice('浏览器未允许复制，请手动复制演示卡密。'); }
  };
  const showRecords = () => {
    if (gated) { requireLogin(desktop ? 'shop?state=records' : 'shop-records'); return; }
    setRecords(readRecords());
    if (desktop) open('records');
    else go('shop-records');
  };
  const recordsBody = <div className="rs-records-body">
    {state === 'empty' ? <p className="rs-empty">暂无兑换记录</p> : state === 'failure' && page === 'shop-records' ? <p className="rs-empty">兑换记录暂时无法加载，请稍后重试。</p> : <>
    {state === 'pending' && <p className="rs-help">兑换结果待确认，请稍后在记录中核对。</p>}
    {records.length ? records.map((item) => <article className="rs-record" key={item.id}>
      <div><strong>{item.name}</strong><span>{item.status === 'success' ? '兑换成功' : item.status === 'pending' ? '结果待确认' : '兑换失败'} · {new Date(item.createdAt).toLocaleDateString('zh-CN')}</span></div>
      <b>{item.status === 'success' ? `−${item.price} 积分` : `所需 ${item.price} 积分`}</b>
      {item.status === 'success' && <><div className="rs-code"><span>卡密</span><code>{item.code}</code><button type="button" onClick={copyCode}>{copied ? '已复制' : '复制'}</button></div>
      <button type="button" className="rs-text-button" onClick={() => {setVisitSite(item.site);open('visit');}}>前往{item.site}</button></>}
    </article>) : <p className="rs-empty">暂无兑换记录</p>}</>}
  </div>;

  if (recordsPage && !desktop) return <section className="rs-shop rs-record-page" aria-label="兑换记录">
    <div className="rs-section-head rs-record-head"><button type="button" onClick={() => go('shop')}>返回商城</button></div>
    {gated ? <div className="rs-empty">登录后查看兑换记录 <button type="button" onClick={() => requireLogin('shop-records')}>去登录</button></div> : recordsBody}
    {notice && <output className="rs-notice">{notice}</output>}
    <dialog ref={dialog} className="rs-dialog" onClose={close} onCancel={close}><div className="rs-panel"><h2>前往产品站点</h2>{visit()?<><p>前往{visitSite||result?.site||selected.site}，兑换记录中的卡密可再次查看。</p><a href={visit()!} target="_blank" rel="noreferrer">打开产品站点</a></>:<p>兑换地址暂不可用。</p>}<button type="button" className="rs-primary" onClick={close}>知道了</button></div></dialog>
  </section>;

  return <section className="rs-shop" aria-label="AI 商城">
    <div className="rs-hero">
      <div><span className="rs-kicker">多元拾光 · 积分权益</span><h2>用积分兑换 AI产品权益</h2><p>可用积分 <strong>{gated ? '—' : displayedBalance.toLocaleString('zh-CN')}</strong></p><button type="button" onClick={showRecords}>兑换记录 <span aria-hidden="true">→</span></button></div>
      <img src="/retained/shop/store-hero.webp" alt="AI 商城创作权益" />
    </div>
    {gated && <div className="rs-gate"><span>登录后可查看积分并兑换商品。</span><button type="button" onClick={() => requireLogin('shop')}>去登录</button></div>}
    {state === 'unknown' && <div className="rs-gate"><span>兑换结果待确认，请先查看兑换记录。</span><button type="button" onClick={showRecords}>查看记录</button></div>}
    <div className="rs-section-head"><h2>可兑换商品</h2><span>{state === 'empty' ? 0 : displayGroups.reduce((total, group) => total + group.items.length, 0)} 件</span></div>
    {state === 'empty' ? <p className="rs-empty">暂无可兑换商品</p> : displayGroups.map((group) => <section className="rs-group" key={group.site} aria-label={group.site}>
      <div className="rs-group-head"><h3>{group.site}</h3><span>{group.items.length} 件</span></div>
      <div className="rs-grid">{group.items.map((item) => <article className="rs-product" key={item.id}>
        <h4>{item.name}</h4>
        <div><strong>{item.price}</strong><span> 积分</span><button type="button" disabled={item.status==='已停用'||Number(item.stock)<=0} onClick={() => openProduct(item)} aria-label={`兑换 ${item.name}`}>{item.status==='已停用'?'已停用':Number(item.stock)<=0?'暂缺货':'兑换'}</button></div>
      </article>)}</div>
    </section>)}
    <dialog ref={dialog} className="rs-dialog" onCancel={close} onClose={close} aria-label={panel === 'records' ? '兑换记录' : panel === 'success' ? '兑换成功' : panel === 'visit' ? '前往产品站点' : '确认兑换'}>
      <div className="rs-panel"><div className="rs-panel-head"><h2>{panel === 'records' ? '兑换记录' : panel === 'success' ? '兑换成功' : panel === 'visit' ? '前往产品站点' : '确认兑换'}</h2><button type="button" aria-label="关闭" onClick={close}>×</button></div>
        {panel === 'confirm' && <><div className="rs-summary"><small>{selected.site}</small><h3>{selected.name}</h3><p>{selected.description}</p></div>
          <dl className="rs-details"><div><dt>当前积分</dt><dd>{displayedBalance.toLocaleString('zh-CN')} 积分</dd></div><div><dt>兑换所需</dt><dd>{selected.price} 积分</dd></div><div><dt>兑换后余额</dt><dd>{available && state !== 'insufficient' ? `${(displayedBalance - selected.price).toLocaleString('zh-CN')} 积分` : '—'}</dd></div></dl>
          <p className="rs-help">{state==='failure'?'兑换失败，积分未扣除。请稍后再试。':state==='unavailable'?'该商品暂不可兑换。':soldout ? '该商品库存不足，无法兑换。' : !available || state === 'insufficient' ? '当前积分不足，暂时无法兑换。' : state === 'unknown' ? '兑换结果待确认，请先查看兑换记录。' : '确认后使用积分兑换。'}</p>
          <div className="rs-actions"><button type="button" onClick={close}>取消</button><button type="button" className="rs-primary" disabled={soldout || !available || state === 'insufficient' || state === 'unknown'} onClick={confirm}>确认兑换</button></div></>}
        {panel === 'success' && <><div className="rs-success"><span aria-hidden="true">✓</span><strong>{result?.name || selected.name}</strong><p>积分兑换已完成</p></div><div className="rs-code"><span>您的卡密</span><code>DEMO-NOT-VALID</code><button type="button" onClick={copyCode}>{copied ? '已复制' : '复制卡密'}</button></div><small>卡密可在兑换记录中再次查看。</small><div className="rs-actions"><button type="button" onClick={close}>继续逛商城</button><button type="button" className="rs-primary" onClick={() => open('visit')}>前往产品站点</button></div></>}
        {panel === 'records' && <>{recordsBody}<div className="rs-actions"><button type="button" onClick={close}>关闭</button></div></>}
        {panel === 'visit' && <>{visit()?<><p>前往{visitSite||result?.site||selected.site}，兑换记录中的卡密可再次查看。</p><a href={visit()!} target="_blank" rel="noreferrer">打开产品站点</a></>:<p>兑换地址暂不可用。</p>}<div className="rs-actions"><button type="button" className="rs-primary" onClick={close}>知道了</button></div></>}
        {notice && <output className="rs-notice">{notice}</output>}
      </div>
    </dialog>
  </section>;
}
