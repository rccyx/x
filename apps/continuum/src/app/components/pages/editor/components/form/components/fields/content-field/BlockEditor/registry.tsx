import {
  ArrowDown,
  ArrowDownToLine,
  ArrowDownWideNarrow,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  Minus,
  Text,
} from "@rccyx/design/icons";

import type { BlockProps, BlockRegistry, BlockType } from "./types";
import {
  CodeWrapper,
  DividerWrapper,
  HeadingOneWrapper,
  HeadingThreeWrapper,
  HeadingTwoWrapper,
  LargeSpacerWrapper,
  LinkWrapper,
  MediumSpacerWrapper,
  SmallSpacerWrapper,
  TextWrapper,
} from "./blocks/BlockWrappers";
import { CodeBlockEditor } from "./blocks/CodeBlock";
import { HeadingBlockEditor } from "./blocks/HeadingBlock";
import { LinkBlockEditor } from "./blocks/LinkBlock";
import { TextBlockEditor } from "./blocks/TextBlock";

function escapeText(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("${", "\\${");
}

function escapeAttr(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("${", "\\${");
}

export const blockRegistry: BlockRegistry = {
  H1: {
    type: "H1",
    label: "Heading 1",
    icon: <Heading1 className="h-4 w-4" />,
    defaultProps: { text: "" },
    Editor: HeadingBlockEditor,
    Preview: HeadingOneWrapper,
    serialize: ({ text }: BlockProps) =>
      `<H1>\n${escapeText(text ?? "")}\n</H1>`,
  },
  H2: {
    type: "H2",
    label: "Heading 2",
    icon: <Heading2 className="h-4 w-4" />,
    defaultProps: { text: "" },
    Editor: HeadingBlockEditor,
    Preview: HeadingTwoWrapper,
    serialize: ({ text }: BlockProps) =>
      `<H2>\n${escapeText(text ?? "")}\n</H2>`,
  },
  H3: {
    type: "H3",
    label: "Heading 3",
    icon: <Heading3 className="h-4 w-4" />,
    defaultProps: { text: "" },
    Editor: HeadingBlockEditor,
    Preview: HeadingThreeWrapper,
    serialize: ({ text }: BlockProps) =>
      `<H3>\n${escapeText(text ?? "")}\n</H3>`,
  },
  C: {
    type: "C",
    label: "Text",
    icon: <Text className="h-4 w-4" />,
    defaultProps: { text: "" },
    Editor: TextBlockEditor,
    Preview: TextWrapper,
    serialize: ({ text }: BlockProps) => `<C>\n${escapeText(text ?? "")}\n</C>`,
  },
  Code: {
    type: "Code",
    label: "Code Block",
    icon: <Code2 className="h-4 w-4" />,
    defaultProps: { code: "", language: "typescript" },
    Editor: CodeBlockEditor,
    Preview: CodeWrapper,
    serialize: ({ code, language }: BlockProps) => {
      const raw = typeof code === "string" ? code : "";
      const safeCode = raw.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
      const safeLang =
        typeof language === "string"
          ? language.replace(/"/g, "&quot;")
          : "typescript";
      return `<Code code={\`${safeCode}\`} language="${safeLang}" />`;
    },
  },
  D: {
    type: "D",
    label: "Divider",
    icon: <Minus className="h-4 w-4" />,
    defaultProps: {},
    Editor: () => null,
    Preview: DividerWrapper,
    serialize: () => "<D />",
  },
  L: {
    type: "L",
    label: "Link",
    icon: <LinkIcon className="h-4 w-4" />,
    defaultProps: { text: "", href: "" },
    Editor: LinkBlockEditor,
    Preview: LinkWrapper,
    serialize: ({ text, href }: BlockProps) =>
      `<L href="${escapeAttr(href ?? "")}">\n${escapeText(text ?? "")}\n</L>`,
  },
  S: {
    type: "S",
    label: "Small Spacer",
    icon: <ArrowDown className="h-4 w-4" />,
    defaultProps: {},
    Editor: () => null,
    Preview: SmallSpacerWrapper,
    serialize: () => "<S />",
  },
  S2: {
    type: "S2",
    label: "Medium Spacer",
    icon: <ArrowDownWideNarrow className="h-4 w-4" />,
    defaultProps: {},
    Editor: () => null,
    Preview: MediumSpacerWrapper,
    serialize: () => "<S2 />",
  },
  S3: {
    type: "S3",
    label: "Large Spacer",
    icon: <ArrowDownToLine className="h-4 w-4" />,
    defaultProps: {},
    Editor: () => null,
    Preview: LargeSpacerWrapper,
    serialize: () => "<S3 />",
  },
} as const;

export const getBlockByType = (type: BlockType): BlockRegistry[BlockType] => {
  return blockRegistry[type];
};
