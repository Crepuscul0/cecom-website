export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  source: {
    name: string;
    vendorId: string;
    url: string;
  };
  image?: string;
  tags: string[];
}

export interface RSSFeedConfig {
  vendorId: string;
  url: string;
  lastFetched: string;
  active: boolean;
}