import { useMemo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "@/motion/motion-lib";
import { buildOrganicLayerKeyframes } from "@/motion/sand/buildOrganicLayerKeyframes";
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
    if (reducedMotion) {
      return [];
    }
    return preset.layers.map((layer) => ({
      config: layer,
      grains: generateGrains(layer, seed),
      keyframes: buildOrganicLayerKeyframes(layer, seed),
    }));
  }, [preset, reducedMotion, seed]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      role="presentation"
      data-sand-overlay={variant}
      data-intensity={intensity}
      data-reduced-motion="false"
      className={cn("pointer-events-none sand-wind", maskClassByVariant[variant], className)}
      {...props}
    >
      {layers.map(({ config, grains, keyframes }) => (
        <motion.div
          key={config.id}
          data-layer-id={config.id}
          className="sand-wind-layer"
          initial={{
            x: keyframes.x[0],
            y: keyframes.y[0],
            opacity: keyframes.opacity[0],
          }}
          animate={{
            x: keyframes.x,
            y: keyframes.y,
            opacity: keyframes.opacity,
          }}
          transition={{
            duration: config.duration,
            ease: "linear",
            times: keyframes.times,
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{
            filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
            willChange: "transform, opacity",
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
                "--grain-wobble-x": `${grain.wobbleX}px`,
                "--grain-wobble-y": `${grain.wobbleY}px`,
                "--grain-wobble-duration": `${grain.wobbleDuration}s`,
                "--grain-wobble-delay": `${grain.wobbleDelay}s`,
                "--grain-pulse-duration": `${grain.pulseDuration}s`,
                "--grain-pulse-delay": `${grain.pulseDelay}s`,
                "--grain-pulse-scale": grain.pulseScale,
              } as CSSProperties}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export type { SandWindOverlayProps };
