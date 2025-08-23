'use client';

import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Convert markdown-like content to HTML
  const processContent = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-foreground mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-foreground mt-10 mb-6">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-foreground mt-12 mb-8">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^- (.*$)/gim, '<li class="mb-2">$1</li>')
      .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside mb-6 space-y-2 text-muted-foreground ml-4">$1</ul>')
      
      // Paragraphs
      .replace(/^(?!<[h|u|l])(.*$)/gim, '<p class="mb-6 text-muted-foreground leading-relaxed">$1</p>')
      
      // Clean up empty paragraphs
      .replace(/<p class="mb-6 text-muted-foreground leading-relaxed"><\/p>/g, '');
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Process code blocks separately
  const renderContentWithCodeBlocks = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const language = lines[0].replace('```', '').trim() || 'text';
        const code = lines.slice(1, -1).join('\n');
        const codeId = `code-${index}`;
        
        return (
          <div key={index} className="relative mb-6">
            <div className="bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted-foreground/10 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {language}
                </span>
                <button
                  onClick={() => copyToClipboard(code, codeId)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded"
                >
                  {copiedCode === codeId ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-foreground font-mono">
                  {code}
                </code>
              </pre>
            </div>
          </div>
        );
      } else {
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: processContent(part) }}
          />
        );
      }
    });
  };

  return (
    <div className="prose prose-lg max-w-none">
      <div className="blog-content">
        {renderContentWithCodeBlocks(content)}
      </div>
      
      <style jsx>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3 {
          scroll-margin-top: 100px;
        }
        
        .blog-content img {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
        }
        
        .blog-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          background: hsl(var(--accent));
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }
        
        .blog-content th,
        .blog-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.75rem;
          text-align: left;
        }
        
        .blog-content th {
          background: hsl(var(--muted));
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
