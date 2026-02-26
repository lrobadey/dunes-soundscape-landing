import { createSeededRandom, randomBetween } from "@/motion/sand/random";
import type { SandLayerConfig, SandLayerKeyframes } from "@/motion/sand/types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const toPercent = (value: number) => `${value.toFixed(3)}%`;

export const buildOrganicLayerKeyframes = (
  layer: SandLayerConfig,
  seed: string,
): SandLayerKeyframes => {
  const random = createSeededRandom(`${seed}:${layer.id}:gust`);
  const steps = Math.max(layer.gust.keyframes, 5);
  const x: string[] = [];
  const y: string[] = [];
  const opacity: number[] = [];
  const times: number[] = [0];
  const opacityBase = 1 - layer.gust.opacityBoost * 0.42;

  let accumulated = 0;
  const increments: number[] = [];
  const baseIncrement = 1 / (steps - 1);

  for (let index = 1; index < steps; index += 1) {
    const increment =
      baseIncrement * (1 + randomBetween(-layer.gust.timingVariance, layer.gust.timingVariance, random));
    increments.push(Math.max(increment, baseIncrement * 0.25));
    accumulated += increments[index - 1];
  }

  let running = 0;
  for (const increment of increments) {
    running += increment;
    times.push(clamp(running / accumulated, 0, 1));
  }
  times[times.length - 1] = 1;

  const pulseCenter = Math.floor(randomBetween(1, steps - 2, random));
  const secondaryPulse = Math.floor(randomBetween(1, steps - 2, random));
  const driftSpan = layer.drift.to - layer.drift.from;

  for (let index = 0; index < steps; index += 1) {
    const progress = index / (steps - 1);
    const eased = Math.pow(progress, randomBetween(0.82, 1.24, random));
    const xBase = layer.drift.from + driftSpan * eased;
    const xOffset = randomBetween(-layer.gust.jitter, layer.gust.jitter, random);
    x.push(toPercent(xBase + xOffset));

    const yBase = Math.sin(progress * Math.PI * 2) * layer.drift.sway;
    const yOffset = randomBetween(-layer.gust.verticalNoise, layer.gust.verticalNoise, random);
    y.push(toPercent(yBase + yOffset));

    const pulseDistance = Math.min(Math.abs(index - pulseCenter), Math.abs(index - secondaryPulse));
    const pulseWeight = clamp(1 - pulseDistance / 2.2, 0, 1);
    const flicker = randomBetween(-0.07, 0.1, random);
    opacity.push(clamp(opacityBase + pulseWeight * layer.gust.opacityBoost + flicker, 0.52, 1.6));
  }

  x[x.length - 1] = x[0];
  y[y.length - 1] = y[0];
  opacity[opacity.length - 1] = opacity[0];

  return { x, y, opacity, times };
};
