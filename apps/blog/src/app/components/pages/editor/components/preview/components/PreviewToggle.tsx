import { Eye, EyeOff } from "@rccyx/design/icons";

import { Button } from "@rccyx/design/ui";

interface PreviewToggleProps {
  isPreviewEnabled: boolean;
  onToggle: () => void;
}

export function PreviewToggle({
  isPreviewEnabled,
  onToggle,
}: PreviewToggleProps) {
  return (
    <Button variant="outline" onClick={onToggle}>
      {isPreviewEnabled ? (
        <>
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Preview
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Show Preview
        </>
      )}
    </Button>
  );
}
