'use client';

import { useEffect, useRef, useState } from 'react';
import { allPages } from '../c-prototype/page';
import { bPages } from '../b-prototype/page';
import { readerVisible } from '../navigation-model';
import './gallery.css';

type Mode = 'pc' | 'mobile' | 'backend';

function PrototypeCard({ id, title, mode }: { id: string; title: string; mode: Mode }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const mobile = mode === 'mobile';
  const frameWidth = mobile ? 390 : 1440;
  const frameHeight = mobile ? 844 : 900;
  const url = `/community-options/${mode === 'backend' ? 'b' : 'c'}-prototype?page=${id}&device=${mobile ? 'mobile' : 'pc'}`;

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '400px' });
    resize.observe(element);
    observer.observe(element);
    return () => { resize.disconnect(); observer.disconnect(); };
  }, []);

  return <article className="pgallery-card">
    <header><h2>{title}</h2><a href={url} target="_blank" rel="noopener noreferrer">单独打开 ↗</a></header>
    <div ref={container} className="pgallery-frame" style={{ aspectRatio: `${frameWidth} / ${frameHeight}` }}>
      {visible && width > 0 && <iframe title={title} src={`${url}&embed=1`} style={{ width: frameWidth, height: frameHeight, transform: `scale(${width / frameWidth})` }} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-popups" />}
    </div>
  </article>;
}

export default function PrototypeGallery() {
  const [mode, setMode] = useState<Mode>('pc');
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setMode(query.get('section') === 'b' ? 'backend' : query.get('device') === 'mobile' ? 'mobile' : 'pc');
  }, []);
  const changeMode = (next: Mode) => {
    setMode(next);
    history.replaceState(null, '', `?section=${next === 'backend' ? 'b' : 'c'}&device=${next === 'mobile' ? 'mobile' : 'pc'}`);
  };
  const pages = mode === 'backend' ? bPages : allPages.filter(page => readerVisible(page.id, mode));
  return <main className="pgallery">
    <header className="pgallery-toolbar">
      <h1>原型集合</h1>
      <nav aria-label="原型版本">
        {([['pc', 'C端 · PC'], ['mobile', 'C端 · 移动端'], ['backend', 'B端']] as const).map(([value, label]) => <button key={value} aria-pressed={mode === value} onClick={() => changeMode(value)}>{label}</button>)}
      </nav>
      <a href={`/community-options/prototype-review?section=${mode === 'backend' ? 'b' : 'c'}&device=${mode === 'mobile' ? 'mobile' : 'pc'}&reading=prototype`}>阅读台</a>
    </header>
    <div className={`pgallery-grid ${mode === 'mobile' ? 'is-mobile' : ''}`} key={mode}>
      {pages.map(page => <PrototypeCard key={page.id} id={page.id} title={page.title} mode={mode} />)}
    </div>
  </main>;
}
