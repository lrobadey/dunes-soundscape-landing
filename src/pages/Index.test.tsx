import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Index from "@/pages/Index";

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

describe("Index sand overlays", () => {
  beforeEach(() => {
    setReducedMotionPreference(false);
  });

  it("renders exactly one page-level sand overlay", () => {
    const { container } = render(<Index />);
    const pageOverlays = container.querySelectorAll('[data-sand-overlay="page"]');

    expect(pageOverlays.length).toBe(1);
  });

  it("does not render legacy hero or transition sand overlays", () => {
    const { container } = render(<Index />);
    const heroOverlays = container.querySelectorAll('[data-sand-overlay="hero"]');
    const transitionOverlays = container.querySelectorAll('[data-sand-overlay="transition"]');

    expect(heroOverlays.length).toBe(0);
    expect(transitionOverlays.length).toBe(0);
  });

  it("hides page-level sand overlay for reduced-motion users", () => {
    setReducedMotionPreference(true);
    const { container } = render(<Index />);
    const pageOverlays = container.querySelectorAll('[data-sand-overlay="page"]');

    expect(pageOverlays.length).toBe(0);
  });
});
