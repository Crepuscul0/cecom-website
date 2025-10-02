'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { LinkDialog } from './LinkDialog';
import { ImageDialog } from './ImageDialog';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [linkData, setLinkData] = useState({ url: '', text: '' });
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                paragraph: {
                    HTMLAttributes: {
                        class: 'editor-paragraph',
                    },
                },
            }),
            TextStyle,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
                placeholder: placeholder || 'Start writing...',
            },
        },
    });

    const openLinkDialog = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href || '';
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
        );

        setLinkData({ url: previousUrl, text: selectedText });
        setShowLinkDialog(true);
    }, [editor]);

    const handleLinkConfirm = useCallback((url: string, text?: string) => {
        if (!editor) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // If there's selected text or we're editing an existing link
        if (editor.state.selection.from !== editor.state.selection.to || editor.isActive('link')) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        } else if (text) {
            // Insert new text with link
            editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
        } else {
            // Insert URL as both text and link
            editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
        }
    }, [editor]);

    const openImageDialog = useCallback(() => {
        setShowImageDialog(true);
    }, []);

    const handleImageConfirm = useCallback((src: string, alt?: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src, alt }).run();
    }, [editor]);

    // Update editor content when value prop changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    if (!editor) {
        return (
            <div className={className}>
                <div className="border border-border rounded-lg p-4 bg-background">
                    Loading editor...
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="border border-border rounded-lg bg-background overflow-hidden relative">
                {/* Toolbar */}
                <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-background shadow-sm">
                    {/* Text Formatting */}
                    <div className="flex gap-1 border-r border-border pr-2 mr-2">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('underline') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <UnderlineIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('strike') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Strikethrough className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('code') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Code className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Headings */}
                    <div className="flex gap-1 border-r border-border pr-2 mr-2">
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Heading1 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Heading3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('heading', { level: 4 }) ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Heading4 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Lists */}
                    <div className="flex gap-1 border-r border-border pr-2 mr-2">
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <Quote className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex gap-1 border-r border-border pr-2 mr-2">
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <AlignRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Link */}
                    <div className="flex gap-1 border-r border-border pr-2 mr-2">
                        <button
                            onClick={openLinkDialog}
                            className={`p-2 rounded hover:bg-accent transition-colors ${editor.isActive('link') ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            type="button"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={openImageDialog}
                            className="p-2 rounded hover:bg-accent transition-colors"
                            type="button"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Undo/Redo */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().chain().focus().undo().run()}
                            className="p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().chain().focus().redo().run()}
                            className="p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="bg-background relative">
                    <EditorContent
                        editor={editor}
                        className="prose-editor"
                    />
                </div>
            </div>

            {/* Dialogs */}
            <LinkDialog
                isOpen={showLinkDialog}
                onClose={() => setShowLinkDialog(false)}
                onConfirm={handleLinkConfirm}
                initialUrl={linkData.url}
                initialText={linkData.text}
            />

            <ImageDialog
                isOpen={showImageDialog}
                onClose={() => setShowImageDialog(false)}
                onConfirm={handleImageConfirm}
            />

            <style jsx global>{`
        .prose-editor .ProseMirror {
          outline: none;
          padding: 1rem;
          min-height: 200px;
          color: hsl(var(--foreground));
          background: hsl(var(--background));
        }
        
        .prose-editor .ProseMirror p {
          margin: 1.5rem 0 !important;
          line-height: 1.7;
        }
        
        .prose-editor .ProseMirror p:first-child {
          margin-top: 0 !important;
        }
        
        .prose-editor .ProseMirror p:last-child {
          margin-bottom: 0 !important;
        }
        
        .prose-editor .ProseMirror br + br {
          display: block;
          margin: 1.5rem 0;
          content: "";
        }
        
        .prose-editor .ProseMirror .editor-paragraph {
          margin: 1.5rem 0 !important;
          line-height: 1.7;
        }
        
        .prose-editor .ProseMirror .editor-paragraph:first-child {
          margin-top: 0 !important;
        }
        
        .prose-editor .ProseMirror .editor-paragraph:last-child {
          margin-bottom: 0 !important;
        }
        
        .prose-editor .ProseMirror h1 {
          font-size: 2.25rem !important;
          font-weight: 800 !important;
          line-height: 1.2 !important;
          margin: 2rem 0 1rem 0 !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .prose-editor .ProseMirror h2 {
          font-size: 1.875rem !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          margin: 1.75rem 0 0.875rem 0 !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .prose-editor .ProseMirror h3 {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          line-height: 1.4 !important;
          margin: 1.5rem 0 0.75rem 0 !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .prose-editor .ProseMirror h4 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          line-height: 1.4 !important;
          margin: 1.25rem 0 0.625rem 0 !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .prose-editor .ProseMirror ul {
          list-style-type: disc !important;
          margin-left: 1.5rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0 !important;
        }
        
        .prose-editor .ProseMirror ol {
          list-style-type: decimal !important;
          margin-left: 1.5rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0 !important;
        }
        
        .prose-editor .ProseMirror li {
          margin: 0.5rem 0 !important;
          padding-left: 0.25rem !important;
          color: hsl(var(--foreground)) !important;
          display: list-item !important;
        }
        
        .prose-editor .ProseMirror li::marker {
          color: hsl(var(--foreground)) !important;
        }
        
        .prose-editor .ProseMirror ul ul,
        .prose-editor .ProseMirror ol ol,
        .prose-editor .ProseMirror ul ol,
        .prose-editor .ProseMirror ol ul {
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        
        .prose-editor .ProseMirror .editor-image {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 0.5rem !important;
          margin: 1rem 0 !important;
          display: block !important;
        }
        
        .prose-editor .ProseMirror .editor-image:hover {
          cursor: pointer !important;
          opacity: 0.8 !important;
        }
        
        .prose-editor .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .prose-editor .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        
        .prose-editor .ProseMirror pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .prose-editor .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        
        .prose-editor .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .prose-editor .ProseMirror a:hover {
          text-decoration: none;
        }
        
        .prose-editor .ProseMirror strong {
          font-weight: bold;
        }
        
        .prose-editor .ProseMirror em {
          font-style: italic;
        }
        
        .prose-editor .ProseMirror u {
          text-decoration: underline;
        }
        
        .prose-editor .ProseMirror s {
          text-decoration: line-through;
        }
        
        .prose-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
      `}</style>
        </div>
    );
}