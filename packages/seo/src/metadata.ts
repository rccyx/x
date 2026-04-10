import type { Metadata } from "next";
import merge from "lodash.merge";
import { creator, links, siteName } from "@rccyx/constants";

interface MetadataInput extends Omit<Metadata, "description" | "title"> {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
}

const applicationName = siteName;
const publisher = creator;
const twitterHandle = links.twitter.handle;

export const createMetadata = ({
  title,
  description,
  canonical,
  ...properties
}: MetadataInput): Metadata => {
  const parsedTitle = `${title} | ${applicationName}`;
  const base: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    authors: [{ name: publisher }],
    creator: publisher,
    formatDetection: { telephone: false },
    alternates: {
      canonical,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: "website",
      siteName: applicationName,
      locale: "en_US",
    },
    publisher,
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
      title: parsedTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  const metadata: Metadata = merge({}, base, properties);
  return metadata;
};
