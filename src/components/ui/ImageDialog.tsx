'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Image, Upload, Link } from 'lucide-react';

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (src: string, alt?: string) => void;
}

export function ImageDialog({ isOpen, onClose, onConfirm }: ImageDialogProps) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const t = useTranslations('Common');

  useEffect(() => {
    if (isOpen) {
      setSrc('');
      setAlt('');
      setPreviewError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (src.trim()) {
      onConfirm(src.trim(), alt.trim() || undefined);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleImageLoad = () => {
    setPreviewError(false);
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-lg mx-4 p-6"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t('imageDialog.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('imageDialog.imageUrlRequired')}
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                placeholder={t('imageDialog.urlPlaceholder')}
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('imageDialog.altText')}
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={t('imageDialog.altPlaceholder')}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
          </div>

          {/* Image Preview */}
          {src && (
            <div className="border border-border rounded-md p-3 bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">{t('imageDialog.preview')}</p>
              {!previewError ? (
                <img
                  src={src}
                  alt={alt || 'Preview'}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className="max-w-full h-auto max-h-48 rounded border object-contain mx-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-24 bg-muted rounded border">
                  <div className="text-center text-muted-foreground">
                    <Upload className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">{t('imageDialog.failedToLoad')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any)}
              className="flex-1 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              {t('imageDialog.insertImage')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}