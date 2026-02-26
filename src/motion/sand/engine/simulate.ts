import { createSeededRandom, randomBetween } from "@/motion/sand/random";
import { sampleFlowVector, valueNoise1D } from "@/motion/sand/engine/noise";
import type {
  SandLayerProfile,
  SandSignalSample,
  SandSimulationState,
  SandStepInput,
  SandRuntimeConfig,
} from "@/motion/sand/engine/types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const isFiniteNumber = (value: number) => Number.isFinite(value);

const getLayerProfileByIndex = (state: SandSimulationState, layerIndex: number) => {
  return state.config.layerProfiles[layerIndex] ?? state.config.layerProfiles[0];
};

const getSpawnMargin = (state: SandSimulationState) => {
  return state.config.spawnMarginBase + Math.max(state.width, state.height) * 0.18;
};

const pickLayerIndexForSpawn = (state: SandSimulationState, signal: SandSignalSample) => {
  const profiles = state.config.layerProfiles;
  const random = state.random;

  const nearWeight = profiles[0].spawnWeight * signal.nearWeightBoost;
  const midWeight = profiles[1].spawnWeight;
  const farWeight = profiles[2].spawnWeight;
  const totalWeight = nearWeight + midWeight + farWeight;

  const target = random() * totalWeight;
  if (target < nearWeight) {
    return 0;
  }

  if (target < nearWeight + midWeight) {
    return 1;
  }

  return 2;
};

const allocateSlot = (state: SandSimulationState) => {
  for (let step = 0; step < state.capacity; step += 1) {
    const index = (state.spawnCursor + step) % state.capacity;
    if (state.active[index] === 0) {
      state.spawnCursor = (index + 1) % state.capacity;
      return index;
    }
  }

  return -1;
};

const deactivateParticle = (state: SandSimulationState, index: number) => {
  if (state.active[index] === 0) {
    return;
  }
  state.active[index] = 0;
  state.activeCount = Math.max(0, state.activeCount - 1);
};

const placeSpawnPosition = (
  state: SandSimulationState,
  index: number,
  headingCos: number,
  headingSin: number,
  margin: number,
  initialFill: boolean,
) => {
  if (initialFill) {
    state.x[index] = randomBetween(-margin, state.width + margin, state.random);
    state.y[index] = randomBetween(-margin, state.height + margin, state.random);
    return;
  }

  if (Math.abs(headingCos) >= Math.abs(headingSin)) {
    state.x[index] = headingCos >= 0 ? randomBetween(-margin, -margin * 0.15, state.random) : randomBetween(state.width + margin * 0.15, state.width + margin, state.random);
    state.y[index] = randomBetween(-margin, state.height + margin, state.random);
    return;
  }

  state.y[index] = headingSin >= 0 ? randomBetween(-margin, -margin * 0.15, state.random) : randomBetween(state.height + margin * 0.15, state.height + margin, state.random);
  state.x[index] = randomBetween(-margin, state.width + margin, state.random);
};

const spawnParticle = (
  state: SandSimulationState,
  index: number,
  layerIndex: number,
  signal: SandSignalSample,
  headingCos: number,
  headingSin: number,
  initialFill = false,
) => {
  const profile = getLayerProfileByIndex(state, layerIndex);
  const margin = getSpawnMargin(state);

  state.layer[index] = layerIndex;
  state.active[index] = 1;

  placeSpawnPosition(state, index, headingCos, headingSin, margin, initialFill);

  const sizeScale = 1 + signal.supply * 0.12 + (signal.stormActive ? 0.08 : 0);
  state.size[index] = randomBetween(profile.sizeMin, profile.sizeMax, state.random) * sizeScale;

  const alphaStormLift = signal.stormActive ? 0.06 + signal.highlightBoost * 0.5 : 0;
  state.alpha[index] = clamp(
    randomBetween(profile.alphaMin, profile.alphaMax, state.random) * (0.65 + signal.supply * 0.45 + alphaStormLift),
    0.03,
    0.98,
  );

  state.ttl[index] = randomBetween(profile.ttlMin, profile.ttlMax, state.random);
  state.life[index] = initialFill ? randomBetween(0, state.ttl[index], state.random) : 0;

  if (!initialFill) {
    const initialSpeed = profile.baseSpeed * (0.7 + signal.gust * 0.35);
    state.vx[index] = headingCos * initialSpeed;
    state.vy[index] = headingSin * initialSpeed;
  } else {
    state.vx[index] = randomBetween(-2, 2, state.random);
    state.vy[index] = randomBetween(-1.8, 1.8, state.random);
  }

  state.activeCount += 1;
};

