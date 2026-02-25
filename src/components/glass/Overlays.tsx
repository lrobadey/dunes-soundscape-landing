import * as React from "react";
import { cn } from "@/lib/utils";
import { SandWindOverlay } from "@/components/glass/SandWindOverlay";

type OverlayProps = React.HTMLAttributes<HTMLDivElement>;
type SandDriftOverlayProps = OverlayProps & {
  variant?: "page" | "hero" | "transition";
  intensity?: "faint" | "subtle" | "soft";
  seed?: string;
};

const GridOverlay = ({ className, ...props }: OverlayProps) => {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn("pointer-events-none absolute inset-0 glass-grid", className)}
      {...props}
    />
  );
};

const NoiseOverlay = ({ className, ...props }: OverlayProps) => {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn("pointer-events-none absolute inset-0 glass-noise", className)}
      {...props}
    />
  );
};

const SandDriftOverlay = ({
  variant = "page",
  intensity = "faint",
  seed = "dunes-page-v1",
  className,
  ...props
}: SandDriftOverlayProps) => {
  return (
    <SandWindOverlay
      variant={variant}
      intensity={intensity}
      seed={seed}
      className={cn(className)}
      {...props}
    />
  );
};

export { GridOverlay, NoiseOverlay, SandDriftOverlay };
