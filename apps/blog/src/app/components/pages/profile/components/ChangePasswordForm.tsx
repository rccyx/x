"use client";

import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@rccyx/design/ui";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@rccyx/design/ui";

import type { UserChangePasswordDto } from "@rccyx/api/rpc-models";
import { userChangePasswordSchemaDto } from "@rccyx/api/rpc-models";
import { rpcClient } from "@rccyx/api/rpc-client";

export function ChangePasswordForm() {
  const form = useForm<UserChangePasswordDto>({
    resolver: zodResolver(userChangePasswordSchemaDto),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = rpcClient.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit: SubmitHandler<UserChangePasswordDto> = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 sm:grid-cols-2"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  inputMode="text"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  inputMode="text"
                  autoComplete="new-password"
                  placeholder="At least 12 characters"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  inputMode="text"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sm:col-span-2 flex justify-end">
          <Button
            type="submit"
            variant="default"
            loading={changePasswordMutation.isPending}
            className="min-w-36"
          >
            {changePasswordMutation.isPending ? "Saving…" : "Change password"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
