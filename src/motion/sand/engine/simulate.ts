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

const LIFECYCLE_INACTIVE = 0;
const LIFECYCLE_ACTIVE = 1;
const LIFECYCLE_RETIRING = 2;

type RetireReason = "trim-excess" | "out-of-bounds" | "ttl-expired";

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

const hardDeactivateParticle = (state: SandSimulationState, index: number) => {
  if (state.active[index] === 1) {
    state.activeCount = Math.max(0, state.activeCount - 1);
  }

  state.active[index] = LIFECYCLE_INACTIVE;
  state.lifecycle[index] = LIFECYCLE_INACTIVE;
  state.fade[index] = 0;
  state.fadeRate[index] = 0;
  state.ageNorm[index] = 0;
  state.life[index] = 0;
  state.ttl[index] = 1;
};

const retireParticle = (state: SandSimulationState, index: number, reason: RetireReason) => {
  if (state.active[index] === 0 || state.lifecycle[index] === LIFECYCLE_RETIRING) {
    return;
  }

  const fadeOutMin = reason === "out-of-bounds" ? state.config.fadeOutSecMin * 0.9 : state.config.fadeOutSecMin;
  const fadeOutMax = reason === "out-of-bounds" ? state.config.fadeOutSecMax * 0.95 : state.config.fadeOutSecMax;
  const fadeOutSec = randomBetween(fadeOutMin, fadeOutMax, state.random);

  state.lifecycle[index] = LIFECYCLE_RETIRING;
  state.fadeRate[index] = -1 / Math.max(0.001, fadeOutSec);
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

  if (state.active[index] === 0) {
    state.activeCount += 1;
  }

  state.layer[index] = layerIndex;
  state.active[index] = 1;
  state.lifecycle[index] = LIFECYCLE_ACTIVE;

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
  state.ageNorm[index] = clamp(state.life[index] / Math.max(0.001, state.ttl[index]), 0, 1);

  if (!initialFill) {
    const initialSpeed = profile.baseSpeed * (0.7 + signal.gust * 0.35);
    state.vx[index] = headingCos * initialSpeed;
    state.vy[index] = headingSin * initialSpeed;
  } else {
    state.vx[index] = randomBetween(-2, 2, state.random);
    state.vy[index] = randomBetween(-1.8, 1.8, state.random);
  }

  if (initialFill) {
    state.fade[index] = 1;
    state.fadeRate[index] = 0;
    return;
  }

  const fadeInSec = randomBetween(state.config.fadeInSecMin, state.config.fadeInSecMax, state.random);
  state.fade[index] = 0;
  state.fadeRate[index] = 1 / Math.max(0.001, fadeInSec);
};

const retireExcessParticles = (state: SandSimulationState, excessCount: number) => {
  if (excessCount <= 0 || state.activeCount <= 0) {
    return;
  }

  const selected: number[] = [];
  const targetSelectionCount = Math.min(excessCount, state.activeCount);

  for (let selectIndex = 0; selectIndex < targetSelectionCount; selectIndex += 1) {
    let bestIndex = -1;
    let bestAge = -1;
    let bestLayer = -1;
    let bestScanOrder = Number.POSITIVE_INFINITY;

    for (let step = 0; step < state.capacity; step += 1) {
      const index = (state.spawnCursor + step) % state.capacity;
      if (state.active[index] === 0 || state.lifecycle[index] !== LIFECYCLE_ACTIVE) {
        continue;
      }

      let alreadySelected = false;
      for (let candidateIndex = 0; candidateIndex < selected.length; candidateIndex += 1) {
        if (selected[candidateIndex] === index) {
          alreadySelected = true;
          break;
        }
      }

      if (alreadySelected) {
        continue;
      }

      const age = state.life[index] / Math.max(0.001, state.ttl[index]);
      const layerIndex = state.layer[index];
      const hasBetterAge = age > bestAge + 1e-6;
      const sameAge = Math.abs(age - bestAge) <= 1e-6;
      const hasBetterLayer = sameAge && layerIndex > bestLayer;
      const hasBetterOrder = sameAge && layerIndex === bestLayer && step < bestScanOrder;

      if (hasBetterAge || hasBetterLayer || hasBetterOrder) {
        bestIndex = index;
        bestAge = age;
        bestLayer = layerIndex;
        bestScanOrder = step;
      }
    }

    if (bestIndex === -1) {
      break;
    }

    selected.push(bestIndex);
  }

  for (let i = 0; i < selected.length; i += 1) {
    retireParticle(state, selected[i], "trim-excess");
  }
};

