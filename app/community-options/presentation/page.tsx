'use client';

/* eslint-disable next/no-img-element -- These are archived evidence screenshots, shown without image transformation. */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, X } from 'lucide-react';
import './presentation.css';
import './narrative.css';
import narrative from '@/lib/presentation-narrative.json';
type Slide = {concept?:{src:string;caption:string};id:string;chapter:string;title:string;lead:string;cards:{title:string;text:string}[];sources:{label:string;href:string}[];table?:{headers:string[];rows:string[][]};note?:string;optionLinks?:boolean;bars?:{label:string;value:number}[];images?:{src:string;title:string;text:string;href:string;date:string;note?:string}[]};
const slides = narrative.slides as Slide[];

const chapters = slides.map(s=>({id:s.id,title:s.chapter+' · '+s.title,short:s.chapter}));

function Source({ href, children }: { href: string; children: ReactNode }) {
  return <><a className="pres-source" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={14} aria-hidden="true" /><span className="pres-sr-only">（新页面打开）</span></a>{href === "/community-options/home-draft" && <a className="pres-source" href={href} aria-label="首页内容草案：当前页打开">当前页打开</a>}</>;
}

function Eyebrow({ number, children }: { number: string; children: ReactNode }) {
  return <p className="pres-eyebrow"><span>{number}</span>{children}</p>;
}

