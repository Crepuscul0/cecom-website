import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function About() {
  const t = useTranslations('AboutUs');

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-gray-500">
              {t('description')}
            </p>
            <div className="mt-8 sm:flex">
              <div className="rounded-md shadow">
                <a
                  href="/contact"
                  className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {t('contactUs')}
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
            <Card className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <CardHeader>
                <img
                  className="max-h-12"
                  src="/logos/3cx.png"
                  alt="3CX"
                />
                <CardTitle>3CX</CardTitle>
              </CardHeader>
            </Card>
            <Card className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <CardHeader>
                <img
                  className="max-h-12"
                  src="/logos/avaya.png"
                  alt="Avaya"
                />
                <CardTitle>Avaya</CardTitle>
              </CardHeader>
            </Card>
            <Card className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <CardHeader>
                <img
                  className="max-h-12"
                  src="/logos/axis.png"
                  alt="Axis"
                />
                <CardTitle>Axis</CardTitle>
              </CardHeader>
            </Card>
            <Card className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <CardHeader>
                <img
                  className="max-h-12"
                  src="/logos/cambium.png"
                  alt="Cambium Networks"
                />
                <CardTitle>Cambium Networks</CardTitle>
              </CardHeader>
            </Card>
            <Card className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <CardHeader>
                <img
                  className="max-h-12"
                  src="/logos/dahua.png"
                  alt="Dahua"
                />
                <CardTitle>Dahua</CardTitle>
              </CardHeader>
            </Card>
            <Card className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <CardHeader>
                <img
                  className="max-h-12"
                  src="/logos/eset.png"
                  alt="Eset"
                />
                <CardTitle>Eset</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
