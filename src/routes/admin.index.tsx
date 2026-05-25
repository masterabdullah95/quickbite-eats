import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, DollarSign, Clock, UtensilsCrossed, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_BADGE } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/")({
  component: OverviewPage,
});

type RecentOrder = {
  id: string;
  full_name: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: { quantity: number; name: string | null }[];
};

function OverviewPage() {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pending: 0,
    menuItems: 0,
    customers: 0,
  });
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [chart, setChart] = useState<{ day: string; orders: number }[]>([]);

  const load = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const since7 = new Date();
    since7.setDate(since7.getDate() - 6);
    since7.setHours(0, 0, 0, 0);

    const [todays, pending, menu, customers, last7, recentRes] = await Promise.all([
      supabase.from("orders").select("total_amount, status", { count: "exact" }).gte("created_at", startOfDay.toISOString()),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
      supabase.from("menu_items").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("created_at").gte("created_at", since7.toISOString()),
      supabase.from("orders")
        .select("id, full_name, total_amount, status, created_at, order_items(quantity, name)")
        .order("created_at", { ascending: false }).limit(10),
    ]);

    const todayRows = todays.data ?? [];
    setStats({
      ordersToday: todayRows.length,
      revenueToday: todayRows.reduce((a: number, r: { total_amount: number }) => a + Number(r.total_amount), 0),
      pending: pending.count ?? 0,
      menuItems: menu.count ?? 0,
      customers: customers.count ?? 0,
    });

    // Last 7 days buckets
    const buckets: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      buckets[k] = 0;
    }
    (last7.data ?? []).forEach((r: { created_at: string }) => {
      const k = r.created_at.slice(0, 10);
      if (k in buckets) buckets[k]++;
    });
    setChart(
      Object.entries(buckets).map(([k, v]) => ({
        day: new Date(k).toLocaleDateString(undefined, { weekday: "short" }),
        orders: v,
      })),
    );

    setRecent((recentRes.data as RecentOrder[]) ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const cards = [
    { label: "Orders Today", value: stats.ordersToday, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "Revenue Today", value: `$${stats.revenueToday.toFixed(2)}`, icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "Pending Orders", value: stats.pending, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Menu Items", value: stats.menuItems, icon: UtensilsCrossed, color: "bg-[#E8470A]/10 text-[#E8470A]" },
    { label: "Customers", value: stats.customers, icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">Real-time snapshot of QuickBite.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className={`h-10 w-10 rounded-lg grid place-items-center ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{c.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Orders — Last 7 Days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#E8470A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-2 text-sm">
            <Link to="/admin/orders" className="block px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100">Manage orders →</Link>
            <Link to="/admin/menu" className="block px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100">Edit menu →</Link>
            <Link to="/admin/customers" className="block px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100">View customers →</Link>
            <Link to="/admin/analytics" className="block px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100">Analytics →</Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-[#E8470A] font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3">Order ID</th>
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Items</th>
                <th className="text-left px-6 py-3">Total</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No orders yet.</td></tr>
              )}
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-3">{o.full_name ?? "—"}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {o.order_items.reduce((a, i) => a + i.quantity, 0)} items
                  </td>
                  <td className="px-6 py-3 font-semibold">${Number(o.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_BADGE[o.status] ?? "bg-slate-100"}`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">{new Date(o.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
