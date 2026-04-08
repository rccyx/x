"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const ThreeTrafficLightsMovingObjects: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      tl.to(".x", {
        rotation: 360,
        duration: 2,
        borderRadius: 16,
        translateX: -150,
        ease: "power1.inOut",
      });
      tl.to(".x", {
        rotation: -360,
        duration: 2,
        borderRadius: 0,
        translateX: 150,
        ease: "power1.inOut",
      });
      tl.to(".x", {
        rotation: 360,
        duration: 2,
        borderRadius: 16,
        translateX: 0,
        ease: "power1.inOut",
      });
    },
    { scope: container, dependencies: [] },
  );
  return (
    <div>
      <div
        ref={container}
        className="flex flex-col items-center justify-center gap-10"
      >
        <div className="x h-10 w-10 animate-pulse rounded-2xl bg-red-400"></div>
        <div className="x h-10 w-10 animate-pulse rounded-2xl bg-yellow-400"></div>
        <div className="x h-10 w-10 animate-pulse rounded-2xl bg-green-500"></div>
      </div>
    </div>
  );
};
