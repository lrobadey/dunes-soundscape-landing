import { createSeededRandom, hashSeed, randomBetween } from "@/motion/sand/random";
import { valueNoise1D } from "@/motion/sand/engine/noise";
import { stormStyleProfiles } from "@/motion/sand/engine/config";
import type {
  GustPulseEvent,
  SandSignalSample,
  SandSignalState,
  SandStormStyle,
} from "@/motion/sand/engine/types";

const TAU = Math.PI * 2;
const SUPPLY_FLOOR = 0.18;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const easeOutCubic = (t: number) => {
  const inverse = 1 - t;
  return 1 - inverse * inverse * inverse;
};

const easeInOutCubic = (t: number) => {
  if (t < 0.5) {
    return 4 * t * t * t;
  }
  const inverse = -2 * t + 2;
  return 1 - (inverse * inverse * inverse) / 2;
};

const buildSupplyRaw = (state: SandSignalState, timeSec: number) => {
  const warpPrimary = valueNoise1D(timeSec * 0.018 + state.supplyWarpOffset, state.supplyNoiseSeedA);
  const warpSecondary = valueNoise1D(timeSec * 0.007 + state.supplyWarpOffset * 1.7, state.supplyNoiseSeedB);
  const warp = warpPrimary * 0.24 + warpSecondary * 0.12;

  const lfoA = Math.sin(TAU * (timeSec / 65 + state.supplyPhases[0] + warp * 0.07));
  const lfoB = Math.sin(TAU * (timeSec / 110 + state.supplyPhases[1] - warp * 0.05));
  const lfoC = Math.sin(TAU * (timeSec / 175 + state.supplyPhases[2] + warp * 0.035));

  return lfoA * 0.5 + lfoB * 0.32 + lfoC * 0.18;
};

const sampleSupply = (state: SandSignalState, timeSec: number) => {
  const profile = stormStyleProfiles[state.stormStyle];
  const normalized = clamp(buildSupplyRaw(state, timeSec) * 0.5 + 0.5, 0, 1);
  const curved = Math.pow(normalized, profile.supplyExponent);
  return SUPPLY_FLOOR + (1 - SUPPLY_FLOOR) * curved;
};

const scheduleEventsUntil = (state: SandSignalState, horizonSec: number) => {
  while (state.nextGustStart <= horizonSec) {
    const attack = randomBetween(0.8, 2, state.random);
    const hold = randomBetween(1.5, 4, state.random);
    const decay = randomBetween(3, 8, state.random);

    const peak =
      state.stormStyle === "ambient"
        ? randomBetween(0.22, 0.48, state.random)
        : state.stormStyle === "moderate"
          ? randomBetween(0.35, 0.68, state.random)
          : randomBetween(0.5, 0.95, state.random);

    const event: GustPulseEvent = {
      start: state.nextGustStart,
      attack,
      hold,
      decay,
      peak,
      end: state.nextGustStart + attack + hold + decay,
    };

    state.gustEvents.push(event);
    state.nextGustStart = event.end + randomBetween(4, 12, state.random);
  }

  const pruneBefore = horizonSec - 120;
  if (state.gustEvents.length > 18) {
    state.gustEvents = state.gustEvents.filter((event) => event.end >= pruneBefore);
  }
};

const sampleGustBaseline = (state: SandSignalState, timeSec: number) => {
  const wave =
    Math.sin(TAU * (timeSec / state.gustPeriods[0] + state.gustPhases[0])) * 0.62 +
    Math.sin(TAU * (timeSec / state.gustPeriods[1] + state.gustPhases[1])) * 0.38;

  const normalized = clamp(wave * 0.5 + 0.5, 0, 1);
  return 0.64 + normalized * 0.44;
};

