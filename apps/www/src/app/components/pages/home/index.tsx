"use client";

import { motion } from "@rccyx/design/motion";
import { useCopyToClipboard } from "react-use";
import { toast } from "@rccyx/design/ui";

import { email, links } from "@rccyx/constants";

import Link from "./components/Link";
import { env } from "@rccyx/env";

export function HomePage() {
  const [, copyToClipboard] = useCopyToClipboard();

  const emailAddress = email.oss.address;

  const copyEmail = () => {
    copyToClipboard(emailAddress);
    toast.success("Email copied");
  };

  const copyX = () => {
    copyToClipboard(links.twitter.link);
    toast.success("X copied");
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <section className="-mt-8 flex min-h-screen w-full items-center justify-center px-4 md:px-6">
          <div className="space-y-6 text-center">
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <motion.h1
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="my-2 text-5xl font-bold leading-10"
                >
                  <code>~</code>
                </motion.h1>
                <div className="mx-auto max-w-[600px]">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-dim-300 mx-2 my-1 p-2 font-normal"
                  >
                    I just pushed some new content to my{" "}
                    <Link href={links.gitHub.link} name="Onlyfans" />
                    <br /> You might want to read my{" "}
                    <Link href={env.NEXT_PUBLIC_BLOG_URL} name="blog" />
                    <br />
                    You can{" "}
                    <button
                      type="button"
                      onClick={copyEmail}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") copyEmail();
                      }}
                      aria-label="Copy email address"
                    >
                      <strong className="glow-300 text-white">email</strong>
                    </button>{" "}
                    or{" "}
                    <button
                      type="button"
                      onClick={copyX}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") copyX();
                      }}
                      aria-label="Copy X handle"
                    >
                      <strong className="glow-300 text-white">x</strong>
                    </button>
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
