import { getAutoQualityFloor, getManualQualityState, toAutoQualityState } from "@/motion/sand/engine/config";
import type { SandAdaptiveState, SandQualityMode, SandQualityState } from "@/motion/sand/engine/types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const mapFrameTimeToScalar = (frameMs: number) => {
  const minScalar = getAutoQualityFloor();
  const minFrame = 16.67;
  const maxFrame = 33.33;

  if (frameMs <= minFrame) {
    return 1;
  }

  if (frameMs >= maxFrame) {
    return minScalar;
  }

  const progress = (frameMs - minFrame) / (maxFrame - minFrame);
  return clamp(1 - progress * (1 - minScalar), minScalar, 1);
};

export const createAdaptiveState = (mode: SandQualityMode = "auto"): SandAdaptiveState => {
  if (mode !== "auto") {
    return {
      mode,
      emaFrameMs: 16.67,
      qualityScalar: getManualQualityState(mode).qualityScalar,
      upscaleCooldownFrames: 0,
    };
  }

  return {
    mode,
    emaFrameMs: 16.67,
    qualityScalar: 1,
    upscaleCooldownFrames: 0,
  };
};

export const updateAdaptiveState = (state: SandAdaptiveState, frameMs: number): SandQualityState => {
  if (state.mode !== "auto") {
    return getManualQualityState(state.mode);
  }

  const clampedFrameMs = clamp(frameMs, 8, 60);

  state.emaFrameMs += (clampedFrameMs - state.emaFrameMs) * 0.12;

  const targetScalar = mapFrameTimeToScalar(state.emaFrameMs);

  if (targetScalar < state.qualityScalar) {
    state.qualityScalar = Math.max(targetScalar, state.qualityScalar - 0.06);
    state.upscaleCooldownFrames = 22;
  } else if (targetScalar > state.qualityScalar) {
    if (state.upscaleCooldownFrames > 0) {
      state.upscaleCooldownFrames -= 1;
    } else {
      state.qualityScalar = Math.min(targetScalar, state.qualityScalar + 0.02);
    }
  }

  state.qualityScalar = clamp(state.qualityScalar, getAutoQualityFloor(), 1);
  return toAutoQualityState(state.qualityScalar);
};
