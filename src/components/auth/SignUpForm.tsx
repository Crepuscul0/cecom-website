'use client';

import { useState } from 'react';
import { signUp, UserRole } from '@/lib/supabase';

interface SignUpFormProps {
 onSuccess: () => void;
 onToggleMode: () => void;
}

export function SignUpForm({ onSuccess, onToggleMode }: SignUpFormProps) {
 const [formData, setFormData] = useState({
 email: '',
 password: '',
 confirmPassword: '',
 firstName: '',
 lastName: '',
 role: 'employee' as UserRole
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 if (formData.password !== formData.confirmPassword) {
 setError('Las contraseñas no coinciden');
 setLoading(false);
 return;
 }

 if (formData.password.length < 6) {
 setError('La contraseña debe tener al menos 6 caracteres');
 setLoading(false);
 return;
 }

 try {
 const { error } = await signUp(formData.email, formData.password, {
 first_name: formData.firstName,
 last_name: formData.lastName,
 role: formData.role
 });
 
 if (error) {
 setError(error.message);
 } else {
 onSuccess();
 }
 } catch (err) {
 setError('Error inesperado al crear la cuenta');
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 setFormData(prev => ({
 ...prev,
 [e.target.name]: e.target.value
 }));
 };

 return (
 <div className="w-full max-w-md mx-auto">
 <div className="bg-background rounded-lg shadow-md p-6">
 <div className="text-center mb-6">
 <h2 className="text-2xl font-bold text-foreground">Crear Cuenta</h2>
 <p className="text-muted-foreground mt-2">Registrarse en el sistema</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
 Nombre
 </label>
 <input
 id="firstName"
 name="firstName"
 type="text"
 value={formData.firstName}
 onChange={handleChange}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="Juan"
 />
 </div>

 <div>
 <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
 Apellido
 </label>
 <input
 id="lastName"
 name="lastName"
 type="text"
 value={formData.lastName}
 onChange={handleChange}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="Pérez"
 />
 </div>
 </div>

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
 Correo Electrónico
 </label>
 <input
 id="email"
 name="email"
 type="email"
 value={formData.email}
 onChange={handleChange}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="usuario@cecom.com.do"
 />
 </div>

 <div>
 <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
 Rol
 </label>
 <select
 id="role"
 name="role"
 value={formData.role}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 >
 <option value="employee">Empleado</option>
 <option value="seller">Vendedor</option>
 <option value="administrator">Administrador</option>
 </select>
 </div>

 <div>
 <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
 Contraseña
 </label>
 <input
 id="password"
 name="password"
 type="password"
 value={formData.password}
 onChange={handleChange}
 required
 className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
 placeholder="••••••••"
 />
 </div>

 <div>
 <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
 Confirmar Contraseña
 </label>
 <input
 id="confirmPassword"
 name="confirmPassword"
 type="password"
 value={formData.confirmPassword}
 onChange={handleChange}
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
 {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
 </button>
 </form>

 <div className="mt-6 text-center">
 <p className="text-sm text-muted-foreground">
 ¿Ya tienes cuenta?{' '}
 <button
 onClick={onToggleMode}
 className="text-blue-600 hover:text-blue-700 font-medium"
 >
 Iniciar sesión
 </button>
 </p>
 </div>
 </div>
 </div>
 );
}