import { describe, expect, it } from "vitest";
import { createSandRuntimeConfig } from "@/motion/sand/engine/config";
import { createWindSignalState, sampleWindSignals } from "@/motion/sand/engine/signals";
import { createSandSimulation, stepSandSimulation } from "@/motion/sand/engine/simulate";
import { createAdaptiveState, updateAdaptiveState } from "@/motion/sand/engine/adaptive";
import type { SandQualityState, SandSignalSample, SandSimulationState } from "@/motion/sand/engine/types";

const highQuality: SandQualityState = {
  mode: "high",
  qualityScalar: 1,
  particleScale: 1,
  spawnScale: 1.3,
  detailScale: 1,
  streakScale: 1.3,
  glowScale: 0.4,
};

const lowQuality: SandQualityState = {
  mode: "low",
  qualityScalar: 0.45,
  particleScale: 0.45,
  spawnScale: 0.62,
  detailScale: 0,
  streakScale: 0.72,
  glowScale: 0.08,
};

const makeSignal = (
  elapsedSec: number,
  overrides: Partial<SandSignalSample> = {},
): SandSignalSample => {
  return {
    timeSec: elapsedSec,
    gust: 1,
    supply: 0.7,
    supplyTrend: 0,
    stormLevel: 0,
    stormActive: false,
    gustPulseActive: false,
    spawnBoost: 1,
    turbulenceBoost: 1,
    highlightBoost: 0,
    nearWeightBoost: 1,
    ...overrides,
    timeSec: elapsedSec,
  };
};

