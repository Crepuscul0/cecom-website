'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { DevLoginForm } from './DevLoginForm';

interface AuthModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
 const [mode, setMode] = useState<'login' | 'signup' | 'dev'>('dev');

 if (!isOpen) return null;

 const handleSuccess = () => {
 onSuccess();
 onClose();
 };

 const toggleMode = () => {
 setMode(mode === 'login' ? 'signup' : 'login');
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="relative max-w-md w-full">
 <button
 onClick={onClose}
 className="absolute -top-4 -right-4 bg-background rounded-full p-2 shadow-lg hover:bg-accent z-10"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>

 {mode === 'dev' ? (
 <DevLoginForm onSuccess={handleSuccess} />
 ) : mode === 'login' ? (
 <LoginForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
 ) : (
 <SignUpForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
 )}
 
 {mode !== 'dev' && (
 <div className="mt-4 text-center">
 <button
 onClick={() => setMode('dev')}
 className="text-sm text-yellow-600 hover:text-yellow-700"
 >
 Modo Desarrollo
 </button>
 </div>
 )}
 </div>
 </div>
 );
}