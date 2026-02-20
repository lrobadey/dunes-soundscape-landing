import * as React from "react";
import { cn } from "@/lib/utils";

type OverlayProps = React.HTMLAttributes<HTMLDivElement>;

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

export { GridOverlay, NoiseOverlay };

