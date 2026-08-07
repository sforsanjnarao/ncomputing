"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatInr } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api
      .get<{ orders: Order[] }>("/orders/mine")
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="heading-1">My orders</h1>
      <p className="mt-2 text-slate-600">
        Everything you have ordered, and where each one is.
      </p>

      {orders === null ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : orders.length === 0 ? (
        <Card className="mt-8">
          <CardBody className="flex flex-col items-center py-14 text-center">
            <Package className="h-10 w-10 text-slate-300" />
            <p className="mt-4 font-medium">No orders yet</p>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Once you place an order it will appear here with its delivery
              status.
            </p>
            <ButtonLink href="/products" className="mt-6">
              Browse products
            </ButtonLink>
          </CardBody>
        </Card>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.id}`} className="block">
                <Card className="transition-shadow hover:shadow-lg">
                  <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(order.createdAt)} ·{" "}
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}{" "}
                        items
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.items
                          .map((item) => item.product.name)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <p className="font-semibold tabular-nums">
                        {formatInr(order.orderAmount)}
                      </p>
                      <div className="flex gap-2">
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
