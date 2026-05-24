import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DELIVERY_FEE, useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove, subtotal } = useCart();
  const sub = subtotal();
  const total = items.length ? sub + DELIVERY_FEE : 0;
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkout = () => {
    if (!items.length) return;
    close();
    if (!user) {
      toast("Please sign in to continue", { description: "You'll be redirected to checkout after login." });
      navigate({ to: "/login", search: { redirect: "/checkout" } });
      return;
    }
    navigate({ to: "/checkout" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-card shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Your Cart</h2>
              <button onClick={close} className="p-2 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  <ShoppingBag className="h-12 w-12 mx-auto opacity-40 mb-3" />
                  <p>Your cart is empty.</p>
                </div>
              ) : items.map((i) => (
                <motion.div layout key={i.id} className="flex gap-3 bg-muted/50 rounded-xl p-3">
                  {i.image_url && <img src={i.image_url} alt={i.name} className="h-16 w-16 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate">{i.name}</h4>
                      <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="text-primary font-bold text-sm mt-1">${(i.price * i.quantity).toFixed(2)}</div>
                    <div className="mt-2 inline-flex items-center gap-2 bg-background rounded-full px-2 py-1">
                      <button onClick={() => setQty(i.id, i.quantity - 1)} className="h-6 w-6 rounded-full grid place-items-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-semibold w-5 text-center">{i.quantity}</span>
                      <button onClick={() => setQty(i.id, i.quantity + 1)} className="h-6 w-6 rounded-full grid place-items-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-5 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">${sub.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className="font-semibold">${DELIVERY_FEE.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-display font-bold"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
                <button onClick={checkout} className="w-full bg-gradient-warm text-primary-foreground font-semibold py-3 rounded-xl shadow-warm hover:scale-[1.01] transition-transform">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
