import { Input } from "@rccyx/design/ui";

import type { BlockEditorProps } from "../types";

export function HeadingBlockEditor({
  value,
  onChange,
  isPreview,
}: BlockEditorProps) {
  if (isPreview) {
    return null;
  }

  return (
    <Input
      value={value.text ?? ""}
      onChange={(e) => onChange({ ...value, text: e.target.value })}
      placeholder="Enter heading text..."
      className="w-full"
    />
  );
}
