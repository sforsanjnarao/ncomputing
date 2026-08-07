import { AdminNav } from "./admin-nav";

/**
 * Admin has its own chrome — no marketing header, no footer. Access is enforced
 * twice: Next.js middleware keeps non-admins out of these URLs, and every API
 * call underneath goes through requireRole('ADMIN') on the server.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="mx-auto w-full max-w-content px-5 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
