import Link from "next/link";
import { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/card";

/** Shared shell for the sign-in and sign-up pages. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: { text: string; linkText: string; href: string };
}) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardBody className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </CardBody>
        </Card>
        <p className="mt-6 text-center text-sm text-slate-600">
          {footer.text}{" "}
          <Link href={footer.href} className="font-medium text-brand-700 hover:underline">
            {footer.linkText}
          </Link>
        </p>
      </div>
    </div>
  );
}
