"use client";

import type { ReactNode } from "react";
import type { MaybeUndefined } from "ts-roids";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { logger } from "@rccyx/logger";

interface SoundContextType {
  isPlaying: boolean;
  toggleSound: () => void;
  isLoading: boolean;
}

const SoundContext = createContext<MaybeUndefined<SoundContextType>>(undefined);

interface SoundProviderProps {
  children: ReactNode;
  audioPath?: string;
  initialPlayState?: boolean;
}

export function SoundProvider({
  children,
  audioPath = "/audio/focus_sound.wav",
  initialPlayState = false,
}: SoundProviderProps) {
  const [isPlaying, setIsPlaying] = useState(initialPlayState);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs to store handlers without causing re-renders
  const handleCanPlayThroughRef = useRef(() => setIsLoading(false));
  const handleErrorRef = useRef((e: Event) => {
    logger.error("Audio loading error", { error: e });
    setIsLoading(false);
  });

  // Initialize audio
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsLoading(true);

    const audio = new Audio(audioPath);
    audio.loop = true;
    audioRef.current = audio;

    const handleCanPlayThrough = handleCanPlayThroughRef.current;
    const handleError = handleErrorRef.current;

    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [audioPath]);

  // Play / pause based on state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((_) => {
        logger.error("Audio playback failed");
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const toggleSound = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <SoundContext.Provider value={{ isPlaying, toggleSound, isLoading }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
