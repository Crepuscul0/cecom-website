'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  externalImageUrl: string;
  datasheetUrl: string;
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
    externalImageUrl: '',
    datasheetUrl: '',
    order: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const resetForm = useCallback(() => {
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
        externalImageUrl: product.external_image_url || '',
        datasheetUrl: product.external_datasheet_url || '',
        order: product.order || 0,
        active: product.active !== undefined ? product.active : true
      });
    } else {
      setFormData({
        nameEn: '',
        nameEs: '',
        descriptionEn: '',
        descriptionEs: '',
        featuresEn: [''],
        featuresEs: [''],
        categoryId: '',
        vendorId: '',
        externalImageUrl: '',
        datasheetUrl: '',
        order: 0,
        active: true
      });
    }

    setError('');
    setSelectedFile(null);
    setImagePreviewError(false);
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    setImagePreviewError(false);
  }, [formData.externalImageUrl]);

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
          en: formData.featuresEn.filter(f => f.trim() !== ''),
          es: formData.featuresEs.filter(f => f.trim() !== '')
        },
        category_id: formData.categoryId,
        vendor_id: formData.vendorId,
        external_image_url: formData.externalImageUrl || null,
        external_datasheet_url: formData.datasheetUrl || null,
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

  const categoryOptions = useMemo(() => {
    return categories.map(cat => {
      const level = cat.level || 0
      const indent = '  '.repeat(level)
      const label = cat.name?.en || cat.name?.es || 'Unnamed Category'
      
      return {
        value: cat.id,
        label: `${indent}${label}${level > 0 ? ` (${cat.parent_id ? 'Subcategory' : 'Category'})` : ''}`
      }
    });
  }, [categories]);

  const vendorOptions = useMemo(() => {
    return vendors.map(vendor => ({
      value: vendor.id,
      label: vendor.name
    }));
  }, [vendors]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleImageUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadingImage(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);

      const response = await fetch('/api/admin/upload-product-image', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormData(prev => ({ ...prev, externalImageUrl: data.imageUrl }));
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  }, [selectedFile]);

  // Memoized change handlers
  const handleNameEnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, nameEn: e.target.value }));
  }, []);

  const handleNameEsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, nameEs: e.target.value }));
  }, []);

  const handleDescriptionEnChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, descriptionEn: e.target.value }));
  }, []);

  const handleDescriptionEsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, descriptionEs: e.target.value }));
  }, []);

  const handleImageUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, externalImageUrl: e.target.value }));
  }, []);

  const handleDatasheetUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, datasheetUrl: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, categoryId: e.target.value }));
  }, []);

  const handleVendorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, vendorId: e.target.value }));
  }, []);

  const handleOrderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }));
  }, []);

  const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, active: e.target.checked }));
  }, []);

  const handleFeaturesEnChange = useCallback((items: string[]) => {
    setFormData(prev => ({ ...prev, featuresEn: items }));
  }, []);

  const handleFeaturesEsChange = useCallback((items: string[]) => {
    setFormData(prev => ({ ...prev, featuresEs: items }));
  }, []);

  const handleRemoveImage = useCallback(() => {
    setFormData(prev => ({ ...prev, externalImageUrl: '' }));
  }, []);

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
              onChange={handleNameEnChange}
              required
              placeholder="WatchGuard Firebox T15"
            />
            <FormInput
              label={t('nameEs')}
              value={formData.nameEs}
              onChange={handleNameEsChange}
              required
              placeholder="WatchGuard Firebox T15"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('imageUrl')}
              </label>
              <div className="flex gap-2 items-start">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={!selectedFile || uploadingImage}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap font-medium"
                >
                  {uploadingImage ? t('uploading') : t('uploadImage')}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('uploadHelp')}</p>
            </div>
            
            <FormInput
              label={t('imageUrlOrUpload')}
              value={formData.externalImageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg or /products/image.jpg"
              type="text"
            />
            
            <FormInput
              label={t('datasheetUrl')}
              value={formData.datasheetUrl}
              onChange={handleDatasheetUrlChange}
              placeholder="https://example.com/datasheet.pdf"
              type="url"
            />
            
            {formData.externalImageUrl && (
              <div className="p-4 bg-muted/50 rounded-md border border-border space-y-3">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium text-foreground">Image Preview:</p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    {t('removeImage')}
                  </button>
                </div>
                <div className="relative w-full max-w-sm h-48">
                  {!imagePreviewError ? (
                    <Image
                      src={formData.externalImageUrl}
                      alt="Product preview"
                      fill
                      className="object-contain rounded-md border border-border bg-background"
                      sizes="(min-width: 768px) 384px, 100vw"
                      onError={() => setImagePreviewError(true)}
                      onLoadingComplete={() => setImagePreviewError(false)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-md border border-border bg-muted text-xs text-red-600">
                      ⚠️ Failed to load image. Please check the URL.
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground break-all">{formData.externalImageUrl}</p>
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              label={t('descriptionEn')}
              value={formData.descriptionEn}
              onChange={handleDescriptionEnChange}
              placeholder="Product description in English..."
            />
            <FormTextarea
              label={t('descriptionEs')}
              value={formData.descriptionEs}
              onChange={handleDescriptionEsChange}
              placeholder="Descripción del producto en español..."
            />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormList
              label={t('featuresEn')}
              items={formData.featuresEn}
              onItemsChange={handleFeaturesEnChange}
              addButtonText={t('addFeature')}
              removeButtonText={t('removeFeature')}
              placeholder="Advanced threat protection"
            />
            <FormList
              label={t('featuresEs')}
              items={formData.featuresEs}
              onItemsChange={handleFeaturesEsChange}
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
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder={t('selectCategory')}
              required
            />
            <FormSelect
              label={t('vendor')}
              value={formData.vendorId}
              onChange={handleVendorChange}
              options={vendorOptions}
              placeholder={t('selectVendor')}
              required
            />
            <FormInput
              label={t('order')}
              type="number"
              value={formData.order.toString()}
              onChange={handleOrderChange}
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
                  onChange={handleActiveChange}
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
          onSave={() => {}}
          saveText={t('save')}
          cancelText={t('cancel')}
          isLoading={loading}
          loadingText={t('saving')}
        />
      </form>
    </FormModal>
  );
}