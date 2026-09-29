import type { ReactNode } from 'react';

export function MobileBrowserFrame({children}:{children:ReactNode}) {
  return <div className="rv-mobile-browser" aria-label="移动浏览器预览">
    <div className="rv-browser-status" aria-hidden="true"><span>9:41</span><span>▮▮▮　Wi-Fi　▰</span></div>
    <div className="rv-browser-bar" aria-hidden="true"><span>‹</span><div className="rv-browser-address">ai666.net</div><span>···</span></div>
    <div className="rv-browser-viewport">{children}</div>
    <div className="rv-browser-home" aria-hidden="true"><i/></div>
  </div>;
}
