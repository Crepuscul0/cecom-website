import { marked } from 'marked'

// Configure marked for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true
})

/**
 * Converts markdown content to HTML
 * This is used as a fallback for blog posts that still have markdown content
 */
export async function markdownToHTML(markdown: string): Promise<string> {
  if (!markdown) return ''
  
  // Check if content is already HTML
  const isHTML = /<h[1-6]>|<p>|<ul>|<ol>|<li>|<strong>|<em>|<a\s/.test(markdown)
  
  if (isHTML) {
    return markdown
  }
  
  // Convert markdown to HTML
  return await marked(markdown)
}

/**
 * Detects if content is markdown or HTML
 */
export function isMarkdown(content: string): boolean {
  if (!content) return false
  
  // Check for HTML tags
  const hasHTMLTags = /<h[1-6]>|<p>|<ul>|<ol>|<li>|<strong>|<em>|<a\s/.test(content)
  if (hasHTMLTags) return false
  
  // Check for markdown syntax
  const hasMarkdownSyntax = /^#{1,6}\s|^\*\*|^##|^\*\s|\[.*\]\(.*\)/m.test(content)
  return hasMarkdownSyntax
}
