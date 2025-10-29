import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { AnimatePresence, motion } from "@ashgw/design/motion";
import { X, Plus } from "@ashgw/design/icons";

import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ashgw/design/ui";

import type { PostEditorDto } from "@ashgw/api/rpc-models";

interface TagsFieldProps {
  form: UseFormReturn<PostEditorDto>;
}

export function TagsField({ form }: TagsFieldProps) {
  const { control } = form;
  const [tagInput, setTagInput] = useState("");

  const norm = (s: string) => s.trim().replace(/\s+/g, " ");
  const exists = (list: string[], v: string) =>
    list.some((t) => t.toLowerCase() === v.toLowerCase());

  function addTagUnsafe(list: string[], raw: string) {
    const t = norm(raw);
    if (!t || exists(list, t)) return list;
    return [...list, t];
  }

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => {
        // derive safely without hooks
        const tags: string[] = Array.isArray(field.value) ? field.value : [];

        const handleAdd = () => {
          const next = addTagUnsafe(tags, tagInput);
          if (next !== tags) field.onChange(next);
          setTagInput("");
        };

        const handleRemove = (tag: string) => {
          const next = tags.filter((t) => t !== tag);
          field.onChange(next);
        };

        return (
          <FormItem>
            <FormLabel>Tags</FormLabel>

            <FormControl>
              <div
                className={[
                  "flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md border px-2.5 py-2",
                  "bg-transparent text-foreground",
                ].join(" ")}
              >
                <AnimatePresence initial={false}>
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.85, y: 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -2 }}
                      transition={{ duration: 0.18 }}
                      className={[
                        "inline-flex duration-normal items-center gap-1.5 rounded-full border px-2.5 py-1",
                        "text-sm font-semibold font-semibold text-dim-300",
                        "bg-foreground/5 hover:bg-foreground/7",
                        "border-border/60 hover:border-border/70",
                        "backdrop-blur-subtle shadow-subtle hover:shadow-glow-accent-sm",
                        "transition-colors",
                      ].join(" ")}
                    >
                      <span className="leading-none">{tag}</span>

                      <button
                        type="button"
                        onClick={() => handleRemove(tag)}
                        aria-label={`Remove ${tag}`}
                        className={[
                          "inline-grid duration-normal size-5 place-items-center rounded-full",
                          "text-dim-300 hover:text-foreground",
                          "hover:bg-foreground/10 focus-visible:outline-none",
                        ].join(" ")}
                      >
                        <X className="size-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={tags.length ? "" : "Add tag"}
                  className={[
                    "flex-1 bg-transparent py-1 text-sm font-semibold outline-none",
                    "placeholder:text-muted-foreground",
                  ].join(" ")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "," || e.key === " ") {
                      e.preventDefault();
                      handleAdd();
                      return;
                    }
                    if (e.key === "Backspace" && !tagInput) {
                      const last: string | undefined = tags[tags.length - 1];
                      if (last) handleRemove(last);
                    }
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    const parts = text
                      .split(/[,\n\r\t ]+/)
                      .map(norm)
                      .filter(Boolean);
                    if (!parts.length) return;
                    e.preventDefault();
                    const next = parts.reduce(addTagUnsafe, tags);
                    if (next !== tags) {
                      field.onChange(next);
                      setTagInput("");
                    }
                  }}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3"
                  onClick={handleAdd}
                >
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
