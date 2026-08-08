export default function Loading() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr,22rem]">
        <div>
          <div className="h-9 w-72 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
      </div>
    </div>
  );
}
