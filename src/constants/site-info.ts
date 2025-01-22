export interface SiteInfo {
  name: string
  description: string
  metaInfo: {
    title: string
    description: string
    keywords: string
  }
  ogInfo: {
    title: string
    description: string
    image: string
    url: string
  }
  url: string
}

export const siteInfo: SiteInfo = {
  name: 'Nextjs Scaffold',
  description: 'A scaffold for Next.js projects',
  url: 'https://example.com',
  metaInfo: {
    title: 'Nextjs Scaffold',
    description: 'A scaffold for Next.js projects',
    keywords: 'nextjs, scaffold, template',
  },
  ogInfo: {
    title: 'Nextjs Scaffold',
    description: 'A scaffold for Next.js projects',
    image: 'https://example.com/og-image.jpg',
    url: 'https://example.com',
  },
};
