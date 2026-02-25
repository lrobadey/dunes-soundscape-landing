import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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

  it("switches to reduced-motion mode with static layer settings", () => {
    setReducedMotionPreference(true);
    const { container } = render(<SandWindOverlay intensity="faint" />);
    const overlay = screen.getByRole("presentation", { hidden: true });
    const layers = Array.from(container.querySelectorAll("[data-layer-id]"));

    expect(overlay).toHaveAttribute("data-reduced-motion", "true");
    expect(layers.length).toBe(3);
    expect(layers.every((layer) => layer.getAttribute("style")?.includes("will-change: auto"))).toBe(true);
  });
});
