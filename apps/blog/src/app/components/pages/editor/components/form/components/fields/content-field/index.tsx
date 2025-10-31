import type { Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel } from "@rccyx/design/ui";

import type { PostEditorDto } from "@rccyx/api/rpc-models";
import { BlockEditor } from "./BlockEditor";

interface ContentFieldProps {
  control: Control<PostEditorDto>;
}

export function ContentField({ control }: ContentFieldProps) {
  return (
    <FormField
      control={control}
      name="mdxText"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Content</FormLabel>
          <FormControl>
            <BlockEditor value={field.value} onChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
