import React, { type ReactNode, useId } from "react";
import styles from "./GlassCard.module.css";

type GlassCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function GlassCard({
  title,
  description,
  icon,
  children,
  onClick,
  className,
}: GlassCardProps) {
  const titleId = useId();
  const descId = useId();

  const Tag = onClick ? "button" : "section";
  const mergedClassName = [styles.card, onClick ? styles.interactive : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={mergedClassName}
      onClick={onClick}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <header className={styles.header}>
        {icon ? <div className={styles.icon}>{icon}</div> : null}
        <div className={styles.headerText}>
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          {description ? (
            <p id={descId} className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
      </header>

      {children ? <div className={styles.body}>{children}</div> : null}
    </Tag>
  );
}

