'use client';

import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserProfile, UserProfile, canModifyContent, signOut } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProductForm } from '@/components/admin/ProductForm';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { VendorForm } from '@/components/admin/VendorForm';

interface Category {
 id: string;
 name: { en: string; es: string };
 description: { en: string; es: string };
 slug: string;
 order: number;
 icon: string;
}

interface Vendor {
 id: string;
 name: string;
 website: string;
 description: { en: string; es: string };
}

interface Product {
 id: string;
 name: { en: string; es: string };
 description: { en: string; es: string };
 features: { en: string[]; es: string[] };
 category_id: string;
 vendor_id: string;
 order: number;
 active: boolean;
}

export function AdminDashboard() {
 const [activeTab, setActiveTab] = useState('categories');
 const [categories, setCategories] = useState<Category[]>([]);
 const [vendors, setVendors] = useState<Vendor[]>([]);
 const [products, setProducts] = useState<Product[]>([]);
 const [loading, setLoading] = useState(true);
 const [user, setUser] = useState<any>(null);
 const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
 const [showAuthModal, setShowAuthModal] = useState(false);
 const [showProductForm, setShowProductForm] = useState(false);
 const [showCategoryForm, setShowCategoryForm] = useState(false);
 const [showVendorForm, setShowVendorForm] = useState(false);
 const [editingItem, setEditingItem] = useState<any>(null);

 useEffect(() => {
 checkAuth();
 loadData();
 }, []);

 const checkAuth = async () => {
 // Check for development mode user first
 const devUser = localStorage.getItem('dev_user');
 if (devUser) {
 const userData = JSON.parse(devUser);
 setUser({ id: userData.id, email: userData.email });
 setUserProfile(userData);
 return;
 }

 const currentUser = await getCurrentUser();
 setUser(currentUser);
 
 if (currentUser) {
 const profile = await getUserProfile(currentUser.id);
 setUserProfile(profile);
 }
 };

 const handleAuthSuccess = () => {
 checkAuth();
 };

 const handleSignOut = async () => {
 // Clear development mode
 localStorage.removeItem('dev_user');
 
 await signOut();
 setUser(null);
 setUserProfile(null);
 };

 const loadData = async () => {
 setLoading(true);
 try {
 // Check if we're in development mode
 const devUser = localStorage.getItem('dev_user');
 if (devUser) {
 console.log('🧪 Cargando datos en modo desarrollo...');
 }

 const [categoriesRes, vendorsRes, productsRes] = await Promise.all([
 supabase.from('categories').select('*').order('order'),
 supabase.from('vendors').select('*').order('name'),
 supabase.from('products').select('*').order('order')
 ]);

 if (categoriesRes.data) setCategories(categoriesRes.data);
 if (vendorsRes.data) setVendors(vendorsRes.data);
 if (productsRes.data) setProducts(productsRes.data);

 if (categoriesRes.error) console.error('Error loading categories:', categoriesRes.error);
 if (vendorsRes.error) console.error('Error loading vendors:', vendorsRes.error);
 if (productsRes.error) console.error('Error loading products:', productsRes.error);
 } catch (error) {
 console.error('Error loading data:', error);
 } finally {
 setLoading(false);
 }
 };

 const tabs = [
 { id: 'categories', name: 'Categorías', count: categories.length },
 { id: 'vendors', name: 'Proveedores', count: vendors.length },
 { id: 'products', name: 'Productos', count: products.length },
 { id: 'pages', name: 'Páginas', count: 0 },
 ];

 // Show auth modal if user is not authenticated
 if (!user) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center">
 <div className="bg-card rounded-lg shadow-md p-8 max-w-md mx-auto">
 <h1 className="text-2xl font-bold text-foreground mb-4">CECOM CMS</h1>
 <p className="text-muted-foreground mb-6">Necesitas iniciar sesión para acceder al panel de administración</p>
 <button
 onClick={() => setShowAuthModal(true)}
 className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
 >
 Iniciar Sesión
 </button>
 </div>
 </div>
 
 <AuthModal
 isOpen={showAuthModal}
 onClose={() => setShowAuthModal(false)}
 onSuccess={handleAuthSuccess}
 />
 </div>
 );
 }

 // Check if user has permission to access admin
 if (userProfile && !canModifyContent(userProfile.role)) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center">
 <div className="bg-card rounded-lg shadow-md p-8 max-w-md mx-auto">
 <h1 className="text-2xl font-bold text-foreground mb-4">Acceso Denegado</h1>
 <p className="text-muted-foreground mb-6">
 No tienes permisos para acceder al panel de administración.
 <br />
 Rol actual: <span className="font-medium">{userProfile.role}</span>
 </p>
 <button
 onClick={handleSignOut}
 className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
 >
 Cerrar Sesión
 </button>
 </div>
 </div>
 </div>
 );
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
 <p className="mt-4 text-muted-foreground">Cargando panel de administración...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-background">
 {/* Header */}
 <header className="bg-card shadow-sm border-b border-border">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between items-center py-4">
 <div className="flex items-center">
 <h1 className="text-2xl font-bold text-foreground">CECOM CMS</h1>
 <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
 Activo
 </span>
 </div>
 <div className="flex items-center space-x-4">
 <div className="text-sm text-muted-foreground">
 <span className="block">
 {userProfile?.first_name} {userProfile?.last_name}
 </span>
 <span className="text-xs capitalize">
 {userProfile?.role}
 </span>
 </div>
 <button
 onClick={handleSignOut}
 className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
 >
 Cerrar Sesión
 </button>
 </div>
 </div>
 </div>
 </header>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-card p-6 rounded-lg shadow-sm">
 <div className="flex items-center">
 <div className="p-2 bg-blue-100 rounded-lg">
 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m2-2H9m10 0V9" />
 </svg>
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-muted-foreground">Categorías</p>
 <p className="text-2xl font-semibold text-foreground">{categories.length}</p>
 </div>
 </div>
 </div>

 <div className="bg-card p-6 rounded-lg shadow-sm">
 <div className="flex items-center">
 <div className="p-2 bg-green-100 rounded-lg">
 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-muted-foreground">Proveedores</p>
 <p className="text-2xl font-semibold text-foreground">{vendors.length}</p>
 </div>
 </div>
 </div>

 <div className="bg-card p-6 rounded-lg shadow-sm">
 <div className="flex items-center">
 <div className="p-2 bg-purple-100 rounded-lg">
 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-muted-foreground">Productos</p>
 <p className="text-2xl font-semibold text-foreground">{products.length}</p>
 </div>
 </div>
 </div>

 <div className="bg-card p-6 rounded-lg shadow-sm">
 <div className="flex items-center">
 <div className="p-2 bg-yellow-100 rounded-lg">
 <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-muted-foreground">Páginas</p>
 <p className="text-2xl font-semibold text-foreground">3</p>
 </div>
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="bg-card rounded-lg shadow-sm">
 <div className="border-b border-border">
 <nav className="-mb-px flex space-x-8 px-6">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`py-4 px-1 border-b-2 font-medium text-sm ${
 activeTab === tab.id
 ? 'border-blue-500 text-blue-600'
 : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
 }`}
 >
 {tab.name}
 <span className="ml-2 bg-accent text-foreground py-0.5 px-2.5 rounded-full text-xs">
 {tab.count}
 </span>
 </button>
 ))}
 </nav>
 </div>

 <div className="p-6">
 {activeTab === 'categories' && (
 <CategoriesTable 
 categories={categories} 
 onRefresh={loadData}
 onAdd={() => {
 setEditingItem(null);
 setShowCategoryForm(true);
 }}
 onEdit={(category) => {
 setEditingItem(category);
 setShowCategoryForm(true);
 }}
 />
 )}
 {activeTab === 'vendors' && (
 <VendorsTable 
 vendors={vendors} 
 onRefresh={loadData}
 onAdd={() => {
 setEditingItem(null);
 setShowVendorForm(true);
 }}
 onEdit={(vendor) => {
 setEditingItem(vendor);
 setShowVendorForm(true);
 }}
 />
 )}
 {activeTab === 'products' && (
 <ProductsTable 
 products={products} 
 categories={categories} 
 vendors={vendors} 
 onRefresh={loadData}
 onAdd={() => {
 setEditingItem(null);
 setShowProductForm(true);
 }}
 onEdit={(product) => {
 setEditingItem(product);
 setShowProductForm(true);
 }}
 />
 )}
 {activeTab === 'pages' && (
 <div className="text-center py-12">
 <p className="text-muted-foreground">Gestión de páginas próximamente...</p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Modals */}
 {showProductForm && (
 <ProductForm
 product={editingItem}
 categories={categories}
 vendors={vendors}
 onClose={() => {
 setShowProductForm(false);
 setEditingItem(null);
 }}
 onSuccess={() => {
 setShowProductForm(false);
 setEditingItem(null);
 loadData();
 }}
 />
 )}

 {showCategoryForm && (
 <CategoryForm
 category={editingItem}
 onClose={() => {
 setShowCategoryForm(false);
 setEditingItem(null);
 }}
 onSuccess={() => {
 setShowCategoryForm(false);
 setEditingItem(null);
 loadData();
 }}
 />
 )}

 {showVendorForm && (
 <VendorForm
 vendor={editingItem}
 onClose={() => {
 setShowVendorForm(false);
 setEditingItem(null);
 }}
 onSuccess={() => {
 setShowVendorForm(false);
 setEditingItem(null);
 loadData();
 }}
 />
 )}
 </div>
 );
}

