import type { Control } from "react-hook-form";
import { Check } from "@rccyx/design/icons";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rccyx/design/ui";

import type { PostEditorDto } from "@rccyx/api/rpc-models";
import { PostCategoryEnum } from "@rccyx/api/rpc-models";

interface CategoryFieldProps {
  control: Control<PostEditorDto>;
}

export function CategoryField({ control }: CategoryFieldProps) {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline:rounded"} className="w-full">
                  {field.value.charAt(0) + field.value.slice(1).toLowerCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Select a category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(PostCategoryEnum).map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => field.onChange(cat)}
                  >
                    <div className="flex items-center gap-2">
                      {cat === field.value && <Check className="h-4 w-4" />}
                      <span>{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
