import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <html lang="en">
      <body>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </body>
    </html>
  );
}