import React, { useEffect } from 'react';
import {
  SITE_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from '../utils/seoUtils';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  keywords?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * SEO component managing dynamic document metadata, OpenGraph tags,
 * Twitter cards, canonical links, and Schema.org JSON-LD structured data.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl = `${SITE_URL}/`,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
  jsonLd,
}) => {
  const fullTitle = title ? (title.includes('LuuKyone') ? title : `${title} | LuuKyone`) : SITE_TITLE;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to safely set or update meta tag content
    const setMetaTag = (attribute: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Set essential meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // 3. Set Open Graph tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', SITE_NAME);

    // 4. Set Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Update Canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 6. Manage Dynamic JSON-LD Structured Data script
    const SCRIPT_ID = 'dynamic-seo-jsonld';
    let scriptTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up dynamic JSON-LD on unmount
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [fullTitle, description, canonicalUrl, ogImage, ogType, keywords, noIndex, jsonLd]);

  // Also render elements for React 19 native document metadata support
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
};
