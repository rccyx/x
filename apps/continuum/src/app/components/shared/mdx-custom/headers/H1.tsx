"use client";

import React from "react";
import { motion } from "@rccyx/design/motion";

import { cn } from "@rccyx/design/ui";

import type { HProps } from "./types";

const animations = {
  animate: {
    opacity: 1,
    y: 0,
  },
  initial: {
    opacity: 0,
    y: -30,
  },
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

export function H1({
  children,
  id,
  className,
}: HProps & {
  className?: string;
}) {
  return (
    <motion.h1
      {...animations}
      id={id}
      className={cn("my-2 text-5xl font-bold leading-10", className)}
    >
      {children}
    </motion.h1>
  );
}
