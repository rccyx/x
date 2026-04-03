import type { ReactNode } from "react";

export interface BlockProps {
  text?: string;
  code?: string;
  language?: string;
  src?: string;
  alt?: string;
  href?: string;
  [key: string]: string | undefined;
}

export interface Block {
  id: string;
  type: BlockType;
  props: BlockProps;
}

export interface BlockEditorProps {
  value: BlockProps;
  onChange: (value: BlockProps) => void;
  onPreviewToggle: () => void;
  isPreview: boolean;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon?: ReactNode;
  defaultProps: BlockProps;
  Editor: React.ComponentType<BlockEditorProps>;
  serialize: (props: BlockProps) => string;
  Preview: React.ComponentType<BlockProps>;
}

export const BLOCK_TYPES = {
  H1: "H1",
  H2: "H2",
  H3: "H3",
  C: "C",
  Code: "Code",
  D: "D",
  L: "L",
  S: "S",
  S2: "S2",
  S3: "S3",
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;

export type BlockRegistry = Record<BlockType, BlockDefinition>;

export interface DraggableBlockProps extends BlockEditorProps {
  block: Block;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDragging?: boolean;
}
