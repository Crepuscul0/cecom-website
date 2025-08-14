import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserProfile, UserProfile } from '@/lib/supabase';
import { Category, Vendor, Product } from '@/types/admin';

export function useAdminData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  return {
    categories,
    vendors,
    products,
    loading,
    user,
    userProfile,
    checkAuth,
    loadData,
    setUser,
    setUserProfile
  };
}