export interface Category {
  id: string;
  name: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  slug: string;
  order: number;
  icon?: string;
}

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  rssUrl?: string;
  description: {
    en: string;
    es: string;
  };
}

export interface Product {
  id: string;
  name: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  features: {
    en: string[];
    es: string[];
  };
  categoryId: string;
  vendorId: string;
  image?: string;
  datasheet?: string;
  order: number;
  active: boolean;
}