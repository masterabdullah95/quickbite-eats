import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useIsAdmin } from "@/hooks/use-admin";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — QuickBite" }] }),
  component: AdminGate,
});

function AdminGate() {
  const { isAdmin, user, loading } = useIsAdmin();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="text-slate-500 text-sm">Loading admin...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" search={{ redirect: "/admin" }} />;
  if (!isAdmin) return <Navigate to="/" />;

  return <AdminLayout />;
}
