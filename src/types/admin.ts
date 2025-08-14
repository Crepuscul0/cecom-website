export interface Category {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  slug: string;
  order: number;
  icon: string;
}

export interface Vendor {
  id: string;
  name: string;
  website: string;
  description: { en: string; es: string };
}

export interface Product {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  features: { en: string[]; es: string[] };
  category_id: string;
  vendor_id: string;
  order: number;
  active: boolean;
}

export interface AdminTab {
  id: string;
  name: string;
  count: number;
}