"use client";

import { useState } from "react";
import { motion } from "@rccyx/design/motion";
import { Button, Input } from "@rccyx/design/ui";
import { ModalShell } from "./ModalShell";

import type { PostArticleRo } from "@rccyx/api/rpc-models";

export function ConfirmBlogDeleteModal(props: {
  continuum: PostArticleRo;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}) {
  const [confirmation, setConfirmation] = useState("");

  const isMatch = confirmation.trim() === props.continuum.title;

  return (
    <ModalShell onClose={props.onCancel}>
      <motion.h3
        className="mb-2 text-lg font-bold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Delete Continuum
      </motion.h3>

      <motion.p
        className="text-muted-foreground mb-4 text-sm font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        To confirm deletion of{" "}
        <span className="font-semibold">{props.continuum.title}</span>, please
        type the continuum title exactly below.
        <br />
      </motion.p>
      <Input
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="Type continuum title here"
        className="mb-4 w-full"
        disabled={props.isDeleting}
      />

      <motion.div
        className="flex justify-end gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={props.onCancel}
          disabled={props.isDeleting}
          role="secondary"
        >
          Cancel
        </Button>
        <Button
          appearance="outline"
          tone="danger"
          role="secondary"
          onClick={props.onConfirm}
          disabled={!isMatch || props.isDeleting}
          loading={props.isDeleting}
        >
          {props.isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </motion.div>
    </ModalShell>
  );
}
