'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useTranslations } from 'next-intl';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const t = useTranslations('Header');
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const currentLocale = pathname.split('/')[1] || 'en';

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLocale = (locale: string) => {
    if (mounted) {
      // Set cookie to remember locale preference
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
      
      const currentPath = pathname.replace(/^\/[a-z]{2}/, '');
      router.push(`/${locale}${currentPath}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md border-b border-border">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        {t('accessibility.skipToContent')}
      </a>
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label={t('accessibility.mainNavigation')}
      >
        <div className="w-full py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href={`/${currentLocale}`}
              aria-label={t('accessibility.logoLink')}
              title={t('tooltips.home')}
            >
              <span className="sr-only">{t('accessibility.logoLink')}</span>
              <img
                className="h-24 w-auto logo"
                src="/logos/cecom-logo.svg"
                alt={t('accessibility.logoAlt')}
              />
            </Link>
            <NavigationMenu className="hidden ml-12 lg:block">
              <NavigationMenuList className="flex space-x-8">
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.homeLink')}
                    title={t('tooltips.home')}
                  >
                    {t('home')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/solutions`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.solutionsLink')}
                    title={t('tooltips.solutions')}
                  >
                    {t('solutions')}
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/alliances`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.alliancesLink')}
                    title={t('tooltips.alliances')}
                  >
                    {t('alliances')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/about`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.aboutUsLink')}
                    title={t('tooltips.aboutUs')}
                  >
                    {t('aboutUs')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/contact`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                    aria-label={t('accessibility.contactLink')}
                    title={t('tooltips.contact')}
                  >
                    {t('contact')}
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="ml-6 flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  aria-label={t('accessibility.languageSelectorButton')}
                  title={t('tooltips.languageSelector')}
                >
                  🌐
                  <span className="sr-only">{t('accessibility.languageSelector')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                aria-label={t('accessibility.languageSelectorMenu')}
              >
                <DropdownMenuItem 
                  onClick={() => changeLocale('en')}
                  aria-label={t('accessibility.selectEnglish')}
                >
                  {tCommon('language.english')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLocale('es')}
                  aria-label={t('accessibility.selectSpanish')}
                >
                  {tCommon('language.spanish')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    aria-label={t('accessibility.mobileMenuButton')}
                    title={t('tooltips.mobileMenu')}
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">{t('accessibility.mobileMenuButton')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right"
                  aria-label={t('accessibility.mobileNavigation')}
                >
                  <SheetTitle className="sr-only">
                    {t('accessibility.mobileNavigation')}
                  </SheetTitle>
                  <nav 
                    className="flex flex-col space-y-6 mt-8"
                    aria-label={t('accessibility.mobileNavigation')}
                  >
                    <Link 
                      href={`/${currentLocale}`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      aria-label={t('accessibility.homeLink')}
                      title={t('tooltips.home')}
                    >
                      {t('home')}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/solutions`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      aria-label={t('accessibility.solutionsLink')}
                      title={t('tooltips.solutions')}
                    >
                      {t('solutions')}
                    </Link>

                    <Link 
                      href={`/${currentLocale}/alliances`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      aria-label={t('accessibility.alliancesLink')}
                      title={t('tooltips.alliances')}
                    >
                      {t('alliances')}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/about`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      aria-label={t('accessibility.aboutUsLink')}
                      title={t('tooltips.aboutUs')}
                    >
                      {t('aboutUs')}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/contact`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent rounded-md transition-colors"
                      aria-label={t('accessibility.contactLink')}
                      title={t('tooltips.contact')}
                    >
                      {t('contact')}
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}