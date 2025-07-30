import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useTranslations } from 'next-intl';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
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

export default function Header() {
  const t = useTranslations('Header');
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (locale: string) => {
    router.push(`/${locale}${pathname}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Top"
      >
        <div className="w-full py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <span className="sr-only">Cecom</span>
              <img
                className="h-10 w-auto"
                src="/logos/cecom-logo.png"
                alt="CECOM Logo"
              />
            </Link>
            <NavigationMenu className="hidden ml-10 space-x-8 lg:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/" className={cn("text-base font-medium text-gray-500 hover:text-gray-900")}>
                    {t('home')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/solutions" className={cn("text-base font-medium text-gray-500 hover:text-gray-900")}>
                    {t('solutions')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/alliances" className={cn("text-base font-medium text-gray-500 hover:text-gray-900")}>
                    {t('alliances')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/about" className={cn("text-base font-medium text-gray-500 hover:text-gray-900")}>
                    {t('aboutUs')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/contact" className={cn("text-base font-medium text-gray-500 hover:text-gray-900")}>
                    {t('contact')}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  🌐
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLocale('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale('es')}>
                  Español
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
                  <nav className="flex flex-col space-y-4 mt-8">
                    <Link href="/" className="text-base font-medium text-gray-500 hover:text-gray-900">
                      {t('home')}
                    </Link>
                    <Link href="/solutions" className="text-base font-medium text-gray-500 hover:text-gray-900">
                      {t('solutions')}
                    </Link>
                    <Link href="/alliances" className="text-base font-medium text-gray-500 hover:text-gray-900">
                      {t('alliances')}
                    </Link>
                    <Link href="/about" className="text-base font-medium text-gray-500 hover:text-gray-900">
                      {t('aboutUs')}
                    </Link>
                    <Link href="/contact" className="text-base font-medium text-gray-500 hover:text-gray-900">
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