"use client";

/**
 * RichTextEditor — a lightweight contenteditable editor for the admin panel.
 * No external dependencies. Outputs HTML stored in the `content` field.
 * Supports: Bold, Italic, Underline, Strikethrough, H2, H3, ordered/unordered
 * lists, blockquote, and inline image insertion.
 */

import { useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  hasError?: boolean;
  minHeight?: string;
}

type FormatCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock";

interface ToolbarButton {
  icon: React.ReactNode;
  title: string;
  action: () => void;
  isBlock?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here…",
  hasError = false,
  minHeight = "min-h-[240px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value → DOM (only when value changes externally)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const exec = useCallback((command: FormatCommand, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    // Sync back after command
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Insert image from file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "recipes");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Image upload failed");
        return;
      }
      // Insert image at cursor position
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${json.data.url}" alt="Recipe image" style="max-width:100%;border-radius:8px;margin:8px 0;" />`
      );
      if (editorRef.current) {
        isInternalUpdate.current = true;
        onChange(editorRef.current.innerHTML);
      }
      toast.success("Image inserted");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: <Bold size={14} />,
      title: "Bold (Ctrl+B)",
      action: () => exec("bold"),
    },
    {
      icon: <Italic size={14} />,
      title: "Italic (Ctrl+I)",
      action: () => exec("italic"),
    },
    {
      icon: <Underline size={14} />,
      title: "Underline (Ctrl+U)",
      action: () => exec("underline"),
    },
    {
      icon: <Strikethrough size={14} />,
      title: "Strikethrough",
      action: () => exec("strikeThrough"),
    },
    {
      icon: <Heading2 size={14} />,
      title: "Heading 2",
      action: () => exec("formatBlock", "<h2>"),
      isBlock: true,
    },
    {
      icon: <Heading3 size={14} />,
      title: "Heading 3",
      action: () => exec("formatBlock", "<h3>"),
      isBlock: true,
    },
    {
      icon: <List size={14} />,
      title: "Bullet list",
      action: () => exec("insertUnorderedList"),
    },
    {
      icon: <ListOrdered size={14} />,
      title: "Numbered list",
      action: () => exec("insertOrderedList"),
    },
    {
      icon: <Quote size={14} />,
      title: "Blockquote",
      action: () => exec("formatBlock", "<blockquote>"),
      isBlock: true,
    },
  ];

  const borderCls = hasError
    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-400/10"
    : "border-slate-100 focus-within:border-amber-600 focus-within:ring-amber-600/10";

  return (
    <div className={`rounded-2xl border bg-slate-50 overflow-hidden focus-within:ring-2 transition-all ${borderCls}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-white">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.title}
            type="button"
            title={btn.title}
            onMouseDown={(e) => {
              e.preventDefault(); // keep focus in editor
              btn.action();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            {btn.icon}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-5 bg-slate-100 mx-1" />

        {/* Insert image button */}
        <button
          type="button"
          title="Insert image"
          disabled={uploading}
          onMouseDown={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className={[
          minHeight,
          "p-4 text-sm text-[#1a1a2e] outline-none",
          // Prose styles for the editor content
          "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2",
          "[&_li]:my-0.5",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-3",
          "[&_strong]:font-bold",
          "[&_em]:italic",
          "[&_u]:underline",
          "[&_s]:line-through",
          "[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2",
          // Placeholder via CSS
          "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:pointer-events-none",
        ].join(" ")}
      />
    </div>
  );
}
