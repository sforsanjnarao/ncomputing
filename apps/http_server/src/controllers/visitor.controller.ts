import { Request, Response } from "express";
import { prisma } from "@repo/db";
import { TrackEventSchema } from "../zod/visitor.zod";
import { scoreVisitor } from "../leadScoring";

export const trackEvent = async (req: Request, res: Response) => {
  const parsed = TrackEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid event." });
  }

  const visitorId = req.visitorId;
  if (!visitorId) {
    return res.status(400).json({ error: "No visitor id." });
  }

  try {
    await prisma.visitorEvent.create({
      data: {
        visitorId,
        type: parsed.data.type,
        path: parsed.data.path,
        productSlug: parsed.data.productSlug,
      },
    });

    const { scoreLabel } = await scoreVisitor(visitorId);

    // Only worth prompting someone who isn't already a Lead — asking someone
    // who already gave their details to give them again just looks broken.
    const existingLead = await prisma.lead.findFirst({
      where: { visitorId },
      select: { id: true },
    });

    return res.status(201).json({
      scoreLabel,
      promptForContact: scoreLabel === "STRONG" && !existingLead,
    });
  } catch (err) {
    console.error(err);
    // Tracking is best-effort — a failure here should never surface to the
    // visitor as an error state.
    return res.status(200).json({ scoreLabel: "WEAK", promptForContact: false });
  }
};
