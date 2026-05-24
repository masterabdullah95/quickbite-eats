import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: z.object({ id: z.string() }),
  head: () => ({ meta: [{ title: "Order confirmed — QuickBite" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = Route.useSearch();
  return (
    <div className="container mx-auto px-4 py-20 grid place-items-center text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
        className="h-24 w-24 rounded-full bg-gradient-warm grid place-items-center shadow-warm">
        <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>
          <Check className="h-12 w-12 text-primary-foreground" strokeWidth={3} />
        </motion.div>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="font-display text-4xl font-extrabold mt-8">Order Confirmed!</motion.h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        Thanks for ordering with QuickBite. Your food is being prepared with love.
      </p>
      <div className="mt-6 bg-card rounded-2xl p-5 shadow-card">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Order ID</div>
        <div className="font-mono font-semibold">{id.slice(0, 8).toUpperCase()}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-3">Estimated delivery</div>
        <div className="font-semibold text-primary">25–35 minutes</div>
      </div>
      <div className="flex gap-3 mt-8">
        <Link to="/orders" className="bg-gradient-warm text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-warm">Track My Orders</Link>
        <Link to="/" className="border border-border font-semibold px-6 py-3 rounded-xl hover:bg-muted">Back to Home</Link>
      </div>
    </div>
  );
}
