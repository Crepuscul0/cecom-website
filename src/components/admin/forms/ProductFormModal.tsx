'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Product, Category, Vendor } from '@/types/admin';
import { FormModal, FormInput, FormTextarea, FormSelect, FormButtons, FormList } from './index';
import { validateProductName } from '@/lib/validation/admin';

interface ProductFormModalProps {
  isOpen: boolean;
  product?: Product | null;
  categories: Category[];
  vendors: Vendor[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  featuresEn: string[];
  featuresEs: string[];
  categoryId: string;
  vendorId: string;
  order: number;
  active: boolean;
}

export function ProductFormModal({ 
  isOpen, 
  product, 
  categories, 
  vendors, 
  onClose, 
  onSuccess 
}: ProductFormModalProps) {
  const t = useTranslations('Admin.forms.product');
  const [formData, setFormData] = useState<FormData>({
    nameEn: '',
    nameEs: '',
    descriptionEn: '',
    descriptionEs: '',
    featuresEn: [''],
    featuresEs: [''],
    categoryId: '',
    vendorId: '',
    order: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        nameEn: product.name?.en || '',
        nameEs: product.name?.es || '',
        descriptionEn: product.description?.en || '',
        descriptionEs: product.description?.es || '',
        featuresEn: product.features?.en || [''],
        featuresEs: product.features?.es || [''],
        categoryId: product.category_id || '',
        vendorId: product.vendor_id || '',
        order: product.order || 0,
        active: product.active !== false
      });
    } else {
      // Reset form for new product
      setFormData({
        nameEn: '',
        nameEs: '',
        descriptionEn: '',
        descriptionEs: '',
        featuresEn: [''],
        featuresEs: [''],
        categoryId: '',
        vendorId: '',
        order: 0,
        active: true
      });
    }
    setError('');
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate product name uniqueness within category
      if (formData.categoryId) {
        const nameValidation = await validateProductName(
          formData.nameEn, 
          formData.nameEs, 
          formData.categoryId,
          product?.id
        );
        
        if (!nameValidation.isValid) {
          setError(nameValidation.error || t('errorSaving'));
          setLoading(false);
          return;
        }
      }

      const productData = {
        name: {
          en: formData.nameEn,
          es: formData.nameEs
        },
        description: {
          en: formData.descriptionEn,
          es: formData.descriptionEs
        },
        features: {
          en: formData.featuresEn.filter(f => f.trim()),
          es: formData.featuresEs.filter(f => f.trim())
        },
        category_id: formData.categoryId,
        vendor_id: formData.vendorId,
        order: formData.order,
        active: formData.active
      };

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

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

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name?.en || cat.name?.es || 'Unnamed Category'
  }));

  const vendorOptions = vendors.map(vendor => ({
    value: vendor.id,
    label: vendor.name
  }));

  const title = product ? t('editTitle') : t('newTitle');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-4xl"
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
              onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
              required
              placeholder="WatchGuard Firebox T15"
            />
            <FormInput
              label={t('nameEs')}
              value={formData.nameEs}
              onChange={(e) => setFormData(prev => ({ ...prev, nameEs: e.target.value }))}
              required
              placeholder="WatchGuard Firebox T15"
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              label={t('descriptionEn')}
              value={formData.descriptionEn}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
              placeholder="Product description in English..."
            />
            <FormTextarea
              label={t('descriptionEs')}
              value={formData.descriptionEs}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
              placeholder="Descripción del producto en español..."
            />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormList
              label={t('featuresEn')}
              items={formData.featuresEn}
              onItemsChange={(items) => setFormData(prev => ({ ...prev, featuresEn: items }))}
              addButtonText={t('addFeature')}
              removeButtonText={t('removeFeature')}
              placeholder="Advanced threat protection"
            />
            <FormList
              label={t('featuresEs')}
              items={formData.featuresEs}
              onItemsChange={(items) => setFormData(prev => ({ ...prev, featuresEs: items }))}
              addButtonText={t('addFeature')}
              removeButtonText={t('removeFeature')}
              placeholder="Protección avanzada contra amenazas"
            />
          </div>

          {/* Category, Vendor, Order, Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect
              label={t('category')}
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              options={categoryOptions}
              placeholder={t('selectCategory')}
              required
            />
            <FormSelect
              label={t('vendor')}
              value={formData.vendorId}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
              options={vendorOptions}
              placeholder={t('selectVendor')}
              required
            />
            <FormInput
              label={t('order')}
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              min="0"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('active')}
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.active ? t('active') : 'Inactive'}
                </span>
              </div>
            </div>
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