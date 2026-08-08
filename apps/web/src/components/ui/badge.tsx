import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import type {
  LeadScoreLabel,
  LeadStatus,
  OrderStatus,
  PaymentStatus,
} from "@/lib/types";

type Tone = "neutral" | "blue" | "green" | "amber" | "red";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  blue: "bg-brand-50 text-brand-700",
  green: "bg-savings-50 text-savings-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const orderTones: Record<OrderStatus, Tone> = {
  PENDING: "amber",
  PROCESSING: "blue",
  SHIPPED: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
};

const paymentTones: Record<PaymentStatus, Tone> = {
  PENDING: "amber",
  PAID: "green",
  FAILED: "red",
};

const leadTones: Record<LeadStatus, Tone> = {
  NEW: "amber",
  CONTACTED: "blue",
  QUALIFIED: "green",
  CLOSED: "neutral",
};

const scoreTones: Record<LeadScoreLabel, Tone> = {
  WEAK: "neutral",
  MEDIUM: "amber",
  STRONG: "green",
};

const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={orderTones[status]}>{titleCase(status)}</Badge>
);

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Badge tone={paymentTones[status]}>{titleCase(status)}</Badge>
);

export const LeadStatusBadge = ({ status }: { status: LeadStatus }) => (
  <Badge tone={leadTones[status]}>{titleCase(status)}</Badge>
);

export const LeadScoreBadge = ({ label }: { label: LeadScoreLabel }) => (
  <Badge tone={scoreTones[label]}>{titleCase(label)}</Badge>
);
