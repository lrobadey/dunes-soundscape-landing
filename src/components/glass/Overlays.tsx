import * as React from "react";
import { cn } from "@/lib/utils";

type OverlayProps = React.HTMLAttributes<HTMLDivElement>;
type SandDriftOverlayProps = OverlayProps & {
  variant?: "hero" | "transition";
  intensity?: "subtle" | "soft";
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
  variant = "hero",
  intensity = "subtle",
  className,
  ...props
}: SandDriftOverlayProps) => {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      data-intensity={intensity}
      className={cn(
        "pointer-events-none sand-drift",
        variant === "hero" ? "absolute inset-0 sand-drift-mask-hero" : "absolute inset-x-0 top-0 h-36 sand-drift-mask-transition",
        className,
      )}
      {...props}
    >
      <div className="sand-drift-layer sand-drift-layer-a" />
      <div className="sand-drift-layer sand-drift-layer-b" />
      <div className="sand-drift-layer sand-drift-layer-c" />
    </div>
  );
};

export { GridOverlay, NoiseOverlay, SandDriftOverlay };
