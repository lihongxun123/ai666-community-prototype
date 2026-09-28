'use client';
import Link from 'next/link';
import { useState } from 'react';
import { allPages } from '../page';
import '../prototype.css';
const labels: Record<string, string> = {
  normal: '正常',
  confirm: '兑换确认',
  records: '兑换记录',
  completed: '任务完成',
  text: '文字作品',
  video: '视频作品',
  'media-error': '媒体失败',
  post: '帖子编辑',
  guest: '未登录',
  'view-only': '仅允许查看',
  revoked: '工程分享撤回',
  loading: '首次加载',
  empty: '暂无内容',
  error: '加载失败',
  failure: '加载失败',
  'more-error': '加载更多失败',
  partial: '部分内容失效',
  removed: '下架/不可访问',
  single: '单一内容编排',
  pc: 'PC 使用',
  paused: '暂停使用',
  invalid: '输入校验',
  validation: '输入校验',
  insufficient: '积分不足',
  'quote-error': '报价失败',
  'price-changed': '价格变化',
  'login-expired': '登录失效',
  queued: '排队',
  running: '处理中',
  submitting: '提交中',
  unknown: '结果待确认',
  unaccepted: '未受理',
  cancelling: '取消中',
  'cancel-failed': '取消失败',
  cancelled: '已取消',
  failed: '生成失败',
  settling: '结算中',
  released: '释放完成',
  expired: '已过期',
  unavailable: '暂不可用',
  'copy-failed': '复制失败',
  mismatch: '账号不匹配',
  duplicate: '重复提交',
  forbidden: '无访问权限',
  'activity-ended': '活动已结束',
  activity: '活动关联',
  review: '审核中',
  rejected: '已退回',
  public: '已公开',
  uploading: '上传中',
  'upload-failed': '上传失败',
  'save-failed': '保存失败',
  'submit-failed': '提交失败',
  conflict: '编辑冲突',
  permission: '操作受限',
  restricted: '账号受限',
  expiring: '即将过期',
  'account-switched': '账号切换',
  return: '登录返回',
  'object-gone': '目标失效',
  ended: '已结束',
  ineligible: '资格不符',
  submitted: '已投稿',
  awarded: '奖励结果',
  pending: '处理中',
  done: '已完成',
  idle: '未输入',
  closed: '已关闭',
  'action-error': '互动失败',
  'image-error': 'Banner 素材失败',
};
export default function StateBoard() {
  const [module, setModule] = useState('专题');
  const modules = [...new Set(allPages.map((p) => p.module))];
  const pages = allPages.filter(
    (p) => module === '全部' || p.module === module,
  );
  const count = allPages.reduce((sum, p) => sum + p.states.length, 0);
  return (
    <div className="cp-board">
      <header>
        <h1>C 端原型 · 页面与状态</h1>
        <Link href="/community-options/mobile-home">进入首页</Link>
        <Link href="/community-options/c-prototype?page=topics">进入专题</Link>
      </header>
      <p>
        {allPages.length} 个页面模板 · {count}{' '}
        张状态与内容样本。白色手机画面为用户界面，编号、状态名和以下说明仅供评审。
      </p>
      <details>
        <summary>原型范围与待确认项</summary>
        <p>
          全部人物、任务、余额、报价和结果为本地演示数据；应用输入页的 10
          积分仅用于验证费用状态，未作为正式定价。积分 100、签到 20、商城
          50 和无效演示卡密也只用于流程演示；账号关联与兑换成功画面均不代表真实业务完成。原型不提交真实生成、不扣费、不向线上发布。评审画面数据独立；交互入口在当前标签页保存演示数据。新建的模拟任务在
          5 秒和 12 秒后刷新可查看处理及完成状态，实际服务时间不由此确定。
        </p>
        <p>
          待确认：首发应用与实际效果素材；现有签到、邀请和商城的具体配置；活动资格与奖项；媒体容量及任务结果保留期；MakeNow
          指定工具、权限与回流接口。既有决定继续有效，这些项不在页面里补造正式规则。
        </p>
        <p>
          专题的部分失效状态直接隐藏失效卡与空组。应用的部分成功则表达交付与结算结果，两者不是同一种业务状态。关闭页面不取消任务；结果不明不重复付费提交。
        </p>
      </details>
      <nav className="cp-board-nav" aria-label="模块">
        {modules.map((m) => (
          <button
            key={m}
            aria-pressed={module === m}
            onClick={() => setModule(m)}
          >
            {m}
          </button>
        ))}
        <button
          aria-pressed={module === '全部'}
          onClick={() => setModule('全部')}
        >
          全部
        </button>
      </nav>
      <div className="cp-board-grid">
        {pages.flatMap((p) =>
          p.states.map((state, index) => {
            const extra =
              p.id === 'pc-handoff' || (p.id === 'app' && state === 'pc')
                ? '&item=video'
                : p.id === 'app' && state === 'paused'
                  ? '&item=restore'
                  : '';
            const url =
              '/community-options/c-prototype?page=' +
              p.id +
              '&state=' +
              state +
              extra;
            return (
              <article key={p.id + state}>
                <h2>
                  <span>
                    {p.title} · {labels[state] || state}
                  </span>
                  <a href={url} target="_blank" rel="noreferrer">
                    单独打开
                  </a>
                </h2>
                <small>
                  {p.id} / {index + 1}
                </small>
                <iframe
                  loading="lazy"
                  title={`${p.title} ${labels[state] || state}`}
                  src={url + '&embed=1'}
                />
              </article>
            );
          }),
        )}
      </div>
    </div>
  );
}
