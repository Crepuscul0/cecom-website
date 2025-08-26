"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  const locale = useLocale() as "en" | "es";

  const tHeader = useTranslations("Header");
  const tFooter = useTranslations("Footer");

  const base = `/${locale}`;

  const links = [
    { label: tHeader("solutions"), href: `${base}/solutions` },
    { label: tHeader("alliances"), href: `${base}/alliances` },
    { label: tHeader("blog"), href: `${base}/blog` },
    { label: tHeader("aboutUs"), href: `${base}/about` },
    { label: tFooter("products"), href: `${base}/products` },
    { label: tHeader("contact"), href: `${base}/contact` },
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-primary/10 bg-muted/30 dark:bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="text-xl font-bold">CECOM</div>
            <p className="text-sm text-muted-foreground">
              {locale === "es"
                ? "Soluciones tecnológicas para impulsar tu negocio."
                : "Technology solutions to power your business."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide uppercase">
              {tFooter("quickLinks")}
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide uppercase">
              {tFooter("followUs")}
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="#"
                aria-label={tFooter("social.instagram")}
                className="p-2 rounded-md border border-transparent hover:border-primary/30 hover:bg-accent/40 transition-colors"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label={tFooter("social.facebook")}
                className="p-2 rounded-md border border-transparent hover:border-primary/30 hover:bg-accent/40 transition-colors"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label={tFooter("social.x")}
                className="p-2 rounded-md border border-transparent hover:border-primary/30 hover:bg-accent/40 transition-colors"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>
            © {year} CECOM. {tFooter("rights")}
          </p>
          <div className="flex gap-4">
            <Link href={`${base}`} className="hover:text-foreground transition-colors">
              {tHeader("home")}
            </Link>
            <Link href={`${base}/contact`} className="hover:text-foreground transition-colors">
              {tHeader("contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
