export type SandPresetName = "faint" | "subtle" | "soft";
export type SandMaskVariant = "page" | "hero" | "transition";
export type SandLayerRole = "near" | "mid" | "far";

export type SandDriftRange = {
  from: number;
  to: number;
  sway: number;
};

export type SandGustConfig = {
  keyframes: number;
  jitter: number;
  verticalNoise: number;
  opacityBoost: number;
  timingVariance: number;
};

export type SandGrainMotionConfig = {
  wobbleX: {
    min: number;
    max: number;
  };
  wobbleY: {
    min: number;
    max: number;
  };
  wobbleDuration: {
    min: number;
    max: number;
  };
  pulseDuration: {
    min: number;
    max: number;
  };
  pulseScale: {
    min: number;
    max: number;
  };
};

export type SandLayerConfig = {
  id: SandLayerRole;
  count: number;
  duration: number;
  size: {
    min: number;
    max: number;
  };
  opacity: {
    min: number;
    max: number;
  };
  drift: SandDriftRange;
  gust: SandGustConfig;
  grainMotion: SandGrainMotionConfig;
  blur: number;
};

export type SandPreset = {
  density: number;
  layers: SandLayerConfig[];
};

export type SandGrain = {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  wobbleX: number;
  wobbleY: number;
  wobbleDuration: number;
  wobbleDelay: number;
  pulseDuration: number;
  pulseDelay: number;
  pulseScale: number;
};

export type SandLayerKeyframes = {
  x: string[];
  y: string[];
  opacity: number[];
  times: number[];
};
