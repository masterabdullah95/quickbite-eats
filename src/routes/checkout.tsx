import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DELIVERY_FEE, useCart } from "@/store/cart";
import { toast } from "sonner";
import { Field } from "./login";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — QuickBite" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const sub = subtotal();
  const total = sub + DELIVERY_FEE;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/login", search: { redirect: "/checkout" } });
  }, [authLoading, user, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
      }
    });
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !items.length) return;
    setSubmitting(true);
    // Save profile updates
    await supabase.from("profiles").update({ full_name: fullName, phone, address }).eq("id", user.id);

    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id, total_amount: total, delivery_address: address, phone, full_name: fullName,
    }).select().single();

    if (error || !order) {
      setSubmitting(false);
      return toast.error(error?.message ?? "Failed to place order");
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({ order_id: order.id, menu_item_id: i.id, quantity: i.quantity, unit_price: i.price, name: i.name })),
    );
    if (itemsErr) {
      setSubmitting(false);
      return toast.error(itemsErr.message);
    }
    clear();
    toast.success("Order placed!");
    nav({ to: "/order-confirmation", search: { id: order.id } });
  };

  if (!user || !items.length) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add some delicious food before checking out.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="font-display text-4xl font-extrabold">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-8">
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="bg-card rounded-3xl p-6 shadow-card space-y-4">
          <h2 className="font-display font-bold text-xl">Delivery details</h2>
          <Field label="Full name" type="text" value={fullName} onChange={setFullName} required />
          <Field label="Phone" type="tel" value={phone} onChange={setPhone} required />
          <label className="block">
            <span className="text-sm font-medium">Delivery address</span>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
          </label>

          <div className="pt-2">
            <h3 className="font-semibold mb-2">Payment method</h3>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-accent/50">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Cash on Delivery</div>
                <div className="text-xs text-muted-foreground">Pay when your food arrives.</div>
              </div>
            </div>
          </div>

          <button disabled={submitting} className="w-full bg-gradient-warm text-primary-foreground font-semibold py-3 rounded-xl shadow-warm disabled:opacity-60">
            {submitting ? "Placing order..." : `Place Order — $${total.toFixed(2)}`}
          </button>
        </motion.form>

        <aside className="bg-card rounded-3xl p-6 shadow-card h-fit">
          <h2 className="font-display font-bold text-xl">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between text-sm">
                <span>{i.quantity}× {i.name}</span>
                <span className="font-semibold">${(i.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${sub.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>${DELIVERY_FEE.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-bold font-display pt-2"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
