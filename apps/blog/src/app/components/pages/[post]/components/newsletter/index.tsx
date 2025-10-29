"use client";

import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "@ashgw/design/motion";
import { useForm } from "react-hook-form";
import { toast } from "@ashgw/design/ui";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from "@ashgw/design/ui";

import type { NewsletterSubscribeDto } from "@ashgw/api/rpc-models";
import { newsletterSubscribeDtoSchema } from "@ashgw/api/rpc-models";
import { rpcClientSide } from "@ashgw/api/rpc-client";

export function Newsletter() {
  const form = useForm<NewsletterSubscribeDto>({
    resolver: zodResolver(newsletterSubscribeDtoSchema),
    mode: "onSubmit",
  });

  const subscribeMutation = rpcClientSide.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("You're in!", {
        description: "Welcome aboard!",
      });
      form.reset();
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      });
    },
  });

  const submitHandler: SubmitHandler<NewsletterSubscribeDto> = async ({
    email,
  }) => {
    await subscribeMutation.mutateAsync({
      email,
    });
  };

  return (
    <motion.div
      className={`mx-auto w-full max-w-[1280px] px-2 sm:px-10`}
      viewport={{ once: true }}
      whileInView={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="relative mx-auto flex max-w-[600px] flex-col items-center p-8 before:absolute before:left-1/2 before:top-0 before:h-[1px] before:w-full before:-translate-x-1/2 before:bg-white/15 sm:before:w-[450px] md:before:w-[550px] lg:before:w-[650px] xl:before:w-[750px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className="flex w-full max-w-[480px] flex-col items-center justify-center gap-3"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex w-full items-center gap-3">
                      <Input
                        variant="rounded"
                        type="email"
                        {...field}
                        placeholder="your@email.com"
                      />
                      <Button
                        variant="default:rounded"
                        type="submit"
                        disabled={subscribeMutation.isPending}
                        loading={subscribeMutation.isPending}
                      >
                        {subscribeMutation.isPending
                          ? "Subscribing..."
                          : "Subscribe"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <p className="text-dim-300 mt-4 text-center text-sm font-semibold">
          Subscribe to my newsletter. No gimmicks, just food for thought &
          sauce.
        </p>
      </div>
    </motion.div>
  );
}
