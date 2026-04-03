import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";

import { CodeBlock } from "../code";
import { Divider } from "../divider";
import { H1, H2, H3 } from "../headers";
import { BlogLink } from "../link/Link";
import { Spacer1, Spacer2, Spacer3 } from "../spacers";
import { TextContent } from "../text";

export function MDX({ source, components }: MDXRemoteProps) {
  return (
    <MDXRemote
      source={source}
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
