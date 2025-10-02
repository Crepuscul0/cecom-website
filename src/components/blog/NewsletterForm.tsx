'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface NewsletterFormProps {
  locale: string;
}

export function NewsletterForm({ locale }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already_subscribed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const t = useTranslations('Blog');
  const isSpanish = locale === 'es';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          locale: locale as 'en' | 'es',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        if (result.code === 'ALREADY_SUBSCRIBED') {
          setStatus('already_subscribed');
        } else {
          setStatus('error');
          setErrorMessage(result.error || 'Failed to subscribe');
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          message: isSpanish 
            ? '¡Suscripción exitosa! Revisa tu email.' 
            : 'Successfully subscribed! Check your email.',
          className: 'text-green-800 bg-green-50 border-green-200'
        };
      case 'already_subscribed':
        return {
          icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
          message: isSpanish 
            ? 'Ya estás suscrito a nuestro newsletter.' 
            : 'You are already subscribed to our newsletter.',
          className: 'text-yellow-800 bg-yellow-50 border-yellow-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          message: errorMessage || (isSpanish 
            ? 'Error al suscribirse. Inténtalo de nuevo.' 
            : 'Failed to subscribe. Please try again.'),
          className: 'text-red-800 bg-red-50 border-red-200'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="space-y-3">
      {/* Status Message */}
      {statusInfo && (
        <div className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${statusInfo.className}`}>
          {statusInfo.icon}
          <span>{statusInfo.message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isSpanish ? 'Tu email' : 'Your email'}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
          disabled={isSubmitting}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isSpanish ? 'Suscribiendo...' : 'Subscribing...'}
            </>
          ) : (
            isSpanish ? 'Suscribirse' : 'Subscribe'
          )}
        </button>
      </form>

      {/* Privacy Notice */}
      <p className="text-xs text-muted-foreground">
        {isSpanish 
          ? 'Al suscribirte, aceptas recibir emails de CECOM. Puedes darte de baja en cualquier momento.'
          : 'By subscribing, you agree to receive emails from CECOM. You can unsubscribe at any time.'
        }
      </p>
    </div>
  );
}