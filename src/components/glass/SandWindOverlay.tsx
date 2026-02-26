import { useMemo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "@/motion/motion-lib";
import { generateGrains } from "@/motion/sand/generateGrains";
import { sandPresets } from "@/motion/sand/presets";
import type { SandMaskVariant, SandPresetName } from "@/motion/sand/types";

type SandWindOverlayProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SandMaskVariant;
  intensity?: SandPresetName;
  seed?: string;
};

const maskClassByVariant: Record<SandMaskVariant, string> = {
  page: "sand-wind-mask-page fixed inset-0",
  hero: "sand-wind-mask-hero absolute inset-0",
  transition: "sand-wind-mask-transition absolute inset-x-0 top-0 h-36",
};

export const SandWindOverlay = ({
  variant = "page",
  intensity = "faint",
  seed = "dunes-page-v1",
  className,
  ...props
}: SandWindOverlayProps) => {
  const motionReduced = useReducedMotion();
  const mediaReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reducedMotion = Boolean(motionReduced || mediaReduced);
  const preset = sandPresets[intensity];

  const layers = useMemo(() => {
    return preset.layers.map((layer) => ({
      config: layer,
      grains: generateGrains(layer, seed),
    }));
  }, [preset, seed]);

  return (
    <div
      aria-hidden="true"
      role="presentation"
      data-sand-overlay={variant}
      data-intensity={intensity}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={cn("pointer-events-none sand-wind", maskClassByVariant[variant], className)}
      {...props}
    >
      {layers.map(({ config, grains }) => (
        <motion.div
          key={config.id}
          data-layer-id={config.id}
          className="sand-wind-layer"
          initial={false}
          animate={
            reducedMotion
              ? undefined
              : {
                  x: [`${config.drift.from}%`, `${config.drift.to}%`],
                  y: ["0%", `${config.drift.sway}%`, `${-config.drift.sway}%`, "0%"],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: config.duration,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                }
          }
          style={{
            filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
            willChange: reducedMotion ? "auto" : "transform",
          }}
        >
          {grains.map((grain) => (
            <span
              key={grain.id}
              className="sand-wind-grain"
              style={{
                left: `${grain.x}%`,
                top: `${grain.y}%`,
                width: `${grain.size}px`,
                height: `${grain.size}px`,
                "--grain-opacity": grain.opacity * preset.density,
              } as CSSProperties}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export type { SandWindOverlayProps };
