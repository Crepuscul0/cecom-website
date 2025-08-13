'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Vendor {
 id?: string;
 name: string;
 website?: string;
 description?: { en: string; es: string };
}

interface VendorFormProps {
 vendor?: Vendor | null;
 onClose: () => void;
 onSuccess: () => void;
}

export function VendorForm({ vendor, onClose, onSuccess }: VendorFormProps) {
 const [formData, setFormData] = useState({
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
 }
 }, [vendor]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const vendorData = {
 name: formData.name,
 website: formData.website || null,
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
 } catch (err: any) {
 setError(err.message || 'Error al guardar el proveedor');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-background dark:bg-[#0a1222] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex justify-between items-center p-6 border-b">
 <h2 className="text-xl font-semibold text-foreground">
 {vendor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
 {/* Basic Info */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Nombre del Proveedor *
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="WatchGuard"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">
 Sitio Web
 </label>
 <input
 type="url"
 value={formData.website}
 onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring"
 placeholder="https://www.watchguard.com"
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
 placeholder="Leading provider of network security solutions..."
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
 placeholder="Proveedor líder de soluciones de seguridad de red..."
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
 {loading ? 'Guardando...' : (vendor ? 'Actualizar' : 'Crear')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}