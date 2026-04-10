"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Maximize2, Minimize2, Plus } from "@rccyx/design/icons";
import { nanoid } from "nanoid";

import { logger } from "@rccyx/logger";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Dialog,
  DialogContent,
} from "@rccyx/design/ui";

import type { Block, BlockProps, BlockType } from "./types";
import { BlockItem } from "./BlockItem";
import { blockRegistry } from "./registry";

interface BlockEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function extractProps(propsString: string): Record<string, string> {
  const props: Record<string, string> = {};
  const regex = /(\w+)=(?:{`([^`]*)`}|"([^"]*)")/g;
  let match;

  while ((match = regex.exec(propsString)) !== null) {
    const [, key, value1, value2] = match;
    if (key) {
      props[key] = value1 ?? value2 ?? "";
    }
  }

  return props;
}

function parseBlock(blockStr: string): Block | null {
  try {
    // Try to match component syntax first
    // Updated regex to handle multiline content with dotall flag
    const componentRegex =
      /<(\w+)(?:\s+([^>]+))?>(.*?)<\/\1>|<(\w+)(?:\s+([^>]+))?\/>/s;
    const componentMatch = componentRegex.exec(blockStr);

    if (componentMatch) {
      // Only treat as a block if the match covers the entire string (outermost element)
      if (
        componentMatch.index !== 0 ||
        componentMatch[0].length !== blockStr.length
      ) {
        // Inline component within text; return as paragraph
        if (blockStr.trim()) {
          return {
            id: nanoid(),
            type: "C",
            props: { text: blockStr },
          };
        }
        return null;
      }
      const [, tag1, props1, content, tag2, props2] = componentMatch;
      const tag = tag1 ?? tag2;
      const propsStr = props1 ?? props2;

      logger.debug("Matched component", {
        tag,
        content: content?.slice(0, 50),
        propsStr,
      });

      if (tag && Object.prototype.hasOwnProperty.call(blockRegistry, tag)) {
        const type = tag as BlockType;
        const blockDef = blockRegistry[type];
        const blockProps: BlockProps = { ...blockDef.defaultProps };

        // Parse content if it exists. Preserve internal whitespace for paragraphs.
        if (content !== undefined) {
          if (type === "C") {
            blockProps.text = content; // keep as-is; spacing will be preserved
          } else if (content.trim()) {
            blockProps.text = content.trim();
          }
        }

        // Parse props if they exist
        if (propsStr) {
          const extractedProps = extractProps(propsStr);
          Object.assign(blockProps, extractedProps);
        }

        return {
          id: nanoid(),
          type,
          props: blockProps,
        };
      }
    }

    // If no component match and there's content, create a text block
    if (blockStr.trim()) {
      logger.debug("Creating default text block", {
        text: blockStr.slice(0, 50),
      });
      return {
        id: nanoid(),
        type: "C",
        props: { text: blockStr }, // keep raw as-is
      };
    }

    return null;
  } catch (error) {
    logger.error("Failed to parse block", { error, blockStr });
    return null;
  }
}

// Extracted Helper: Read the tag name to reduce complexity
function readTagName(content: string, startIndex: number): string {
  let j = startIndex;
  while (j < content.length && /[A-Za-z0-9_]/.test(content.charAt(j))) {
    j += 1;
  }
  return content.slice(startIndex, j);
}

// Extracted Helper: Find the matching close tag block to reduce nested loops (max-depth fix)
function findCompleteBlock(
  content: string,
  tagName: string,
  startIdx: number,
  startTagEnd: number,
): { blockStr: string; nextIdx: number } | null {
  interface StackItem {
    name: string;
  }
  const stack: StackItem[] = [{ name: tagName }];

  let p = startTagEnd + 1;
  const tagOpenRe =
    /<([A-Za-z][\w-]*)(\s[^>]*?)?>|<\/([A-Za-z][\w-]*)\s*>|<([A-Za-z][\w-]*)(\s[^>]*?)?\/>/g;
  tagOpenRe.lastIndex = p;

  while (true) {
    const m = tagOpenRe.exec(content);
    if (!m) {
      return null; // no closing tag found
    }

    const [full, openName1, _openAttrs, closeName, selfName] = m;
    const matchEnd = m.index + full.length;

    if (selfName) {
      // self-closing tag: does not affect stack
      p = matchEnd;
      tagOpenRe.lastIndex = p;
      continue;
    }

    if (closeName) {
      // closing tag
      const top = stack[stack.length - 1];
      if (top && top.name === closeName) {
        stack.pop();
        if (stack.length === 0) {
          // Found the matching close for our top-level tag
          return {
            blockStr: content.slice(startIdx, matchEnd),
            nextIdx: matchEnd,
          };
        }
      }
      p = matchEnd;
      tagOpenRe.lastIndex = p;
      continue;
    }

    if (openName1) {
      // opening tag (non-self-closing)
      stack.push({ name: openName1 });
      p = matchEnd;
      tagOpenRe.lastIndex = p;
      continue;
    }
  }
}

// Refactored: robust top-level parser that extracts ONLY outermost blocks
function parseTopLevelBlocks(mdx: string): string[] {
  if (!mdx) return [];

  const content = mdx.replace(/^\ufeff/, "");
  const knownTags = new Set(Object.keys(blockRegistry));

  const blocks: string[] = [];
  let i = 0;
  let lastEmittedIndex = 0;
  const len = content.length;

  while (i < len) {
    const ch = content[i];
    if (ch !== "<") {
      i += 1;
      continue;
    }

    const j = i + 1;
    if (content[j] === "/") {
      i += 1;
      continue;
    }

    const tagName = readTagName(content, j);

    if (!tagName || !knownTags.has(tagName)) {
      i += 1;
      continue;
    }

    if (lastEmittedIndex < i) {
      const preText = content.slice(lastEmittedIndex, i);
      if (preText.trim()) {
        blocks.push(preText);
      }
    }

    let k = j + tagName.length;
    while (k < len && content[k] !== ">") k += 1;
    if (k >= len) {
      blocks.push(content.slice(i));
      return blocks;
    }

    const startTagEnd = k;
    const startTagContent = content.slice(i, startTagEnd + 1);
    const selfClosing = /\/>\s*$/.test(startTagContent);

    if (selfClosing) {
      blocks.push(content.slice(i, startTagEnd + 1));
      i = startTagEnd + 1;
      lastEmittedIndex = i;
      continue;
    }

    const blockMatch = findCompleteBlock(content, tagName, i, startTagEnd);

    if (!blockMatch) {
      // no closing tag found, treat rest as part of this block
      blocks.push(content.slice(i));
      return blocks;
    }

    blocks.push(blockMatch.blockStr);
    i = blockMatch.nextIdx;
    lastEmittedIndex = i;
  }

  if (lastEmittedIndex < len) {
    const tail = content.slice(lastEmittedIndex);
    if (tail.trim()) blocks.push(tail);
  }

  return blocks;
}

function parseExistingMDX(mdx: string): Block[] {
  if (!mdx || mdx.trim() === "") return [];

  try {
    const normalizedMdx = mdx.replace(/^\ufeff/, "").replace(/\r\n?/g, "\n");

    logger.debug("Parsing MDX content (top-level)", {
      length: normalizedMdx.length,
      preview: normalizedMdx.slice(0, 100),
    });

    const rawBlocks = parseTopLevelBlocks(normalizedMdx);

    // If no blocks found but content exists, treat entire content as C
    if (rawBlocks.length === 0 && normalizedMdx.trim()) {
      const textBlock = parseBlock(normalizedMdx);
      return textBlock ? [textBlock] : [];
    }

    const blocks: Block[] = [];
    for (const chunk of rawBlocks) {
      const parsed = parseBlock(chunk);
      if (parsed) blocks.push(parsed);
    }

    logger.debug("Parsed blocks (top-level)", { count: blocks.length });
    return blocks;
  } catch (error) {
    logger.error("Failed to parse MDX content", { error, mdx });
    return [];
  }
}

function serializeToMDX(blocks: Block[]): string {
  try {
    return blocks
      .map((block) => {
        const blockDef = blockRegistry[block.type];
        // For text blocks, use multiline format and preserve content as-is
        if (block.type === "C") {
          const text = block.props.text ?? "";
          return `<C>\n${text}\n</C>`;
        }
        // For other blocks, use the standard serializer
        return blockDef.serialize(block.props);
      })
      .filter(Boolean)
      .join("\n\n");
  } catch (error) {
    logger.error("Failed to serialize blocks to MDX", { error });
    return "";
  }
}

export function BlockEditor({ value, onChange }: BlockEditorProps) {
  // source-of-truth guards
  const lastSerializedRef = useRef<string>(value);

  const [isExpanded, setIsExpanded] = useState(false);
  const isInitialRender = useRef(true);
  const prevValueRef = useRef(value);
  const initialValueRef = useRef(value);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  // Prevent parent form submission from key interactions inside the editor
  const handleKeyDownCapture = useCallback((e: ReactKeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const isInput = target?.tagName === "INPUT";
    const isTextArea = target?.tagName === "TEXTAREA";
    const isContentEditable =
      target?.getAttribute("contenteditable") === "true";

    // Prevent Enter from submitting the parent form when focused inside the editor
    if (e.key === "Enter") {
      // Allow Enter in textarea/contenteditable (for new lines), but block in inputs or generic containers
      if (!isTextArea && !isContentEditable) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    // When dialog/editor is focused, prevent Space from triggering clicks on any focused button outside
    if (e.key === " " && !(isInput || isTextArea || isContentEditable)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // Parse blocks only when value changes
  const initialBlocks = useMemo(() => {
    // Only parse if value has changed from previous render
    if (value !== prevValueRef.current) {
      logger.debug("Value changed, reparsing blocks", {
        valueLength: value.length,
        prevLength: prevValueRef.current.length,
      });
      prevValueRef.current = value;
      return parseExistingMDX(value);
    }
    return parseExistingMDX(value);
  }, [value]);

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [manuallyEdited, setManuallyEdited] = useState(false);

  // Force update blocks when value changes externally (e.g. when switching blogs)
  useEffect(() => {
    // Skip the first render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      initialValueRef.current = value;
      lastSerializedRef.current = value;
      return;
    }

    // Ignore echo from our own serialization
    if (value === lastSerializedRef.current) {
      return;
    }

    // Only update blocks if value has changed significantly (different continuum loaded)
    // and we haven't manually edited the content
    if (value !== initialValueRef.current && !manuallyEdited) {
      logger.debug("External value change detected, updating blocks", {
        newLength: value.length,
        initialLength: initialValueRef.current.length,
      });

      const newBlocks = parseExistingMDX(value);
      setBlocks(newBlocks);
      initialValueRef.current = value;
      lastSerializedRef.current = value;
    }
  }, [value, manuallyEdited]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addBlock = useCallback((type: BlockType) => {
    const blockDef = blockRegistry[type];
    setBlocks((prev) => [
      ...prev,
      {
        id: nanoid(),
        type,
        props: { ...blockDef.defaultProps },
      },
    ]);
    setShowAddCommand(false);
    setManuallyEdited(true);
  }, []);

  const updateBlock = useCallback((id: string, props: BlockProps) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, props } : block)),
    );
    setManuallyEdited(true);
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    setManuallyEdited(true);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggedId(event.active.id.toString());
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedId(null);

    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((block) => block.id === active.id);
        const newIndex = prev.findIndex((block) => block.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setManuallyEdited(true);
    }
  }, []);

  // Handle scroll events to prevent auto-saving during scrolling
  const handleScroll = useCallback(() => {
    isScrollingRef.current = true;
    isUserInteractingRef.current = true;

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a timeout to mark scrolling as finished after 2000ms of no scroll events
    // This is longer than the debounce timeout to ensure we don't update during scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      scrollTimeoutRef.current = null;

      // After scrolling stops, wait a bit more before allowing updates
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 1000);
    }, 2000);
  }, []);

  // Debounced update of MDX with a longer timeout to prevent excessive updates
  useEffect(() => {
    // Skip initial render to prevent auto-saving on component mount
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Only update if blocks have been manually edited
    if (!manuallyEdited) return;

    // Don't save while scrolling or when user is interacting with expanded editor
    if (isScrollingRef.current || (isExpanded && isUserInteractingRef.current))
      return;

    const timeoutId = setTimeout(() => {
      const mdx = serializeToMDX(blocks);
      lastSerializedRef.current = mdx;
      onChange(mdx);
      // Reset manuallyEdited flag to avoid redundant saves triggered by UI-only state changes
      setManuallyEdited(false);
    }, 500); // Faster feedback but still debounced

    return () => clearTimeout(timeoutId);
  }, [blocks, onChange, manuallyEdited, isExpanded]);

  // Reset component when value becomes empty (new continuum creation)
  useEffect(() => {
    if (!value || value.trim() === "") {
      setBlocks([]);
      setManuallyEdited(false);
      lastSerializedRef.current = "";
    }
  }, [value]);

  // Clean up scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Compact editor view
  const compactView = (
    <div className="bg-card relative rounded-lg border p-4">
      <div className="bg-card flex items-center justify-between py-2">
        <h3 className="text-lg font-semibold">Block Editor</h3>
        <div className="flex gap-2">
          <Button
            role="secondary"
            appearance="outline"
            className="relative"
            onClick={() => setIsExpanded(true)}
            type="button"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Expand Editor
          </Button>
          <Button
            role="secondary"
            appearance="outline"
            className="relative"
            onClick={() => setShowAddCommand(true)}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        </div>
      </div>

      <div className="mt-4 max-h-[300px] overflow-y-auto rounded-md border p-2">
        {blocks.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-muted-foreground text-center">
              <p>No content blocks yet</p>
              <p className="text-sm font-semibold">
                Click "Add Block" to start writing
              </p>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground space-y-1 text-sm font-semibold">
            {blocks.map((block) => {
              const blockDef = blockRegistry[block.type];
              return (
                <div
                  key={block.id}
                  className="hover:bg-accent/20 flex items-center gap-2 truncate rounded-md p-2"
                  onClick={() => setIsExpanded(true)}
                >
                  <span className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded-full">
                    {blockDef.icon}
                  </span>
                  <span className="truncate">
                    {blockDef.label}: {block.props.text?.slice(0, 30)}
                    {block.props.text && block.props.text.length > 30
                      ? "..."
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Expanded editor view in a Dialog
  const expandedView = (
    <Dialog
      open={isExpanded}
      onOpenChange={(open) => {
        setIsExpanded(open);
        // When closing the expanded editor, reset the user interaction flag after a delay
        if (!open) {
          setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 1000);
        }
      }}
    >
      <DialogContent
        className="h-[90vh] w-[90vw] max-w-[90vw] p-6"
        onKeyDownCapture={handleKeyDownCapture}
      >
        <div className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Content Editor</h2>
            <div className="flex gap-2">
              <Button
                role="secondary"
                appearance="outline"
                onClick={() => {
                  setIsExpanded(false);
                  // Reset user interaction flag when closing
                  setTimeout(() => {
                    isUserInteractingRef.current = false;
                  }, 1000);
                }}
                type="button"
              >
                <Minimize2 className="mr-2 h-4 w-4" />
                Minimize Editor
              </Button>
              <Button
                role="secondary"
                appearance="outline"
                onClick={() => setShowAddCommand(true)}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Block
              </Button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <div
              className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent absolute inset-0 overflow-y-auto pb-4 pr-2"
              onScroll={handleScroll}
              onMouseDown={() => {
                isUserInteractingRef.current = true;
              }}
              onMouseUp={() => {
                // Reset user interaction flag after a delay
                setTimeout(() => {
                  isUserInteractingRef.current = false;
                }, 1000);
              }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((block) => block.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4 pb-16">
                    {blocks.map((block) => (
                      <BlockItem
                        key={block.id}
                        block={block}
                        onChange={(props) => updateBlock(block.id, props)}
                        onDelete={() => deleteBlock(block.id)}
                        isDragging={draggedId === block.id}
                      />
                    ))}
                    {blocks.length === 0 && (
                      <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
                        <div className="text-muted-foreground text-center">
                          <p>No content blocks yet</p>
                          <p className="text-sm font-semibold">
                            Click "Add Block" to start writing
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Fade effect at the bottom */}
              <div className="from-background pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t to-transparent"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="relative" onKeyDownCapture={handleKeyDownCapture}>
      {compactView}
      {expandedView}

      <Dialog open={showAddCommand} onOpenChange={setShowAddCommand}>
        <DialogContent
          className="max-w-[500px] p-0"
          onKeyDownCapture={handleKeyDownCapture}
        >
          <Command>
            <CommandInput
              placeholder="Search blocks..."
              onKeyDown={(e) => {
                if (e.key === "Enter") e.stopPropagation();
              }}
            />
            <CommandEmpty>No blocks found.</CommandEmpty>
            <CommandGroup>
              {Object.values(blockRegistry).map((block) => (
                <CommandItem
                  key={block.type}
                  onSelect={() => addBlock(block.type)}
                  className="hover:bg-accent flex cursor-pointer items-center px-4 py-2"
                >
                  {block.icon}
                  <span className="ml-2">{block.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