const trimExcessParticles = (state: SandSimulationState, excessCount: number) => {
  if (excessCount <= 0 || state.activeCount <= 0) {
    return;
  }

  let remaining = excessCount;
  const stride = Math.max(1, Math.floor(state.capacity / Math.max(8, excessCount * 2)));
  let cursor = Math.floor(state.random() * state.capacity);

  for (let step = 0; step < state.capacity && remaining > 0; step += 1) {
    cursor = (cursor + stride) % state.capacity;

    if (state.active[cursor] === 0) {
      continue;
    }

    deactivateParticle(state, cursor);
    remaining -= 1;
  }
};

const sanitizeParticle = (state: SandSimulationState, index: number) => {
  if (
    !isFiniteNumber(state.x[index]) ||
    !isFiniteNumber(state.y[index]) ||
    !isFiniteNumber(state.vx[index]) ||
    !isFiniteNumber(state.vy[index])
  ) {
    state.active[index] = 0;
    state.activeCount = Math.max(0, state.activeCount - 1);
  }
};

export const createSandSimulation = (config: SandRuntimeConfig): SandSimulationState => {
  const capacity = config.capacity;
  const state: SandSimulationState = {
    config,
    capacity,
    activeCount: 0,
    width: config.width,
    height: config.height,
    pixelRatio: config.pixelRatio,
    x: new Float32Array(capacity),
    y: new Float32Array(capacity),
    vx: new Float32Array(capacity),
    vy: new Float32Array(capacity),
    life: new Float32Array(capacity),
    ttl: new Float32Array(capacity),
    size: new Float32Array(capacity),
    alpha: new Float32Array(capacity),
    layer: new Uint8Array(capacity),
    active: new Uint8Array(capacity),
    spawnCursor: 0,
    random: createSeededRandom(`${config.seed}:${config.intensity}:${config.stormStyle}:particles`),
  };

  const initialCount = Math.min(capacity, Math.round(config.totalBaseCount * 0.72));

  for (let i = 0; i < initialCount; i += 1) {
    const layerIndex = pickLayerIndexForSpawn(state, {
      timeSec: 0,
      gust: 1,
      supply: 0.5,
      supplyTrend: 0,
      stormLevel: 0,
      stormActive: false,
      gustPulseActive: false,
      spawnBoost: 1,
      turbulenceBoost: 1,
      highlightBoost: 0,
      nearWeightBoost: 1,
    });

    spawnParticle(state, i, layerIndex, {
      timeSec: 0,
      gust: 1,
      supply: 0.5,
      supplyTrend: 0,
      stormLevel: 0,
      stormActive: false,
      gustPulseActive: false,
      spawnBoost: 1,
      turbulenceBoost: 1,
      highlightBoost: 0,
      nearWeightBoost: 1,
    }, 1, 0, true);
  }

  state.spawnCursor = initialCount % capacity;

  return state;
};

export const resizeSandSimulation = (
  state: SandSimulationState,
  width: number,
  height: number,
  pixelRatio: number,
) => {
  state.width = Math.max(1, width);
  state.height = Math.max(1, height);
  state.pixelRatio = pixelRatio;
  state.config.width = state.width;
  state.config.height = state.height;
  state.config.pixelRatio = pixelRatio;
  state.config.spawnMarginBase = Math.max(80, Math.min(state.width, state.height) * 0.12);
};

