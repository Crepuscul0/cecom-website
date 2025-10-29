import { useState, useMemo } from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Product, Category, Vendor } from '@/types/admin';
import { ScrollableTableContainer } from './ScrollableTableContainer';
import { DeleteConfirmationDialog, useDeleteConfirmation } from '../DeleteConfirmationDialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  vendors: Vendor[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
}

export function ProductsTable({ 
  products, 
  categories, 
  vendors, 
  onRefresh,
  onAdd,
  onEdit
}: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('products-search') || '';
    }
    return '';
  });
  const [categoryFilter, setCategoryFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('products-category-filter') || 'all';
    }
    return 'all';
  });
  const [vendorFilter, setVendorFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('products-vendor-filter') || 'all';
    }
    return 'all';
  });
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('products-status-filter') || 'all';
    }
    return 'all';
  });
  const t = useTranslations('Admin');
  const deleteConfirmation = useDeleteConfirmation();
  const { showError } = useErrorHandler();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name?.en || t('tables.noCategory');
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || t('tables.noVendor');
  };

  // Filter products based on search term and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryName = getCategoryName(product.category_id);
      const vendorName = getVendorName(product.vendor_id);
      
      // Search filter
      const matchesSearch = !searchTerm || (
        product.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name?.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Category filter
      const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;

      // Vendor filter
      const matchesVendor = vendorFilter === 'all' || product.vendor_id === vendorFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.active) ||
        (statusFilter === 'inactive' && !product.active);
      
      return matchesSearch && matchesCategory && matchesVendor && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, vendorFilter, statusFilter, categories, vendors, t]);

  const handleDeleteProduct = async (product: Product) => {
    const productName = product.name?.en || product.name?.es;
    
    deleteConfirmation.showDeleteConfirmation(
      'product',
      async () => {
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);
          
          if (error) throw error;
          onRefresh();
        } catch (error) {
          console.error('Error deleting product:', error);
          showError('deleteProduct');
          throw error; // Re-throw to keep loading state
        }
      },
      productName
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">{t('tables.products')}</h3>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {t('buttons.newProduct')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.searchProducts')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              localStorage.setItem('products-search', e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md search-input bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              localStorage.setItem('products-category-filter', e.target.value);
            }}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('filters.allCategories')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name?.en || category.name?.es || category.slug}
              </option>
            ))}
          </select>

          {/* Vendor Filter */}
          <select
            value={vendorFilter}
            onChange={(e) => {
              setVendorFilter(e.target.value);
              localStorage.setItem('products-vendor-filter', e.target.value);
            }}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('filters.allVendors')}</option>
            {vendors.map(vendor => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              localStorage.setItem('products-status-filter', e.target.value);
            }}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('filters.allStatus')}</option>
            <option value="active">{t('filters.active')}</option>
            <option value="inactive">{t('filters.inactive')}</option>
          </select>
        </div>
      </div>
      
      <ScrollableTableContainer scrollKey="products-table">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                {t('tables.image')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.products')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.category')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.vendor')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    {product.external_image_url ? (
                      <img 
                        src={product.external_image_url}
                        alt={product.name?.en || 'Product image'}
                        className="h-10 w-10 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {product.name?.en || t('tables.noName')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.name?.es || t('tables.noTranslation')}
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
                    {product.active ? t('tables.active') : t('tables.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {t('buttons.edit')}
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('buttons.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTableContainer>

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.hideConfirmation}
        onConfirm={deleteConfirmation.handleConfirm}
        itemType={deleteConfirmation.config.itemType}
        itemName={deleteConfirmation.config.itemName}
        loading={deleteConfirmation.loading}
      />
    </div>
  );
}