const sampleGustPulse = (event: GustPulseEvent, timeSec: number) => {
  if (timeSec < event.start || timeSec > event.end) {
    return 0;
  }

  const elapsed = timeSec - event.start;

  if (elapsed <= event.attack) {
    return easeOutCubic(clamp(elapsed / event.attack, 0, 1)) * event.peak;
  }

  if (elapsed <= event.attack + event.hold) {
    return event.peak;
  }

  const decayElapsed = elapsed - event.attack - event.hold;
  const decayProgress = clamp(decayElapsed / event.decay, 0, 1);
  return (1 - easeInOutCubic(decayProgress)) * event.peak;
};

const computeSupplyTrend = (state: SandSignalState, timeSec: number) => {
  const sampleDelta = 0.2;
  const previous = sampleSupply(state, Math.max(0, timeSec - sampleDelta));
  const next = sampleSupply(state, timeSec + sampleDelta);
  return (next - previous) / (sampleDelta * 2);
};

export const createWindSignalState = (seed: string, stormStyle: SandStormStyle): SandSignalState => {
  const random = createSeededRandom(`${seed}:${stormStyle}:signals`);
  const signalHash = hashSeed(`${seed}:${stormStyle}:signal-noise`);

  return {
    seed,
    stormStyle,
    random,
    supplyNoiseSeedA: signalHash,
    supplyNoiseSeedB: signalHash ^ 0x9e3779b9,
    gustPeriods: [randomBetween(8, 13, random), randomBetween(12, 18, random)],
    gustPhases: [randomBetween(0, 1, random), randomBetween(0, 1, random)],
    supplyPhases: [randomBetween(0, 1, random), randomBetween(0, 1, random), randomBetween(0, 1, random)],
    supplyWarpOffset: randomBetween(50, 500, random),
    gustEvents: [],
    nextGustStart: randomBetween(0.8, 6.2, random),
    stormActive: false,
  };
};

export const sampleWindSignals = (state: SandSignalState, timeSec: number): SandSignalSample => {
  scheduleEventsUntil(state, timeSec + 30);

  const baseline = sampleGustBaseline(state, timeSec);
  let pulse = 0;
  let pulseActive = false;

  for (const event of state.gustEvents) {
    const eventPulse = sampleGustPulse(event, timeSec);
    if (eventPulse > pulse) {
      pulse = eventPulse;
    }
    if (eventPulse > 0.04) {
      pulseActive = true;
    }
  }

  const gust = clamp(baseline + pulse, 0.45, 2.35);

  const supply = sampleSupply(state, timeSec);
  const supplyTrend = computeSupplyTrend(state, timeSec);

  const profile = stormStyleProfiles[state.stormStyle];

  if (state.stormActive) {
    if (supply <= profile.exitThreshold && !pulseActive) {
      state.stormActive = false;
    }
  } else if ((supply > profile.enterThreshold && supplyTrend > 0) || (pulseActive && supply > profile.enterThreshold * 0.88)) {
    state.stormActive = true;
  }

  const stormLevel = clamp((supply - profile.enterThreshold) / (1 - profile.enterThreshold), 0, 1);

  const spawnBoost = state.stormActive ? 1 + (profile.spawnBoostMax - 1) * (0.35 + stormLevel * 0.65) : 1;

  const turbulenceBoost = state.stormActive
    ? 1 + (profile.turbulenceBoostMax - 1) * (0.3 + stormLevel * 0.7)
    : 1;

  const highlightBoost = state.stormActive ? profile.highlightBoostMax * (0.35 + stormLevel * 0.65) : 0;

  const nearWeightBoost = state.stormActive
    ? 1 + (profile.nearWeightBoostMax - 1) * (0.3 + stormLevel * 0.7)
    : 1;

  return {
    timeSec,
    gust,
    supply,
    supplyTrend,
    stormLevel,
    stormActive: state.stormActive,
    gustPulseActive: pulseActive,
    spawnBoost,
    turbulenceBoost,
    highlightBoost,
    nearWeightBoost,
  };
};
