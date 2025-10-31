import type { Control } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from "@rccyx/design/ui";

import type { PostEditorDto } from "@rccyx/api/rpc-models";

interface SummaryFieldProps {
  control: Control<PostEditorDto>;
}

export function SummaryField({ control }: SummaryFieldProps) {
  return (
    <FormField
      control={control}
      name="summary"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Summary</FormLabel>
          <FormControl>
            <Textarea placeholder="Summary (1-2 sentences)" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
