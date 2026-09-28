import type {Metadata} from 'next';
import blocks from '@/lib/hf-modelscope-report.json';
import './report.css';

export const metadata: Metadata = {
  title: 'Hugging Face 与魔搭社区调研 · 多元拾光研究室',
  description: 'Hugging Face 与魔搭的平台能力、服务承载、资源条件，以及必备与可选能力的比较。',
};

function Inline({text}:{text:string}) {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g).map((part,i)=> {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2,-2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    return link ? <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a> : part;
  });
}

export default function PlatformReport() {
  return <main className="platform-report">
    <article>
      {blocks.map((block,i)=> {
        if (block.type === 'title') return <h1 key={i}>{block.text}</h1>;
        if (block.type === 'section') return <h2 key={i} id={'section-'+i}>{block.text}</h2>;
        if (block.type === 'table' && block.rows) return <div className="platform-report-table" key={i} tabIndex={0} role="region" aria-label="对照表，可横向滚动"><table><thead><tr>{block.rows[0].map((cell,j)=><th key={j} scope="col"><Inline text={cell}/></th>)}</tr></thead><tbody>{block.rows.slice(1).map((row,j)=><tr key={j}>{row.map((cell,k)=><td key={k}><Inline text={cell}/></td>)}</tr>)}</tbody></table></div>;
        return <p key={i} className={i===1?'platform-report-date':undefined}><Inline text={block.text || ''}/></p>;
      })}
    </article>
  </main>;
}
