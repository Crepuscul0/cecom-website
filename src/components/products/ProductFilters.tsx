'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductFiltersProps {
  locale: string;
  currentCategory?: string;
  currentBrand?: string;
  currentSearch?: string;
}

export function ProductFilters({ 
  locale, 
  currentCategory, 
  currentBrand, 
  currentSearch 
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');
  
  const isSpanish = locale === 'es';

  const categories = [
    'networking',
    'security',
    'wireless',
    'storage',
    'servers'
  ];

  const brands = [
    'Extreme Networks',
    'WatchGuard',
    'Avaya',
    'HP Enterprise',
    'Axis',
    '3CX'
  ];

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/${locale}/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', search);
  };

  const clearFilters = () => {
    router.push(`/${locale}/products`);
    setSearch('');
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder={isSpanish ? 'Buscar productos...' : 'Search products...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline">
            {isSpanish ? 'Buscar' : 'Search'}
          </Button>
        </form>

        {/* Category Filter */}
        <Select
          value={currentCategory || ''}
          onValueChange={(value) => updateFilters('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isSpanish ? 'Categoría' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {isSpanish ? 'Todas las categorías' : 'All categories'}
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand Filter */}
        <Select
          value={currentBrand || ''}
          onValueChange={(value) => updateFilters('brand', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isSpanish ? 'Marca' : 'Brand'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {isSpanish ? 'Todas las marcas' : 'All brands'}
            </SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearFilters}>
          {isSpanish ? 'Limpiar filtros' : 'Clear filters'}
        </Button>
      </div>

      {/* Active Filters Display */}
      {(currentCategory || currentBrand || currentSearch) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">
            {isSpanish ? 'Filtros activos:' : 'Active filters:'}
          </span>
          {currentCategory && (
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
              {isSpanish ? 'Categoría:' : 'Category:'} {currentCategory}
            </span>
          )}
          {currentBrand && (
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
              {isSpanish ? 'Marca:' : 'Brand:'} {currentBrand}
            </span>
          )}
          {currentSearch && (
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
              {isSpanish ? 'Búsqueda:' : 'Search:'} "{currentSearch}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
