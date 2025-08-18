import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/admin';
import { ScrollableTableContainer } from './ScrollableTableContainer';
import { DeleteConfirmationDialog, useDeleteConfirmation } from '../DeleteConfirmationDialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface CategoriesTableProps {
  categories: Category[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (category: Category) => void;
}

export function CategoriesTable({ 
  categories, 
  onRefresh, 
  onAdd, 
  onEdit 
}: CategoriesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const t = useTranslations('Admin');
  const deleteConfirmation = useDeleteConfirmation();
  const { showError } = useErrorHandler();

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category => 
      category.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name?.es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleDeleteCategory = async (category: Category) => {
    const categoryName = category.name?.en || category.name?.es || category.slug;
    
    deleteConfirmation.showDeleteConfirmation(
      'category',
      async () => {
        try {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', category.id);
          
          if (error) throw error;
          onRefresh();
        } catch (error) {
          console.error('Error deleting category:', error);
          showError('deleteCategory');
          throw error; // Re-throw to keep loading state
        }
      },
      categoryName
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">{t('tables.categories')}</h3>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {t('buttons.newCategory')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.searchCategories')}
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
                {t('tables.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.slug')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.order')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('tables.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {category.name?.en || t('tables.noName')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.name?.es || t('tables.noTranslation')}
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
                    {t('buttons.edit')}
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category)}
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