'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Vendor } from '@/types/admin';
import { FormModal, FormInput, FormTextarea, FormButtons } from './index';
import { validateVendorName } from '@/lib/validation/admin';

interface VendorFormModalProps {
  isOpen: boolean;
  vendor?: Vendor | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  website: string;
  descriptionEn: string;
  descriptionEs: string;
}

export function VendorFormModal({ 
  isOpen, 
  vendor, 
  onClose, 
  onSuccess 
}: VendorFormModalProps) {
  const t = useTranslations('Admin.forms.vendor');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    website: '',
    descriptionEn: '',
    descriptionEs: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        website: vendor.website || '',
        descriptionEn: vendor.description?.en || '',
        descriptionEs: vendor.description?.es || ''
      });
    } else {
      // Reset form for new vendor
      setFormData({
        name: '',
        website: '',
        descriptionEn: '',
        descriptionEs: ''
      });
    }
    setError('');
  }, [vendor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate vendor name uniqueness
      const nameValidation = await validateVendorName(
        formData.name, 
        vendor?.id
      );
      
      if (!nameValidation.isValid) {
        setError(nameValidation.error || t('errorSaving'));
        setLoading(false);
        return;
      }

      const vendorData = {
        name: formData.name,
        website: formData.website,
        description: {
          en: formData.descriptionEn,
          es: formData.descriptionEs
        }
      };

      if (vendor?.id) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', vendor.id);

        if (error) throw error;
      } else {
        // Create new vendor
        const { error } = await supabase
          .from('vendors')
          .insert(vendorData);

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

  const title = vendor ? t('editTitle') : t('newTitle');

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

          {/* Name and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('name')}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Microsoft"
            />
            <FormInput
              label={t('website')}
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://www.microsoft.com"
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