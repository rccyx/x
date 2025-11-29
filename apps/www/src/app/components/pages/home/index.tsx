"use client";

import { useEffect } from "react";
import { motion } from "@rccyx/design/motion";
import { useCopyToClipboard } from "react-use";
import { toast, Button, Badge } from "@rccyx/design/ui";
import { ArrowUpRight, GitBranch, AtSign, XIcon } from "@rccyx/design/icons";
import { email, links } from "@rccyx/constants";
import { env } from "@rccyx/env";
import Link from "next/link";

export function HomePage() {
  const [, copyToClipboard] = useCopyToClipboard();

  const emailAddress = email.oss.address;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  const copyEmail = () => {
    copyToClipboard(emailAddress);
    toast.success("Email copied");
  };

  const primaryCtaHref = env.NEXT_PUBLIC_BLOG_URL;

  return (
    <div className="flex ml-32 flex-col scale-125 h-screen w-screen overflow-hidden">
      <main className="flex-1">
        <section
          aria-labelledby="hero-title"
          className="relative flex h-full items-center"
        >
          {/* floating geometric background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
          >
            <motion.div
              className="hidden w-full max-w-6xl grid-cols-2 gap-x-10 gap-y-16 px-4 md:grid md:px-6"
              animate={{ opacity: [0.9, 1, 0.95, 1] }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* left column */}
              <div className="flex flex-col gap-12">
                {/* top-left card */}
                <motion.div
                  className="aspect-[4/3] overflow-hidden rounded-[3rem] border border-border/40 bg-surface/30 shadow-subtle"
                  animate={{
                    y: [0, -22, -10, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: 0.1,
                  }}
                >
                  <div className="h-full w-full bg-gradient-to-tr from-foreground/5 via-foreground/10 to-foreground/5" />
                </motion.div>

                {/* bottom-left card */}
                <motion.div
                  className="aspect-[5/2] overflow-hidden rounded-[3rem] border border-border/30 bg-surface/20"
                  animate={{
                    y: [0, 20, 8, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: 0.25,
                  }}
                >
                  <div className="h-full w-full bg-gradient-to-br from-accent/20 via-accent/5 to-accent/10" />
                </motion.div>
              </div>

              {/* right column */}
              <div className="flex flex-col gap-12">
                {/* top-right card */}
                <motion.div
                  className="aspect-[3/4] overflow-hidden rounded-[3rem] border border-border/35 bg-surface/25"
                  animate={{
                    y: [0, -26, -12, 0],
                  }}
                  transition={{
                    duration: 7.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: 0.18,
                  }}
                >
                  <div className="h-full w-full bg-gradient-to-b from-foreground/15 via-transparent to-foreground/10" />
                </motion.div>

                {/* bottom-right card */}
                <motion.div
                  className="aspect-[7/3] overflow-hidden rounded-[3rem] border border-border/30 bg-surface/20"
                  animate={{
                    y: [0, 18, 6, 0],
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: 0.32,
                  }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-accent/25 via-transparent to-accent/15" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* content */}
          <div className="layout relative z-10 w-full h-full">
            <div className="grid h-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <Badge
                    size="md"
                    tone="neutral"
                    appearance="soft"
                    className="bg-foreground/5 text-xs tracking-[0.18em]"
                  >
                    RCCYX
                  </Badge>

                  <h1
                    id="hero-title"
                    className="text-4xl -tracking-tight font-display font-medium text-text-strong sm:text-5xl md:text-6xl"
                  >
                    Modeling reality
                    <br />
                    on a binary substrate
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* cta buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      variant="default"
                      className="rounded-full px-5 py-2.5"
                    >
                      <a href={primaryCtaHref} target="_blank" rel="noreferrer">
                        Read latest
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full px-5 py-2.5"
                    >
                      <a
                        href={links.gitHub.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <GitBranch className="mr-2 h-4 w-4" />
                        Open Source
                      </a>
                    </Button>
                  </div>

                  {/* email + x links */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.12em] text-dim-300">
                    <Button
                      variant="outline:rounded"
                      aria-label="Copy email address"
                      onClick={copyEmail}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") copyEmail();
                      }}
                    >
                      <AtSign className="h-3.5 w-3.5" />
                    </Button>

                    <Button variant="outline:rounded">
                      <Link
                        href={links.twitter.link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open X profile"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
