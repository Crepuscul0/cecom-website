'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DevLoginFormProps {
 onSuccess: () => void;
}

export function DevLoginForm({ onSuccess }: DevLoginFormProps) {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleDevLogin = async () => {
 setLoading(true);
 setError('');

 try {
 // Create a mock admin user for development
 // This completely bypasses Supabase authentication
 const mockAdminUser = {
 id: '2b59e7ae-277f-40f2-b777-c09ec8542609',
 email: 'admin@cecom.com.do',
 role: 'administrator',
 first_name: 'Admin',
 last_name: 'CECOM',
 active: true
 };

 // Store user info in localStorage for development
 localStorage.setItem('dev_user', JSON.stringify(mockAdminUser));

 console.log('🧪 Modo desarrollo activado:', mockAdminUser);
 onSuccess();
 } catch (err) {
 setError('Error en el inicio de sesión de desarrollo');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="w-full max-w-md mx-auto">
 <div className="bg-background rounded-lg shadow-md p-6">
 <div className="text-center mb-6">
 <h2 className="text-2xl font-bold text-foreground">Modo Desarrollo</h2>
 <p className="text-muted-foreground mt-2">Acceso directo al panel de administración</p>
 </div>

 <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
 <div className="flex">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-yellow-800">
 Modo de Desarrollo
 </h3>
 <div className="mt-2 text-sm text-yellow-700">
 <p>
 Este botón bypasa la autenticación de Supabase para desarrollo.
 En producción, usa el sistema de login normal.
 </p>
 </div>
 </div>
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
 {error}
 </div>
 )}

 <button
 onClick={handleDevLogin}
 disabled={loading}
 className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Accediendo...' : 'Acceso de Desarrollo'}
 </button>

 <div className="mt-4 p-3 bg-background rounded-md">
 <p className="text-xs text-muted-foreground text-center">
 <strong>Usuario:</strong> admin@cecom.com.do<br />
 <strong>Rol:</strong> Administrator<br />
 <strong>Modo:</strong> Desarrollo (sin autenticación)
 </p>
 </div>
 </div>
 </div>
 );
}