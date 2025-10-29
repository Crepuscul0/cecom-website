'use client';

import { ReactNode, useEffect } from 'react';
import { useScrollIndicator } from '@/components/ui/ScrollIndicator';
import { useTranslations } from 'next-intl';

interface ScrollableTableContainerProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  indicatorText?: string;
  indicatorVariant?: 'default' | 'minimal' | 'arrow-only';
  scrollKey?: string; // Unique key to save scroll position
}

export function ScrollableTableContainer({ 
  children, 
  className = '',
  maxHeight = 'max-h-96',
  indicatorText,
  indicatorVariant = 'default',
  scrollKey
}: ScrollableTableContainerProps) {
  const { containerRef, ScrollIndicator } = useScrollIndicator();
  const t = useTranslations('Admin.scrollIndicator');
  
  // Use translation as default if no text is provided
  const displayText = indicatorText || t('moreRowsBelow');

  // Save scroll position when scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !scrollKey) return;

    const handleScroll = () => {
      localStorage.setItem(`scroll-${scrollKey}`, container.scrollTop.toString());
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, scrollKey]);

  // Restore scroll position on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !scrollKey) return;

    const savedScroll = localStorage.getItem(`scroll-${scrollKey}`);
    if (savedScroll) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        container.scrollTop = parseInt(savedScroll, 10);
      }, 100);
    }
  }, [containerRef, scrollKey]);

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={`overflow-x-auto ${maxHeight} scrollbar-hide table-scroll border border-border rounded-md ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <ScrollIndicator 
        text={displayText}
        variant={indicatorVariant}
      />
    </div>
  );
}