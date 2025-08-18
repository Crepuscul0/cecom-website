import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product => {
      const categoryName = getCategoryName(product.category_id);
      const vendorName = getVendorName(product.vendor_id);
      
      return (
        product.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name?.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [products, searchTerm, categories, vendors, t]);

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

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.searchProducts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md search-input bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <ScrollableTableContainer>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
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