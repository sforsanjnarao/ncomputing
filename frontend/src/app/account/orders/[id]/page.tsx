"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import { AddressBlock, OrderItemsTable } from "@/components/order-details";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ order: Order }>(`/orders/${id}`)
      .then((data) => setOrder(data.order))
      .catch(() => setError("We could not find that order."));
  }, [id]);

  if (error) {
    return (
      <div className="container-page py-16">
        <p className="text-slate-600">{error}</p>
        <Link href="/account/orders" className="mt-4 inline-block text-brand-700 hover:underline">
          Back to my orders
        </Link>
      </div>
    );
  }

  if (!order) return <div className="container-page py-16 text-slate-500">Loading…</div>;

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> My orders
      </Link>

      {justPlaced && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-savings-600 bg-savings-50 p-5">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-savings-600" />
          <div>
            <p className="font-semibold text-savings-700">Payment received. Thank you.</p>
            <p className="mt-1 text-sm text-savings-700/90">
              A confirmation has been emailed to {order.customerEmail}. We will be in touch about
              dispatch within two working days.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">{order.orderNumber}</h1>
          <p className="mt-1 text-slate-600">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <PaymentStatusBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,20rem] lg:items-start">
        <Card>
          <CardBody>
            <h2 className="font-semibold">Items</h2>
            <div className="mt-4">
              <OrderItemsTable order={order} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-500">Contact</p>
              <p className="mt-1 text-sm text-slate-800">
                {order.customerName}
                <br />
                {order.customerEmail}
                <br />
                {order.customerPhone}
              </p>
            </div>
            <AddressBlock title="Shipping to" address={order.shippingAddress} />
            <AddressBlock title="Billing to" address={order.billingAddress} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
