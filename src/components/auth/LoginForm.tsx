'use client';

import { useState } from 'react';
import { signIn } from '@/lib/supabase';

interface LoginFormProps {
 onSuccess: () => void;
 onToggleMode: () => void;
}

export function LoginForm({ onSuccess, onToggleMode }: LoginFormProps) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const { error } = await signIn(email, password);
 
 if (error) {
 setError(error.message);
 } else {
 onSuccess();
 }
 } catch (err) {
 setError('Error inesperado al iniciar sesión');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="w-full max-w-md mx-auto">
 <div className="bg-background rounded-lg shadow-md p-6">
 <div className="text-center mb-6">
 <h2 className="text-2xl font-bold text-foreground">Iniciar Sesión</h2>
 <p className="text-muted-foreground mt-2">Accede al panel de administración</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
 Correo Electrónico
 </label>
 <input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="admin@cecom.com.do"
 />
 </div>

 <div>
 <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
 Contraseña
 </label>
 <input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="••••••••"
 />
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
 {error}
 </div>
 )}

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
 </button>
 </form>

 <div className="mt-6 text-center">
 <p className="text-sm text-muted-foreground">
 ¿No tienes cuenta?{' '}
 <button
 onClick={onToggleMode}
 className="text-blue-600 hover:text-blue-700 font-medium"
 >
 Crear cuenta
 </button>
 </p>
 </div>

 <div className="mt-4 p-3 bg-background rounded-md">
 <p className="text-xs text-muted-foreground text-center">
 <strong>Cuenta de prueba:</strong><br />
 Email: admin@cecom.com.do<br />
 Contraseña: admin123
 </p>
 </div>
 </div>
 </div>
 );
}