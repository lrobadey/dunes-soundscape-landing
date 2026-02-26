import type { SandLayerRole, SandPresetName } from "@/motion/sand/types";

export type SandEngineMode = "canvas" | "dom";
export type SandQualityMode = "auto" | "low" | "medium" | "high";
export type SandStormStyle = "ambient" | "moderate" | "cinematic";

export type SandLayerIndex = 0 | 1 | 2;

export type SandLayerProfile = {
  id: SandLayerRole;
  index: SandLayerIndex;
  baseCount: number;
  sizeMin: number;
  sizeMax: number;
  alphaMin: number;
  alphaMax: number;
  ttlMin: number;
  ttlMax: number;
  baseSpeed: number;
  turbulence: number;
  spawnWeight: number;
  streakBias: number;
  hue: number;
  saturation: number;
  lightness: number;
};

export type SandStormProfile = {
  enterThreshold: number;
  exitThreshold: number;
  spawnBoostMax: number;
  turbulenceBoostMax: number;
  highlightBoostMax: number;
  nearWeightBoostMax: number;
  supplyExponent: number;
};

export type SandRuntimeConfig = {
  seed: string;
  intensity: SandPresetName;
  stormStyle: SandStormStyle;
  width: number;
  height: number;
  pixelRatio: number;
  density: number;
  totalBaseCount: number;
  capacity: number;
  baseWindDirection: number;
  baseWindSpeed: number;
  headingDrift: number;
  flowScale: number;
  flowTimeScale: number;
  spawnMarginBase: number;
  fadeInSecMin: number;
  fadeInSecMax: number;
  fadeOutSecMin: number;
  fadeOutSecMax: number;
  dragBase: number;
  dragByLayer: [number, number, number];
  settleBase: number;
  settleByLayer: [number, number, number];
  shearStrength: number;
  layerProfiles: SandLayerProfile[];
  stormProfile: SandStormProfile;
  noiseSeed: number;
  headingNoiseOffset: number;
};

export type SandSimulationState = {
  config: SandRuntimeConfig;
  capacity: number;
  activeCount: number;
  width: number;
  height: number;
  pixelRatio: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  life: Float32Array;
  ttl: Float32Array;
  size: Float32Array;
  alpha: Float32Array;
  layer: Uint8Array;
  active: Uint8Array;
  lifecycle: Uint8Array;
  fade: Float32Array;
  fadeRate: Float32Array;
  ageNorm: Float32Array;
  spawnCursor: number;
  targetActiveSmoothed: number;
  random: () => number;
};

export type GustPulseEvent = {
  start: number;
  attack: number;
  hold: number;
  decay: number;
  peak: number;
  end: number;
};

export type SandSignalState = {
  seed: string;
  stormStyle: SandStormStyle;
  random: () => number;
  supplyNoiseSeedA: number;
  supplyNoiseSeedB: number;
  gustPeriods: [number, number];
  gustPhases: [number, number];
  supplyPhases: [number, number, number];
  supplyWarpOffset: number;
  gustEvents: GustPulseEvent[];
  nextGustStart: number;
  stormActive: boolean;
};

export type SandSignalSample = {
  timeSec: number;
  gust: number;
  supply: number;
  supplyTrend: number;
  stormLevel: number;
  stormActive: boolean;
  gustPulseActive: boolean;
  spawnBoost: number;
  turbulenceBoost: number;
  highlightBoost: number;
  nearWeightBoost: number;
};

export type SandQualityState = {
  mode: SandQualityMode;
  qualityScalar: number;
  particleScale: number;
  spawnScale: number;
  detailScale: number;
  streakScale: number;
  glowScale: number;
};

export type SandAdaptiveState = {
  mode: SandQualityMode;
  emaFrameMs: number;
  qualityScalar: number;
  upscaleCooldownFrames: number;
};

export type SandStepInput = {
  frameDtSec: number;
  elapsedSec: number;
  signal: SandSignalSample;
  quality: SandQualityState;
};

export type SandDrawInput = {
  width: number;
  height: number;
  signal: SandSignalSample;
  quality: SandQualityState;
};

export const layerIndexById: Record<SandLayerRole, SandLayerIndex> = {
  near: 0,
  mid: 1,
  far: 2,
};
