import { api } from "@/lib/api";
import type { LeadScoreLabel, VisitorEventType } from "@/lib/types";

export const STRONG_LEAD_EVENT = "ncomputing:strong-lead";

type TrackResponse = { scoreLabel: LeadScoreLabel; promptForContact: boolean };

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
    
  }
}
