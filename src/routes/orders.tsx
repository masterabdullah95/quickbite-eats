import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "My Orders — QuickBite" }] }),
  component: OrdersPage,
});

type OrderItem = { id: string; name: string | null; quantity: number; unit_price: number };
type Order = {
  id: string; status: string; total_amount: number; delivery_address: string; created_at: string;
  order_items: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Preparing: "bg-blue-100 text-blue-800",
  "Out for Delivery": "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login", search: { redirect: "/orders" } });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders")
      .select("id,status,total_amount,delivery_address,created_at, order_items(id,name,quantity,unit_price)")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setFetching(false);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-4xl font-extrabold">My Orders</h1>
      <p className="text-muted-foreground mt-2">Track every meal you've ordered.</p>

      {fetching ? (
        <p className="mt-10 text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="mt-12 text-center bg-card rounded-3xl p-12 shadow-card">
          <Package className="h-12 w-12 mx-auto opacity-40" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
          <Link to="/menu" className="inline-block mt-4 bg-gradient-warm text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-warm">Browse Menu</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o, idx) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-card rounded-2xl p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[o.status] ?? "bg-muted"}`}>{o.status}</span>
              </div>
              <ul className="mt-3 text-sm space-y-1">
                {o.order_items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.quantity}× {it.name}</span>
                    <span className="text-muted-foreground">${(it.quantity * it.unit_price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-border flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">${Number(o.total_amount).toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
