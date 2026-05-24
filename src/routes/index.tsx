import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FoodCard, type MenuItem } from "@/components/FoodCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuickBite — Hot meals, delivered fast" },
      { name: "description", content: "Browse top-rated burgers, pizza, pasta and more. Order in seconds." },
      { property: "og:title", content: "QuickBite — Hot meals, delivered fast" },
      { property: "og:description", content: "Browse top-rated burgers, pizza, pasta and more." },
    ],
  }),
  component: Home,
});

const CATEGORIES = ["Burgers", "Pizza", "Pasta", "Drinks", "Desserts"];

function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.from("menu_items").select("*").order("rating", { ascending: false }).then(({ data }) => {
      if (data) setItems(data as MenuItem[]);
    });
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );
  const popular = filtered.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Fresh & fast, every time
            </span>
            <h1 className="mt-5 text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-balance leading-[1.05]">
              Crave it. <span className="text-primary">Tap it.</span> Eat it.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Hot meals from your favorite kitchens delivered to your door in under 30 minutes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/menu" className="inline-flex items-center gap-2 bg-gradient-warm text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-warm hover:scale-[1.02] transition-transform">
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 bg-card border border-border font-semibold px-6 py-3 rounded-xl hover:bg-muted transition-colors">
                Learn more
              </Link>
            </div>
            <div className="mt-8 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border shadow-card focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
            className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-warm rounded-[40%_60%_55%_45%/50%_45%_55%_50%] blur-2xl opacity-30 animate-pulse" />
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900" alt="Featured pizza" className="relative h-full w-full object-cover rounded-3xl shadow-warm" />
          </motion.div>
        </div>
      </section>

      {/* Categories chips */}
      <section className="container mx-auto px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {CATEGORIES.map((c) => (
            <Link key={c} to="/menu" search={{ cat: c }} className="shrink-0 bg-card border border-border rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Most Popular</h2>
            <p className="text-muted-foreground mt-1">Top-rated picks loved by our customers.</p>
          </div>
          <Link to="/menu" className="hidden md:inline-flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popular.map((it) => <FoodCard key={it.id} item={it} />)}
        </div>
      </section>
    </>
  );
}
