import fs from 'node:fs';
import path from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Pass the report Markdown path.');
const lines = fs.readFileSync(source, 'utf8').trim().split(/\r?\n/);
const blocks = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (line.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith('|')) {
      const cells = lines[i].split('|').slice(1, -1).map(s => s.trim());
      if (!cells.every(s => /^:?-+:?$/.test(s))) rows.push(cells);
      i++;
    }
    i--;
    if (rows.some(r => r.length !== rows[0].length)) throw new Error('Inconsistent table');
    blocks.push({type: 'table', rows});
  } else if (/^#{1,2} /.test(line)) {
    blocks.push({type: line.startsWith('## ') ? 'section' : 'title', text: line.replace(/^#+ /, '')});
  } else {
    blocks.push({type: 'paragraph', text: line});
  }
}
fs.writeFileSync(path.resolve('lib/hf-modelscope-report.json'), JSON.stringify(blocks, null, 2) + '\n');
console.log(JSON.stringify({blocks: blocks.length, tables: blocks.filter(b=>b.type==='table').length}));
