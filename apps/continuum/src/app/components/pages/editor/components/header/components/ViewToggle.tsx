"use client";

import { motion } from "@rccyx/design/motion";
import { observer } from "mobx-react-lite";

import { Button } from "@rccyx/design/ui";

import { useStore } from "~/app/stores";

export const ViewToggle = observer(() => {
  const { store } = useStore();
  const { viewMode } = store.editor;

  const toggleView = () => {
    store.editor.toggleViewMode();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <Button
        role={viewMode === "active" ? "primary" : "secondary"}
        onClick={toggleView}
        className="relative min-w-[120px]"
      >
        <motion.span
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "active" ? "Active Posts" : "Trash"}
        </motion.span>
      </Button>
    </motion.div>
  );
});
