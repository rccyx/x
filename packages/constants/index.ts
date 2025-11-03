import { env } from "@rccyx/env";

export const email = {
  oss: {
    address: "oss@rccyx.com",
    from: "rccyx oss <oss@rccyx.com>",
  },
  personal: {
    address: "x@rccyx.com",
    from: "rccyx <x@rccyx.com>",
  },
  bot: {
    address: "no-reply@notify.rccyx.com",
    from: "rccyx[bot] <no-reply@notify.rccyx.com>",
  },
} as const;

export type EmailSender = keyof typeof email;

export const links = {
  gitHub: {
    username: "rccyx",
    link: "https://github.com/rccyx",
  },
  twitter: {
    link: "https://x.com/rccyx_",
    handle: "@rccyx_",
  },
} as const;

export const gpg = {
  publicUrl: "https://github.com/rccyx.gpg",
  id: "79821E0224D34EC4969FF6A8E5168EE090AE80D0",
} as const;

export const repoSource = "https://github.com/rccyx/x";
export const creator = "@rccyx";
export const siteName = "Rccyx";

export const origins = [
  env.NEXT_PUBLIC_WWW_URL,
  env.NEXT_PUBLIC_API_URL,
  env.NEXT_PUBLIC_BLOG_URL,
];
