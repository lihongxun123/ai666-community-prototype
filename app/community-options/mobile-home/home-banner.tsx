'use client';
/* oxlint-disable next/no-img-element -- Preserve the research site's local SVG and raster assets without an image service. */
import { useEffect, useRef, useState } from 'react';

export type BannerScenario =
  | 'activity'
  | 'ended'
  | 'pc'
  | 'external'
  | 'missing'
  | 'unknown'
  | 'hidden'
  | 'imageError';
export const bannerScenarios: [BannerScenario, string][] = [
  ['activity', '活动目标正常'],
  ['ended', '活动已结束'],
  ['pc', 'PC 画布目标'],
  ['external', '外部网站'],
  ['missing', '点击时发现目标下架'],
  ['unknown', '目标无法识别'],
  ['hidden', '已停用或已知不可访问'],
  ['imageError', '素材加载失败'],
];
const pcUrl = 'https://www.makenow.tv/case-share/6/canvas';

export default function HomeBanner({
  scenario,
  onPending,
}: {
  scenario: BannerScenario;
  onPending: (name: string) => void;
}) {
  const [opened, setOpened] = useState(false),
    [failed, setFailed] = useState(false),
    [copy, setCopy] = useState('');
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const title =
    scenario === 'pc'
      ? 'MakeNow 公开画布案例'
      : scenario === 'external'
        ? '了解 MakeNow'
        : '一起画个夏天';
  useEffect(() => {
    const onBack = (event: PopStateEvent) =>
      setOpened(event.state?.homeBanner === scenario);
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, [scenario]);
  useEffect(() => {
    const element = dialog.current;
    if (opened) {
      element?.showModal();
      const old = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = old;
      };
    }
    element?.close();
  }, [opened]);
  const close = () => {
    setOpened(false);
    if (window.history.state?.homeBanner === scenario) window.history.back();
    trigger.current?.focus({ preventScroll: true });
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pcUrl);
      setCopy('链接已复制，请在电脑端打开');
    } catch {
      setCopy('复制未成功，可选中下方链接手动复制');
    }
  };
  if (scenario === 'hidden') return null;
  return (
    <>
      <button
        ref={trigger}
        className={
          'mh-banner ' +
          (scenario === 'pc' ||
          scenario === 'external' ||
          failed ||
          scenario === 'imageError'
            ? 'mh-banner-text'
            : '')
        }
        aria-label={'打开 Banner：' + title}
        onClick={() => {
          setCopy('');
          window.history.pushState(
            { ...window.history.state, homeBanner: scenario },
            '',
            window.location.href,
          );
          setOpened(true);
        }}
      >
        {scenario === 'pc' ||
        scenario === 'external' ||
        failed ||
        scenario === 'imageError' ? (
          <span>
            <small>
              {scenario === 'pc'
                ? 'PC 创作项目'
                : scenario === 'external'
                  ? '工具与创作'
                  : '社区活动'}
            </small>
            <strong>{title}</strong>
            <em>
              {scenario === 'pc'
                ? '了解用途，电脑端继续'
                : scenario === 'external'
                  ? '前往官方网站了解更多'
                  : '查看活动详情'}
            </em>
          </span>
        ) : (
          <img
            src="/home-prototype/banner.png"
            alt="一起画个夏天"
            onError={() => setFailed(true)}
          />
        )}
        {scenario === 'ended' && (
          <span className="mh-banner-ended">活动已结束</span>
        )}
      </button>
      <dialog
        className="mh-banner-destination"
        ref={dialog}
        aria-label={title}
        onCancel={close}
      >
        <header>
          <button onClick={close} aria-label="返回首页">
            <img src="/home-prototype/icons/arrow-left-s-line.svg" alt="" />
          </button>
          <span>
            {scenario === 'pc'
              ? '项目介绍'
              : scenario === 'external'
                ? '外部网站'
                : scenario === 'missing' || scenario === 'unknown'
                  ? '内容状态'
                  : '活动详情'}
          </span>
        </header>
        <div className="mh-destination-body">
          {scenario === 'missing' || scenario === 'unknown' ? (
            <section className="mh-target-state">
              <h1>
                {scenario === 'missing'
                  ? '内容暂不可访问'
                  : '暂时无法打开此链接'}
              </h1>
              <p>
                {scenario === 'missing'
                  ? '内容可能已下架或不再公开。'
                  : '请稍后重试，或返回首页继续浏览。'}
              </p>
              <button className="mh-primary" onClick={close}>
                返回首页
              </button>
            </section>
          ) : scenario === 'pc' ? (
            <>
              <span className="mh-label">MakeNow · 电脑端</span>
              <h1>{title}</h1>
              <p>查看公开的制作画布，了解素材组织与创作过程。</p>
              <section className="mh-target-note">
                <h2>请在电脑端继续</h2>
                <p>
                  画布包含素材和编辑区域，电脑端更便于查看与操作。手机可先了解项目，复制链接后在电脑端打开。
                </p>
              </section>
              <p>
                是否可以查看或复制，以 MakeNow
                当前公开权限为准。需要登录时使用你的 MakeNow 账号。
              </p>
              <button className="mh-primary" onClick={copyLink}>
                复制电脑端链接
              </button>
              <output className="mh-copy-status">{copy}</output>
              <input
                aria-label="电脑端目标链接"
                readOnly
                value={pcUrl}
                onFocus={(e) => e.target.select()}
              />
              <p className="mh-muted">
                链接定位到项目，不会自动复制、生成或同步素材。
              </p>
            </>
          ) : scenario === 'external' ? (
            <>
              <span className="mh-label">外部网站</span>
              <h1>{title}</h1>
              <p>即将前往 MakeNow 官方网站。</p>
              <p className="mh-target-note">
                www.makenow.tv
                <br />
                外部页面由目标网站提供，访问状态以实际打开结果为准。
              </p>
              <a
                className="mh-primary"
                href="https://www.makenow.tv/"
                target="_blank"
                rel="noopener noreferrer"
              >
                前往 MakeNow（新窗口）
              </a>
              <button className="mh-secondary" onClick={close}>
                留在首页
              </button>
            </>
          ) : (
            <>
              <img
                className="mh-activity-cover"
                src="/home-prototype/banner.png"
                alt="一起画个夏天"
              />
              <span className="mh-label">
                {scenario === 'ended' ? '活动已结束' : '创作活动'}
              </span>
              <h1>一起画个夏天</h1>
              <p>用文字、图片或视频，记录你眼中的夏日灵感。</p>
              {scenario === 'ended' ? (
                <section className="mh-target-note">
                  <h2>投稿已结束</h2>
                  <p>本次活动已停止接收新投稿，你可以返回首页继续发现作品。</p>
                </section>
              ) : (
                <>
                  <p>参与前请查看活动规则，确认投稿要求和参与资格。</p>
                  <button
                    className="mh-primary"
                    onClick={() => {
                      close();
                      onPending('活动详情与投稿');
                    }}
                  >
                    查看活动规则与参与方式
                  </button>
                </>
              )}
              <button className="mh-secondary" onClick={close}>
                返回首页
              </button>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
