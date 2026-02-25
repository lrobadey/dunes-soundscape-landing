export type SandPresetName = "faint" | "subtle" | "soft";
export type SandMaskVariant = "page" | "hero" | "transition";
export type SandLayerRole = "near" | "mid" | "far";

export type SandDriftRange = {
  from: number;
  to: number;
  sway: number;
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
};
