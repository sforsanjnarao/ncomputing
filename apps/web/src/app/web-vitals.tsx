"use client";

import { useReportWebVitals } from "next/web-vitals";

// Logs LCP/INP/CLS to the console — a free way to actually measure before
// guessing at further performance work.
export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(`[web-vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
  });
  return null;
}
