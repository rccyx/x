"use client";

import { useSound } from "./SoundContext";
import { Button } from "@rccyx/design/ui";

export function SoundToggle() {
  const { isPlaying, toggleSound, isLoading } = useSound();

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        aria-label={
          isLoading ? "Loading sound" : `Turn sound ${isPlaying ? "off" : "on"}`
        }
        aria-pressed={isPlaying}
        onClick={toggleSound}
        role="secondary"
        appearance="outline"
        shape="rounded"
        disabled={isLoading}
        active={isPlaying}
        loading={isLoading}
      >
        {/* icon */}
        <div className="relative h-5 w-5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute inset-0"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isPlaying ? "opacity-100" : "opacity-60"}
            />
          </svg>

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-[1.5px] w-full rotate-45 transform rounded-full"
                style={{ backgroundColor: "currentColor", opacity: 0.9 }}
              />
            </div>
          )}
        </div>

        {/* label */}
        <span className="text-xs font-semibold uppercase tracking-wider">
          {isLoading ? "LOADING..." : `SOUND ${isPlaying ? "ON" : "OFF"}`}
        </span>
      </Button>
    </div>
  );
}
