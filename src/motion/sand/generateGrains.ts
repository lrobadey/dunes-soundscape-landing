import type { SandGrain, SandLayerConfig } from "@/motion/sand/types";

const hashSeed = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed: string) => {
  let state = hashSeed(seed) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const randomBetween = (min: number, max: number, random: () => number) => {
  return min + (max - min) * random();
};

export const generateGrains = (layer: SandLayerConfig, seed: string): SandGrain[] => {
  const random = createRng(`${seed}:${layer.id}`);
  const grains: SandGrain[] = [];

  for (let i = 0; i < layer.count; i += 1) {
    grains.push({
      id: `${layer.id}-${i}`,
      x: randomBetween(-12, 112, random),
      y: randomBetween(-10, 110, random),
      size: randomBetween(layer.size.min, layer.size.max, random),
      opacity: randomBetween(layer.opacity.min, layer.opacity.max, random),
    });
  }

  return grains;
};
