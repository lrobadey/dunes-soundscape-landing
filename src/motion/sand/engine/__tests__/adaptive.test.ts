import { describe, expect, it } from "vitest";
import { createAdaptiveState, updateAdaptiveState } from "@/motion/sand/engine/adaptive";

describe("adaptive quality", () => {
  it("drops quality scalar under sustained high frame times", () => {
    const state = createAdaptiveState("auto");
    let quality = updateAdaptiveState(state, 16.67);

    for (let i = 0; i < 90; i += 1) {
      quality = updateAdaptiveState(state, 41);
    }

    expect(quality.qualityScalar).toBeLessThan(0.8);
    expect(quality.qualityScalar).toBeGreaterThanOrEqual(0.45);
  });

  it("recovers quality gradually after frame-time improvement", () => {
    const state = createAdaptiveState("auto");
    let quality = updateAdaptiveState(state, 16.67);

    for (let i = 0; i < 90; i += 1) {
      quality = updateAdaptiveState(state, 40);
    }

    const degraded = quality.qualityScalar;

    for (let i = 0; i < 160; i += 1) {
      quality = updateAdaptiveState(state, 16);
    }

    expect(quality.qualityScalar).toBeGreaterThan(degraded);
    expect(quality.qualityScalar).toBeLessThanOrEqual(1);
  });

  it("uses fixed quality profiles in manual modes", () => {
    const low = updateAdaptiveState(createAdaptiveState("low"), 12);
    const medium = updateAdaptiveState(createAdaptiveState("medium"), 40);
    const high = updateAdaptiveState(createAdaptiveState("high"), 28);

    expect(low.mode).toBe("low");
    expect(medium.mode).toBe("medium");
    expect(high.mode).toBe("high");

    expect(low.qualityScalar).toBeLessThan(medium.qualityScalar);
    expect(medium.qualityScalar).toBeLessThan(high.qualityScalar);
  });
});
