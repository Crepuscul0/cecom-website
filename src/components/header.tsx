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
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Top"
      >
        <div className="w-full py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/${currentLocale}`}>
              <span className="sr-only">Cecom</span>
              <img
                className="h-10 w-auto"
                src="/logos/cecom-logo.png"
                alt="CECOM Logo"
              />
            </Link>
            <NavigationMenu className="hidden ml-12 lg:block">
              <NavigationMenuList className="flex space-x-8">
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                  >
                    {t('home')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/solutions`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                  >
                    {t('solutions')}
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/alliances`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                  >
                    {t('alliances')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/about`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
                  >
                    {t('aboutUs')}
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href={`/${currentLocale}/contact`} 
                    className={cn("px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200 rounded-md hover:bg-accent")}
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
                <Button variant="outline" size="icon" className="ml-2">
                  🌐
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLocale('en')}>
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale('es')}>
                  🇪🇸 Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col space-y-6 mt-8">
                    <Link 
                      href={`/${currentLocale}`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    >
                      {t('home')}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/solutions`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    >
                      {t('solutions')}
                    </Link>

                    <Link 
                      href={`/${currentLocale}/alliances`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    >
                      {t('alliances')}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/about`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    >
                      {t('aboutUs')}
                    </Link>
                    <Link 
                      href={`/${currentLocale}/contact`} 
                      className="px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
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