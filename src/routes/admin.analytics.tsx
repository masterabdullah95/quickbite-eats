import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["#E8470A", "#0F172A", "#3b82f6", "#10b981", "#a855f7", "#f59e0b"];

function AnalyticsPage() {
  const [revenue, setRevenue] = useState<{ day: string; revenue: number }[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; sold: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [heatmap, setHeatmap] = useState<number[]>(Array(24).fill(0));

  useEffect(() => {
    (async () => {
      const since30 = new Date(); since30.setDate(since30.getDate() - 29); since30.setHours(0, 0, 0, 0);

      const [ordersRes, itemsRes, menuRes] = await Promise.all([
        supabase.from("orders").select("created_at, total_amount").gte("created_at", since30.toISOString()),
        supabase.from("order_items").select("name, quantity, menu_item_id"),
        supabase.from("menu_items").select("id, category"),
      ]);

      // Revenue last 30 days
      const buckets: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      (ordersRes.data ?? []).forEach((o) => {
        if (!o.created_at) return;
        const k = o.created_at.slice(0, 10);
        if (k in buckets) buckets[k] += Number(o.total_amount);
      });
      setRevenue(Object.entries(buckets).map(([k, v]) => ({
        day: new Date(k).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        revenue: Number(v.toFixed(2)),
      })));

      // Peak hours
      const hours = Array(24).fill(0);
      const allOrders = (await supabase.from("orders").select("created_at")).data ?? [];
      allOrders.forEach((o) => { if (o.created_at) hours[new Date(o.created_at).getHours()]++; });
      setHeatmap(hours);

      // Top items
      const tally: Record<string, { name: string; sold: number }> = {};
      (itemsRes.data ?? []).forEach((it: { name: string | null; quantity: number; menu_item_id: string }) => {
        const n = it.name ?? "Unknown";
        tally[n] = tally[n] ?? { name: n, sold: 0 };
        tally[n].sold += it.quantity;
      });
      setTopItems(Object.values(tally).sort((a, b) => b.sold - a.sold).slice(0, 5));

      // By category
      const catMap: Record<string, string> = {};
      (menuRes.data ?? []).forEach((m: { id: string; category: string }) => { catMap[m.id] = m.category; });
      const catTally: Record<string, number> = {};
      (itemsRes.data ?? []).forEach((it: { menu_item_id: string; quantity: number }) => {
        const c = catMap[it.menu_item_id] ?? "Other";
        catTally[c] = (catTally[c] ?? 0) + it.quantity;
      });
      setByCategory(Object.entries(catTally).map(([name, value]) => ({ name, value })));
    })();
  }, []);

  const maxHeat = Math.max(...heatmap, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm">Live insights from real order data.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold mb-4">Revenue — Last 30 Days</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              <Line type="monotone" dataKey="revenue" stroke="#E8470A" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold mb-4">Top 5 Best-Selling Items</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip />
                <Bar dataKey="sold" fill="#E8470A" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold mb-4">Orders by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold mb-4">Peak Ordering Hours</h2>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {heatmap.map((v, h) => {
            const intensity = v / maxHeat;
            return (
              <div key={h} className="text-center">
                <div className="rounded-md text-xs font-semibold py-3 transition-colors"
                  style={{
                    background: `rgba(232, 71, 10, ${0.08 + intensity * 0.92})`,
                    color: intensity > 0.5 ? "#fff" : "#0F172A",
                  }}>
                  {v}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{String(h).padStart(2, "0")}h</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