const computeTargetActiveCount = (state: SandSimulationState, input: SandStepInput) => {
  const baseCount = state.config.totalBaseCount;
  const qualityCount = baseCount * input.quality.particleScale;
  const supplyFactor = 0.42 + input.signal.supply * 0.95;
  const stormFactor = input.signal.spawnBoost;

  const target = Math.round(qualityCount * supplyFactor * stormFactor);
  const floor = Math.round(baseCount * input.quality.particleScale * 0.26);

  return clamp(target, floor, state.capacity);
};

const computeHeading = (state: SandSimulationState, elapsedSec: number) => {
  const headingNoise = valueNoise1D(
    elapsedSec * 0.03 + state.config.headingNoiseOffset * 12,
    state.config.noiseSeed ^ 0x6d2b79f5,
  );
  return state.config.baseWindDirection + headingNoise * state.config.headingDrift;
};

export const stepSandSimulation = (state: SandSimulationState, input: SandStepInput) => {
  const dt = clamp(input.frameDtSec, 0, 1 / 30);
  if (dt <= 0) {
    return;
  }

  const heading = computeHeading(state, input.elapsedSec);
  const headingCos = Math.cos(heading);
  const headingSin = Math.sin(heading);

  const margin = getSpawnMargin(state);
  const targetActiveCount = computeTargetActiveCount(state, input);

  const supplySpeedFactor = 0.72 + input.signal.supply * 0.85;

  for (let i = 0; i < state.capacity; i += 1) {
    if (state.active[i] === 0) {
      continue;
    }

    const layerProfile = getLayerProfileByIndex(state, state.layer[i]);

    const flow = sampleFlowVector(
      state.x[i],
      state.y[i],
      input.elapsedSec,
      state.config.noiseSeed,
      state.config.flowScale,
      state.config.flowTimeScale,
    );

    const targetSpeed = (state.config.baseWindSpeed + layerProfile.baseSpeed) * input.signal.gust * supplySpeedFactor;

    const turbulence =
      layerProfile.turbulence * (0.55 + input.signal.supply * 0.95) * input.signal.turbulenceBoost;

    const targetVx = headingCos * targetSpeed + flow.x * turbulence;
    const targetVy = headingSin * targetSpeed + flow.y * turbulence;

    state.vx[i] += (targetVx - state.vx[i]) * 0.16;
    state.vy[i] += (targetVy - state.vy[i]) * 0.16;

    state.x[i] += state.vx[i] * dt;
    state.y[i] += state.vy[i] * dt;

    state.life[i] += dt;

    sanitizeParticle(state, i);
    if (state.active[i] === 0) {
      continue;
    }

    const outOfBounds =
      state.x[i] < -margin ||
      state.x[i] > state.width + margin ||
      state.y[i] < -margin ||
      state.y[i] > state.height + margin;

    const expired = state.life[i] >= state.ttl[i];

    if (!outOfBounds && !expired) {
      continue;
    }

    if (state.activeCount > targetActiveCount + 8 && input.signal.supply < 0.42 && state.random() < 0.55) {
      deactivateParticle(state, i);
      continue;
    }

    const layerIndex = pickLayerIndexForSpawn(state, input.signal);
    deactivateParticle(state, i);
    spawnParticle(state, i, layerIndex, input.signal, headingCos, headingSin);
  }

  if (state.activeCount > targetActiveCount) {
    trimExcessParticles(state, state.activeCount - targetActiveCount);
  }

  const spawnRate =
    state.config.totalBaseCount *
    (0.55 + input.signal.supply * 1.2) *
    input.signal.spawnBoost *
    input.quality.spawnScale;

  const spawnBudget = Math.max(1, Math.floor(spawnRate * dt));
  const spawnTarget = Math.min(targetActiveCount, state.activeCount + spawnBudget);

  while (state.activeCount < spawnTarget) {
    const slot = allocateSlot(state);
    if (slot === -1) {
      break;
    }

    const layerIndex = pickLayerIndexForSpawn(state, input.signal);
    spawnParticle(state, slot, layerIndex, input.signal, headingCos, headingSin);
  }
};
