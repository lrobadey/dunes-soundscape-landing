import { describe, expect, it } from "vitest";
import { createSandRuntimeConfig } from "@/motion/sand/engine/config";
import { createWindSignalState, sampleWindSignals } from "@/motion/sand/engine/signals";
import { createSandSimulation, stepSandSimulation } from "@/motion/sand/engine/simulate";
import { createAdaptiveState, updateAdaptiveState } from "@/motion/sand/engine/adaptive";

describe("sand simulation", () => {
  it("stays stable and bounded over extended stepping", () => {
    const config = createSandRuntimeConfig({
      intensity: "soft",
      seed: "dunes-page-v1",
      stormStyle: "cinematic",
      width: 1280,
      height: 720,
      pixelRatio: 1,
    });

    const signalState = createWindSignalState("dunes-page-v1", "cinematic");
    const adaptiveState = createAdaptiveState("auto");
    const simulation = createSandSimulation(config);

    let time = 0;

    for (let i = 0; i < 500; i += 1) {
      time += 1 / 60;
      const signal = sampleWindSignals(signalState, time);
      const quality = updateAdaptiveState(adaptiveState, 16.67);

      stepSandSimulation(simulation, {
        frameDtSec: 1 / 60,
        elapsedSec: time,
        signal,
        quality,
      });

      expect(simulation.activeCount).toBeGreaterThanOrEqual(0);
      expect(simulation.activeCount).toBeLessThanOrEqual(simulation.capacity);
    }

    for (let i = 0; i < simulation.capacity; i += 1) {
      if (simulation.active[i] === 0) {
        continue;
      }

      expect(Number.isFinite(simulation.x[i])).toBe(true);
      expect(Number.isFinite(simulation.y[i])).toBe(true);
      expect(Number.isFinite(simulation.vx[i])).toBe(true);
      expect(Number.isFinite(simulation.vy[i])).toBe(true);
    }
  });

  it("produces deterministic state evolution for same seed and inputs", () => {
    const configA = createSandRuntimeConfig({
      intensity: "subtle",
      seed: "dunes-page-v1",
      stormStyle: "cinematic",
      width: 1024,
      height: 540,
      pixelRatio: 1,
    });

    const configB = createSandRuntimeConfig({
      intensity: "subtle",
      seed: "dunes-page-v1",
      stormStyle: "cinematic",
      width: 1024,
      height: 540,
      pixelRatio: 1,
    });

    const signalStateA = createWindSignalState("dunes-page-v1", "cinematic");
    const signalStateB = createWindSignalState("dunes-page-v1", "cinematic");

    const qualityStateA = createAdaptiveState("high");
    const qualityStateB = createAdaptiveState("high");

    const simA = createSandSimulation(configA);
    const simB = createSandSimulation(configB);

    let time = 0;

    for (let i = 0; i < 180; i += 1) {
      time += 1 / 60;

      stepSandSimulation(simA, {
        frameDtSec: 1 / 60,
        elapsedSec: time,
        signal: sampleWindSignals(signalStateA, time),
        quality: updateAdaptiveState(qualityStateA, 16.67),
      });

      stepSandSimulation(simB, {
        frameDtSec: 1 / 60,
        elapsedSec: time,
        signal: sampleWindSignals(signalStateB, time),
        quality: updateAdaptiveState(qualityStateB, 16.67),
      });
    }

    expect(simA.activeCount).toBe(simB.activeCount);

    for (let i = 0; i < Math.min(simA.capacity, 120); i += 1) {
      expect(simA.active[i]).toBe(simB.active[i]);
      expect(simA.layer[i]).toBe(simB.layer[i]);
      expect(simA.x[i]).toBeCloseTo(simB.x[i], 5);
      expect(simA.y[i]).toBeCloseTo(simB.y[i], 5);
      expect(simA.vx[i]).toBeCloseTo(simB.vx[i], 5);
      expect(simA.vy[i]).toBeCloseTo(simB.vy[i], 5);
    }
  });
});
