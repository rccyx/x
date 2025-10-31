"use client";

import type { MDXRemoteProps, MDXRemoteSerializeResult } from "next-mdx-remote";
import type { ComponentType } from "react";
import type { Optional } from "ts-roids";
import { useEffect, useState } from "react";

import { logger } from "@rccyx/logger";

import { CodeBlock } from "../code";
import { Divider } from "../divider";
import { H1, H2, H3 } from "../headers";
import { BlogLink } from "../link/Link";
import { Spacer1, Spacer2, Spacer3 } from "../spacers";
import { TextContent } from "../text";

interface ClientMDXProps {
  source: string;
  components?: Record<string, unknown>;
}

export function ClientMDX({ source, components }: ClientMDXProps) {
  const [mdxSource, setMdxSource] =
    useState<Optional<MDXRemoteSerializeResult>>(null);
  const [MDXRemote, setMDXRemote] =
    useState<Optional<ComponentType<MDXRemoteProps>>>(null);

  useEffect(() => {
    // import MDX components dynamically so the annoying error is not thrown
    Promise.all([
      import("next-mdx-remote/serialize").then((mod) => mod.serialize),
      import("next-mdx-remote").then((mod) => mod.MDXRemote),
    ])
      .then(([serialize, MDXRemoteComponent]) => {
        setMDXRemote(() => MDXRemoteComponent);
        return serialize(source);
      })
      .then((result) => {
        setMdxSource(result);
      })
      .catch((error) => {
        logger.error("Failed to load or serialize MDX content", error);
      });
  }, [source]);

  if (!mdxSource || !MDXRemote) return null;

  const MDXComponent = MDXRemote;

  return (
    <MDXComponent
      {...mdxSource}
      components={{
        Code: CodeBlock,
        H1: H1,
        H2: H2,
        H3: H3,
        S: Spacer1,
        S2: Spacer2,
        S3: Spacer3,
        C: TextContent,
        L: BlogLink,
        D: Divider,
        ...components,
      }}
    />
  );
}