export default function CommunityPresentation() {
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const current = useRef(0);

  useEffect(() => { current.current = active; }, [active]);

  const go = useCallback((index: number) => {
    const next = Math.max(0, Math.min(chapters.length - 1, index));
    setActive(next);
    setMenu(false);
    window.history.replaceState(null, '', `#${chapters[next].id}`);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sections.current[next]?.querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const index = chapters.findIndex(chapter => '#'+chapter.id === window.location.hash);
      if (index >= 0) { setActive(index); current.current = index; }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape') { setMenu(false); return; }
      if (event.key === 'ArrowRight' || (event.key === 'PageDown')) { event.preventDefault(); go(current.current + 1); }
      if (event.key === 'ArrowLeft' || (event.key === 'PageUp')) { event.preventDefault(); go(current.current - 1); }
      if (event.key === 'Home') { event.preventDefault(); go(0); }
      if (event.key === 'End') { event.preventDefault(); go(chapters.length - 1); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [go]);

  useEffect(() => {
    const readHash = () => { const index = chapters.findIndex(c => '#'+c.id === window.location.hash); if(index>=0) go(index); };
    window.addEventListener('hashchange',readHash);
    return () => window.removeEventListener('hashchange',readHash);
  },[go]);

  const panel = (index: number, className: string, children: ReactNode) => (
    <section id={chapters[index].id} ref={element => { sections.current[index] = element; }}
      className={`pres-slide ${className}`} hidden={active !== index}
      aria-labelledby={`pres-heading-${index}`} key={chapters[index].id}>
      <div className="pres-slide-inner">{children}</div>
    </section>
  );

  return <div className="presentation pres-pages">
    <a className="pres-skip" href={`#pres-heading-${active}`}>跳至本章内容</a>
    <header className="pres-header">
      <Link className="pres-brand" href="/community-options"><img className="pres-brand-logo" src="/brand/duoyuan-shiguang-logo-mark.svg" alt="" width={62} height={36} /><span>多元拾光<span className="pres-brand-sub"> / 社区机会与方案</span></span></Link>
      <button className="pres-menu-trigger" type="button" aria-expanded={menu} aria-controls="pres-chapters" onClick={() => setMenu(value => !value)}>目录 {menu ? <X size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}</button>
    </header>

    {menu && <nav className="pres-menu" id="pres-chapters" aria-label="章节目录">
      <span className="pres-menu-label">研究与方案 · {chapters.length}页</span>
      {chapters.map((chapter, index) => <button type="button" key={chapter.id} aria-current={active === index ? 'step' : undefined} onClick={() => go(index)}><span>{String(index + 1).padStart(2, '0')}</span>{chapter.title}<ArrowUpRight size={16} aria-hidden="true" /></button>)}
    </nav>}

    <main id="pres-main">
      {slides.map((slide,index)=>panel(index,'narrative-slide'+(slide.concept?' concept-slide':''),<>
        <Eyebrow number={String(index+1).padStart(2,'0')}>{slide.chapter}</Eyebrow>
        {index===0?<h1 id={'pres-heading-'+index} tabIndex={-1}>{slide.title}</h1>:<h2 id={'pres-heading-'+index} tabIndex={-1}>{slide.title}</h2>}
        {slide.lead&&<p className="pres-lead">{slide.lead}</p>}
        {slide.concept&&<figure className="pres-concept"><a href={slide.concept.src} target="_blank" rel="noopener noreferrer"><img src={slide.concept.src} alt={slide.title+"，AI生成概念稿"}/></a><figcaption>{slide.concept.caption}</figcaption></figure>}
        {slide.bars&&<figure className="narrative-bars"><figcaption>用途占比 · 多选</figcaption>{slide.bars.map(b=><div key={b.label}><span>{b.label}</span><i><em style={{width:b.value+'%'}}/></i><strong>{b.value}%</strong></div>)}</figure>}
        {slide.images&&<div className="narrative-images">{slide.images.map(img=><figure key={img.src}><a href={img.src} target="_blank" rel="noopener noreferrer"><img src={img.src} alt={img.title}/></a><figcaption><strong>{img.title}</strong><p>{img.text}</p><Source href={img.href}>对应档案</Source></figcaption></figure>)}</div>}
        <div className={'narrative-grid count-'+slide.cards.length}>{slide.cards.map((c,i)=><article key={c.title}><span className="narrative-index">{String(i+1).padStart(2,'0')}</span><h3>{c.title}</h3>{c.text.includes(' → ')?<ol className="narrative-path">{c.text.split(' → ').map(x=><li key={x}>{x}</li>)}</ol>:<p>{c.text}</p>}{slide.optionLinks&&<Source href={'/community-options/proposals/'+narrative.options[i].id}>展开完整方案</Source>}</article>)}</div>
        {slide.table&&<div className="narrative-table"><table><thead><tr>{slide.table.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{slide.table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j}>{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
        {slide.note&&<p className="narrative-note">{slide.note}</p>}
        {slide.sources.length>0&&<nav className="narrative-sources" aria-label="本页依据与展开">{slide.sources.map(x=><Source key={x.href} href={x.href}>{x.label}</Source>)}</nav>}
      </>))}
    </main>

    <footer className="pres-controls" aria-label="演示导航">
      <div className="pres-progress-label" aria-live="polite" aria-atomic="true"><strong>{String(active + 1).padStart(2, '0')}</strong><span>/ {chapters.length}</span><span>{chapters[active].short}</span></div>
      <nav className="pres-chapter-dots" aria-label="快速章节跳转">{chapters.map((chapter, index) => <button key={chapter.id} type="button" title={`${index + 1}. ${chapter.title}`} aria-label={`第 ${index + 1} 章：${chapter.title}`} aria-current={index === active ? 'step' : undefined} onClick={() => go(index)}><span /></button>)}</nav>
      <div className="pres-arrows"><span className="pres-key-hint">← → 切换章节</span><button type="button" disabled={active === 0} aria-label="上一章" onClick={() => go(active - 1)}><ArrowLeft size={18} aria-hidden="true" /></button><button type="button" disabled={active === chapters.length - 1} aria-label="下一章" onClick={() => go(active + 1)}><ArrowRight size={18} aria-hidden="true" /></button></div>
      <div className="pres-progress-track" aria-hidden="true"><span style={{ width: `${(active + 1) / chapters.length * 100}%` }} /></div>
    </footer>
  </div>;
}
