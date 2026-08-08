"use client";

import { useEffect, useState } from "react";
import { LeadDialog } from "@/components/lead-dialog";
import { STRONG_LEAD_EVENT } from "@/lib/track";

const SHOWN_KEY = "ncomputing.autoLeadPromptShown";

/**
 * Listens for the signal track() dispatches when an anonymous visitor's
 * behaviour crosses into "Strong" (see leadScoring.ts on the API) and opens
 * the same lead form a manual "Talk to sales" click would — the only
 * difference is what triggered it. Shows at most once per browser session,
 * and never for someone who already has a Lead (the API already excludes
 * that case from promptForContact, this is just a client-side safety net).
 */
export function AutoLeadPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleStrongLead() {
      if (sessionStorage.getItem(SHOWN_KEY)) return;
      sessionStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
    }

    window.addEventListener(STRONG_LEAD_EVENT, handleStrongLead);
    return () =>
      window.removeEventListener(STRONG_LEAD_EVENT, handleStrongLead);
  }, []);

  return (
    <LeadDialog
      open={open}
      onClose={() => setOpen(false)}
      type="DEMO"
      title="Still deciding?"
      description="You've been looking around for a while — happy to answer questions or set up a quick demo, no pressure."
    />
  );
}
