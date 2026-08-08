import { z } from "zod";
import { VisitorEventType } from "@repo/db";

export const TrackEventSchema = z.object({
  type: z.nativeEnum(VisitorEventType),
  path: z.string().max(500).optional(),
  productSlug: z.string().max(200).optional(),
});
