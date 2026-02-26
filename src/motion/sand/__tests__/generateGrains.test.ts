import { describe, expect, it } from "vitest";
import { generateGrains } from "@/motion/sand/generateGrains";
import { sandPresets } from "@/motion/sand/presets";

describe("generateGrains", () => {
  const layer = sandPresets.faint.layers[0];

  it("returns identical output for the same seed", () => {
    const first = generateGrains(layer, "dunes-page-v1");
    const second = generateGrains(layer, "dunes-page-v1");
    expect(first).toEqual(second);
  });

  it("returns different output for different seeds", () => {
    const first = generateGrains(layer, "dunes-page-v1");
    const second = generateGrains(layer, "dunes-page-v2");
    expect(first).not.toEqual(second);
  });

  it("keeps size and opacity values inside configured bounds", () => {
    const grains = generateGrains(layer, "dunes-page-v1");

    for (const grain of grains) {
      expect(grain.size).toBeGreaterThanOrEqual(layer.size.min);
      expect(grain.size).toBeLessThanOrEqual(layer.size.max);
      expect(grain.opacity).toBeGreaterThanOrEqual(layer.opacity.min);
      expect(grain.opacity).toBeLessThanOrEqual(layer.opacity.max);
      expect(grain.wobbleX).toBeGreaterThanOrEqual(layer.grainMotion.wobbleX.min);
      expect(grain.wobbleX).toBeLessThanOrEqual(layer.grainMotion.wobbleX.max);
      expect(grain.wobbleY).toBeGreaterThanOrEqual(layer.grainMotion.wobbleY.min);
      expect(grain.wobbleY).toBeLessThanOrEqual(layer.grainMotion.wobbleY.max);
      expect(grain.wobbleDuration).toBeGreaterThanOrEqual(layer.grainMotion.wobbleDuration.min);
      expect(grain.wobbleDuration).toBeLessThanOrEqual(layer.grainMotion.wobbleDuration.max);
      expect(grain.pulseDuration).toBeGreaterThanOrEqual(layer.grainMotion.pulseDuration.min);
      expect(grain.pulseDuration).toBeLessThanOrEqual(layer.grainMotion.pulseDuration.max);
      expect(grain.pulseScale).toBeGreaterThanOrEqual(layer.grainMotion.pulseScale.min);
      expect(grain.pulseScale).toBeLessThanOrEqual(layer.grainMotion.pulseScale.max);
      expect(grain.wobbleDelay).toBeGreaterThanOrEqual(0);
      expect(grain.wobbleDelay).toBeLessThanOrEqual(6.5);
      expect(grain.pulseDelay).toBeGreaterThanOrEqual(0);
      expect(grain.pulseDelay).toBeLessThanOrEqual(4.5);
    }
  });
});
