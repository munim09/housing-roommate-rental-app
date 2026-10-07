import type { CSSProperties } from "react";

/**
 * Shared Recharts styling so every dashboard chart picks up the app's theme
 * tokens (light and dark) instead of hard-coding colours that break in dark
 * mode. Kept in one place — the chart cards below would otherwise repeat it.
 */
export const CHART_TOOLTIP_STYLE: CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export const CHART_TICK = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
} as const;

/** Screen-reader sentence for a chart whose SVG is decorative. */
export function ChartSummary({ label }: { label: string }) {
  return <p className="sr-only">{label}</p>;
}
