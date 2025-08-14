'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  className?: string;
  text?: string;
  variant?: 'default' | 'minimal' | 'arrow-only';
}

export function ScrollIndicator({ 
  containerRef, 
  className = '', 
  text,
  variant = 'default'
}: ScrollIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);
  const t = useTranslations('Admin.scrollIndicator');
  
  // Use translation as default if no text is provided
  const displayText = text || t('moreRowsBelow');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const hasVerticalScroll = container.scrollHeight > container.clientHeight;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;
      
      setShowIndicator(hasVerticalScroll && !isAtBottom);
    };

    // Check initially
    checkScrollable();

    // Check on scroll
    const handleScroll = () => {
      checkScrollable();
    };

    // Check on resize (in case content changes)
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
    });

    container.addEventListener('scroll', handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  if (!showIndicator) return null;

  const getIndicatorContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="bg-muted/80 text-muted-foreground px-2 py-1 rounded-md shadow-sm flex items-center gap-1 text-xs scroll-indicator scroll-indicator-fade-in backdrop-blur-sm">
            <ChevronDown className="h-3 w-3 animate-pulse" />
          </div>
        );
      case 'arrow-only':
        return (
          <div className="bg-primary/70 text-primary-foreground p-1 rounded-full shadow-md scroll-indicator scroll-indicator-fade-in backdrop-blur-sm">
            <ChevronDown className="h-4 w-4 animate-pulse" />
          </div>
        );
      default:
        return (
          <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs scroll-indicator scroll-indicator-fade-in backdrop-blur-sm border border-primary/20">
            <span className="font-medium">{displayText}</span>
            <ChevronDown className="h-3 w-3 animate-pulse" />
          </div>
        );
    }
  };

  return (
    <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 ${className}`}>
      {getIndicatorContent()}
    </div>
  );
}

// Hook personalizado para usar con el ScrollIndicator
export function useScrollIndicator() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return {
    containerRef,
    ScrollIndicator: ({ 
      className, 
      text, 
      variant 
    }: { 
      className?: string;
      text?: string;
      variant?: 'default' | 'minimal' | 'arrow-only';
    }) => (
      <ScrollIndicator 
        containerRef={containerRef} 
        className={className}
        text={text}
        variant={variant}
      />
    )
  };
}