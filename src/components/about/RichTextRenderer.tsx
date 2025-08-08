'use client'

import React from 'react'

interface RichTextNode {
  type?: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  children?: RichTextNode[]
  url?: string
  newTab?: boolean
}

interface RichTextRendererProps {
  content: RichTextNode[]
  className?: string
}

export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  const renderNode = (node: RichTextNode, index: number): React.ReactNode => {
    // Handle text nodes
    if (node.text !== undefined) {
      let textElement: React.ReactNode = node.text

      // Apply text formatting
      if (node.bold) {
        textElement = <strong key={`bold-${index}`}>{textElement}</strong>
      }
      if (node.italic) {
        textElement = <em key={`italic-${index}`}>{textElement}</em>
      }
      if (node.underline) {
        textElement = <u key={`underline-${index}`}>{textElement}</u>
      }
      if (node.strikethrough) {
        textElement = <s key={`strike-${index}`}>{textElement}</s>
      }
      if (node.code) {
        textElement = (
          <code key={`code-${index}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
            {textElement}
          </code>
        )
      }

      return textElement
    }

    // Handle element nodes
    const children = node.children?.map((child, childIndex) => 
      renderNode(child, childIndex)
    ) || []

    switch (node.type) {
      case 'h1':
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-900 mb-4">
            {children}
          </h1>
        )
      case 'h2':
        return (
          <h2 key={index} className="text-2xl font-semibold text-gray-900 mb-3">
            {children}
          </h2>
        )
      case 'h3':
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-900 mb-2">
            {children}
          </h3>
        )
      case 'h4':
        return (
          <h4 key={index} className="text-lg font-semibold text-gray-900 mb-2">
            {children}
          </h4>
        )
      case 'p':
        return (
          <p key={index} className="text-gray-600 mb-4 leading-relaxed">
            {children}
          </p>
        )
      case 'ul':
        return (
          <ul key={index} className="list-disc list-inside text-gray-600 mb-4 space-y-1">
            {children}
          </ul>
        )
      case 'ol':
        return (
          <ol key={index} className="list-decimal list-inside text-gray-600 mb-4 space-y-1">
            {children}
          </ol>
        )
      case 'li':
        return (
          <li key={index} className="leading-relaxed">
            {children}
          </li>
        )
      case 'blockquote':
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4">
            {children}
          </blockquote>
        )
      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target={node.newTab ? '_blank' : undefined}
            rel={node.newTab ? 'noopener noreferrer' : undefined}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {children}
          </a>
        )
      default:
        // Handle unknown types or fragments
        return <span key={index}>{children}</span>
    }
  }

  return (
    <div className={className}>
      {content.map((node, index) => renderNode(node, index))}
    </div>
  )
}