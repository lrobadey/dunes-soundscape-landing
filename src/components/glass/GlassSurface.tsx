import * as React from "react";
import { cn } from "@/lib/utils";

type GlassSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong";
};

const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ variant = "default", className, ...props }, ref) => {
    return <div ref={ref} data-variant={variant} className={cn("glass-surface", className)} {...props} />;
  },
);

GlassSurface.displayName = "GlassSurface";

export { GlassSurface };

