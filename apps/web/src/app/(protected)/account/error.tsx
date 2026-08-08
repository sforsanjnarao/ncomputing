"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-xl font-semibold">Something went wrong.</h1>
      <p className="mt-2 max-w-sm text-slate-600">
        We could not load your account data. Try again in a moment.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
