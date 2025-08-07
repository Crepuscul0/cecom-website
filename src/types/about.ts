export interface AboutContent {
  mission: {
    en: string;
    es: string;
  };
  vision: {
    en: string;
    es: string;
  };
  values: Array<{
    title: { en: string; es: string };
    description: { en: string; es: string };
    icon: string;
  }>;
  history: {
    en: string;
    es: string;
  };
  team?: Array<{
    name: string;
    position: { en: string; es: string };
    bio: { en: string; es: string };
    image?: string;
  }>;
}