import { prisma, VisitorEventType } from "@repo/db";
import type { LeadScoreLabel } from "@repo/types";

const WEIGHTS: Record<VisitorEventType, number> = {
  PAGE_VIEW: 1,
  PRODUCT_VIEW: 3,
  ADD_TO_CART: 7,
  CHECKOUT_STARTED: 15,
  LEAD_SUBMITTED: 0,
};

const STRONG_THRESHOLD = 10;
const MEDIUM_THRESHOLD = 3;

export function bucketScore(score: number): LeadScoreLabel {
  if (score >= STRONG_THRESHOLD) return "STRONG";
  if (score >= MEDIUM_THRESHOLD) return "MEDIUM";
  return "WEAK";
}

type Activity = { type: VisitorEventType; count: number }[];

function scoreFromCounts(counts: Partial<Record<VisitorEventType, number>>) {
  return Object.entries(counts).reduce(
    (sum, [type, count]) => sum + WEIGHTS[type as VisitorEventType] * count,
    0,
  );
}


export async function scoreVisitor(visitorId: string) {
  const grouped = await prisma.visitorEvent.groupBy({
    by: ["type"],
    where: { visitorId },
    _count: { _all: true },
  });

  const counts: Partial<Record<VisitorEventType, number>> = {};
  const activity: Activity = [];
  for (const row of grouped) {
    counts[row.type] = row._count._all;
    activity.push({ type: row.type, count: row._count._all });
  }

  const score = scoreFromCounts(counts);
  return { score, scoreLabel: bucketScore(score), activity };
}


export async function scoreVisitors(visitorIds: string[]) {
  const ids = [...new Set(visitorIds)];
  const result = new Map<
    string,
    { score: number; scoreLabel: LeadScoreLabel; activity: Activity }
  >();
  if (ids.length === 0) return result;

  const grouped = await prisma.visitorEvent.groupBy({
    by: ["visitorId", "type"],
    where: { visitorId: { in: ids } },
    _count: { _all: true },
  });

  const perVisitor = new Map<string, Activity>();
  for (const row of grouped) {
    const list = perVisitor.get(row.visitorId) ?? [];
    list.push({ type: row.type, count: row._count._all });
    perVisitor.set(row.visitorId, list);
  }

  for (const id of ids) {
    const activity = perVisitor.get(id) ?? [];
    const counts = Object.fromEntries(
      activity.map((a) => [a.type, a.count]),
    ) as Partial<Record<VisitorEventType, number>>;
    const score = scoreFromCounts(counts);
    result.set(id, { score, scoreLabel: bucketScore(score), activity });
  }

  return result;
}
