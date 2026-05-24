import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  rating: number | null;
  image_url: string | null;
};

export function FoodCard({ item, onClick }: { item: MenuItem; onClick?: () => void }) {
  const add = useCart((s) => s.add);

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-card cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-lg leading-tight">{item.name}</h3>
          <span className="flex items-center gap-1 text-xs font-semibold bg-accent text-accent-foreground px-2 py-1 rounded-full">
            <Star className="h-3 w-3 fill-primary text-primary" /> {item.rating?.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{item.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display text-xl font-bold text-primary">${item.price.toFixed(2)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              add({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
              toast.success("🛒 Added to cart!", { description: item.name });
            }}
            className="h-9 w-9 rounded-full bg-gradient-warm text-primary-foreground grid place-items-center shadow-warm hover:scale-110 transition-transform"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
