import type { SandGrain, SandLayerConfig } from "@/motion/sand/types";
import { createSeededRandom, randomBetween } from "@/motion/sand/random";

export const generateGrains = (layer: SandLayerConfig, seed: string): SandGrain[] => {
  const random = createSeededRandom(`${seed}:${layer.id}`);
  const grains: SandGrain[] = [];

  for (let i = 0; i < layer.count; i += 1) {
    grains.push({
      id: `${layer.id}-${i}`,
      x: randomBetween(-12, 112, random),
      y: randomBetween(-10, 110, random),
      size: randomBetween(layer.size.min, layer.size.max, random),
      opacity: randomBetween(layer.opacity.min, layer.opacity.max, random),
      wobbleX: randomBetween(layer.grainMotion.wobbleX.min, layer.grainMotion.wobbleX.max, random),
      wobbleY: randomBetween(layer.grainMotion.wobbleY.min, layer.grainMotion.wobbleY.max, random),
      wobbleDuration: randomBetween(
        layer.grainMotion.wobbleDuration.min,
        layer.grainMotion.wobbleDuration.max,
        random,
      ),
      wobbleDelay: randomBetween(0, 6.5, random),
      pulseDuration: randomBetween(
        layer.grainMotion.pulseDuration.min,
        layer.grainMotion.pulseDuration.max,
        random,
      ),
      pulseDelay: randomBetween(0, 4.5, random),
      pulseScale: randomBetween(layer.grainMotion.pulseScale.min, layer.grainMotion.pulseScale.max, random),
    });
  }

  return grains;
};
