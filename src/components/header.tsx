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
import { Menu, Languages } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const currentLocale = pathname.split('/')[1] || 'en';
  
  // Function to check if a link is active
  const isLinkActive = (href: string) => {
    // Remove locale part for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    const cleanHref = href.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Handle home page
    if (cleanHref === '/' || cleanHref === '') {
      return pathWithoutLocale === '/';
    }
    
    // Check if current path starts with the href (for nested routes)
    return pathWithoutLocale === cleanHref || 
           (cleanHref !== '/' && pathWithoutLocale.startsWith(cleanHref));
  };

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
        <div className="w-full py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href={`/${currentLocale}`}
              aria-label={t('accessibility.logoLink')}
              title={t('tooltips.home')}
            >
              <span className="sr-only">{t('accessibility.logoLink')}</span>
              <img
                className="h-16 w-auto logo"
                src="/logos/cecom-logo.svg"
                alt={t('accessibility.logoAlt')}
              />
            </Link>
            <NavigationMenu className="hidden ml-12 lg:block">
              <NavigationMenuList className="flex space-x-8">
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}`} 
                    className={cn(
                      "px-4 py-2 text-base font-medium transition-all duration-200 rounded-full relative group",
                      isLinkActive(`/${currentLocale}`)
                        ? "text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    style={{
                      backgroundColor: isLinkActive(`/${currentLocale}`) ? 'hsl(var(--primary))' : 'transparent',
                      boxShadow: isLinkActive(`/${currentLocale}`) ? '0 2px 10px -2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                    aria-label={t('accessibility.homeLink')}
                    title={t('tooltips.home')}
                  >
                    {t('home')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/solutions`} 
                    className={cn(
                      "px-4 py-2 text-base font-medium transition-all duration-200 rounded-full relative group",
                      isLinkActive(`/${currentLocale}/solutions`)
                        ? "text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    style={{
                      backgroundColor: isLinkActive(`/${currentLocale}/solutions`) ? 'hsl(var(--primary))' : 'transparent',
                      boxShadow: isLinkActive(`/${currentLocale}/solutions`) ? '0 2px 10px -2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                    aria-label={t('accessibility.solutionsLink')}
                    title={t('tooltips.solutions')}
                  >
                    {t('solutions')}
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/alliances`} 
                    className={cn(
                      "px-4 py-2 text-base font-medium transition-all duration-200 rounded-full relative group",
                      isLinkActive(`/${currentLocale}/alliances`)
                        ? "text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    style={{
                      backgroundColor: isLinkActive(`/${currentLocale}/alliances`) ? 'hsl(var(--primary))' : 'transparent',
                      boxShadow: isLinkActive(`/${currentLocale}/alliances`) ? '0 2px 10px -2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                    aria-label={t('accessibility.alliancesLink')}
                    title={t('tooltips.alliances')}
                  >
                    {t('alliances')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/blog`} 
                    className={cn(
                      "px-4 py-2 text-base font-medium transition-all duration-200 rounded-full relative group",
                      isLinkActive(`/${currentLocale}/blog`)
                        ? "text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    style={{
                      backgroundColor: isLinkActive(`/${currentLocale}/blog`) ? 'hsl(var(--primary))' : 'transparent',
                      boxShadow: isLinkActive(`/${currentLocale}/blog`) ? '0 2px 10px -2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                    aria-label={t('accessibility.blogLink')}
                    title={t('tooltips.blog')}
                  >
                    {t('blog')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/about`} 
                    className={cn(
                      "px-4 py-2 text-base font-medium transition-all duration-200 rounded-full relative group",
                      isLinkActive(`/${currentLocale}/about`)
                        ? "text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    style={{
                      backgroundColor: isLinkActive(`/${currentLocale}/about`) ? 'hsl(var(--primary))' : 'transparent',
                      boxShadow: isLinkActive(`/${currentLocale}/about`) ? '0 2px 10px -2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                    aria-label={t('accessibility.aboutUsLink')}
                    title={t('tooltips.aboutUs')}
                  >
                    {t('aboutUs')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/contact`} 
                    className={cn(
                      "px-4 py-2 text-base font-medium transition-all duration-200 rounded-full relative group",
                      isLinkActive(`/${currentLocale}/contact`)
                        ? "text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    )}
                    style={{
                      backgroundColor: isLinkActive(`/${currentLocale}/contact`) ? 'hsl(var(--primary))' : 'transparent',
                      boxShadow: isLinkActive(`/${currentLocale}/contact`) ? '0 2px 10px -2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
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
                  <Languages className="h-5 w-5" aria-hidden="true" />
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
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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
                  className="w-80 sm:w-96"
                  aria-label={t('accessibility.mobileNavigation')}
                >
                  <SheetTitle className="sr-only">
                    {t('accessibility.mobileNavigation')}
                  </SheetTitle>
                  
                  {/* Header with Logo */}
                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <Link 
                      href={`/${currentLocale}`}
                      className="flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <img
                        className="h-12 w-auto logo"
                        src="/logos/cecom-logo.svg"
                        alt={t('accessibility.logoAlt')}
                      />
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <nav 
                    className="flex flex-col space-y-2 mt-8"
                    aria-label={t('accessibility.mobileNavigation')}
                  >
                    <Link 
                      href={`/${currentLocale}`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.homeLink')}
                      title={t('tooltips.home')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('home')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/solutions`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.solutionsLink')}
                      title={t('tooltips.solutions')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('solutions')}
                      </div>
                    </Link>

                    <Link 
                      href={`/${currentLocale}/alliances`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.alliancesLink')}
                      title={t('tooltips.alliances')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('alliances')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/blog`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.blogLink')}
                      title={t('tooltips.blog')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('blog')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/about`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.aboutUsLink')}
                      title={t('tooltips.aboutUs')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('aboutUs')}
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/${currentLocale}/contact`} 
                      className="group flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                      aria-label={t('accessibility.contactLink')}
                      title={t('tooltips.contact')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {t('contact')}
                      </div>
                    </Link>
                  </nav>

                  {/* Footer with Theme and Language Controls */}
                  <div className="absolute bottom-8 left-6 right-6">
                    <div className="border-t border-border pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ThemeToggle />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-9 px-3"
                                aria-label={t('accessibility.languageSelectorButton')}
                                title={t('tooltips.languageSelector')}
                              >
                                <Languages className="h-4 w-4" aria-hidden="true" />
                                <span className="ml-2 text-sm font-medium">
                                  {currentLocale.toUpperCase()}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="start"
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
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}