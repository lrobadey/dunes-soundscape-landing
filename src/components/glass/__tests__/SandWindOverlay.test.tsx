import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildOrganicLayerKeyframes } from "@/motion/sand/buildOrganicLayerKeyframes";

const { capturedLayerProps, reducedMotionState } = vi.hoisted(() => ({
  capturedLayerProps: [] as Array<{
    layerId?: string;
    initial?: unknown;
    animate?: unknown;
    transition?: unknown;
  }>,
  reducedMotionState: { value: false },
}));

vi.mock("@/motion/motion-lib", async () => {
  const React = await import("react");

  const MotionDiv = ({ children, ...props }: Record<string, unknown>) => {
    capturedLayerProps.push({
      layerId: props["data-layer-id"] as string | undefined,
      initial: props.initial,
      animate: props.animate,
      transition: props.transition,
    });

    const { initial, animate, transition, ...domProps } = props;
    void initial;
    void animate;
    void transition;

    return React.createElement("div", domProps, children);
  };

  return {
    motion: {
      div: MotionDiv,
    },
    useReducedMotion: () => reducedMotionState.value,
  };
});

import { SandWindOverlay } from "@/components/glass/SandWindOverlay";
import { sandPresets } from "@/motion/sand/presets";

const setReducedMotionPreference = (enabled: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? enabled : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

describe("SandWindOverlay", () => {
  beforeEach(() => {
    setReducedMotionPreference(false);
    reducedMotionState.value = false;
    capturedLayerProps.length = 0;

    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: () => {},
      setTransform: () => {},
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      fillStyle: "",
      strokeStyle: "",
      lineCap: "round",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders one canvas overlay by default", () => {
    const { container } = render(<SandWindOverlay intensity="faint" />);
    const overlay = screen.getByRole("presentation", { hidden: true });

    expect(overlay).toHaveAttribute("data-engine", "canvas");
    expect(overlay).toHaveClass("sand-wind-canvas-wrap");
    expect(container.querySelectorAll("canvas.sand-wind-canvas").length).toBe(1);
    expect(container.querySelectorAll(".sand-wind-grain").length).toBe(0);
  });

  it("renders the legacy dom grain implementation when engine is dom", () => {
    const { container } = render(<SandWindOverlay intensity="faint" engine="dom" />);
    const expectedCount = sandPresets.faint.layers.reduce((total, layer) => total + layer.count, 0);

    expect(container.querySelectorAll("[data-layer-id]").length).toBe(3);
    expect(container.querySelectorAll(".sand-wind-grain").length).toBe(expectedCount);
  });

  it("keeps deterministic dom keyframe tracks in fallback mode", () => {
    render(<SandWindOverlay intensity="faint" engine="dom" seed="dunes-page-v1" />);

    const byLayerId = new Map(capturedLayerProps.map((entry) => [entry.layerId, entry]));

    for (const layer of sandPresets.faint.layers) {
      const expected = buildOrganicLayerKeyframes(layer, "dunes-page-v1");
      const captured = byLayerId.get(layer.id);

      expect(captured).toBeDefined();
      expect(captured?.initial).toEqual({
        x: expected.x[0],
        y: expected.y[0],
        opacity: expected.opacity[0],
      });

      expect(captured?.animate).toEqual({
        x: expected.x,
        y: expected.y,
        opacity: expected.opacity,
      });

      expect(captured?.transition).toMatchObject({
        duration: layer.duration,
        ease: "linear",
        times: expected.times,
        repeat: Infinity,
        repeatType: "loop",
      });
    }
  });

  it("hides overlay entirely for reduced-motion users", () => {
    setReducedMotionPreference(true);
    const { container } = render(<SandWindOverlay intensity="faint" />);

    expect(screen.queryByRole("presentation", { hidden: true })).toBeNull();
    expect(container.querySelectorAll("canvas.sand-wind-canvas").length).toBe(0);
    expect(container.querySelectorAll("[data-layer-id]").length).toBe(0);
  });
});
