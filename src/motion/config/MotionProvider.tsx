import type { ReactNode } from "react";
import { MotionConfig, type Transition } from "@/motion/motion-lib";

const defaultTransition: Transition = {
  duration: 0.8,
  ease: "easeOut",
};

type MotionProviderProps = {
  children: ReactNode;
};

export const MotionProvider = ({ children }: MotionProviderProps) => {
  return (
    <MotionConfig reducedMotion="user" transition={defaultTransition}>
      {children}
    </MotionConfig>
  );
};
