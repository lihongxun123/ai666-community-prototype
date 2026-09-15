'use client';
import {useEffect} from 'react';
import {FunctionProfile,functionProfiles} from './function-pages';
import './liblib-evidence-reader.css';
const chapters=[...functionProfiles.get('liblib')!.sections.map((s,i)=>['liblib-function-'+i,s.title]),['liblib-supply-evidence','供给样本与截图'],['liblib-supply-distribution','1天筛选与分类核对'],['liblib-week-supply','一周筛选窗口'],['liblib-cross-entry-supply','跨入口供给与作品'],['liblib-demand-appendix','使用体验与反馈'],['function-coverage','页面与来源']];
export default function LiblibEvidenceReader(){
 useEffect(()=>{const jump=()=>{document.querySelectorAll<HTMLDetailsElement>('.evidence-reader details').forEach(d=>d.open=true);const hashId=location.hash.slice(1);const id=(hashId&&document.getElementById(hashId)?hashId:null)||new URLSearchParams(location.search).get('section');if(id)document.getElementById(id)?.scrollIntoView({block:'start'});};jump();window.addEventListener('hashchange',jump);return()=>window.removeEventListener('hashchange',jump);},[]);
 return <div className="evidence-reader"><header><a href="/?#liblib">← LiblibAI 档案</a><h1>LiblibAI 研究资料</h1></header><div className="evidence-reader-layout"><aside><nav aria-label="资料目录">{chapters.map(([id,title])=><a key={id} href={'#'+id}>{title}</a>)}</nav></aside><main><FunctionProfile id="liblib" evidenceOnly/></main></div></div>;
}

import './editorial-sample.css';
