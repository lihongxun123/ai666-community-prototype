import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part);
}

export function DocumentBlocks({ text }: { text: string }) {
  return <div className="rv-document">{text.replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/).map((block, i) => {
    const heading = block.match(/^(#{1,4})\s+(.+)$/);
    if (heading) heading[2] = heading[2].replace(/^\d+(?:\.\d+)*\.?\s+/, '');
    if (heading) return heading[1].length >= 3 ? <h4 key={i}>{heading[2]}</h4> : <h3 key={i}>{heading[2]}</h3>;
    const lines = block.split('\n');
    if (lines.every(line => /^[-*] /.test(line))) return <ul key={i}>{lines.map((line, j) => <li key={j}>{inline(line.slice(2))}</li>)}</ul>;
    if (lines.every(line => /^\d+\. /.test(line))) return <ol key={i}>{lines.map((line, j) => <li key={j}>{inline(line.replace(/^\d+\. /, ''))}</li>)}</ol>;
    if (block.startsWith('|')) {
      const rows = lines.filter(line => !/^\|[\s:|-]+\|$/.test(line)).map(line => line.split('|').slice(1, -1));
      return <div className="rv-table-scroll" key={i}><table><thead><tr>{rows[0]?.map((cell, j) => <th key={j}>{inline(cell.trim())}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k}>{inline(cell.trim())}</td>)}</tr>)}</tbody></table></div>;
    }
    return <p key={i}>{inline(block)}</p>;
  })}</div>;
}
