import { getTranslations } from 'next-intl/server';
import { getPageBySlug } from '@/lib/payload/api';
import EmbeddedMap from '@/components/contact/EmbeddedMap';
import ContactForm from '@/components/contact/ContactForm';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';

interface ContactPageProps {
  params: Promise<{
    locale: 'en' | 'es';
  }>;
}

export default async function Contact({ params }: ContactPageProps) {
  const { locale } = await params;
  const t = await getTranslations('Contact');
  
  // Fetch contact page content from Payload
  const contactPage = await getPageBySlug('contact', locale);
  const contactContent = contactPage?.contactInfo;

  return (
    <div className="relative bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {t('getInTouch')}
            </h1>
            <p className="mt-4 text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              {contactContent?.description || t('description')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Contact Information */}
          <div className="mb-12 lg:mb-0">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {locale === 'es' ? 'Información de Contacto' : 'Contact Information'}
            </h2>
            
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('postalAddress')}</h3>
                  <p className="text-muted-foreground mt-1">
                    {contactContent?.address?.line1 || t('addressLine1')}<br />
                    {contactContent?.address?.line2 || t('addressLine2')}<br />
                    {contactContent?.address?.line3 || t('addressLine3')}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('phoneNumber')}</h3>
                  <p className="text-muted-foreground mt-1">
                    <a 
                      href={`tel:${contactContent?.phone || t('phone')}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contactContent?.phone || t('phone')}
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('emailAddress')}</h3>
                  <p className="text-muted-foreground mt-1">
                    <a 
                      href={`mailto:${contactContent?.email || t('email')}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contactContent?.email || t('email')}
                    </a>
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('businessHours')}</h3>
                  <div className="text-muted-foreground mt-1 space-y-1">
                    <p>{contactContent?.businessHours?.weekdays || t('weekdays')}</p>
                    <p>{contactContent?.businessHours?.saturday || t('saturday')}</p>
                    <p>{contactContent?.businessHours?.sunday || t('sunday')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
                {locale === 'es' ? 'Nuestra Ubicación' : 'Our Location'}
              </h3>
              <EmbeddedMap
                address={contactContent?.address?.formatted || `${t('addressLine1')}, ${t('addressLine2')}, ${t('addressLine3')}`}
                embedUrl={contactContent?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.2547!2d-69.9312!3d18.4655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf89f0b1234567%3A0x1234567890abcdef!2sAv.%20Pasteur%2011%2C%20Santo%20Domingo%2C%20Dominican%20Republic!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus'}
                className="w-full"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {locale === 'es' ? 'Envíanos un Mensaje' : 'Send us a Message'}
            </h2>
            <ContactForm locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
