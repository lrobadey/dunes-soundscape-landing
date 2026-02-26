import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "@/motion/motion-lib";
import { buildOrganicLayerKeyframes } from "@/motion/sand/buildOrganicLayerKeyframes";
import { generateGrains } from "@/motion/sand/generateGrains";
import { sandPresets } from "@/motion/sand/presets";
import { createAdaptiveState, updateAdaptiveState } from "@/motion/sand/engine/adaptive";
import { createSandRuntimeConfig } from "@/motion/sand/engine/config";
import { drawSandSimulation } from "@/motion/sand/engine/draw";
import { createWindSignalState, sampleWindSignals } from "@/motion/sand/engine/signals";
import { createSandSimulation, resizeSandSimulation, stepSandSimulation } from "@/motion/sand/engine/simulate";
import type {
  SandEngineMode,
  SandQualityMode,
  SandStormStyle,
} from "@/motion/sand/engine/types";
import type { SandMaskVariant, SandPresetName } from "@/motion/sand/types";

type SandWindOverlayProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SandMaskVariant;
  intensity?: SandPresetName;
  seed?: string;
  engine?: SandEngineMode;
  quality?: SandQualityMode;
  stormStyle?: SandStormStyle;
};

const maskClassByVariant: Record<SandMaskVariant, string> = {
  page: "sand-wind-mask-page fixed inset-0",
  hero: "sand-wind-mask-hero absolute inset-0",
  transition: "sand-wind-mask-transition absolute inset-x-0 top-0 h-36",
};

const getOverlaySize = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const fallbackWidth = typeof window !== "undefined" ? window.innerWidth : 1;
  const fallbackHeight = typeof window !== "undefined" ? window.innerHeight : 1;

  return {
    width: Math.max(1, Math.round(rect.width || fallbackWidth)),
    height: Math.max(1, Math.round(rect.height || fallbackHeight)),
  };
};

export const SandWindOverlay = ({
  variant = "page",
  intensity = "faint",
  seed = "dunes-page-v1",
  engine = "canvas",
  quality = "auto",
  stormStyle = "cinematic",
  className,
  ...props
}: SandWindOverlayProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const motionReduced = useReducedMotion();
  const mediaReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reducedMotion = Boolean(motionReduced || mediaReduced);
  const preset = sandPresets[intensity];

  const domLayers = useMemo(() => {
    if (reducedMotion || engine !== "dom") {
      return [];
    }

    return preset.layers.map((layer) => ({
      config: layer,
      grains: generateGrains(layer, seed),
      keyframes: buildOrganicLayerKeyframes(layer, seed),
    }));
  }, [engine, preset, reducedMotion, seed]);

  useEffect(() => {
    if (reducedMotion || engine !== "canvas") {
      return;
    }

    const root = rootRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    let disposed = false;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;

    const pixelRatio = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
    const overlaySize = getOverlaySize(root);

    canvas.width = Math.max(1, Math.round(overlaySize.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(overlaySize.height * pixelRatio));
    canvas.style.width = `${overlaySize.width}px`;
    canvas.style.height = `${overlaySize.height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const runtimeConfig = createSandRuntimeConfig({
      intensity,
      seed,
      stormStyle,
      width: overlaySize.width,
      height: overlaySize.height,
      pixelRatio,
    });

    const simulation = createSandSimulation(runtimeConfig);
    const signalState = createWindSignalState(seed, stormStyle);
    const adaptiveState = createAdaptiveState(quality);

    const resize = () => {
      if (disposed) {
        return;
      }

      const nextSize = getOverlaySize(root);
      const nextPixelRatio = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;

      canvas.width = Math.max(1, Math.round(nextSize.width * nextPixelRatio));
      canvas.height = Math.max(1, Math.round(nextSize.height * nextPixelRatio));
      canvas.style.width = `${nextSize.width}px`;
      canvas.style.height = `${nextSize.height}px`;
      context.setTransform(nextPixelRatio, 0, 0, nextPixelRatio, 0, 0);

      resizeSandSimulation(simulation, nextSize.width, nextSize.height, nextPixelRatio);
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resize();
      });
      resizeObserver.observe(root);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", resize);
    }

    const startTime = performance.now();
    let previousTime = startTime;

    const renderFrame = (now: number) => {
      if (disposed) {
        return;
      }

      const frameMs = Math.max(8, now - previousTime);
      previousTime = now;
      const elapsedSec = (now - startTime) / 1000;

      const qualityState = updateAdaptiveState(adaptiveState, frameMs);
      const signal = sampleWindSignals(signalState, elapsedSec);

      stepSandSimulation(simulation, {
        frameDtSec: frameMs / 1000,
        elapsedSec,
        signal,
        quality: qualityState,
      });

      drawSandSimulation(context, simulation, {
        width: simulation.width,
        height: simulation.height,
        signal,
        quality: qualityState,
      });

      frameId = window.requestAnimationFrame(renderFrame);
    };

    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", resize);
      }
    };
  }, [engine, intensity, quality, reducedMotion, seed, stormStyle]);

  if (reducedMotion) {
    return null;
  }

  if (engine === "dom") {
    return (
      <div
        aria-hidden="true"
        role="presentation"
        data-sand-overlay={variant}
        data-intensity={intensity}
        data-engine="dom"
        data-reduced-motion="false"
        className={cn("pointer-events-none sand-wind", maskClassByVariant[variant], className)}
        {...props}
      >
        {domLayers.map(({ config, grains, keyframes }) => (
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
  }

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      role="presentation"
      data-sand-overlay={variant}
      data-intensity={intensity}
      data-engine="canvas"
      data-quality={quality}
      data-storm-style={stormStyle}
      data-reduced-motion="false"
      className={cn("pointer-events-none sand-wind sand-wind-canvas-wrap", maskClassByVariant[variant], className)}
      {...props}
    >
      <canvas ref={canvasRef} className="sand-wind-canvas" />
    </div>
  );
};

export type { SandWindOverlayProps };
