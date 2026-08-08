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
    
    
    return res.status(200).json({ scoreLabel: "WEAK", promptForContact: false });
  }
};
