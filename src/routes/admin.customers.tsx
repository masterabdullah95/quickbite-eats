import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_BADGE } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersAdmin,
});

type Profile = {
  id: string; full_name: string | null; email: string | null;
  phone: string | null; address: string | null; created_at: string | null;
};

type CustomerOrder = {
  id: string; status: string; total_amount: number; created_at: string;
};

function CustomersAdmin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [history, setHistory] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: profs }, { data: ords }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id"),
      ]);
      setProfiles((profs as Profile[]) ?? []);
      const c: Record<string, number> = {};
      (ords ?? []).forEach((o: { user_id: string }) => { c[o.user_id] = (c[o.user_id] ?? 0) + 1; });
      setCounts(c);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return setHistory([]);
    supabase.from("orders").select("id, status, total_amount, created_at")
      .eq("user_id", selected.id).order("created_at", { ascending: false })
      .then(({ data }) => setHistory((data as CustomerOrder[]) ?? []));
  }, [selected]);

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.trim().toLowerCase();
    return profiles.filter((p) =>
      (p.full_name ?? "").toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q),
    );
  }, [profiles, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-500 text-sm">{profiles.length} registered users</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8470A]" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Address</th>
                <th className="text-left px-4 py-3">Orders</th>
                <th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No customers found.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setSelected(p)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium">{p.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{p.address ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold">{counts[p.id] ?? 0}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} className="fixed inset-0 bg-black/50 z-50" />
            <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-lg w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{selected.full_name ?? "Unnamed"}</h3>
                    <p className="text-sm text-slate-500">{selected.email}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <h4 className="font-semibold mt-5 mb-2 text-sm">Order History ({history.length})</h4>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">No orders yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {history.map((o) => (
                      <li key={o.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</div>
                          <div className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_BADGE[o.status] ?? "bg-slate-100"}`}>{o.status}</span>
                          <span className="font-semibold">${Number(o.total_amount).toFixed(2)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
