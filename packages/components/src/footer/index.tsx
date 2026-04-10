import { cn } from "@rccyx/design/ui";

import { CopyRight } from "./components/CopyRight";

export function Footer(props: { className?: string }) {
  return (
    <footer className={cn("pb-9", props.className)}>
      <CopyRight />
    </footer>
  );
}
