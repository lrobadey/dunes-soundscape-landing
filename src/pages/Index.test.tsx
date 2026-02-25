import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Index from "@/pages/Index";

describe("Index sand overlays", () => {
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
});