function CategoriesTable({ 
 categories, 
 onRefresh, 
 onAdd, 
 onEdit 
}: { 
 categories: Category[]; 
 onRefresh: () => void;
 onAdd: () => void;
 onEdit: (category: Category) => void;
}) {
 const handleDeleteCategory = async (id: string) => {
   if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
     return;
   }
   
   try {
     const { error } = await supabase
       .from('categories')
       .delete()
       .eq('id', id);
     
     if (error) throw error;
     onRefresh();
   } catch (error) {
     console.error('Error deleting category:', error);
     alert('Error al eliminar la categoría');
   }
 };

 return (
 <div>
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-medium text-foreground">Categorías</h3>
 <button 
 onClick={onAdd}
 className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
 >
 + Nueva Categoría
 </button>
 </div>
 
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-border">
 <thead className="bg-muted">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Nombre
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Slug
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Orden
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Acciones
 </th>
 </tr>
 </thead>
 <tbody className="bg-card divide-y divide-border">
 {categories.map((category) => (
 <tr key={category.id}>
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm font-medium text-foreground">
 {category.name?.en || 'Sin nombre'}
 </div>
 <div className="text-sm text-muted-foreground">
 {category.name?.es || 'Sin traducción'}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {category.slug}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {category.order}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
 <button 
   onClick={() => onEdit(category)}
   className="text-blue-600 hover:text-blue-900 mr-4"
 >
 Editar
 </button>
 <button 
   onClick={() => handleDeleteCategory(category.id)}
   className="text-red-600 hover:text-red-900"
 >
 Eliminar
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

function VendorsTable({ 
 vendors, 
 onRefresh, 
 onAdd, 
 onEdit 
}: { 
 vendors: Vendor[]; 
 onRefresh: () => void;
 onAdd: () => void;
 onEdit: (vendor: Vendor) => void;
}) {
 const handleDeleteVendor = async (id: string) => {
   if (!confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
     return;
   }
   
   try {
     const { error } = await supabase
       .from('vendors')
       .delete()
       .eq('id', id);
     
     if (error) throw error;
     onRefresh();
   } catch (error) {
     console.error('Error deleting vendor:', error);
     alert('Error al eliminar el proveedor');
   }
 };

 return (
 <div>
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-medium text-foreground">Proveedores</h3>
 <button 
 onClick={onAdd}
 className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
 >
 + Nuevo Proveedor
 </button>
 </div>
 
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-border">
 <thead className="bg-muted">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Nombre
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Sitio Web
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Acciones
 </th>
 </tr>
 </thead>
 <tbody className="bg-card divide-y divide-border">
 {vendors.map((vendor) => (
 <tr key={vendor.id}>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-foreground">
 {vendor.name}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 {vendor.website ? (
 <a 
 href={vendor.website} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-blue-600 hover:text-blue-900 text-sm"
 >
 {vendor.website}
 </a>
 ) : (
 <span className="text-gray-500 text-sm">Sin sitio web</span>
 )}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
 <button 
   onClick={() => onEdit(vendor)}
   className="text-blue-600 hover:text-blue-900 mr-4"
 >
 Editar
 </button>
 <button 
   onClick={() => handleDeleteVendor(vendor.id)}
   className="text-red-600 hover:text-red-900"
 >
 Eliminar
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

function ProductsTable({ 
 products, 
 categories, 
 vendors, 
 onRefresh,
 onAdd,
 onEdit
}: { 
 products: Product[]; 
 categories: Category[]; 
 vendors: Vendor[]; 
 onRefresh: () => void;
 onAdd: () => void;
 onEdit: (product: Product) => void;
}) {
 const handleDeleteProduct = async (id: string) => {
   if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
     return;
   }
   
   try {
     const { error } = await supabase
       .from('products')
       .delete()
       .eq('id', id);
     
     if (error) throw error;
     onRefresh();
   } catch (error) {
     console.error('Error deleting product:', error);
     alert('Error al eliminar el producto');
   }
 };

 const getCategoryName = (categoryId: string) => {
 const category = categories.find(c => c.id === categoryId);
 return category?.name?.en || 'Sin categoría';
 };

 const getVendorName = (vendorId: string) => {
 const vendor = vendors.find(v => v.id === vendorId);
 return vendor?.name || 'Sin proveedor';
 };

 return (
 <div>
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-medium text-foreground">Productos</h3>
 <button 
 onClick={onAdd}
 className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
 >
 + Nuevo Producto
 </button>
 </div>
 
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-border">
 <thead className="bg-muted">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Producto
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Categoría
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Proveedor
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Estado
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
 Acciones
 </th>
 </tr>
 </thead>
 <tbody className="bg-card divide-y divide-border">
 {products.map((product) => (
 <tr key={product.id}>
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm font-medium text-foreground">
 {product.name?.en || 'Sin nombre'}
 </div>
 <div className="text-sm text-muted-foreground">
 {product.name?.es || 'Sin traducción'}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {getCategoryName(product.category_id)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {getVendorName(product.vendor_id)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
 product.active 
 ? 'bg-green-100 text-green-800' 
 : 'bg-red-100 text-red-800'
 }`}>
 {product.active ? 'Activo' : 'Inactivo'}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
 <button 
   onClick={() => onEdit(product)}
   className="text-blue-600 hover:text-blue-900 mr-4"
 >
 Editar
 </button>
 <button 
   onClick={() => handleDeleteProduct(product.id)}
   className="text-red-600 hover:text-red-900"
 >
 Eliminar
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}