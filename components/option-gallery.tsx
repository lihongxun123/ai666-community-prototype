'use client';
/* eslint-disable next/no-img-element -- Concept artwork and the standalone SVG retain their original pixels and text without image transformation. */

import {useState} from 'react';
export default function OptionGallery({images}:{images:{src:string;title:string;purpose:string}[]}){const [index,setIndex]=useState(0);const item=images[index];return <div className="pg-gallery"><div className="pg-image-nav" aria-label="概念页面">{images.map((im,i)=><button type="button" key={im.src} aria-pressed={i===index} onClick={()=>setIndex(i)}>{String(i+1).padStart(2,'0')} {im.title}</button>)}</div><figure><a href={item.src} target="_blank" rel="noopener noreferrer" aria-label={'放大'+item.title}><img src={item.src} alt={item.title+'概念稿'}/></a><figcaption><div><strong>{item.title}</strong>{item.purpose&&<p>{item.purpose}</p>}</div><a href={item.src} target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure></div>}
