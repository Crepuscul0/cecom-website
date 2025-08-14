'use client';

import { ReactNode } from 'react';
import { useScrollIndicator } from '@/components/ui/ScrollIndicator';
import { useTranslations } from 'next-intl';

interface ScrollableTableContainerProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  indicatorText?: string;
  indicatorVariant?: 'default' | 'minimal' | 'arrow-only';
}

export function ScrollableTableContainer({ 
  children, 
  className = '',
  maxHeight = 'max-h-96',
  indicatorText,
  indicatorVariant = 'default'
}: ScrollableTableContainerProps) {
  const { containerRef, ScrollIndicator } = useScrollIndicator();
  const t = useTranslations('Admin.scrollIndicator');
  
  // Use translation as default if no text is provided
  const displayText = indicatorText || t('moreRowsBelow');

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