import type { SandDrawInput, SandSimulationState } from "@/motion/sand/engine/types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const strokeAlphaByLayer = [0.9, 0.72, 0.56];
const dotScaleByLayer = [1, 0.92, 0.84];

const toFillStyle = (hue: number, saturation: number, lightness: number) => {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

const toHighlightStyle = (hue: number, saturation: number, lightness: number, highlightBoost: number) => {
  const warmHue = hue - 4;
  const warmSaturation = clamp(saturation + 10, 0, 100);
  const warmLightness = clamp(lightness - 5 + highlightBoost * 15, 0, 100);

  return `hsl(${warmHue} ${warmSaturation}% ${warmLightness}%)`;
};

const computeLifeEnvelope = (ageNorm: number, lifecycle: number) => {
  const early = clamp(ageNorm / 0.08, 0, 1);
  const late = clamp((1 - ageNorm) / 0.35, 0, 1);
  const envelope = clamp(0.24 + 0.76 * Math.min(early, late + 0.25), 0.2, 1);

  if (lifecycle === 2) {
    return envelope * 0.92;
  }

  return envelope;
};

export const drawSandSimulation = (
  ctx: CanvasRenderingContext2D,
  state: SandSimulationState,
  input: SandDrawInput,
) => {
  ctx.clearRect(0, 0, input.width, input.height);
  ctx.globalCompositeOperation = "source-over";

  const commonAlphaScale =
    (0.58 + input.signal.supply * 0.68) *
    (0.72 + input.signal.gust * 0.42) *
    (0.88 + input.quality.detailScale * 0.22);

  for (let layerIndex = 0; layerIndex < state.config.layerProfiles.length; layerIndex += 1) {
    const profile = state.config.layerProfiles[layerIndex];

    ctx.fillStyle = toFillStyle(profile.hue, profile.saturation, profile.lightness);
    ctx.strokeStyle = toFillStyle(profile.hue, profile.saturation, profile.lightness);
    ctx.lineCap = "round";

    const baseStreakThreshold = 0.7 + (1 - dotScaleByLayer[layerIndex]) * 0.8;

    for (let i = 0; i < state.capacity; i += 1) {
      if (state.active[i] === 0 || state.layer[i] !== layerIndex || state.lifecycle[i] === 0) {
        continue;
      }

      const speed = Math.hypot(state.vx[i], state.vy[i]);
      const speedSafe = speed || 1;

      const lifeEnvelope = computeLifeEnvelope(state.ageNorm[i], state.lifecycle[i]);
      const fade = clamp(state.fade[i], 0, 1);
      if (fade <= 0) {
        continue;
      }

      const streakThresholdAdjust = layerIndex === 0 ? clamp((speed - 28) / 90, 0, 0.16) : 0;
      const streakThreshold = Math.max(0.48, baseStreakThreshold - streakThresholdAdjust);

      const size = state.size[i] * (1 + input.signal.supply * 0.08) * dotScaleByLayer[layerIndex];
      const alpha = clamp(state.alpha[i] * commonAlphaScale * fade * lifeEnvelope, 0.002, 0.92);

      const streakLength = clamp(
        speed * 0.045 * profile.streakBias * input.quality.streakScale * (input.signal.stormActive ? 1.2 : 1),
        0.55,
        8,
      );

      if (streakLength > size * streakThreshold) {
        const dirX = state.vx[i] / speedSafe;
        const dirY = state.vy[i] / speedSafe;

        ctx.globalAlpha = alpha * strokeAlphaByLayer[layerIndex];
        ctx.lineWidth = Math.max(0.35, size * 0.78);
        ctx.beginPath();
        ctx.moveTo(state.x[i], state.y[i]);
        ctx.lineTo(state.x[i] - dirX * streakLength, state.y[i] - dirY * streakLength);
        ctx.stroke();
      }

      ctx.globalAlpha = alpha;
      ctx.fillRect(state.x[i] - size * 0.5, state.y[i] - size * 0.5, size, size);

      if (input.signal.highlightBoost > 0 && layerIndex === 0 && input.quality.glowScale > 0.2) {
        ctx.fillStyle = toHighlightStyle(
          profile.hue,
          profile.saturation,
          profile.lightness,
          input.signal.highlightBoost,
        );
        ctx.globalAlpha = alpha * input.signal.highlightBoost * input.quality.glowScale;
        const glowSize = size * (1.4 + input.quality.detailScale * 0.5);
        ctx.fillRect(state.x[i] - glowSize * 0.5, state.y[i] - glowSize * 0.5, glowSize, glowSize);
        ctx.fillStyle = toFillStyle(profile.hue, profile.saturation, profile.lightness);
      }
    }
  }

  ctx.globalAlpha = 1;
};
