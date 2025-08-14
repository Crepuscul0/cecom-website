import { useState } from 'react';
import { Category, Vendor, Product, AdminTab } from '@/types/admin';
import { StatsCards } from './StatsCards';
import { AdminTabs } from './AdminTabs';
import { CategoriesTable } from './tables/CategoriesTable';
import { VendorsTable } from './tables/VendorsTable';
import { ProductsTable } from './tables/ProductsTable';
import { ProductForm } from './ProductForm';
import { CategoryForm } from './CategoryForm';
import { VendorForm } from './VendorForm';

interface AdminContentProps {
  categories: Category[];
  vendors: Vendor[];
  products: Product[];
  onRefresh: () => void;
}

export function AdminContent({ 
  categories, 
  vendors, 
  products, 
  onRefresh 
}: AdminContentProps) {
  const [activeTab, setActiveTab] = useState('categories');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const tabs: AdminTab[] = [
    { id: 'categories', name: 'Categorías', count: categories.length },
    { id: 'vendors', name: 'Proveedores', count: vendors.length },
    { id: 'products', name: 'Productos', count: products.length },
    { id: 'pages', name: 'Páginas', count: 0 },
  ];

  const handleFormSuccess = () => {
    setShowProductForm(false);
    setShowCategoryForm(false);
    setShowVendorForm(false);
    setEditingItem(null);
    onRefresh();
  };

  const handleFormClose = () => {
    setShowProductForm(false);
    setShowCategoryForm(false);
    setShowVendorForm(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <StatsCards 
        categories={categories}
        vendors={vendors}
        products={products}
      />

      {/* Tabs */}
      <div className="bg-card rounded-lg shadow-sm">
        <AdminTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'categories' && (
            <CategoriesTable 
              categories={categories} 
              onRefresh={onRefresh}
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
              onRefresh={onRefresh}
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
              onRefresh={onRefresh}
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

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          product={editingItem}
          categories={categories}
          vendors={vendors}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          category={editingItem}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showVendorForm && (
        <VendorForm
          vendor={editingItem}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}