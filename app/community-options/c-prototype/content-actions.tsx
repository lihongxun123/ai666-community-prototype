'use client';
/* oxlint-disable next/no-img-element -- Shared local prototype icons. */
import {useState,type ReactNode} from 'react';
import {prototypeStore as sessionStorage,getFavorites,toggleFavorite} from './storage';
const signedIn = () =>
  typeof window !== 'undefined' && sessionStorage.getItem('cp-auth') === '1';
const loginFor = (go: (page: string) => void) => {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search);
    const id = q.get('page') || 'community';
    q.delete('page');
    if (q.get('state') === 'guest') q.delete('state');
    sessionStorage.setItem('cp-return', id + '?' + q.toString());
  }
  go('login');
};


function Icon({name}:{name:string}){return <img className="reading-icon" src={'/home-prototype/icons/'+name+'-line.svg'} alt=""/>}
function Button({children,onClick,quiet=false}:{children:ReactNode;onClick:()=>void;quiet?:boolean}){return <button type="button" className={'reading-button'+(quiet?' quiet':'')} onClick={onClick}>{children}</button>}
export function interactionTarget(){
  if(typeof window==='undefined')return '';
  const q=new URLSearchParams(location.search),page=q.get('page')||'work';
  const id=q.get('id');const item=q.get('item')||(page==='app'?'copy':'restore');
  const aliases:Record<string,string>={'app-1':'app?item=copy','work-perfume':'work?item=perfume','work-sea':'work?item=sea','work-1':'work?item=restore','post-1':'post?item=restore','tutorial-1':'tutorial?item=restore','resource-1':'resource?item=restore'};
  return id?(aliases[id]||page+'?id='+encodeURIComponent(id)):page+'?item='+encodeURIComponent(item);
}
export function ActionBar({
  kind,
  go,
  guest = false,
  failOnAction = false,
  target, title, onComment,
}: {
  target?:string; title?:string; onComment?:()=>void;
  kind: string;
  go: (page: string) => void;
  guest?: boolean;
  failOnAction?: boolean;
}) {
  const contentTarget=target||interactionTarget();
  const likeKey='cp-like:'+kind+':'+(new URLSearchParams(contentTarget.split('?')[1]||'').get('item')||contentTarget);
  const [liked, setLiked] = useState(()=>sessionStorage.getItem(likeKey)==='1');
  const [saved, setSaved] = useState(() =>
    getFavorites().some((x) => x.target === contentTarget),
  );
  const [open, setOpen] = useState<'share' | ''>('');
  const [failNext, setFailNext] = useState(failOnAction);
  const [toast, setToast] = useState(failOnAction ? '操作未完成，请重试' : '');
  const toggle = (name: 'like' | 'save') => {
    if (guest || !signedIn()) {
      loginFor(go);
      return;
    }
    if (failNext) {
      setFailNext(false);
      setToast('操作未完成，请重试');
      return;
    }
    if (name === 'like') {
      sessionStorage.setItem(likeKey,liked?'0':'1');
      setLiked(!liked);
      setToast('');
    } else {
      setSaved(
        toggleFavorite({
          target: contentTarget,
          title:
            title || document.querySelector('main .reading-title')?.textContent ||
            document.querySelector('main h2')?.textContent ||
            '收藏内容',
          type: ({work:'作品',tutorial:'教程',app:'AI 应用',post:'帖子',resource:'资源'} as Record<string,string>)[kind]||'内容',
        }),
      );
      setToast('');
    }
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(new URL('/community-options/c-prototype?page='+contentTarget.replace('?','&'),location.origin).toString());
      setToast('链接已复制');
      setOpen('');
    } catch {
      setToast('复制失败，请重试');
    }
  };
  return (
    <div className="reading-actions-wrap">
      <div className="reading-actions">
        <button type="button" aria-pressed={liked} onClick={() => toggle('like')}>
          <Icon name="heart" />
          {liked ? '已喜欢' : '喜欢'}
        </button>
        {(
          <button type="button" aria-pressed={saved} onClick={() => toggle('save')}>
            <Icon name="bookmark" />
            {saved ? '已收藏' : '收藏'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onComment ? onComment() : document.getElementById('reading-comments')
              ?.scrollIntoView({ behavior: 'smooth',block:'start' })
          }
        >
          <Icon name="chat-3" />
          评论
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === 'share' ? '' : 'share')}
        >
          <Icon name="share-forward" />分享
        </button>
      </div>
      {toast && <output className="reading-toast">{toast}</output>}
      {open === 'share' && (
        <div className="reading-sheet">
          <strong>
            分享当前
            {kind === 'post'
              ? '帖子'
              : kind === 'tutorial'
                ? '教程'
                : kind === 'work'
                  ? '作品'
                  : kind === 'app' ? '应用' : '资源'}
          </strong>
          <Button onClick={share}>复制链接</Button>
          <Button quiet onClick={() => setOpen('')}>
            取消
          </Button>
        </div>
      )}

    </div>
  );
}

