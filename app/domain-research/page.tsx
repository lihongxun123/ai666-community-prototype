import {DomainBaseline} from '@/components/domain-baseline';
import {ResearchConclusions} from '@/components/research-conclusions';
import '@/components/market-social.css';
export default function Page(){return <main className="ms-report" style={{margin:'0 auto',padding:'32px 24px 80px'}}><p><a href="/#content-demand">多元拾光研究室 / 内容需求与社媒生态</a> · <a href="/media-reports">报告与代表案例</a></p><header className="page-heading"><h1>内容消费与实际应用：综合判断与领域比较</h1><p>资料整理：2026年9月16日</p></header><nav className="ms-links" aria-label="研究阅读目录"><a href="#research-conclusions">综合判断</a><a href="#domain-baseline">14领域依据</a><a href="/task-research" target="_blank" rel="noopener noreferrer">用户任务与后续结果 ↗</a></nav><ResearchConclusions/><DomainBaseline/></main>}
