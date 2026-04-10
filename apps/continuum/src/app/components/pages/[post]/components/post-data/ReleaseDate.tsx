"use client";

import { motion } from "@rccyx/design/motion";

import { DateService } from "@rccyx/cross-runtime";

export function ReleaseDate({ date }: { date: string }) {
  return (
    <motion.p
      animate={{
        opacity: 1,
        scale: 1,
      }}
      initial={{
        opacity: 0,
        scale: 0,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className="text-dim-100 text-sm font-semibold"
    >
      {DateService.formatDate({ stringDate: date })}
    </motion.p>
  );
}
