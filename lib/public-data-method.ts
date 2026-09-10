import type { DataEssay } from './public-data-types';

export const publicDataMethod: DataEssay[] = [
  {
    title: '统计对象与估算方法',
    paragraphs: [
      "把可核对月份的网站访问次数作为横向比较的主指标。Semrush 的 Traffic Analytics 根据点击流样本和模型估算网站流量；Similarweb 也明确区分访问次数与去重访客。一个人多次回来会产生多次访问，网站 Visits 不能换成注册人数、月活用户或付费人数。",
      '公开数据只能覆盖对应网站和指标的统计范围。工具在独立 App、API、私有部署或第三方平台中的使用，需要另一组数据；内容社区的阅读与生成工具的操作也不构成相同任务。本报告保留 18 家的既有分类，数值对照用于缩小研究范围，不作为经营优劣排名。'
    ],
    refs: [
      { title: 'Semrush：Traffic Analytics 的指标与数据来源', url: 'https://www.semrush.com/kb/1506-traffic-and-market-traffic-overview' },
      { title: 'Similarweb：Website Performance 指标定义', url: 'https://support.similarweb.com/hc/en-us/articles/360010749958-View-Website-Performance' }
    ]
  },
  {
    title: '月份、设备和域名',
    paragraphs: [
      '主对照采用 Semrush 2026 年 7 月公开页面，保留可得的 5—7 月序列。AICPB 的 6 月榜、Similarweb 的 8 月页和没有明确月份的聚合站数据另列，不拼成连续增长曲线。公开页面会更新；每条记录保留资料月份、采集日期和原始链接。',
      '地区、来源与人口属性的设备范围可能不同。Semrush 的国家表可以同时出现该国访问占比和该国内部的设备占比；国家内 Desktop 100% 不代表全站全部来自电脑。Similarweb 地区和获客渠道常标注 Desktop，人口属性则可能覆盖桌面和移动网页，逐条按来源标注。',
      '主域与子域也不宜相加。Similarweb 的标准流量分析默认包含子域，并可在完整产品中调整范围；公开页没有给出的设置不作额外推断。域名迁移时，旧域的流量不会自动转移到新域历史记录；不同重定向方式还可能影响计数。Runway、可灵、Dify 等保留各域的观察对象。'
    ],
    refs: [
      { title: 'Similarweb：流量分析与子域范围', url: 'https://support.similarweb.com/hc/en-us/articles/115004606345-View-Traffic-Engagement' },
      { title: 'Similarweb：月份发布、重定向与域名变更', url: 'https://support.similarweb.com/hc/en-us/articles/5083358615313-Similarweb-Data-Methodology-FAQs' }
    ]
  },
  {
    title: '访问深度与留存',
    paragraphs: [
      '停留时间、页数与跳出率描述一次访问中的行为。长时间停留可能包含排队、编辑、阅读或页面闲置；多页浏览也可能来自内容发现或找不到目标。它们适合帮助选择后续实操问题，不能直接证明任务成功、结果采用或跨周留存。',
      "Direct 主要指直接输入网址、书签或保存的链接；Similarweb 还说明浏览器扩展中的链接会被计作 Direct。较高的直接访问可以提示固定入口或品牌识别，但新用户与老用户都可能使用这些入口。没有取得可比的新老访客分组，不用 Direct 占比计算回访率。"
    ],
    refs: [
      { title: 'Similarweb：访问时长、页数与跳出率定义', url: 'https://support.similarweb.com/hc/en-us/articles/360010749958-View-Website-Performance' },
      { title: 'Similarweb：Direct Traffic', url: 'https://support.similarweb.com/hc/en-us/articles/4770707469201-Direct-Traffic' },
      { title: 'Similarweb：浏览器扩展访问的归类', url: 'https://support.similarweb.com/hc/en-us/articles/5083358615313-Similarweb-Data-Methodology-FAQs' }
    ]
  },
  {
    title: '收入、获客与用户画像',
    paragraphs: [
      "网站流量数据没有揭示充值、订阅续费、退款或推理成本。的财报与官方经营披露继续作为收入证据；不根据访问量、套餐价格或广告收益预测倒算收入。年龄、性别和地区可帮助调整招募语言与时区，无法替代对职业、任务和预算的访谈。",
      'Semrush 的 Organic Rankings 使用搜索排名与关键词数据估算搜索表现，与全渠道 Traffic Analytics 的 Visits 是两种统计。SEO 页面里的 Traffic Cost 也不等于平台实际广告支出。获客分析只使用已标明范围的来源份额和上游网站，把可能的招募渠道作为待验证线索。'
    ],
    refs: [
      { title: 'Semrush：Organic Rankings 的估算基础', url: 'https://www.semrush.com/kb/890-Organic-Rankings-Overview' },
      { title: 'Similarweb：人口属性由模型估算', url: 'https://support.similarweb.com/hc/en-us/articles/5083358615313-Similarweb-Data-Methodology-FAQs' }
    ]
  }
];
