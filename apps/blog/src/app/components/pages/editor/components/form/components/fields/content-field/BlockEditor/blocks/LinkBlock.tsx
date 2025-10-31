import { Input } from "@rccyx/design/ui";

import type { BlockEditorProps } from "../types";

export function LinkBlockEditor({
  value,
  onChange,
  isPreview,
}: BlockEditorProps) {
  if (isPreview) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Input
        value={value.text ?? ""}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="Link text..."
        className="w-full"
      />
      <Input
        value={value.href ?? ""}
        onChange={(e) => onChange({ ...value, href: e.target.value })}
        placeholder="Link URL..."
        className="w-full"
      />
    </div>
  );
}
