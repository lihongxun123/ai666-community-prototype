'use client';
import {usePathname} from 'next/navigation';
import {useEffect,type ReactNode} from 'react';
import {BookOpen} from 'lucide-react';
import {ResearchSidebar} from './research-sidebar';
import {profiles} from '@/lib/profiles';
import './research-document-shell.css';
export default function ResearchDocumentShell({children}:{children:ReactNode}){
 const pathname=usePathname();
 const standalone=pathname!=='/'&&pathname!=='/platform-evidence';
 useEffect(()=>{const follow=(event:MouseEvent)=>{if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const a=(event.target as Element).closest?.('a');if(!a||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||/\.(png|jpe?g|webp|svg|pdf|zip)$/i.test(url.pathname))return;if(a.target==='_blank'){event.preventDefault();location.assign(url.href);}};document.addEventListener('click',follow);return()=>document.removeEventListener('click',follow);},[]);

 if(!standalone||['c-prototype','b-prototype','cross-prototype','prototype-review','prototype-gallery','common-states'].some(p=>pathname.startsWith('/community-options/'+p))||pathname==='/community-options/home-prototype'||pathname==='/community-options/mobile-home'||pathname==='/community-options/mobile-browser-compare')return <>{children}</>;
 return <div className="document-shell"><header className="app-header"><a className="brand" href="/#overview"><span className="brand-icon"><BookOpen size={17}/></span>多元拾光 <span className="brand-divider">/</span><span className="brand-sub">研究室</span></a><span className="header-meta">AI社区研究</span><a className="research-prototype-entry" href="/community-options/prototype-review?section=c&amp;view=home&amp;device=pc&amp;reading=prototype">产品原型 →</a></header><ResearchSidebar view="" routePath={pathname} profiles={profiles} navigate={id=>location.assign('/#'+id)}/><div className="document-body">{children}</div></div>;
}
