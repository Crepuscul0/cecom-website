import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const features = [
  {
    name: 'cybersecurity.name',
    description: 'cybersecurity.description',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: 'networking.name',
    description: 'networking.description',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 12v-2m0 4v2m-4-2h2m4 0h2m-7-5 1-1m5 5 1-1m-6-3 1-1m4 4 1-1" />
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: 'servers.name',
    description: 'servers.description',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6" y2="6" />
        <line x1="6" y1="18" x2="6" y2="18" />
      </svg>
    ),
  },
  {
    name: 'storage.name',
    description: 'storage.description',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 12v-2m0 4v2m-4-2h2m4 0h2m-7-5 1-1m5 5 1-1m-6-3 1-1m4 4 1-1" />
      </svg>
    ),
  },
];

export default function Solutions() {
  const t = useTranslations('Solutions');

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            {t('ourSolutions')}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('businessNeeds')}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('wideRange')}
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <Card key={feature.name}>
                <CardHeader>
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-2 rounded-lg bg-blue-600">
                    <feature.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <CardTitle>{t(feature.name)}</CardTitle>
                  <CardDescription>{t(feature.description)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