const sanitizeParticle = (state: SandSimulationState, index: number) => {
  if (
    !isFiniteNumber(state.x[index]) ||
    !isFiniteNumber(state.y[index]) ||
    !isFiniteNumber(state.vx[index]) ||
    !isFiniteNumber(state.vy[index])
  ) {
    hardDeactivateParticle(state, index);
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
    lifecycle: new Uint8Array(capacity),
    fade: new Float32Array(capacity),
    fadeRate: new Float32Array(capacity),
    ageNorm: new Float32Array(capacity),
    spawnCursor: 0,
    targetActiveSmoothed: 0,
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
  state.targetActiveSmoothed = state.activeCount;

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
  const targetActiveRaw = computeTargetActiveCount(state, input);
  state.targetActiveSmoothed +=
    (targetActiveRaw - state.targetActiveSmoothed) * clamp(dt * 1.8, 0, 1);
  const targetActiveSmoothed = clamp(Math.round(state.targetActiveSmoothed), 0, state.capacity);

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
      layerProfile.turbulence *
      (0.55 + input.signal.supply * 0.95) *
      input.signal.turbulenceBoost *
      (0.82 + input.signal.gust * 0.28);

    const advectionX = headingCos * targetSpeed + flow.x * turbulence;
    const advectionY = headingSin * targetSpeed + flow.y * turbulence * 0.84;

    const heightSafe = Math.max(1, state.height);
    const shearNormalizedY = state.y[i] / heightSafe - 0.5;
    const shearForceX = targetSpeed * state.config.shearStrength * shearNormalizedY;

    const responseRate = 2.4 + input.signal.gust * 0.35;
    const settleReduction = clamp((input.signal.gust - 1) * 0.42, 0, 0.78);
    const settleAccel =
      state.config.settleBase *
      state.config.settleByLayer[layerProfile.index] *
      (1 - settleReduction);

    const ax = (advectionX - state.vx[i]) * responseRate + shearForceX;
    const ay = (advectionY - state.vy[i]) * responseRate + settleAccel;

    state.vx[i] += ax * dt;
    state.vy[i] += ay * dt;

    const speed = Math.hypot(state.vx[i], state.vy[i]);
    const dragCoefficient =
      state.config.dragBase *
      state.config.dragByLayer[layerProfile.index] *
      (0.48 + speed * 0.022);
    const dragDamping = Math.max(0, 1 - dragCoefficient * dt);

    state.vx[i] *= dragDamping;
    state.vy[i] *= dragDamping;

    state.x[i] += state.vx[i] * dt;
    state.y[i] += state.vy[i] * dt;

    state.life[i] += dt;
    state.ageNorm[i] = clamp(state.life[i] / Math.max(0.001, state.ttl[i]), 0, 1);

    if (state.fadeRate[i] !== 0) {
      state.fade[i] = clamp(state.fade[i] + state.fadeRate[i] * dt, 0, 1);
      if (state.lifecycle[i] === LIFECYCLE_ACTIVE && state.fade[i] >= 1) {
        state.fade[i] = 1;
        state.fadeRate[i] = 0;
      }

      if (state.lifecycle[i] === LIFECYCLE_RETIRING && state.fade[i] <= 0) {
        hardDeactivateParticle(state, i);
        continue;
      }
    }

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

    if (state.lifecycle[i] !== LIFECYCLE_ACTIVE || (!outOfBounds && !expired)) {
      continue;
    }

    retireParticle(state, i, outOfBounds ? "out-of-bounds" : "ttl-expired");
  }

  if (state.activeCount > targetActiveSmoothed) {
    const retireBudget = Math.max(1, Math.floor(state.capacity * 0.01 * dt * 60));
    retireExcessParticles(state, Math.min(state.activeCount - targetActiveSmoothed, retireBudget));
  }

  const spawnRate =
    state.config.totalBaseCount *
    (0.55 + input.signal.supply * 1.2) *
    input.signal.spawnBoost *
    input.quality.spawnScale;

  const spawnBudget = Math.max(1, Math.floor(spawnRate * dt));
  const spawnTarget = Math.min(targetActiveRaw, state.activeCount + spawnBudget);

  while (state.activeCount < spawnTarget) {
    const slot = allocateSlot(state);
    if (slot === -1) {
      break;
    }

    const layerIndex = pickLayerIndexForSpawn(state, input.signal);
    spawnParticle(state, slot, layerIndex, input.signal, headingCos, headingSin);
  }
};
