'use client';
import {useFeedbackExpiry} from './transient-feedback';
/* oxlint-disable next/no-img-element -- The artwork is copied from the local C-end repository. */
import { useEffect, useRef, useState } from 'react';
import { pointBalance, prototypeStore, shopRecords, type ShopRecord } from './storage';
import { readShopProducts, consumeStock, readShopSites, productAvailable, type ShopProduct } from '../b-prototype/operations-data';
import './retained-shop.css';

type Props = { page: string; state: string; go: (page: string) => void };
type Product = ShopProduct;
type Panel = 'confirm' | 'success' | 'records' | null;

const readRecords = (): ShopRecord[] => shopRecords().filter((item) =>
  item && typeof item.id === 'string' && typeof item.price === 'number' && ['success', 'pending', 'failed'].includes(item.status))
  .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || a.id.localeCompare(b.id));
const returningProduct = (): Product => {
  const id = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('item');
  return readShopProducts().find((item) => item.id === id) || readShopProducts()[0];
};

// Display-only fixtures never enter the debit ledger or consume stock.
const displayRecords = (): ShopRecord[] => {
  const products = readShopProducts();
  if (!products.length) return readRecords();
  const fixtures = Array.from({length: 6}, (_, index): ShopRecord => {
    const product = products[index % products.length];
    return {id:`sample-exchange-${index}`, productId:product.id, siteId:product.siteId, name:product.name, site:product.site, price:product.price, code:`DEMO-NOT-VALID-${index + 1}`, status:'success', createdAt:`2026-10-0${2 - Math.floor(index / 3)}T0${9 - index}:20:00+08:00`};
  });
  const exceptions:ShopRecord[]= ['pending','refund-pending','refunded','expired'].map((kind,index)=>({id:'sample-settlement-'+kind,name:products[0].name,site:products[0].site,siteId:products[0].siteId,productId:products[0].id,price:products[0].price,code:'',status:index===0?'pending':'failed',createdAt:'2026-10-03T08:0'+index+':00+08:00'}));
  return [...readRecords(), ...exceptions, ...fixtures].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
};