const stepWith = (
  simulation: SandSimulationState,
  elapsedSec: number,
  signal: SandSignalSample,
  quality: SandQualityState,
) => {
  stepSandSimulation(simulation, {
    frameDtSec: 1 / 60,
    elapsedSec,
    signal,
    quality,
  });
};

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
    let minFade = Number.POSITIVE_INFINITY;
    let maxFade = Number.NEGATIVE_INFINITY;

    // NOTE: keep this test around ~500 frames as a non-failing perf baseline
    // for manual checks when profiling simulation step regressions.
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

      for (let particleIndex = 0; particleIndex < simulation.capacity; particleIndex += 1) {
        minFade = Math.min(minFade, simulation.fade[particleIndex]);
        maxFade = Math.max(maxFade, simulation.fade[particleIndex]);
      }
    }

    expect(minFade).toBeGreaterThanOrEqual(0);
    expect(maxFade).toBeLessThanOrEqual(1);

    for (let i = 0; i < simulation.capacity; i += 1) {
      if (simulation.active[i] === 0) {
        expect(simulation.lifecycle[i]).toBe(0);
        expect(simulation.fade[i]).toBe(0);
        expect(simulation.fadeRate[i]).toBe(0);
        continue;
      }

      expect(Number.isFinite(simulation.x[i])).toBe(true);
      expect(Number.isFinite(simulation.y[i])).toBe(true);
      expect(Number.isFinite(simulation.vx[i])).toBe(true);
      expect(Number.isFinite(simulation.vy[i])).toBe(true);
      expect(simulation.fade[i]).toBeGreaterThanOrEqual(0);
      expect(simulation.fade[i]).toBeLessThanOrEqual(1);
      expect(simulation.lifecycle[i]).toBeGreaterThanOrEqual(1);
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
      expect(simA.lifecycle[i]).toBe(simB.lifecycle[i]);
      expect(simA.layer[i]).toBe(simB.layer[i]);
      expect(simA.x[i]).toBeCloseTo(simB.x[i], 5);
      expect(simA.y[i]).toBeCloseTo(simB.y[i], 5);
      expect(simA.vx[i]).toBeCloseTo(simB.vx[i], 5);
      expect(simA.vy[i]).toBeCloseTo(simB.vy[i], 5);
      expect(simA.fade[i]).toBeCloseTo(simB.fade[i], 5);
      expect(simA.fadeRate[i]).toBeCloseTo(simB.fadeRate[i], 5);
      expect(simA.ageNorm[i]).toBeCloseTo(simB.ageNorm[i], 5);
    }
  });

  it("does_not_hard_drop_particles_when_target_decreases", () => {
    const config = createSandRuntimeConfig({
      intensity: "soft",
      seed: "dunes-page-v1",
      stormStyle: "cinematic",
      width: 1280,
      height: 720,
      pixelRatio: 1,
    });

    const simulation = createSandSimulation(config);
    let elapsedSec = 0;

    for (let i = 0; i < 90; i += 1) {
      elapsedSec += 1 / 60;
      stepWith(
        simulation,
        elapsedSec,
        makeSignal(elapsedSec, { gust: 1.9, supply: 1, spawnBoost: 1.8, turbulenceBoost: 1.3 }),
        highQuality,
      );
    }

    const beforeDrop = simulation.activeCount;
    let previousCount = beforeDrop;
    let largestSingleFrameDrop = 0;

    for (let i = 0; i < 180; i += 1) {
      elapsedSec += 1 / 60;
      stepWith(
        simulation,
        elapsedSec,
        makeSignal(elapsedSec, { gust: 0.75, supply: 0.18, spawnBoost: 1, turbulenceBoost: 0.9 }),
        lowQuality,
      );
      const frameDrop = Math.max(0, previousCount - simulation.activeCount);
      largestSingleFrameDrop = Math.max(largestSingleFrameDrop, frameDrop);
      previousCount = simulation.activeCount;
    }

    expect(simulation.activeCount).toBeLessThan(beforeDrop - 10);
    expect(largestSingleFrameDrop).toBeLessThanOrEqual(Math.max(4, Math.floor(simulation.capacity * 0.02)));
  });

  it("respawn_uses_fade_in_not_pop_in", () => {
    const config = createSandRuntimeConfig({
      intensity: "subtle",
      seed: "dunes-page-v1",
      stormStyle: "moderate",
      width: 960,
      height: 540,
      pixelRatio: 1,
    });

    const simulation = createSandSimulation(config);

    let forcedInactive = 0;
    for (let i = 0; i < simulation.capacity && forcedInactive < 3; i += 1) {
      if (simulation.active[i] === 0) {
        continue;
      }
      simulation.active[i] = 0;
      simulation.lifecycle[i] = 0;
      simulation.fade[i] = 0;
      simulation.fadeRate[i] = 0;
      simulation.ageNorm[i] = 0;
      simulation.activeCount -= 1;
      forcedInactive += 1;
    }

    let elapsedSec = 1 / 60;
    stepWith(
      simulation,
      elapsedSec,
      makeSignal(elapsedSec, { gust: 1.6, supply: 1, spawnBoost: 1.45 }),
      highQuality,
    );

    const freshSpawnIndices: number[] = [];
    for (let i = 0; i < simulation.capacity; i += 1) {
      if (simulation.active[i] === 1 && simulation.lifecycle[i] === 1 && simulation.fadeRate[i] > 0 && simulation.fade[i] === 0) {
        freshSpawnIndices.push(i);
      }
    }

    expect(freshSpawnIndices.length).toBeGreaterThan(0);

    elapsedSec += 1 / 60;
    stepWith(
      simulation,
      elapsedSec,
      makeSignal(elapsedSec, { gust: 1.6, supply: 1, spawnBoost: 1.45 }),
      highQuality,
    );

    for (let i = 0; i < freshSpawnIndices.length; i += 1) {
      const particleIndex = freshSpawnIndices[i];
      expect(simulation.active[particleIndex]).toBe(1);
      expect(simulation.lifecycle[particleIndex]).toBe(1);
      expect(simulation.fade[particleIndex]).toBeGreaterThan(0);
    }
  });

  it("retired_particles_fade_out_before_recycle", () => {
    const config = createSandRuntimeConfig({
      intensity: "soft",
      seed: "dunes-page-v1",
      stormStyle: "moderate",
      width: 1024,
      height: 640,
      pixelRatio: 1,
    });

    const simulation = createSandSimulation(config);
    const particleIndex = simulation.active.findIndex((activeFlag) => activeFlag === 1);
    expect(particleIndex).toBeGreaterThanOrEqual(0);

    simulation.life[particleIndex] = simulation.ttl[particleIndex] + 0.05;
    simulation.lifecycle[particleIndex] = 1;
    simulation.fade[particleIndex] = 1;
    simulation.fadeRate[particleIndex] = 0;

    let elapsedSec = 1 / 60;
    stepWith(
      simulation,
      elapsedSec,
      makeSignal(elapsedSec, { gust: 1, supply: 0.75, spawnBoost: 1 }),
      highQuality,
    );

    expect(simulation.active[particleIndex]).toBe(1);
    expect(simulation.lifecycle[particleIndex]).toBe(2);
    expect(simulation.fade[particleIndex]).toBeLessThanOrEqual(1);

    const fadeAtRetireStart = simulation.fade[particleIndex];
    elapsedSec += 1 / 60;
    stepWith(
      simulation,
      elapsedSec,
      makeSignal(elapsedSec, { gust: 1, supply: 0.75, spawnBoost: 1 }),
      highQuality,
    );
    expect(simulation.fade[particleIndex]).toBeLessThan(fadeAtRetireStart);

    let retireFrames = 2;
    while (retireFrames < 180 && simulation.lifecycle[particleIndex] === 2) {
      elapsedSec += 1 / 60;
      stepWith(
        simulation,
        elapsedSec,
        makeSignal(elapsedSec, { gust: 1, supply: 0.75, spawnBoost: 1 }),
        highQuality,
      );
      retireFrames += 1;
    }

    expect(retireFrames).toBeGreaterThan(4);

    let waitedForRespawn = 0;
    while (
      waitedForRespawn < 180 &&
      !(simulation.active[particleIndex] === 1 && simulation.lifecycle[particleIndex] === 1 && simulation.fadeRate[particleIndex] > 0)
    ) {
      elapsedSec += 1 / 60;
      stepWith(
        simulation,
        elapsedSec,
        makeSignal(elapsedSec, { gust: 1, supply: 0.75, spawnBoost: 1 }),
        highQuality,
      );
      waitedForRespawn += 1;
    }

    expect(waitedForRespawn).toBeLessThan(180);
    expect(simulation.active[particleIndex]).toBe(1);
    expect(simulation.lifecycle[particleIndex]).toBe(1);
    expect(simulation.fade[particleIndex]).toBeLessThanOrEqual(0.05);
    expect(simulation.fadeRate[particleIndex]).toBeGreaterThan(0);
    expect(simulation.life[particleIndex]).toBeLessThan(1);
  });

  it("never keeps inactive particles draw-eligible", () => {
    const config = createSandRuntimeConfig({
      intensity: "subtle",
      seed: "dunes-page-v1",
      stormStyle: "cinematic",
      width: 900,
      height: 500,
      pixelRatio: 1,
    });

    const simulation = createSandSimulation(config);
    let elapsedSec = 0;

    for (let frame = 0; frame < 180; frame += 1) {
      elapsedSec += 1 / 60;
      stepWith(
        simulation,
        elapsedSec,
        makeSignal(elapsedSec, {
          gust: frame % 45 < 20 ? 1.9 : 0.75,
          supply: frame % 60 < 35 ? 0.92 : 0.2,
          spawnBoost: frame % 60 < 35 ? 1.4 : 1,
          turbulenceBoost: frame % 45 < 20 ? 1.2 : 0.9,
        }),
        frame % 70 < 30 ? highQuality : lowQuality,
      );
    }

    for (let i = 0; i < simulation.capacity; i += 1) {
      if (simulation.active[i] === 0) {
        expect(simulation.lifecycle[i]).toBe(0);
        expect(simulation.fade[i]).toBe(0);
      }
    }
  });
});
