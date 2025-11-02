import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { PostCategory } from "@rccyx/db/raw";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Blog {
  slug: string;
  title: string;
  summary: string;
  isReleased: boolean;
  firstModDate: Date;
  lastModDate: Date;
  minutesToRead: number;
  tags: string[];
  category: PostCategory;
  mdxContentRaw: string;
}

function getCorresponsingMdxContent(slug: string): string {
  const filePath = path.join(__dirname, `${slug}.mdx`);
  const fileContent = readFileSync(filePath, "utf-8");
  if (fileContent.startsWith("---")) {
    const parts = fileContent.split("---");
    return parts.slice(2).join("---").trim();
  }
  return fileContent.trim();
}

export const blogs: Blog[] = [
  {
    slug: "bounce-tracking",
    title: "Bounce Tracking",
    summary: "As third-party cookies phase out, your behavior is still tracked",
    isReleased: true,
    firstModDate: new Date("2023-10-09T08:15:00-04:00"),
    lastModDate: new Date("2023-10-09T08:15:00-04:00"),
    minutesToRead: 4,
    tags: ["http", "cybersec", "cookies"],
    category: "SOFTWARE",
    mdxContentRaw: getCorresponsingMdxContent("bounce-tracking"),
  },
  {
    slug: "cholesterol",
    title: "Cholesterol",
    summary: "How bad science hijacked medicine and destroyed public health",
    isReleased: true,
    firstModDate: new Date("2025-02-07T09:15:00-04:00"),
    lastModDate: new Date("2025-02-07T09:15:00-04:00"),
    minutesToRead: 17,
    tags: ["cholesterol", "statins", "fat"],
    category: "HEALTH",
    mdxContentRaw: getCorresponsingMdxContent("cholesterol"),
  },
  {
    slug: "dumb-questions",
    title: "Dumb Questions",
    summary: "Why they exist and what they reveal about systemic inefficiency",
    isReleased: true,
    firstModDate: new Date("2024-11-18T09:15:00-04:00"),
    lastModDate: new Date("2024-11-18T09:15:00-04:00"),
    minutesToRead: 8,
    tags: ["quality", "efficiency", "rants"],
    category: "SOFTWARE",
    mdxContentRaw: getCorresponsingMdxContent("dumb-questions"),
  },
];
