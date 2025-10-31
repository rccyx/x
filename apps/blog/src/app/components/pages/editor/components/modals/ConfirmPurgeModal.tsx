"use client";

import { motion } from "@rccyx/design/motion";
import { Button } from "@rccyx/design/ui";
import { ModalShell } from "./ModalShell";

export function ConfirmPurgeModal(props: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPurging?: boolean;
}) {
  return (
    <ModalShell onClose={props.onCancel}>
      <motion.h3
        className="mb-2 text-lg font-bold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Permanently Delete
      </motion.h3>

      <motion.p
        className="text-muted-foreground mb-4 text-sm font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        This action cannot be undone. This will permanently delete "
        <span className="font-semibold">{props.title}</span>".
      </motion.p>

      <motion.div
        className="flex justify-end gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={props.onCancel}
          disabled={props.isPurging}
        >
          Cancel
        </Button>
        <Button
          variant="destructive:outline"
          onClick={props.onConfirm}
          disabled={props.isPurging}
          loading={props.isPurging}
        >
          {props.isPurging ? "Deleting..." : "Delete Permanently"}
        </Button>
      </motion.div>
    </ModalShell>
  );
}
