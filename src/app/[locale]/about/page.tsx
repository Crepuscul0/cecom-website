import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getPageBySlug, getTeamMembers, getVendors } from '@/lib/payload/api';
import { RichTextRenderer } from '@/components/about/RichTextRenderer';
import { TeamMember } from '@/components/about/TeamMember';
import { VendorGrid } from '@/components/about/VendorGrid';
import { MissionVisionValues } from '@/components/about/MissionVisionValues';
import { CompanyCredibility } from '@/components/about/CompanyCredibility';

interface AboutPageProps {
  params: Promise<{
    locale: 'en' | 'es';
  }>;
}

export default async function About({ params }: AboutPageProps) {
  const { locale } = await params;
  // Fetch data from Payload CMS
  const [aboutPage, teamMembers, vendors] = await Promise.all([
    getPageBySlug('about', locale),
    getTeamMembers(locale),
    getVendors()
  ]);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl lg:text-6xl">
            {aboutPage?.title || (locale === 'es' ? 'Nosotros' : 'About Us')}
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground">
            {locale === 'es' 
              ? 'Conoce más sobre nuestra empresa, nuestro equipo y nuestros valores.'
              : 'Learn more about our company, our team, and our values.'
            }
          </p>
        </div>

        {/* Mission, Vision & Values */}
        <MissionVisionValues />

        {/* Company Credibility */}
        <CompanyCredibility />

        {/* Team Section */}
        {teamMembers && teamMembers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {locale === 'es' ? 'Nuestro Equipo' : 'Our Team'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {locale === 'es'
                  ? 'Conoce a los profesionales que hacen posible nuestro éxito y el de nuestros clientes.'
                  : 'Meet the professionals who make our success and that of our clients possible.'
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <TeamMember
                  key={member.id}
                  name={member.name}
                  position={member.position}
                  bio={member.bio}
                  image={member.image}
                />
              ))}
            </div>
          </div>
        )}

        {/* Vendor Partners Section */}
        {vendors && vendors.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {locale === 'es' ? 'Nuestros Socios' : 'Our Partners'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {locale === 'es'
                  ? 'Trabajamos con las mejores marcas del mercado para ofrecerte soluciones de calidad.'
                  : 'We work with the best brands in the market to offer you quality solutions.'
                }
              </p>
            </div>
            <VendorGrid vendors={vendors} />
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {locale === 'es' ? '¿Listo para trabajar con nosotros?' : 'Ready to work with us?'}
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              {locale === 'es'
                ? 'Contáctanos hoy mismo y descubre cómo podemos ayudarte a alcanzar tus objetivos tecnológicos.'
                : 'Contact us today and discover how we can help you achieve your technology goals.'
              }
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200"
            >
              {locale === 'es' ? 'Contáctanos' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
