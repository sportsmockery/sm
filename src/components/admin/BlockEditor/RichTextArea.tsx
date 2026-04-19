'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Link2, ImageIcon, Youtube,
  Undo2, Redo2, Table,
} from 'lucide-react';

interface RichTextAreaProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// X/Twitter icon (not in lucide)
function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Chart icon
function ChartLineIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
  active,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded transition-colors"
      style={{
        color: active ? '#00D4FF' : '#6b7280',
        backgroundColor: active ? 'rgba(0,212,255,0.1)' : 'transparent',
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-5 mx-0.5" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />;
}

export function RichTextArea({ value, onChange, placeholder = 'Write here...', minHeight = 120 }: RichTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const isFocused = useRef(false);

  // Sync value prop to contentEditable when value changes externally
  // Skip sync while the editor is focused to prevent cursor jumps
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (isFocused.current) return;
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    // Flush changes
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Auto-detect social media URLs and embed them
  const autoEmbedUrl = useCallback((text: string): string | null => {
    const trimmed = text.trim();
    // YouTube
    const ytMatch = trimmed.match(/^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `<div class="my-2"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" width="100%" height="315" frameborder="0" allowfullscreen></iframe></div>`;
    // X/Twitter
    if (/^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/.test(trimmed)) return `<blockquote class="twitter-tweet"><a href="${trimmed}">${trimmed}</a></blockquote>`;
    // Instagram
    if (/^https?:\/\/(?:www\.)?instagram\.com\/(p|reel)\/[\w-]+/.test(trimmed)) return `<blockquote class="instagram-media" data-instgrm-permalink="${trimmed}"><a href="${trimmed}">${trimmed}</a></blockquote>`;
    // TikTok
    if (/^https?:\/\/(?:www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/.test(trimmed)) return `<blockquote class="tiktok-embed" cite="${trimmed}"><a href="${trimmed}">${trimmed}</a></blockquote>`;
    return null;
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (!url) return;
    // Auto-embed social media URLs
    const embed = autoEmbedUrl(url);
    if (embed) {
      exec('insertHTML', embed);
    } else {
      exec('createLink', url);
    }
  }, [exec, autoEmbedUrl]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  }, [exec]);

  const insertYoutube = useCallback(() => {
    const url = prompt('Enter YouTube URL:');
    if (!url) return;
    const match = url.match(/(?:watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]+)/);
    if (match) {
      exec('insertHTML', `<div class="my-2"><iframe src="https://www.youtube.com/embed/${match[1]}" width="100%" height="315" frameborder="0" allowfullscreen></iframe></div>`);
    }
  }, [exec]);

  const insertTweet = useCallback(() => {
    const url = prompt('Enter X/Twitter post URL:');
    if (url) {
      exec('insertHTML', `<blockquote class="twitter-tweet"><a href="${url}">${url}</a></blockquote>`);
    }
  }, [exec]);

  const insertTable = useCallback(() => {
    exec('insertHTML', `<table border="1" style="border-collapse:collapse;width:100%"><tr><td style="padding:8px;border:1px solid #ddd">&nbsp;</td><td style="padding:8px;border:1px solid #ddd">&nbsp;</td><td style="padding:8px;border:1px solid #ddd">&nbsp;</td></tr><tr><td style="padding:8px;border:1px solid #ddd">&nbsp;</td><td style="padding:8px;border:1px solid #ddd">&nbsp;</td><td style="padding:8px;border:1px solid #ddd">&nbsp;</td></tr></table>`);
  }, [exec]);

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.15)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap"
        style={{
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <ToolbarButton onClick={() => exec('bold')} title="Bold (Ctrl+B)">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Italic (Ctrl+I)">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('strikeThrough')} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton onClick={() => exec('formatBlock', 'h2')} title="Heading 2">
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', 'h3')} title="Heading 3">
          <Heading3 size={14} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet List">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered List">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', 'blockquote')} title="Blockquote">
          <Quote size={14} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton onClick={insertLink} title="Insert Link">
          <Link2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={insertImage} title="Insert Image">
          <ImageIcon size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={insertYoutube} title="Embed YouTube">
          <Youtube size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={insertTweet} title="Embed X/Twitter">
          <XIcon size={14} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton onClick={() => insertTable()} title="Insert Table">
          <Table size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('insertHTML', '<hr/>')} title="Insert Chart placeholder">
          <ChartLineIcon size={14} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton onClick={() => exec('undo')} title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('redo')} title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={14} />
        </ToolbarButton>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => { isFocused.current = false; }}
        onInput={handleInput}
        onPaste={(e) => {
          e.preventDefault();
          const plain = e.clipboardData.getData('text/plain');
          const html = e.clipboardData.getData('text/html');
          // Auto-embed social media links pasted as plain text
          const embed = autoEmbedUrl(plain);
          if (embed) {
            document.execCommand('insertHTML', false, embed);
          } else {
            document.execCommand('insertHTML', false, html || plain);
          }
        }}
        className="sm-richtext-editor w-full bg-white text-sm text-[#0B0F14] outline-none"
        style={{
          minHeight,
          padding: '12px',
          lineHeight: 1.6,
        }}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
