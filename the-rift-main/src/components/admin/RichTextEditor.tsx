"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Undo, Redo, RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  textColor?: string; // applied to editor text for preview
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  textColor,
  minHeight = "80px",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      // Return empty string instead of empty paragraph HTML
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[inherit] prose prose-sm max-w-none",
        style: textColor ? `color: ${textColor}` : "",
        "data-placeholder": placeholder,
      },
    },
  });

  // Sync external value changes (e.g. when switching edit targets)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current !== incoming && incoming !== "<p></p>") {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  // Update text color preview when color changes
  useEffect(() => {
    if (!editor) return;
    const el = editor.view.dom as HTMLElement;
    if (textColor) el.style.color = textColor;
    else el.style.color = "";
  }, [textColor, editor]);

  if (!editor) return null;

  const btnCls = (active?: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
        {/* History */}
        <button type="button" onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} className={btnCls()} title="Undo">
          <Undo size={13} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} className={btnCls()} title="Redo">
          <Redo size={13} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Formatting */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnCls(editor.isActive("bold"))} title="Bold">
          <Bold size={13} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnCls(editor.isActive("italic"))} title="Italic">
          <Italic size={13} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnCls(editor.isActive("underline"))} title="Underline">
          <UnderlineIcon size={13} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Alignment */}
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btnCls(editor.isActive({ textAlign: "left" }))} title="Align left">
          <AlignLeft size={13} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btnCls(editor.isActive({ textAlign: "center" }))} title="Align center">
          <AlignCenter size={13} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btnCls(editor.isActive({ textAlign: "right" }))} title="Align right">
          <AlignRight size={13} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Lists */}
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnCls(editor.isActive("bulletList"))} title="Bullet list">
          <List size={13} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnCls(editor.isActive("orderedList"))} title="Numbered list">
          <ListOrdered size={13} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Clear formatting */}
        <button type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className={btnCls()} title="Clear formatting">
          <RemoveFormatting size={13} />
        </button>
      </div>

      {/* Editor area */}
      <div
        className="px-4 py-3 text-sm"
        style={{ minHeight }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground) / 0.5);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus { outline: none; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.2em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.2em; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror u { text-decoration: underline; }
      `}</style>
    </div>
  );
}
