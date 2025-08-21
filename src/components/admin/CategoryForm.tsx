'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { IconPicker } from './IconPicker';

interface Category {
 id?: string;
 name: { en: string; es: string };
 description: { en: string; es: string };
 slug: string;
 order: number;
 icon: string;
}

interface CategoryFormProps {
 category?: Category | null;
 onClose: () => void;
 onSuccess: () => void;
}

export function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
 const [formData, setFormData] = useState({
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
 }
 }, [category]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
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
 } catch (err: any) {
 setError(err.message || 'Error al guardar la categoría');
 } finally {
 setLoading(false);
 }
 };

 const generateSlug = (name: string) => {
 return name
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/(^-|-$)/g, '');
 };

 const handleNameChange = (field: 'nameEn' | 'nameEs', value: string) => {
 setFormData(prev => ({
 ...prev,
 [field]: value,
 // Auto-generate slug from English name
 slug: field === 'nameEn' ? generateSlug(value) : prev.slug
 }));
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-background dark:bg-[#0a1222] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center p-6 border-b border-border">
 <h2 className="text-xl font-semibold text-foreground">
 {category ? 'Editar Categoría' : 'Nueva Categoría'}
 </h2>
 <button
 onClick={onClose}
 className="text-muted-foreground hover:text-muted-foreground"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 {/* Names */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre (Inglés) *
 </label>
 <input
 type="text"
 value={formData.nameEn}
 onChange={(e) => handleNameChange('nameEn', e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
 placeholder="Cybersecurity"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre (Español) *
 </label>
 <input
 type="text"
 value={formData.nameEs}
 onChange={(e) => handleNameChange('nameEs', e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Ciberseguridad"
 />
 </div>
 </div>

 {/* Descriptions */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Inglés)
 </label>
 <textarea
 value={formData.descriptionEn}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
 rows={3}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Advanced security solutions..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Español)
 </label>
 <textarea
 value={formData.descriptionEs}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
 rows={3}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Soluciones de seguridad avanzadas..."
 />
 </div>
 </div>

 {/* Slug, Order, Icon */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Slug *
 </label>
 <input
 type="text"
 value={formData.slug}
 onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="cybersecurity"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Orden
 </label>
 <input
 type="number"
 value={formData.order}
 onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="0"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Icono
 </label>
 <IconPicker
 selectedIcon={formData.icon}
 onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
 />
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
 {error}
 </div>
 )}

 <div className="flex justify-end space-x-3 pt-4 border-t">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-foreground bg-accent rounded-md hover:bg-gray-200"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
 >
 {loading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}