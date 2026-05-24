import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Star, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { FoodCard, type MenuItem } from "@/components/FoodCard";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

const search = z.object({ cat: z.string().optional() });

export const Route = createFileRoute("/menu")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Menu — QuickBite" },
      { name: "description", content: "Browse our full menu of burgers, pizza, pasta, drinks and desserts." },
      { property: "og:title", content: "Menu — QuickBite" },
    ],
  }),
  component: MenuPage,
});

const CATS = ["All", "Burgers", "Pizza", "Pasta", "Drinks", "Desserts"];

function MenuPage() {
  const { cat } = Route.useSearch();
  const nav = Route.useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const active = cat ?? "All";

  useEffect(() => {
    supabase.from("menu_items").select("*").order("name").then(({ data }) => {
      if (data) setItems(data as MenuItem[]);
    });
  }, []);

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [items, active],
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl md:text-5xl font-display font-extrabold">Our Menu</h1>
      <p className="text-muted-foreground mt-2">Pick your favorites and tap to add.</p>

      <div className="flex gap-2 overflow-x-auto mt-6 -mx-4 px-4 pb-2">
        {CATS.map((c) => {
          const isActive = active === c;
          return (
            <button
              key={c}
              onClick={() => nav({ search: { cat: c === "All" ? undefined : c } })}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                isActive ? "bg-gradient-warm text-primary-foreground border-primary shadow-warm" : "bg-card border-border hover:bg-muted"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {filtered.map((it) => <FoodCard key={it.id} item={it} onClick={() => setSelected(it)} />)}
      </motion.div>

      <ItemModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  useEffect(() => { if (item) setQty(1); }, [item]);

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl pointer-events-auto"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />}
                <button onClick={onClose} className="absolute top-3 right-3 h-9 w-9 grid place-items-center bg-background/80 backdrop-blur rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-2xl font-bold">{item.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-semibold bg-accent px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-primary text-primary" /> {item.rating?.toFixed(1)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2">{item.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="inline-flex items-center gap-3 bg-muted rounded-full px-3 py-2">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-7 w-7 rounded-full bg-background grid place-items-center"><Minus className="h-4 w-4" /></button>
                    <span className="font-semibold w-6 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="h-7 w-7 rounded-full bg-background grid place-items-center"><Plus className="h-4 w-4" /></button>
                  </div>
                  <span className="font-display text-2xl font-bold text-primary">${(item.price * qty).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    add({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }, qty);
                    toast.success("🛒 Added to cart!", { description: `${qty}× ${item.name}` });
                    onClose();
                  }}
                  className="mt-6 w-full bg-gradient-warm text-primary-foreground font-semibold py-3 rounded-xl shadow-warm hover:scale-[1.01] transition-transform"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
