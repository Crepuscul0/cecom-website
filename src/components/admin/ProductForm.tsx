'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Product {
 id?: string;
 name: { en: string; es: string };
 description: { en: string; es: string };
 features: { en: string[]; es: string[] };
 category_id: string;
 vendor_id: string;
 order: number;
 active: boolean;
}

interface Category {
 id: string;
 name: { en: string; es: string };
}

interface Vendor {
 id: string;
 name: string;
}

interface ProductFormProps {
 product?: Product | null;
 categories: Category[];
 vendors: Vendor[];
 onClose: () => void;
 onSuccess: () => void;
}

export function ProductForm({ product, categories, vendors, onClose, onSuccess }: ProductFormProps) {
 const [formData, setFormData] = useState({
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
 }
 }, [product]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
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
 } catch (err: any) {
 setError(err.message || 'Error al guardar el producto');
 } finally {
 setLoading(false);
 }
 };

 const addFeature = (lang: 'en' | 'es') => {
 const field = lang === 'en' ? 'featuresEn' : 'featuresEs';
 setFormData(prev => ({
 ...prev,
 [field]: [...prev[field], '']
 }));
 };

 const removeFeature = (lang: 'en' | 'es', index: number) => {
 const field = lang === 'en' ? 'featuresEn' : 'featuresEs';
 setFormData(prev => ({
 ...prev,
 [field]: prev[field].filter((_, i) => i !== index)
 }));
 };

 const updateFeature = (lang: 'en' | 'es', index: number, value: string) => {
 const field = lang === 'en' ? 'featuresEn' : 'featuresEs';
 setFormData(prev => ({
 ...prev,
 [field]: prev[field].map((f, i) => i === index ? value : f)
 }));
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-background dark:bg-[#0a1222] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center p-6 border-b">
 <h2 className="text-xl font-semibold text-foreground">
 {product ? 'Editar Producto' : 'Nuevo Producto'}
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
 onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="WatchGuard Firebox T15"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre (Español) *
 </label>
 <input
 type="text"
 value={formData.nameEs}
 onChange={(e) => setFormData(prev => ({ ...prev, nameEs: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="WatchGuard Firebox T15"
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
 rows={4}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Entry-level firewall with advanced threat protection..."
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Descripción (Español)
 </label>
 <textarea
 value={formData.descriptionEs}
 onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
 rows={4}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Firewall de nivel básico con protección avanzada contra amenazas..."
 />
 </div>
 </div>

 {/* Features */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Características (Inglés)
 </label>
 {formData.featuresEn.map((feature, index) => (
 <div key={index} className="flex gap-2 mb-2">
 <input
 type="text"
 value={feature}
 onChange={(e) => updateFeature('en', index, e.target.value)}
 className="flex-1 px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Advanced threat protection"
 />
 <button
 type="button"
 onClick={() => removeFeature('en', index)}
 className="px-3 py-2 text-red-600 hover:text-red-800"
 >
 ×
 </button>
 </div>
 ))}
 <button
 type="button"
 onClick={() => addFeature('en')}
 className="text-blue-600 hover:text-blue-800 text-sm"
 >
 + Agregar característica
 </button>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Características (Español)
 </label>
 {formData.featuresEs.map((feature, index) => (
 <div key={index} className="flex gap-2 mb-2">
 <input
 type="text"
 value={feature}
 onChange={(e) => updateFeature('es', index, e.target.value)}
 className="flex-1 px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="Protección avanzada contra amenazas"
 />
 <button
 type="button"
 onClick={() => removeFeature('es', index)}
 className="px-3 py-2 text-red-600 hover:text-red-800"
 >
 ×
 </button>
 </div>
 ))}
 <button
 type="button"
 onClick={() => addFeature('es')}
 className="text-blue-600 hover:text-blue-800 text-sm"
 >
 + Agregar característica
 </button>
 </div>
 </div>

 {/* Category, Vendor, Order, Active */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Categoría *
 </label>
 <select
 value={formData.categoryId}
 onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="">Seleccionar categoría</option>
 {categories.map(category => (
 <option key={category.id} value={category.id}>
 {category.name?.es || category.name?.en}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Proveedor *
 </label>
 <select
 value={formData.vendorId}
 onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="">Seleccionar proveedor</option>
 {vendors.map(vendor => (
 <option key={vendor.id} value={vendor.id}>
 {vendor.name}
 </option>
 ))}
 </select>
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
 Estado
 </label>
 <select
 value={formData.active ? 'true' : 'false'}
 onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 >
 <option value="true">Activo</option>
 <option value="false">Inactivo</option>
 </select>
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
 {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}