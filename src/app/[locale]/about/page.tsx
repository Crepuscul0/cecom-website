import { useTranslations } from 'next-intl';
import Link from 'next/link';
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
                <Link
                  href="./contact"
                  className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {t('contactUs')}
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-col items-center p-6">
                <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 rounded-lg transition-all duration-300 mb-4">
                  <img
                    className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    src="/logos/3cx.png"
                    alt="3CX"
                  />
                </div>
                <CardTitle className="text-center text-sm font-semibold text-gray-700">3CX</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-col items-center p-6">
                <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 rounded-lg transition-all duration-300 mb-4">
                  <img
                    className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    src="/logos/avaya.png"
                    alt="Avaya"
                  />
                </div>
                <CardTitle className="text-center text-sm font-semibold text-gray-700">Avaya</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-col items-center p-6">
                <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 rounded-lg transition-all duration-300 mb-4">
                  <img
                    className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    src="/logos/axis.png"
                    alt="Axis"
                  />
                </div>
                <CardTitle className="text-center text-sm font-semibold text-gray-700">Axis</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-col items-center p-6">
                <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 rounded-lg transition-all duration-300 mb-4">
                  <img
                    className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    src="/logos/cambium.png"
                    alt="Cambium Networks"
                  />
                </div>
                <CardTitle className="text-center text-sm font-semibold text-gray-700">Cambium Networks</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-col items-center p-6">
                <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 rounded-lg transition-all duration-300 mb-4">
                  <img
                    className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    src="/logos/dahua.png"
                    alt="Dahua"
                  />
                </div>
                <CardTitle className="text-center text-sm font-semibold text-gray-700">Dahua</CardTitle>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-col items-center p-6">
                <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 rounded-lg transition-all duration-300 mb-4">
                  <img
                    className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    src="/logos/eset.png"
                    alt="Eset"
                  />
                </div>
                <CardTitle className="text-center text-sm font-semibold text-gray-700">Eset</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
