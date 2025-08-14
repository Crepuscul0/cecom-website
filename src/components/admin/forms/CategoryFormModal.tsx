'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/admin';
import { FormModal, FormInput, FormTextarea, FormSelect, FormButtons } from './index';
import { IconPicker } from '../IconPicker';
import { validateCategoryName, validateCategorySlug } from '@/lib/validation/admin';

interface CategoryFormModalProps {
  isOpen: boolean;
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  slug: string;
  order: number;
  icon: string;
}

export function CategoryFormModal({ 
  isOpen, 
  category, 
  onClose, 
  onSuccess 
}: CategoryFormModalProps) {
  const t = useTranslations('Admin.forms.category');
  const [formData, setFormData] = useState<FormData>({
    nameEn: '',
    nameEs: '',
    descriptionEn: '',
    descriptionEs: '',
    slug: '',
    order: 0,
    icon: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        nameEn: category.name?.en || '',
        nameEs: category.name?.es || '',
        descriptionEn: category.description?.en || '',
        descriptionEs: category.description?.es || '',
        slug: category.slug || '',
        order: category.order || 0,
        icon: category.icon || ''
      });
    } else {
      // Reset form for new category
      setFormData({
        nameEn: '',
        nameEs: '',
        descriptionEn: '',
        descriptionEs: '',
        slug: '',
        order: 0,
        icon: ''
      });
    }
    setError('');
  }, [category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      nameEn: value,
      slug: prev.slug === '' ? generateSlug(value) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate category name uniqueness
      const nameValidation = await validateCategoryName(
        formData.nameEn, 
        formData.nameEs, 
        category?.id
      );
      
      if (!nameValidation.isValid) {
        setError(nameValidation.error || t('errorSaving'));
        setLoading(false);
        return;
      }

      // Validate slug uniqueness
      const slugValidation = await validateCategorySlug(
        formData.slug, 
        category?.id
      );
      
      if (!slugValidation.isValid) {
        setError(slugValidation.error || t('errorSaving'));
        setLoading(false);
        return;
      }

      const categoryData = {
        name: {
          en: formData.nameEn,
          es: formData.nameEs
        },
        description: {
          en: formData.descriptionEn,
          es: formData.descriptionEs
        },
        slug: formData.slug,
        order: formData.order,
        icon: formData.icon
      };

      if (category?.id) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t('errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const title = category ? t('editTitle') : t('newTitle');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('nameEn')}
              value={formData.nameEn}
              onChange={handleNameEnChange}
              required
              placeholder="Technology Solutions"
            />
            <FormInput
              label={t('nameEs')}
              value={formData.nameEs}
              onChange={(e) => setFormData(prev => ({ ...prev, nameEs: e.target.value }))}
              required
              placeholder="Soluciones Tecnológicas"
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              label={t('descriptionEn')}
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder="Description in English..."
            />
            <FormTextarea
              label={t('descriptionEs')}
              value={formData.descriptionEs}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
              placeholder="Descripción en español..."
            />
          </div>

          {/* Slug and Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormInput
                label={t('slug')}
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
                placeholder="technology-solutions"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.nameEn) }))}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {t('generateSlug')}
              </button>
            </div>
            <FormInput
              label={t('order')}
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('icon')}
            </label>
            <IconPicker
              selectedIcon={formData.icon}
              onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
            />
          </div>
        </div>

        <FormButtons
          onCancel={onClose}
          onSave={handleSubmit}
          saveText={t('save')}
          cancelText={t('cancel')}
          isLoading={loading}
          loadingText={t('saving')}
        />
      </form>
    </FormModal>
  );
}