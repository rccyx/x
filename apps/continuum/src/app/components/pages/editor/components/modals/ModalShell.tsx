"use client";

import type { Variants } from "@rccyx/design/motion";
import { motion } from "@rccyx/design/motion";
import type { PropsWithChildren, MouseEvent } from "react";

interface ModalShellProps {
  onClose: () => void;
  containerClassName?: string;
  overlayClassName?: string;
  initial?: "hidden" | "visible";
  animate?: "hidden" | "visible";
  overlayVariants?: Variants;
  modalVariants?: Variants;
}

export function ModalShell(props: PropsWithChildren<ModalShellProps>) {
  const overlayVariants: Variants =
    props.overlayVariants ??
    ({ hidden: { opacity: 0 }, visible: { opacity: 1 } } as const);

  const modalVariants: Variants =
    props.modalVariants ??
    ({
      hidden: { opacity: 0, y: 50, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    } as const);

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={props.initial ?? "hidden"}
      animate={props.animate ?? "visible"}
      variants={overlayVariants}
    >
      <motion.div
        className={
          props.overlayClassName ??
          "fixed inset-0 bg-black/80 backdrop-blur-[2px]"
        }
        onClick={props.onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        className={
          props.containerClassName ??
          "bg-card relative z-50 w-full max-w-md rounded-lg border p-6 shadow-xl"
        }
        variants={modalVariants}
        onClick={handleContainerClick}
      >
        {props.children}
      </motion.div>
    </motion.div>
  );
}
