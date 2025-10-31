"use client";

import { motion } from "@rccyx/design/motion";

export function FramerMotionFadeInComponent() {
  return (
    <motion.div
      className="flex items-center justify-center py-2"
      viewport={{ once: true }}
      whileInView={{
        opacity: 1,
      }}
      initial={{
        opacity: 0,
      }}
      transition={{
        duration: 1,
        ease: "easeInOut",
      }}
    >
      <h1 className="bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text text-4xl font-bold text-transparent">
        I&apos;m Fading in
      </h1>
    </motion.div>
  );
}
