import { describe, expect, it } from "vitest";
import { createWindSignalState, sampleWindSignals } from "@/motion/sand/engine/signals";
import { stormStyleProfiles } from "@/motion/sand/engine/config";

describe("wind signals", () => {
  it("is deterministic for same seed and storm style", () => {
    const stateA = createWindSignalState("dunes-page-v1", "cinematic");
    const stateB = createWindSignalState("dunes-page-v1", "cinematic");

    const samplesA = [];
    const samplesB = [];

    for (let t = 0; t <= 120; t += 3) {
      samplesA.push(sampleWindSignals(stateA, t));
      samplesB.push(sampleWindSignals(stateB, t));
    }

    expect(samplesA).toEqual(samplesB);
  });

  it("changes trajectories for different seeds", () => {
    const stateA = createWindSignalState("dunes-page-v1", "cinematic");
    const stateB = createWindSignalState("dunes-page-v2", "cinematic");

    const sampleA = sampleWindSignals(stateA, 57.2);
    const sampleB = sampleWindSignals(stateB, 57.2);

    expect(sampleA).not.toEqual(sampleB);
  });

  it("keeps gust/supply in expected bounds and uses hysteresis thresholds", () => {
    const state = createWindSignalState("dunes-page-v1", "cinematic");
    const profile = stormStyleProfiles.cinematic;

    let sawStorm = false;
    let sawCalmAfterStorm = false;

    for (let t = 0; t <= 900; t += 1) {
      const sample = sampleWindSignals(state, t);

      expect(sample.gust).toBeGreaterThanOrEqual(0.45);
      expect(sample.gust).toBeLessThanOrEqual(2.35);
      expect(sample.supply).toBeGreaterThanOrEqual(0.18);
      expect(sample.supply).toBeLessThanOrEqual(1);

      if (sample.stormActive) {
        sawStorm = true;
        if (!sample.gustPulseActive) {
          expect(sample.supply).toBeGreaterThan(profile.exitThreshold - 0.001);
        }
      }

      if (sawStorm && !sample.stormActive) {
        sawCalmAfterStorm = true;
      }
    }

    expect(sawStorm).toBe(true);
    expect(sawCalmAfterStorm).toBe(true);
  });
});
