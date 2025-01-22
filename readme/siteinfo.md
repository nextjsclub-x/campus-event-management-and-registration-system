# Site Information Configuration

This document describes the structure and usage of the `siteInfo` configuration object used in our Next.js application.

## Overview

The `siteInfo` object contains essential information about the website, including metadata for SEO purposes and Open Graph data for social media sharing.

## Structure

The `siteInfo` object is of type `SiteInfo`, which is defined as follows:

```typescript
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
