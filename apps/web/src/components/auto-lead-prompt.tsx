"use client";

import { useEffect, useState } from "react";
import { LeadDialog } from "@/components/lead-dialog";
import { STRONG_LEAD_EVENT } from "@/lib/track";

const SHOWN_KEY = "ncomputing.autoLeadPromptShown";

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
