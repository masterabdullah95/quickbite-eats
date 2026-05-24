import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Heart, Leaf } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — QuickBite" },
      { name: "description", content: "QuickBite delivers fresh, hot meals from your favorite local kitchens in under 30 minutes." },
      { property: "og:title", content: "About QuickBite" },
    ],
  }),
  component: About,
});

function About() {
  const features = [
    { icon: Clock, title: "Lightning Fast", desc: "Average delivery under 30 minutes." },
    { icon: Leaf, title: "Fresh Ingredients", desc: "Sourced daily from local suppliers." },
    { icon: Heart, title: "Cooked with Love", desc: "Real kitchens, real chefs." },
  ];
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-display font-extrabold text-balance">
        We make <span className="text-primary">good food</span> fast.
      </motion.h1>
      <p className="text-lg text-muted-foreground mt-5 max-w-2xl">
        QuickBite started with a simple mission: bring hot, comforting meals to your door without the wait. From sizzling burgers
        to wood-fired pizzas, every order is cooked on-demand by our partner kitchens and delivered in under 30 minutes.
      </p>
      <div className="grid sm:grid-cols-3 gap-6 mt-12">
        {features.map((f) => (
          <div key={f.title} className="bg-card rounded-2xl p-6 shadow-card">
            <div className="h-11 w-11 rounded-xl bg-gradient-warm grid place-items-center text-primary-foreground shadow-warm"><f.icon className="h-5 w-5" /></div>
            <h3 className="font-display font-bold text-xl mt-4">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
