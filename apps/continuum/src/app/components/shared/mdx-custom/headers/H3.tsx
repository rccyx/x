"use client";

import React from "react";
import { motion } from "@rccyx/design/motion";

import type { HProps } from "./types";

export function H3({ children, id }: HProps) {
  return (
    <motion.h3
      animate={{
        opacity: 1,
        x: 0,
      }}
      initial={{
        opacity: 0,
        x: -20,
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      id={id}
      className="text-dim-400 text-2xl font-bold"
    >
      {children}
    </motion.h3>
  );
}
