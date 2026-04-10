import { Textarea } from "@rccyx/design/ui";

import type { BlockEditorProps } from "../types";

export function TextBlockEditor({
  value,
  onChange,
  isPreview,
}: BlockEditorProps) {
  if (isPreview) {
    return null;
  }

  return (
    <Textarea
      value={value.text ?? ""}
      onChange={(e) => onChange({ ...value, text: e.target.value })}
      placeholder="Enter text content..."
      className="min-h-[100px] w-full"
    />
  );
}
