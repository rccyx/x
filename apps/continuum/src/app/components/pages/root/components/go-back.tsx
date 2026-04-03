"use client";

import { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "@rccyx/design/icons";

function BackContent() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const strokeWidth = 2;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`mb-4 ml-2 mt-5 inline-flex items-center text-dim-300 transition-colors hover:text-foreground focus:outline-none focus-visible:ring-0 ${
        pathname === "/" ? "invisible" : ""
      }`}
    >
      <div className="hover:-pl-2 group flex items-center gap-0.5 rounded-full border border-border px-3 py-2 transition-all duration-300 hover:border-border/70 hover:bg-foreground/5 hover:pr-5 md:scale-125">
        <ChevronLeft
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:brightness-125"
          strokeWidth={strokeWidth}
        />
        <ChevronLeft
          className="-ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:brightness-125"
          strokeWidth={strokeWidth}
        />
        <ChevronLeft
          className="-ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-3 group-hover:brightness-125"
          strokeWidth={strokeWidth}
        />
      </div>
    </button>
  );
}

function BackSkeleton() {
  return (
    <div className="inline-flex animate-pulse items-center">
      <div className="bg-muted h-8 w-20 rounded-full" />
    </div>
  );
}

export function GoBack() {
  return (
    <div className="layout pt-6">
      <Suspense fallback={<BackSkeleton />}>
        <BackContent />
      </Suspense>
    </div>
  );
}
