"use client";

import { motion } from "@rccyx/design/motion";

export function TextContent({ children }: { children: React.ReactNode }) {
  // Use div to avoid nesting <p> inside <p> when MDX already yields paragraphs
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="text-dim-300 mx-2 my-1 p-2 font-medium"
    >
      {children}
    </motion.div>
  );
}
