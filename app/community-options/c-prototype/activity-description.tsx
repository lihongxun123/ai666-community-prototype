'use client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ActivityDescription({content}:{content:string}) {
  if (!content.trim()) return null;
  return <div className="cp-ra-description cp-activity-markdown"><Markdown remarkPlugins={[remarkGfm]} skipHtml>{content}</Markdown></div>;
}
