import Link from '@/components/research-link';
import { fusionGalleryDecisions, fusionGalleryGroups } from '@/lib/fusion-gallery';
import '../../options.css';
import '../fusion.css';
import './gallery.css';

export default function FusionGalleryPage() {
  return <main className="op-shell fusion-page fusion-gallery-page">
    <header className="op-top">
      <Link href="/community-options/fusion">多元拾光 / 融合方案</Link>
      <div><Link href="/community-options/fusion">方案说明</Link><Link href="/community-options/fusion/structure">页面与路径</Link></div>
    </header>
    <section className="op-hero fusion-gallery-hero">
      <span>融合方案 / 社区概念图集</span>
      <h1>完整社区概念稿</h1><p><Link href="/community-options/home-prototype">体验首页高保真原型 →</Link></p>
      <p>{fusionGalleryGroups.reduce((total, group) => total + group.images.length, 0)} 张概念图，按创作、内容、交流与个人服务查阅。每张图附页面职责与去向。</p>
      <nav aria-label="图集索引">{fusionGalleryGroups.map(group => <a key={group.id} href={'#' + group.id}>{group.label} {group.title}</a>)}</nav>
    </section>

    <section className="fusion-gallery-summary" aria-label="页面取舍">
      <div><span>页面取舍</span><h2>保留与合并</h2></div>
      <div className="op-table"><table><thead><tr><th>内容</th><th>页面关系</th></tr></thead><tbody>{fusionGalleryDecisions.map(([item, decision]) => <tr key={item}><th>{item}</th><td>{decision}</td></tr>)}</tbody></table></div>
    </section>

    <section className="fusion-gallery-groups" aria-label="社区概念稿">
      {fusionGalleryGroups.map(group => <section id={group.id} className="fusion-gallery-group" key={group.id}>
        <header className="fusion-gallery-head"><span>{group.label}</span><div><h2>{group.title}</h2><p>{group.description}</p></div></header>
        <div className="fusion-gallery-grid">
          {group.images.map(image => <figure key={image.src} className="fusion-gallery-card">
            <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={'查看' + image.title + '原图'}><img src={image.src} alt={image.title + '社区概念稿'} loading="lazy" /></a>
            <figcaption><h3>{image.title}</h3><p>{image.role}</p><p><b>页面去向</b>{image.destination}</p><a href={image.src} target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption>
          </figure>)}
        </div>
      </section>)}
    </section>
    <footer className="op-footer"><p>页面、弹层与状态板分别呈现产品关系；图中人物、互动与任务状态不代表线上数据。具体奖励与权益沿用活动及商城规则。</p><Link href="/community-options/fusion">返回融合方案 →</Link></footer>
  </main>;
}

