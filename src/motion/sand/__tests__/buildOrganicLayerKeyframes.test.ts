import { describe, expect, it } from "vitest";
import { buildOrganicLayerKeyframes } from "@/motion/sand/buildOrganicLayerKeyframes";
import { sandPresets } from "@/motion/sand/presets";

describe("buildOrganicLayerKeyframes", () => {
  const layer = sandPresets.soft.layers[0];

  it("returns identical keyframes for the same seed", () => {
    const first = buildOrganicLayerKeyframes(layer, "dunes-page-v1");
    const second = buildOrganicLayerKeyframes(layer, "dunes-page-v1");
    expect(first).toEqual(second);
  });

  it("returns different keyframes for different seeds", () => {
    const first = buildOrganicLayerKeyframes(layer, "dunes-page-v1");
    const second = buildOrganicLayerKeyframes(layer, "dunes-page-v2");
    expect(first).not.toEqual(second);
  });

  it("generates valid timing tracks with loop continuity", () => {
    const keyframes = buildOrganicLayerKeyframes(layer, "dunes-page-v1");

    expect(keyframes.x.length).toBe(layer.gust.keyframes);
    expect(keyframes.y.length).toBe(layer.gust.keyframes);
    expect(keyframes.opacity.length).toBe(layer.gust.keyframes);
    expect(keyframes.times.length).toBe(layer.gust.keyframes);

    expect(keyframes.times[0]).toBe(0);
    expect(keyframes.times[keyframes.times.length - 1]).toBe(1);

    for (let i = 1; i < keyframes.times.length; i += 1) {
      expect(keyframes.times[i]).toBeGreaterThanOrEqual(keyframes.times[i - 1]);
    }

    expect(keyframes.x[0]).toBe(keyframes.x[keyframes.x.length - 1]);
    expect(keyframes.y[0]).toBe(keyframes.y[keyframes.y.length - 1]);
    expect(keyframes.opacity[0]).toBe(keyframes.opacity[keyframes.opacity.length - 1]);
  });
});
