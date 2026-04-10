import type { BlockProps } from "../types";
import {
  BlogLink,
  CodeBlock,
  Divider,
  H1,
  H2,
  H3,
  Spacer1,
  Spacer2,
  Spacer3,
  TextContent,
} from "~/app/components/shared/mdx-custom";

export const HeadingOneWrapper = ({ text }: BlockProps) => <H1>{text}</H1>;

export const HeadingTwoWrapper = ({ text }: BlockProps) => <H2>{text}</H2>;

export const HeadingThreeWrapper = ({ text }: BlockProps) => <H3>{text}</H3>;

export const TextWrapper = ({ text }: BlockProps) => (
  <TextContent>{text}</TextContent>
);

export const CodeWrapper = ({ code, language }: BlockProps) => (
  <CodeBlock
    code={code ?? ""}
    language={language ?? "typescript"}
    showLineNumbers={true}
  />
);

export const DividerWrapper = () => <Divider />;

export const LinkWrapper = ({ text, href }: BlockProps) => (
  <BlogLink href={href ?? "#"}>{text}</BlogLink>
);

export const SmallSpacerWrapper = () => <Spacer1 />;
export const MediumSpacerWrapper = () => <Spacer2 />;
export const LargeSpacerWrapper = () => <Spacer3 />;
