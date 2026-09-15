import {useState} from 'react';
import {revealLiblibEvidence} from './liblib-representative';
import './editorial-sample.css';
const chapters=[['liblib-platform-model','平台运作'],['liblib-user-tasks','用户与价值'],['liblib-distribution','分类与分发'],['liblib-use-paths','使用路径'],['liblib-supply-model','供给与运营'],['liblib-commercial-model','商业机制'],['liblib-supply-evidence','样本与截图'],['liblib-demand-appendix','需求反馈'],['source-list','来源']];
export function LiblibReadingNav(){
 const [open,setOpen]=useState(false);
 return <nav className={'dossier-chapters '+(open?'is-open':'')} aria-label="LiblibAI 章节目录"><button className="chapter-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="liblib-chapter-links">章节目录 <span>{open?'收起':'展开'}</span></button><ol id="liblib-chapter-links">{chapters.map(([id,label],i)=><li key={id}><a href={['liblib-supply-evidence','liblib-demand-appendix'].includes(id)?'/liblib-evidence?section='+id:'#liblib'} target={['liblib-supply-evidence','liblib-demand-appendix'].includes(id)?'_blank':undefined} rel="noopener noreferrer" onClick={e=>{if(['liblib-supply-evidence','liblib-demand-appendix'].includes(id))return;e.preventDefault();setOpen(false);revealLiblibEvidence(id);}}><span>{String(i+1).padStart(2,'0')}</span>{label}</a></li>)}</ol></nav>;
}

import './liblib-evidence-reader.css';
