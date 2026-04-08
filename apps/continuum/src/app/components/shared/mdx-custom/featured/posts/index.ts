import {
  FramerMotionFadeInComponent,
  YeetMe,
} from "./framer-motion/components";
import { ThreeTrafficLightsMovingObjects } from "./gsap/components";

export * from "./framer-motion";
export * from "./gsap";

// Single source of truth for featured components
export const featuredComponents = {
  YeetMe,
  TTLMO: ThreeTrafficLightsMovingObjects,
  FramerMotionFadeInComponent,
};
