"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "@rccyx/design/icons";

export function ScrollUp() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show when scrolling up and we're at least 100px down the page
      if (currentScrollY < lastScrollY && currentScrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      setScrollTimeout(
        setTimeout(() => {
          setIsVisible(false);
        }, 1069),
      );

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [lastScrollY, scrollTimeout]);

  return (
    <button
      className={`transition-duration-200 md:px-18 fixed bottom-1 right-1 mx-12 my-12 max-h-3 max-w-3 animate-bounce lg:mx-24 xl:mx-[200px] ${isVisible ? "opacity-100 transition-opacity duration-300" : "opacity-0 transition-opacity duration-300"}`}
    >
      <ChevronUp
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        id="back-up-top"
        className="transition-duration-200 hover:scale-150 hover:opacity-100"
      />
    </button>
  );
}
