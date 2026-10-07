'use client';
import ReactMarkdown, {defaultUrlTransform} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';


import type { Block } from './store';
import Image from 'next/image';
import {useRef, useState} from 'react';
import {MediaUpload} from './media-upload';
import './content-media.css';

const localFiles = new Map<
  string,
  { url: string; type: string; name: string }
>();
const imageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
const videoTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const attachmentTypes = new Set([
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const fileName = (value: string) =>
  localFiles.get(value)?.name || value.split(':').slice(2).join(':') || value;
const source = (value: string) =>
  value.startsWith('local:') ? localFiles.get(value)?.url : value;
const isVideo = (value: string) =>
  localFiles.get(value)?.type.startsWith('video/') ||
  /\.(mp4|webm|mov)(\?|$)/i.test(value);

function remember(file: File) {
  const token = `local:${crypto.randomUUID()}:${file.name}`;
  localFiles.set(token, {
    url: URL.createObjectURL(file),
    type: file.type,
    name: file.name,
  });
  return token;
}
function duration(url: string) {
  return new Promise<number>((resolve, reject) => {
    const v = document.createElement('video');
    const cleanup = () => {
      clearTimeout(timer);
      v.onloadedmetadata = null;
      v.onerror = null;
      v.removeAttribute('src');
      v.load();
    };
    const timer = setTimeout(() => {cleanup(); reject(new Error('读取视频时长超时'));}, 15000);
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      const seconds = v.duration;
      cleanup();
      resolve(seconds);
    };
    v.onerror = () => {cleanup(); reject(new Error('无法读取视频时长'));};
    v.src = url;
  });
}
export function mediaReady(value: string) {
  return !value
    .split('|')
    .some((x) => x.startsWith('local:') && !localFiles.has(x));
}

export function MediaPreview({
  value,
  consumer = false,
  alt,
}: {
  value: string;
  consumer?: boolean;
  alt?: string;
}) {
  if (!value) return null;
  return (
    <div className="bp-media-preview">
      {value.split('|').map((item, index) => {
        const url = source(item);
        if (!url)
          return (
            <p key={index} className="bp-warning">
              {consumer
                ? '媒体暂不可用'
                : fileName(item) + ' 需要重新选择本地素材'}
            </p>
          );
        return isVideo(item) ? (
          <video key={index} src={url} controls preload="metadata">
            <track kind="captions" />
          </video>
        ) : /^(\/|blob:|https?:)/.test(url) ? (
          <Image
            key={index}
            unoptimized
            width={280}
            height={220}
            src={url}
            alt={
              alt ||
              (fileName(item).startsWith('/') ? '作品图片' : fileName(item))
            }
          />
        ) : (
          <p key={index}>{item}</p>
        );
      })}
    </div>
  );
}

export function MediaPicker({
  value,
  mode,
  disabled,
  onChange,
  onError,
}: {
  value: string;
  mode: 'work' | 'image' | 'video';
  disabled?: boolean;
  onChange: (value: string) => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const existing = value ? value.split('|') : [];
  const accept =
    mode === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif,image/avif'
      : mode === 'video'
        ? 'video/mp4,video/webm,video/quicktime'
        : 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime';
  const pick = async (selected: File[]) => {
    if (!selected.length || disabled || pending.current) return;
    if (mode !== 'work' && selected.length !== 1) {
      onError('此处只能选择一个文件。');
      return;
    }
    if (mode === 'work' && existing.length + selected.length > 4) {
      onError('图集最多 4 张图片。');
      return;
    }
    const images = selected.filter((x) => imageTypes.has(x.type)),
      videos = selected.filter((x) => videoTypes.has(x.type));
    if (
      images.length + videos.length !== selected.length ||
      (images.length && videos.length) ||
      videos.length > 1 ||
      (mode === 'work' && ((videos.length > 0 && existing.length > 0) || (images.length > 0 && existing.some(isVideo)))) ||
      (mode === 'image' && videos.length > 0) ||
      (mode === 'video' && images.length > 0)
    ) {
      onError('作品只能选择图片图集或一段视频，不能混用。');
      return;
    }
    const tooLarge = selected.find(
      (x) => x.size > (videoTypes.has(x.type) ? 300 : 20) * 1024 * 1024,
    );
    if (tooLarge) {
      onError(
        `${tooLarge.name} 超出${videoTypes.has(tooLarge.type) ? '视频 300 MB' : '图片 20 MB'}限制。`,
      );
      return;
    }
    if (videos.length) {
      pending.current = true;
      setBusy(true);
      const url = URL.createObjectURL(videos[0]);
      try {
        const seconds = await duration(url);
        if (!Number.isFinite(seconds) || seconds > 600) {
          onError('视频最长 10 分钟，且需可读取时长。');
          return;
        }
      } catch {
        onError('无法读取视频时长，请更换文件。');
        return;
      } finally {
        URL.revokeObjectURL(url);
        pending.current = false;
        setBusy(false);
      }
    }
    onChange([...(mode === 'work' ? existing : []), ...selected.map(remember)].join('|'));
    onError('');
  };
  return (
    <MediaUpload
      items={existing.map(item => ({url: source(item) || '', type: isVideo(item) ? 'video' : 'image', name: fileName(item)}))}
      accept={accept}
      multiple={mode === 'work'}
      disabled={disabled}
      busy={busy}
      maxCount={mode === 'work' && !existing.some(isVideo) ? 4 : 1}
      label={mode === 'work' ? '作品图片或视频' : mode === 'image' ? '图片' : '视频'}
      onFiles={pick}
      onRemove={index => {onChange(existing.filter((_, i) => i !== index).join('|')); onError('');}}
      onReorder={mode === 'work' ? (from, to) => {const next = [...existing]; const [item] = next.splice(from,1); next.splice(to,0,item); onChange(next.join('|'));} : undefined}
    />
  );
}

export function AttachmentPicker({
  value,
  onChange,
  onError,
}: {
  value: string[];
  onChange: (files: string[]) => void;
  onError: (message: string) => void;
}) {
  const pick = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = [...files];
    if (value.length + selected.length > 5) {
      onError('附件最多 5 个。');
      return;
    }
    const bad = selected.find(
      (x) => x.size > 50 * 1024 * 1024 || !attachmentTypes.has(x.type),
    );
    if (bad) {
      onError(`${bad.name} 不符合 50 MB 或可用文件类型限制。`);
      return;
    }
    onChange([...value, ...selected.map(remember)]);
    onError('');
  };
  return (
    <div className="bp-attachments">
      <input
        type="file"
        aria-label="选择附件"
        multiple
        accept=".pdf,.txt,.docx,.xlsx,.pptx"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
      <ul>
        {value.map((x) => (
          <li key={x}>
            {fileName(x)}
            {!mediaReady(x) && ' · 需重新选择'}{' '}
            <button
              type="button"
              onClick={() => onChange(value.filter((y) => y !== x))}
            >
              移除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContentBlockPreview({
  block,
  consumer = false,
}: {
  block: Block;
  consumer?: boolean;
}) {
  const t = block.text;
  switch (block.type) {
    case 'Markdown':
      return <div className="bp-markdown-preview"><ReactMarkdown urlTransform={(url,key)=>key==='src'&&/^data:image\/(?:jpeg|png|webp|gif|avif);base64,[a-z0-9+/=]+$/i.test(url)?url:defaultUrlTransform(url)} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw,[rehypeSanitize,{...defaultSchema,protocols:{...defaultSchema.protocols,src:[...(defaultSchema.protocols?.src||[]),'data']},tagNames:[...(defaultSchema.tagNames||[]),'u']}]]}>{t}</ReactMarkdown></div>;
    case '标题':
      return <h2>{t || '未填写标题'}</h2>;
    case '图片':
    case '视频':
      return <MediaPreview value={t} consumer={consumer} />;
    case '表格':
      return <pre className="bp-content-table">{t}</pre>;
    case '可复制示例':
      return <pre className="bp-content-example">{t}</pre>;
    case '链接':
      return /^https?:\/\//.test(t) ? (
        <a href={t} target="_blank" rel="noreferrer">
          {t}
        </a>
      ) : (
        <p>{t}</p>
      );
    case '资源引用':
      return <p>资源引用：{t}</p>;
    default:
      return <p style={{whiteSpace:"pre-wrap"}}>{t}</p>;
  }
}
