import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_BADGE, STATUS_OPTIONS, type OrderStatus } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

type Order = {
  id: string;
  full_name: string | null;
  phone: string | null;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  order_items: { id: string; name: string | null; quantity: number; unit_price: number }[];
};

const PAGE_SIZE = 10;
const FILTERS = ["All", ...STATUS_OPTIONS] as const;

function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, full_name, phone, delivery_address, total_amount, status, created_at, user_id, order_items(id, name, quantity, unit_price)")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-orders-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "All") list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || (o.full_name ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [filter, search]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Status → ${status}`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
        <p className="text-slate-500 text-sm">{filtered.length} orders</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or order ID..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8470A]"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                filter === f ? "bg-[#E8470A] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No orders found.</td></tr>
              )}
              {paged.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{o.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                    {o.order_items.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">${Number(o.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500">Cash</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer ${STATUS_BADGE[o.status] ?? "bg-slate-100"}`}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm">
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} onUpdate={updateStatus} />
    </div>
  );
}

function OrderDetailModal({
  order, onClose, onUpdate,
}: { order: Order | null; onClose: () => void; onUpdate: (id: string, status: OrderStatus) => void }) {
  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                  <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-4 space-y-1 text-sm bg-slate-50 rounded-lg p-4">
                <div><span className="text-slate-500">Name:</span> <span className="font-medium">{order.full_name ?? "—"}</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="font-medium">{order.phone ?? "—"}</span></div>
                <div><span className="text-slate-500">Address:</span> <span className="font-medium">{order.delivery_address}</span></div>
              </div>

              <h4 className="font-semibold mt-5 mb-2">Items</h4>
              <ul className="text-sm divide-y divide-slate-100">
                {order.order_items.map((i) => (
                  <li key={i.id} className="flex justify-between py-2">
                    <span>{i.quantity}× {i.name}</span>
                    <span className="font-medium">${(i.quantity * Number(i.unit_price)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold border-t border-slate-200 mt-2 pt-3">
                <span>Total</span><span className="text-[#E8470A]">${Number(order.total_amount).toFixed(2)}</span>
              </div>

              <div className="mt-5 flex gap-2">
                <select
                  value={order.status}
                  onChange={(e) => onUpdate(order.id, e.target.value as OrderStatus)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => onUpdate(order.id, "Cancelled")}
                  disabled={order.status === "Cancelled"}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
