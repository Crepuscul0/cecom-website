import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Contact() {
  const t = useTranslations('Contact');

  return (
    <div className="relative bg-white">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50" />
      </div>
      <div className="relative max-w-7xl mx-auto lg:grid lg:grid-cols-5">
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:col-span-2 lg:px-8 lg:py-24 xl:pr-12">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {t('getInTouch')}
            </h2>
            <p className="mt-3 text-lg leading-6 text-gray-500">
              {t('description')}
            </p>
            <dl className="mt-8 text-base text-gray-500">
              <div>
                <dt className="sr-only">{t('postalAddress')}</dt>
                <dd>
                  <p>{t('addressLine1')}</p>
                  <p>{t('addressLine2')}</p>
                </dd>
              </div>
              <div className="mt-6">
                <dt className="sr-only">{t('phoneNumber')}</dt>
                <dd className="flex">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="ml-3">{t('phone')}</span>
                </dd>
              </div>
              <div className="mt-3">
                <dt className="sr-only">{t('emailAddress')}</dt>
                <dd className="flex">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="ml-3">{t('email')}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="bg-white py-16 px-4 sm:px-6 lg:col-span-3 lg:py-24 lg:px-8 xl:pl-12">
          <div className="max-w-lg mx-auto lg:max-w-none">
            <form action="#" method="POST" className="grid grid-cols-1 gap-y-6">
              <div>
                <Label htmlFor="full-name" className="sr-only">
                  {t('fullName')}
                </Label>
                <Input
                  type="text"
                  name="full-name"
                  id="full-name"
                  autoComplete="name"
                  placeholder={t('fullNamePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="email" className="sr-only">
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="sr-only">
                  {t('phone')}
                </Label>
                <Input
                  type="text"
                  name="phone"
                  id="phone"
                  autoComplete="tel"
                  placeholder={t('phonePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="message" className="sr-only">
                  {t('message')}
                </Label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md"
                  placeholder={t('messagePlaceholder')}
                  defaultValue={``}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
