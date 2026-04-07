import NextLink from "next/link";

import { env } from "@rccyx/env";
import { cn } from "@rccyx/design/ui";

export function BlogLink({
  href,
  origin = "continuum",
  ...props
}: {
  href: string;
  origin?: "continuum" | "www";
  children: React.ReactNode;
}) {
  const SITE_URL =
    origin === "www" ? env.NEXT_PUBLIC_WWW_URL : env.NEXT_PUBLIC_BLOG_URL;

  const LINK_CLASS_NAME = cn(
    "transition-duration-200",
    "gradient-text-accent",
    "hover:text-white",
  );
  if (href.startsWith("#")) {
    return (
      <NextLink href={href} className={cn(LINK_CLASS_NAME)} {...props}>
        {props.children}
      </NextLink>
    );
  }
  if (href.startsWith("/")) {
    return (
      <NextLink
        href={SITE_URL + href}
        className={cn(LINK_CLASS_NAME)}
        {...props}
      >
        {props.children}
      </NextLink>
    );
  }

  return (
    <NextLink
      href={`${href}?utm_source=${SITE_URL}`}
      target="_blank"
      // Using `noopener noreferrer` to prevent security risks such as reverse tabnabbing.
      // More information can be found at https://owasp.org/www-community/attacks/Reverse_Tabnabbing
      rel="noopener noreferrer"
      className={cn(LINK_CLASS_NAME + "hover: bright")}
      {...props}
    >
      {props.children}
      <span className="hidden pl-1 sm:inline-block">&#8599;</span>
    </NextLink>
  );
}
