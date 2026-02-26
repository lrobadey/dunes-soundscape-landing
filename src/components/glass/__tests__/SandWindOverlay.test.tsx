import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  });

  it("renders three layers and expected grain count for a preset", () => {
    const { container } = render(<SandWindOverlay intensity="faint" />);
    const expectedCount = sandPresets.faint.layers.reduce((total, layer) => total + layer.count, 0);

    expect(container.querySelectorAll("[data-layer-id]").length).toBe(3);
    expect(container.querySelectorAll(".sand-wind-grain").length).toBe(expectedCount);
  });

  it("is non-interactive and marked as decorative", () => {
    render(<SandWindOverlay intensity="faint" />);
    const overlay = screen.getByRole("presentation", { hidden: true });

    expect(overlay).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toHaveClass("pointer-events-none");
  });

  it("starts each layer from the first generated keyframe and keeps looping animation tracks", () => {
    render(<SandWindOverlay intensity="faint" seed="dunes-page-v1" />);

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

  it("hides the overlay entirely when reduced-motion is enabled", () => {
    setReducedMotionPreference(true);
    const { container } = render(<SandWindOverlay intensity="faint" />);

    expect(screen.queryByRole("presentation", { hidden: true })).toBeNull();
    expect(container.querySelectorAll("[data-layer-id]").length).toBe(0);
  });
});
