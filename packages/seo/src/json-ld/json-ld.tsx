import type {
  Thing,
  WithContext,
  Organization,
  WebSite,
  BlogPosting,
  BreadcrumbList,
} from "schema-dts";
import { siteName, creator } from "@rccyx/constants";
import Script from "next/script";

interface JsonLdProps {
  code: WithContext<Thing>;
}

export const JsonLdScript = ({ code }: JsonLdProps) => (
  <Script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(code) }}
  />
);

export const organizationJsonLd = (
  siteUrl: string,
): WithContext<Organization> => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
});

export const websiteJsonLd = (siteUrl: string): WithContext<WebSite> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: siteName,
  publisher: { "@id": `${siteUrl}/#organization` },
});

export interface PostLike {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO
  updatedAt?: string; // ISO
  tags?: string[];
  category?: string;
}

export const blogPostingJsonLd = ({
  post,
  siteUrl,
}: {
  post: PostLike;
  siteUrl: string;
}): WithContext<BlogPosting> => {
  const url = `${siteUrl}/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    isPartOf: { "@id": `${siteUrl}/#website` },
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: creator, "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#organization` },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "en",
    keywords: post.tags ?? [],
    articleSection: post.category,
  };
};

export const breadcrumbsJsonLd = (
  segments: { name: string; url: string }[],
): WithContext<BreadcrumbList> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: segments.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.name,
    item: s.url,
  })),
});

export * from "schema-dts";
