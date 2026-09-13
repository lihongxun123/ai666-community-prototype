'use client';

import data from '@/lib/report-quality.json';
import {RetentionEvidence} from './retention-research';
import {DeskComparisons} from './desk-comparison';

type ReportQualityProps = {
  platformCount?: number;
  groupCount?: number;
  onOpen: (sectionId: string) => void;
};

export function ReportQuality({platformCount, groupCount, onOpen}: ReportQualityProps) {
  return (
    <section className="brief-section" id="report-quality" tabIndex={-1} aria-labelledby="report-quality-title">
      <h2 id="report-quality-title">{data.title}</h2>
      <p className="chapter-answer">
        {platformCount !== undefined && groupCount !== undefined && `${platformCount}个平台按${groupCount}类用途比较。`}
        {data.summary}
      </p>

      <h3>{data.comparisons.length}组同类需要对照</h3>
      <div className="table-wrap">
        <table className="brief-table" aria-label="同类需要、现有选择与证据约束">
          <thead>
            <tr>
              <th scope="col">要满足什么需要</th>
              <th scope="col">现有选择已提供什么</th>
              <th scope="col">约束与未确认部分</th>
            </tr>
          </thead>
          <tbody>
            {data.comparisons.map(row => (
              <tr key={row.id}>
                <th scope="row">
                  {row.need}
                  <div className="brief-evidence">
                    <a href={`#report-comparison-${row.id}`} onClick={event => {
                      event.preventDefault();
                      onOpen(`comparison-${row.id}`);
                    }}>案例与来源 →</a>
                  </div>
                </th>
                <td>{row.existingChoices}</td>
                <td>{row.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>哪些可整理补齐，哪些需要新证据</h3>
      <div className="table-wrap">
        <table className="brief-table" aria-label="证据覆盖与补充方式">
          <thead>
            <tr>
              <th scope="col">研究问题</th>
              <th scope="col">整理已有材料可补齐</th>
              <th scope="col">需要新采样或一手资料</th>
            </tr>
          </thead>
          <tbody>
            {data.coverage.map(row => (
              <tr key={row.id}>
                <th scope="row">
                  <a href={`#report-${row.chapterId}`} onClick={event => {
                    event.preventDefault();
                    onOpen(row.chapterId);
                  }}>{row.title} →</a>
                </th>
                <td>{row.organize}</td>
                <td>{row.sample}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="brief-limit">{data.boundary}</p>
      <DeskComparisons/>
      <RetentionEvidence/>
    </section>
  );
}
