import { api } from "@/lib/api";
import type { LeadScoreLabel, VisitorEventType } from "@/lib/types";

// Fires when a track() call reports a visitor has crossed into "worth
// prompting" — see components/auto-lead-prompt.tsx for the listener. A custom
// event rather than React context/props because the callers (page view,
// product view, add to cart, checkout) have nothing else in common and
// nothing else to pass this through.
export const STRONG_LEAD_EVENT = "ncomputing:strong-lead";

type TrackResponse = { scoreLabel: LeadScoreLabel; promptForContact: boolean };

/**
 * Best-effort visitor tracking — a failed track call must never surface to
 * the visitor or block whatever they were doing, so this swallows its own
 * errors rather than making every call site handle them.
 */
export async function track(
  type: VisitorEventType,
  meta?: { path?: string; productSlug?: string },
) {
  try {
    const result = await api.post<TrackResponse>("/track", {
      type,
      ...meta,
    });
    if (result.promptForContact) {
      window.dispatchEvent(new CustomEvent(STRONG_LEAD_EVENT));
    }
  } catch {
    // Telemetry failing silently is the correct behaviour here.
  }
}
