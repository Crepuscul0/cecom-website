import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Vendor } from '@/types/admin';

interface VendorsTableProps {
  vendors: Vendor[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (vendor: Vendor) => void;
}

export function VendorsTable({ 
  vendors, 
  onRefresh, 
  onAdd, 
  onEdit 
}: VendorsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors;
    
    return vendors.filter(vendor => 
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.website?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendors, searchTerm]);
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

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md search-input bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-96 scrollbar-hide table-scroll border border-border rounded-md"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
            {filteredVendors.map((vendor) => (
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