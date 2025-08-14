import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Category, Vendor, Product, AdminTab } from '@/types/admin';
import { StatsCards } from './StatsCards';
import { AdminTabs } from './AdminTabs';
import { CategoriesTable } from './tables/CategoriesTable';
import { VendorsTable } from './tables/VendorsTable';
import { ProductsTable } from './tables/ProductsTable';
import { CategoryFormModal, VendorFormModal, ProductFormModal } from './forms';

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
  // Persist active tab in localStorage to maintain user's position
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-active-tab') || 'categories';
    }
    return 'categories';
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const t = useTranslations('Admin');

  const tabs: AdminTab[] = [
    { id: 'categories', name: t('navigation.categories'), count: categories.length },
    { id: 'vendors', name: t('navigation.vendors'), count: vendors.length },
    { id: 'products', name: t('navigation.products'), count: products.length },
    { id: 'pages', name: t('navigation.pages'), count: 0 },
  ];

  // Handle tab change and persist to localStorage
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-active-tab', tabId);
    }
  };

  const handleFormSuccess = () => {
    setShowProductForm(false);
    setShowCategoryForm(false);
    setShowVendorForm(false);
    setEditingItem(null);
    onRefresh();
    // Don't change the active tab - user should stay where they are
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
          onTabChange={handleTabChange}
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
              <p className="text-muted-foreground">{t('placeholders.pagesComingSoon')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={showProductForm}
        product={editingItem}
        categories={categories}
        vendors={vendors}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      <CategoryFormModal
        isOpen={showCategoryForm}
        category={editingItem}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      <VendorFormModal
        isOpen={showVendorForm}
        vendor={editingItem}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}