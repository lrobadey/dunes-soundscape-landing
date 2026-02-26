import { hashSeed } from "@/motion/sand/random";
import { sandPresets } from "@/motion/sand/presets";
import type { SandPresetName } from "@/motion/sand/types";
import {
  layerIndexById,
  type SandLayerProfile,
  type SandQualityMode,
  type SandQualityState,
  type SandRuntimeConfig,
  type SandStormProfile,
  type SandStormStyle,
} from "@/motion/sand/engine/types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const stormStyleProfiles: Record<SandStormStyle, SandStormProfile> = {
  ambient: {
    enterThreshold: 0.78,
    exitThreshold: 0.62,
    spawnBoostMax: 1.5,
    turbulenceBoostMax: 1.25,
    highlightBoostMax: 0.08,
    nearWeightBoostMax: 1.15,
    supplyExponent: 1.25,
  },
  moderate: {
    enterThreshold: 0.74,
    exitThreshold: 0.6,
    spawnBoostMax: 1.85,
    turbulenceBoostMax: 1.45,
    highlightBoostMax: 0.13,
    nearWeightBoostMax: 1.25,
    supplyExponent: 1,
  },
  cinematic: {
    enterThreshold: 0.72,
    exitThreshold: 0.58,
    spawnBoostMax: 2.2,
    turbulenceBoostMax: 1.8,
    highlightBoostMax: 0.18,
    nearWeightBoostMax: 1.4,
    supplyExponent: 0.78,
  },
};

const baseWindSpeedByIntensity: Record<SandPresetName, number> = {
  faint: 12,
  subtle: 17,
  soft: 22,
};

const flowScaleByIntensity: Record<SandPresetName, number> = {
  faint: 0.0034,
  subtle: 0.0031,
  soft: 0.0028,
};

const manualQualityScalars: Record<Exclude<SandQualityMode, "auto">, number> = {
  low: 0.58,
  medium: 0.79,
  high: 1,
};

const toQualityState = (mode: SandQualityMode, qualityScalar: number): SandQualityState => {
  const scalar = clamp(qualityScalar, 0.45, 1);
  const detailScale = clamp((scalar - 0.45) / 0.55, 0, 1);

  return {
    mode,
    qualityScalar: scalar,
    particleScale: scalar,
    spawnScale: clamp(0.58 + scalar * 0.72, 0.62, 1.35),
    detailScale,
    streakScale: 0.72 + detailScale * 0.68,
    glowScale: 0.08 + detailScale * 0.32,
  };
};

export const getManualQualityState = (mode: Exclude<SandQualityMode, "auto">): SandQualityState => {
  return toQualityState(mode, manualQualityScalars[mode]);
};

const ttlByRole: Record<SandLayerProfile["id"], { min: number; max: number }> = {
  near: { min: 2.5, max: 5.5 },
  mid: { min: 4, max: 8 },
  far: { min: 6, max: 11 },
};

const spawnWeightByRole: Record<SandLayerProfile["id"], number> = {
  near: 1,
  mid: 0.82,
  far: 0.64,
};

const streakBiasByRole: Record<SandLayerProfile["id"], number> = {
  near: 1,
  mid: 0.74,
  far: 0.44,
};

const colorByRole: Record<SandLayerProfile["id"], { hue: number; saturation: number; lightness: number }> = {
  near: { hue: 39, saturation: 47, lightness: 80 },
  mid: { hue: 41, saturation: 42, lightness: 82 },
  far: { hue: 44, saturation: 34, lightness: 84 },
};

export const createSandRuntimeConfig = ({
  intensity,
  seed,
  stormStyle,
  width,
  height,
  pixelRatio,
}: {
  intensity: SandPresetName;
  seed: string;
  stormStyle: SandStormStyle;
  width: number;
  height: number;
  pixelRatio: number;
}): SandRuntimeConfig => {
  const preset = sandPresets[intensity];

  const layerProfiles: SandLayerProfile[] = preset.layers.map((layer) => {
    const driftSpeed = (Math.abs(layer.drift.to - layer.drift.from) / Math.max(layer.duration, 1)) * 30;
    const roleColor = colorByRole[layer.id];

    return {
      id: layer.id,
      index: layerIndexById[layer.id],
      baseCount: layer.count,
      sizeMin: layer.size.min,
      sizeMax: layer.size.max,
      alphaMin: clamp(layer.opacity.min * preset.density * 0.56, 0.03, 0.88),
      alphaMax: clamp(layer.opacity.max * preset.density * 0.72, 0.06, 0.96),
      ttlMin: ttlByRole[layer.id].min,
      ttlMax: ttlByRole[layer.id].max,
      baseSpeed: driftSpeed + (layer.id === "near" ? 8 : layer.id === "mid" ? 6 : 4),
      turbulence: layer.gust.verticalNoise * 9.5 + layer.gust.jitter * 1.3,
      spawnWeight: spawnWeightByRole[layer.id],
      streakBias: streakBiasByRole[layer.id],
      hue: roleColor.hue,
      saturation: roleColor.saturation,
      lightness: roleColor.lightness,
    };
  });

  const totalBaseCount = layerProfiles.reduce((total, layer) => total + layer.baseCount, 0);
  const capacity = Math.max(120, Math.ceil(totalBaseCount * 2.6));

  return {
    seed,
    intensity,
    stormStyle,
    width,
    height,
    pixelRatio,
    density: preset.density,
    totalBaseCount,
    capacity,
    baseWindDirection: 0,
    baseWindSpeed: baseWindSpeedByIntensity[intensity],
    headingDrift: 0.42,
    flowScale: flowScaleByIntensity[intensity],
    flowTimeScale: 0.18,
    spawnMarginBase: Math.max(80, Math.min(width, height) * 0.12),
    layerProfiles,
    stormProfile: stormStyleProfiles[stormStyle],
    noiseSeed: hashSeed(`${seed}:${intensity}:${stormStyle}:noise`),
    headingNoiseOffset: hashSeed(`${seed}:${stormStyle}:heading`) / 4294967296,
  };
};

export const getAutoQualityFloor = () => 0.45;

export const toAutoQualityState = (qualityScalar: number): SandQualityState => {
  return toQualityState("auto", qualityScalar);
};
