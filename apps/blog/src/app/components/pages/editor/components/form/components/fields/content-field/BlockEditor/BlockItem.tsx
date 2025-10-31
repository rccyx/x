import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Trash2 } from "@rccyx/design/icons";

import { Button, cn } from "@rccyx/design/ui";

import type { Block, BlockProps } from "./types";
import { blockRegistry } from "./registry";

interface BlockItemProps {
  block: Block;
  onDelete: () => void;
  onChange: (props: BlockProps) => void;
  isDragging?: boolean; // optional override, defaults to dnd-kit hook state
}

export function BlockItem({
  block,
  onDelete,
  onChange,
  isDragging: propIsDragging,
}: BlockItemProps) {
  const [isPreview, setIsPreview] = useState(false);
  const blockDef = blockRegistry[block.type];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: hookIsDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { Preview: PreviewComponent, Editor: EditorComponent } = blockDef;

  // determine block types for styling
  const isCodeBlock = block.type === "Code";
  const isLinkBlock = block.type === "L";

  // prefer hook state, fallback to prop if provided
  const isDragging = propIsDragging ?? hookIsDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border p-4 transition-all duration-200",
        "hover:border-primary/50 hover:shadow-sm",
        isDragging && "border-primary/50 opacity-50 shadow-lg",
        !isDragging && "animate-in fade-in-0 zoom-in-95",
        isPreview ? "bg-muted/30" : "bg-card",
      )}
    >
      {/* block type label */}
      <div className="text-muted-foreground absolute left-2 top-2 flex items-center gap-2 text-xs">
        <span className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded-full">
          {blockDef.icon}
        </span>
        <span>{blockDef.label}</span>
      </div>

      {/* action buttons */}
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="outline"
          onClick={() => setIsPreview(!isPreview)}
          title={isPreview ? "Edit" : "Preview"}
          type="button"
        >
          {isPreview ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="destructive:outline"
          onClick={onDelete}
          title="Delete block"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          type="button"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* content area */}
      <div className="pt-10">
        {isPreview ? (
          <div
            className={cn("rounded-md p-4", {
              "bg-muted font-mono text-sm font-semibold": isCodeBlock,
              "bg-muted/50": !isCodeBlock,
              "text-primary underline": isLinkBlock,
            })}
          >
            <PreviewComponent {...block.props} />
          </div>
        ) : (
          <EditorComponent
            value={block.props}
            onChange={onChange}
            onPreviewToggle={() => setIsPreview(!isPreview)}
            isPreview={isPreview}
          />
        )}
      </div>
    </div>
  );
}
