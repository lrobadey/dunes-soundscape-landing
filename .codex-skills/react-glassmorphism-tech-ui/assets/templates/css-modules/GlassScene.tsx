import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./GlassScene.module.css";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function GlassScene() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const tokenStyle = useMemo<React.CSSProperties>(() => {
    return {
      ["--scene-accent" as any]: "0 255 255",
      ["--scene-accent2" as any]: "255 0 200",
      ["--glass-blur" as any]: prefersReducedMotion ? "10px" : "16px",
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let raf = 0;
    let lastX = 0.5;
    let lastY = 0.5;

    const update = () => {
      raf = 0;
      el.style.setProperty("--mx", String(lastX));
      el.style.setProperty("--my", String(lastY));
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      lastX = rect.width ? (e.clientX - rect.left) / rect.width : 0.5;
      lastY = rect.height ? (e.clientY - rect.top) / rect.height : 0.5;
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.scene} style={tokenStyle}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />

      <div className={styles.layout}>
        <section className={styles.panel}>
          <h2 className={styles.h2}>Telemetry</h2>
          <p className={styles.p}>
            Pointer position drives lighting via CSS variables, without rerendering.
          </p>
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <div className={styles.label}>Signal</div>
              <div className={styles.value}>Nominal</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.label}>Drift</div>
              <div className={styles.value}>0.18%</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.label}>Latency</div>
              <div className={styles.value}>12ms</div>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.h2}>Layers</h2>
          <p className={styles.p}>
            Glass surfaces composite over gradients + gridlines. Blur upgrades via @supports.
          </p>
          <div className={styles.chips}>
            <span className={styles.chip}>Glass</span>
            <span className={styles.chip}>Grid</span>
            <span className={styles.chip}>Glow</span>
            <span className={styles.chip}>Noise</span>
          </div>
        </section>
      </div>
    </div>
  );
}

