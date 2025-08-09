"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { contactFormSchema, ContactFormData } from '@/lib/validation/contact';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ContactFormProps {
  locale: 'en' | 'es';
}

export default function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations('Contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(
          locale === 'es' 
            ? 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.'
            : 'Message sent successfully. We will get back to you soon.'
        );
        reset(); // Clear the form
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(
        locale === 'es'
          ? 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.'
          : 'Error sending message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      {/* Success/Error Messages */}
      {submitStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-3 ${
          submitStatus === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{submitMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="sr-only">
            {t('fullName')}
          </Label>
          <Input
            {...register('fullName')}
            type="text"
            id="fullName"
            autoComplete="name"
            placeholder={t('fullNamePlaceholder')}
            className={errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="sr-only">
            {t('email')}
          </Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="sr-only">
            {t('phone')}
          </Label>
          <Input
            {...register('phone')}
            type="tel"
            id="phone"
            autoComplete="tel"
            placeholder={t('phonePlaceholder')}
            className={errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message" className="sr-only">
            {t('message')}
          </Label>
          <textarea
            {...register('message')}
            id="message"
            rows={4}
            className={`block w-full shadow-sm py-3 px-4 placeholder-muted-foreground border rounded-md focus:ring-2 focus:ring-offset-2 transition-colors ${
              errors.message 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-input focus:ring-primary focus:border-primary'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={t('messagePlaceholder')}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {locale === 'es' ? 'Enviando...' : 'Sending...'}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}