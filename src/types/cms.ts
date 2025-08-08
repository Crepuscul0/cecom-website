export interface CMSContent {
  id: string;
  type: 'hero' | 'about' | 'contact' | 'page';
  title: {
    en: string;
    es: string;
  };
  content: {
    en: string;
    es: string;
  };
  images?: string[];
  lastModified: string;
  version: number;
}

export interface CMSUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  hashedPassword: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: 'admin' | 'editor';
  expiresAt: number;
}