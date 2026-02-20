import React, { useEffect, useRef, useState } from "react";
import styles from "./TechHud.module.css";

type TechHudProps = {
  active: boolean;
  label?: string;
};

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

export function TechHud({ active, label = "SYSTEM" }: TechHudProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dotRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = dotRef.current;
    if (!el) return;
    if (!active || prefersReducedMotion) return;

    const anim = el.animate(
      [
        { transform: "scale(1)", opacity: 0.75 },
        { transform: "scale(1.55)", opacity: 0.25 },
        { transform: "scale(1)", opacity: 0.75 },
      ],
      { duration: 1100, iterations: Infinity, easing: "ease-in-out" }
    );

    return () => anim.cancel();
  }, [active, prefersReducedMotion]);

  return (
    <aside className={[styles.hud, active ? styles.active : ""].filter(Boolean).join(" ")} aria-label={label}>
      <div className={styles.frame} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.badge}>
          <span ref={dotRef} className={styles.dot} aria-hidden="true" />
          <span className={styles.badgeText}>{label}</span>
        </div>
        <div className={styles.readout} aria-hidden="true">
          <span>LINK</span>
          <span className={styles.readoutValue}>{active ? "LOCKED" : "IDLE"}</span>
        </div>
      </header>

      <svg className={styles.svg} viewBox="0 0 600 220" role="img" aria-label="HUD overlay">
        <path className={styles.line} d="M18 32 H220 M380 32 H582" />
        <path className={styles.line} d="M18 190 H190 M410 190 H582" />
        <path className={styles.lineDim} d="M40 70 H560" />
        <path className={styles.lineDim} d="M40 110 H560" />
        <path className={styles.lineDim} d="M40 150 H560" />
        <circle className={styles.ring} cx="300" cy="110" r="56" />
        <circle className={styles.ringDim} cx="300" cy="110" r="82" />
        <text className={styles.text} x="300" y="118" textAnchor="middle">
          {active ? "TRACKING" : "STANDBY"}
        </text>
      </svg>

      <div className={styles.scan} aria-hidden="true" />
    </aside>
  );
}

