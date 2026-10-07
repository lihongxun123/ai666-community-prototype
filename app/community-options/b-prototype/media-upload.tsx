'use client';
import {useRef, useState} from 'react';
import Image from 'next/image';
import {Modal} from 'antd';
import {GripVertical, Plus, X} from 'lucide-react';
import './media-upload.css';

export type MediaUploadItem = {url: string; type?: 'image' | 'video'; name?: string};
export type MediaUploadProps = {
  items: MediaUploadItem[];
  onFiles: (files: File[]) => void | Promise<void>;
  onRemove: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  maxCount?: number;
  label?: string;
  busy?: boolean;
  firstAsCover?: boolean;
};

function Media({item, preview = false}: {item: MediaUploadItem; preview?: boolean}) {
  if (!item.url) return <span className="bp-media-upload-missing">需重新选择素材</span>;
  return item.type === 'video' ? <video src={item.url} controls={preview} muted={!preview} preload="metadata" playsInline><track kind="captions" /></video> : <Image src={item.url} alt={item.name || '媒体图片'} width={preview ? 1000 : 280} height={preview ? 750 : 220} unoptimized />;
}

/** Presentation only: file validation and persistence remain with the caller. */
export function MediaUpload({items, onFiles, onRemove, onReorder, accept, multiple = false, disabled = false, maxCount, label = '媒体资源', busy = false, firstAsCover = true}: MediaUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const dragging = useRef<number | null>(null);
  const pending = useRef(false);
  const [working, setWorking] = useState(false);
  const [dragover, setDragover] = useState(false);
  const [preview, setPreview] = useState<MediaUploadItem | null>(null);
  const locked = disabled || busy || working;
  const full = multiple && maxCount !== undefined && items.length >= maxCount;
  const receive = async (files: File[]) => {
    if (locked || full || pending.current || !files.length) return;
    pending.current = true;
    setWorking(true);
    try { await onFiles(files); } finally { pending.current = false; setWorking(false); }
  };
  const open = () => { if (!locked && !full) input.current?.click(); };
  return <div className="bp-media-upload">
    <div className="bp-media-upload-head"><span>{label}</span><span className="bp-media-upload-count">{items.length}{maxCount !== undefined && ` / ${maxCount}`}</span></div>
    {!disabled && <p className="bp-media-upload-hint">{multiple ? (firstAsCover ? '第一张为封面，可拖动排序；支持点击或拖放上传' : '可拖动调整顺序；支持点击或拖放上传') : '支持点击或拖放上传，可替换当前素材'}</p>}
    <input ref={input} className="bp-media-upload-input" type="file" aria-label={`选择${label}`} accept={accept} multiple={multiple} disabled={locked || full} onChange={e => {const files = Array.from(e.target.files || []); e.target.value = ''; void receive(files);}} />
    <div className={`bp-media-upload-panel${dragover ? ' is-dragover' : ''}`} onDragOver={e => {e.preventDefault(); if (!locked && !full && dragging.current === null && e.dataTransfer.types.includes('Files')) setDragover(true);}} onDragLeave={e => {if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragover(false);}} onDrop={e => {e.preventDefault(); setDragover(false); if (dragging.current !== null) return; void receive(Array.from(e.dataTransfer.files));}}>
      <button type="button" className="bp-media-upload-action bp-media-upload-cover" disabled={!items.length && locked} onClick={() => items[0] ? setPreview(items[0]) : open()} aria-label={items.length ? (firstAsCover ? '预览封面' : '预览首项素材') : `上传${label}`}>
        {items[0] ? <><Media item={items[0]} /><span className="bp-media-upload-badge">{firstAsCover ? (items[0].type === 'video' ? '视频封面' : '封面') : '预览'}</span></> : <span className="bp-media-upload-placeholder">{disabled ? '暂无素材' : (firstAsCover ? '上传后自动作为封面' : '上传后预览素材')}</span>}
      </button>
      <div className="bp-media-upload-list">
        {items.map((item,index) => <div className="bp-media-upload-thumb" key={`${item.url}-${index}`} onDragOver={e => {if (dragging.current !== null && !locked) {e.preventDefault(); e.dataTransfer.dropEffect = 'move';}}} onDrop={e => {const from = dragging.current; if (from === null || locked || !onReorder) return; e.preventDefault(); e.stopPropagation(); dragging.current = null; if (from !== index) onReorder(from,index);}}>
          <button type="button" className="bp-media-upload-action bp-media-upload-view" aria-label={`预览素材 ${index + 1}`} onClick={() => setPreview(item)}><Media item={item} /></button>
          <span className="bp-media-upload-badge">{index === 0 && firstAsCover ? '封面' : index + 1}</span>
          {!disabled && <>
            {onReorder && multiple && items.length > 1 && <button type="button" className="bp-media-upload-action bp-media-upload-handle" disabled={locked} draggable={!locked} aria-label={`拖动排序素材 ${index + 1}；方向键调整顺序`} onDragStart={e => {dragging.current = index; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain',String(index));}} onDragEnd={() => {dragging.current = null;}} onKeyDown={e => {const target = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? index-1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? index+1 : -1; if (!locked && target >= 0 && target < items.length) {e.preventDefault(); onReorder(index,target);}}}><GripVertical size={14} /></button>}
            <button type="button" className="bp-media-upload-action bp-media-upload-remove" aria-label={`移除素材 ${index + 1}`} disabled={locked} onClick={() => onRemove(index)}><X size={14} /></button>
          </>}
        </div>)}
        {!disabled && <button type="button" className="bp-media-upload-action bp-media-upload-add" disabled={locked || full} onClick={open}><Plus size={22} /><span>{busy || working ? '处理中…' : full ? '已达上限' : items.length && !multiple ? '替换素材' : '上传素材'}</span></button>}
      </div>
    </div>
    <Modal open={!!preview} title={preview?.name || '媒体预览'} footer={null} onCancel={() => setPreview(null)} width={900} destroyOnHidden><div className="bp-media-upload-preview">{preview && <Media item={preview} preview />}</div></Modal>
  </div>;
}
