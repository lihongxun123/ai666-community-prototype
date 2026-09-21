import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './report-editorial.css';
import ResearchDocumentShell from '@/components/research-document-shell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '多元拾光研究室 · AI社区研究',
  description: 'AI社区竞品档案、用户与市场、内容与运营研究，以及多元拾光的方案比较和验证计划。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ResearchDocumentShell>{children}</ResearchDocumentShell>
      </body>
    </html>
  );
}