export function RetainedShop({ page, state, go }: Props) {
  const exchangePage = page === 'shop-exchange';
  const exchangeState = state.replace(/^exchange-/, '');
  const desktop = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('device') === 'pc';
  const recordsPage = page === 'shop-records' || state === 'records';
  const reviewFixture = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const gated = state === 'guest' || state === 'login-expired' || (!reviewFixture && prototypeStore.getItem('cp-auth') !== '1');
  const [records, setRecords] = useState<ShopRecord[]>(displayRecords);
  const [catalog,setCatalog]=useState(readShopProducts);
  const [selectedBase, setSelected] = useState<Product>(returningProduct);
  const selected={...selectedBase,...catalog.find(item=>item.id===selectedBase.id)};
  const displayGroups=readShopSites().map(site=>({site:site.name,siteId:site.id,items:catalog.filter(p=>p.siteId===site.id&&productAvailable(p)).sort((a,b)=>a.price-b.price)})).filter(group=>group.items.length);
  const siteUrl = (site: string, siteId?: string) => {
    const raw = readShopSites().find(item => siteId ? item.id === siteId : item.name === site)?.url;
    try { const url = new URL(raw || ''); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
  };
  const [panel, setPanel] = useState<Panel>(gated ? null : desktop && recordsPage ? 'records' : exchangePage ? exchangeState === 'success' ? 'success' : 'confirm' : state === 'confirm' || (reviewFixture && ['insufficient','unavailable','failure'].includes(state)) ? 'confirm' : state === 'success' || state === 'done' ? 'success' : null);
  const [notice, setNotice] = useState(reviewFixture ? ({insufficient:'积分不足，暂时无法兑换该商品。',unavailable:'该商品暂不可兑换，积分未扣除。',failure:'兑换失败，积分未扣除。请稍后重试。'} as Record<string,string>)[state]||'' : '');
  const [copied, setCopied] = useState<string | null>(null);
  useFeedbackExpiry(copied,()=>setCopied(null),2000);
  const [recordLimit, setRecordLimit] = useState(5);
  const recordContinuation = useRef<HTMLDivElement>(null);
  const [recordsRetried, setRecordsRetried] = useState(false);
  const submitted = useRef(false);
  const [balance, setBalance] = useState(pointBalance);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const result = records.find((item) => item.status === 'success' && item.productId === selected.id);
  const resultUrl = siteUrl(result?.site || selected.site, result?.siteId || selected.siteId);
  const visibleRecords = records.slice(0, recordLimit);
  const hasMoreRecords = recordLimit < records.length;
  const displayedBalance = exchangeState === 'insufficient' ? Math.max(0, selected.price - 1) : exchangePage ? Math.max(balance, selected.price + 50) : balance;
  const available = displayedBalance >= selected.price;
  const validPrice = Number.isFinite(selected.price) && selected.price >= 0;
  const soldout = ['soldout','unavailable'].includes(exchangeState) || !productAvailable(selected) || Number(selected.stock) <= 0;
  const blockedExchange = ['submitting','unknown'].includes(exchangeState);
  const panelTitle = panel === 'records' ? '兑换记录' : panel === 'success' ? '兑换成功' : exchangeState === 'failure' ? '兑换失败' : exchangeState === 'submitting' ? '兑换中' : exchangeState === 'unknown' ? '兑换结果待确认' : '确认兑换';

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

  useEffect(() => {
    const node = recordContinuation.current;
    if (!node || !hasMoreRecords || (!recordsPage && panel !== 'records')) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        setRecordLimit(limit => Math.min(limit + 5, records.length));
      }
    }, {root: node.closest('.rs-record-dialog') ? node.closest('.rs-records-body') : null, rootMargin: '160px'});
    observer.observe(node);
    return () => observer.disconnect();
  }, [panel, recordsPage, recordLimit, records.length, hasMoreRecords]);

  const close = () => {
    setPanel(null);
    setNotice('');
    setCopied(null);
    window.setTimeout(() => returnFocus.current?.focus(), 0);
  };
  const open = (next: Panel) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setNotice('');
    setCopied(null);
    setPanel(next);
  };
  const requireLogin = (target: string) => {
    prototypeStore.setItem('cp-return', target);
    go('login');
  };
  const openProduct = (item: Product) => {
    if (gated) { requireLogin(`shop?item=${encodeURIComponent(item.id)}`); return; }
    setSelected(item);
    submitted.current = false;
    open('confirm');
  };
  const confirm = () => {
    if (submitted.current || panel !== 'confirm') return;
    if (exchangePage) {
      if (blockedExchange || soldout || !available) return;
      submitted.current = true;
      setPanel('success');
      setNotice('');
      return;
    }
    if (!validPrice) {setNotice('商品积分条件暂不可用，请稍后再试。');return;}
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
    submitted.current = true;
    const next: ShopRecord = {
      id: `demo-${Date.now()}`, productId:selected.id, siteId:selected.siteId, name: selected.name, site: selected.site,
      price: selected.price, code: 'DEMO-NOT-VALID', status: 'success', createdAt: new Date().toISOString(),
    };
    if(!consumeStock(selected.id,next.id)){submitted.current = false;setNotice('商品暂缺货，积分未扣除。');return;}
    const updated = [next, ...readRecords()];
    prototypeStore.setItem('cp-shop-records', JSON.stringify(updated));
    setCatalog(readShopProducts());
    setRecords(displayRecords());
    setBalance(pointBalance());
    setPanel('success');
    setNotice('');
  };
  const copyCode = async (item: Pick<ShopRecord, 'id' | 'code'>) => {
    if (!item.code?.trim()) return;
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(item.id);
      setNotice('');
    } catch { setNotice('浏览器未允许复制，请手动复制演示卡密。'); }
  };
  const showRecords = () => {
    if (gated) { requireLogin(desktop ? 'shop?state=records' : 'shop-records'); return; }
    setRecords(displayRecords());
    setRecordLimit(5);
    if (desktop) open('records');
    else go('shop-records');
  };
  const recordsBody = <div className="rs-records-body">
    {state === 'empty' ? <p className="rs-empty">暂无兑换记录</p> : state === 'failure' && recordsPage && !recordsRetried ? <div className="rs-empty"><p>兑换记录暂时无法加载</p><button type="button" onClick={() => {setRecords(displayRecords());setRecordsRetried(true);}}>重新加载</button></div> : <>
    <div className="rs-record-summary">共 {records.length} 条兑换记录</div>
    {state === 'pending' && <p className="rs-help">兑换结果待确认，请稍后在记录中核对。</p>}
    {records.length ? visibleRecords.map((item) => <article className="rs-record" key={item.id}>
      {desktop ? <>
      <div className="rs-record-icon" aria-hidden="true">{item.siteId==='dy'?<span>¥<b>{item.productId==='dy-two'?2:item.productId==='dy-five'?5:item.productId==='dy-ten'?10:'—'}</b></span>:<img src="/home-prototype/icons/box-3-line.svg" alt="" />}</div>
      <div className="rs-record-info"><strong>{item.name}</strong><span>{item.site} · {new Date(item.createdAt).toLocaleString('zh-CN', {timeZone:'Asia/Shanghai', year:'numeric',month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} · <span className="rs-record-status">{item.status === 'success' ? '兑换成功' : item.status === 'pending' ? '结果待确认' : '兑换失败'}</span></span></div>
      <b>{item.status === 'success' ? `−${item.price} 积分` : `原扣除 ${item.price} 积分`}</b>
      {item.status === 'success' && <><div className="rs-record-actions"><div className="rs-code"><img src="/home-prototype/icons/file-text-line.svg" alt="" /><code>{item.code || '暂未返回，请稍后查看'}</code><button className="rs-record-copy" type="button" disabled={!item.code?.trim()} onClick={() => copyCode(item)}><img src="/home-prototype/icons/file-copy-line.svg" alt="" />{copied === item.id ? '已复制' : '复制'}</button></div>
      {siteUrl(item.site, item.siteId) && <a className="rs-text-button" href={siteUrl(item.site, item.siteId)!} target="_blank" rel="noopener noreferrer">前往使用 <img src="/home-prototype/icons/arrow-right-line.svg" alt="" /></a>}</div></>}
      </> : <>
      <div><strong>{item.name}</strong><span>{item.site} · {item.status === 'success' ? '兑换成功' : item.status === 'pending' ? '结果待确认' : '兑换失败'} · {new Date(item.createdAt).toLocaleString('zh-CN', {timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</span></div>
      <b>{item.status === 'success' ? `−${item.price} 积分` : `原扣除 ${item.price} 积分`}</b>
      {item.status === 'success' && <><div className="rs-code"><span>卡密</span><code>{item.code || '暂未返回，请稍后查看'}</code><button type="button" disabled={!item.code?.trim()} onClick={()=>copyCode(item)}>{copied === item.id ? '已复制' : '复制卡密'}</button></div>{siteUrl(item.site,item.siteId)&&<a className="rs-text-button" href={siteUrl(item.site,item.siteId)!} target="_blank" rel="noopener noreferrer">前往{item.site} ↗</a>}</>}
      </>}
      {item.status!=='success'&&<div className="rs-settlement"><p>{item.status==='pending'?'兑换结果确认中 · 积分已扣除，请查询原记录，不要重复兑换。':item.id.endsWith('refund-pending')?'兑换失败 · 积分返还处理中。':item.id.endsWith('expired')?'兑换失败 · 已返还，恢复可用0积分。原积分已过期（北京时间10月4日00:00）。':item.id.endsWith('refunded')?'兑换失败 · 已返还，恢复可用'+item.price+'积分；沿用原有效期。':'兑换失败，请核对原记录的积分结算结果。'}</p>{item.status==='pending'&&<button onClick={()=>setNotice('兑换结果仍在确认中，请保留原记录，稍后再次查询。')}>查询原记录</button>}</div>}
    </article>) : <p className="rs-empty">暂无兑换记录</p>}
    {records.length > 0 && <div ref={recordContinuation} className="rs-record-continuation"><span>{hasMoreRecords ? '继续下滑加载更多' : '没有更多了'}</span></div>}</>}
  </div>;

  if (recordsPage && !desktop) return <section className="rs-shop rs-record-page" aria-label="兑换记录">
    {gated ? <div className="rs-empty">登录后查看兑换记录 <button type="button" onClick={() => requireLogin('shop-records')}>去登录</button></div> : recordsBody}
    {notice && <output className="rs-notice">{notice}</output>}
  </section>;

  return <section className="rs-shop" aria-label="AI 商城">
    {desktop && <header className="rs-page-heading"><div><h1>AI 商城</h1><p>用积分开启更多 AI 创作可能</p></div><button type="button" onClick={showRecords}>兑换记录 <img src="/home-prototype/icons/arrow-right-s-line.svg" alt="" /></button></header>}
    <div className="rs-hero">
      <div><span className="rs-kicker">多元拾光 · 积分权益</span><h2>用积分兑换 AI 产品权益</h2>{desktop && <p className="rs-hero-description">让优质的 AI 工具，助你创造更多可能</p>}<div className="rs-wallet"><p>我的积分 <strong>{gated ? '—' : displayedBalance.toLocaleString('zh-CN')}</strong></p>{desktop&&<button type="button" onClick={()=>gated?requireLogin('points'):go('points')}>积分明细 <img src="/home-prototype/icons/arrow-right-s-line.svg" alt="" /></button>}</div></div>
      <img src="/retained/shop/store-hero.webp" alt="AI 商城创作权益" />
    </div>
    {gated && <div className="rs-gate"><span>登录后可查看积分并兑换商品。</span><button type="button" onClick={() => requireLogin('shop')}>去登录</button></div>}
    {state === 'unknown' && <div className="rs-gate"><span>兑换结果待确认，请先查看兑换记录。</span><button type="button" onClick={showRecords}>查看记录</button></div>}
    {!desktop && <div className="rs-section-head"><h2>可兑换商品</h2><span>{state === 'empty' ? 0 : displayGroups.reduce((total, group) => total + group.items.length, 0)} 件</span></div>}
    {state === 'empty' ? <p className="rs-empty">暂无可兑换商品</p> : displayGroups.map((group) => <section className="rs-group" key={group.site} aria-label={group.site}>
      <div className="rs-group-head"><h3>{group.site}</h3><span>{desktop ? group.siteId==='dy'?'释放你的 AI 创造力':group.siteId==='mirror'?'更稳定的 AI 镜像服务，助你高效创作':'探索更多 AI 创作可能' : `${group.items.length} 件`}</span></div>
      <div className="rs-grid">{group.items.map((item) => <article className="rs-product" key={item.id}>
        {desktop && <div className={`rs-voucher ${item.siteId==='mirror'?'rs-voucher-mirror':''}`}><span>{item.site}</span><strong>{item.siteId==='dy'?<><small>¥</small>{item.id==='dy-two'?2:item.id==='dy-five'?5:item.id==='dy-ten'?10:item.name}</>:item.id==='mirror-day'?'1天':item.id==='mirror-week'?'7天':item.name}</strong><small>{item.siteId==='dy'?'AI 让灵感发生':'让 AI 持续陪伴'}</small>{item.siteId==='mirror'&&<img src="/home-prototype/icons/calendar-check-line.svg" alt="" />}</div>}
        <h4>{item.name}</h4>
        {desktop && <p>{item.description}</p>}
        <div><strong>{item.price}</strong><span> 积分</span><button type="button" disabled={item.status==='已停用'||Number(item.stock)<=0} onClick={() => openProduct(item)} aria-label={`兑换 ${item.name}`}>{item.status==='已停用'?'已停用':Number(item.stock)<=0?'暂缺货':'兑换'}</button></div>
      </article>)}</div>
    </section>)}
    <dialog ref={dialog} className={`rs-dialog${panel === 'records' ? ' rs-record-dialog' : ''}`} onCancel={close} onClose={close} aria-label={panelTitle}>
      <div className="rs-panel"><div className="rs-panel-head"><h2>{panelTitle}</h2><button type="button" aria-label="关闭" onClick={close}>×</button></div>
        {panel === 'confirm' && <><div className="rs-summary"><small>{selected.site}</small><h3>{selected.name}</h3><p>{selected.description}</p></div>
          <dl className="rs-details"><div><dt>当前积分</dt><dd>{displayedBalance.toLocaleString('zh-CN')} 积分</dd></div><div><dt>兑换所需</dt><dd>{selected.price} 积分</dd></div><div><dt>兑换后余额</dt><dd>{available && state !== 'insufficient' ? `${(displayedBalance - selected.price).toLocaleString('zh-CN')} 积分` : '—'}</dd></div></dl>
          <p className="rs-help">{exchangeState==='failure'?'兑换未成功，积分未扣除。可以重新兑换。':exchangeState==='submitting'?'正在提交兑换，请勿重复操作。':exchangeState==='price-changed'?'商品积分价格已更新，请核对当前价格后重新确认。':exchangeState==='unavailable'?'该商品已停止兑换，积分未扣除。':soldout ? '该商品库存不足，无法兑换。' : !available ? '当前积分不足，暂时无法兑换。' : exchangeState === 'unknown' ? '兑换结果待确认，请先查看兑换记录，避免重复提交。' : '确认后使用积分兑换。'}</p>
          <div className="rs-actions"><button type="button" onClick={close}>{blockedExchange?'关闭':'取消'}</button>{exchangeState==='unknown'?<button type="button" className="rs-primary" onClick={showRecords}>查看兑换记录</button>:<button type="button" className="rs-primary" disabled={!validPrice || soldout || !available || blockedExchange} onClick={confirm}>{exchangeState==='submitting'?'兑换中…':validPrice ? `${exchangeState==='failure'?'重新兑换':'确认兑换'} · ${selected.price} 积分` : '积分条件暂不可用'}</button>}</div></>}
        {panel === 'success' && <><div className="rs-success"><span aria-hidden="true">✓</span><strong>{result?.name || selected.name}</strong><p>积分兑换已完成</p></div><div className="rs-code"><span>您的卡密</span><code>{result?.code || 'DEMO-NOT-VALID'}</code><button type="button" onClick={() => copyCode(result || {id: 'sample-success', code: 'DEMO-NOT-VALID'})}>{copied === (result?.id || 'sample-success') ? '已复制' : '复制卡密'}</button></div><small>卡密可在兑换记录中再次查看。</small><div className="rs-actions"><button type="button" onClick={close}>完成</button>{resultUrl && <a className="rs-primary" href={resultUrl} target="_blank" rel="noopener noreferrer">前往产品站点 ↗</a>}</div></>}
        {panel === 'records' && <>{recordsBody}<div className="rs-actions"><button type="button" onClick={close}>关闭</button></div></>}
        {notice && <output className="rs-notice">{notice}</output>}
      </div>
    </dialog>
  </section>;
}
