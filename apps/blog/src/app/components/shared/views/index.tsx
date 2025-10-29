"use client";

import { observer } from "mobx-react-lite";
import { animate } from "@ashgw/design/motion";
import { useEffect, useRef, useState } from "react";
import { Eye } from "@ashgw/design/icons";
import { useStore } from "~/app/stores";
import { ViewsService } from "@ashgw/cross-runtime";
import type { Optional } from "ts-roids";

interface ViewsProps {
  slug: string;
  initial: number;
  className?: string;
  titlePrefix?: string;
}

export const Views = observer(function Views({
  slug,
  initial,
  className,
  titlePrefix,
}: ViewsProps) {
  const { store } = useStore();
  const count = store.view.getCount(slug, initial);

  // this state drives the DOM text, we animate it toward `count`
  const [display, setDisplay] = useState<number>(count);
  const animRef = useRef<Optional<ReturnType<typeof animate>>>(null);

  useEffect(() => {
    // kill prior anim if any
    animRef.current?.stop();
    // animate number with onUpdate updating React state
    animRef.current = animate(display, count, {
      duration: 0.35,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => animRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]); // !!important: depend on `count` mf not `display`

  return (
    <span
      className={className}
      title={`${titlePrefix ?? ""}${count} views`.trim()}
      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
    >
      <Eye className="h-3 w-3 opacity-70" />
      <span className="text-sm font-semibold opacity-70">
        {ViewsService.formatViews(display)}
      </span>
    </span>
  );
});
